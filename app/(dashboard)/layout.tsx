import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-700 text-white flex flex-col">
        <div className="px-6 py-4 text-xl font-semibold border-b border-blue-600">
          HRMS
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 text-sm">
          <SidebarLink href="/dashboard" label="Dashboard" />
          <SidebarLink href="/hr/recruitment" label="Recruitment" />
          <SidebarLink href="/hr/applications" label="Applications" />
          <SidebarLink href="/employee/leave" label="Leave" />
          <SidebarLink href="/employee/attendance" label="Attendance" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-slate-800">
            Human Resource Management System
          </h1>
          <div className="text-sm text-slate-600">HR Officer</div>
        </header>

        {/* Page Content */}
        <section className="p-6">{children}</section>
      </main>
    </div>
  );
}

function SidebarLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 rounded hover:bg-blue-600 transition"
    >
      {label}
    </Link>
  );
}
