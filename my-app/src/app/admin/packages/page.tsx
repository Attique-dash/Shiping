import { dbConnect } from "@/lib/db";
import { Package } from "@/models/Package";

type AdminPackage = {
  _id: string;
  trackingNumber: string;
  status: string;
  userCode: string;
  weight?: number;
  updatedAt: string;
};

export default async function AdminPackagesPage() {
  await dbConnect();
  const raw = await Package.find({})
    .sort({ updatedAt: -1 })
    .limit(500)
    .lean<{
      _id: unknown;
      trackingNumber: string;
      status: string;
      userCode: string;
      weight?: number;
      updatedAt?: Date | string;
    }[]>();
  const packages: AdminPackage[] = raw.map((p) => ({
    _id: String(p._id),
    trackingNumber: p.trackingNumber,
    status: p.status,
    userCode: p.userCode,
    weight: p.weight,
    updatedAt:
      typeof p.updatedAt === "string"
        ? p.updatedAt
        : p.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  }));

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Packages</h1>
        <span className="text-sm text-gray-600">Total: {packages.length}</span>
      </div>
      <div className="overflow-x-auto rounded-lg border shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="px-3 py-2 text-left">Tracking #</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">UserCode</th>
              <th className="px-3 py-2 text-left">Weight</th>
              <th className="px-3 py-2 text-left">Updated</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((p) => (
              <tr key={p._id}>
                <td className="px-3 py-2 font-medium">{p.trackingNumber}</td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset"
                    style={{
                      backgroundColor: p.status === "Delivered" ? "#dcfce7" : p.status === "In Transit" ? "#dbeafe" : p.status === "At Warehouse" ? "#fef9c3" : p.status === "Deleted" ? "#fee2e2" : "#f3f4f6",
                      color: "#111827",
                    }}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-3 py-2">{p.userCode}</td>
                <td className="px-3 py-2">{p.weight ?? "-"}</td>
                <td className="px-3 py-2 text-gray-600">{new Date(p.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
