"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PensionDetailsView from "@/components/pension/PensionDetailsView";
import * as pensionService from "@/services/pensionService";

export default function HRPensionDetails({ params }: { params: { id: string } }) {
  const { id } = params;
  const [data, setData] = useState<pensionService.PensionRegistration | null>(null);
  const [status, setStatus] = useState<string>("");
  const [pensionId, setPensionId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    pensionService.getPensionRegistrationDetails(id).then((res) => {
      setData(res);
      setStatus(res.pension_status ?? "");
      setPensionId(res.pension_id_number ?? "");
    });
  }, [id]);

  const saveStatus = async () => {
    if (!data) return;
    await pensionService.updatePensionStatus(data.id, status, status === "REGISTERED" ? pensionId : undefined);
    alert("Status updated");
    router.refresh();
  };

  const download = async () => {
    if (!data) return;
    const url = await pensionService.downloadOfficialForm(data.id);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pension_${data.id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h2>Pension Registration Details</h2>
      <PensionDetailsView data={data} />

      <div style={{ borderTop: "1px solid #EEE", paddingTop: 8 }}>
        <h4>Update Status</h4>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="NOT_STARTED">NOT_STARTED</option>
          <option value="SUBMITTED">SUBMITTED</option>
          <option value="REGISTERED">REGISTERED</option>
        </select>
        {status === "REGISTERED" && (
          <div>
            <label>Pension ID Number</label>
            <input value={pensionId} onChange={(e) => setPensionId(e.target.value)} />
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={saveStatus}>Save Status</button>
          <button onClick={download}>Download Official Amharic Form</button>
        </div>
      </div>
    </div>
  );
}
