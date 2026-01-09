"use client"

import React, { useState } from 'react'
import { Home, Layers, Box, Users, Menu, X } from 'lucide-react'
import SignOutButton from './SignOutButton'

export default function SidebarMobile({ user }: { user?: { name?: string | null; email?: string | null; role?: string | null } }) {
  const [open, setOpen] = useState(false)
  const isAdmin = user?.role === 'ADMIN'

  return (
    <>
      <button
        aria-label="Open menu"
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-neutral-800 rounded shadow"
        onClick={() => setOpen(true)}
      >
        <Menu size={20} />
      </button>

      {open && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-neutral-900 p-4 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-sm font-medium">{(user?.name || 'U').charAt(0)}</div>
                <div>
                  <div className="font-semibold">{user?.name ?? 'Usuário'}</div>
                  <div className="text-xs text-neutral-500">{user?.email ?? ''}</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="p-1">
                <X size={20} />
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              <a onClick={() => setOpen(false)} href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"><Home size={16} /> Home</a>
              <a onClick={() => setOpen(false)} href="/test-env" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"><Layers size={16} /> Test Environment</a>
              <a onClick={() => setOpen(false)} href="/admin/products" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"><Box size={16} /> Products</a>
              <a onClick={() => setOpen(false)} href="/app/api/users" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 opacity-70"><Users size={16} /> Users</a>
              <div onClick={() => setOpen(false)}>
                <SignOutButton className="w-full text-left" />
              </div>
            </nav>

            <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500">
              <div>Role: <span className="font-medium text-neutral-700 dark:text-neutral-300">{user?.role ?? 'N/A'}</span></div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
