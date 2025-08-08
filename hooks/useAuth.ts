"use client"

import { useState, useCallback } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
  type AuthError,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useFirebase } from "@/components/providers/firebase-provider"

export function useAuth() {
  const { user, loading: firebaseLoading, initialized } = useFirebase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const login = useCallback(
    async (email: string, password: string) => {
      if (!initialized) {
        throw new Error("Firebase not initialized")
      }

      try {
        setError(null)
        setLoading(true)
        await signInWithEmailAndPassword(auth, email, password)
      } catch (error: any) {
        console.error("Login error:", error)
        setError(getErrorMessage(error))
        throw error
      } finally {
        setLoading(false)
      }
    },
    [initialized],
  )

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      if (!initialized) {
        throw new Error("Firebase not initialized")
      }

      try {
        setError(null)
        setLoading(true)
        const { user } = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(user, { displayName: name })

        // Optionally send email verification
        try {
          await sendEmailVerification(user)
        } catch (verificationError) {
          console.warn("Email verification failed:", verificationError)
        }
      } catch (error: any) {
        console.error("Registration error:", error)
        setError(getErrorMessage(error))
        throw error
      } finally {
        setLoading(false)
      }
    },
    [initialized],
  )

  const logout = useCallback(async () => {
    if (!initialized) {
      throw new Error("Firebase not initialized")
    }

    try {
      setError(null)
      await signOut(auth)
    } catch (error: any) {
      console.error("Logout error:", error)
      setError("Failed to log out")
      throw error
    }
  }, [initialized])

  const getErrorMessage = (error: AuthError): string => {
    switch (error.code) {
      case "auth/user-not-found":
        return "No account found with this email address."
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Incorrect password. Please try again."
      case "auth/email-already-in-use":
        return "An account with this email already exists."
      case "auth/weak-password":
        return "Password should be at least 6 characters long."
      case "auth/invalid-email":
        return "Please enter a valid email address."
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later."
      case "auth/network-request-failed":
        return "Network error. Please check your connection."
      default:
        return error.message || "An unexpected error occurred."
    }
  }

  return {
    user,
    loading: firebaseLoading || loading,
    error,
    initialized,
    login,
    register,
    logout,
    clearError,
  }
}
