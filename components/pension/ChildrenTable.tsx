"use client";
import React from "react";

interface Child {
  name: string;
  date_of_birth?: string | null;
  gender?: string;
  mother_name?: string;
}

interface Props {
  items: Child[];
  onChange: (items: Child[]) => void;
}

export default function ChildrenTable({ items, onChange }: Props) {
  const updateAt = (idx: number, patch: Partial<Child>) => {
    const copy = items.map((it) => ({ ...it }));
    copy[idx] = { ...copy[idx], ...patch };
    onChange(copy);
  };

  const add = () => onChange([...(items || []), { name: "", date_of_birth: null }]);
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div>
      {(items || []).map((c, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
          <input placeholder="Child Name" value={c.name} onChange={(e) => updateAt(i, { name: e.target.value })} />
          <input type="date" value={c.date_of_birth ?? ""} onChange={(e) => updateAt(i, { date_of_birth: e.target.value })} />
          <select value={c.gender ?? ""} onChange={(e) => updateAt(i, { gender: e.target.value })}>
            <option value="">Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <input placeholder="Mother Name" value={c.mother_name ?? ""} onChange={(e) => updateAt(i, { mother_name: e.target.value })} />
          <button onClick={() => remove(i)}>Remove</button>
        </div>
      ))}
      <div style={{ marginTop: 8 }}>
        <button onClick={add}>Add Child</button>
      </div>
    </div>
  );
}
