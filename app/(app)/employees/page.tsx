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

function getInitials(first: string, last: string) {
  return `${first[0] || ""}${last[0] || ""}`.toUpperCase();
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
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
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
        if (selectedEmployee && selectedEmployee.employee_id === emp.employee_id) {
          setSelectedEmployee(updated);
        }
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
      if (selectedEmployee && selectedEmployee.employee_id === emp.employee_id) {
        setSelectedEmployee(updated);
      }
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 w-64 rounded-xl bg-card border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
            <button
              onClick={() => toggleViewMode("grid")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewMode === "grid" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              title="Grid View"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => toggleViewMode("table")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewMode === "table" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              title="List View"
            >
              <List className="size-4" />
            </button>
          </div>

          <Button onClick={openAddModal} className="flex items-center gap-2 rounded-xl h-10">
            <Plus className="size-4" /> Add Employee
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-semibold">Loading directory...</p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border/60 rounded-2xl bg-card gap-2 text-center p-6">
          <Users className="size-10 text-muted-foreground/60 mb-2" />
          <h3 className="text-lg font-bold">No results found</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Try adjusting your search terms to find the employees you are looking for.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEmployees.map((emp) => {
            const initials = getInitials(emp.first_name, emp.last_name);
            const photoUrl = emp.onboarding_data?.profile_photo_url;
            const resolvedPhoto = photoUrl ? (getMediaUrl(photoUrl) || photoUrl) : null;

            return (
              <motion.div
                key={emp.employee_id}
                layoutId={`emp-card-${emp.employee_id}`}
                onClick={() => setSelectedEmployee(emp)}
                className="cursor-pointer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="p-6 border-none bg-card hover:bg-card/85 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between h-full">
                  <div className="absolute top-3 right-3 flex gap-1" onClick={e => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-opacity"
                      onClick={() => openEditModal(emp)}
                      title="Edit"
                    >
                      <Edit2 className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-opacity"
                      onClick={() => handleDelete(emp)}
                      title="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="size-20 rounded-full relative mb-4 flex items-center justify-center text-2xl font-bold border-4 border-background shadow-xs overflow-hidden bg-linear-to-br from-primary/20 to-primary/5 text-primary">
                      {resolvedPhoto ? (
                        <img
                          src={resolvedPhoto}
                          alt={`${emp.first_name} ${emp.last_name}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : initials}
                    </div>

                    <h3 className="font-bold text-lg leading-tight truncate max-w-full">
                      {emp.first_name} {emp.last_name}
                    </h3>
                    <p className="text-xs font-semibold text-primary/80 bg-primary/5 px-2 py-0.5 rounded-md mt-1 mb-2 max-w-full truncate">
                      {emp.position || "Staff Member"}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1 justify-center">
                      <Building2 className="size-3" /> {getDeptName(emp.department)}
                    </p>

                    <span className={cn("px-2.5 py-0.5 rounded-full text-xxs font-bold border capitalize mb-4 inline-block", getStatusColor(emp.status))}>
                      {humanize(emp.status)}
                    </span>
                  </div>

                  <div className="mt-auto space-y-3 pt-4 border-t border-border/40">
                    <div className="w-full space-y-1">
                      <div className="flex justify-between text-xxs font-semibold text-muted-foreground">
                        <span>Onboarding</span>
                        <span className={cn("px-1 py-0.2 rounded font-bold border scale-95", getCompletionTone(emp.onboarding_completion || 0))}>
                          {getCompletionLabel(emp.onboarding_completion)}
                        </span>
                      </div>
                      <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full transition-all duration-500" 
                          style={{ width: `${Math.max(0, Math.min(100, emp.onboarding_completion || 0))}%` }} 
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 w-full pt-1" onClick={e => e.stopPropagation()}>
                      <a
                        href={`mailto:${emp.email}`}
                        className="flex-1 py-2 rounded-lg bg-muted/40 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-center gap-1.5 text-xs font-bold text-muted-foreground"
                      >
                        <Mail className="size-3.5" /> Email
                      </a>
                      {emp.phone && (
                        <a
                          href={`tel:${emp.phone}`}
                          className="flex-1 py-2 rounded-lg bg-muted/40 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-center gap-1.5 text-xs font-bold text-muted-foreground"
                        >
                          <Phone className="size-3.5" /> Call
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/40 bg-card">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border/40 bg-muted/20 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <th className="p-4">Employee</th>
                <th className="p-4">Position</th>
                <th className="p-4">Department</th>
                <th className="p-4">Status</th>
                <th className="p-4">Onboarding</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-sm">
              {filteredEmployees.map((emp) => {
                const initials = getInitials(emp.first_name, emp.last_name);
                const photoUrl = emp.onboarding_data?.profile_photo_url;
                const resolvedPhoto = photoUrl ? (getMediaUrl(photoUrl) || photoUrl) : null;

                return (
                  <tr 
                    key={emp.employee_id} 
                    onClick={() => setSelectedEmployee(emp)}
                    className="hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    <td className="p-4 flex items-center gap-3">
                      <div className="size-10 rounded-full relative flex items-center justify-center text-sm font-bold border border-border shadow-xs overflow-hidden bg-linear-to-br from-primary/20 to-primary/5 text-primary">
                        {resolvedPhoto ? (
                          <img
                            src={resolvedPhoto}
                            alt={`${emp.first_name} ${emp.last_name}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : initials}
                      </div>
                      <div>
                        <div className="font-bold text-foreground">
                          {emp.first_name} {emp.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {emp.email}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-foreground">
                        {emp.position || "Staff Member"}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="size-3.5 text-muted-foreground" /> {getDeptName(emp.department)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={cn("px-2.5 py-0.5 rounded-full text-xxs font-bold border capitalize", getStatusColor(emp.status))}>
                        {humanize(emp.status)}
                      </span>
                    </td>
                    <td className="p-4 w-48">
                      <div className="space-y-1">
                        <span className={cn("px-1 py-0.2 rounded text-xxs font-bold border inline-block", getCompletionTone(emp.onboarding_completion || 0))}>
                          {getCompletionLabel(emp.onboarding_completion)}
                        </span>
                        <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                          <div 
                            className="bg-primary h-full rounded-full" 
                            style={{ width: `${Math.max(0, Math.min(100, emp.onboarding_completion || 0))}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                          onClick={() => openEditModal(emp)}
                          title="Edit"
                        >
                          <Edit2 className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(emp)}
                          title="Delete"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Employee Details Modal */}
      <Dialog open={!!selectedEmployee} onOpenChange={(open) => !open && setSelectedEmployee(null)}>
        {selectedEmployee && (
          <DialogContent className="max-w-xl p-0 overflow-hidden border-none rounded-2xl bg-card shadow-2xl">
            <div className="relative h-28 bg-linear-to-r from-primary/30 to-primary/10">
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="absolute top-4 right-4 p-2 bg-background/50 hover:bg-background/80 text-foreground rounded-full transition-colors backdrop-blur-md"
              >
                <X className="size-4" />
              </button>
            </div>
            
            <div className="px-8 pb-8 relative">
              {/* Profile Photo & Initials */}
              <div className="absolute -top-14 left-8 size-24 rounded-full border-4 border-card shadow-lg bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center text-3xl font-extrabold text-primary overflow-hidden">
                {selectedEmployee.onboarding_data?.profile_photo_url ? (
                  <img
                    src={getMediaUrl(selectedEmployee.onboarding_data.profile_photo_url) || selectedEmployee.onboarding_data.profile_photo_url}
                    alt={`${selectedEmployee.first_name} ${selectedEmployee.last_name}`}
                    className="w-full h-full object-cover"
                  />
                ) : getInitials(selectedEmployee.first_name, selectedEmployee.last_name)}
              </div>

              {/* Photo Upload Actions */}
              <div className="flex gap-2 justify-end pt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleUploadAndSetPhoto(selectedEmployee)}
                  className="text-xs h-8 rounded-lg"
                >
                  Change Photo
                </Button>
                {selectedEmployee.onboarding_data?.profile_photo_url && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemovePhoto(selectedEmployee)}
                    className="text-xs h-8 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg"
                  >
                    Remove
                  </Button>
                )}
              </div>

              {/* Name & Position */}
              <div className="mt-4 space-y-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-extrabold tracking-tight">
                    {selectedEmployee.first_name} {selectedEmployee.last_name}
                  </h2>
                  <span className={cn("px-2.5 py-0.5 rounded-full text-xxs font-bold border capitalize", getStatusColor(selectedEmployee.status))}>
                    {humanize(selectedEmployee.status)}
                  </span>
                </div>
                <p className="text-sm font-semibold text-primary">
                  {selectedEmployee.position || "Staff Member"} &bull; {humanize(selectedEmployee.employment_type)}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 pt-0.5">
                  <Building2 className="size-4" /> {getDeptName(selectedEmployee.department)}
                </p>
              </div>

              {/* Tabs / Info Blocks */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-muted/40 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <Mail className="size-3.5" /> Email Address
                  </div>
                  <a href={`mailto:${selectedEmployee.email}`} className="text-sm font-semibold hover:underline block truncate text-foreground">
                    {selectedEmployee.email}
                  </a>
                </div>

                <div className="p-4 bg-muted/40 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <Phone className="size-3.5" /> Phone Number
                  </div>
                  {selectedEmployee.phone ? (
                    <a href={`tel:${selectedEmployee.phone}`} className="text-sm font-semibold hover:underline block text-foreground">
                      {selectedEmployee.phone}
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Not provided</span>
                  )}
                </div>

                <div className="p-4 bg-muted/40 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <Calendar className="size-3.5" /> Hire Date
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {selectedEmployee.hire_date ? new Date(selectedEmployee.hire_date).toLocaleDateString(undefined, { dateStyle: 'medium' }) : "N/A"}
                  </span>
                </div>

                <div className="p-4 bg-muted/40 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <Hash className="size-3.5" /> Employee ID
                  </div>
                  <span className="text-sm font-mono font-bold text-foreground">
                    #{selectedEmployee.employee_id}
                  </span>
                </div>
              </div>

              {/* Onboarding Info */}
              <div className="mt-6 p-4 border border-border/40 rounded-xl space-y-3 bg-muted/10">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <UserCircle2 className="size-4 text-primary" /> Onboarding Status
                  </span>
                  <span className={cn("px-2 py-0.5 rounded text-xs font-bold border", getCompletionTone(selectedEmployee.onboarding_completion || 0))}>
                    {getCompletionLabel(selectedEmployee.onboarding_completion)} Completed
                  </span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.max(0, Math.min(100, selectedEmployee.onboarding_completion || 0))}%` }} 
                  />
                </div>
                <p className="text-xs text-muted-foreground bg-muted/20 p-2 rounded-lg italic">
                  {getMissingFields(selectedEmployee)}
                </p>
              </div>

              {/* Quick Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t border-border/40">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      openEditModal(selectedEmployee);
                      setSelectedEmployee(null);
                    }}
                    className="flex items-center gap-1.5 h-9 rounded-lg"
                  >
                    <Edit2 className="size-3.5" /> Edit Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleResendCredentials(selectedEmployee)}
                    className="flex items-center gap-1.5 h-9 rounded-lg"
                  >
                    <Key className="size-3.5" /> Resend Credentials
                  </Button>
                </div>
                
                <Button 
                  variant="destructive"
                  onClick={() => {
                    handleDelete(selectedEmployee);
                    setSelectedEmployee(null);
                  }}
                  className="flex items-center gap-1.5 h-9 rounded-lg bg-destructive hover:bg-destructive/90"
                >
                  <Trash2 className="size-3.5" /> Delete Employee
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Add / Edit Employee Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg rounded-2xl border-none shadow-2xl bg-card p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold tracking-tight">
              {editingEmployee ? "Edit Employee Profile" : "Add New Employee"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {editingEmployee 
                ? "Update the employee's direct information. Saving updates will apply changes immediately."
                : "Create a new employee profile. They will receive an email with their auto-generated password."
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">First Name</label>
                <Input
                  required
                  placeholder="e.g. John"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="h-10 rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Last Name</label>
                <Input
                  required
                  placeholder="e.g. Doe"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="h-10 rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
              <Input
                required
                type="email"
                placeholder="e.g. john.doe@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-10 rounded-lg"
                disabled={!!editingEmployee}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Phone Number</label>
                <Input
                  placeholder="e.g. +1 555-0199"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-10 rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Job Position</label>
                <Input
                  required
                  placeholder="e.g. Frontend Engineer"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="h-10 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Department</label>
                <select
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.department || ""}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value ? Number(e.target.value) : null })}
                >
                  <option value="">Unassigned</option>
                  {departments.map((dept) => (
                    <option key={dept.department_id} value={dept.department_id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Employment Type</label>
                <select
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.employment_type}
                  onChange={(e) => setFormData({ ...formData, employment_type: e.target.value as EmploymentType })}
                >
                  {EMPLOYMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {humanize(type)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Hire Date</label>
                <Input
                  required
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                  className="h-10 rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</label>
                <select
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as EmployeeStatus })}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {humanize(status)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter className="pt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="h-10 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={modalLoading}
                className="h-10 rounded-lg min-w-[100px] flex items-center justify-center gap-1.5"
              >
                {modalLoading && <Loader2 className="size-4 animate-spin" />}
                {editingEmployee ? "Save Changes" : "Create Profile"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
