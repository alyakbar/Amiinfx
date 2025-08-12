"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, HelpCircle, Phone, Calendar, Clock, Mail, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function EnquiryPage() {
  const [selectedEnquiry, setSelectedEnquiry] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleStartEnquiry = () => {
    setSelectedEnquiry("general");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Enquiry submitted successfully! We'll get back to you within 24 hours.");
        setSelectedEnquiry(null);
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        alert(data.error || "Failed to send enquiry.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev: typeof formData) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-8">
            <Link href="/dashboard" className="mr-4">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {/* Header */}
          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardContent className="p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mr-4">
                  <HelpCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    Get in <span className="text-red-400">TOUCH</span>
                  </h1>
                  <p className="text-gray-400 mt-2">
                    Have questions or need assistance? We&apos;re here to help with any enquiries about our services.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Enquiry Types */}
            <div className="space-y-6">
              {/* General Enquiries */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                      <HelpCircle className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">General Enquiries</h3>
                  </div>
                  <p className="text-gray-300 mb-4">Questions about our services, courses, or trading signals</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>24h response</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      <span>Email support</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Support */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Technical Support</h3>
                  </div>
                  <p className="text-gray-300 mb-4">Platform issues, account problems, or technical difficulties</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>Priority support</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      <span>Direct assistance</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Partnership & Collaboration */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Partnership & Collaboration</h3>
                  </div>
                  <p className="text-gray-300 mb-4">
                    Business partnerships, sponsorships, and collaboration opportunities
                  </p>
                  <div className="text-sm text-gray-400 space-y-1">
                    <div>Business inquiries</div>
                    <div>Media partnerships</div>
                    <div>Sponsorship deals</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Submit Form */}
            <div>
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <HelpCircle className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Submit Your Enquiry</h3>
                    <p className="text-gray-400">Fill out our contact form and we&apos;ll get back to you soon</p>
                  </div>

                  {!selectedEnquiry ? (
                    <div className="text-center">
                      <Button
                        onClick={handleStartEnquiry}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8"
                      >
                        START YOUR ENQUIRY
                      </Button>

                      <div className="mt-8 space-y-4 text-sm text-gray-400">
                        <div className="flex items-center justify-center">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Typical response time: 24 hours</span>
                        </div>
                        <div className="flex items-center justify-center">
                          <Mail className="h-4 w-4 mr-2" />
                          <span>In-app notifications sent</span>
                        </div>
                        <div className="flex items-center justify-center">
                          <HelpCircle className="h-4 w-4 mr-2" />
                          <span>All enquiry types welcome</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="text-white">
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="mt-1 bg-gray-700 border-gray-600 text-white"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-white">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="mt-1 bg-gray-700 border-gray-600 text-white"
                          placeholder="Enter your email"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="subject" className="text-white">
                          Subject
                        </Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          className="mt-1 bg-gray-700 border-gray-600 text-white"
                          placeholder="What's this about?"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="message" className="text-white">
                          Message
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          className="mt-1 bg-gray-700 border-gray-600 text-white"
                          placeholder="Tell us more about your enquiry..."
                          rows={4}
                          required
                        />
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3"
                        >
                          {isSubmitting ? "SUBMITTING..." : "SUBMIT ENQUIRY"}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setSelectedEnquiry(null)}
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
