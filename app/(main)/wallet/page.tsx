'use client'

import React, { useState, useEffect } from 'react'
import { usePayment } from '@/providers/PaymentProvider'
import { Wallet, Plus, ArrowUpRight, History, Loader2, CreditCard, ArrowDownLeft, TrendingUp, ShieldCheck, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function WalletPage() {
  const { walletBalance, isLoading, topUpWallet } = usePayment()
  const [isTopUpLoading, setIsTopUpLoading] = useState(false)
  const [amount, setAmount] = useState('500')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleTopUp = async () => {
    const numAmount = parseInt(amount)
    if (isNaN(numAmount) || numAmount < 10) {
      alert('Please enter a valid amount (min ₹10)')
      return
    }

    setIsTopUpLoading(true)
    try {
      const result = await topUpWallet(numAmount * 100) // Convert to paise
      if (result.paymentUrl) {
        // Store sessionId in sessionStorage as a backup for verification
        if (result.sessionId) {
          sessionStorage.setItem('last_wallet_session_id', result.sessionId)
        }
        window.location.href = result.paymentUrl
      } else {
        alert('Failed to create payment session')
      }
    } catch (error: any) {
      console.error('Top-up error:', error)
      alert(error.message || 'Failed to initiate top-up')
    } finally {
      setIsTopUpLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="flex flex-col h-full bg-slate-100">
      {/* Header Section - Compact for Sidebar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.replace('/home')}
              className="h-9 w-9 rounded-xl hover:bg-slate-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold tracking-tight">My Wallet</h1>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/10">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary">
              ₹{(walletBalance / 100).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-6 pb-24">
        {/* Balance Card - Visual Focus */}
        <Card className="border-none shadow-lg bg-primary text-primary-foreground overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Wallet className="w-32 h-32" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-xs font-medium opacity-80 uppercase tracking-wider mb-1">Total Balance</p>
            <h2 className="text-3xl font-black">
              ₹{(walletBalance / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h2>
            <div className="mt-4 flex items-center gap-2 text-[10px] bg-white/20 w-fit px-2 py-1 rounded-full backdrop-blur-sm">
              <ShieldCheck className="w-3 h-3" />
              <span>100% Secure Payments</span>
            </div>
          </CardContent>
        </Card>

        {/* Add Money Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            Add Money
          </h3>
          
          <Card className="border-none shadow-md bg-white">
            <CardContent className="p-4 space-y-5">
              {/* Preset Amounts - 2x2 Grid for narrow width */}
              <div className="grid grid-cols-2 gap-2">
                {[100, 200, 500, 1000].map((val) => (
                  <button 
                    key={val} 
                    onClick={() => setAmount(val.toString())}
                    className={cn(
                      "py-3 rounded-xl border-2 transition-all duration-200 text-sm font-bold",
                      amount === val.toString() 
                        ? "border-primary bg-primary/5 text-primary" 
                        : "border-slate-50 bg-slate-50/50 hover:border-slate-100 text-slate-600"
                    )}
                  >
                    ₹{val}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="space-y-3">
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400 group-focus-within:text-primary transition-colors">₹</span>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-lg font-bold border-2 border-slate-100 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                    placeholder="Enter amount"
                  />
                </div>
                <Button 
                  onClick={handleTopUp} 
                  disabled={isTopUpLoading || isLoading}
                  className="w-full py-6 text-md font-bold shadow-lg shadow-primary/20 rounded-xl bg-blue-500/70 hover:bg-blue-500 hover:text-white"
                >
                  {isTopUpLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <CreditCard className="w-5 h-5 mr-2" />
                  )}
                  Add Money Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Recent Activity</h3>
            <button className="text-[11px] font-bold text-primary hover:underline">View All</button>
          </div>
          
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <History className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-xs font-medium text-slate-500">No transactions yet</p>
            </div>
          </Card>
        </div>

        {/* Help Section */}
        <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
          <p className="text-[11px] font-bold text-blue-900 flex items-center gap-2 mb-1">
            <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500" />
            Payment Support
          </p>
          <p className="text-[10px] text-blue-700/80 leading-relaxed">
            Facing issues? Our support team is available 24/7 to help you with wallet queries.
          </p>
        </div>
      </div>
    </div>
  )
}
