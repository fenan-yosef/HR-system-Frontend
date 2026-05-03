"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Rocket, 
  CheckCircle2, 
  Circle, 
  CreditCard, 
  User, 
  Building2, 
  ShieldCheck,
  ChevronRight,
  Loader2,
  Trophy
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Employee } from "@/types/employee";
import { updateEmployee } from "@/services/employeeService";

interface LaunchpadProps {
  employee: Employee;
  onUpdate: () => void;
}

export function OnboardingLaunchpad({ employee, onUpdate }: LaunchpadProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Local state for form fields
  const [formData, setFormData] = useState({
    bank_name: employee.onboarding_data?.bank_name || "",
    account_number: employee.onboarding_data?.account_number || "",
    emergency_contact: employee.onboarding_data?.emergency_contact || "",
    emergency_phone: employee.onboarding_data?.emergency_phone || "",
    address: employee.onboarding_data?.address || "",
  });

  const steps = [
    { id: "identity", label: "Identity Verification", icon: ShieldCheck, fields: ["address"] },
    { id: "banking", label: "Payroll Setup", icon: CreditCard, fields: ["bank_name", "account_number"] },
    { id: "emergency", label: "Emergency Contact", icon: User, fields: ["emergency_contact", "emergency_phone"] },
  ];

  const completion = employee.onboarding_completion || 0;

  const handleSave = async () => {
    setLoading(true);
    try {
      const newCompletion = Math.min(100, completion + 33.4);
      await updateEmployee(employee.employee_id, {
        onboarding_data: { ...employee.onboarding_data, ...formData },
        // Simple logic: if they finish a step, we bump completion
        // In a real app, we'd count non-empty fields
      });
      onUpdate();
      if (step < steps.length - 1) setStep(step + 1);
    } finally {
      setLoading(false);
    }
  };

  if (completion >= 100) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-20"
      >
        <div className="size-20 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="size-10" />
        </div>
        <h2 className="text-3xl font-black mb-2">Onboarding Complete!</h2>
        <p className="text-muted-foreground mb-8 text-lg">You're all set, {employee.first_name}. Welcome to the team!</p>
        <Button className="rounded-full px-8 h-12 bg-primary font-bold hover:scale-105 transition-transform">
          Go to Dashboard
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header & Progress */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-2">
            <Rocket className="size-3" /> Mission: Onboarding
          </div>
          <h1 className="text-4xl font-black tracking-tight">Employee Launchpad</h1>
          <p className="text-muted-foreground">Complete your profile to unlock full system access.</p>
        </div>
        
        <div className="w-full md:w-64 space-y-2">
          <div className="flex justify-between text-sm font-bold">
            <span>Progress</span>
            <span className="text-primary">{Math.round(completion)}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden border border-border/50 p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${completion}%` }}
              className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Step Navigation */}
        <div className="lg:col-span-4 space-y-3">
          {steps.map((s, i) => {
            const isCompleted = i < (completion / 33);
            const isActive = i === step;
            const Icon = s.icon;

            return (
              <button
                key={s.id}
                onClick={() => setStep(i)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                  isActive 
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.02]" 
                    : "bg-card border-border/50 hover:border-primary/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className={`size-10 rounded-xl flex items-center justify-center ${
                  isActive ? "bg-white/20" : isCompleted ? "bg-emerald-500/10 text-emerald-500" : "bg-muted"
                }`}>
                  {isCompleted ? <CheckCircle2 className="size-5" /> : <Icon className="size-5" />}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Step {i + 1}</p>
                  <p className="font-bold text-sm">{s.label}</p>
                </div>
                <ChevronRight className={`size-4 transition-transform ${isActive ? "rotate-90" : ""}`} />
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <Card className="lg:col-span-8 p-8 border-none shadow-xl bg-card/50 backdrop-blur-md relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 relative z-10"
            >
              <div className="space-y-1">
                <h3 className="text-2xl font-black">{steps[step].label}</h3>
                <p className="text-muted-foreground text-sm">Please provide your {steps[step].label.toLowerCase()} details.</p>
              </div>

              <div className="grid gap-6">
                {step === 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest">Home Address</label>
                    <textarea 
                      className="w-full bg-muted/50 border border-border/50 rounded-xl p-4 text-sm min-h-[100px] focus:ring-2 focus:ring-primary outline-none"
                      placeholder="Street, City, Country"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                )}

                {step === 1 && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest">Bank Name</label>
                      <Input 
                        placeholder="e.g. Commercial Bank of Ethiopia" 
                        className="h-12 rounded-xl bg-muted/50"
                        value={formData.bank_name}
                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest">Account Number</label>
                      <Input 
                        placeholder="1000..." 
                        className="h-12 rounded-xl bg-muted/50"
                        value={formData.account_number}
                        onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest">Contact Name</label>
                      <Input 
                        placeholder="Full Name" 
                        className="h-12 rounded-xl bg-muted/50"
                        value={formData.emergency_contact}
                        onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest">Phone Number</label>
                      <Input 
                        placeholder="+251..." 
                        className="h-12 rounded-xl bg-muted/50"
                        value={formData.emergency_phone}
                        onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-border/50 mt-8">
                <Button 
                  variant="ghost" 
                  className="rounded-xl font-bold"
                  onClick={() => step > 0 && setStep(step - 1)}
                  disabled={step === 0}
                >
                  Previous
                </Button>
                <Button 
                  className="rounded-xl px-8 bg-primary font-bold shadow-lg shadow-primary/30"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin size-4 mr-2" /> : null}
                  {step === steps.length - 1 ? "Complete Onboarding" : "Save & Continue"}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </Card>
      </div>
    </div>
  );
}
