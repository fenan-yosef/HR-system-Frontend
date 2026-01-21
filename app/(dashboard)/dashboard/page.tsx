export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">
        Dashboard
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card title="Total Employees" value="120" />
        <Card title="Active Job Posts" value="8" />
        <Card title="Pending Leave Requests" value="5" />
      </div>

      {/* Activity Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-slate-700 mb-4">
          Recent Activities
        </h3>

        <ul className="space-y-3 text-sm text-slate-600">
          <li>• New job posted: Software Engineer</li>
          <li>• Leave request approved for Employee ID 102</li>
          <li>• 3 new applications received today</li>
        </ul>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <p className="text-sm text-slate-600">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  );
}
