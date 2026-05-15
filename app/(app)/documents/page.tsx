"use client";

import { motion } from "framer-motion";
import {
  Folder,
  FileText,
  Upload,
  MoreVertical,
  Search,
  Image as ImageIcon,
  FileSpreadsheet,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function DocumentsPage() {
  return (
    <section className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Securely store and manage your personal and work files.
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Search files..." className="pl-10" />
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all whitespace-nowrap">
            <Upload className="size-4" /> Upload
          </button>
        </div>
      </div>

      {/* Storage Status */}
      <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-xl border border-border/50">
        <div className="flex-1">
          <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wide">
            <span>Storage Used</span>
            <span>3.2 GB / 10 GB</span>
          </div>
          <div className="h-2 w-full bg-background rounded-full overflow-hidden">
            <div className="h-full bg-linear-to-r from-blue-500 to-purple-500 w-[32%]" />
          </div>
        </div>
        <button className="text-xs font-bold text-primary hover:underline">
          Upgrade Plan
        </button>
      </div>

      {/* Folders */}
      <div>
        <h3 className="text-lg font-bold mb-4">Folders</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[
            {
              name: "Contracts",
              items: 12,
              color: "text-blue-500",
              bg: "bg-blue-500/10",
            },
            {
              name: "Tax Forms",
              items: 4,
              color: "text-emerald-500",
              bg: "bg-emerald-500/10",
            },
            {
              name: "Personal",
              items: 28,
              color: "text-purple-500",
              bg: "bg-purple-500/10",
            },
            {
              name: "Policies",
              items: 8,
              color: "text-amber-500",
              bg: "bg-amber-500/10",
            },
            {
              name: "Project X",
              items: 15,
              color: "text-pink-500",
              bg: "bg-pink-500/10",
            },
          ].map((folder, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-4 border-none shadow-sm hover:shadow-md transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2.5 rounded-lg ${folder.bg}`}>
                    <Folder className={`size-6 ${folder.color} fill-current`} />
                  </div>
                  <button className="text-muted-foreground hover:text-foreground">
                    <MoreVertical className="size-4" />
                  </button>
                </div>
                <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">
                  {folder.name}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {folder.items} files
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Files */}
      <div>
        <h3 className="text-lg font-bold mb-4">Recent Files</h3>
        <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-xs font-bold uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Date Uploaded</th>
                <th className="px-6 py-4">Size</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {[
                {
                  name: "Employment_Contract.pdf",
                  type: "pdf",
                  date: "Jan 12, 2024",
                  size: "2.4 MB",
                  icon: FileText,
                  color: "text-red-500",
                },
                {
                  name: "Q4_Performance_Review.docx",
                  type: "doc",
                  date: "Dec 20, 2023",
                  size: "1.0 MB",
                  icon: FileText,
                  color: "text-blue-500",
                },
                {
                  name: "Team_Lunch_Receipt.jpg",
                  type: "img",
                  date: "Feb 02, 2024",
                  size: "4.5 MB",
                  icon: ImageIcon,
                  color: "text-purple-500",
                },
                {
                  name: "Salary_Projection_2024.xlsx",
                  type: "sheet",
                  date: "Jan 05, 2024",
                  size: "1.2 MB",
                  icon: FileSpreadsheet,
                  color: "text-emerald-500",
                },
                {
                  name: "Onboarding_Checklist.pdf",
                  type: "pdf",
                  date: "Jan 02, 2024",
                  size: "0.5 MB",
                  icon: FileText,
                  color: "text-red-500",
                },
              ].map((file, i) => (
                <tr
                  key={i}
                  className="hover:bg-muted/30 transition-colors group"
                >
                  <td className="px-6 py-4 font-medium flex items-center gap-3">
                    <div className="bg-muted p-2 rounded-lg group-hover:bg-white transition-colors border border-transparent group-hover:border-border/50">
                      <file.icon className={`size-5 ${file.color}`} />
                    </div>
                    <span className="group-hover:text-primary transition-colors">
                      {file.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {file.date}
                  </td>
                  <td className="px-6 py-4 tabular-nums text-muted-foreground">
                    {file.size}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-muted rounded-full transition-colors">
                      <MoreVertical className="size-4 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
