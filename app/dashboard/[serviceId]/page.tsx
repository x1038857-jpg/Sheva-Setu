'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/shared/Navbar';
import { SERVICES } from '@/lib/services-config';

export default function ServiceApplicationPage({ params }: { params: { serviceId: string } }) {
  const router = useRouter();
  const service = useMemo(() => SERVICES.find((item) => item.id === Number(params.serviceId)), [params.serviceId]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [applications, setApplications] = useState<any[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState<string | null>(null);

  useEffect(() => {
    void fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data || []);
      }
    } catch (error) {
      console.error('Failed to load applications', error);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const uploadDocument = async (file: File, appId?: string) => {
    try {
      setExtracting(file.name);
      const form = new FormData();
      form.append('file', file);
      form.append('applicationId', appId || 'demo-application-id');
      form.append('documentType', service?.requiredDocuments[0] || 'Aadhaar');

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: form,
      });

      const data = await response.json();
      if (response.ok && data.extractedData) {
        setFormData((prev) => ({ ...prev, ...data.extractedData }));
      }
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setExtracting(null);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setDocuments((prev) => [...prev, file]);
    await uploadDocument(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: Number(params.serviceId),
          data: formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create application');
      }

      await response.json();
      router.push('/dashboard');
    } catch (error) {
      console.error('Submission failed', error);
      alert(error instanceof Error ? error.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (!service) {
    return (
      <div className="min-h-screen bg-soft px-4 py-10 text-center">
        <p className="text-xl font-bold text-ink">Service not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-3xl bg-white p-8 shadow-soft">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.2em] text-blue-600">Service</p>
            <h1 className="mt-2 text-3xl font-black text-ink">{service.name_en}</h1>
            <p className="mt-2 text-gray-600">{service.name_hi}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 p-6">
              <h2 className="text-xl font-bold text-ink">Upload Supporting Documents</h2>
              <p className="mt-2 text-sm text-gray-600">Required: {service.requiredDocuments.join(', ')}</p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileChange}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={extracting !== null}
              >
                {extracting ? `Processing: ${extracting}` : 'Upload Document'}
              </button>

              {documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  {documents.map((doc, index) => (
                    <div key={`${doc.name}-${index}`} className="text-sm text-gray-700">
                      ✓ {doc.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-5">
              {service.fields.map((field) => (
                <div key={field.id}>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {field.name_en} <span className="text-gray-400">({field.name_hi})</span>
                  </label>

                  {field.type === 'textarea' ? (
                    <textarea
                      name={field.id}
                      value={formData[field.id] || ''}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none ring-0 transition focus:border-blue-500"
                      rows={4}
                    />
                  ) : (
                    <input
                      type={field.type}
                      name={field.id}
                      value={formData[field.id] || ''}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary px-5 py-3 text-lg font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
