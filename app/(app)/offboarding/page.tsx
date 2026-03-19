"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { UserMinus, AlertTriangle, FileCheck, Archive, Download, Plus, X } from "lucide-react";
import { Card } from "@/components/ui/card";

type OffboardingStatus = "pending" | "in_progress" | "completed";

interface OffboardingItem {
   id: number;
   name: string;
   role: string;
   lastDay: string;
   resignation: OffboardingStatus;
   handover: OffboardingStatus;
   finalPay: OffboardingStatus;
   assetsReturned: boolean;
}

const initialEmployees: OffboardingItem[] = [
   {
      id: 1,
      name: "Jane Doe",
      role: "Marketing Lead",
      lastDay: "Jan 30",
      resignation: "completed",
      handover: "in_progress",
      finalPay: "pending",
      assetsReturned: false,
   },
   {
      id: 2,
      name: "John Kassa",
      role: "Data Analyst",
      lastDay: "Feb 04",
      resignation: "completed",
      handover: "pending",
      finalPay: "pending",
      assetsReturned: false,
   },
];

export default function OffboardingPage() {
   const [employees, setEmployees] = useState<OffboardingItem[]>(initialEmployees);
   const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);

   const selectedEmployee = useMemo(
      () => employees.find((employee) => employee.id === selectedEmployeeId) ?? null,
      [employees, selectedEmployeeId],
   );

   const pendingEquipment = employees.filter((employee) => !employee.assetsReturned).length;
   const voluntaryExits = employees.length;
   const finalPayrolls = employees.filter((employee) => employee.finalPay !== "completed").length;

   const updateEmployee = (id: number, updater: (employee: OffboardingItem) => OffboardingItem) => {
      setEmployees((prev) => prev.map((employee) => (employee.id === id ? updater(employee) : employee)));
   };

   const handleGenerateReport = () => {
      const headers = ["Name", "Role", "Last Day", "Resignation", "Handover", "Final Pay", "Assets Returned"];
      const rows = employees.map((employee) => [
         employee.name,
         employee.role,
         employee.lastDay,
         employee.resignation,
         employee.handover,
         employee.finalPay,
         employee.assetsReturned ? "Yes" : "No",
      ]);

      const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `offboarding-report-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
   };

   const handleStartOffboarding = () => {
      const nextId = (employees.at(-1)?.id ?? 0) + 1;
      const newEmployee: OffboardingItem = {
         id: nextId,
         name: `New Employee ${nextId}`,
         role: "Team Member",
         lastDay: "TBD",
         resignation: "pending",
         handover: "pending",
         finalPay: "pending",
         assetsReturned: false,
      };
      setEmployees((prev) => [...prev, newEmployee]);
      setSelectedEmployeeId(nextId);
   };

   const isStepDone = (status: OffboardingStatus) => status === "completed";

  return (
    <section className="space-y-8">
         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
               <h1 className="text-4xl font-extrabold tracking-tight">Offboarding</h1>
               <p className="text-muted-foreground">Streamline exit processes and ensure compliance.</p>
            </div>

            <div className="flex gap-2">
               <button
                  onClick={handleGenerateReport}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-muted"
               >
                  <Download className="size-4" />
                  Export Report
               </button>
               <button
                  onClick={handleStartOffboarding}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground"
               >
                  <Plus className="size-4" />
                  Start Offboarding
               </button>
            </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 border-none shadow-sm bg-red-500/5 border-l-4 border-red-500">
           <div className="flex items-start justify-between mb-4">
              <div>
                 <p className="text-xs font-bold uppercase text-red-600 tracking-wider">Voluntary Exits</p>
                         <h3 className="text-3xl font-black text-red-700 mt-1">{voluntaryExits}</h3>
              </div>
              <UserMinus className="size-6 text-red-500" />
           </div>
           <p className="text-xs text-red-600/80 font-medium">Requires immediate attention</p>
        </Card>
        
        <Card className="p-6 border-none shadow-sm bg-orange-500/5 border-l-4 border-orange-500">
           <div className="flex items-start justify-between mb-4">
              <div>
                 <p className="text-xs font-bold uppercase text-orange-600 tracking-wider">Pending Equipment</p>
                 <h3 className="text-3xl font-black text-orange-700 mt-1">{pendingEquipment}</h3>
              </div>
              <AlertTriangle className="size-6 text-orange-500" />
           </div>
           <p className="text-xs text-orange-600/80 font-medium">Laptops & Keycards outstanding</p>
        </Card>
        
        <Card className="p-6 border-none shadow-sm bg-blue-500/5 border-l-4 border-blue-500">
           <div className="flex items-start justify-between mb-4">
              <div>
                 <p className="text-xs font-bold uppercase text-blue-600 tracking-wider">Final Payrolls</p>
                 <h3 className="text-3xl font-black text-blue-700 mt-1">{finalPayrolls}</h3>
              </div>
              <FileCheck className="size-6 text-blue-500" />
           </div>
           <p className="text-xs text-blue-600/80 font-medium">Scheduled for end of month</p>
        </Card>
      </div>

      <h3 className="text-xl font-bold tracking-tight">Exiting Employees</h3>
      <div className="space-y-4">
            {employees.map((employee, i) => (
           <motion.div
                   key={employee.id}
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: (i + 1) * 0.1 }}
           >
             <Card className="p-6 border-none shadow-sm flex flex-col md:flex-row items-center gap-6">
                <div className="size-12 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                            {employee.name
                               .split(" ")
                               .map((part) => part[0])
                               .join("")
                               .slice(0, 2)
                               .toUpperCase()}
                </div>
                <div className="flex-1 text-center md:text-left">
                            <h4 className="font-bold">{employee.name}</h4>
                            <p className="text-sm text-muted-foreground">{employee.role} • Last Day: {employee.lastDay}</p>
                </div>
                
                <div className="flex items-center gap-8 w-full md:w-auto mt-4 md:mt-0">
                   <div className="flex flex-col items-center gap-1">
                                 <div className={`size-8 rounded-full flex items-center justify-center ${isStepDone(employee.resignation) ? "bg-emerald-100 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                         <CheckCircle className="size-4" />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Resignation</span>
                   </div>
                   <div className="w-8 h-0.5 bg-muted" />
                   <div className="flex flex-col items-center gap-1">
                                 <div className={`size-8 rounded-full flex items-center justify-center ${isStepDone(employee.handover) ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                         <Archive className="size-4" />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Handover</span>
                   </div>
                   <div className="w-8 h-0.5 bg-muted" />
                            <div className={`flex flex-col items-center gap-1 ${isStepDone(employee.finalPay) ? "opacity-100" : "opacity-50"}`}>
                                 <div className={`size-8 rounded-full flex items-center justify-center ${isStepDone(employee.finalPay) ? "bg-emerald-100 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                         <FileCheck className="size-4" />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Final Pay</span>
                   </div>
                </div>
                
                        <button
                            onClick={() => setSelectedEmployeeId(employee.id)}
                            className="w-full md:w-auto px-6 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm"
                        >
                   Manage
                </button>
             </Card>
           </motion.div>
        ))}
      </div>

         {selectedEmployee && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <button
                  type="button"
                  aria-label="Close offboarding manager"
                  onClick={() => setSelectedEmployeeId(null)}
                  className="absolute inset-0 bg-background/70 backdrop-blur-sm"
               />

               <Card className="relative z-10 w-full max-w-2xl border-none p-6 shadow-2xl space-y-5">
                  <div className="flex items-start justify-between gap-4">
                     <div>
                        <h3 className="text-xl font-black">Manage Offboarding</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                           {selectedEmployee.name} • {selectedEmployee.role}
                        </p>
                     </div>
                     <button
                        onClick={() => setSelectedEmployeeId(null)}
                        className="rounded-full p-2 hover:bg-muted"
                     >
                        <X className="size-4" />
                     </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                     <button
                        onClick={() => updateEmployee(selectedEmployee.id, (e) => ({ ...e, handover: "completed" }))}
                        className="rounded-lg border border-border px-4 py-3 text-left text-sm font-semibold hover:bg-muted"
                     >
                        Mark Handover Complete
                     </button>
                     <button
                        onClick={() => updateEmployee(selectedEmployee.id, (e) => ({ ...e, finalPay: "in_progress" }))}
                        className="rounded-lg border border-border px-4 py-3 text-left text-sm font-semibold hover:bg-muted"
                     >
                        Schedule Final Payroll
                     </button>
                     <button
                        onClick={() => updateEmployee(selectedEmployee.id, (e) => ({ ...e, assetsReturned: true }))}
                        className="rounded-lg border border-border px-4 py-3 text-left text-sm font-semibold hover:bg-muted"
                     >
                        Confirm Asset Return
                     </button>
                     <button
                        onClick={() =>
                           updateEmployee(selectedEmployee.id, (e) => ({
                              ...e,
                              resignation: "completed",
                              handover: "completed",
                              finalPay: "completed",
                              assetsReturned: true,
                           }))
                        }
                        className="rounded-lg bg-primary px-4 py-3 text-left text-sm font-semibold text-primary-foreground"
                     >
                        Close Offboarding
                     </button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                     Changes are applied immediately on this page state.
                  </p>
               </Card>
            </div>
         )}
    </section>
  );
}

// Helper component for the check icon
function CheckCircle({ className }: { className?: string }) {
   return (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
         <polyline points="20 6 9 17 4 12" />
      </svg>
   );
}
