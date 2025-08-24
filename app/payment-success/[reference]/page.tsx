"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const code = searchParams.get("code");
  const paddleOrder = searchParams.get('order');
  const paddleSubscription = searchParams.get('paddle');
  const planType = searchParams.get('plan');

  useEffect(() => {
    // run verification if we have either a paystack reference, crypto code, or paddle params
    if (!reference && !code && !paddleOrder && !paddleSubscription) return;

    const verifyPayment = async () => {
      try {
        if (code) {
          // Verify crypto charge by code
          const res = await fetch(`/api/crypto/verify?code=${code}`);
          const data = await res.json();

          if (data.success) {
            router.push("/dashboard");
            return;
          } else {
            alert("Crypto payment verification failed");
            router.push("/dashboard");
            return;
          }
        }

        if (paddleOrder) {
          const res = await fetch(`/api/paddle/verify?order=${encodeURIComponent(paddleOrder)}`);
          const data = await res.json();

          if (data.success) router.push('/dashboard');
          else { alert('Payment verification failed'); router.push('/dashboard'); }
          return;
        }

        // Handle Paddle subscription success (from new subscription flow)
        if (paddleSubscription && planType) {
          // For Paddle subscriptions, we typically don't need to verify immediately
          // as the webhook will handle the transaction recording
          // Just show success and redirect to dashboard
          alert(`Subscription successful! You are now subscribed to the ${planType.replace('-', ' ')} plan.`);
          router.push('/dashboard');
          return;
        }

        if (reference) {
          const res = await fetch(`/api/paystack/verify?reference=${reference}`);
          const data = await res.json();

          if (data.success) {
            router.push("/dashboard");
          } else {
            alert("Payment verification failed");
            router.push("/dashboard");
          }
        }
      } catch (err) {
        console.error(err);
        router.push("/dashboard");
      }
    };

    verifyPayment();
  }, [reference, code, paddleOrder, paddleSubscription, planType, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="text-center">
        <h1 className="text-2xl mb-4">
          {paddleSubscription ? 'Processing your subscription...' : 'Verifying your payment, please wait...'}
        </h1>
        {paddleSubscription && planType && (
          <p className="text-gray-400">
            Setting up your {planType.replace('-', ' ')} trading signals subscription
          </p>
        )}
      </div>
    </div>
  );
}
