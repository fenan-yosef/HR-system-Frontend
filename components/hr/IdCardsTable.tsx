"use client";

import React, { useEffect, useMemo, useState } from "react";
import { fetchAllEmployees } from "@/services/employeeService";
import { fetchDepartmentsAll } from "@/services/departmentService";
import { downloadSingleIdCard, downloadBulkIdCards } from "@/services/idCardService";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";

export default function IdCardsTable() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingIds, setGeneratingIds] = useState<number | null>(null);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [filterDept, setFilterDept] = useState<string>("");
  const [filterPosition, setFilterPosition] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const [emps, depts] = await Promise.all([fetchAllEmployees(), fetchDepartmentsAll()]);
        if (!mounted) return;
        setEmployees(Array.isArray(emps) ? emps : (emps.results || emps.data || []));
        setDepartments(depts.results || []);
      } catch (err) {
        console.error("Failed to load employees or departments", err);
        toast("Failed to load employees.", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false };
  }, [toast]);

  const positions = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => { if (e.position) set.add(e.position); });
    return Array.from(set).sort();
  }, [employees]);

  const filtered = useMemo(() => {
    return employees.filter(e => {
      if (filterDept && String(e.department) !== String(filterDept)) return false;
      if (filterPosition && e.position !== filterPosition) return false;
      return true;
    });
  }, [employees, filterDept, filterPosition]);

  const toggleSelect = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  function getEmployeeId(emp: any): number | undefined {
    return emp?.employee_id ?? emp?.id ?? emp?.user ?? undefined;
  }

  const selectAllVisible = filtered.length > 0 && filtered.every(e => selected.includes(getEmployeeId(e)!));
  const toggleSelectAll = () => {
    if (selectAllVisible) {
      setSelected(prev => prev.filter(id => !filtered.some(e => getEmployeeId(e) === id)));
    } else {
      const visibleIds = filtered.map(e => getEmployeeId(e)).filter(Boolean) as number[];
      setSelected(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleDownloadSingle = async (employee: any) => {
    try {
      const empId = getEmployeeId(employee);
      if (!empId) throw new Error("Employee id missing");
      setGeneratingIds(empId);
      const blobUrl = await downloadSingleIdCard(empId);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `employee_${empId}_id_card.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
      toast("ID card downloaded.", "success");
    } catch (err) {
      console.error(err);
      toast("Failed to generate ID card.", "error");
    } finally {
      setGeneratingIds(null);
    }
  };

  const handleDownloadBulk = async () => {
    if (selected.length === 0) {
      toast("Select at least one employee.", "warning");
      return;
    }
    try {
      setBulkGenerating(true);
      const blobUrl = await downloadBulkIdCards(selected);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `employee_id_cards_bulk.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
      toast("Bulk ID cards downloaded.", "success");
    } catch (err) {
      console.error(err);
      toast("Failed to generate bulk ID cards.", "error");
    } finally {
      setBulkGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm">Department</label>
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="input">
            <option value="">All</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm">Position</label>
          <select value={filterPosition} onChange={e => setFilterPosition(e.target.value)} className="input">
            <option value="">All</option>
            {positions.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button onClick={handleDownloadBulk} disabled={bulkGenerating} variant="default">
            {bulkGenerating ? <Loader2 className="animate-spin" /> : "Generate Bulk IDs"}
          </Button>
        </div>
      </div>

      <div className="overflow-auto border rounded-md">
        <table className="min-w-full table-fixed">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-2 w-12 text-left"><input type="checkbox" checked={selectAllVisible} onChange={toggleSelectAll} /></th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Employee ID</th>
              <th className="p-2 text-left">Department</th>
              <th className="p-2 text-left">Position</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-6 text-center">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center">No employees found.</td></tr>
            ) : (
              filtered.map((emp, idx) => {
                const empId = getEmployeeId(emp) ?? idx;
                return (
                  <tr key={empId} className="border-t">
                    <td className="p-2"><input type="checkbox" checked={empId ? selected.includes(empId) : false} onChange={() => empId && toggleSelect(empId)} /></td>
                    <td className="p-2">{emp.first_name} {emp.last_name}</td>
                    <td className="p-2">{empId ?? "-"}</td>
                    <td className="p-2">{emp.department_name || emp.department || "-"}</td>
                    <td className="p-2">{emp.position || "-"}</td>
                    <td className="p-2">
                      <Button onClick={() => handleDownloadSingle(emp)} disabled={generatingIds === empId}>
                        {generatingIds === empId ? <Loader2 className="animate-spin" /> : "Generate ID"}
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
