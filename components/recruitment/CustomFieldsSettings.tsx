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
    <Card className="p-4 sm:p-6 border-none shadow-xl rounded-[2rem] overflow-hidden relative group bg-gradient-to-br from-background to-muted/20">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 group-hover:rotate-12 transition-all duration-500">
        <Settings2 className="size-24 sm:size-32" />
      </div>

      <div className="relative z-10 space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-start gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-xl bg-primary/10 text-primary shrink-0">
              <Settings2 className="size-4 sm:size-5" />
            </div>
            <h3 className="text-sm sm:text-lg font-black uppercase tracking-widest leading-tight">Application Fields</h3>
          </div>
          <Button onClick={addField} variant="outline" size="sm" className="rounded-xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] h-7 sm:h-8 shrink-0">
            <Plus className="w-3 h-3 mr-1 sm:mr-2" />
            Add
          </Button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {fields.length === 0 && (
            <div className="text-center py-6 sm:py-8 border-2 border-dashed border-border/40 rounded-2xl text-muted-foreground text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
              No custom fields configured yet.
            </div>
          )}
          {fields.map((field, index) => (
            <div key={index} className="flex gap-2 sm:gap-3 p-3 sm:p-4 border border-border/50 rounded-2xl bg-background/40 backdrop-blur-sm group/item relative">
              <div className="hidden xs:block mt-2 text-muted-foreground shrink-0 cursor-grab active:cursor-grabbing">
                <GripVertical className="w-4 h-4" />
              </div>
              
              <div className="flex-1 flex flex-col gap-3 min-w-0">
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Label</Label>
                    <Input 
                      value={field.label} 
                      onChange={(e) => updateField(index, { label: e.target.value })}
                      placeholder="e.g. Portfolio"
                      className="h-8 rounded-lg border-border/50 text-[11px] font-bold bg-background/50 focus:bg-background transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Type</Label>
                    <select
                      value={field.type}
                      onChange={(e) => updateField(index, { type: e.target.value as CustomFieldType })}
                      className="flex h-8 w-full rounded-lg border border-border/50 bg-background/50 px-2 py-1 text-[11px] font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    >
                      {FIELD_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-1.5 group/check">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          id={`req-${index}`}
                          checked={field.required}
                          onChange={e => updateField(index, { required: e.target.checked })}
                          className="h-4 w-4 rounded border-border/50 text-primary focus:ring-primary/20 cursor-pointer"
                        />
                      </div>
                      <Label htmlFor={`req-${index}`} className="text-[9px] font-black uppercase tracking-widest cursor-pointer whitespace-nowrap">Required</Label>
                    </div>
                    <div className="flex items-center space-x-1.5 group/check">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          id={`ai-${index}`}
                          checked={field.include_in_ai}
                          onChange={e => updateField(index, { include_in_ai: e.target.checked })}
                          className="h-4 w-4 rounded border-border/50 text-primary focus:ring-primary/20 cursor-pointer"
                        />
                      </div>
                      <Label htmlFor={`ai-${index}`} className="flex items-center text-[9px] font-black uppercase tracking-widest cursor-pointer whitespace-nowrap">
                        AI <BrainCircuit className="w-3 h-3 ml-1 text-primary" />
                      </Label>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:bg-destructive/10 h-7 w-7 rounded-lg shrink-0 transition-colors"
                    onClick={() => removeField(index)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {(field.type === "select" || field.type === "multi_select") && (
                  <div className="space-y-1 pt-1">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Options (comma separated)</Label>
                    <Input 
                      value={field.options?.join(", ") || ""} 
                      onChange={(e) => updateField(index, { options: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                      placeholder="Option 1, Option 2"
                      className="h-8 rounded-lg border-border/50 text-[11px] font-medium bg-background/50 focus:bg-background transition-all"
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
            className="w-full rounded-2xl h-12 font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all border-none bg-slate-900 hover:bg-black group/save overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative z-10 flex items-center justify-center gap-2">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Schema...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Save Application Schema</span>
                </>
              )}
            </div>
          </Button>
        </div>
      </div>
    </Card>
  );
}
