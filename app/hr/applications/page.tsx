export default function ApplicationsPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">
        Job Applications
      </h2>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-200 text-slate-700">
            <tr>
              <th className="px-4 py-3 text-left">Applicant Name</th>
              <th className="px-4 py-3 text-left">Position</th>
              <th className="px-4 py-3 text-left">AI Score</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-t hover:bg-slate-50">
              <td className="px-4 py-3">Abel Tesfaye</td>
              <td className="px-4 py-3">Software Engineer</td>
              <td className="px-4 py-3">87%</td>
              <td className="px-4 py-3">
                <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                  Shortlisted
                </span>
              </td>
              <td className="px-4 py-3">
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">
                  View
                </button>
              </td>
            </tr>

            <tr className="border-t hover:bg-slate-50">
              <td className="px-4 py-3">Sara Mekonnen</td>
              <td className="px-4 py-3">Data Analyst</td>
              <td className="px-4 py-3">73%</td>
              <td className="px-4 py-3">
                <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                  Under Review
                </span>
              </td>
              <td className="px-4 py-3">
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">
                  View
                </button>
              </td>
            </tr>

            <tr className="border-t hover:bg-slate-50">
              <td className="px-4 py-3">Daniel Abebe</td>
              <td className="px-4 py-3">HR Coordinator</td>
              <td className="px-4 py-3">61%</td>
              <td className="px-4 py-3">
                <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-700">
                  Rejected
                </span>
              </td>
              <td className="px-4 py-3">
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
