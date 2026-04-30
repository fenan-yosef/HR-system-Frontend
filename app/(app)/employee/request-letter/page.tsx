"use client";

import { useState } from "react";
import { RoleGuard } from "@/context/RoleGuard";
import { useToast } from "@/components/ui/toast";
import { createLetterRequest } from "@/services/letterService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, FileText } from "lucide-react";

const LETTER_TYPES = [
  { value: "verification", label: "Verification" },
  { value: "experience", label: "Experience" },
] as const;

type LetterTypeValue = (typeof LETTER_TYPES)[number]["value"];

export default function RequestLetterPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    letter_type: "verification" as LetterTypeValue,
    purpose: "",
    target_company: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    field: "letter_type" | "purpose" | "target_company",
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!formData.purpose.trim()) {
      setError("Purpose is required.");
      return;
    }

    if (!formData.target_company.trim()) {
      setError("Target company is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      await createLetterRequest({
        letter_type: formData.letter_type,
        purpose: formData.purpose.trim(),
        target_company: formData.target_company.trim(),
      });
      toast("Letter request submitted successfully.", "success");
      setFormData({
        letter_type: "verification",
        purpose: "",
        target_company: "",
      });
    } catch (err) {
      console.error("Failed to submit letter request", err);
      toast("Failed to submit letter request.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["EMPLOYEE"]}>
      <section className="space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Request Letter</h1>
          <p className="text-muted-foreground">
            Submit a verification or experience letter request for review.
          </p>
        </div>

        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5 text-primary" /> New Request
            </CardTitle>
            <CardDescription>
              HR will review your request and generate a PDF once approved.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="letter_type">Letter Type</Label>
                  <select
                    id="letter_type"
                    value={formData.letter_type}
                    onChange={(event) =>
                      handleChange("letter_type", event.target.value)
                    }
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  >
                    {LETTER_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_company">Target Company</Label>
                  <Input
                    id="target_company"
                    value={formData.target_company}
                    onChange={(event) =>
                      handleChange("target_company", event.target.value)
                    }
                    placeholder="Company name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <textarea
                  id="purpose"
                  value={formData.purpose}
                  onChange={(event) =>
                    handleChange("purpose", event.target.value)
                  }
                  placeholder="Explain why you need the letter"
                  className="min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex items-center justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" /> Submitting
                    </span>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </RoleGuard>
  );
}
