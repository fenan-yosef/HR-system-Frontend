"use client";

import { motion } from "framer-motion";
import { UserMinus, AlertTriangle, FileCheck, Archive } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function OffboardingPage() {
  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Offboarding</h1>
        <p className="text-muted-foreground">Streamline exit processes and ensure compliance.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 border-none shadow-sm bg-red-500/5 border-l-4 border-red-500">
           <div className="flex items-start justify-between mb-4">
              <div>
                 <p className="text-xs font-bold uppercase text-red-600 tracking-wider">Voluntary Exits</p>
                 <h3 className="text-3xl font-black text-red-700 mt-1">2</h3>
              </div>
              <UserMinus className="size-6 text-red-500" />
           </div>
           <p className="text-xs text-red-600/80 font-medium">Requires immediate attention</p>
        </Card>
        
        <Card className="p-6 border-none shadow-sm bg-orange-500/5 border-l-4 border-orange-500">
           <div className="flex items-start justify-between mb-4">
              <div>
                 <p className="text-xs font-bold uppercase text-orange-600 tracking-wider">Pending Equipment</p>
                 <h3 className="text-3xl font-black text-orange-700 mt-1">5</h3>
              </div>
              <AlertTriangle className="size-6 text-orange-500" />
           </div>
           <p className="text-xs text-orange-600/80 font-medium">Laptops & Keycards outstanding</p>
        </Card>
        
        <Card className="p-6 border-none shadow-sm bg-blue-500/5 border-l-4 border-blue-500">
           <div className="flex items-start justify-between mb-4">
              <div>
                 <p className="text-xs font-bold uppercase text-blue-600 tracking-wider">Final Payrolls</p>
                 <h3 className="text-3xl font-black text-blue-700 mt-1">8</h3>
              </div>
              <FileCheck className="size-6 text-blue-500" />
           </div>
           <p className="text-xs text-blue-600/80 font-medium">Scheduled for end of month</p>
        </Card>
      </div>

      <h3 className="text-xl font-bold tracking-tight">Exiting Employees</h3>
      <div className="space-y-4">
        {[1, 2].map((i) => (
           <motion.div
             key={i}
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: i * 0.1 }}
           >
             <Card className="p-6 border-none shadow-sm flex flex-col md:flex-row items-center gap-6">
                <div className="size-12 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                   JD
                </div>
                <div className="flex-1 text-center md:text-left">
                   <h4 className="font-bold">Jane Doe</h4>
                   <p className="text-sm text-muted-foreground">Marketing Lead • Last Day: Jan 30</p>
                </div>
                
                <div className="flex items-center gap-8 w-full md:w-auto mt-4 md:mt-0">
                   <div className="flex flex-col items-center gap-1">
                      <div className="size-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                         <CheckCircle className="size-4" />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Resignation</span>
                   </div>
                   <div className="w-8 h-0.5 bg-muted" />
                   <div className="flex flex-col items-center gap-1">
                      <div className="size-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                         <Archive className="size-4" />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Handover</span>
                   </div>
                   <div className="w-8 h-0.5 bg-muted" />
                   <div className="flex flex-col items-center gap-1 opacity-50">
                      <div className="size-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                         <FileCheck className="size-4" />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Final Pay</span>
                   </div>
                </div>
                
                <button className="w-full md:w-auto px-6 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                   Manage
                </button>
             </Card>
           </motion.div>
        ))}
      </div>
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
