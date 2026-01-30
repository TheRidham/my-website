"use client"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useEffect, useState } from "react"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
        if(user) {
            setUser(user);
        }else {
            setUser(null);
        }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  return { user, loading }
}
