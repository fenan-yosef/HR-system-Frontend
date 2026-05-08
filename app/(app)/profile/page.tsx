"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Link as LinkIcon,
  Calendar,
  Building,
  Briefcase,
} from "lucide-react";
import { Card } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <section className="space-y-8">
      {/* Header Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="h-48 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl w-full" />
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start -mt-16">
            <div className="size-32 rounded-2xl bg-muted border-4 border-background shadow-xl flex items-center justify-center text-4xl overflow-hidden relative group">
              <Image
                src="https://github.com/shadcn.png"
                alt="Profile"
                fill
                sizes="128px"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex-1 mt-16 md:mt-20">
              <h1 className="text-3xl font-black text-foreground">John Doe</h1>
              <p className="text-muted-foreground font-medium">
                Senior Frontend Engineer at Tech Corp
              </p>
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" /> San Francisco, CA
                </span>
                <span className="flex items-center gap-1.5">
                  <Building className="size-4" /> Engineering Team
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-4" /> Joined Jan 2024
                </span>
              </div>
            </div>
            <div className="mt-16 md:mt-20 flex gap-3">
              <button className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                Edit Profile
              </button>
              <button className="px-4 py-2 bg-muted text-foreground font-bold rounded-lg hover:bg-muted/80 transition-colors">
                Share
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <Card className="p-6 border-none shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="bg-muted p-2 rounded-lg">
                    <Mail className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">john.doe@example.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="bg-muted p-2 rounded-lg">
                    <Phone className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="bg-muted p-2 rounded-lg">
                    <LinkIcon className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Portfolio</p>
                    <p className="font-medium hover:text-primary cursor-pointer hover:underline">
                      johndoe.dev
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-border/50" />

            <div>
              <h3 className="font-bold text-lg mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "React",
                  "Next.js",
                  "TypeScript",
                  "Tailwind CSS",
                  "Node.js",
                  "GraphQL",
                  "Framer Motion",
                ].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-muted rounded-full text-xs font-bold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 border-none shadow-sm">
            <h3 className="font-bold text-lg mb-4">About Me</h3>
            <p className="text-muted-foreground leading-relaxed">
              Passionate Frontend Engineer with over 5 years of experience
              building scalable web applications. Specializing in the React
              ecosystem and modern CSS architectures. Committed to creating
              performant, accessible, and user-centric digital experiences.
              Always eager to learn new technologies and share knowledge with
              the community.
            </p>
          </Card>

          <Card className="p-6 border-none shadow-sm">
            <h3 className="font-bold text-lg mb-6">Experience</h3>
            <div className="space-y-8 relative">
              {/* Timeline Line */}
              <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-border/50" />

              {[
                {
                  role: "Senior Frontend Engineer",
                  company: "Tech Corp",
                  period: "2024 - Present",
                  description:
                    "Leading the frontend team in migrating legacy app to Next.js App Router.",
                },
                {
                  role: "Frontend Developer",
                  company: "Creative Agency",
                  period: "2021 - 2024",
                  description:
                    "Developed award-winning marketing sites and e-commerce platforms for global brands.",
                },
                {
                  role: "Junior Web Developer",
                  company: "Startup Inc",
                  period: "2019 - 2021",
                  description:
                    "Collaborated with designers to implement responsive UI components and landing pages.",
                },
              ].map((job, i) => (
                <div key={i} className="relative pl-10">
                  <div className="absolute left-0 top-1.5 size-7 bg-background border-2 border-primary rounded-full flex items-center justify-center z-10">
                    <Briefcase className="size-3 text-primary" />
                  </div>
                  <h4 className="font-bold text-foreground">{job.role}</h4>
                  <div className="text-sm font-semibold text-primary mb-1">
                    {job.company}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {job.period}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {job.description}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
