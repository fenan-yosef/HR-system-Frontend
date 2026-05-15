"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, MoreHorizontal, Users,
  LayoutGrid, List, Trash2, Edit2,
  UserCircle2, Mail, Phone, Briefcase,
  Calendar, Hash, Check, X, Loader2,
  Building2, Search, Filter, ShieldCheck,
  UserCheck2,
  UserCog, Key
} from "lucide-react";
import { getMediaUrl } from "@/services/apiClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import {
  Field, FieldLabel, FieldGroup
} from "@/components/ui/field";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Employee, EmploymentType, EmployeeStatus
} from "@/types/employee";
import { Department } from "@/types/department";
import {
  fetchAllEmployees, createEmployee,
  updateEmployee, deleteEmployee,
  resendCredentials
} from "@/services/employeeService";
import { uploadProfileImage } from "@/services/uploadService";
import { fetchDepartmentsAll } from "@/services/departmentService";
import { cn } from "@/lib/utils";

const EMPLOYMENT_TYPES: EmploymentType[] = ["full_time", "contract", "intern", "part_time"];
const STATUS_OPTIONS: EmployeeStatus[] = ["active", "on_leave", "suspended", "terminated"];

function humanize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function getCompletionTone(completion: number) {
  if (completion >= 100) return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
  if (completion >= 80) return "bg-amber-500/10 text-amber-700 border-amber-500/20";
  return "bg-rose-500/10 text-rose-700 border-rose-500/20";
}

function getMissingFields(employee: Employee) {
  const fields = employee.onboarding_data?.completion_missing_fields;
  if (!Array.isArray(fields) || fields.length === 0) return "All tracked fields completed";
  return `Missing: ${fields.join(", ")}`;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    position: "",
    department: null as number | null,
    employment_type: "full_time" as EmploymentType,
    status: "active" as EmployeeStatus,
    hire_date: new Date().toISOString().split('T')[0]
  });

  // Load preference from cache
  useEffect(() => {
    const savedMode = localStorage.getItem("employees_view_mode") as "grid" | "table";
    if (savedMode) setViewMode(savedMode);
  }, []);

  const toggleViewMode = (mode: "grid" | "table") => {
    setViewMode(mode);
    localStorage.setItem("employees_view_mode", mode);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [empRes, deptRes] = await Promise.all([
        fetchAllEmployees(),
        fetchDepartmentsAll()
      ]);
      setEmployees(empRes);
      setDepartments(deptRes.results);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredEmployees = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return employees.filter(emp =>
      emp.first_name.toLowerCase().includes(q) ||
      emp.last_name.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.position?.toLowerCase().includes(q)
    );
  }, [employees, searchQuery]);

  const openAddModal = () => {
    setEditingEmployee(null);
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      position: "",
      department: null,
      employment_type: "full_time",
      status: "active",
      hire_date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email,
      phone: emp.phone || "",
      position: emp.position || "",
      department: emp.department || null,
      employment_type: emp.employment_type,
      status: emp.status,
      hire_date: emp.hire_date
    });
    setIsModalOpen(true);
  };

  const handleUploadAndSetPhoto = async (emp: Employee) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const f = input.files && input.files[0];
      if (!f) return;
      try {
        const res = await uploadProfileImage(f);
        let url = "";
        if (res.file_url) url = res.file_url;
        else if (res.upload_id) url = `${window.location.origin}/api/media/document:${res.upload_id}`;
        const newOnboarding = { ...(emp.onboarding_data || {}), profile_photo_url: url };
        const updated = await updateEmployee(emp.employee_id, { onboarding_data: newOnboarding } as any);
        setEmployees(prev => prev.map(e => e.employee_id === updated.employee_id ? updated : e));
      } catch (err) {
        console.error("Failed to upload/set photo", err);
        alert("Upload failed");
      }
    };
    input.click();
  };

  const handleRemovePhoto = async (emp: Employee) => {
    if (!confirm("Remove profile photo?")) return;
    try {
      const newOnboarding = { ...(emp.onboarding_data || {}) };
      delete newOnboarding.profile_photo_url;
      const updated = await updateEmployee(emp.employee_id, { onboarding_data: newOnboarding } as any);
      setEmployees(prev => prev.map(e => e.employee_id === updated.employee_id ? updated : e));
    } catch (err) {
      console.error("Failed to remove photo", err);
      alert("Could not remove photo");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (editingEmployee) {
        const updated = await updateEmployee(editingEmployee.employee_id, formData as any);
        setEmployees(prev => prev.map(emp => emp.employee_id === updated.employee_id ? updated : emp));
      } else {
        const created = await createEmployee(formData as any);
        setEmployees(prev => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      alert(error.message || "Failed to save employee");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (emp: Employee) => {
    if (!confirm(`Are you sure you want to delete ${emp.first_name} ${emp.last_name}? This action cannot be undone.`)) return;
    try {
      await deleteEmployee(emp.employee_id);
      setEmployees(prev => prev.filter(e => e.employee_id !== emp.employee_id));
    } catch (error: any) {
      alert(error.message || "Failed to delete employee");
    }
  };

  const handleResendCredentials = async (emp: Employee) => {
    if (!confirm(`Are you sure you want to resend credentials to ${emp.first_name} ${emp.last_name}? This will generate a new password and email it to ${emp.email}.`)) return;
    try {
      await resendCredentials(emp.employee_id);
      alert("Credentials resent successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to resend credentials");
    }
  };

  const getDeptName = (id?: number | null) => {
    if (!id) return "Unassigned";
    return departments.find(d => d.department_id === id)?.name || "Unknown";
  };

  const getStatusColor = (status: EmployeeStatus) => {
    switch (status) {
      case "active": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "on_leave": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "suspended": return "bg-rose-500/10 text-rose-600 border-rose-500/20";
      case "terminated": return "bg-slate-500/10 text-slate-600 border-slate-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getCompletionLabel = (completion?: number) => {
    const value = Math.max(0, Math.min(100, Math.round(completion || 0)));
    return `${value}%`;
  };

  return (
    <section className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">
            People Directory
          </h1>
          <p className="text-muted-foreground">
            Manage your organization&apos;s most valuable asset.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search people..."
              className="pl-10 h-10 w-64 rounded-xl bg-card border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button className="p-2.5 bg-card border border-border/50 rounded-xl hover:bg-muted transition-colors">
            <Filter className="size-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-6 border-none shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <button className="p-1 hover:bg-muted rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="size-4 text-muted-foreground" />
                </button>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="size-20 rounded-full bg-linear-to-br from-primary/20 to-primary/5 mb-4 flex items-center justify-center text-2xl font-bold text-primary border-4 border-background shadow-sm">
                  JD
                </div>
                <h3 className="font-bold text-lg">John Doe</h3>
                <p className="text-xs font-medium text-primary bg-primary/5 px-2 py-1 rounded-md mt-1 mb-4">
                  Senior Designer
                </p>

                <div className="flex items-center justify-center gap-3 w-full">
                  <button className="flex-1 py-2 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground">
                    <Mail className="size-3.5" /> Email
                  </button>
                  <button className="flex-1 py-2 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground">
                    <Phone className="size-3.5" /> Call
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
