'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  BookOpen, Users, DollarSign, TrendingUp, Plus, Search, Filter,
  Edit, Trash2, Eye, Star
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  students: number;
  rating: number;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  category: string;
}

interface CourseStats {
  totalCourses: number;
  activeCourses: number;
  totalStudents: number;
  totalRevenue: number;
}

export default function CoursesManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<CourseStats>({
    totalCourses: 0,
    activeCourses: 0,
    totalStudents: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState<Partial<Course>>({ title: '', description: '', price: 0, students: 0, rating: 0, status: 'draft', category: '' });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const qs = await getDocs(collection(db, 'courses'));
      const items: Course[] = qs.docs.map(d => {
        const data = d.data() as DocumentData;
        return {
          id: d.id,
          title: data.title || '',
          description: data.description || '',
          price: Number(data.price || 0),
          students: Number(data.students || 0),
          rating: Number(data.rating || 0),
          status: (data.status as Course['status']) || 'draft',
          createdAt: data.createdAt || new Date().toISOString(),
          category: data.category || ''
        } as Course;
      });
      setCourses(items);
      setStats({
        totalCourses: items.length,
        activeCourses: items.filter(c => c.status === 'active').length,
        totalStudents: items.reduce((sum, c) => sum + c.students, 0),
        totalRevenue: items.reduce((sum, c) => sum + (c.price * c.students), 0)
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load courses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateCourse = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price || 0),
        students: Number(form.students || 0),
        rating: Number(form.rating || 0),
        status: form.status || 'draft',
        createdAt: new Date().toISOString()
      } as DocumentData;
      await addDoc(collection(db, 'courses'), payload);
      setForm({ title: '', description: '', price: 0, students: 0, rating: 0, status: 'draft', category: '' });
      setIsCreateOpen(false);
      await fetchCourses();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to create course', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = (c: Course) => {
    setEditingCourse(c);
    setForm({ ...c });
    setIsEditOpen(true);
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price || 0),
        students: Number(form.students || 0),
        rating: Number(form.rating || 0),
        status: form.status || 'draft'
      } as DocumentData;
      await updateDoc(doc(db, 'courses', editingCourse.id), payload);
      setIsEditOpen(false);
      setEditingCourse(null);
      setForm({ title: '', description: '', price: 0, students: 0, rating: 0, status: 'draft', category: '' });
      await fetchCourses();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to update course', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Delete this course?')) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'courses', id));
      await fetchCourses();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete course', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return variants[status as keyof typeof variants] || variants.draft;
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6 ml-8 lg:ml-16">
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-300">Loading courses...</div>
        </div>
      </div>
    );
  }

  return (
  <div className="space-y-6 ml-72">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Courses Management
          </h1>
          <p className="text-slate-400 mt-1">Manage your trading courses and track performance</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add New Course
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Create Course</DialogTitle>
              <DialogDescription className="text-slate-400">Add a new course to the platform</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full p-2 bg-slate-700/50 border border-slate-600 text-white rounded" />
              </div>
              <div>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full p-2 bg-slate-700/50 border border-slate-600 text-white rounded" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder="Price" className="p-2 bg-slate-700/50 border border-slate-600 text-white rounded" />
                <input type="number" value={form.students} onChange={(e) => setForm({ ...form, students: Number(e.target.value) })} placeholder="Students" className="p-2 bg-slate-700/50 border border-slate-600 text-white rounded" />
                <input type="number" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} placeholder="Rating" className="p-2 bg-slate-700/50 border border-slate-600 text-white rounded" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateCourse}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Total Courses</p>
                <p className="text-2xl font-bold text-white">{stats.totalCourses}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Active Courses</p>
                <p className="text-2xl font-bold text-white">{stats.activeCourses}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Total Students</p>
                <p className="text-2xl font-bold text-white">{stats.totalStudents.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button variant="outline" className="bg-slate-800/50 border-slate-600 text-slate-300">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Courses Table */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Courses</CardTitle>
          <p className="text-sm text-slate-400">Manage and monitor your course offerings</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-800/50">
                  <TableHead className="text-slate-300">Course</TableHead>
                  <TableHead className="text-slate-300">Category</TableHead>
                  <TableHead className="text-slate-300">Price</TableHead>
                  <TableHead className="text-slate-300">Students</TableHead>
                  <TableHead className="text-slate-300">Rating</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id} className="border-slate-700 hover:bg-slate-800/30">
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">{course.title}</p>
                        <p className="text-sm text-slate-400 truncate max-w-xs">{course.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {course.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-green-400">${course.price}</TableCell>
                    <TableCell className="text-slate-300">{course.students.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-slate-300">{course.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusBadge(course.status)} border`}>
                        {course.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={() => handleEditCourse(course)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-400" onClick={() => handleDeleteCourse(course.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Course</DialogTitle>
            <DialogDescription className="text-slate-400">Update course details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full p-2 bg-slate-700/50 border border-slate-600 text-white rounded" />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full p-2 bg-slate-700/50 border border-slate-600 text-white rounded" />
            <div className="grid grid-cols-3 gap-2">
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder="Price" className="p-2 bg-slate-700/50 border border-slate-600 text-white rounded" />
              <input type="number" value={form.students} onChange={(e) => setForm({ ...form, students: Number(e.target.value) })} placeholder="Students" className="p-2 bg-slate-700/50 border border-slate-600 text-white rounded" />
              <input type="number" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} placeholder="Rating" className="p-2 bg-slate-700/50 border border-slate-600 text-white rounded" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateCourse}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
