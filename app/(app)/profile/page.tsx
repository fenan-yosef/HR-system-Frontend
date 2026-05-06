"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, Mail, Phone, Camera, 
  Save, Loader2, CheckCircle2, AlertCircle,
  ShieldCheck, UserCog, UserCircle2
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
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [profile, setProfile] = useState<ProfileData | null>(user ? {
    first_name: user.firstName || "",
    last_name: user.lastName || "",
    email: user.email || "",
    onboarding_data: {
      profile_photo_url: user.profilePictureUrl || ""
    },
    profile_photo_url: user.profilePictureUrl || ""
  } : null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password form state
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    old_password: "",
    new_password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const data = await fetchProfile();
        setProfile(data);
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage(null);
    try {
      const updated = await updateProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone: profile.phone,
        national_id: profile.national_id,
        pension_id: profile.pension_id,
      });
      setProfile(updated);
      updateUser({
        firstName: updated.first_name,
        lastName: updated.last_name,
        email: updated.email,
      });
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update profile";
      setMessage({ type: "error", text: message });
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passwordData.new_password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await changePassword(passwordData);
      setMessage({ type: "success", text: "Password changed successfully!" });
      setPasswordData({ old_password: "", new_password: "" });
      setConfirmPassword("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to change password";
      setMessage({ type: "error", text: message });
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoUpload() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !profile) return;
      setSaving(true);
      try {
        const res = await uploadProfileImage(file);
        let url = "";
        if (res.file_url) url = res.file_url;
        else if (res.upload_id) url = `${window.location.origin}/api/media/document:${res.upload_id}`;
        
        const updated = await updateProfile({
          onboarding_data: { ...profile.onboarding_data, profile_photo_url: url }
        });
        setProfile(updated);
        updateUser({
          profilePictureUrl: url
        });
        setMessage({ type: "success", text: "Profile photo updated!" });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to upload photo";
        setMessage({ type: "error", text: message });
      } finally {
        setSaving(false);
      }
    };
    input.click();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-primary" />
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
