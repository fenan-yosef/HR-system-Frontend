"use client";

import { motion } from "framer-motion";
import { Search, Filter, MoreHorizontal, Mail, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { User } from "@/types/employee";
import { fetchUsers } from "@/services/employeeService";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmployeeData() {
      try {
        setLoading(true);
        const employeesRes = await fetchUsers();
        setEmployees(employeesRes.results);
      } catch (error) {
        console.error("Failed to fetch employees", error);
      } finally {
        setLoading(false);
      }
    }

    loadEmployeeData();
  }, []);

  return (
    <section className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">
            People Directory
          </h1>
          <p className="text-muted-foreground">
            Manage your organization&apos;s most valuable asset.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search people..."
              className="pl-10 h-10 w-64 rounded-xl bg-card border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button className="p-2.5 bg-card border border-border/50 rounded-xl hover:bg-muted transition-colors">
            <Filter className="size-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {loading && (
        <p className="text-muted-foreground text-sm">Loading employees…</p>
      )}

      {!loading && employees.length === 0 && (
        <p className="text-muted-foreground text-sm">No employees found.</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {employees.map((employee, i) => (
          <motion.div
            key={employee.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-6 border-none shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <button className="p-1 hover:bg-muted rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="size-4 text-muted-foreground" />
                </button>
              </div>

              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="size-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-4 flex items-center justify-center text-2xl font-bold text-primary border-4 border-background shadow-sm">
                  {employee.first_name ? employee.first_name : "?"}
                  {employee.first_name
                    ? employee.first_name.charAt(0).toUpperCase()
                    : ""}
                  {employee.first_name && employee.last_name
                    ? employee.last_name.charAt(0).toUpperCase()
                    : ""}
                </div>

                <h3 className="font-bold text-lg">{employee.username}</h3>

                <p className="text-xs font-medium text-primary bg-primary/5 px-2 py-1 rounded-md mt-1 mb-4">
                  {employee.position || "Unassigned"}
                </p>

                <div className="flex items-center justify-center gap-3 w-full">
                  <button className="flex-1 py-2 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground">
                    <Mail className="size-3.5" />
                    {employee.email}
                  </button>

                  <button className="flex-1 py-2 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground">
                    <Phone className="size-3.5" />
                    {employee.phone || "N/A"}
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
