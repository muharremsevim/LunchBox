'use client';
import Link from 'next/link';
export default function HomeButton() {
  return (
    <Link href="/" className="rounded bg-blue-700 hover:bg-blue-800 px-4 py-1 text-lg font-semibold text-white transition">Home</Link>
  );
} 