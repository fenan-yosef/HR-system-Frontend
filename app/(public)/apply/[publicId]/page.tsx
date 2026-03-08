"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, UploadCloud, AlertCircle, FileText } from "lucide-react";

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
    const [isLoadingJob, setIsLoadingJob] = useState(true);

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        cover_letter: "",
    });
    const [cvFile, setCvFile] = useState<File | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [successData, setSuccessData] = useState<any>(null);
    const [existingDataMsg, setExistingDataMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/";

    useEffect(() => {
        if (!publicId) return;

        const fetchJobDetails = async () => {
            try {
                const isNumeric = /^\d+$/.test(publicId);
                let fetchUrl = "";

                if (isNumeric) {
                    // If admin provided numeric ID
                    fetchUrl = `${baseUrl}job-positions/${publicId}/share/`;
                } else {
                    // Otherwise fetch by public_id UUID
                    fetchUrl = `${baseUrl}job-positions/?public_id=${publicId}`;
                }

                const res = await fetch(fetchUrl);
                if (res.ok) {
                    const data = await res.json();
                    // API could return an array (for ?public_id=) or an object (for /share/)
                    const job = Array.isArray(data.results) ? data.results[0] : (Array.isArray(data) ? data[0] : data);
                    if (job && job.title) {
                        setJobTitle(job.title);
                        if (job.description) setJobDescription(job.description);
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setErrorMsg(null);
        setValidationErrors((prev) => ({ ...prev, cv: "" }));

        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setValidationErrors((prev) => ({ ...prev, cv: "File is too large (max 5MB)." }));
                setCvFile(null);
                return;
            }

            const allowedTypes = [
                "application/pdf",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/msword",
            ];

            if (!allowedTypes.includes(file.type)) {
                setValidationErrors((prev) => ({ ...prev, cv: "Please upload a PDF or DOCX file." }));
                setCvFile(null);
                return;
            }

            setCvFile(file);
        }
    };

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
            // 1. "Upload" File (Using base64 data URL convert as quick test option)
            setUploadProgress(25);
            const cvDataUrl = await convertFileToBase64(cvFile);
            setUploadProgress(50);

            const payload = {
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone,
                cv_path: cvDataUrl,
                cover_letter: formData.cover_letter,
            };

            setUploadProgress(75);

            // 2. Submit Application JSON
            const applyUrl = `${baseUrl}recruitment/public/apply/${publicId}/`;
            const response = await fetch(applyUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify(payload),
            });

            setUploadProgress(100);

            const data = await response.json().catch(() => null);

            if (response.status === 201) {
                setSuccessData(data || { success: true });
            } else if (response.status === 200) {
                setSuccessData(data || { success: true });
                setExistingDataMsg("Your application has been updated/already exists.");
            } else if (response.status === 400) {
                if (data && typeof data === 'object') {
                    // If backend returns field-specific errors
                    setValidationErrors(data);
                    setErrorMsg("Please correct the highlighted errors.");
                } else {
                    setErrorMsg("Validation failed. Please check your inputs.");
                }
            } else {
                setErrorMsg(data?.detail || data?.message || "An unexpected error occurred. Please try again.");
            }

        } catch (err: any) {
            console.error("Apply error:", err);
            setErrorMsg("Network error. Please check your connection and try again.");
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
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <p className="text-3xl font-mono font-bold text-gray-800 tracking-wider select-all">
                                        {successData.tracking_code}
                                    </p>
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
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                            Apply for <span className="text-primary">{jobTitle}</span>
                        </h1>
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

                                <div className="sm:col-span-2 space-y-2">
                                    <Label htmlFor="cv" className="text-sm font-semibold text-gray-900">Resume / CV <span className="text-red-500">*</span></Label>
                                    <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-colors ${cvFile ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50 bg-gray-50'} ${validationErrors.cv ? 'border-red-500 bg-red-50/50' : ''}`}>
                                        <div className="space-y-2 text-center">
                                            <UploadCloud className={`mx-auto h-10 w-10 ${cvFile ? 'text-primary' : 'text-gray-400'}`} />
                                            <div className="flex text-sm text-gray-600 justify-center">
                                                <label
                                                    htmlFor="cv"
                                                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary px-2"
                                                >
                                                    <span>{cvFile ? 'Change File' : 'Upload a file'}</span>
                                                    <input
                                                        id="cv"
                                                        name="cv"
                                                        type="file"
                                                        accept=".pdf,.doc,.docx"
                                                        className="sr-only"
                                                        onChange={handleFileChange}
                                                        disabled={isSubmitting}
                                                    />
                                                </label>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {cvFile ? (
                                                    <span className="font-semibold text-gray-900">{cvFile.name} ({(cvFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                                                ) : (
                                                    "PDF, DOCX up to 5MB"
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    {validationErrors.cv && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {validationErrors.cv}</p>}
                                </div>

                                <div className="sm:col-span-2 space-y-2">
                                    <Label htmlFor="cover_letter" className="text-sm font-semibold text-gray-900">Cover Letter <span className="text-gray-400 font-normal">(Optional)</span></Label>
                                    <textarea
                                        id="cover_letter"
                                        name="cover_letter"
                                        rows={4}
                                        placeholder="Tell us why you are a great fit for this role..."
                                        value={formData.cover_letter}
                                        onChange={handleInputChange}
                                        className="flex w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                                        disabled={isSubmitting}
                                    />
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
