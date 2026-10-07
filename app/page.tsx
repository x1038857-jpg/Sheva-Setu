import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-soft">
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
              AI-powered Government Services
            </span>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-ink md:text-6xl">
              Sheva-Setu
            </h1>
            <p className="mt-5 max-w-xl text-lg text-gray-600">
              Seamless citizen digital services with online applications, AI document verification,
              Hindi-English bilingual forms, and secure government officer review.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/auth/register"
                className="rounded-lg bg-primary px-6 py-3 font-semibold text-white shadow-soft transition hover:bg-blue-700"
              >
                Register
              </Link>
              <Link
                href="/auth/login"
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-ink transition hover:border-blue-300 hover:text-primary"
              >
                Login
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-white p-8 shadow-soft">
            <div className="gradient-ring rounded-2xl p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
                  <div>
                    <p className="text-sm text-gray-500">Application Status</p>
                    <p className="text-xl font-bold text-ink">Approved</p>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                    Verified
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-500">Document AI</p>
                    <p className="mt-2 text-lg font-bold text-ink">99% match</p>
                  </div>
                  <div className="rounded-xl bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-500">Officer Review</p>
                    <p className="mt-2 text-lg font-bold text-ink">2 mins</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
