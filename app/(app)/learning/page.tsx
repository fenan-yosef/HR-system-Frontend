"use client";

import { motion } from "framer-motion";
import { BookOpen, PlayCircle, Award, Clock, Star, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LearningPage() {
  return (
    <section className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Learning & Development</h1>
          <p className="text-muted-foreground">Expand your skills with our curated course library.</p>
        </div>
        <div className="relative w-full md:w-96">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
           <Input placeholder="Search courses, skills, topics..." className="pl-10" />
        </div>
      </div>

      {/* Hero: Continue Learning */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
         <Card className="p-0 border-none shadow-sm overflow-hidden bg-gradient-to-r from-primary to-primary/80 text-primary-foreground relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <BookOpen className="size-64" />
            </div>
            <div className="p-8 md:p-12 relative z-10 grid md:grid-cols-2 gap-8 items-center">
               <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
                     <Clock className="size-3" /> In Progress
                  </div>
                  <h2 className="text-3xl font-black">Advanced React Patterns</h2>
                  <p className="opacity-90 leading-relaxed max-w-md">Master the latest features in React 19, including Server Components, Actions, and enhanced Hooks.</p>
                  
                  <div className="space-y-2 pt-4">
                     <div className="flex justify-between text-xs font-bold uppercase tracking-wider opacity-80">
                        <span>Progress</span>
                        <span>65%</span>
                     </div>
                     <div className="h-2 w-full bg-background/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white w-[65%]" />
                     </div>
                  </div>

                  <button className="mt-6 flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all">
                     <PlayCircle className="size-5" /> Resume Course
                  </button>
               </div>
               
               <div className="hidden md:flex justify-end">
                   {/* Placeholder for course content/preview */}
                   <div className="w-64 aspect-video bg-background/10 backdrop-blur-sm rounded-lg border border-white/20 flex items-center justify-center">
                      <PlayCircle className="size-16 opacity-50" />
                   </div>
               </div>
            </div>
         </Card>
      </motion.div>

      {/* Categories */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
         {["All Courses", "Engineering", "Design", "Management", "Soft Skills", "Compliance"].map((cat, i) => (
            <button 
               key={i} 
               className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border transition-colors ${i === 0 ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-muted-foreground hover:bg-muted'}`}
            >
               {cat}
            </button>
         ))}
      </div>

      {/* Course Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         {[
            { title: "UI/UX Fundamentals", author: "Design Team", duration: "4h 30m", rating: 4.8, students: 120, image: "bg-purple-500", progress: 0 },
            { title: "Cybersecurity Basics", author: "IT Security", duration: "2h 15m", rating: 4.5, students: 350, image: "bg-blue-500", progress: 100 },
            { title: "Leadership 101", author: "HR Dept", duration: "6h 00m", rating: 4.9, students: 85, image: "bg-emerald-500", progress: 30 },
            { title: "Next.js App Router", author: "Engineering", duration: "8h 45m", rating: 5.0, students: 200, image: "bg-indigo-500", progress: 0 },
            { title: "Agile Methodologies", author: "Product", duration: "3h 20m", rating: 4.6, students: 150, image: "bg-orange-500", progress: 0 },
            { title: "Effective Communication", author: "HR Dept", duration: "1h 30m", rating: 4.7, students: 400, image: "bg-pink-500", progress: 0 },
         ].map((course, i) => (
            <motion.div
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
            >
               <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all h-full flex flex-col">
                  <div className={`h-40 ${course.image} relative flex items-center justify-center`}>
                     <PlayCircle className="size-12 text-white opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100" />
                     {course.progress > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                           <div className="h-full bg-white" style={{ width: `${course.progress}%` }} />
                        </div>
                     )}
                     {course.progress === 100 && (
                        <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                           <Award className="size-3" /> Completed
                        </div>
                     )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                     <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">{course.author}</span>
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                           <Star className="size-3 fill-current" /> {course.rating}
                        </div>
                     </div>
                     <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                     
                     <div className="mt-auto pt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                           <Clock className="size-3" /> {course.duration}
                        </div>
                        <div>
                           {course.students} enrolled
                        </div>
                     </div>
                  </div>
               </Card>
            </motion.div>
         ))}
      </div>
    </section>
  );
}
