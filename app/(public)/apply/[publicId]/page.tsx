"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, Check } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, UploadCloud, AlertCircle, FileText, Plus, Trash2, X, Paperclip, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/services/apiClient";

// Helper to convert file to Base64 data URL for easy local testing
const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

export default function PublicApplyPage() {
    const params = useParams();
    const publicId = params.publicId as string;

    const [jobTitle, setJobTitle] = useState<string>("Job Application");
    const [jobDescription, setJobDescription] = useState<string | null>(null);
    const [jobStatus, setJobStatus] = useState<string | null>(null);
    const [jobPostedDate, setJobPostedDate] = useState<string | null>(null);
    const [applicationUrl, setApplicationUrl] = useState<string | null>(null);
    const [isLoadingJob, setIsLoadingJob] = useState(true);
    const [customFields, setCustomFields] = useState<any[]>([]);
    const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});
    const [customFiles, setCustomFiles] = useState<Record<string, File | File[]>>({});

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        cover_letter: "",
    });
    const [cvFile, setCvFile] = useState<File | null>(null);

    const cvInputRef = useRef<HTMLInputElement | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [successData, setSuccessData] = useState<any>(null);
    const [existingDataMsg, setExistingDataMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [copiedTracking, setCopiedTracking] = useState(false);

    useEffect(() => {
        if (!publicId) return;

        const fetchJobDetails = async () => {
            try {
                const isNumeric = /^\d+$/.test(publicId);
                let data: any = null;

                if (!isNumeric) {
                    try {
                        data = await apiFetch(`recruitment/public/job/${publicId}/`, { requiresAuth: false });
                    } catch (e) {
                        try {
                            data = await apiFetch(`job-positions/?public_id=${publicId}`, { requiresAuth: false });
                        } catch (e2) {}
                    }
                } else {
                    data = await apiFetch(`job-positions/${publicId}/share/`, { requiresAuth: false });
                }

                if (data) {
                    let job: any = null;
                    if (data && Array.isArray(data.results)) job = data.results[0];
                    else if (data && data.position) job = data.position;
                    else if (data && data.title) job = data;
                    else if (data && data.application_url && (data.title || data.position)) job = data.position || data;

                    if (job) {
                        if (job.title) setJobTitle(job.title);
                        if (job.description) setJobDescription(job.description);
                        if (job.status) setJobStatus(job.status);
                        if (job.posted_date) setJobPostedDate(job.posted_date);
                        if (job.application_url) setApplicationUrl(job.application_url);
                        if (job.custom_application_fields) {
                            setCustomFields(job.custom_application_fields);
                            // Initialize default values
                            const initialValues: Record<string, any> = {};
                            job.custom_application_fields.forEach((f: any) => {
                                if (f.type === "boolean") initialValues[f.key] = false;
                                else if (f.type === "multi_select") initialValues[f.key] = [];
                            });
                            setCustomFieldValues(initialValues);
                        }
                    } else if (data && data.application_url) {
                        // some responses only return share info
                        setApplicationUrl(data.application_url);
                    }
                }
            } catch (err) {
                console.warn("Could not fetch job metadata", err);
            } finally {
                setIsLoadingJob(false);
            }
        };

        fetchJobDetails();
    }, [publicId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cv') => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setErrorMsg(null);
        setValidationErrors((prev) => ({ ...prev, [type]: "" }));

        const allowedTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        const maxSize = 100 * 1024 * 1024; // 100MB

        if (type === 'cv') {
            const file = files[0];
            if (file.size > maxSize) {
                setValidationErrors((prev) => ({ ...prev, cv: "File is too large (max 100MB)." }));
                return;
            }
            if (!allowedTypes.includes(file.type)) {
                setValidationErrors((prev) => ({ ...prev, cv: "Invalid file type. Please upload PDF, DOCX or Images." }));
                return;
            }
            setCvFile(file);
        }
    };

    const handleCustomFieldChange = (key: string, value: any) => {
        setCustomFieldValues((prev) => ({ ...prev, [key]: value }));
    };

    const handleCustomFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (field.type === "file") {
            setCustomFiles((prev) => ({ ...prev, [field.key]: files[0] }));
        } else if (field.type === "file_list") {
            setCustomFiles((prev) => ({ ...prev, [field.key]: Array.from(files) }));
        }
    };

    const handleRemoveFile = (type: 'cv') => {
        if (type === 'cv') {
            setCvFile(null);
        }
    };

    // Helper to upload a single file and return its ID
    const uploadSingleFile = async (file: File) => {
        const form = new FormData();
        form.append('file', file);

        try {
            const data = await apiFetch<any>("uploads/", {
                method: "POST",
                body: form,
                requiresAuth: false,
            });
            return data?.upload_id || data?.id;
        } catch (err: any) {
            const errorMsg = err?.message || `Failed to upload ${file.name}`;
            throw new Error(errorMsg);
        }
    };

    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg(null);
        setExistingDataMsg(null);
        setValidationErrors({});

        // Basic Validation
        if (!formData.full_name.trim()) setValidationErrors((p) => ({ ...p, full_name: "Required" }));
        if (!formData.email.trim()) setValidationErrors((p) => ({ ...p, email: "Required" }));
        if (!formData.phone.trim()) setValidationErrors((p) => ({ ...p, phone: "Required" }));
        if (!cvFile) setValidationErrors((p) => ({ ...p, cv: "CV is required" }));

        if (!formData.full_name || !formData.email || !formData.phone || !cvFile) {
            setIsSubmitting(false);
            return;
        }

        try {
            setUploadProgress(10);
            
            // 1. Upload CV
            const cvId = await uploadSingleFile(cvFile);
            setUploadProgress(40);

            // 2. Handle Custom Fields (Files)
            const submissionCustomValues = { ...customFieldValues };
            for (const field of customFields) {
                if (field.type === 'file' && customFiles[field.key]) {
                    const fid = await uploadSingleFile(customFiles[field.key] as File);
                    submissionCustomValues[field.key] = fid;
                } else if (field.type === 'file_list' && customFiles[field.key]) {
                    const fids = await Promise.all((customFiles[field.key] as File[]).map(f => uploadSingleFile(f)));
                    submissionCustomValues[field.key] = fids;
                }
            }

            // 5. Submit application
            const payload = {
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone,
                upload_id: cvId,
                cover_letter: formData.cover_letter || undefined,
                custom_field_values: Object.keys(submissionCustomValues).length > 0 ? submissionCustomValues : undefined,
            };

            try {
                const data = await apiFetch<any>(`recruitment/public/apply/${publicId}/`, {
                    method: 'POST',
                    body: JSON.stringify(payload),
                    requiresAuth: false,
                });

                setUploadProgress(100);
                setSuccessData(data || { success: true });
            } catch (err: any) {
                // Handle specific API errors
                let detail = err.message || "";
                
                // apiFetch throws with "API request failed with status 400 - { ... }"
                if (detail.includes("status 400")) {
                    try {
                        // Attempt to parse validation errors from the message suffix
                        const jsonPart = detail.split(" - ")[1];
                        const errData = JSON.parse(jsonPart);
                        if (errData.detail?.toLowerCase().includes("already applied")) {
                            setExistingDataMsg(errData.detail);
                        } else {
                            setValidationErrors(errData);
                            setErrorMsg('Please correct the highlighted errors.');
                        }
                    } catch {
                        setErrorMsg('Validation failed. Please check your inputs.');
                    }
                } else if (detail.includes("status 200")) {
                   // Some legacy endpoints might return 200 for "already updated"
                   setExistingDataMsg('Your application has been updated/already exists.');
                } else {
                    setErrorMsg(detail || 'An unexpected error occurred. Please try again.');
                }
            }

        } catch (err: any) {
            console.error('Apply error:', err);
            setErrorMsg('Network error. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setUploadProgress(0), 1000);
        }
    };

    if (successData) {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4">
                <Card className="border-green-200 bg-green-50 shadow-md">
                    <CardHeader className="text-center pb-4">
                        <div className="mx-auto bg-green-100 p-4 rounded-full w-fit mb-4">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                        <CardTitle className="text-3xl font-bold text-green-800">Application Submitted!</CardTitle>
                        {existingDataMsg && (
                            <p className="text-green-700 mt-2 font-medium">{existingDataMsg}</p>
                        )}
                        <CardDescription className="text-green-700 text-lg mt-2">
                            Thank you for applying for <strong>{jobTitle}</strong>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 text-center">
                        {successData.tracking_code ? (
                            <div className="bg-white p-6 rounded-xl border border-green-200 shadow-sm mx-auto max-w-sm">
                                <p className="text-sm text-gray-500 mb-2 font-semibold uppercase tracking-wider">Your Tracking Code</p>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-center justify-between gap-4">
                                    <p className="text-3xl font-mono font-bold text-gray-800 tracking-wider select-all break-words">
                                        {successData.tracking_code}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            try {
                                                await navigator.clipboard.writeText(successData.tracking_code);
                                                setCopiedTracking(true);
                                                setTimeout(() => setCopiedTracking(false), 2000);
                                            } catch (e) {
                                                console.error('Copy failed', e);
                                            }
                                        }}
                                        className="ml-2 inline-flex items-center gap-2 rounded px-3 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold"
                                    >
                                        {copiedTracking ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                        <span>{copiedTracking ? 'Copied' : 'Copy'}</span>
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                                    A tracking code has been emailed to you. Use it to track your application status.
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600">
                                We have received your application and will contact you via email shortly.
                            </p>
                        )}
                        <div className="pt-6">
                            <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-100 w-full sm:w-auto" onClick={() => window.location.href = '/'}>
                                Return to Home
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">

                <div className="text-center space-y-2">
                    {isLoadingJob ? (
                        <div className="h-10 w-64 bg-gray-200 animate-pulse rounded mx-auto"></div>
                    ) : (
                        <div className="space-y-3">
                            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                                Apply for <span className="text-primary">{jobTitle}</span>
                            </h1>
                            <div className="flex items-center gap-3 justify-center">
                                {jobStatus && (
                                    <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${jobStatus === 'open' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
                                        {jobStatus.replace('_', ' ').toUpperCase()}
                                    </span>
                                )}
                                {jobPostedDate && (
                                    <span className="text-sm text-gray-500">Posted {new Date(jobPostedDate).toLocaleDateString()}</span>
                                )}
                                {applicationUrl && (
                                    <a href={applicationUrl} target="_blank" rel="noreferrer" className="text-sm text-primary underline">Open application (backend)</a>
                                )}
                            </div>
                        </div>
                    )}
                    {jobDescription && (
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-4">
                            {jobDescription.length > 150 ? `${jobDescription.substring(0, 150)}...` : jobDescription}
                        </p>
                    )}
                </div>

                <Card className="shadow-xl border-0 overflow-hidden rounded-2xl">
                    <div className="h-2 w-full bg-gradient-to-r from-primary to-blue-400" />
                    <CardHeader className="bg-white pb-4 border-b border-gray-100">
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <FileText className="text-primary h-6 w-6" /> candidate Details
                        </CardTitle>
                        <CardDescription className="text-base">
                            Please provide your accurate information below.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="bg-white pt-8">
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {errorMsg && (
                                <div className="flex items-center gap-3 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-md">
                                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                    <p className="text-sm font-medium">{errorMsg}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                <div className="sm:col-span-2 space-y-2">
                                    <Label htmlFor="full_name" className="text-sm font-semibold text-gray-900">Full Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="full_name"
                                        name="full_name"
                                        placeholder="E.g. Jane Doe"
                                        value={formData.full_name}
                                        onChange={handleInputChange}
                                        className={`h-12 ${validationErrors.full_name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                        disabled={isSubmitting}
                                    />
                                    {validationErrors.full_name && <p className="text-red-500 text-xs mt-1">{validationErrors.full_name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-semibold text-gray-900">Email Address <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="jane@example.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`h-12 ${validationErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                        disabled={isSubmitting}
                                    />
                                    {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-sm font-semibold text-gray-900">Phone Number <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        placeholder="+251 911 234 567"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className={`h-12 ${validationErrors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                        disabled={isSubmitting}
                                    />
                                    {validationErrors.phone && <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>}
                                </div>

                                <div className="sm:col-span-2 space-y-4">
                                    <div className="space-y-3">
                                        <Label htmlFor="cv" className="text-base font-bold text-gray-900">Resume / CV <span className="text-red-500">*</span></Label>
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => !isSubmitting && cvInputRef.current?.click()}
                                            onKeyDown={(e) => { if (!isSubmitting && (e.key === 'Enter' || e.key === ' ')) cvInputRef.current?.click(); }}
                                            className={`group relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-all duration-300 ${cvFile ? 'border-primary/50 bg-primary/5 shadow-inner' : 'border-gray-200 hover:border-primary/40 hover:bg-gray-50 bg-white'} ${validationErrors.cv ? 'border-red-500 bg-red-50/30' : ''}`}
                                        >
                                            <input
                                                id="cv"
                                                name="cv"
                                                ref={cvInputRef}
                                                type="file"
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                className="sr-only"
                                                onChange={(e) => handleFileChange(e, 'cv')}
                                                disabled={isSubmitting}
                                            />
                                            
                                            <div className="flex flex-col items-center text-center">
                                                <div className={`mb-4 p-3 rounded-2xl transition-all duration-300 ${cvFile ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                                    <UploadCloud className="h-10 w-10" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-lg font-bold text-gray-800">
                                                        {cvFile ? cvFile.name : 'Upload a file'}
                                                    </p>
                                                    <p className="text-sm text-gray-500 font-medium tracking-tight">
                                                        {cvFile ? `(${(cvFile.size / 1024 / 1024).toFixed(2)} MB)` : 'PDF, DOCX or Images up to 100MB'}
                                                    </p>
                                                </div>

                                                {cvFile && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); handleRemoveFile('cv'); }}
                                                        className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition-colors"
                                                    >
                                                        <Trash2 className="size-4" /> Remove CV
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {validationErrors.cv && <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-bold italic"><AlertCircle className="h-3 w-3" /> {validationErrors.cv}</p>}
                                    </div>

                                    {/* Cover Letter Section */}
                                    <div className="space-y-3 pt-4 border-t border-gray-100/50">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="cover_letter" className="text-base font-bold text-gray-900">Cover Letter</Label>
                                            <span className="text-sm text-gray-400 font-medium">(Optional)</span>
                                        </div>
                                        <textarea
                                            id="cover_letter"
                                            name="cover_letter"
                                            rows={5}
                                            placeholder="Tell us why you are a great fit for this role..."
                                            value={formData.cover_letter}
                                            onChange={handleInputChange}
                                            className="flex w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 resize-y transition-all"
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    {/* Dynamic Custom Fields Section */}
                                    {customFields.length > 0 && (
                                        <div className="space-y-6 pt-6 border-t border-gray-100/50">
                                            <h3 className="text-lg font-bold text-gray-900">Additional Information</h3>
                                            <div className="grid gap-6">
                                                {customFields.map((field) => (
                                                    <div key={field.key} className="space-y-2">
                                                        <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                            {field.label}
                                                            {field.required && <span className="text-red-500">*</span>}
                                                        </Label>

                                                        {field.type === "short_text" && (
                                                            <Input 
                                                                value={customFieldValues[field.key] || ""}
                                                                onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                                                                placeholder={field.label}
                                                                className="rounded-xl"
                                                                required={field.required}
                                                            />
                                                        )}

                                                        {field.type === "long_text" && (
                                                            <textarea
                                                                value={customFieldValues[field.key] || ""}
                                                                onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                                                                rows={3}
                                                                className="flex w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-primary outline-none transition-all"
                                                                placeholder={field.label}
                                                                required={field.required}
                                                            />
                                                        )}

                                                        {field.type === "number" || field.type === "integer" ? (
                                                            <Input 
                                                                type="number"
                                                                value={customFieldValues[field.key] || ""}
                                                                onChange={(e) => handleCustomFieldChange(field.key, field.type === "integer" ? parseInt(e.target.value) : parseFloat(e.target.value))}
                                                                placeholder={field.label}
                                                                className="rounded-xl"
                                                                required={field.required}
                                                            />
                                                        ) : null}

                                                        {field.type === "email" && (
                                                            <Input 
                                                                type="email"
                                                                value={customFieldValues[field.key] || ""}
                                                                onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                                                                placeholder="email@example.com"
                                                                className="rounded-xl"
                                                                required={field.required}
                                                            />
                                                        )}

                                                        {field.type === "url" && (
                                                            <Input 
                                                                type="url"
                                                                value={customFieldValues[field.key] || ""}
                                                                onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                                                                placeholder="https://..."
                                                                className="rounded-xl"
                                                                required={field.required}
                                                            />
                                                        )}

                                                        {(field.type === "file" || field.type === "file_list") && (
                                                            <div className="space-y-2">
                                                                <Input 
                                                                    type="file"
                                                                    multiple={field.type === "file_list"}
                                                                    onChange={(e) => handleCustomFileChange(e, field)}
                                                                    className="rounded-xl"
                                                                    required={field.required && !customFiles[field.key]}
                                                                />
                                                                {customFiles[field.key] && (
                                                                    <p className="text-xs text-primary font-bold">
                                                                        {Array.isArray(customFiles[field.key]) 
                                                                            ? `${(customFiles[field.key] as File[]).length} files selected` 
                                                                            : (customFiles[field.key] as File).name}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}

                                                        {field.type === "boolean" && (
                                                            <div className="flex items-center gap-2">
                                                                <input 
                                                                    type="checkbox"
                                                                    checked={!!customFieldValues[field.key]}
                                                                    onChange={(e) => handleCustomFieldChange(field.key, e.target.checked)}
                                                                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                                                />
                                                                <span className="text-sm font-medium text-gray-600">Yes / No</span>
                                                            </div>
                                                        )}

                                                        {(field.type === "select" || field.type === "multi_select") && (
                                                                <select 
                                                                    multiple={field.type === "multi_select"}
                                                                    value={customFieldValues[field.key] || (field.type === "multi_select" ? [] : "")}
                                                                    onChange={(e) => {
                                                                        if (field.type === "multi_select") {
                                                                            const vals = Array.from(e.target.selectedOptions).map(o => o.value);
                                                                            handleCustomFieldChange(field.key, vals);
                                                                        } else {
                                                                            handleCustomFieldChange(field.key, e.target.value);
                                                                        }
                                                                    }}
                                                                    className="flex w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-primary outline-none transition-all"
                                                                    required={field.required}
                                                                >
                                                                    {field.type !== "multi_select" && <option value="">Select an option</option>}
                                                                    {field.options?.map((opt: string) => (
                                                                        <option key={opt} value={opt}>{opt}</option>
                                                                    ))}
                                                                </select>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <Button
                                    type="submit"
                                    className="w-full h-14 text-lg font-bold shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-3">
                                            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Submitting... {uploadProgress > 0 && uploadProgress < 100 ? `${uploadProgress}%` : ''}</span>
                                        </div>
                                    ) : "Submit Application"}
                                </Button>
                                <p className="text-center text-xs text-gray-400 mt-4">
                                    By submitting this application, you agree to our privacy policy and terms of service.
                                </p>
                            </div>

                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
