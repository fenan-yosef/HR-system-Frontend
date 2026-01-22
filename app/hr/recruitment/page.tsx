"use client";

import React, { useMemo, useState } from "react";
import ActionButton from "@/components/ui/action-button";

type JobStatus = "Open" | "Closed";

type JobPosting = {
  id: string;
  title: string;
  department: string;
  location: string;
  applicants: number;
  status: JobStatus;
};

const JOBS: JobPosting[] = [
  { id: "J-001", title: "Software Engineer", department: "IT", location: "Addis Ababa", applicants: 42, status: "Open" },
  { id: "J-002", title: "Marketing Specialist", department: "Marketing", location: "Adama", applicants: 28, status: "Open" },
  { id: "J-003", title: "Sales Manager", department: "Sales", location: "Addis Ababa", applicants: 15, status: "Closed" },
  { id: "J-004", title: "HR Coordinator", department: "Human Resources", location: "Adama", applicants: 33, status: "Open" },
  { id: "J-005", title: "Data Analyst", department: "IT", location: "Addis Ababa", applicants: 19, status: "Open" },
  { id: "J-006", title: "Customer Support Rep", department: "Customer Service", location: "Adama", applicants: 24, status: "Closed" },
];

const DEPARTMENTS = ["All", "IT", "Marketing", "Sales", "Human Resources", "Customer Service"] as const;
const LOCATIONS = ["All", "Addis Ababa", "Adama"] as const;
const STATUSES = ["All", "Open", "Closed"] as const;

export default function RecruitmentPage() {
  const [department, setDepartment] = useState<(typeof DEPARTMENTS)[number]>("All");
  const [location, setLocation] = useState<(typeof LOCATIONS)[number]>("All");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("All");
  const [q, setQ] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return JOBS.filter((j) => {
      const okDept = department === "All" || j.department === department;
      const okLoc = location === "All" || j.location === location;
      const okStatus = status === "All" || j.status === status;
      const okQuery =
        query.length === 0 ||
        j.title.toLowerCase().includes(query) ||
        j.department.toLowerCase().includes(query) ||
        j.location.toLowerCase().includes(query);
      return okDept && okLoc && okStatus && okQuery;
    });
  }, [department, location, status, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const rows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  // Keep page valid when filters change
  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  function onAddJob() {
    alert("Add Job Posting clicked (connect to your modal/page).");
  }

  function onView(jobId: string) {
    alert(`View Job: ${jobId} (route to details page).`);
  }

  function onEdit(jobId: string) {
    alert(`Edit Job: ${jobId} (route to edit form).`);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">Recruitment Management</h1>
        <p className="text-sm text-slate-600">HR / Recruitment Management</p>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-4 shadow">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              label="Department"
              value={department}
              onChange={(v) => setDepartment(v as any)}
              options={DEPARTMENTS as unknown as string[]}
            />
            <Select
              label="Status"
              value={status}
              onChange={(v) => setStatus(v as any)}
              options={STATUSES as unknown as string[]}
            />
            <Select
              label="Location"
              value={location}
              onChange={(v) => setLocation(v as any)}
              options={LOCATIONS as unknown as string[]}
            />
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Search</label>
              <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search job title, dept, location..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
                <span className="text-slate-400">⌕</span>
              </div>
            </div>
          </div>

          <ActionButton role="HR" onClick={onAddJob} className="px-4 py-2 text-sm">
            Add Job Posting
          </ActionButton>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-semibold">Job Title</th>
                <th className="px-5 py-3 font-semibold">Department</th>
                <th className="px-5 py-3 font-semibold">Applicants</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.length === 0 ? (
                <tr>
                  <td className="px-5 py-6 text-slate-500" colSpan={5}>
                    No job postings match the filters.
                  </td>
                </tr>
              ) : (
                rows.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-900">{job.title}</td>
                    <td className="px-5 py-4 text-slate-700">{job.department}</td>
                    <td className="px-5 py-4 text-slate-700">{job.applicants} Applicants</td>
                    <td className="px-5 py-4">
                      <StatusPill status={job.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <ActionButton role="HR" onClick={() => onView(job.id)} className="px-3 py-1.5 text-xs">
                          View
                        </ActionButton>
                        <button
                          onClick={() => onEdit(job.id)}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            Showing{" "}
            <span className="font-medium text-slate-900">
              {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-slate-900">
              {Math.min(page * pageSize, filtered.length)}
            </span>{" "}
            of <span className="font-medium text-slate-900">{filtered.length}</span> entries
          </div>

          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>

            <PageButtons page={page} totalPages={totalPages} onPick={setPage} />

            <button
              className="rounded-lg border bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatusPill({ status }: { status: JobStatus }) {
  const cls =
    status === "Open"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : "bg-rose-100 text-rose-700 border-rose-200";

  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}>{status}</span>;
}

function PageButtons({
  page,
  totalPages,
  onPick,
}: {
  page: number;
  totalPages: number;
  onPick: (p: number) => void;
}) {
  // Simple compact pagination: show up to 5 buttons
  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  const realStart = Math.max(1, end - 4);

  for (let p = realStart; p <= end; p++) pages.push(p);

  return (
    <div className="flex items-center gap-1">
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPick(p)}
          className={[
            "h-9 w-9 rounded-lg border text-sm",
            p === page ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 hover:bg-slate-50",
          ].join(" ")}
          type="button"
        >
          {p}
        </button>
      ))}
    </div>
  );
}
