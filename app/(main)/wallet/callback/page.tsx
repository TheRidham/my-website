'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { usePayment } from '@/providers/PaymentProvider'
import { Loader2, CheckCircle2, XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

function WalletCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { verifyWalletPayment } = usePayment()
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const sessionId = searchParams.get('sessionId')
    const razorpayPaymentId = searchParams.get('razorpay_payment_id')

    if (!sessionId) {
      setStatus('error')
      setError('Missing payment information')
      return
    }

    const verify = async () => {
      try {
        const result = await verifyWalletPayment(sessionId, razorpayPaymentId || undefined)
        if (result.success) {
          setStatus('success')
          setTimeout(() => {
            router.push('/wallet')
          }, 3000)
        } else {
          setStatus('error')
          setError('Wallet top-up verification failed')
        }
      } catch (err: any) {
        console.error('Verification error:', err)
        setStatus('error')
        setError(err.message || 'An error occurred during verification')
      }
    }

    verify()
  }, [searchParams, verifyWalletPayment, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <Card className="w-full max-w-md border-none shadow-2xl bg-white/50 backdrop-blur-sm">
        <CardContent className="pt-10 pb-10 px-6 text-center">
          {status === 'loading' && (
            <div className="space-y-6">
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-primary/10"></div>
                <Loader2 className="w-20 h-20 animate-spin text-primary relative z-10" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Verifying Payment</h1>
                <p className="text-muted-foreground">Please do not refresh or close this window. We are confirming your transaction with the bank.</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-green-600">Top-up Successful!</h1>
                <p className="text-muted-foreground">Your wallet has been credited successfully. You will be redirected to your wallet in a few seconds.</p>
              </div>
              <Button 
                onClick={() => router.push('/wallet')}
                className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg font-semibold"
              >
                Go to Wallet
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-red-600">Payment Failed</h1>
                <p className="text-muted-foreground">{error || 'Something went wrong with your top-up. If money was deducted, it will be refunded within 5-7 business days.'}</p>
              </div>
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => window.location.reload()}
                  className="w-full h-12 text-lg font-semibold gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/wallet')}
                  className="w-full h-12 text-lg font-semibold gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Wallet
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function WalletCallbackPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>}>
      <WalletCallbackContent />
    </Suspense>
  )
}
