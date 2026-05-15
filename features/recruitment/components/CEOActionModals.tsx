"use client";

import React, { useState, useEffect } from "react";

/**
 * Custom hook to manage form drafts in localStorage.
 * Automatically saves state on change and provides a clear function.
 */
function useDraft<T>(key: string, initialState: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initialState;
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialState;
    } catch (e) {
      return initialState;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  const clearDraft = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  };

  return [state, setState, clearDraft] as const;
}
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Calendar, Briefcase, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadProfileImage } from "@/services/uploadService";

/* ── Overlay backdrop ────────────────────────────────────────── */
function ModalBackdrop({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
    />
  );
}

/* ── Shared modal shell ──────────────────────────────────────── */
function ModalShell({
  title,
  icon: Icon,
  iconColor,
  children,
  onClose,
}: {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <ModalBackdrop onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-background rounded-2xl border border-border shadow-2xl z-[60] flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header - Fixed at top */}
        <div className="flex items-center gap-3 p-4 sm:p-6 pb-2 sm:pb-4 border-b border-border/50">
          <div
            className={`size-8 sm:size-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}
          >
            <Icon className="size-4 sm:size-5" />
          </div>
          <h3 className="text-base sm:text-lg font-bold flex-1 truncate">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-muted transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 pt-4 flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════ CONFIRM MODAL ═══════════ */
export function ConfirmModal({
  applicationId,
  applicantName,
  onConfirm,
  onClose,
}: {
  applicationId: number;
  applicantName: string;
  onConfirm: (note: string) => Promise<void>;
  onClose: () => void;
}) {
  const [note, setNote, clearDraft] = useDraft(`confirm_note_${applicationId}`, "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onConfirm(note);
      clearDraft();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      title="Confirm Application"
      icon={CheckCircle2}
      iconColor="bg-emerald-500/10 text-emerald-600"
      onClose={onClose}
    >
      <p className="text-sm text-muted-foreground mb-4">
        You are about to confirm{" "}
        <strong className="text-foreground">{applicantName}</strong>'s
        application. This action will move them forward in the recruitment
        pipeline.
      </p>
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Note (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note about this confirmation..."
          rows={3}
          className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-sm resize-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
        />
      </div>
      <div className="flex items-center justify-end gap-3 mt-6">
        <Button variant="ghost" onClick={onClose} className="rounded-xl">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          Confirm Application
        </Button>
      </div>
    </ModalShell>
  );
}

/* ═══════════ INVITE INTERVIEW MODAL ═══════════ */
export function InviteInterviewModal({
  applicationId,
  applicantName,
  onInvite,
  onClose,
}: {
  applicationId: number;
  applicantName: string;
  onInvite: (data: {
    datetime: string;
    location: string;
    message: string;
  }) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm, clearDraft] = useDraft(`invite_draft_${applicationId}`, {
    datetime: "",
    location: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const isValid = form.datetime && form.location;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await onInvite({
        datetime: new Date(form.datetime).toISOString(),
        location: form.location,
        message: form.message,
      });
      clearDraft();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      title="Invite to Interview"
      icon={Calendar}
      iconColor="bg-blue-500/10 text-blue-600"
      onClose={onClose}
    >
      <p className="text-sm text-muted-foreground mb-4">
        Schedule an interview with{" "}
        <strong className="text-foreground">{applicantName}</strong>.
      </p>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Date & Time *
          </label>
          <Input
            type="datetime-local"
            value={form.datetime}
            onChange={(e) => setForm({ ...form, datetime: e.target.value })}
            className="h-11 rounded-xl bg-muted/50 border-border/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Location / Link *
          </label>
          <Input
            placeholder="e.g. Zoom link, Office Room 3A"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="h-11 rounded-xl bg-muted/50 border-border/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Message (optional)
          </label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Additional details for the candidate..."
            rows={3}
            className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 mt-6">
        <Button variant="ghost" onClick={onClose} className="rounded-xl">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || !isValid}
          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          Send Invitation
        </Button>
      </div>
    </ModalShell>
  );
}

/* ═══════════ REJECT HIRE MODAL ═══════════ */
export function RejectHireModal({
  applicationId,
  applicantName,
  onReject,
  onClose,
}: {
  applicationId: number;
  applicantName: string;
  onReject: (reason: string) => Promise<void>;
  onClose: () => void;
}) {
  const [reason, setReason, clearDraft] = useDraft(`reject_draft_${applicationId}`, "");
  const [loading, setLoading] = useState(false);

  const isValid = reason.trim().length >= 10;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await onReject(reason.trim());
      clearDraft();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      title="Reject Hire Request"
      icon={X}
      iconColor="bg-red-500/10 text-red-600"
      onClose={onClose}
    >
      <p className="text-sm text-muted-foreground mb-4">
        You are rejecting the hire request for{" "}
        <strong className="text-foreground">{applicantName}</strong>. A reason
        is required and will be recorded and visible to HR Staff.
      </p>
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Rejection Reason <span className="text-red-500">*</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain why this hire request is being rejected (min. 10 characters)..."
          rows={4}
          className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-sm resize-none focus:ring-2 focus:ring-red-500 outline-none transition-all"
        />
        <p className="text-[10px] text-muted-foreground">
          {reason.trim().length}/10 minimum characters
        </p>
      </div>
      <div className="flex items-center justify-end gap-3 mt-6">
        <Button variant="ghost" onClick={onClose} className="rounded-xl">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || !isValid}
          className="rounded-xl bg-red-600 hover:bg-red-700 text-white gap-2"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          Confirm Rejection
        </Button>
      </div>
    </ModalShell>
  );
}

/* ═══════════ HIRE MODAL ═══════════ */
export function HireModal({
  applicationId,
  applicantName,
  onHire,
  onClose,
}: {
  applicationId: number;
  applicantName: string;
  onHire: (data: {
    start_date: string;
    salary: number;
    monthly_salary: number;
    national_id: string;
    pension_id?: string;
    onboarding_data: {
      emergency_contact?: string;
      emergency_phone?: string;
      address?: string;
      bank_name?: string;
      account_number?: string;
      profile_photo_url?: string;
      pension_id?: string;
    };
  }) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm, clearDraft] = useDraft(`hire_draft_${applicationId}`, {
    startDate: "",
    monthlySalary: "",
    nationalId: "",
    pensionId: "",
    emergencyContact: "",
    emergencyPhone: "",
    address: "",
    bankName: "",
    accountNumber: "",
    profilePhotoUrl: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const isValid =
    form.startDate &&
    form.monthlySalary &&
    Number(form.monthlySalary) > 0 &&
    form.nationalId.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await onHire({
        start_date: form.startDate,
        salary: Number(form.monthlySalary),
        monthly_salary: Number(form.monthlySalary),
        national_id: form.nationalId.trim(),
        pension_id: form.pensionId.trim() || undefined,
        onboarding_data: {
          pension_id: form.pensionId.trim() || undefined,
          emergency_contact: form.emergencyContact.trim() || undefined,
          emergency_phone: form.emergencyPhone.trim() || undefined,
          address: form.address.trim() || undefined,
          bank_name: form.bankName.trim() || undefined,
          account_number: form.accountNumber.trim() || undefined,
          profile_photo_url: form.profilePhotoUrl.trim() || undefined,
        },
      });
      clearDraft();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      title="Hire Candidate"
      icon={Briefcase}
      iconColor="bg-violet-500/10 text-violet-600"
      onClose={onClose}
    >
      <p className="text-sm text-muted-foreground mb-4">
        Finalize the hiring of{" "}
        <strong className="text-foreground">{applicantName}</strong>.
      </p>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            National ID Number *
          </label>
          <Input
            placeholder="e.g. ID12345678"
            value={form.nationalId}
            onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
            className="h-11 rounded-xl bg-muted/50 border-border/50 focus:ring-2 focus:ring-violet-500 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Pension ID (optional)
          </label>
          <Input
            placeholder="e.g. PEN-123456"
            value={form.pensionId}
            onChange={(e) => setForm({ ...form, pensionId: e.target.value })}
            className="h-11 rounded-xl bg-muted/50 border-border/50 focus:ring-2 focus:ring-violet-500 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Start Date *
          </label>
          <Input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="h-11 rounded-xl bg-muted/50 border-border/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Salary (Monthly) *
          </label>
          <Input
            type="number"
            placeholder="e.g. 6000"
            value={form.monthlySalary}
            onChange={(e) => setForm({ ...form, monthlySalary: e.target.value })}
            className="h-11 rounded-xl bg-muted/50 border-border/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Emergency Contact Name
          </label>
          <Input
            placeholder="e.g. Jane Doe"
            value={form.emergencyContact}
            onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
            className="h-11 rounded-xl bg-muted/50 border-border/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Emergency Contact Phone
          </label>
          <Input
            placeholder="e.g. +2519..."
            value={form.emergencyPhone}
            onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })}
            className="h-11 rounded-xl bg-muted/50 border-border/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Home Address
          </label>
          <Input
            placeholder="Street, City, Country"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="h-11 rounded-xl bg-muted/50 border-border/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Bank Name
          </label>
          <Input
            placeholder="e.g. Commercial Bank"
            value={form.bankName}
            onChange={(e) => setForm({ ...form, bankName: e.target.value })}
            className="h-11 rounded-xl bg-muted/50 border-border/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Account Number
          </label>
          <Input
            placeholder="e.g. 1000..."
            value={form.accountNumber}
            onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
            className="h-11 rounded-xl bg-muted/50 border-border/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Profile Photo (optional)
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="w-28 h-28 bg-muted/40 rounded-xl overflow-hidden flex items-center justify-center border border-border">
              {previewUrl || form.profilePhotoUrl ? (
                <img
                  src={previewUrl || form.profilePhotoUrl}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-xs text-muted-foreground text-center px-2">
                  No image
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 w-full">
              <input
                id={`profile-upload-${applicationId}`}
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files && e.target.files[0];
                  if (!f) return;
                  setSelectedFile(f);
                  // show local preview
                  const localUrl = URL.createObjectURL(f);
                  setPreviewUrl(localUrl);
                  setUploading(true);
                  setUploadProgress(0);
                  try {
                    const res = await uploadProfileImage(f, (percent) => {
                      setUploadProgress(percent);
                    });
                    // prefer returned file_url, otherwise set to upload id path
                    if (res.file_url) {
                      setForm({ ...form, profilePhotoUrl: res.file_url });
                    } else if (res.upload_id) {
                      setForm({
                        ...form,
                        profilePhotoUrl: `${window.location.origin}/api/media/document:${res.upload_id}`,
                      });
                    }
                  } catch (err) {
                    console.error("Upload failed", err);
                    // keep preview but clear profilePhotoUrl
                    setForm({ ...form, profilePhotoUrl: "" });
                    alert("Image upload failed. Please try again.");
                  } finally {
                    setUploading(false);
                  }
                }}
                className="text-sm"
              />

              <div className="flex items-center gap-2">
                <Button
                  onClick={() =>
                    document
                      .getElementById(`profile-upload-${applicationId}`)
                      ?.click()
                  }
                  className="rounded-xl relative overflow-hidden"
                >
                  <span className="relative z-10">
                    {uploading
                      ? `Uploading ${uploadProgress}%`
                      : previewUrl || form.profilePhotoUrl
                        ? "Change"
                        : "Upload"}
                  </span>
                  {uploading && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="absolute inset-0 bg-primary/20 pointer-events-none"
                    />
                  )}
                </Button>
                {(previewUrl || form.profilePhotoUrl) && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedFile(null);
                      try {
                        if (previewUrl && previewUrl.startsWith("blob:"))
                          URL.revokeObjectURL(previewUrl);
                      } catch (e) {}
                      setPreviewUrl(null);
                      setForm({ ...form, profilePhotoUrl: "" });
                    }}
                    className="rounded-xl"
                  >
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Optional. You can change or remove later from the employee
                profile.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 mt-6">
        <Button variant="ghost" onClick={onClose} className="rounded-xl">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || !isValid}
          className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white gap-2"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          Confirm Hire
        </Button>
      </div>
    </ModalShell>
  );
}
