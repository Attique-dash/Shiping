import { dbConnect } from "@/lib/db";
import { Package } from "@/models/Package";
import { User } from "@/models/User";
import Link from "next/link";

type MetricCardProps = { title: string; value: string | number; note?: string; icon?: React.ReactNode };

export default async function AdminDashboard() {
  await dbConnect();
  const [totalPackages, deliveredCount, inTransitCount, atWarehouseCount] = await Promise.all([
    Package.countDocuments({}),
    Package.countDocuments({ status: "Delivered" }),
    Package.countDocuments({ status: "In Transit" }),
    Package.countDocuments({ status: "At Warehouse" }),
  ]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const newToday = await Package.countDocuments({ createdAt: { $gte: today } });
  const customers = await User.countDocuments({ role: "customer" });
  const recent = await Package.find({}).sort({ updatedAt: -1 }).limit(8).lean();

  const distro = [
    { label: "Delivered", value: deliveredCount, color: "#16a34a" },
    { label: "In Transit", value: inTransitCount, color: "#2563eb" },
    { label: "At Warehouse", value: atWarehouseCount, color: "#f59e0b" },
  ];
  const sum = distro.reduce((a, b) => a + b.value, 0) || 1;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
        <div className="hidden md:flex items-center gap-2">
          <input className="rounded-md border px-3 py-2 text-sm" placeholder="Search" />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Packages" value={totalPackages} note="All-time" />
        <MetricCard title="New Today" value={newToday} note="Created today" />
        <MetricCard title="Customers" value={customers} note="Registered" />
        <MetricCard title="Delivered" value={deliveredCount} note="All-time" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent shipments table */}
        <div className="lg:col-span-2 rounded-xl border bg-white p-0 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b px-4 py-3 font-medium dark:border-neutral-800">Recent Shipments</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                <tr>
                  <th className="px-3 py-2 text-left">Tracking #</th>
                  <th className="px-3 py-2 text-left">UserCode</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Updated</th>
                  <th className="px-3 py-2 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-neutral-800">
                {recent.map((p: any) => (
                  <tr key={String(p._id)}>
                    <td className="px-3 py-2 font-medium">{p.trackingNumber}</td>
                    <td className="px-3 py-2">{p.userCode}</td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset"
                        style={{
                          backgroundColor: p.status === "Delivered" ? "#dcfce7" : p.status === "In Transit" ? "#dbeafe" : p.status === "At Warehouse" ? "#fef9c3" : "#f3f4f6",
                          color: "#111827",
                        }}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">{new Date(p.updatedAt).toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">
                      <Link href="/admin/packages" className="text-blue-600 hover:underline">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-end gap-2 px-4 py-3 text-sm">
            <Link href="/admin/packages" className="rounded-md border px-3 py-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-800">See all</Link>
          </div>
        </div>

        {/* Status breakdown + quick actions */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-3 font-medium">Package Status Breakdown</div>
            <div className="flex items-center gap-4">
              <Donut parts={distro} />
              <ul className="space-y-1 text-sm">
                {distro.map((d) => (
                  <li key={d.label} className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: d.color }} />
                    <span>{d.label}</span>
                    <span className="ml-auto font-medium">{Math.round((d.value / sum) * 100)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-3 font-medium">Quick Actions</div>
            <div className="flex gap-3">
              <Link href="/admin/packages" className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">Add New Package</Link>
              <Link href="/admin/packages" className="rounded-md border px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800">View Reports</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, note }: MetricCardProps) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="text-sm text-neutral-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {note && <div className="text-xs text-neutral-500">{note}</div>}
    </div>
  );
}

function Donut({ parts }: { parts: { label: string; value: number; color: string }[] }) {
  const total = parts.reduce((a, b) => a + b.value, 0) || 1;
  const center = 60;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <svg viewBox="0 0 120 120" className="h-32 w-32">
      <circle cx={center} cy={center} r={radius} stroke="#e5e7eb" strokeWidth={14} fill="none" />
      {parts.map((p, i) => {
        const fraction = p.value / total;
        const dash = fraction * circumference;
        const circle = (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={radius}
            stroke={p.color}
            strokeWidth={14}
            fill="none"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${center} ${center})`}
          />
        );
        offset += dash;
        return circle;
      })}
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="fill-neutral-700 text-sm">
        {Math.round((parts[1]?.value ?? 0) / total * 100)}% In Transit
      </text>
    </svg>
  );
}
