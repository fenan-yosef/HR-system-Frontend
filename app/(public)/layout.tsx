import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/jobs" className="text-xl font-bold text-blue-600">
            HR System Careers
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/jobs" className="text-sm font-medium hover:text-blue-600">
              Open Positions
            </Link>
            <Link href="/track" className="text-sm font-medium hover:text-blue-600">
              Track Application
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">
                HR/Admin Login
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-white border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} HR System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
