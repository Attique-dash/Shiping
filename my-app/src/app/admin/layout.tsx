import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="flex">
        <aside className="w-72 bg-neutral-900 border-r border-neutral-800 min-h-screen sticky top-0">
          <div className="p-5 flex items-center gap-3 border-b border-neutral-800">
            <div className="h-12 w-12 rounded-full bg-neutral-800 grid place-items-center text-sm font-semibold">PS</div>
            <div>
              <div className="text-sm text-neutral-400">Account</div>
              <div className="font-semibold">ProShip Solutions</div>
            </div>
          </div>
          <nav className="p-3 space-y-1">
            <Section title="Platform" />
            <NavItem href="/admin" label="Home" icon="🏠" />
            <NavItem href="/admin/packages" label="Packages" icon="📦" />
            <NavItem href="/admin/customers" label="Customers" icon="👥" />
            <NavItem href="#" label="Unknown Pkgs" icon="❓" />
            <NavItem href="#" label="Pre-Alerts" icon="🔔" />
            <NavItem href="#" label="Shipments" icon="📦" />
            <NavItem href="#" label="Broadcast Messages" icon="📢" />
            <NavItem href="#" label="Receivals" icon="📥" />
            <NavItem href="#" label="Transactions" icon="💳" />
            <NavItem href="#" label="Reporting" icon="📊" />
            <NavItem href="#" label="Documentation" icon="📖" />
          </nav>
        </aside>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function Section({ title }: { title: string }) {
  return <div className="px-2 py-2 text-xs uppercase tracking-wide text-neutral-400">{title}</div>;
}

function NavItem({ href, label, icon }: { href: string; label: string; icon?: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-neutral-800 text-neutral-200 hover:text-white"
    >
      <span className="text-base w-5 text-center">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
