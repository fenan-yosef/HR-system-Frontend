"use client";
import React, { useEffect, useState } from "react";
import * as pensionService from "@/services/pensionService";

export default function HRPensionDashboard() {
  const [items, setItems] = useState<pensionService.PensionRegistration[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    pensionService
      .getAllPensionRegistrations()
      .then((res: any) => setItems(res || []))
      .finally(() => setLoading(false));
  }, []);

  const download = async (id: number) => {
    try {
      const url = await pensionService.downloadOfficialForm(id);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pension_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert("Download failed");
    }
  };

  return (
    <div>
      <h2>Pension Registrations</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Department</th>
              <th>Registration Type</th>
              <th>Status</th>
              <th>Pension ID</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} style={{ borderTop: "1px solid #EEE" }}>
                <td>{it.full_name}</td>
                <td>-</td>
                <td>{it.registration_type}</td>
                <td>{it.pension_status}</td>
                <td>{it.pension_id_number ?? "-"}</td>
                <td>{it.submitted_at ?? "-"}</td>
                <td>
                  <a href={`/hr/pension-registrations/${it.id}`}>View</a>
                  <button style={{ marginLeft: 8 }} onClick={() => download(it.id)}>Download Official Form</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
