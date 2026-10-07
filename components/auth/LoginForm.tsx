'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, KeyRound, Loader2 } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'password' | 'otp'>('password');
  const [otpSent, setOtpSent] = useState(false);

  const redirectUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      router.push('/account');
      return;
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const role = profile?.role;
    if (role === 'admin' || role === 'worker') {
      window.location.href = role === 'worker' ? '/worker' : '/admin';
    } else {
      window.location.href = '/account';
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !data.user) {
        setError(signInError?.message || 'Unable to sign in.');
        setLoading(false);
        return;
      }

      if (!data.user.email_confirmed_at) {
        const { error: otpError } = await supabase.auth.signInWithOtp({ email });
        if (otpError) {
          throw new Error(otpError.message || 'Unable to send OTP.');
        }

        setOtpSent(true);
        setStep('otp');
        setError('');
        setLoading(false);
        return;
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.session?.access_token || '');
      }

      await redirectUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (verifyError || !data.user) {
        setError(verifyError?.message || 'Invalid OTP.');
        setLoading(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (typeof window !== 'undefined' && session?.access_token) {
        localStorage.setItem('token', session.access_token);
      }

      await redirectUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed.');
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid min-h-[calc(100vh-180px)] max-w-6xl items-center gap-14 px-6 py-16 lg:grid-cols-2 lg:px-10">
      <div>
        <Link href="/" className="flex items-center gap-2 text-xs uppercase tracking-[.2em] text-navy/50">
          <ArrowLeft size={14} /> Back home
        </Link>
        <p className="mt-16 text-xs font-semibold uppercase tracking-[.25em] text-gold">Portal access</p>
        <h1 className="mt-4 text-6xl leading-none">
          Your village,<br /><i className="font-normal text-gold">your voice.</i>
        </h1>
        <p className="mt-6 max-w-md leading-7 text-navy/55">
          Citizens and authorities sign in through the same secure gate — with role-based access to the right workspace.
        </p>
      </div>

      <div className="glass rounded-3xl p-7 shadow-luxury md:p-10">
        <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-navy text-gold">
          <KeyRound size={21} />
        </div>
        <h2 className="text-3xl">Sign in</h2>
        <p className="mt-2 text-sm leading-6 text-navy/55">
          {step === 'password' 
            ? 'Use the email and password from your SafaiSetu account.'
            : 'Enter the OTP sent to your email.'}
        </p>

        {error && (
          <div className="mt-5 rounded-xl border border-red-500 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {otpSent && step === 'otp' && (
          <div className="mt-5 rounded-xl border border-green-500 bg-green-50 p-4 text-sm text-green-700">
            ✓ OTP sent to your email. Check your inbox.
          </div>
        )}

        {step === 'password' ? (
          <form onSubmit={handlePasswordSubmit} className="mt-8 space-y-5">
            <label className="block text-sm font-semibold">
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-3 w-full rounded-xl border border-gold/30 bg-ivory p-4 outline-none focus:border-gold"
              />
            </label>
            <label className="block text-sm font-semibold">
              Password
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-3 w-full rounded-xl border border-gold/30 bg-ivory p-4 outline-none focus:border-gold"
              />
            </label>
            <button
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-4 text-sm font-semibold uppercase tracking-[.15em] text-ivory disabled:opacity-60"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Sign in
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="mt-8 space-y-5">
            <label className="block text-sm font-semibold">
              Email
              <input
                disabled
                type="email"
                value={email}
                className="mt-3 w-full rounded-xl border border-gold/30 bg-ivory/50 p-4 outline-none"
              />
            </label>
            <label className="block text-sm font-semibold">
              OTP Code
              <input
                required
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                maxLength={6}
                placeholder="000000"
                className="mt-3 w-full rounded-xl border border-gold/30 bg-ivory p-4 text-center text-lg tracking-widest outline-none focus:border-gold"
              />
            </label>
            <button
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-4 text-sm font-semibold uppercase tracking-[.15em] text-ivory disabled:opacity-60"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Verify OTP
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('password');
                setOtp('');
                setOtpSent(false);
                setError('');
              }}
              className="w-full text-sm font-semibold text-gold hover:text-gold/80"
            >
              ← Back to password login
            </button>
          </form>
        )}

        <p className="mt-8 text-sm text-navy/55">
          New to SafaiSetu?{' '}
          <Link href="/auth/register" className="font-semibold text-gold">
            Create an account
          </Link>
        </p>
        <p className="mt-4 text-xs leading-5 text-navy/45">
          By continuing, you agree to use SafaiSetu responsibly and help keep community reports accurate.
        </p>
      </div>
    </div>
  );
}
