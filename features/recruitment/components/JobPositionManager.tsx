"use client";

import { useEffect, useState } from "react";
import {
  JobPosition,
  CreateJobPosition,
  Department,
  type JobStatus,
} from "@/types/recruitment";
import {
  fetchJobPositions,
  createJobPosition,
  fetchDepartments,
} from "@/services/recruitmentService";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Plus,
  X,
  Calendar,
  Building2,
  MoreVertical,
  Activity,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function JobPositionManager() {
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getToday = () => new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState<CreateJobPosition>({
    title: "",
    department: 0,
    description: "",
    status: "open",
    posted_date: getToday(),
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoading(true);
      const [posResponse, deptResponse] = await Promise.all([
        fetchJobPositions(),
        fetchDepartments(),
      ]);
      setPositions(posResponse.results);
      setDepartments(deptResponse.results);

      // Set default department if none selected
      if (deptResponse.results.length > 0) {
        setFormData((prev) => ({
          ...prev,
          department: deptResponse.results[0].department_id,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch recruitment data", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadPositions() {
    try {
      const response = await fetchJobPositions();
      setPositions(response.results);
    } catch (error) {
      console.error("Failed to fetch job positions", error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      // Ensure posted_date is always today's date when sending
      await createJobPosition({
        ...formData,
        posted_date: getToday(),
      });
      setIsModalOpen(false);
      loadPositions();
      setFormData({
        title: "",
        department: departments[0]?.department_id || 0,
        description: "",
        status: "open",
        posted_date: getToday(),
      });
    } catch (error) {
      console.error("Failed to create job position", error);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "closed":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "on_hold":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "cancelled":
        return "bg-gray-200/60 text-red-700 border-red-200/40";
      default:
        return "bg-muted/10 text-muted-foreground border-border/20";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <Activity className="size-6 text-primary" />
          Live Roles
        </h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="size-4" />
          Create New Position
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-muted-foreground font-medium italic">
          Fetching recruitment pipeline...
        </div>
      ) : (
        <div className="grid gap-4">
          {positions.length === 0 ? (
            <div className="text-center p-12 bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
              <p className="text-muted-foreground font-medium">
                No job positions found. Start by creating one.
              </p>
            </div>
          ) : (
            positions.map((pos, i) => (
              <motion.div
                key={pos.position_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="group relative overflow-hidden flex items-center justify-between p-6 border-none shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="flex items-center gap-6">
                    <div className="bg-linear-to-br from-primary/10 to-primary/5 p-4 rounded-2xl group-hover:from-primary group-hover:to-primary/80 group-hover:text-white transition-all duration-300">
                      <Briefcase className="size-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-black text-xl tracking-tight text-foreground transition-colors group-hover:text-primary">
                          {pos.title}
                        </h4>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(pos.status)}`}
                        >
                          {pos.status
                            .replace(/_/g, " ")
                            .replace(/(^|\s)\S/g, (t) => t.toUpperCase())}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 mt-3">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          <Building2 className="size-3.5" />{" "}
                          {departments.find(
                            (d) => d.department_id === pos.department,
                          )?.name || `Dept #${pos.department}`}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          <Calendar className="size-3.5" /> Posted{" "}
                          {new Date(pos.posted_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <button className="hidden md:flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest hover:underline">
                      View details <MoreVertical className="size-3" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-card p-0 shadow-2xl border border-border"
            >
              <div className="flex items-center justify-between p-6 border-b border-border/50 bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="bg-primary p-2 rounded-xl text-white">
                    <Plus className="size-5" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight">
                    New Job Position
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full p-2 hover:bg-muted transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      Position Title
                    </Label>
                    <Input
                      required
                      placeholder="e.g. Lead Frontend Engineer"
                      className="rounded-xl border-border/50 focus:ring-primary/20 h-12 text-base font-medium"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                        Department
                      </Label>
                      <select
                        required
                        className="w-full rounded-xl border border-border/50 bg-background h-12 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                        value={formData.department}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            department: parseInt(e.target.value),
                          })
                        }
                      >
                        <option value="" disabled>
                          Select Department
                        </option>
                        {departments.map((dept) => (
                          <option
                            key={dept.department_id}
                            value={dept.department_id}
                          >
                            {dept.name} ({dept.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                        Status
                      </Label>
                      <select
                        required
                        className="w-full rounded-xl border border-border/50 bg-background h-12 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status: e.target.value as JobStatus,
                          })
                        }
                      >
                        <option value="open">Open</option>
                        <option value="on_hold">On Hold</option>
                        <option value="closed">Closed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      Description
                    </Label>
                    <textarea
                      placeholder="Describe the role responsibilities..."
                      className="w-full rounded-xl border border-border/50 p-4 focus:ring-2 focus:ring-primary/20 focus:outline-none min-h-30 text-base font-medium transition-all"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 rounded-xl bg-muted px-4 py-4 text-sm font-black uppercase tracking-widest text-muted-foreground hover:bg-muted/80 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-2 rounded-xl bg-primary px-4 py-4 text-sm font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-98 transition-all"
                  >
                    Confirm & Publish
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
