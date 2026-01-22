"use client";

import ActionButton from "@/components/ui/action-button";

export default function ReportsPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Reports & Analytics</h2>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <div className="text-sm text-slate-500">Recruitment</div>
            <div className="text-2xl font-semibold text-slate-800">42</div>
            <div className="mt-2">
              <ActionButton role="HR" className="px-3 py-1 text-sm">Export</ActionButton>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-sm text-slate-500">Leave Summary</div>
            <div className="text-2xl font-semibold text-slate-800">7 pending</div>
            <div className="mt-2">
              <ActionButton role="HR" className="px-3 py-1 text-sm">Export</ActionButton>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-sm text-slate-500">Attendance</div>
            <div className="text-2xl font-semibold text-slate-800">98%</div>
            <div className="mt-2">
              <ActionButton role="HR" className="px-3 py-1 text-sm">Export</ActionButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
