"use client";
import React, { useState, useEffect } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { usePayment } from "@/providers/PaymentProvider";
import { usePrice } from "@/providers/PriceProvider";
import { Loader2, User, Star, MessageSquare, Wallet, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface Advisor {
  id: string;
  name: string;
  specialty: string | string[];
  rating: number;
  experience: string;
  image?: string;
}

interface HumanAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryKey?: string;
  subcategoryTitle?: string;
  selectedAdvisor?: Advisor | null;
}

export function HumanAdvisorModal({
  isOpen,
  onClose,
  categoryKey,
  subcategoryTitle,
  selectedAdvisor,
}: HumanAdvisorModalProps) {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { walletBalance, createPaymentSession, payWithWallet } = usePayment();
  const { price } = usePrice();

  const router = useRouter();

  useEffect(() => {
    if (isOpen && !selectedAdvisor) {
      fetchAdvisors();
    }
  }, [isOpen, selectedAdvisor]);

  const fetchAdvisors = async () => {
    setIsLoading(true);
    try {
      const getAvailableAdvisors = httpsCallable(
        functions,
        "getAvailableAdvisors"
      );
      const result: any = await getAvailableAdvisors();
      let fetchedAdvisors = result.data.advisors || [];

      // Filter by category or subcategory if provided
      if (subcategoryTitle) {
        fetchedAdvisors = fetchedAdvisors.filter((a: any) => {
          const specs = Array.isArray(a.specialization)
            ? a.specialization
            : [a.specialty];
          return specs.some((s: string) =>
            s.toLowerCase().includes(subcategoryTitle.toLowerCase())
          );
        });
      }

      setAdvisors(fetchedAdvisors);
    } catch (error) {
      console.error("Error fetching advisors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletPayment = async (advisorId: string) => {
    setIsProcessing(true);
    try {
      const amountInPaise = price * 100;
      if (walletBalance >= amountInPaise) {
        // Pay with wallet
        const result = await payWithWallet(advisorId, amountInPaise);
        console.log("pay with wallet result");
        console.log(result);
        if (result.success) {
          router.push(`/home/humanChat/${result.roomId}/${result.advisorId}`);
        }
      } else {
        alert("unsufficient wallet balance");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      alert(error.message || "Failed to initiate payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRazorpayPayment = async (advisorId: string) => {
    setIsProcessing(true);
    try {
      const amountInPaise = price * 100;
      // Pay with Razorpay
      const result = await createPaymentSession(amountInPaise, advisorId);
      console.log("razorpay result:", result)
      if (result.paymentUrl) {
        // Store sessionId in sessionStorage as a backup for verification
        if (result.sessionId) {
          sessionStorage.setItem("last_payment_session_id", result.sessionId);
        }
        window.location.href = result.paymentUrl;
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      alert(error.message || "Failed to initiate payment");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {selectedAdvisor ? "Payment Options" : "Connect with Human Advisor"}
          </DialogTitle>
          <DialogDescription>
            {selectedAdvisor
              ? `Choose payment method to start chat with ${selectedAdvisor.name}`
              : `Get personalized advice from our expert ${
                  subcategoryTitle || "advisors"
                }.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Wallet Balance
                </div>
                <div className="text-lg font-black text-blue-900">
                  ₹{(walletBalance / 100).toFixed(2)}
                </div>
              </div>
            </div>
            {walletBalance < price * 100 && (
              <Button
                variant="link"
                className="text-blue-600 font-bold text-xs"
                onClick={() => (window.location.href = "/wallet")}
              >
                Top Up
              </Button>
            )}
          </div>

          {selectedAdvisor ? (
            <div className="space-y-4">
              <div className="p-4 border rounded-2xl bg-slate-50 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center overflow-hidden border-2 border-white">
                  {selectedAdvisor.image ? (
                    <img
                      src={selectedAdvisor.image}
                      alt={selectedAdvisor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <div>
                  <div className="font-black text-gray-900">
                    {selectedAdvisor.name}
                  </div>
                  <div className="text-xs font-medium text-gray-500">
                    {Array.isArray(selectedAdvisor.specialty)
                      ? selectedAdvisor.specialty.join(", ")
                      : selectedAdvisor.specialty}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold text-gray-700">
                      {selectedAdvisor.rating || "4.8"}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium ml-1">
                      {selectedAdvisor.experience || "5+ years"} exp
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={() => handleWalletPayment(selectedAdvisor.id)}
                  disabled={isProcessing}
                  className="h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200 flex items-center justify-between px-6"
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5" />
                    <span>{isProcessing ? "Processing..." : "Pay with Wallet"}</span>
                  </div>
                  <span className="text-lg">₹{price}</span>
                </Button>

                <Button
                  onClick={() => handleRazorpayPayment(selectedAdvisor.id)}
                  disabled={isProcessing}
                  className="h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200 flex items-center justify-between px-6"
                >
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5" />
                    <span>{isProcessing ? "Processing..." : "Pay with Razorpay"}</span>
                  </div>
                  <span className="text-lg">₹{price}</span>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Available Experts
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center py-12">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
                  <p className="text-sm font-bold text-gray-400">
                    Finding the best experts for you...
                  </p>
                </div>
              ) : advisors.length > 0 ? (
                <div className="space-y-3 max-h-87.5 overflow-y-auto pr-2 no-scrollbar">
                  {advisors.map((advisor) => (
                    <div
                      key={advisor.id}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                          {advisor.image ? (
                            <img
                              src={advisor.image}
                              alt={advisor.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-7 h-7 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {advisor.name}
                          </div>
                          <div className="text-[11px] font-medium text-gray-500 line-clamp-1">
                            {Array.isArray(advisor.specialty)
                              ? advisor.specialty.join(", ")
                              : advisor.specialty}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-[10px] font-bold text-gray-700">
                              {advisor.rating || "4.9"}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium ml-1">
                              {advisor.experience || "4+ years"} exp
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleWalletPayment(advisor.id)}
                        disabled={isProcessing}
                        className="bg-blue-600 hover:bg-blue-700 rounded-xl font-bold px-4"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          `₹${price}`
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-3xl">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-gray-200" />
                  </div>
                  <p className="text-sm font-bold text-gray-500">
                    No advisors available right now.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Please try again in a few minutes.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
