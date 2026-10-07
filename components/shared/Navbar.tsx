import Link from 'next/link';

export function Navbar() {
  return (
    <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-2xl font-black tracking-tight text-ink">
          Sheva-Setu
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium text-gray-700">
          <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
          <Link href="/officer" className="hover:text-primary">Officer</Link>
          <Link href="/auth/login" className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-blue-700">Login</Link>
        </nav>
      </div>
    </header>
  );
}
