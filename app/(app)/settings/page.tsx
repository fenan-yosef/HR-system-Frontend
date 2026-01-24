"use client";

import { motion } from "framer-motion";
import { Moon, Sun, Monitor, Bell, Globe, Trash2, BellRing, Mail, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Mock Switch component since we don't have it imported
const Switch = ({ checked = false }: { checked?: boolean }) => (
   <button className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${checked ? "bg-primary" : "bg-muted"}`}>
      <div className={`size-5 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
   </button>
);

export default function SettingsPage() {
  return (
    <section className="space-y-8 pb-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Customize your workspace and preferences.</p>
      </div>

      <div className="grid gap-8 max-w-4xl">
         {/* Appearance */}
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 border-none shadow-sm space-y-6">
               <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                  <div className="bg-primary/10 p-2 rounded-lg">
                     <Sun className="size-5 text-primary" />
                  </div>
                  <div>
                     <h3 className="font-bold text-lg">Appearance</h3>
                     <p className="text-xs text-muted-foreground">Customize how HRFlow looks on your device.</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-3 gap-4">
                  {[
                     { name: "Light", icon: Sun },
                     { name: "Dark", icon: Moon },
                     { name: "System", icon: Monitor },
                  ].map((mode, i) => (
                     <div key={i} className="flex flex-col gap-3">
                        <div className={`h-24 rounded-xl border-2 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-all ${i === 0 ? "border-primary bg-primary/5" : "border-muted"}`}>
                           <mode.icon className={`size-8 ${i === 0 ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <span className={`text-center text-sm font-bold ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>{mode.name}</span>
                     </div>
                  ))}
               </div>
            </Card>
         </motion.div>

         {/* Notifications */}
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-6 border-none shadow-sm space-y-6">
               <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                  <div className="bg-purple-500/10 p-2 rounded-lg">
                     <Bell className="size-5 text-purple-600" />
                  </div>
                  <div>
                     <h3 className="font-bold text-lg">Notifications</h3>
                     <p className="text-xs text-muted-foreground">Manage how you receive alerts and updates.</p>
                  </div>
               </div>

               <div className="space-y-6">
                  {[
                     { label: "Email Notifications", desc: "Receive daily digests and weekly summaries.", icon: Mail, checked: true },
                     { label: "Push Notifications", desc: "Get real-time alerts on your mobile device.", icon: BellRing, checked: true },
                     { label: "SMS Alerts", desc: "Receive critical security alerts via text.", icon: MessageSquare, checked: false },
                  ].map((item, i) => (
                     <div key={i} className="flex items-center justify-between">
                        <div className="flex items-start gap-4">
                           <item.icon className="size-5 text-muted-foreground mt-0.5" />
                           <div className="space-y-0.5">
                              <Label className="text-base font-bold">{item.label}</Label>
                              <p className="text-xs text-muted-foreground">{item.desc}</p>
                           </div>
                        </div>
                        <Switch checked={item.checked} />
                     </div>
                  ))}
               </div>
            </Card>
         </motion.div>

         {/* Language & Region */}
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-6 border-none shadow-sm space-y-6">
               <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                  <div className="bg-blue-500/10 p-2 rounded-lg">
                     <Globe className="size-5 text-blue-600" />
                  </div>
                  <div>
                     <h3 className="font-bold text-lg">Language & Region</h3>
                     <p className="text-xs text-muted-foreground">Set your preferred language and date formats.</p>
                  </div>
               </div>

               <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <Label>Language</Label>
                     <select className="w-full p-2 rounded-lg border bg-background font-medium text-sm">
                        <option>English (US)</option>
                        <option>French</option>
                        <option>Spanish</option>
                        <option>German</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                     <Label>Time Zone</Label>
                     <select className="w-full p-2 rounded-lg border bg-background font-medium text-sm">
                        <option>(GMT-08:00) Pacific Time (US & Canada)</option>
                        <option>(GMT+00:00) London</option>
                        <option>(GMT+01:00) Paris</option>
                        <option>(GMT+09:00) Tokyo</option>
                     </select>
                  </div>
               </div>
            </Card>
         </motion.div>

         {/* Danger Zone */}
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-6 border border-red-200 bg-red-50/10 shadow-sm space-y-6">
               <div className="flex items-center gap-3 pb-4">
                  <div className="bg-red-100 p-2 rounded-lg text-red-600">
                     <Trash2 className="size-5" />
                  </div>
                  <div>
                     <h3 className="font-bold text-lg text-red-600">Danger Zone</h3>
                     <p className="text-xs text-muted-foreground">Irreversible actions for your account.</p>
                  </div>
               </div>

               <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border border-red-200 rounded-xl bg-background/50">
                  <div>
                     <h4 className="font-bold text-foreground">Delete Account</h4>
                     <p className="text-xs text-muted-foreground mt-1">Permanently delete your account and all associated data.</p>
                  </div>
                  <Button variant="destructive" className="font-bold whitespace-nowrap bg-red-600 hover:bg-red-700">Delete Account</Button>
               </div>
            </Card>
         </motion.div>
      </div>
    </section>
  );
}
