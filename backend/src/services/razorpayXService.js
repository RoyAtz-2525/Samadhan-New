/**
 * RazorpayX Payouts Service
 * Handles Contacts, Fund Accounts, and Bank/UPI Payouts for Workers.
 */

const crypto = require('crypto');
const axios = require('axios');

const getCredentials = () => {
  // Strict Credential Isolation: ONLY use RAZORPAYX_* variables. No fallback to Standard Checkout keys.
  const keyId = process.env.RAZORPAYX_KEY_ID;
  const keySecret = process.env.RAZORPAYX_KEY_SECRET;
  const accountNumber = process.env.RAZORPAYX_ACCOUNT_NUMBER;

  // Safe Default: RazorpayX remains in simulation/test mode unless RAZORPAYX_PAYOUT_TEST_MODE is explicitly set to 'false'.
  const isTestMode = process.env.RAZORPAYX_PAYOUT_TEST_MODE !== 'false';

  return {
    keyId,
    keySecret,
    accountNumber: accountNumber || '2323230000000000',
    isTestMode,
    isConfigured: !!(keyId && keySecret),
  };
};

const getBasicAuthHeader = (keyId, keySecret) => {
  const token = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  return `Basic ${token}`;
};

const signaturesMatch = (expectedSignature, signature) => {
  if (typeof signature !== 'string') return false;
  const expected = Buffer.from(expectedSignature, 'utf8');
  const received = Buffer.from(signature, 'utf8');
  return (
    expected.length === received.length &&
    crypto.timingSafeEqual(expected, received)
  );
};


/**
 * Sanitizes and redacts sensitive beneficiary data from error messages/logs.
 * Strips account numbers, IFSC codes, UPI VPAs, and Axios request configurations.
 * NEVER logs err.config, err.config.data, or Authorization headers.
 */
const sanitizeErrorDetails = (err) => {
  const status = err.response?.status || (err.isTimeout ? 408 : 500);
  const errorCode = err.response?.data?.error?.code || err.code || 'GATEWAY_ERROR';
  let description = err.response?.data?.error?.description || err.message || 'Unknown provider error';

  if (typeof description === 'string') {
    // Redact bank account numbers (sequences of 9 to 18 digits)
    description = description.replace(/\b\d{9,18}\b/g, '••••[REDACTED]');
    // Redact UPI VPAs
    description = description.replace(/[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/g, '••••@redacted');
    // Redact IFSC codes
    description = description.replace(/\b[A-Z]{4}0[A-Z0-9]{6}\b/gi, '••••[IFSC]');
  }

  return {
    status,
    code: errorCode,
    message: description,
  };
};

/**
 * 1. Create or retrieve Contact for a Worker
 */
const createOrGetContact = async (workerUser, workerProfile) => {
  const { keyId, keySecret, isTestMode, isConfigured } = getCredentials();

  // Test mode simulation when credentials are not configured
  if (isTestMode && !isConfigured) {
    return {
      id: `cont_sim_${workerProfile.id.replace(/-/g, '').slice(0, 14)}`,
      name: workerUser.name || 'Municipal Worker',
      email: workerUser.email,
      contact: workerUser.phone || '9876543210',
      type: 'employee',
      active: true,
    };
  }

  if (!isConfigured) {
    throw new Error('RazorpayX API credentials are not configured.');
  }

  try {
    const payload = {
      name: workerUser.name || 'Municipal Worker',
      email: workerUser.email,
      contact: workerUser.phone || undefined,
      type: 'employee',
      reference_id: workerProfile.id,
      notes: {
        role: 'WORKER',
        workerProfileId: workerProfile.id,
      },
    };

    const res = await axios.post('https://api.razorpay.com/v1/contacts', payload, {
      headers: {
        Authorization: getBasicAuthHeader(keyId, keySecret),
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    return res.data;
  } catch (err) {
    const sanitized = sanitizeErrorDetails(err);
    console.error('RazorpayX contact creation failed:', {
      status: sanitized.status,
      code: sanitized.code,
      message: sanitized.message,
    });
    throw Object.assign(new Error('Failed to create RazorpayX contact'), {
      statusCode: sanitized.status >= 500 ? 502 : sanitized.status,
      details: sanitized.message,
    });
  }
};

/**
 * 2. Create Fund Account (Bank Account or UPI VPA)
 */
const createFundAccount = async (contactId, beneficiaryData) => {
  const { keyId, keySecret, isTestMode, isConfigured } = getCredentials();
  const { payoutMethod, bankAccountName, bankAccountNumber, bankIfsc, upiVpa } = beneficiaryData;

  // Test mode simulation
  if (isTestMode && !isConfigured) {
    if (payoutMethod === 'UPI') {
      return {
        id: `fa_sim_vpa_${Date.now()}`,
        contact_id: contactId,
        account_type: 'vpa',
        vpa: { address: upiVpa },
        active: true,
      };
    } else {
      return {
        id: `fa_sim_bank_${Date.now()}`,
        contact_id: contactId,
        account_type: 'bank_account',
        bank_account: {
          name: bankAccountName,
          ifsc: bankIfsc,
          account_number: `•••• ${bankAccountNumber.slice(-4)}`,
        },
        active: true,
      };
    }
  }

  if (!isConfigured) {
    throw new Error('RazorpayX credentials are not configured.');
  }

  try {
    let payload;
    if (payoutMethod === 'UPI') {
      payload = {
        contact_id: contactId,
        account_type: 'vpa',
        vpa: {
          address: upiVpa,
        },
      };
    } else {
      payload = {
        contact_id: contactId,
        account_type: 'bank_account',
        bank_account: {
          name: bankAccountName,
          ifsc: bankIfsc,
          account_number: bankAccountNumber,
        },
      };
    }

    const res = await axios.post('https://api.razorpay.com/v1/fund_accounts', payload, {
      headers: {
        Authorization: getBasicAuthHeader(keyId, keySecret),
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    return res.data;
  } catch (err) {
    const sanitized = sanitizeErrorDetails(err);
    console.error('RazorpayX fund account creation failed:', {
      status: sanitized.status,
      code: sanitized.code,
      message: sanitized.message,
    });
    throw Object.assign(new Error('Failed to create RazorpayX fund account'), {
      statusCode: sanitized.status >= 500 ? 502 : sanitized.status,
      details: sanitized.message,
    });
  }
};

/**
 * 3. Create Payout with stable Idempotency Key
 */
const createPayout = async ({
  fundAccountId,
  amountPaise,
  mode = 'IMPS',
  purpose = 'payout',
  idempotencyKey,
  referenceId,
  narration = 'SAMADHAN Payout',
}) => {
  const { keyId, keySecret, accountNumber, isTestMode, isConfigured } = getCredentials();

  // Test mode simulation
  if (isTestMode && !isConfigured) {
    const timestamp = Date.now();
    return {
      id: `pout_sim_${timestamp}`,
      entity: 'payout',
      fund_account_id: fundAccountId,
      amount: amountPaise,
      currency: 'INR',
      status: 'processed',
      utr: `UTR_SIM_${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      mode,
      purpose,
      reference_id: referenceId,
      narration,
      fee: 500,
      tax: 90,
      created_at: Math.floor(timestamp / 1000),
      isSimulation: true,
    };
  }

  if (!isConfigured) {
    throw new Error('RazorpayX credentials are not configured.');
  }

  try {
    const payload = {
      account_number: accountNumber,
      fund_account_id: fundAccountId,
      amount: amountPaise,
      currency: 'INR',
      mode,
      purpose,
      queue_if_low_balance: true,
      reference_id: referenceId,
      narration,
    };

    const res = await axios.post('https://api.razorpay.com/v1/payouts', payload, {
      headers: {
        Authorization: getBasicAuthHeader(keyId, keySecret),
        'Content-Type': 'application/json',
        'X-Payout-Idempotency': idempotencyKey,
      },
      timeout: 15000,
    });

    return res.data;
  } catch (err) {
    const isTimeout = err.code === 'ECONNABORTED' || (err.message && err.message.includes('timeout'));
    const sanitized = sanitizeErrorDetails(err);
    console.error('RazorpayX payout creation error:', {
      status: sanitized.status,
      code: sanitized.code,
      message: sanitized.message,
      isTimeout,
    });

    const error = new Error(sanitized.message || 'RazorpayX Payout API request failed');
    error.statusCode = sanitized.status >= 500 ? 502 : sanitized.status;
    error.providerError = { code: sanitized.code, description: sanitized.message };
    error.isTimeout = isTimeout;
    throw error;
  }
};

/**
 * 4. Reconcile / Get Payout Details from Provider
 */
const getPayoutDetails = async (payoutId) => {
  const { keyId, keySecret, isTestMode, isConfigured } = getCredentials();

  if (isTestMode && !isConfigured) {
    return {
      id: payoutId,
      status: 'processed',
      utr: `UTR_SIM_${Date.now()}`,
      amount: 50000,
      mode: 'IMPS',
    };
  }

  if (!isConfigured) {
    throw new Error('RazorpayX credentials are not configured.');
  }

  try {
    const res = await axios.get(`https://api.razorpay.com/v1/payouts/${payoutId}`, {
      headers: {
        Authorization: getBasicAuthHeader(keyId, keySecret),
      },
      timeout: 10000,
    });

    return res.data;
  } catch (err) {
    const sanitized = sanitizeErrorDetails(err);
    console.error('RazorpayX fetch payout failed:', {
      status: sanitized.status,
      code: sanitized.code,
      message: sanitized.message,
    });
    throw Object.assign(new Error('Failed to reconcile payout with provider'), {
      statusCode: sanitized.status >= 500 ? 502 : sanitized.status,
    });
  }
};

/**
 * 4b. Reconcile / Get Payout by Merchant Reference ID (for ambiguous timeout recovery)
 */
const getPayoutByReference = async (referenceId) => {
  const { keyId, keySecret, isTestMode, isConfigured } = getCredentials();

  if (isTestMode && !isConfigured) {
    return {
      id: `pout_sim_ref_${referenceId.slice(0, 8)}`,
      status: 'processed',
      utr: `UTR_SIM_REF_${Date.now()}`,
      amount: 50000,
      mode: 'IMPS',
      reference_id: referenceId,
    };
  }

  if (!isConfigured) {
    throw new Error('RazorpayX credentials are not configured.');
  }

  try {
    const res = await axios.get(`https://api.razorpay.com/v1/payouts?reference_id=${encodeURIComponent(referenceId)}`, {
      headers: {
        Authorization: getBasicAuthHeader(keyId, keySecret),
      },
      timeout: 10000,
    });

    const items = res.data?.items;
    if (Array.isArray(items) && items.length > 0) {
      return items[0];
    }
    return null;
  } catch (err) {
    const sanitized = sanitizeErrorDetails(err);
    console.error('RazorpayX fetch payout by reference failed:', {
      status: sanitized.status,
      code: sanitized.code,
      message: sanitized.message,
    });
    throw Object.assign(new Error('Failed to query provider by reference'), {
      statusCode: sanitized.status >= 500 ? 502 : sanitized.status,
    });
  }
};

/**
 * 5. Verify Payout Webhook Signature
 */
const verifyPayoutWebhookSignature = (rawBody, signature) => {
  // Webhook Secret Isolation: strictly use RAZORPAYX_WEBHOOK_SECRET
  const secret = process.env.RAZORPAYX_WEBHOOK_SECRET;
  const isTestMode = process.env.RAZORPAYX_PAYOUT_TEST_MODE !== 'false';

  if (isTestMode && !secret) {
    if (!signature || signature === 'invalid_signature') return false;
    return typeof signature === 'string' && (signature.startsWith('test_') || signature.startsWith('mock_'));
  }

  if (!secret) {
    throw new Error('Webhook secret is not configured.');
  }

  const rawBodyString = Buffer.isBuffer(rawBody)
    ? rawBody.toString('utf8')
    : typeof rawBody === 'string'
    ? rawBody
    : JSON.stringify(rawBody);

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBodyString)
    .digest('hex');

  return signaturesMatch(expectedSignature, signature);
};

module.exports = {
  getCredentials,
  createOrGetContact,
  createFundAccount,
  createPayout,
  getPayoutDetails,
  getPayoutByReference,
  verifyPayoutWebhookSignature,
  sanitizeErrorDetails,
};
