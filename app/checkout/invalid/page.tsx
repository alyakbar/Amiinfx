"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function InvalidCheckout() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center border-2 border-yellow-600">
        <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">Invalid Service</h2>
        <p className="text-white mb-4">The requested service is not available for checkout.<br />Please select a valid product.</p>
        <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-lg" onClick={() => router.push("/checkout")}>Back to Services</Button>
      </div>
    </div>
  )
}
