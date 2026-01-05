'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { usePayment } from '@/providers/PaymentProvider'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

function PaymentCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { verifyPayment } = usePayment()
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const sessionId = searchParams.get('sessionId')
    const razorpayPaymentId = searchParams.get('razorpay_payment_id')
    const razorpayPaymentLinkId = searchParams.get('razorpay_payment_link_id')
    
    // The advisorId might need to be stored in localStorage or passed in the URL if possible
    // But createWebPaymentSession in index.ts stores advisorId in the session document
    // However, processPaymentSuccess expects advisorId in the request data.
    // Let's check index.ts again.
    
    /*
    export const processPaymentSuccess = onCall(..., async (request) => {
      const { sessionId, advisorId, paymentId: rawPaymentId, ... } = data || {};
      ...
      const sessionDoc = await db.collection("paymentSessions").doc(sessionId).get();
      const sessionData = sessionDoc.data();
      if (sessionData?.userId !== userId || sessionData?.advisorId !== advisorId) { ... }
    */
    
    // So we DO need advisorId. We should have passed it in the returnUrl or stored it.
    // Let's update PaymentProvider to include advisorId in the returnUrl.
    
    const advisorId = searchParams.get('advisorId')

    if (!sessionId || !advisorId) {
      setStatus('error')
      setError('Missing payment information')
      return
    }

    const verify = async () => {
      try {
        const result = await verifyPayment(sessionId, advisorId, razorpayPaymentId || undefined)
        if (result.success) {
          setStatus('success')
          // Redirect to chat after a short delay
          setTimeout(() => {
            router.push(`/jaiya?roomId=${result.roomId}`)
          }, 3000)
        } else {
          setStatus('error')
          setError('Payment verification failed')
        }
      } catch (err: any) {
        console.error('Verification error:', err)
        setStatus('error')
        setError(err.message || 'An error occurred during verification')
      }
    }

    verify()
  }, [searchParams, verifyPayment, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      {status === 'loading' && (
        <>
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <h1 className="text-2xl font-bold mb-2">Verifying Payment</h1>
          <p className="text-muted-foreground">Please wait while we confirm your payment...</p>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground mb-6">Your payment has been verified. Redirecting you to your chat...</p>
          <Button onClick={() => router.push('/home')}>Go to Home</Button>
        </>
      )}

      {status === 'error' && (
        <>
          <XCircle className="w-16 h-16 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
          <p className="text-muted-foreground mb-6">{error || 'Something went wrong with your payment.'}</p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push('/home')}>Back to Home</Button>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </>
      )}
    </div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>}>
      <PaymentCallbackContent />
    </Suspense>
  )
}
