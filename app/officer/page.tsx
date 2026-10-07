'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/shared/Navbar';
import { SERVICES } from '@/lib/services-config';

export default function OfficerPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all');

  useEffect(() => {
    void fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/officer');
      if (response.ok) {
        const data = await response.json();
        setApplications(data || []);
      }
    } catch (error) {
      console.error('Failed to load officer applications', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter((app) => filter === 'all' || app.status === filter);

  return (
    <div className="min-h-screen bg-soft">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-600">Officer Dashboard</p>
            <h1 className="mt-2 text-3xl font-black text-ink">Application Review</h1>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          {(['all', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === status
                  ? 'bg-primary text-white'
                  : 'border border-gray-300 bg-white text-gray-700 hover:border-blue-300'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-6 shadow-soft text-gray-600">Loading applications...</div>
        ) : filteredApplications.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 shadow-soft text-gray-600">No applications found.</div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => {
              const service = SERVICES.find((item) => item.id === Number(application.service_id));
              return (
                <div key={application.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-soft">
                  <div className="grid gap-6 md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-center">
                    <div>
                      <p className="text-lg font-bold text-ink">{service?.name_en || 'Service'}</p>
                      <p className="text-sm text-gray-500">{application?.profiles?.full_name || 'Citizen'}</p>
                      <p className="text-xs text-gray-400">{application?.profiles?.email || 'N/A'}</p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">Applied</p>
                      <p className="mt-1 font-semibold text-ink">
                        {new Date(application.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">Status</p>
                      <span
                        className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          application.status === 'APPROVED'
                            ? 'bg-green-100 text-green-700'
                            : application.status === 'REJECTED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {application.status}
                      </span>
                    </div>

                    <Link
                      href={`/officer/${application.id}`}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
