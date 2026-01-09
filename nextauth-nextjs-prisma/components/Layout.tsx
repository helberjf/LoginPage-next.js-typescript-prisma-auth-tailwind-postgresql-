"use client"

import React from 'react'

export default function Layout({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      <header className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">My Store — Admin</h1>
          <nav className="space-x-4 text-sm">
            <a href="/admin/products" className="hover:underline">Products</a>
            <a href="/dashboard" className="hover:underline">Dashboard</a>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm p-6">
          {children}
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-6 text-sm text-neutral-500">
        <div>© {new Date().getFullYear()} My Store</div>
      </footer>
    </div>
  )
}
