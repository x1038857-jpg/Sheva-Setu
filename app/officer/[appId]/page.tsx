'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/shared/Navbar';
import { SERVICES } from '@/lib/services-config';

export default function OfficerDetailPage({ params }: { params: { appId: string } }) {
  const router = useRouter();
  const [application, setApplication] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    void fetchApplication();
  }, [params.appId]);

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/applications/${params.appId}`);
      if (response.ok) {
        const data = await response.json();
        setApplication(data);
      }
    } catch (error) {
      console.error('Failed to fetch application detail', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'approve' | 'reject') => {
    if (action === 'reject' && !reason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/officer/${params.appId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Action failed');
      }

      router.push('/officer');
    } catch (error) {
      console.error('Action failed', error);
      alert(error instanceof Error ? error.message : 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-soft px-4 py-10 text-center text-gray-600">Loading application...</div>;
  }

  if (!application) {
    return <div className="min-h-screen bg-soft px-4 py-10 text-center text-gray-600">Application not found.</div>;
  }

  const service = SERVICES.find((item) => item.id === Number(application.service_id));

  return (
    <div className="min-h-screen bg-soft">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-3xl bg-white p-8 shadow-soft">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-blue-600">Application</p>
              <h1 className="mt-2 text-3xl font-black text-ink">{service?.name_en || 'Service'}</h1>
              <p className="mt-2 text-sm text-gray-600">{application?.profiles?.full_name || 'Citizen'} · {application?.profiles?.email || 'N/A'}</p>
            </div>

            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
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

          <div className="mb-8 grid gap-4 md:grid-cols-2">
            {Object.entries(application.data || {}).map(([key, value]) => (
              <div key={key} className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{key}</p>
                <p className="mt-2 text-base font-medium text-ink">{String(value)}</p>
              </div>
            ))}
          </div>

          <div className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-ink">Uploaded Documents</h2>
            <div className="space-y-4">
              {(application.documents || []).map((doc: any) => (
                <div key={doc.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-ink">{doc.file_name}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      doc.ai_verdict === 'genuine'
                        ? 'bg-green-100 text-green-700'
                        : doc.ai_verdict === 'suspicious'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                    }`}>
                      {doc.ai_verdict}
                    </span>
                  </div>

                  {doc.ai_reason ? (
                    <div className="mt-3 text-sm text-gray-600">
                      <p>Confidence: {doc.ai_reason.confidence ?? 'N/A'}%</p>
                      {Array.isArray(doc.ai_reason.reasons) && doc.ai_reason.reasons.length > 0 ? (
                        <p>Reasons: {doc.ai_reason.reasons.join(', ')}</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {application.status === 'PENDING' && (
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => void handleAction('approve')}
                  disabled={submitting}
                  className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Approve'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRejectForm((prev) => !prev)}
                  disabled={submitting}
                  className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>

              {showRejectForm && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <label className="mb-2 block text-sm font-medium text-red-800">Rejection reason</label>
                  <textarea
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-red-300 bg-white px-4 py-3 outline-none focus:border-red-500"
                    placeholder="Explain why the application is rejected"
                  />
                  <button
                    type="button"
                    onClick={() => void handleAction('reject')}
                    disabled={!reason.trim() || submitting}
                    className="mt-4 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Confirm Rejection
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
