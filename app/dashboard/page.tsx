import { Navbar } from '@/components/shared/Navbar';
import Link from 'next/link';
import { SERVICES } from '@/lib/services-config';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-soft">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-600">Citizen Portal</p>
            <h1 className="mt-2 text-3xl font-black text-ink">Government Services</h1>
          </div>
          <Link
            href="/dashboard"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-ink hover:border-blue-300 hover:text-primary"
          >
            Refresh
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map((service) => (
            <Link key={service.id} href={`/dashboard/${service.id}`} className="block">
              <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-4 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                  {service.name_hi}
                </div>
                <h2 className="text-2xl font-bold text-ink">{service.name_en}</h2>
                <p className="mt-3 text-sm text-gray-600">{service.description_en}</p>
                <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
                  <span>{service.fields.length} fields</span>
                  <span className="font-semibold text-primary">Open</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
