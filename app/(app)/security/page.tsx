"use client";

import { motion } from "framer-motion";
import { Shield, Key, Smartphone, Laptop, AlertTriangle, CheckCircle2, LogOut } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function SecurityPage() {
  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Security</h1>
        <p className="text-muted-foreground">Manage your account security and device sessions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
         {/* Security Status */}
         <Card className="md:col-span-3 p-6 border-none shadow-sm bg-gradient-to-r from-emerald-500/10 to-transparent flex items-center gap-6 border-l-4 border-l-emerald-500">
            <div className="bg-emerald-500/20 p-4 rounded-full">
               <Shield className="size-8 text-emerald-600" />
            </div>
            <div>
               <h2 className="text-xl font-bold text-foreground">Your account is secure</h2>
               <p className="text-muted-foreground">You have completed 3 of 4 security recommendations.</p>
            </div>
            <div className="ml-auto hidden md:block">
               <Button variant="outline" className="border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/10 font-bold">View Checklist</Button>
            </div>
         </Card>

         {/* Change Password */}
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2">
            <Card className="p-6 border-none shadow-sm h-full">
               <div className="flex items-center gap-3 mb-6">
                  <div className="bg-primary/10 p-2 rounded-lg">
                     <Key className="size-5 text-primary" />
                  </div>
                  <div>
                     <h3 className="font-bold text-lg">Change Password</h3>
                     <p className="text-xs text-muted-foreground">Last changed 90 days ago</p>
                  </div>
               </div>

               <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                     <Label>Current Password</Label>
                     <Input type="password" />
                  </div>
                  <div className="space-y-2">
                     <Label>New Password</Label>
                     <Input type="password" />
                  </div>
                  <div className="space-y-2">
                     <Label>Confirm New Password</Label>
                     <Input type="password" />
                  </div>
                  <div className="pt-2">
                     <Button className="w-full font-bold">Update Password</Button>
                  </div>
               </div>
            </Card>
         </motion.div>

         {/* 2FA */}
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-6 border-none shadow-sm h-full flex flex-col">
               <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-500/10 p-2 rounded-lg">
                     <Smartphone className="size-5 text-purple-600" />
                  </div>
                  <div>
                     <h3 className="font-bold text-lg">2-Step Verification</h3>
                     <p className="text-xs text-muted-foreground">Extra layer of security</p>
                  </div>
               </div>

               <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-8">
                  <div className="size-16 bg-muted rounded-full flex items-center justify-center">
                     <CheckCircle2 className="size-8 text-emerald-500" />
                  </div>
                  <div>
                     <p className="font-bold text-foreground">Enabled</p>
                     <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">Your account is protected with Google Authenticator.</p>
                  </div>
               </div>

               <Button variant="outline" className="w-full font-bold mt-auto border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300">Disable 2FA</Button>
            </Card>
         </motion.div>
      </div>

      {/* Active Sessions */}
      <div>
         <h3 className="text-xl font-bold mb-4 tracking-tight">Active Sessions</h3>
         <div className="space-y-4">
            {[
               { device: "Windows PC", location: "San Francisco, US", ip: "192.168.1.1", active: true, icon: Laptop },
               { device: "iPhone 15 Pro", location: "San Francisco, US", ip: "10.0.0.1", active: false, lastActive: "2 hours ago", icon: Smartphone },
               { device: "MacBook Pro", location: "New York, US", ip: "172.16.0.1", active: false, lastActive: "3 days ago", icon: Laptop },
            ].map((session, i) => (
               <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (i * 0.05) }}
               >
                  <Card className="p-4 flex items-center justify-between border-none shadow-sm hover:shadow-md transition-shadow">
                     <div className="flex items-center gap-4">
                        <div className="bg-muted p-3 rounded-xl text-muted-foreground">
                           <session.icon className="size-6" />
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <h4 className="font-bold text-foreground">{session.device}</h4>
                              {session.active && <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Current</span>}
                           </div>
                           <p className="text-sm text-muted-foreground mt-0.5">{session.location} • {session.ip}</p>
                           {!session.active && <p className="text-xs text-muted-foreground mt-0.5">Last active: {session.lastActive}</p>}
                        </div>
                     </div>
                     {!session.active && (
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500 hover:bg-red-50">
                           <LogOut className="size-4 mr-2" /> Revoke
                        </Button>
                     )}
                  </Card>
               </motion.div>
            ))}
         </div>
      </div>
    </section>
  );
}
