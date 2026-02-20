'use client'

import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { auth, db } from '@/lib/firebase'
import { GoogleAuthProvider, signInWithPopup, linkWithPopup } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { LogIn } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface LoginModalOptions {
  title?: string
  description?: string
}

interface AuthGateContextType {
  /**
   * Call this before any action that requires a real (non-guest) user.
   * - If the user is already authenticated (non-anonymous), resolves `true` immediately.
   * - If the user is anonymous/guest, opens the login modal and resolves `true`
   *   after successful sign-in, or `false` if the user cancels.
   *
   * Usage:
   * ```ts
   * const { requireLogin } = useAuthGate()
   *
   * const handleAction = async () => {
   *   const ok = await requireLogin({ title: 'Login Required', description: '...' })
   *   if (!ok) return
   *   // proceed with the protected action
   * }
   * ```
   */
  requireLogin: (options?: LoginModalOptions) => Promise<boolean>
  isGuest: boolean
}

const AuthGateContext = createContext<AuthGateContextType | undefined>(undefined)

export function useAuthGate() {
  const ctx = useContext(AuthGateContext)
  if (!ctx) {
    throw new Error('useAuthGate must be used within an AuthGateProvider')
  }
  return ctx
}

export function AuthGateProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  // Modal visibility & content
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('Login Required')
  const [description, setDescription] = useState(
    'You need to sign in with Google to access this feature. Guest accounts do not have access.'
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Promise resolver for the current requireLogin call
  const resolverRef = useRef<((value: boolean) => void) | null>(null)

  const isGuest = !!user?.isAnonymous

  const requireLogin = useCallback(
    (options?: LoginModalOptions): Promise<boolean> => {
      // Already a real user — no modal needed
      if (user && !user.isAnonymous) {
        return Promise.resolve(true)
      }

      // No user at all — also show modal
      return new Promise<boolean>((resolve) => {
        // If a previous promise is still pending, resolve it as cancelled
        resolverRef.current?.(false)
        resolverRef.current = resolve

        setTitle(options?.title ?? 'Login Required')
        setDescription(
          options?.description ??
            'You need to sign in with Google to access this feature. Guest accounts do not have access.'
        )
        setError('')
        setOpen(true)
      })
    },
    [user]
  )

  const handleClose = useCallback((value: boolean) => {
    setOpen(value)
    if (!value) {
      // User dismissed the modal
      resolverRef.current?.(false)
      resolverRef.current = null
    }
  }, [])

  const handleGoogleSignin = async () => {
    setLoading(true)
    setError('')
    try {
      const currentUser = auth.currentUser
      const provider = new GoogleAuthProvider()

      if (currentUser?.isAnonymous) {
        // Try to link anonymous account with Google
        try {
          const result = await linkWithPopup(currentUser, provider)
          await ensureUserDoc(result.user)

          setOpen(false)
          resolverRef.current?.(true)
          resolverRef.current = null
        } catch (linkError: any) {
          if (linkError.code === 'auth/credential-already-in-use') {
            // Google account already exists — sign in directly
            const result = await signInWithPopup(auth, provider)
            await ensureUserDoc(result.user)

            setOpen(false)
            resolverRef.current?.(true)
            resolverRef.current = null
          } else {
            throw linkError
          }
        }
      } else {
        // Not anonymous or no user — regular Google sign-in
        const result = await signInWithPopup(auth, provider)
        await ensureUserDoc(result.user)

        setOpen(false)
        resolverRef.current?.(true)
        resolverRef.current = null
      }
    } catch (err: any) {
      console.error('Error signing in with Google:', err)

      let errorMessage = 'Failed to sign in. Please try again.'
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in cancelled. Please try again.'
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups for this site.'
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with the same email address.'
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGateContext.Provider value={{ requireLogin, isGuest }}>
      {children}

      {/* Centralized Login Required Modal */}
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <span className="flex items-center gap-2">
                <LogIn size={20} className="text-primary" />
                {title}
              </span>
            </DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-4">
            <button
              onClick={handleGoogleSignin}
              disabled={loading}
              className={`w-full py-3 px-4 cursor-pointer rounded-lg text-gray-800 font-semibold transition-all flex items-center justify-center gap-3 border border-gray-300 ${
                loading
                  ? 'bg-white/70 cursor-not-allowed'
                  : 'bg-white hover:bg-gray-50 shadow-md hover:shadow-lg'
              }`}
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleClose(false)}
              className="w-full py-2 px-4 rounded-lg text-gray-500 text-sm hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>

          {error && (
            <p className="mt-3 text-center text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
              {error}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </AuthGateContext.Provider>
  )
}

// ─── Helper ──────────────────────────────────────────────
async function ensureUserDoc(user: import('firebase/auth').User) {
  const locale = navigator.language || 'en-US'
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  const userRef = doc(db, 'users', user.uid)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) {
    const existingData = userSnap.data()
    await setDoc(
      userRef,
      {
        ...existingData,
        name: user.displayName || existingData.name,
        email: user.email || existingData.email,
        isAnonymous: false,
        locale,
        timezone,
        indatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  } else {
    await setDoc(userRef, {
      name: user.displayName,
      email: user.email,
      hasClaimedFreeCash: false,
      walletBalance: 0,
      isAnonymous: false,
      locale,
      timezone,
      createdAt: serverTimestamp(),
      indatedAt: serverTimestamp(),
    })
  }
}
