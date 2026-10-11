const { deleteFromCloudinary } = require('../utils/cloudinaryHelper');

/**
 * Process media cleanup job for orphaned Cloudinary assets.
 * Idempotent: destroying non-existent or already destroyed assets is safe.
 *
 * @param {import('bullmq').Job} job
 * @returns {Promise<Object>}
 */
async function handleMediaCleanup(job) {
  const { publicId, resourceType = 'image' } = job.data;

  if (!publicId) {
    return { status: 'skipped', reason: 'Missing publicId' };
  }

  try {
    console.log(`[Job:MediaCleanup] Deleting asset '${publicId}' (type: ${resourceType})...`);
    const result = await deleteFromCloudinary(publicId, resourceType);
    console.log(`[Job:MediaCleanup] Successfully processed '${publicId}':`, result?.result || 'ok');
    return { status: 'success', publicId, result: result?.result };
  } catch (err) {
    console.error(`[Job:MediaCleanup] Failed to delete '${publicId}': ${err.message}`);
    throw err; // Allow BullMQ to retry according to backoff strategy
  }
}

module.exports = {
  handleMediaCleanup,
};
