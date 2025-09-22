import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";

type AdminCustomer = {
  _id: string;
  userCode: string;
  firstName: string;
  lastName: string;
  email: string;
  branch?: string;
  createdAt: string;
};

export default async function AdminCustomersPage() {
  await dbConnect();
  const raw = await User.find({ role: "customer" })
    .select("userCode firstName lastName email branch createdAt")
    .sort({ createdAt: -1 })
    .limit(500)
    .lean<{
      _id: unknown;
      userCode: string;
      firstName: string;
      lastName: string;
      email: string;
      branch?: string;
      createdAt?: Date | string;
    }[]>();
  const customers: AdminCustomer[] = raw.map((c) => ({
    _id: String(c._id),
    userCode: c.userCode,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    branch: c.branch,
    createdAt:
      typeof c.createdAt === "string"
        ? c.createdAt
        : c.createdAt?.toISOString?.() ?? new Date().toISOString(),
  }));

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <span className="text-sm text-gray-600">Total: {customers.length}</span>
      </div>
      <div className="overflow-x-auto rounded-lg border shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="px-3 py-2 text-left">UserCode</th>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Branch</th>
              <th className="px-3 py-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c._id}>
                <td className="px-3 py-2 font-medium">{c.userCode}</td>
                <td className="px-3 py-2">{c.firstName} {c.lastName}</td>
                <td className="px-3 py-2">{c.email}</td>
                <td className="px-3 py-2">{c.branch ?? "-"}</td>
                <td className="px-3 py-2 text-gray-600">{new Date(c.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
