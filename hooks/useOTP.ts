"use client"

import { useState } from "react";

export interface UserData {
  email: string;
  firstName: string;
  lastName: string;
}

export interface VerifyOTPResult {
  success: boolean;
  userData?: UserData;
  error?: string;
}

export interface OTPHookReturn {
  sendOTP: (email: string, firstName: string, lastName: string) => Promise<boolean>;
  verifyOTP: (email: string, otp: string) => Promise<VerifyOTPResult>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useOTP(): OTPHookReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const sendOTP = async (email: string, firstName: string, lastName: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, lastName }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Failed to send OTP");
        return false;
      }

      return true;
    } catch {
      setError("Failed to send OTP. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (email: string, otp: string): Promise<VerifyOTPResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Invalid OTP");
        return { success: false, error: data.error };
      }

      return { success: true, userData: data.userData };
    } catch {
      const errorMessage = "Verification failed. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    sendOTP,
    verifyOTP,
    loading,
    error,
    clearError,
  };
}
