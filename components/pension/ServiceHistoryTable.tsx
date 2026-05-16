"use client";
import React from "react";

interface Item {
  organization_name: string;
  start_date?: string | null;
  end_date?: string | null;
  monthly_salary?: number | null;
  termination_reason?: string;
}

interface Props {
  items: Item[];
  onChange: (items: Item[]) => void;
}

export default function ServiceHistoryTable({ items, onChange }: Props) {
  const updateAt = (idx: number, patch: Partial<Item>) => {
    const copy = items.map((it) => ({ ...it }));
    copy[idx] = { ...copy[idx], ...patch };
    onChange(copy);
  };

  const addRow = () => onChange([...(items || []), { organization_name: "", start_date: null, end_date: null }]);
  const removeRow = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 120px 80px", gap: 8, fontWeight: 600 }}>
        <div>Organization</div>
        <div>Start Date</div>
        <div>End Date</div>
        <div>Monthly Salary</div>
        <div></div>
      </div>
      {(items || []).map((row, idx) => (
        <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 120px 80px", gap: 8, marginTop: 8 }}>
          <input value={row.organization_name} onChange={(e) => updateAt(idx, { organization_name: e.target.value })} />
          <input type="date" value={row.start_date ?? ""} onChange={(e) => updateAt(idx, { start_date: e.target.value })} />
          <input type="date" value={row.end_date ?? ""} onChange={(e) => updateAt(idx, { end_date: e.target.value })} />
          <input type="number" value={row.monthly_salary ?? ""} onChange={(e) => updateAt(idx, { monthly_salary: e.target.value ? Number(e.target.value) : null })} />
          <button onClick={() => removeRow(idx)}>Remove</button>
        </div>
      ))}
      <div style={{ marginTop: 8 }}>
        <button onClick={addRow}>Add Service History</button>
      </div>
    </div>
  );
}
