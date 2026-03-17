'use client'

import Link from 'next/link'
import Image from 'next/image'

// Le footer avec le logo et le copyright
export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center">
          <Image
            src="/logo_black.png"
            alt="ABRICOT"
            width={120}
            height={40}
            priority
          />
        </Link>

        <p className="text-gray-500 text-sm">
          Abricot 2026
        </p>
      </div>
    </footer>
  )
}
