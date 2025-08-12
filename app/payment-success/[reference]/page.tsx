"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  useEffect(() => {
    if (!reference) return;

    const verifyPayment = async () => {
      try {
        const res = await fetch(`/api/paystack/verify?reference=${reference}`);
        const data = await res.json();

        if (data.success) {
          router.push("/dashboard");
        } else {
          alert("Payment verification failed");
          router.push("/dashboard");
        }
      } catch (err) {
        console.error(err);
        router.push("/dashboard");
      }
    };

    verifyPayment();
  }, [reference, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-2xl">Verifying your payment, please wait...</h1>
    </div>
  );
}
