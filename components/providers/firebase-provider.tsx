"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, type User } from "firebase/auth"

interface FirebaseContextType {
  user: User | null
  loading: boolean
  initialized: boolean
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  loading: true,
  initialized: false,
})

export const useFirebase = () => {
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error("useFirebase must be used within FirebaseProvider")
  }
  return context
}

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Wait for Firebase to be ready
    const initializeFirebase = async () => {
      try {
        // Small delay to ensure Firebase is fully loaded
        await new Promise((resolve) => setTimeout(resolve, 100))

        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user)
          setLoading(false)
          setInitialized(true)
        })

        return unsubscribe
      } catch (error) {
        console.error("Firebase initialization error:", error)
        setLoading(false)
        setInitialized(true)
      }
    }

    const unsubscribePromise = initializeFirebase()

    return () => {
      unsubscribePromise.then((unsubscribe) => {
        if (unsubscribe) unsubscribe()
      })
    }
  }, [])

  return <FirebaseContext.Provider value={{ user, loading, initialized }}>{children}</FirebaseContext.Provider>
}
