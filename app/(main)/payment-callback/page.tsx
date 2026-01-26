"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePayment } from "@/providers/PaymentProvider";
import { useVideoRoom } from "@/hooks/useVideoRoom";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyPayment, isLoading } = usePayment();
  const { createRoom } = useVideoRoom();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [verificationStarted, setVerificationStarted] = useState(false);
  const [successMessage, setSuccessMessage] = useState(
    "Your payment has been verified. Redirecting you to your chat..."
  );

  useEffect(() => {
    // Wait for auth to settle
    if (isLoading || verificationStarted) return;

    // Extract parameters
    const gateway = searchParams.get("gateway") || "razorpay";
    const sessionId =
      searchParams.get("sessionId") ||
      searchParams.get("razorpay_payment_link_reference_id") ||
      sessionStorage.getItem("last_payment_session_id");
    const razorpayPaymentId = searchParams.get("razorpay_payment_id");
    const razorpayPaymentLinkId = searchParams.get("razorpay_payment_link_id");
    const advisorId = searchParams.get("advisorId");
    let advisorName = searchParams.get("advisorName") || sessionStorage.getItem("video_advisor_name") || "Advisor";
    const cancelled = searchParams.get("cancelled");

    console.log("sessionId", sessionId);
    console.log("razorPayPaymentId", razorpayPaymentId);
    console.log("razorPayPaymentLinkId", razorpayPaymentLinkId);
    console.log("advisorId", advisorId);
    console.log("gateway", gateway);

    // Handle cancelled payment
    if (cancelled === 'true') {
      setStatus("error");
      setError("Payment was cancelled");
      return;
    }

    if ((!sessionId && !razorpayPaymentLinkId) || !advisorId) {
      setStatus("error");
      setError("Missing payment information");
      return;
    }

    const verify = async () => {
      setVerificationStarted(true);
      try {
        // Ensure user document exists in Firestore to avoid potential backend errors
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            await setDoc(
              userRef,
              {
                uid: currentUser.uid,
                name: currentUser.displayName || "User",
                email: currentUser.email,
                profilePhoto: currentUser.photoURL,
                walletBalance: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              },
              { merge: true }
            );
          }
        }

        // Check if this is a video session
        const isVideoSession = sessionStorage.getItem("video_advisor_id");
        const videoAdvisorId = sessionStorage.getItem("video_advisor_id");
        const videoAmount = sessionStorage.getItem("video_amount");
        const videoMethod = sessionStorage.getItem("video_method");

        if (gateway === 'dodo') {
          // ========================================
          // DODO PAYMENT HANDLER
          // Webhook processes payment asynchronously
          // Poll session status until webhook completes
          // ========================================

          setSuccessMessage("Payment is being processed. You'll be connected to your advisor shortly...");
          setStatus("success");

          // Poll for session completion
          let attempts = 0;
          const maxAttempts = 20; // 1 minute total (20 * 3 seconds)

          const pollInterval = setInterval(async () => {
            attempts++;

            try {
              // Check session status in Firestore
              const sessionDoc = await getDoc(doc(db, 'paymentSessions', sessionId!));
              const sessionData = sessionDoc.data();

              if (sessionData?.status === 'completed' && sessionData?.roomId) {
                clearInterval(pollInterval);
                
                // If video session, create video room
                if (isVideoSession && videoAdvisorId) {
                  const videoRoomId = await createRoom(videoAdvisorId, {
                    amount: parseInt(videoAmount || '0'),
                    status: 'success',
                    method: videoMethod as 'wallet' | 'card' | 'upi',
                  });
                  
                  // TODO: Send email to advisor about video call session
                  // sendEmailToAdvisor(videoAdvisorId, advisorName, videoRoomId)
                  
                  sessionStorage.removeItem("video_advisor_id");
                  sessionStorage.removeItem("video_amount");
                  sessionStorage.removeItem("video_method");
                  
                  setTimeout(() => {
                    const advisorNameParam = encodeURIComponent(advisorName || 'Advisor');
                    router.push(`/call/${videoRoomId}?advisorName=${advisorNameParam}`);
                  }, 1000);
                } else {
                  // Chat session - use existing logic
                  setTimeout(() => {
                    router.push(`/humanChat/${sessionData.roomId}/${advisorId}`);
                  }, 1000);
                }
              } else if (attempts >= maxAttempts) {
                // Timeout - show helpful message
                clearInterval(pollInterval);
                setError("Payment is taking longer than expected. Please check your wallet in a few minutes.");
                setStatus("error");
              }
            } catch (error) {
              console.error('[Dodo Callback] Polling error:', error);
            }
          }, 3000); // Check every 3 seconds

          return;

        } else {
          // ========================================
          // RAZORPAY PAYMENT HANDLER (EXISTING - KEEP)
          // ========================================

          const result = await verifyPayment(
            sessionId || razorpayPaymentLinkId!,
            advisorId,
            razorpayPaymentId || "pending",
            razorpayPaymentLinkId || undefined
          );

          if (result.success) {
            sessionStorage.removeItem("last_payment_session_id");

            if (result.alreadyProcessed) {
              setSuccessMessage("Payment already processed! Redirecting to chat...");
            }

            // If video session, create video room
            if (isVideoSession && videoAdvisorId) {
              const videoRoomId = await createRoom(videoAdvisorId, {
                amount: parseInt(videoAmount || '0'),
                status: 'success',
                method: videoMethod as 'wallet' | 'card' | 'upi',
                transactionId: result.transactionId || sessionId || razorpayPaymentLinkId,
              });
              
              // TODO: Send email to advisor about video call session
              // sendEmailToAdvisor(videoAdvisorId, advisorName, videoRoomId)
              
              sessionStorage.removeItem("video_advisor_id");
              sessionStorage.removeItem("video_amount");
              sessionStorage.removeItem("video_method");
              
              setStatus("success");
              setTimeout(() => {
                const advisorNameParam = encodeURIComponent(advisorName || 'Advisor');
                router.push(`/call/${videoRoomId}?advisorName=${advisorNameParam}`);
              }, 3000);
            } else {
              // Chat session - use existing logic
              setStatus("success");
              setTimeout(() => {
                router.push(`/humanChat/${result.roomId}/${advisorId}`);
              }, 3000);
            }
          } else {
            setStatus("error");
            setError("Payment verification failed");
          }
        }
      } catch (err: any) {
        console.error("Verification error:", err);

        // Handle retry for already-exists (processing in progress)
        if (err.code === "functions/already-exists" && retryCount < 5) {
          console.log(
            `Payment is being processed, retrying... (${retryCount + 1}/5)`
          );
          setRetryCount((prev) => prev + 1);
          setVerificationStarted(false); // Allow retry
          setTimeout(verify, 2000);
          return;
        }

        // Check for specific Firebase errors
        if (err.code === "functions/unauthenticated") {
          setError("You must be logged in to verify payment.");
        } else if (err.code === "functions/not-found") {
          setError("Payment session not found. Please contact support.");
        } else if (err.code === "functions/failed-precondition") {
          setError(
            "Payment verification failed. Please contact support if money was deducted."
          );
        } else {
          setError(err.message || "An error occurred during verification");
        }
        setStatus("error");
      }
    };

    verify();
  }, [
    searchParams,
    verifyPayment,
    router,
    isLoading,
    verificationStarted,
    retryCount,
  ]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      {status === "loading" && (
        <>
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <h1 className="text-2xl font-bold mb-2">Verifying Payment</h1>
          <p className="text-muted-foreground">
            {retryCount > 0
              ? `Processing is taking longer than expected (Retry ${retryCount}/5)...`
              : "Please wait while we confirm your payment..."}
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground mb-6">{successMessage}</p>
          <p>wait while we connecting to advisor...</p>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="w-16 h-16 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
          <p className="text-muted-foreground mb-6">
            {error || "Something went wrong with your payment."}
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push("/")}>
              Back to Home
            </Button>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </>
      )}
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
