import React, { useState, useEffect } from 'react';
import {
  Award,
  Gift,
  Coins,
  History,
  Info,
  CheckCircle,
  Copy,
  Bus,
  BookOpen,
  Trees,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { getRewardSummary, redeemReward } from '../../services/rewardService';

const CitizenRewards = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('perks');
  const [selectedItem, setSelectedItem] = useState(null);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemedVoucher, setRedeemedVoucher] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRewardSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load rewards:', err);
      setError('Failed to load reward details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemClick = (item) => {
    setSelectedItem(item);
    setRedeemedVoucher(null);
    setCopied(false);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedItem) return;
    try {
      setRedeeming(true);
      const res = await redeemReward(selectedItem.id);
      if (res.success) {
        setRedeemedVoucher(res.voucher);
        fetchSummary();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Redemption failed');
    } finally {
      setRedeeming(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getItemIcon = (iconName) => {
    switch (iconName) {
      case 'Bus':
        return <Bus className="text-[#0F9D8A]" size={28} />;
      case 'BookOpen':
        return <BookOpen className="text-blue-500" size={28} />;
      case 'Trees':
        return <Trees className="text-emerald-500" size={28} />;
      case 'Award':
      default:
        return <Award className="text-amber-500" size={28} />;
    }
  };

  const balance = summary?.rewardPoints ?? 0;
  const lifetime = summary?.lifetimePoints ?? 0;
  const totalEarned = summary?.totalEarned ?? 0;
  const totalRedeemed = summary?.totalRedeemed ?? 0;
  const history = summary?.recentHistory || [];
  const catalog = summary?.catalog || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#0B1F3A] to-[#12345B] rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <Award size={240} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-[#0F9D8A]/20 text-[#0F9D8A] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border border-[#0F9D8A]/30">
            <Sparkles size={14} />
            <span>Civic Recognition Program</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
            Citizen Reward Points & Civic Perks
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Earn points for verified civic reporting and ground issue resolution. Redeem your points for community benefits, transit vouchers, and city certificates.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Available Balance</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#0F9D8A]">
              <Coins size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl md:text-4xl font-extrabold text-[#0B1F3A]">{balance}</span>
            <span className="text-sm font-semibold text-[#0F9D8A]">pts</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Spendable balance for civic vouchers</p>
        </div>

        {/* Lifetime Earned */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Lifetime Earned</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Award size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl md:text-4xl font-extrabold text-[#0B1F3A]">{lifetime}</span>
            <span className="text-sm font-semibold text-amber-600">pts</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Total points accumulated all-time</p>
        </div>

        {/* Total Redeemed */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Redeemed</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Gift size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl md:text-4xl font-extrabold text-[#0B1F3A]">{totalRedeemed}</span>
            <span className="text-sm font-semibold text-purple-600">pts</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Invested in municipal civic perks</p>
        </div>

        {/* Activity Events */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Activity Records</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <ShieldCheck size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl md:text-4xl font-extrabold text-[#0B1F3A]">{history.length}</span>
            <span className="text-sm font-semibold text-blue-600">events</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Audited ledger entries on record</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl p-2 border border-[#E2E8F0] shadow-sm flex space-x-2">
        <button
          onClick={() => setActiveTab('perks')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeTab === 'perks' ? 'bg-[#0B1F3A] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
        >
          <Gift size={18} />
          <span>Civic Perks & Vouchers</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeTab === 'history' ? 'bg-[#0B1F3A] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
        >
          <History size={18} />
          <span>Reward Ledger & History</span>
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeTab === 'rules' ? 'bg-[#0B1F3A] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
        >
          <Info size={18} />
          <span>Earning Policy</span>
        </button>
      </div>

      {/* Tab 1: Perks */}
      {activeTab === 'perks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#0B1F3A]">Available Non-Monetary Perks</h2>
              <p className="text-xs text-slate-500">Official benefits provided in collaboration with local city municipal bodies.</p>
            </div>
            <div className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
              Your Balance: <strong className="text-[#0F9D8A] font-bold">{balance} pts</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {catalog.map((item) => {
              const canAfford = balance >= item.pointsCost;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative"
                >
                  {item.badge && (
                    <span className="absolute top-4 right-4 bg-teal-50 text-[#0F9D8A] text-xs font-semibold px-2.5 py-1 rounded-full border border-teal-100">
                      {item.badge}
                    </span>
                  )}
                  <div>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        {getItemIcon(item.icon)}
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 font-semibold uppercase">{item.category}</span>
                        <h3 className="font-bold text-[#0B1F3A] text-base">{item.title}</h3>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">{item.description}</p>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-4">
                      <span className="text-[11px] text-slate-500 block leading-tight font-medium">
                        <strong>Terms:</strong> {item.terms}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Required Points</span>
                      <span className="text-xl font-extrabold text-[#0B1F3A]">{item.pointsCost} <span className="text-xs font-semibold text-slate-500">pts</span></span>
                    </div>
                    <button
                      onClick={() => handleRedeemClick(item)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${canAfford ? 'bg-[#0F9D8A] hover:bg-[#0D8776] text-white shadow-sm' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'}`}
                    >
                      <span>{canAfford ? 'Redeem Voucher' : 'Need More Points'}</span>
                      {canAfford && <ArrowUpRight size={14} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#E2E8F0]">
            <h2 className="text-lg font-bold text-[#0B1F3A]">Audited Points Ledger</h2>
            <p className="text-xs text-slate-500">Immutable ledger of all points awarded and benefits redeemed.</p>
          </div>

          {history.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Award className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-sm font-semibold text-slate-700">No reward records yet</p>
              <p className="text-xs text-slate-500 mt-1">Submit civic issues and earn points when they are approved and resolved!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F8FAFC] text-slate-600 font-semibold border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Event Type</th>
                    <th className="px-6 py-4">Activity / Description</th>
                    <th className="px-6 py-4">Points</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {history.map((entry) => {
                    const isPositive = entry.points > 0;
                    return (
                      <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                          {format(new Date(entry.createdAt), 'MMM d, yyyy · hh:mm a')}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${entry.eventType === 'REPORT_APPROVED' ? 'bg-blue-50 text-blue-700 border border-blue-100' : entry.eventType === 'ISSUE_RESOLVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-purple-50 text-purple-700 border border-purple-100'}`}
                          >
                            {entry.eventType === 'REPORT_APPROVED'
                              ? 'Report Approved'
                              : entry.eventType === 'ISSUE_RESOLVED'
                              ? 'Issue Resolved'
                              : 'Voucher Redeemed'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-semibold text-[#0B1F3A]">{entry.reason}</div>
                          {entry.issue && (
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Issue: {entry.issue.title}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`font-extrabold text-sm ${isPositive ? 'text-emerald-600' : 'text-purple-600'}`}
                          >
                            {isPositive ? `+${entry.points}` : entry.points} pts
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center space-x-1 text-xs text-slate-600">
                            <CheckCircle size={14} className="text-emerald-500" />
                            <span>{entry.status}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Rules */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 md:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-[#0B1F3A]">Reward System Rules & Guidelines</h2>
            <p className="text-xs text-slate-500 mt-1">SAMADHAN's transparent civic reward policy.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-3">
                10
              </div>
              <h3 className="font-bold text-[#0B1F3A] text-sm mb-1">Genuine Report Approved</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When you submit a civic issue with valid geolocation and genuine evidence, an authorized Admin reviews and approves it. You receive 10 points.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-3">
                10
              </div>
              <h3 className="font-bold text-[#0B1F3A] text-sm mb-1">Issue Successfully Resolved</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When ground workers execute the repair and after-work verification is approved, the issue is marked RESOLVED. You receive a bonus 10 points!
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold mb-3">
                0
              </div>
              <h3 className="font-bold text-[#0B1F3A] text-sm mb-1">Ineligible / Duplicate Reports</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Spam, duplicate, fraudulent, or rejected reports do not earn points. Uniqueness constraints guarantee one reward per approved issue.
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900 text-xs leading-relaxed flex items-start space-x-3">
            <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block mb-1">Non-Monetary Foundation:</strong>
              Citizen reward points represent civic engagement recognition and can only be redeemed for municipal transit passes, library memberships, green badges, and environmental tree planting initiatives. Points do not constitute currency, monetary deposits, or direct cash balances.
            </div>
          </div>
        </div>
      )}

      {/* Redemption Confirmation Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in duration-200">
            {!redeemedVoucher ? (
              <>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-teal-50 rounded-2xl text-[#0F9D8A]">
                    {getItemIcon(selectedItem.icon)}
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase">{selectedItem.category}</span>
                    <h3 className="font-bold text-[#0B1F3A] text-base">{selectedItem.title}</h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-4">{selectedItem.description}</p>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 mb-6">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Point Cost:</span>
                    <span className="font-bold text-[#0B1F3A]">{selectedItem.pointsCost} pts</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Current Balance:</span>
                    <span className="font-bold text-teal-600">{balance} pts</span>
                  </div>
                  <div className="flex justify-between text-xs pt-2 border-t border-slate-200">
                    <span className="text-slate-500 font-medium">Balance After Redemption:</span>
                    <span className="font-bold text-[#0B1F3A]">{balance - selectedItem.pointsCost} pts</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedItem(null)}
                    disabled={redeeming}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmRedeem}
                    disabled={redeeming}
                    className="flex-1 py-2.5 rounded-xl bg-[#0F9D8A] hover:bg-[#0D8776] text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                  >
                    {redeeming ? 'Redeeming...' : 'Confirm & Redeem'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-2">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={32} />
                </div>
                <h3 className="font-bold text-lg text-[#0B1F3A]">Voucher Redeemed!</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Present this digital code or reference ID at the civic counter or digital portal.
                </p>

                <div className="bg-[#0B1F3A] text-white p-4 rounded-2xl mb-4 relative group">
                  <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block mb-1">
                    Your Voucher Code
                  </span>
                  <div className="text-xl font-mono font-bold tracking-widest text-teal-300">
                    {redeemedVoucher.code}
                  </div>
                  <button
                    onClick={() => copyToClipboard(redeemedVoucher.code)}
                    className="mt-3 inline-flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Copy size={14} />
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
                  </button>
                </div>

                <div className="text-left bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-600 mb-6 space-y-1">
                  <div><strong>Voucher:</strong> {redeemedVoucher.title}</div>
                  <div><strong>Terms:</strong> {redeemedVoucher.terms}</div>
                </div>

                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-full py-2.5 rounded-xl bg-[#0B1F3A] text-white text-xs font-bold hover:bg-[#12345B] transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenRewards;
