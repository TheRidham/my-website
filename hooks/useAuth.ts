"use client"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useEffect, useState } from "react"

export function useAuth() {
  const [user, setUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
        if(user) {
            setUser(user.uid);
        }else {
            setUser(null);
        }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  return { user, loading }
}
