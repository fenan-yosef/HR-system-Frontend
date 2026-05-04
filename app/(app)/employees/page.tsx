"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, MoreHorizontal, Users,
  LayoutGrid, List, Trash2, Edit2,
  UserCircle2, Mail, Phone, Briefcase,
  Calendar, Hash, Check, X, Loader2,
  Building2, Search, Filter, ShieldCheck,
  UserCheck2,
  UserCog
} from "lucide-react";
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
  updateEmployee, deleteEmployee
} from "@/services/employeeService";
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
    <section className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-8 rounded-3xl border border-border/50 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 size-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors" />

        <div className="space-y-2 relative">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Users className="size-5" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              Employee Directory
            </h1>
          </div>
          <p className="text-muted-foreground max-w-md">
            Manage your global workforce, track employment status and departmental assignments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 relative">
          <div className="relative group/search">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within/search:text-primary transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employees..."
              className="pl-12 h-12 w-full md:w-64 rounded-2xl bg-muted/50 border-none text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium"
            />
          </div>

          <div className="bg-muted/50 p-1.5 rounded-2xl flex items-center gap-1.5 border border-border/50">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon-sm"
              onClick={() => toggleViewMode("grid")}
              className={cn("rounded-xl transition-all", viewMode === "grid" && "shadow-sm")}
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="icon-sm"
              onClick={() => toggleViewMode("table")}
              className={cn("rounded-xl transition-all", viewMode === "table" && "shadow-sm")}
            >
              <List className="size-4" />
            </Button>
          </div>

          <Button
            onClick={openAddModal}
            className="h-12 px-8 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all gap-2"
          >
            <Plus className="size-5" />
            Hire Talent
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-72 rounded-3xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border border-dashed border-border/50">
          <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <UserCircle2 className="size-10 text-muted-foreground/30" />
          </div>
          <h3 className="text-xl font-bold">No Employees Found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or start a new search.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filteredEmployees.map((emp, i) => (
              <motion.div
                key={emp.employee_id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
              >
                <Card className="group p-6 border-none shadow-sm hover:shadow-xl transition-all relative overflow-hidden bg-white dark:bg-card">
                  <div className="absolute top-0 right-0 p-3">
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEditModal(emp)}
                        className="rounded-lg hover:bg-primary/10 hover:text-primary"
                      >
                        <Edit2 className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(emp)}
                        className="rounded-lg hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="size-24 rounded-[3rem] bg-gradient-to-br from-primary/10 to-primary/5 mb-6 flex items-center justify-center text-primary shadow-sm group-hover:rotate-6 transition-transform duration-500 border-4 border-background relative overflow-hidden">
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="text-3xl font-black relative z-10">
                        {emp.first_name[0]}{emp.last_name[0]}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-xl mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                      {emp.first_name} {emp.last_name}
                    </h3>
                    <p className="text-xs font-bold text-muted-foreground/60 mb-6 uppercase tracking-wider">
                      {emp.position || "NO POSITION"}
                    </p>

                    <div className="w-full space-y-3">
                      <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-muted/30 border border-border/40">
                        <div className="flex items-center gap-2 text-muted-foreground font-bold">
                          <Building2 className="size-3.5" />
                          {getDeptName(emp.department)}
                        </div>
                        <div className={cn(
                          "px-2 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-tighter",
                          getStatusColor(emp.status)
                        )}>
                          {humanize(emp.status)}
                        </div>
                      </div>

                      <div className="space-y-2 rounded-xl border border-border/40 bg-muted/20 p-3">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <span>Account Completion</span>
                          <span className={cn("rounded-full border px-2 py-0.5", getCompletionTone(emp.onboarding_completion))}>
                            {getCompletionLabel(emp.onboarding_completion)}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-background/70">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${Math.max(0, Math.min(100, emp.onboarding_completion || 0))}%` }}
                          />
                        </div>
                        <p className="text-[10px] leading-relaxed text-muted-foreground" title={getMissingFields(emp)}>
                          {getMissingFields(emp)}
                        </p>
                      </div>

                      <div className="w-full flex items-center justify-center gap-2 pt-2 px-6">
                        <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                        <Users className="size-3.5 text-muted-foreground/30" />
                        <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border/50">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Employee</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Department</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Completion</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.employee_id} className="group hover:bg-muted/20 border-b border-border/50 last:border-none transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs border border-primary/5">
                        {emp.first_name[0]}{emp.last_name[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold group-hover:text-primary transition-colors">
                          {emp.first_name} {emp.last_name}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                          {emp.position}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-sm text-muted-foreground">{getDeptName(emp.department)}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold uppercase tracking-tight text-muted-foreground">
                    {humanize(emp.employment_type)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 min-w-[160px]">
                      <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.max(0, Math.min(100, emp.onboarding_completion || 0))}%` }}
                        />
                      </div>
                      <span className={cn("text-[10px] font-black uppercase tracking-widest rounded-full border px-2 py-1", getCompletionTone(emp.onboarding_completion))}>
                        {getCompletionLabel(emp.onboarding_completion)}
                      </span>
                    </div>
                    <div className="mt-1 text-[10px] font-medium text-muted-foreground" title={getMissingFields(emp)}>
                      {getMissingFields(emp)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase transition-colors tracking-tighter",
                      getStatusColor(emp.status)
                    )}>
                      {humanize(emp.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEditModal(emp)}
                        className="rounded-lg hover:bg-primary/10 hover:text-primary"
                      >
                        <Edit2 className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(emp)}
                        className="rounded-lg hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Unified Hire/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden">
          <form onSubmit={handleSave}>
            <div className="p-10 space-y-8 bg-card max-h-[85vh] overflow-y-auto custom-scrollbar">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <UserCog className="size-5" />
                  </div>
                  <DialogTitle className="text-3xl font-black tracking-tight">
                    {editingEmployee ? "Refine Associate" : "Hire Associate"}
                  </DialogTitle>
                </div>
                <DialogDescription className="font-medium opacity-70">
                  {editingEmployee
                    ? `Fine-tuning the profile details for ${editingEmployee.first_name}.`
                    : "Add a new talented professional to your organization's roster."}
                </DialogDescription>
              </DialogHeader>

              <FieldGroup className="gap-8">
                <div className="grid grid-cols-2 gap-6">
                  <Field>
                    <FieldLabel className="text-[10px] uppercase font-black tracking-widest opacity-60">First Name</FieldLabel>
                    <Input
                      value={formData.first_name}
                      onChange={e => setFormData(p => ({ ...p, first_name: e.target.value }))}
                      required
                      className="h-12 rounded-2xl bg-muted/50 border-none transition-all focus-visible:ring-primary/20 font-bold"
                    />
                  </Field>
                  <Field>
                    <FieldLabel className="text-[10px] uppercase font-black tracking-widest opacity-60">Last Name</FieldLabel>
                    <Input
                      value={formData.last_name}
                      onChange={e => setFormData(p => ({ ...p, last_name: e.target.value }))}
                      required
                      className="h-12 rounded-2xl bg-muted/50 border-none transition-all focus-visible:ring-primary/20 font-bold"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <Field>
                    <FieldLabel className="text-[10px] uppercase font-black tracking-widest opacity-60">Corporate Email</FieldLabel>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      required
                      className="h-12 rounded-2xl bg-muted/50 border-none transition-all focus-visible:ring-primary/20 font-bold"
                    />
                  </Field>
                  <Field>
                    <FieldLabel className="text-[10px] uppercase font-black tracking-widest opacity-60">Mobile Number</FieldLabel>
                    <Input
                      value={formData.phone}
                      onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                      className="h-12 rounded-2xl bg-muted/50 border-none transition-all focus-visible:ring-primary/20 font-bold"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <Field className="col-span-2">
                    <FieldLabel className="text-[10px] uppercase font-black tracking-widest opacity-60">Role / Position</FieldLabel>
                    <Input
                      value={formData.position}
                      onChange={e => setFormData(p => ({ ...p, position: e.target.value }))}
                      placeholder="e.g. Senior Backend Engineer"
                      className="h-12 rounded-2xl bg-muted/50 border-none transition-all focus-visible:ring-primary/20 font-bold"
                    />
                  </Field>
                  <Field>
                    <FieldLabel className="text-[10px] uppercase font-black tracking-widest opacity-60">Dept Assignment</FieldLabel>
                    <select
                      value={formData.department || ""}
                      onChange={e => setFormData(p => ({ ...p, department: e.target.value ? Number(e.target.value) : null }))}
                      className="h-12 rounded-2xl bg-muted/50 border-none transition-all focus-visible:ring-2 focus-visible:ring-primary/20 font-bold px-4 appearance-none outline-none"
                    >
                      <option value="">Unassigned</option>
                      {departments.map(d => (
                        <option key={d.department_id} value={d.department_id}>{d.name}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <Field>
                    <FieldLabel className="text-[10px] uppercase font-black tracking-widest opacity-60">Contract Status</FieldLabel>
                    <select
                      value={formData.employment_type}
                      onChange={e => setFormData(p => ({ ...p, employment_type: e.target.value as EmploymentType }))}
                      className="h-12 rounded-2xl bg-muted/50 border-none transition-all focus-visible:ring-2 focus-visible:ring-primary/20 font-bold px-4 appearance-none outline-none uppercase text-xs tracking-tighter"
                    >
                      {EMPLOYMENT_TYPES.map(type => (
                        <option key={type} value={type}>{humanize(type)}</option>
                      ))}
                    </select>
                  </Field>
                  <Field>
                    <FieldLabel className="text-[10px] uppercase font-black tracking-widest opacity-60">Lifecycle Status</FieldLabel>
                    <select
                      value={formData.status}
                      onChange={e => setFormData(p => ({ ...p, status: e.target.value as EmployeeStatus }))}
                      className="h-12 rounded-2xl bg-muted/50 border-none transition-all focus-visible:ring-2 focus-visible:ring-primary/20 font-bold px-4 appearance-none outline-none uppercase text-xs tracking-tighter"
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{humanize(opt)}</option>
                      ))}
                    </select>
                  </Field>
                  <Field>
                    <FieldLabel className="text-[10px] uppercase font-black tracking-widest opacity-60">Official Start Date</FieldLabel>
                    <Input
                      type="date"
                      value={formData.hire_date}
                      onChange={e => setFormData(p => ({ ...p, hire_date: e.target.value }))}
                      required
                      className="h-12 rounded-2xl bg-muted/50 border-none transition-all focus-visible:ring-primary/20 font-bold"
                    />
                  </Field>
                </div>
              </FieldGroup>
            </div>

            <DialogFooter className="p-10 pt-0 bg-card">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                className="rounded-2xl font-bold h-14 px-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={modalLoading}
                className="rounded-2xl font-black h-14 px-12 shadow-xl shadow-primary/20"
              >
                {modalLoading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : editingEmployee ? (
                  "Finalize Adjustments"
                ) : (
                  "Initiate Onboarding"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
