"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock } from "lucide-react"
import DashboardLayout from "@/components/layouts/DashboardLayout"

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  status: 'active' | 'inactive' | 'draft';
  category: string;
  instructor: string;
  enrolledStudents: number;
  totalRevenue: number;
  createdAt: string;
}

export default function CoursePage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Fetch courses from admin-created courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses')
        if (response.ok) {
          const data = await response.json()
          console.log('Debug - API response:', data)
          setCourses(data.courses || [])
        } else {
          console.error('Failed to fetch courses:', response.statusText)
          setCourses([])
        }
      } catch (error) {
        console.error('Error fetching courses:', error)
        setCourses([])
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const handleViewDetails = () => {
    alert(
      "Course Details:\n\nMaster Sniper Entries is a high-level, confluence-driven trading approach designed for traders who prioritize accuracy over frequency. This comprehensive course covers advanced market structure analysis, entry/exit strategies, and risk management techniques used by professional traders.\n\nWhat's Included:\n• 20+ video lessons\n• Strategy breakdowns\n• Community access\n• Lifetime updates\n• Direct support from Amiin FX team",
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Hero Section for Master Sniper Entries */}
        <section className="relative w-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 pb-12 pt-8 md:pt-16 mb-10 flex items-center justify-center">
          <div className="max-w-2xl mx-auto text-center px-4">
            <div className="w-32 h-32 bg-black/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-16 w-16 text-blue-400" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Premium Courses
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Master the art of forex trading with our comprehensive course collection
            </p>
            <div className="mb-6">
              <a href="#courses" className="inline-block">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 text-lg rounded-lg shadow-lg mb-2">
                  Explore Courses
                </Button>
              </a>
            </div>
            <blockquote className="text-cyan-400 italic text-base md:text-lg mt-2">&ldquo;Master the markets, one sniper entry at a time.&rdquo;</blockquote>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Course Card */}
          <div className="max-w-2xl">
            <Card className="bg-gray-800 border-gray-700">
              <div className="relative">
                <div className="w-full h-64 bg-gradient-to-br from-blue-900 to-purple-900 rounded-t-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-black/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-16 w-16 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Master Sniper Entries</h2>
                  </div>
                </div>
                <Badge className="absolute top-4 right-4 bg-purple-600 text-white">Premium</Badge>
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span className="text-xs">20+ lessons</span>
                </div>
              </div>

              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-white mb-2">Master Sniper Entries</h3>
                <p className="text-gray-400 mb-4">By Amiin FX</p>

                <p className="text-gray-300 mb-4">
                  Master Sniper Entries is a high-level, confluence-driven trading approach designed for traders who
                  prioritize accuracy over frequency. Learn the exact systems used by Amiin FX.
                </p>

                <div className="flex space-x-2 mb-4">
                  <Badge className="bg-orange-600 text-white">Advanced</Badge>
                  <Badge className="bg-blue-600 text-white">Strategy</Badge>
                </div>

                <div className="flex items-center mb-6">
                  <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-400">20+ Video Lessons</span>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => router.push('/checkout/master-sniper-entries?price=199')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    $199 - Purchase Course
                  </Button>
                  <Button
                    onClick={handleViewDetails}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                  >
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Created Courses Section */}
          {courses.length > 0 && (
            <div className="mt-16">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">More Courses</h2>
                <p className="text-gray-400">Explore our latest course offerings</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card key={course.id} className="bg-gray-800 border-gray-700">
                    <div className="relative">
                      <div className="w-full h-48 bg-gradient-to-br from-purple-900 to-blue-900 rounded-t-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <BookOpen className="h-10 w-10 text-purple-400" />
                          </div>
                          <h3 className="text-lg font-bold text-white">{course.title}</h3>
                        </div>
                      </div>
                      <Badge className="absolute top-3 right-3 bg-green-600 text-white">
                        {course.category}
                      </Badge>
                    </div>

                    <CardContent className="p-4">
                      <h4 className="text-xl font-bold text-white mb-2">{course.title}</h4>
                      <p className="text-gray-400 mb-2">By {course.instructor}</p>
                      
                      <p className="text-gray-300 mb-4 text-sm line-clamp-3">
                        {course.description}
                      </p>

                      <div className="flex items-center mb-4">
                        <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-400 text-sm">{course.enrolledStudents} students enrolled</span>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          onClick={() => router.push(`/checkout/${course.title.toLowerCase().replace(/\s+/g, '-')}?price=${course.price}`)}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm"
                        >
                          ${course.price} - Purchase
                        </Button>
                        <Button
                          onClick={() => alert(`Course: ${course.title}\n\nDescription: ${course.description}\n\nInstructor: ${course.instructor}\nPrice: $${course.price}\nEnrolled Students: ${course.enrolledStudents}`)}
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent text-sm"
                        >
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="mt-16 text-center">
              <p className="text-gray-400">Loading courses...</p>
            </div>
          )}

          {/* No Admin Courses State */}
          {!loading && courses.length === 0 && (
            <div className="mt-16 text-center">
              <p className="text-gray-400">No additional courses available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
