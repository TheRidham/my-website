'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { httpsCallable } from 'firebase/functions'
import { doc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore'
import { functions, db, auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export interface Transaction {
  id: string
  amount: number
  type: 'credit' | 'debit'
  status: 'pending' | 'success' | 'failed'
  description: string
  createdAt: any
}

interface PaymentContextType {
  walletBalance: number
  isLoading: boolean
  transactions: Transaction[]
  createPaymentSession: (amount: number, advisorId: string) => Promise<any>
  topUpWallet: (amount: number) => Promise<any>
  payWithWallet: (advisorId: string, amount: number) => Promise<any>
  verifyPayment: (sessionId: string, advisorId: string, paymentId?: string, paymentLinkId?: string) => Promise<any>
  verifyWalletPayment: (sessionId: string, paymentId?: string, paymentLinkId?: string) => Promise<any>
  createDodoPaymentSession: (amount: number, advisorId: string) => Promise<any>
  createDodoWalletTopup: (amount: number) => Promise<any>
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [walletBalance, setWalletBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      if (!user) {
        setWalletBalance(0)
        setIsLoading(false)
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return

    const userDocRef = doc(db, 'users', user.uid)
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        setWalletBalance(data.walletBalance || 0)
      }
      setIsLoading(false)
    }, (error) => {
      console.error("Error fetching wallet balance:", error)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  useEffect(() => {
    if (!user) {
      setTransactions([])
      return
    }

    const transactionsQuery = query(
      collection(db, 'walletTransactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(transactionsQuery, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[]
      setTransactions(txs)
    }, (error) => {
      console.error("Error fetching transactions:", error)
    })

    return () => unsubscribe()
  }, [user])

  const createPaymentSession = useCallback(async (amount: number, advisorId: string) => {
    const createWebPaymentSession = httpsCallable(functions, 'createWebPaymentSession')
    const returnUrl = `${window.location.origin}/payment-callback?advisorId=${advisorId}`
    
    const result = await createWebPaymentSession({
      amount,
      advisorId,
      returnUrl,
      isDev: process.env.NODE_ENV === 'development'
    })
    
    return result.data
  }, [])

  const topUpWallet = useCallback(async (amount: number) => {
    const addMoneyToWallet = httpsCallable(functions, 'addMoneyToWallet')
    const returnUrl = `${window.location.origin}/wallet/callback`
    
    const result = await addMoneyToWallet({
      amount,
      returnUrl,
      isDev: process.env.NODE_ENV === 'development'
    })
    
    return result.data
  }, [])

  const payWithWallet = useCallback(async (advisorId: string, amount: number) => {
    const useWalletForPayment = httpsCallable(functions, 'useWalletForPayment')
    const result = await useWalletForPayment({
      advisorId,
      amount
    })
    return result.data
  }, [])

  const verifyPayment = useCallback(async (sessionId: string, advisorId: string, paymentId?: string, paymentLinkId?: string) => {
    const processPaymentSuccess = httpsCallable(functions, 'processPaymentSuccess')
    const result = await processPaymentSuccess({
      sessionId,
      advisorId,
      paymentId,
      paymentLinkId
    })
    return result.data
  }, [])

  const verifyWalletPayment = useCallback(async (sessionId: string, paymentId?: string, paymentLinkId?: string) => {
    const processWalletPaymentSuccess = httpsCallable(functions, 'processWalletPaymentSuccess')
    const result = await processWalletPaymentSuccess({
      sessionId,
      paymentId,
      paymentLinkId
    })
    return result.data
  }, [])

  // ========================================
  // DODO PAYMENT METHODS (NEW)
  // ========================================

  const createDodoPaymentSession = useCallback(async (amount: number, advisorId: string) => {
    const createDodoAdvisorSession = httpsCallable(functions, 'createDodoAdvisorSession')

    const result = await createDodoAdvisorSession({
      amount,
      advisorId,
      returnUrl: `${window.location.origin}/payment-callback`,
      isDev: true  // TODO: Change to false when going live with real API key
    })

    return result.data
  }, [])

  const createDodoWalletTopup = useCallback(async (amount: number) => {
    const createDodoWalletTopupSession = httpsCallable(functions, 'createDodoWalletTopupSession')

    const result = await createDodoWalletTopupSession({
      amount,
      returnUrl: `${window.location.origin}/wallet/callback`,
      isDev: true  // TODO: Change to false when going live with real API key
    })

    return result.data
  }, [])

  return (
    <PaymentContext.Provider value={{
      walletBalance,
      isLoading,
      transactions,
      createPaymentSession,
      topUpWallet,
      payWithWallet,
      verifyPayment,
      verifyWalletPayment,
      createDodoPaymentSession,
      createDodoWalletTopup
    }}>
      {children}
    </PaymentContext.Provider>
  )
}

export function usePayment() {
  const context = useContext(PaymentContext)
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider')
  }
  return context
}
