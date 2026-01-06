"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePayment } from "@/providers/PaymentProvider";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyPayment, isLoading } = usePayment();

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

    const sessionId =
      searchParams.get("sessionId") ||
      searchParams.get("razorpay_payment_link_reference_id") ||
      sessionStorage.getItem("last_payment_session_id");
    const razorpayPaymentId = searchParams.get("razorpay_payment_id");
    const razorpayPaymentLinkId = searchParams.get("razorpay_payment_link_id");
    const advisorId = searchParams.get("advisorId");

    console.log("sessionId", sessionId);
    console.log("razorPayPaymentId", razorpayPaymentId);
    console.log("razorPayPaymentLinkId", razorpayPaymentLinkId);
    console.log("advisorId", advisorId);

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

        const result = await verifyPayment(
          sessionId || razorpayPaymentLinkId!,
          advisorId,
          razorpayPaymentId || "pending",
          razorpayPaymentLinkId || undefined
        );

        if (result.success) {
          // Clear the stored session ID on success
          sessionStorage.removeItem("last_payment_session_id");

          if (result.alreadyProcessed) {
            setSuccessMessage(
              "Payment already processed! Redirecting to chat..."
            );
          }

          setStatus("success");
          // Redirect to chat after a short delay
          setTimeout(() => {
            router.push(`/home/humanChat/${result.roomId}/${advisorId}`);
          }, 3000);
        } else {
          setStatus("error");
          setError("Payment verification failed");
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
            <Button variant="outline" onClick={() => router.push("/home")}>
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
