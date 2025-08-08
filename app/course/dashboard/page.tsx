"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function DashboardPage({ studentName = "Trader" }) {
  const [expanded, setExpanded] = useState([true, false, false])
  const [progress, setProgress] = useState(33)

  const modules = [
    {
      title: "Level 1: Price Action Fundamentals",
      icon: "📘",
      pdf: "#",
      slides: "#",
      quiz: "#",
    },
    {
      title: "Level 2: Smart Money Concepts Mastery",
      icon: "📗",
      pdf: "#",
      slides: "#",
      quiz: "#",
    },
    {
      title: "Level 3: Strategic Trading + Case Studies",
      icon: "📙",
      pdf: "#",
      slides: "#",
      quiz: "#",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-yellow-900 text-white font-sans px-4 py-8 flex flex-col items-center">
      <div className="w-full max-w-2xl mx-auto">
        {/* Welcome */}
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-yellow-400">Welcome back, {studentName} — Let’s begin your sniper trading journey.</h1>
        {/* Progress Bar */}
        <div className="w-full bg-gray-800 rounded-full h-4 mb-8 mt-2">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-4 rounded-full transition-all duration-500" style={{width: `${progress}%`}}></div>
        </div>
        {/* Modules */}
        <div className="space-y-6">
          {modules.map((mod, idx) => (
            <div key={mod.title} className="bg-black/80 border border-yellow-600 rounded-xl shadow-lg p-6 transition-all duration-300">
              <button
                className="flex items-center justify-between w-full text-left focus:outline-none"
                onClick={() => setExpanded(expanded.map((e, i) => i === idx ? !e : e))}
              >
                <span className="flex items-center gap-3 text-lg md:text-xl font-bold text-yellow-400">
                  <span>{mod.icon}</span> {mod.title}
                </span>
                <span className={`ml-2 text-yellow-400 transition-transform duration-300 ${expanded[idx] ? 'rotate-90' : ''}`}>▶</span>
              </button>
              {expanded[idx] && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <a href={mod.pdf} className="flex flex-col items-center bg-gray-900 rounded-lg p-4 hover:bg-yellow-900 transition-colors">
                    <span className="text-2xl mb-2">📥</span>
                    <span className="font-semibold text-white">Download/View PDF</span>
                  </a>
                  <a href={mod.slides} className="flex flex-col items-center bg-gray-900 rounded-lg p-4 hover:bg-yellow-900 transition-colors">
                    <span className="text-2xl mb-2">📊</span>
                    <span className="font-semibold text-white">Access Slides</span>
                  </a>
                  <a href={mod.quiz} className="flex flex-col items-center bg-gray-900 rounded-lg p-4 hover:bg-yellow-900 transition-colors">
                    <span className="text-2xl mb-2">✅</span>
                    <span className="font-semibold text-white">Take Quiz</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Restart/Last Section */}
        <div className="flex flex-col md:flex-row gap-4 mt-8">
          <Button className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 rounded-lg shadow-lg">Restart Course</Button>
          <Button className="flex-1 bg-gray-800 hover:bg-yellow-900 text-yellow-400 font-bold py-3 rounded-lg shadow-lg">Revisit Last Section</Button>
        </div>
        {/* Feedback/Support */}
        <div className="mt-8 text-center">
          <a href="#" className="text-yellow-400 underline hover:text-yellow-600 transition">💬 Need help or want to give feedback? Contact Support</a>
        </div>
      </div>
    </div>
  )
}
