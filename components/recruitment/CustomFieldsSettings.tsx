"use client";

import { useState, useEffect } from "react";
import { 
  CustomApplicationField, 
  CustomFieldType 
} from "@/types/recruitment";
import { 
  fetchCustomApplicationFields, 
  updateCustomApplicationFields 
} from "@/services/recruitmentService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Save, 
  Loader2,
  BrainCircuit,
  Settings2
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface CustomFieldsSettingsProps {
  positionId: number;
}

const FIELD_TYPES: { label: string; value: CustomFieldType }[] = [
  { label: "Short Text", value: "short_text" },
  { label: "Long Text", value: "long_text" },
  { label: "Number", value: "number" },
  { label: "Integer", value: "integer" },
  { label: "Boolean", value: "boolean" },
  { label: "Select (Dropdown)", value: "select" },
  { label: "Multi Select", value: "multi_select" },
  { label: "Date", value: "date" },
  { label: "File", value: "file" },
  { label: "File List", value: "file_list" },
  { label: "Email", value: "email" },
  { label: "URL", value: "url" },
  { label: "Phone", value: "phone" },
];

export function CustomFieldsSettings({ positionId }: CustomFieldsSettingsProps) {
  const [fields, setFields] = useState<CustomApplicationField[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadFields() {
      try {
        const data = await fetchCustomApplicationFields(positionId);
        setFields(data.custom_application_fields || []);
      } catch (error) {
        console.error("Failed to load custom fields:", error);
      } finally {
        setLoading(false);
      }
    }
    loadFields();
  }, [positionId]);

  const addField = () => {
    const newField: CustomApplicationField = {
      label: "",
      type: "short_text",
      required: false,
      include_in_ai: true,
      order: fields.length + 1,
    };
    setFields([...fields, newField]);
  };

  const removeField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
  };

  const updateField = (index: number, updates: Partial<CustomApplicationField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const saveFields = async () => {
    setSaving(true);
    try {
      await updateCustomApplicationFields(positionId, {
        custom_application_fields: fields,
      });
    } catch (error) {
      console.error("Failed to save fields:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 font-black uppercase tracking-widest text-[10px]">Loading custom fields...</span>
      </div>
    );
  }

  return (
    <Card className="p-6 border-none shadow-xl rounded-3xl overflow-hidden relative group bg-gradient-to-br from-background to-muted/20">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 group-hover:rotate-12 transition-all duration-500">
        <Settings2 className="size-32" />
      </div>

      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Settings2 className="size-5" />
            </div>
            <h3 className="text-xl font-black tracking-tight uppercase tracking-widest">Application Fields</h3>
          </div>
          <Button onClick={addField} variant="outline" size="sm" className="rounded-xl font-black uppercase tracking-widest text-[10px] h-8">
            <Plus className="w-3 h-3 mr-2" />
            Add Field
          </Button>
        </div>

        <div className="space-y-4">
          {fields.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed rounded-2xl text-muted-foreground text-[10px] font-black uppercase tracking-widest">
              No custom fields configured for this job yet.
            </div>
          )}
          {fields.map((field, index) => (
            <div key={index} className="flex items-start gap-3 p-4 border border-border/50 rounded-2xl bg-background/50 group/item">
              <div className="mt-2 text-muted-foreground">
                <GripVertical className="w-4 h-4" />
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Label</Label>
                  <Input 
                    value={field.label} 
                    onChange={(e) => updateField(index, { label: e.target.value })}
                    placeholder="e.g. Portfolio URL"
                    className="h-9 rounded-xl border-border/50 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</Label>
                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, { type: e.target.value as CustomFieldType })}
                    className="flex h-9 w-full rounded-xl border border-border/50 bg-background px-3 py-1 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    {FIELD_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-6 pt-5">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`req-${index}`}
                      checked={field.required}
                      onChange={e => updateField(index, { required: e.target.checked })}
                      className="h-4 w-4 rounded border-border/50 text-primary focus:ring-primary/20"
                    />
                    <Label htmlFor={`req-${index}`} className="text-[10px] font-black uppercase tracking-widest cursor-pointer">Required</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`ai-${index}`}
                      checked={field.include_in_ai}
                      onChange={e => updateField(index, { include_in_ai: e.target.checked })}
                      className="h-4 w-4 rounded border-border/50 text-primary focus:ring-primary/20"
                    />
                    <Label htmlFor={`ai-${index}`} className="flex items-center text-[10px] font-black uppercase tracking-widest cursor-pointer">
                      AI <BrainCircuit className="w-3 h-3 ml-1 text-primary" />
                    </Label>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:bg-destructive/10 ml-auto h-8 w-8 rounded-lg"
                    onClick={() => removeField(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {(field.type === "select" || field.type === "multi_select") && (
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Options (comma separated)</Label>
                    <Input 
                      value={field.options?.join(", ") || ""} 
                      onChange={(e) => updateField(index, { options: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                      placeholder="Option 1, Option 2, Option 3"
                      className="h-9 rounded-xl border-border/50 text-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <Button 
            onClick={saveFields} 
            disabled={saving} 
            className="w-full rounded-2xl h-11 font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all border-none"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Application Schema
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
