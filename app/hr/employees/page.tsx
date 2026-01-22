"use client";

import ActionButton from "@/components/ui/action-button";

export default function EmployeesPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Employee Management</h2>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-4 border-b flex items-center justify-between">
          <div className="text-sm text-slate-600">Employee list and account controls</div>
          <ActionButton role="HR" className="px-4 py-2 text-sm">Add employee</ActionButton>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-slate-200 text-slate-700">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Department</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-t hover:bg-slate-50">
              <td className="px-4 py-3">Alem Gebre</td>
              <td className="px-4 py-3">HR Officer</td>
              <td className="px-4 py-3">Human Resources</td>
              <td className="px-4 py-3">Active</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <ActionButton role="HR" className="px-3 py-1 text-xs">Edit</ActionButton>
                  <ActionButton role="HR" intent="danger" className="px-3 py-1 text-xs">Disable</ActionButton>
                </div>
              </td>
            </tr>

            <tr className="border-t hover:bg-slate-50">
              <td className="px-4 py-3">Lily Ayana</td>
              <td className="px-4 py-3">Software Engineer</td>
              <td className="px-4 py-3">IT</td>
              <td className="px-4 py-3">Active</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button className="bg-slate-600 text-white px-3 py-1 rounded text-xs hover:bg-slate-700">Edit</button>
                  <button className="bg-slate-600 text-white px-3 py-1 rounded text-xs hover:bg-slate-700">Disable</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
