"use client";

import React, { useState } from "react";
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
        className="relative w-full max-w-2xl bg-background rounded-2xl border border-border shadow-2xl z-[60] max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 sm:p-6 pb-2 sm:pb-4">
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
        <div className="p-4 sm:p-6 pt-2 sm:pt-0 max-h-[85vh] overflow-y-auto">
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
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onConfirm(note);
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
  const [datetime, setDatetime] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = datetime && location;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await onInvite({
        datetime: new Date(datetime).toISOString(),
        location,
        message,
      });
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
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            className="h-11 rounded-xl bg-muted/50 border-border/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Location / Link *
          </label>
          <Input
            placeholder="e.g. Zoom link, Office Room 3A"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-11 rounded-xl bg-muted/50 border-border/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Message (optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
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
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = reason.trim().length >= 10;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await onReject(reason.trim());
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
    onboarding_data: {
      emergency_contact?: string;
      emergency_phone?: string;
      address?: string;
      bank_name?: string;
      account_number?: string;
      profile_photo_url?: string;
    };
  }) => Promise<void>;
  onClose: () => void;
}) {
  const [startDate, setStartDate] = useState("");
  const [monthlySalary, setMonthlySalary] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValid =
    startDate &&
    monthlySalary &&
    Number(monthlySalary) > 0 &&
    nationalId.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await onHire({
        start_date: startDate,
        salary: Number(monthlySalary),
        monthly_salary: Number(monthlySalary),
        national_id: nationalId.trim(),
        onboarding_data: {
          emergency_contact: emergencyContact.trim() || undefined,
          emergency_phone: emergencyPhone.trim() || undefined,
          address: address.trim() || undefined,
          bank_name: bankName.trim() || undefined,
          account_number: accountNumber.trim() || undefined,
          profile_photo_url: profilePhotoUrl.trim() || undefined,
        },
      });
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
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
            className="h-11 rounded-xl bg-muted/50 border-border/50 focus:ring-2 focus:ring-violet-500 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Start Date *
          </label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
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
            value={monthlySalary}
            onChange={(e) => setMonthlySalary(e.target.value)}
            className="h-11 rounded-xl bg-muted/50 border-border/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Emergency Contact Name
          </label>
          <Input
            placeholder="e.g. Jane Doe"
            value={emergencyContact}
            onChange={(e) => setEmergencyContact(e.target.value)}
            className="h-11 rounded-xl bg-muted/50 border-border/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Emergency Contact Phone
          </label>
          <Input
            placeholder="e.g. +2519..."
            value={emergencyPhone}
            onChange={(e) => setEmergencyPhone(e.target.value)}
            className="h-11 rounded-xl bg-muted/50 border-border/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Home Address
          </label>
          <Input
            placeholder="Street, City, Country"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="h-11 rounded-xl bg-muted/50 border-border/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Bank Name
          </label>
          <Input
            placeholder="e.g. Commercial Bank"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            className="h-11 rounded-xl bg-muted/50 border-border/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Account Number
          </label>
          <Input
            placeholder="e.g. 1000..."
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="h-11 rounded-xl bg-muted/50 border-border/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Profile Photo (optional)
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="w-28 h-28 bg-muted/40 rounded-xl overflow-hidden flex items-center justify-center border border-border">
              {previewUrl || profilePhotoUrl ? (
                <img
                  src={previewUrl || profilePhotoUrl}
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
                  try {
                    const res = await uploadProfileImage(f);
                    // prefer returned file_url, otherwise set to upload id path
                    if (res.file_url) {
                      setProfilePhotoUrl(res.file_url);
                    } else if (res.upload_id) {
                      setProfilePhotoUrl(
                        `${window.location.origin}/api/media/document:${res.upload_id}`,
                      );
                    }
                  } catch (err) {
                    console.error("Upload failed", err);
                    // keep preview but clear profilePhotoUrl
                    setProfilePhotoUrl("");
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
                  className="rounded-xl"
                >
                  {uploading
                    ? "Uploading..."
                    : previewUrl || profilePhotoUrl
                      ? "Change"
                      : "Upload"}
                </Button>
                {(previewUrl || profilePhotoUrl) && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedFile(null);
                      try {
                        if (previewUrl && previewUrl.startsWith("blob:"))
                          URL.revokeObjectURL(previewUrl);
                      } catch (e) {}
                      setPreviewUrl(null);
                      setProfilePhotoUrl("");
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
