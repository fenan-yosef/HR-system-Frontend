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

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        cover_letter: "",
    });
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [certificates, setCertificates] = useState<File[]>([]);
    const [supportingDocs, setSupportingDocs] = useState<File[]>([]);

    const cvInputRef = useRef<HTMLInputElement | null>(null);
    const certInputRef = useRef<HTMLInputElement | null>(null);
    const docInputRef = useRef<HTMLInputElement | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [successData, setSuccessData] = useState<any>(null);
    const [existingDataMsg, setExistingDataMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [copiedTracking, setCopiedTracking] = useState(false);

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/";

    useEffect(() => {
        if (!publicId) return;

        const fetchJobDetails = async () => {
            try {
                const isNumeric = /^\d+$/.test(publicId);
                // Try the public job endpoint first (no auth), then fall back to older endpoints
                const candidates: string[] = [];
                if (!isNumeric) {
                    candidates.push(`${baseUrl}recruitment/public/job/${publicId}/`); // preferred public metadata
                    candidates.push(`${baseUrl}job-positions/?public_id=${publicId}`); // fallback
                } else {
                    candidates.push(`${baseUrl}job-positions/${publicId}/share/`); // admin/share route for numeric ids
                }

                let data: any = null;
                for (const url of candidates) {
                    try {
                        const res = await fetch(url);
                        if (!res.ok) continue;
                        data = await res.json();
                        break;
                    } catch (e) {
                        // try next
                    }
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
    }, [publicId, baseUrl]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cv' | 'certificates' | 'docs') => {
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
        } else {
            const newFiles: File[] = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.size > maxSize) {
                    toast(`File ${file.name} is too large (max 100MB).`, 'warning');
                    continue;
                }
                if (!allowedTypes.includes(file.type)) {
                    toast(`Invalid type for ${file.name}.`, 'warning');
                    continue;
                }
                newFiles.push(file);
            }

            if (type === 'certificates') {
                setCertificates((prev) => [...prev, ...newFiles]);
            } else {
                setSupportingDocs((prev) => [...prev, ...newFiles]);
            }
        }
    };

    const handleRemoveFile = (type: 'cv' | 'certificates' | 'docs', index?: number) => {
        if (type === 'cv') {
            setCvFile(null);
        } else if (type === 'certificates') {
            setCertificates((prev) => prev.filter((_, i) => i !== index));
        } else {
            setSupportingDocs((prev) => prev.filter((_, i) => i !== index));
        }
    };

    // Helper to upload a single file and return its ID
    const uploadSingleFile = async (file: File) => {
        const uploadUrl = `${baseUrl}uploads/`;
        const form = new FormData();
        form.append('file', file);

        const res = await fetch(uploadUrl, { method: 'POST', body: form });
        if (!res.ok) {
            const errBody = await res.json().catch(() => null);
            const errorMsg = errBody?.file || errBody?.file_data || errBody?.detail || errBody?.message || `Failed to upload ${file.name}`;
            throw new Error(errorMsg);
        }
        const data = await res.json();
        return data?.upload_id || data?.id;
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

            // 2. Upload Certificates
            let certificateIds: number[] = [];
            if (certificates.length > 0) {
                certificateIds = await Promise.all(certificates.map(f => uploadSingleFile(f)));
            }
            setUploadProgress(60);

            // 3. Upload Supporting Docs
            let documentIds: number[] = [];
            if (supportingDocs.length > 0) {
                documentIds = await Promise.all(supportingDocs.map(f => uploadSingleFile(f)));
            }
            setUploadProgress(80);

            // 4. Submit application
            const payload = {
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone,
                upload_id: cvId,
                certificate_upload_ids: certificateIds,
                other_upload_ids: documentIds,
                cover_letter: formData.cover_letter || undefined,
            };

            const applyUrl = `${baseUrl}recruitment/public/apply/${publicId}/`;
            const response = await fetch(applyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            setUploadProgress(95);

            const data = await response.json().catch(() => null);

            if (response.status === 201 || response.status === 200) {
                // Treat both 201 and 200 as success. Show tracking_code even if tracking_email_sent is false.
                setSuccessData(data || { success: true });
                if (response.status === 200) setExistingDataMsg('Your application has been updated/already exists.');
            } else if (response.status === 400) {
                if (data && typeof data === 'object') {
                    setValidationErrors(data);
                    setErrorMsg('Please correct the highlighted errors.');
                } else {
                    setErrorMsg('Validation failed. Please check your inputs.');
                }
            } else {
                setErrorMsg(data?.detail || data?.message || 'An unexpected error occurred. Please try again.');
            }

            setUploadProgress(100);

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

                                    {/* Certificates & Certifications Section */}
                                    <div className="space-y-4 pt-4 border-t border-gray-100/50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-base font-bold text-gray-900">Certificates & Certifications</Label>
                                                <span className="text-sm text-gray-400 font-medium">(Optional)</span>
                                            </div>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="sm" 
                                                className="rounded-xl font-bold h-9 border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-all"
                                                onClick={() => certInputRef.current?.click()}
                                                disabled={isSubmitting}
                                            >
                                                <Plus className="size-4 mr-1.5" /> Add Certificate
                                                <input 
                                                    type="file" 
                                                    ref={certInputRef} 
                                                    className="hidden" 
                                                    multiple 
                                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                    onChange={(e) => handleFileChange(e, 'certificates')} 
                                                />
                                            </Button>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            {certificates.length === 0 ? (
                                                <p className="text-sm text-gray-400 font-medium italic">No certificates added yet.</p>
                                            ) : (
                                                <div className="grid gap-2">
                                                    {certificates.map((file, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 group animate-in slide-in-from-left-2 fade-in">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                                                    <Paperclip className="size-4 text-primary" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-gray-700 truncate max-w-[200px] sm:max-w-md">{file.name}</p>
                                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                                </div>
                                                            </div>
                                                            <button 
                                                                type="button" 
                                                                onClick={() => handleRemoveFile('certificates', idx)}
                                                                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                                            >
                                                                <X className="size-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Other Supporting Documents Section */}
                                    <div className="space-y-4 pt-4 border-t border-gray-100/50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-base font-bold text-gray-900">Other Supporting Documents</Label>
                                                <span className="text-sm text-gray-400 font-medium">(Optional)</span>
                                            </div>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="sm" 
                                                className="rounded-xl font-bold h-9 border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-all"
                                                onClick={() => docInputRef.current?.click()}
                                                disabled={isSubmitting}
                                            >
                                                <Plus className="size-4 mr-1.5" /> Add Document
                                                <input 
                                                    type="file" 
                                                    ref={docInputRef} 
                                                    className="hidden" 
                                                    multiple 
                                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                    onChange={(e) => handleFileChange(e, 'docs')} 
                                                />
                                            </Button>
                                        </div>

                                        <div className="space-y-2">
                                            {supportingDocs.length === 0 ? (
                                                <p className="text-sm text-gray-400 font-medium italic">No additional documents added.</p>
                                            ) : (
                                                <div className="grid gap-2">
                                                    {supportingDocs.map((file, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 group animate-in slide-in-from-left-2 fade-in">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                                                    <Paperclip className="size-4 text-blue-500" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-gray-700 truncate max-w-[200px] sm:max-w-md">{file.name}</p>
                                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                                </div>
                                                            </div>
                                                            <button 
                                                                type="button" 
                                                                onClick={() => handleRemoveFile('docs', idx)}
                                                                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                                            >
                                                                <X className="size-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
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
