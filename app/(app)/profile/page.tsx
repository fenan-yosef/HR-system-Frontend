"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Link as LinkIcon,
  Calendar,
  Building,
  Briefcase,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  fetchProfile, updateProfile, changePassword, 
  ProfileData, PasswordChangeData 
} from "@/services/profileService";
import { useAuth } from "@/hooks/useAuth";
import { uploadProfileImage } from "@/services/uploadService";
import { getMediaUrl } from "@/services/apiClient";
import { ROLE_LABELS } from "@/constants/roles";
import { cn } from "@/lib/utils";

type Tab = "account" | "security";

export default function ProfilePage() {
  return (
    <section className="space-y-8">
      {/* Header Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="h-48 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl w-full" />
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start -mt-16">
            <div className="size-32 rounded-2xl bg-muted border-4 border-background shadow-xl flex items-center justify-center text-4xl overflow-hidden relative group">
              <Image
                src="https://github.com/shadcn.png"
                alt="Profile"
                fill
                sizes="128px"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex-1 mt-16 md:mt-20">
              <h1 className="text-3xl font-black text-foreground">John Doe</h1>
              <p className="text-muted-foreground font-medium">
                Senior Frontend Engineer at Tech Corp
              </p>
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" /> San Francisco, CA
                </span>
                <span className="flex items-center gap-1.5">
                  <Building className="size-4" /> Engineering Team
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-4" /> Joined Jan 2024
                </span>
              </div>
            </div>
            <div className="mt-16 md:mt-20 flex gap-3">
              <button className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                Edit Profile
              </button>
              <button className="px-4 py-2 bg-muted text-foreground font-bold rounded-lg hover:bg-muted/80 transition-colors">
                Share
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <Card className="p-6 border-none shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="bg-muted p-2 rounded-lg">
                    <Mail className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">john.doe@example.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="bg-muted p-2 rounded-lg">
                    <Phone className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="bg-muted p-2 rounded-lg">
                    <LinkIcon className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Portfolio</p>
                    <p className="font-medium hover:text-primary cursor-pointer hover:underline">
                      johndoe.dev
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-border/50" />

            <div>
              <h3 className="font-bold text-lg mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "React",
                  "Next.js",
                  "TypeScript",
                  "Tailwind CSS",
                  "Node.js",
                  "GraphQL",
                  "Framer Motion",
                ].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-muted rounded-full text-xs font-bold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 border-none shadow-sm">
            <h3 className="font-bold text-lg mb-4">About Me</h3>
            <p className="text-muted-foreground leading-relaxed">
              Passionate Frontend Engineer with over 5 years of experience
              building scalable web applications. Specializing in the React
              ecosystem and modern CSS architectures. Committed to creating
              performant, accessible, and user-centric digital experiences.
              Always eager to learn new technologies and share knowledge with
              the community.
            </p>
          </Card>

          <Card className="p-6 border-none shadow-sm">
            <h3 className="font-bold text-lg mb-6">Experience</h3>
            <div className="space-y-8 relative">
              {/* Timeline Line */}
              <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-border/50" />

              {[
                {
                  role: "Senior Frontend Engineer",
                  company: "Tech Corp",
                  period: "2024 - Present",
                  description:
                    "Leading the frontend team in migrating legacy app to Next.js App Router.",
                },
                {
                  role: "Frontend Developer",
                  company: "Creative Agency",
                  period: "2021 - 2024",
                  description:
                    "Developed award-winning marketing sites and e-commerce platforms for global brands.",
                },
                {
                  role: "Junior Web Developer",
                  company: "Startup Inc",
                  period: "2019 - 2021",
                  description:
                    "Collaborated with designers to implement responsive UI components and landing pages.",
                },
              ].map((job, i) => (
                <div key={i} className="relative pl-10">
                  <div className="absolute left-0 top-1.5 size-7 bg-background border-2 border-primary rounded-full flex items-center justify-center z-10">
                    <Briefcase className="size-3 text-primary" />
                  </div>
                  <h4 className="font-bold text-foreground">{job.role}</h4>
                  <div className="text-sm font-semibold text-primary mb-1">
                    {job.company}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {job.period}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {job.description}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Profile Header Card */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-indigo-500/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <Card className="relative p-8 md:p-12 rounded-[2.5rem] border-none bg-white dark:bg-card shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <UserCircle2 className="size-64" />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="relative group/avatar">
              <div className="size-32 md:size-40 rounded-[3rem] bg-muted flex items-center justify-center overflow-hidden border-4 border-background shadow-xl relative transition-transform duration-500 group-hover/avatar:scale-105">
                {profile?.profile_photo_url || profile?.onboarding_data?.profile_photo_url ? (
                  <img 
                    src={getMediaUrl(profile.profile_photo_url || profile.onboarding_data?.profile_photo_url) || profile.profile_photo_url || profile.onboarding_data?.profile_photo_url || ""} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl font-black text-primary/30 uppercase">
                    {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                  </span>
                )}
                
                <button 
                  onClick={handlePhotoUpload}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity"
                >
                  <Camera className="size-8 text-white" />
                </button>
              </div>
              <div className="absolute -bottom-2 -right-2 size-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg border-4 border-background">
                <ShieldCheck className="size-5" />
              </div>
            </div>

            <div className="text-center md:text-left space-y-3">
              <h1 className="text-4xl font-black tracking-tight">
                {profile?.first_name || profile?.last_name 
                  ? `${profile.first_name} ${profile.last_name}` 
                  : user?.username || "Account Profile"}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <div className="px-4 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/10">
                  {profile?.position || (profile?.role_name ? ROLE_LABELS[profile.role_name as keyof typeof ROLE_LABELS] : "System User")}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground font-medium">
                  <Mail className="size-4" />
                  {profile?.email}
                </div>
                {profile?.department_name && (
                  <div className="flex items-center gap-2 text-muted-foreground font-medium border-l border-border pl-3">
                    <UserCircle2 className="size-4" />
                    {profile.department_name}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          <button
            onClick={() => setActiveTab("account")}
            className={cn(
              "w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all duration-200",
              activeTab === "account" 
                ? "bg-primary text-white shadow-lg shadow-primary/20 translate-x-2" 
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <UserCog className="size-5" />
            Account Details
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={cn(
              "w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all duration-200",
              activeTab === "security" 
                ? "bg-primary text-white shadow-lg shadow-primary/20 translate-x-2" 
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <Lock className="size-5" />
            Security & Auth
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            {activeTab === "account" ? (
              <motion.div
                key="account"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="p-8 md:p-10 rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-card">
                  <form onSubmit={handleUpdateProfile} className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-bold">Personal Information</h2>
                        <p className="text-sm text-muted-foreground">Manage your identity and contact methods.</p>
                      </div>
                      <Button 
                        type="submit" 
                        disabled={saving}
                        className="rounded-2xl px-8 h-12 font-bold gap-2 shadow-xl shadow-primary/10"
                      >
                        {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                        Save Changes
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">First Name</label>
                        <Input 
                          value={profile?.first_name || ""} 
                          onChange={e => setProfile(p => p ? { ...p, first_name: e.target.value } : null)}
                          required
                          className="h-14 rounded-2xl bg-muted/50 border-none font-bold focus-visible:ring-primary/20" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Last Name</label>
                        <Input 
                          value={profile?.last_name || ""} 
                          onChange={e => setProfile(p => p ? { ...p, last_name: e.target.value } : null)}
                          required
                          className="h-14 rounded-2xl bg-muted/50 border-none font-bold focus-visible:ring-primary/20" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Email Address</label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input 
                            type="email"
                            value={profile?.email || ""} 
                            onChange={e => setProfile(p => p ? { ...p, email: e.target.value } : null)}
                            required
                            className="h-14 pl-12 rounded-2xl bg-muted/50 border-none font-bold focus-visible:ring-primary/20" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Phone Number</label>
                        <div className="relative group">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input 
                            value={profile?.phone || ""} 
                            onChange={e => setProfile(p => p ? { ...p, phone: e.target.value } : null)}
                            className="h-14 pl-12 rounded-2xl bg-muted/50 border-none font-bold focus-visible:ring-primary/20" 
                            placeholder="+251 ..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border/50">
                      <h3 className="text-sm font-bold mb-6">Identification Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">National ID</label>
                          <Input 
                            value={profile?.national_id || ""} 
                            onChange={e => setProfile(p => p ? { ...p, national_id: e.target.value } : null)}
                            className="h-14 rounded-2xl bg-muted/50 border-none font-bold focus-visible:ring-primary/20" 
                            placeholder="NID-..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Pension ID</label>
                          <Input 
                            value={profile?.pension_id || ""} 
                            onChange={e => setProfile(p => p ? { ...p, pension_id: e.target.value } : null)}
                            className="h-14 rounded-2xl bg-muted/50 border-none font-bold focus-visible:ring-primary/20" 
                            placeholder="PEN-..."
                          />
                        </div>
                      </div>
                    </div>

                    {profile?.position && (
                      <div className="pt-6 border-t border-border/50">
                        <h3 className="text-sm font-bold mb-6">Employment Info (Read-only)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-1 p-4 rounded-2xl bg-muted/30 border border-border/50">
                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Department</label>
                            <p className="font-bold">{profile.department_name}</p>
                          </div>
                          <div className="space-y-1 p-4 rounded-2xl bg-muted/30 border border-border/50">
                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Position</label>
                            <p className="font-bold">{profile.position}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </form>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="p-8 md:p-10 rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-card">
                  <form onSubmit={handleChangePassword} className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-bold">Security Settings</h2>
                        <p className="text-sm text-muted-foreground">Update your authentication credentials.</p>
                      </div>
                      <Button 
                        type="submit" 
                        disabled={saving}
                        variant="default"
                        className="rounded-2xl px-8 h-12 font-bold gap-2 shadow-xl shadow-primary/10"
                      >
                        {saving ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
                        Update Password
                      </Button>
                    </div>

                    <div className="space-y-6 max-w-md">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Current Password</label>
                        <Input 
                          type="password"
                          value={passwordData.old_password}
                          onChange={e => setPasswordData(p => ({ ...p, old_password: e.target.value }))}
                          required
                          className="h-14 rounded-2xl bg-muted/50 border-none font-bold focus-visible:ring-primary/20" 
                        />
                      </div>
                      
                      <div className="pt-4 border-t border-border/50"></div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">New Password</label>
                        <Input 
                          type="password"
                          value={passwordData.new_password}
                          onChange={e => setPasswordData(p => ({ ...p, new_password: e.target.value }))}
                          required
                          className="h-14 rounded-2xl bg-muted/50 border-none font-bold focus-visible:ring-primary/20" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Confirm New Password</label>
                        <Input 
                          type="password"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          required
                          className="h-14 rounded-2xl bg-muted/50 border-none font-bold focus-visible:ring-primary/20" 
                        />
                      </div>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toast-like message notification */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-6"
              >
                <div className={cn(
                  "p-4 rounded-2xl border flex items-center gap-3 font-bold",
                  message.type === "success" 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" 
                    : "bg-rose-500/10 border-rose-500/20 text-rose-600"
                )}>
                  {message.type === "success" ? <CheckCircle2 className="size-5" /> : <AlertCircle className="size-5" />}
                  {message.text}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
