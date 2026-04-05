"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, MoreHorizontal, Users, 
  LayoutGrid, List, Trash2, Edit2, 
  Building2, Hash, Check, X, Loader2
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
import { useEffect, useState, useMemo } from "react";
import { Department, ManagerDropdownItem } from "@/types/department";
import { 
  fetchDepartmentsAll, deleteDepartment, 
  createDepartment, updateDepartment, 
  fetchManagerDropdown 
} from "@/services/departmentService";
import { cn } from "@/lib/utils";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    manager: null as number | null
  });

  // Manager search
  const [managerQuery, setManagerQuery] = useState("");
  const [managers, setManagers] = useState<ManagerDropdownItem[]>([]);
  const [searchingManagers, setSearchingManagers] = useState(false);

  // Load preference from cache
  useEffect(() => {
    const savedMode = localStorage.getItem("departments_view_mode") as "grid" | "table";
    if (savedMode) setViewMode(savedMode);
  }, []);

  const toggleViewMode = (mode: "grid" | "table") => {
    setViewMode(mode);
    localStorage.setItem("departments_view_mode", mode);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const departmentsRes = await fetchDepartmentsAll();
      setDepartments(departmentsRes.results);
    } catch (error) {
      console.error("Failed to fetch departments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Manager dropdown search logic
  useEffect(() => {
    const search = async () => {
      setSearchingManagers(true);
      try {
        const results = await fetchManagerDropdown(managerQuery);
        
        // If the backend search is simple, we apply an additional regex filter on the frontend
        // to ensure name and position match precisely as requested.
        let filtered = results;
        if (managerQuery) {
          try {
            const regex = new RegExp(managerQuery, "i");
            filtered = results.filter(m => 
              regex.test(m.full_name) || 
              regex.test(m.position) || 
              regex.test(m.email)
            );
          } catch (e) {
            // If regex is invalid (e.g. trailing backslash), fallback to simple include
            filtered = results.filter(m => 
              m.full_name.toLowerCase().includes(managerQuery.toLowerCase()) ||
              m.position.toLowerCase().includes(managerQuery.toLowerCase())
            );
          }
        }
        
        setManagers(filtered);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setSearchingManagers(false);
      }
    };

    const timer = setTimeout(search, 200);
    return () => clearTimeout(timer);
  }, [managerQuery]);

  const openAddModal = () => {
    setEditingDept(null);
    setFormData({ name: "", code: "", manager: null });
    setManagerQuery("");
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setFormData({ 
      name: dept.name, 
      code: dept.code || "", 
      manager: dept.manager || null 
    });
    setManagerQuery(dept.manager_name || "");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (editingDept) {
        const updated = await updateDepartment(editingDept.department_id, formData);
        setDepartments(prev => prev.map(d => d.department_id === updated.department_id ? updated : d));
      } else {
        const created = await createDepartment(formData);
        setDepartments(prev => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      alert(error.message || "Failed to save department");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this department? This action will be blocked if active employees are assigned.")) return;
    try {
      await deleteDepartment(id);
      setDepartments(prev => prev.filter(d => d.department_id !== id));
    } catch (error: any) {
      alert(error.message || "Failed to delete department");
    }
  };

  return (
    <section className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-8 rounded-3xl border border-border/50 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 size-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors" />
        
        <div className="space-y-2 relative">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Building2 className="size-5" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              Departments
            </h1>
          </div>
          <p className="text-muted-foreground max-w-md">
            Manage organizational structure and assign departmental managers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 relative">
          <div className="bg-muted/50 p-1.5 rounded-2xl flex items-center gap-1.5 border border-border/50">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon-sm"
              onClick={() => toggleViewMode("grid")}
              className={cn(
                "rounded-xl transition-all",
                viewMode === "grid" && "shadow-sm"
              )}
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="icon-sm"
              onClick={() => toggleViewMode("table")}
              className={cn(
                "rounded-xl transition-all",
                viewMode === "table" && "shadow-sm"
              )}
            >
              <List className="size-4" />
            </Button>
          </div>

          <Button 
            onClick={openAddModal}
            className="h-12 px-8 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all gap-2"
          >
            <Plus className="size-5" />
            Add Department
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 rounded-3xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border border-dashed border-border/50">
          <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Building2 className="size-10 text-muted-foreground/30" />
          </div>
          <h3 className="text-xl font-bold">No departments Yet</h3>
          <p className="text-muted-foreground">Start by creating your first company department.</p>
          <Button onClick={openAddModal} variant="outline" className="mt-6 rounded-xl font-bold">
            Create Department
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {departments.map((dept, i) => (
              <motion.div
                key={dept.department_id}
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
                        onClick={() => openEditModal(dept)}
                        className="rounded-lg hover:bg-primary/10 hover:text-primary"
                      >
                        <Edit2 className="size-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon-sm" 
                        onClick={() => handleDelete(dept.department_id)}
                        className="rounded-lg hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="size-20 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-primary/5 mb-6 flex items-center justify-center text-primary shadow-sm rotate-3 group-hover:rotate-0 transition-transform duration-500 border border-primary/5">
                      <Hash className="size-10 opacity-10 absolute" />
                      <span className="text-2xl font-black">{dept.code || dept.name[0]}</span>
                    </div>

                    <h3 className="font-extrabold text-xl mb-1 line-clamp-1 group-hover:text-primary transition-colors">{dept.name}</h3>
                    <p className="text-[10px] font-black text-primary/60 bg-primary/5 px-3 py-1 rounded-full mb-8 tracking-widest uppercase">
                      {dept.code || "NO CODE"}
                    </p>

                    <div className="w-full">
                      <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 group-hover:bg-primary/5 group-hover:border-primary/10 transition-colors relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-3 flex items-center justify-center gap-1.5 tracking-widest opacity-70">
                          <Users className="size-3" /> Dept Manager
                        </p>
                        <div className="flex items-center justify-center gap-3">
                          <div className="size-8 rounded-xl bg-background flex items-center justify-center text-xs font-black ring-1 ring-border group-hover:ring-primary/20 text-primary">
                            {dept.manager_name ? dept.manager_name[0] : "?"}
                          </div>
                          <span className={cn(
                            "text-sm font-bold truncate",
                            dept.manager_name ? "text-foreground" : "text-muted-foreground italic opacity-50"
                          )}>
                            {dept.manager_name || "Unassigned"}
                          </span>
                        </div>
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
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-16">ID</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Department Name</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Code</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Manager</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.department_id} className="group hover:bg-muted/20 border-b border-border/50 last:border-none transition-all">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-muted-foreground opacity-50">#{dept.department_id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                        {dept.name[0]}
                      </div>
                      <span className="font-bold group-hover:text-primary transition-colors">{dept.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-lg bg-muted text-[10px] font-black group-hover:bg-primary/10 group-hover:text-primary transition-colors tracking-tighter">
                      {dept.code || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-lg bg-muted flex items-center justify-center text-[10px] font-black text-primary/70">
                        {dept.manager_name ? dept.manager_name[0] : "?"}
                      </div>
                      <span className={cn(
                        "text-sm font-bold",
                        dept.manager_name ? "text-foreground" : "text-muted-foreground italic opacity-50"
                      )}>
                        {dept.manager_name || "Unassigned"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon-sm" 
                        onClick={() => openEditModal(dept)}
                        className="rounded-lg hover:bg-primary/10 hover:text-primary"
                      >
                        <Edit2 className="size-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon-sm" 
                        onClick={() => handleDelete(dept.department_id)}
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

      {/* Unified Edit/Add Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-[2rem] p-0 overflow-hidden">
          <form onSubmit={handleSave}>
            <div className="p-8 space-y-8 bg-card">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black tracking-tight">
                  {editingDept ? "Edit Department" : "Add Department"}
                </DialogTitle>
                <DialogDescription className="font-medium opacity-70">
                  {editingDept 
                    ? `Update details for the ${editingDept.name} department.` 
                    : "Create a new department in your organization."}
                </DialogDescription>
              </DialogHeader>

              <FieldGroup className="gap-6">
                <Field>
                  <FieldLabel className="text-[10px] uppercase font-black tracking-widest opacity-60">Department Name</FieldLabel>
                  <Input 
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Engineering"
                    required
                    className="h-12 rounded-2xl bg-muted/50 border-none transition-all focus-visible:ring-primary/20 font-bold"
                  />
                </Field>

                <Field>
                  <FieldLabel className="text-[10px] uppercase font-black tracking-widest opacity-60">Dept Code</FieldLabel>
                  <Input 
                    value={formData.code}
                    onChange={e => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="e.g. ENG"
                    className="h-12 rounded-2xl bg-muted/50 border-none transition-all focus-visible:ring-primary/20 font-bold"
                  />
                </Field>

                <Field className="relative">
                  <FieldLabel className="text-[10px] uppercase font-black tracking-widest opacity-60">Department Manager</FieldLabel>
                  <div className="relative">
                    <Input 
                      value={managerQuery}
                      onChange={e => {
                        setManagerQuery(e.target.value);
                        if (!e.target.value) setFormData(p => ({ ...p, manager: null }));
                      }}
                      onFocus={() => {
                        if (!managerQuery) {
                           // Trigger an empty search to show all options on focus
                           setManagerQuery(""); 
                        }
                      }}
                      placeholder="Search active employees (supports regex)..."
                      className="h-12 rounded-2xl bg-muted/50 border-none transition-all focus-visible:ring-primary/20 font-bold pr-10"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {searchingManagers ? (
                         <Loader2 className="size-4 animate-spin text-primary" />
                      ) : formData.manager ? (
                         <Check className="size-4 text-emerald-500" />
                      ) : (
                         <Users className="size-4 text-muted-foreground opacity-50" />
                      )}
                    </div>
                  </div>

                  {/* Dropdown Results */}
                  <AnimatePresence>
                    {((managerQuery !== "" || managers.length > 0) && !formData.manager) && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-2 bg-card border border-border/50 shadow-2xl rounded-2xl overflow-hidden py-2 max-h-60 overflow-y-auto custom-scrollbar"
                      >
                        {managers.length === 0 && !searchingManagers ? (
                          <div className="px-4 py-3 text-xs text-muted-foreground italic">No managers found matching "{managerQuery}"</div>
                        ) : managers.map(m => (
                          <button
                            key={m.employee_id}
                            type="button"
                            onClick={() => {
                              setFormData(p => ({ ...p, manager: m.employee_id }));
                              setManagerQuery(m.full_name);
                            }}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted transition-colors text-left"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-bold">{m.full_name}</span>
                              <span className="text-[10px] uppercase font-bold text-muted-foreground/60">{m.position}</span>
                            </div>
                            <span className="text-[10px] font-black text-primary/50">{m.email}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {formData.manager && (
                    <button 
                      type="button"
                      onClick={() => {
                        setFormData(p => ({ ...p, manager: null }));
                        setManagerQuery("");
                      }}
                      className="mt-2 text-[10px] font-black text-destructive/70 hover:text-destructive flex items-center gap-1 transition-colors uppercase tracking-widest pl-1"
                    >
                      <X className="size-3" /> Remove Selection
                    </button>
                  )}
                </Field>
              </FieldGroup>
            </div>

            <DialogFooter className="p-8 pt-0 bg-card">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl font-bold h-12 px-6"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={modalLoading || !formData.name}
                className="rounded-xl font-black h-12 px-10 shadow-lg shadow-primary/20"
              >
                {modalLoading ? "Processing..." : editingDept ? "Save Changes" : "Create Department"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
