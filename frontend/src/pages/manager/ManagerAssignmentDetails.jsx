import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import managerService from "../../services/managerService";
import * as paymentService from "../../services/paymentService";
import { loadRazorpay } from "../../utils/loadRazorpay";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  CheckCircle,
  Clock,
  IndianRupee,
  CreditCard,
  User,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Video,
  Search,
} from "lucide-react";

const ManagerAssignmentDetails = () => {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await managerService.getAssignmentDetails(id);
        setAssignment(response.data);

        try {
          const paymentResponse =
            await paymentService.getPaymentByAssignment(id);
          if (paymentResponse.success && paymentResponse.data) {
            setPayment(paymentResponse.data);
          }
        } catch (paymentError) {
          if (paymentError.response?.status !== 404) {
            console.error("Failed to fetch payment details.");
          }
        }
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to fetch assignment details",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handlePayment = async () => {
    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
      toast.error("Razorpay SDK failed to load. Are you online?");
      return;
    }

    setProcessingPayment(true);
    try {
      const orderResponse = await paymentService.createPaymentOrder(id);
      if (!orderResponse.success)
        throw new Error("Failed to create payment order");

      const { razorpayKeyId, razorpayOrderId, amount, currency, paymentId } =
        orderResponse.data;

      const options = {
        key: razorpayKeyId,
        amount: amount * 100,
        currency,
        name: "SAMADHAN",
        description: "Worker Payment",
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            toast.loading("Verifying payment...", { id: "payment-verify" });
            const verifyResult = await paymentService.verifyPayment(
              paymentId,
              response,
            );
            if (verifyResult.success) {
              toast.success("Payment successful!", { id: "payment-verify" });
              const refresh = await paymentService.getPaymentByAssignment(id);
              if (refresh.success) setPayment(refresh.data);
            }
          } catch (verifyErr) {
            toast.error(
              verifyErr.response?.data?.message ||
                "Payment verification failed",
              { id: "payment-verify" },
            );
          }
        },
        prefill: {
          name: "Manager",
        },
        theme: {
          color: "#0B1F3A",
        },
      };

      if (!razorpayKeyId) {
        throw new Error("Razorpay is not configured.");
      }

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        toast.error("Payment failed: " + response.error.description);
      });
      rzp.open();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to initiate payment",
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      PENDING: "bg-amber-50 text-amber-700 border-amber-200",
      ACCEPTED: "bg-purple-50 text-purple-700 border-purple-200",
      WORK_STARTED: "bg-cyan-50 text-cyan-700 border-cyan-200",
      WORK_COMPLETED: "bg-teal-50 text-teal-700 border-teal-200",
      COMPLETED: "bg-green-50 text-green-700 border-green-200",
      CANCELLED: "bg-slate-50 text-slate-700 border-slate-200",
      REJECTED: "bg-red-50 text-red-700 border-red-200",
    };
    return styles[status] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  const getStatusLabel = (status) => status?.replace(/_/g, " ") || "UNKNOWN";

  const openMedia = (url) => window.open(url, "_blank");

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0F9D8A] border-t-transparent"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-in fade-in">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-12 w-12 text-[#DC2626]" />
        </div>
        <h2 className="text-3xl font-black text-[#0B1F3A] mb-4">
          Assignment Not Found
        </h2>
        <p className="text-[#64748B] text-lg mb-8 max-w-md mx-auto">
          This assignment may have been removed or you do not have permission to
          view it.
        </p>
        <Link
          to="/manager/assignments"
          className="inline-flex items-center px-6 py-3 bg-[#0B1F3A] text-white font-bold rounded-xl hover:bg-[#12345B] transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" /> Back to Assignments
        </Link>
      </div>
    );
  }

  const { issue, worker, statusHistory, progressRecords, afterVerification } =
    assignment;

  const isEligibleForPayment =
    assignment.status === "COMPLETED" &&
    issue.status === "RESOLVED" &&
    afterVerification?.status === "APPROVED";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <Link
        to="/manager/assignments"
        className="group flex items-center text-[#64748B] hover:text-[#0B1F3A] mb-8 transition-colors font-semibold bg-white px-4 py-2 rounded-xl shadow-sm border border-[#E2E8F0] w-fit hover:border-[#0B1F3A]"
      >
        <ArrowLeft
          size={20}
          className="mr-2 transition-transform group-hover:-translate-x-1"
        />{" "}
        Back to Assignments
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#0B1F3A] tracking-tight mb-2">
            Assignment Details
          </h1>
          <p className="text-[#64748B] text-sm">
            Review operational progress, worker activities, and payment status.
          </p>
        </div>
        <span
          className={`px-4 py-1.5 inline-flex text-sm font-bold uppercase tracking-wider rounded-lg border ${getStatusStyle(assignment.status)}`}
        >
          {getStatusLabel(assignment.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="xl:col-span-2 space-y-8">
          {/* Issue Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden">
            <div className="px-8 py-6 border-b border-[#E2E8F0] bg-slate-50 flex items-center gap-3">
              <FileText className="text-[#0F9D8A]" size={24} />
              <h2 className="text-xl font-bold text-[#0B1F3A]">
                Issue Information
              </h2>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-black text-[#0F172A] mb-6 leading-tight">
                {issue.title}
              </h3>
              <p className="text-[#334155] whitespace-pre-wrap leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 text-lg">
                {issue.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0]">
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">
                    Category
                  </p>
                  <p className="font-bold text-[#0F172A]">
                    {issue.category?.name ||
                      issue.categoryId ||
                      "Uncategorized"}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0]">
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">
                    Issue Status
                  </p>
                  <p className="font-bold text-[#0F172A]">{issue.status}</p>
                </div>
                <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-[#E2E8F0]">
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
                    Location
                  </p>
                  <div className="flex items-start text-[#0F172A] font-medium">
                    <MapPin
                      size={18}
                      className="text-[#0F9D8A] mr-2 mt-0.5 shrink-0"
                    />
                    <span>{issue.address || "Address not provided"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Work Progress Timeline */}
          {progressRecords && progressRecords.length > 0 && (
            <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden">
              <div className="px-8 py-6 border-b border-[#E2E8F0] bg-slate-50 flex items-center gap-3">
                <Clock className="text-[#0F9D8A]" size={24} />
                <h2 className="text-xl font-bold text-[#0B1F3A]">
                  Work Execution Timeline
                </h2>
              </div>
              <div className="p-8">
                <div className="relative">
                  <div className="absolute top-0 bottom-0 left-[15px] w-0.5 bg-[#E2E8F0]" />
                  <ul className="space-y-8 relative">
                    {progressRecords.map((record) => (
                      <li key={record.id} className="relative pl-10">
                        <div className="absolute left-0 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center bg-blue-100 text-blue-600">
                          <CheckCircle size={14} />
                        </div>
                        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
                          <p className="text-sm font-bold text-[#64748B] bg-slate-100 px-3 py-1 rounded-lg w-fit mb-3">
                            {format(
                              new Date(record.createdAt),
                              "MMM d, yyyy \at h:mm a",
                            )}
                          </p>
                          {record.note && (
                            <p className="text-[#0F172A] font-medium mb-4">
                              {record.note}
                            </p>
                          )}

                          {record.media && record.media.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {record.media.map((m) => (
                                <div
                                  key={m.id}
                                  onClick={() => openMedia(m.mediaUrl)}
                                  className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer group"
                                >
                                  {m.mediaType === "VIDEO" ? (
                                    <video
                                      src={m.mediaUrl}
                                      className="object-cover w-full h-full"
                                    />
                                  ) : (
                                    <img
                                      src={m.mediaUrl}
                                      alt="Progress"
                                      className="object-cover w-full h-full"
                                    />
                                  )}
                                  <div className="absolute inset-0 bg-[#0B1F3A]/0 group-hover:bg-[#0B1F3A]/40 transition-all flex items-center justify-center backdrop-blur-[2px] opacity-0 group-hover:opacity-100">
                                    <Search className="text-white w-6 h-6" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Completion Details */}
          {assignment.status === "COMPLETED" && (
            <div className="bg-green-50 border-2 border-green-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="px-8 py-5 border-b border-green-200 bg-green-100/50 flex items-center gap-3">
                <CheckCircle className="text-green-600" size={24} />
                <h2 className="text-xl font-bold text-green-900">
                  Work Completed
                </h2>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white/60 p-4 rounded-xl border border-green-200">
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">
                      Completed On
                    </p>
                    <p className="font-black text-green-900 text-lg">
                      {format(
                        new Date(assignment.completedAt),
                        "MMM d, yyyy h:mm a",
                      )}
                    </p>
                  </div>
                  {afterVerification && (
                    <div className="bg-white/60 p-4 rounded-xl border border-green-200">
                      <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">
                        Verification Status
                      </p>
                      <p className="font-black text-green-900 text-lg">
                        {afterVerification.status}
                      </p>
                    </div>
                  )}
                </div>
                {assignment.completionNote && (
                  <div className="bg-white/80 p-5 rounded-2xl border border-green-200">
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">
                      Completion Note
                    </p>
                    <p className="text-green-900 font-medium whitespace-pre-wrap">
                      {assignment.completionNote}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Payment Section */}
          <div className="bg-white rounded-3xl shadow-sm border-2 border-[#0B1F3A] overflow-hidden sticky top-8">
            <div className="bg-[#0B1F3A] px-6 py-5">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <CreditCard size={20} className="text-[#0F9D8A]" /> Payment
                Details
              </h2>
            </div>

            <div className="p-6">
              {payment ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                      Status
                    </span>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${
                        payment.status === "COMPLETED"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : payment.status === "FAILED"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6 flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
                      Amount Paid
                    </span>
                    <div className="flex items-center text-[#0B1F3A]">
                      <IndianRupee size={24} className="mr-1" />
                      <span className="text-4xl font-black">
                        {payment.amount}
                      </span>
                    </div>
                  </div>

                  {payment.status === "COMPLETED" && payment.paidAt && (
                    <div className="flex items-center justify-center text-sm font-bold text-green-600 bg-green-50 p-3 rounded-xl border border-green-200">
                      <CheckCircle size={18} className="mr-2" />
                      Paid {format(new Date(payment.paidAt), "MMM d, yyyy")}
                    </div>
                  )}

                  {payment.status !== "COMPLETED" && isEligibleForPayment && (
                    <button
                      onClick={handlePayment}
                      disabled={processingPayment}
                      className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#0F9D8A] hover:bg-[#0B7A6A] transition-colors shadow-sm disabled:opacity-50"
                    >
                      {processingPayment ? "Processing..." : "Retry Payment"}
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-200">
                      <CreditCard className="h-8 w-8 text-[#64748B] opacity-50" />
                    </div>
                    <p className="text-sm font-bold text-[#0F172A]">
                      No payment recorded
                    </p>
                  </div>

                  <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 mb-6 flex flex-col items-center justify-center text-blue-900">
                    <span className="text-xs font-bold uppercase tracking-wider mb-1 opacity-80">
                      Amount Due
                    </span>
                    <div className="flex items-center">
                      <IndianRupee size={20} className="mr-1" />
                      <span className="text-3xl font-black">
                        {assignment.assignedRate}
                      </span>
                    </div>
                  </div>

                  {isEligibleForPayment ? (
                    <button
                      onClick={handlePayment}
                      disabled={processingPayment}
                      className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#0F9D8A] hover:bg-[#0B7A6A] transition-colors shadow-sm disabled:opacity-50"
                    >
                      {processingPayment ? "Processing..." : "Pay Worker Now"}
                    </button>
                  ) : (
                    <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-xs font-medium border border-amber-200">
                      <p className="flex gap-2">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        Payment becomes available once the work is completed,
                        after-work verification is approved, and the issue is
                        resolved.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Worker Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden">
            <div className="bg-slate-50 px-6 py-5 border-b border-[#E2E8F0]">
              <h2 className="text-lg font-bold text-[#0B1F3A] flex items-center gap-2">
                <User size={20} className="text-[#0F9D8A]" /> Assigned Worker
              </h2>
            </div>
            <div className="p-6">
              {worker ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">
                      Name
                    </p>
                    <p className="font-black text-[#0F172A] text-lg">
                      {worker.user.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">
                      Email
                    </p>
                    <p className="font-medium text-[#0F172A] break-all">
                      {worker.user.email}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">
                      Assigned Hourly Rate
                    </p>
                    <p className="font-black text-[#0F172A] flex items-center">
                      <IndianRupee size={16} className="mr-0.5" />
                      {assignment.assignedRate}/hr
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <User className="mx-auto h-12 w-12 text-[#64748B] opacity-30 mb-3" />
                  <p className="text-[#64748B] font-medium">
                    Worker details unavailable
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Status History */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden">
            <div className="bg-slate-50 px-6 py-5 border-b border-[#E2E8F0]">
              <h2 className="text-lg font-bold text-[#0B1F3A] flex items-center gap-2">
                <Clock size={20} className="text-[#0F9D8A]" /> Assignment
                History
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-5">
                {statusHistory &&
                  statusHistory.map((history, idx) => (
                    <div key={history.id} className="relative">
                      {idx !== statusHistory.length - 1 && (
                        <div className="absolute left-2 top-6 bottom-[-20px] w-px bg-slate-200" />
                      )}
                      <div className="flex gap-4">
                        <div className="w-4 h-4 rounded-full bg-[#0F9D8A] mt-1 shrink-0 ring-4 ring-[#0F9D8A]/20" />
                        <div>
                          <p className="font-bold text-[#0F172A] text-sm uppercase tracking-wider">
                            {history.newStatus}
                          </p>
                          <p className="text-[#64748B] text-xs font-medium mt-1 mb-2">
                            {format(
                              new Date(history.timestamp),
                              "MMM d, h:mm a",
                            )}
                          </p>
                          {history.reason && (
                            <p className="text-[#334155] text-sm bg-slate-50 p-3 rounded-xl border border-slate-200">
                              {history.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                {(!statusHistory || statusHistory.length === 0) && (
                  <p className="text-center text-[#64748B] text-sm py-4">
                    No history available
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerAssignmentDetails;
