import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl border border-neutral-800 bg-[#0e1a27] text-white">
        <div className="absolute inset-0" aria-hidden>
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: "radial-gradient(1000px 400px at 50% -10%, #1f2f44 0%, transparent 60%)"
          }} />
        </div>
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 lg:py-24">
          <div className="max-w-2xl space-y-5">
            <p className="uppercase tracking-wider text-sm/6 text-[#9bb6d3]">Swift & Reliable Logistics</p>
            <h1 className="text-4xl md:text-5xl font-bold">Global Reach, Local Delivery</h1>
            <p className="text-[#c7d7e8] max-w-xl">Your trusted partner in swift and reliable logistics solutions.</p>
            <form action="/track" method="GET" className="mt-6 flex w-full max-w-xl items-center gap-3">
              <input
                name="q"
                type="text"
                placeholder="Enter your tracking number..."
                className="flex-1 rounded-md bg-white/95 text-neutral-900 px-4 py-3 outline-none focus:ring-2 focus:ring-[#ff8a3d]"
                required
              />
              <button className="rounded-md bg-[#ff8a3d] px-5 py-3 font-semibold hover:bg-[#ff7a1f]">Track Now</button>
            </form>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard title="Real‑Time Tracking" desc="Always know where your shipment is." icon="📍" />
          <FeatureCard title="Fast & Secure" desc="Safe handling and prompt delivery." icon="⚡" />
          <FeatureCard title="Customer Support" desc="24/7 assistance for all queries." icon="🎧" />
        </div>
      </section>

      {/* Why choose us + simple timeline */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Why Choose Us?</h2>
            <p className="text-neutral-600">
              We combine global coverage with local expertise to deliver packages quickly and safely.
            </p>
            <Link href="/track" className="inline-flex items-center rounded-md bg-black text-white px-5 py-2.5 hover:bg-neutral-800">
              Track Now
            </Link>
          </div>
          <div className="rounded-lg border p-5">
            <ol className="relative border-s ps-5">
              <li className="mb-6">
                <div className="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full bg-neutral-800" />
                <h3 className="font-medium">Pickup</h3>
                <p className="text-sm text-neutral-600">Collected from shipper</p>
              </li>
              <li className="mb-6">
                <div className="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full bg-orange-500" />
                <h3 className="font-medium">At Warehouse</h3>
                <p className="text-sm text-neutral-600">Sorted and prepared</p>
              </li>
              <li>
                <div className="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full bg-neutral-800" />
                <h3 className="font-medium">Delivered</h3>
                <p className="text-sm text-neutral-600">Arrived at destination</p>
              </li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, desc, icon }: { title: string; desc: string; icon: string }) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-3 text-2xl">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{desc}</p>
    </div>
  );
}
