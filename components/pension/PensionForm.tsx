"use client";
import React, { useEffect, useState } from "react";
import * as pensionService from "@/services/pensionService";
import ServiceHistoryTable from "./ServiceHistoryTable";
import ChildrenTable from "./ChildrenTable";
import AttachmentUploader from "./AttachmentUploader";

export default function PensionForm() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Partial<pensionService.PensionRegistration>>({ registration_type: "NEW_REGISTRATION" });
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    setLoading(true);
    pensionService
      .getMyPensionRegistration()
      .then((res) => {
        if (res) setData(res);
      })
      .finally(() => setLoading(false));
  }, []);

  const saveDraft = async () => {
    setLoading(true);
    try {
      if (data?.id) {
        await pensionService.updatePensionRegistration(data.id, data as any);
      } else {
        const created = await pensionService.createPensionRegistration(data as any);
        setData(created);
      }
      if (files.length && data?.id) {
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        await pensionService.uploadPensionAttachments(data.id, fd);
      }
      alert("Saved");
    } catch (e: any) {
      console.error(e);
      alert("Save failed");
    } finally {
      setLoading(false);
    }
  };

  const submitRegistration = async () => {
    // For simplicity reuse saveDraft logic.
    await saveDraft();
    // Optionally update status to SUBMITTED on backend via patch
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div>
        <label>Registration Type</label>
        <div>
          <label>
            <input type="radio" name="regtype" checked={data.registration_type === "NEW_REGISTRATION"} onChange={() => setData({ ...data, registration_type: "NEW_REGISTRATION", pension_id_number: null })} /> New Pension Registration
          </label>
          <label style={{ marginLeft: 12 }}>
            <input type="radio" name="regtype" checked={data.registration_type === "EXISTING_PENSION"} onChange={() => setData({ ...data, registration_type: "EXISTING_PENSION" })} /> Existing Pension ID
          </label>
        </div>
      </div>

      {data.registration_type === "EXISTING_PENSION" && (
        <div>
          <label>Pension ID Number</label>
          <input value={data.pension_id_number ?? ""} onChange={(e) => setData({ ...data, pension_id_number: e.target.value })} />
        </div>
      )}

      <div style={{ borderTop: "1px solid #EEE", paddingTop: 8 }}>
        <h4>Personal Information</h4>
        <input placeholder="Full name" value={data.full_name ?? ""} onChange={(e) => setData({ ...data, full_name: e.target.value })} />
        <input type="date" value={data.date_of_birth ?? ""} onChange={(e) => setData({ ...data, date_of_birth: e.target.value })} />
        <select value={data.nationality_status ?? ""} onChange={(e) => setData({ ...data, nationality_status: e.target.value })}>
          <option value="">Nationality Status</option>
          <option value="By Birth">By Birth</option>
          <option value="Legal Permit">Legal Permit</option>
        </select>
        <input placeholder="Employer Office Name" value={data.employer_office_name ?? ""} onChange={(e) => setData({ ...data, employer_office_name: e.target.value })} />
        <input placeholder="Employer Office ID" value={data.employer_office_id ?? ""} onChange={(e) => setData({ ...data, employer_office_id: e.target.value })} />
        <input placeholder="Office Phone" value={data.office_phone ?? ""} onChange={(e) => setData({ ...data, office_phone: e.target.value })} />
        <input placeholder="Office P.O. Box" value={data.office_po_box ?? ""} onChange={(e) => setData({ ...data, office_po_box: e.target.value })} />
      </div>

      <div style={{ borderTop: "1px solid #EEE", paddingTop: 8 }}>
        <h4>Service History</h4>
        <ServiceHistoryTable items={(data.service_history ?? []) as any} onChange={(s) => setData({ ...data, service_history: s as any })} />
      </div>

      <div style={{ borderTop: "1px solid #EEE", paddingTop: 8 }}>
        <h4>Family Information</h4>
        <div>
          <label>Spouse Name</label>
          <input value={data.spouse_name ?? ""} onChange={(e) => setData({ ...data, spouse_name: e.target.value })} />
          <label>Spouse DOB</label>
          <input type="date" value={data.spouse_date_of_birth ?? ""} onChange={(e) => setData({ ...data, spouse_date_of_birth: e.target.value })} />
        </div>
        <ChildrenTable items={(data.children ?? []) as any} onChange={(c) => setData({ ...data, children: c as any })} />
        <div>
          <label>Father Name</label>
          <input value={data.father_name ?? ""} onChange={(e) => setData({ ...data, father_name: e.target.value })} />
          <label>Mother Name</label>
          <input value={data.mother_name ?? ""} onChange={(e) => setData({ ...data, mother_name: e.target.value })} />
          <label>Livelihood Status</label>
          <input value={data.livelihood_status ?? ""} onChange={(e) => setData({ ...data, livelihood_status: e.target.value })} />
        </div>
      </div>

      <div style={{ borderTop: "1px solid #EEE", paddingTop: 8 }}>
        <h4>Attachments</h4>
        <AttachmentUploader files={files} onChange={(f) => setFiles(f)} />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={saveDraft} disabled={loading}>Save Draft</button>
        <button onClick={submitRegistration} disabled={loading}>Submit Registration</button>
      </div>
    </div>
  );
}
