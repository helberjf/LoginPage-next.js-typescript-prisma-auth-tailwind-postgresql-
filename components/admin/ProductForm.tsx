"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

type Props = {
  productId?: string
}

export default function ProductForm({ productId }: Props) {
  const { data: session } = useSession()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('0.00')
  const [stock, setStock] = useState('0')
  const [mpEnabled, setMpEnabled] = useState(false)
  const [mpPrice, setMpPrice] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!productId) return
    fetch(`/api/admin/products?id=${productId}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((p) => {
        setName(p.name || '')
        setDescription(p.description || '')
        setPrice(p.price?.toString() ?? '0.00')
        setStock(p.stock?.toString() ?? '0')
        setMpEnabled(Boolean(p.mp_enabled))
        setMpPrice(p.mp_price_decimal?.toString() ?? '')
      })
      .catch((e) => console.error('Failed to load product', e))
  }, [productId])

  const validate = () => {
    if (!name.trim()) return 'Name is required'
    const p = Number(price)
    if (Number.isNaN(p) || p < 0) return 'Price must be a valid non-negative number'
    const s = Number(stock)
    if (!Number.isInteger(s) || s < 0) return 'Stock must be a non-negative integer'
    if (mpEnabled && mpPrice !== '') {
      const mp = Number(mpPrice)
      if (Number.isNaN(mp) || mp < 0) return 'MP price must be a non-negative number'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const v = validate()
    if (v) {
      setError(v)
      return
    }
    if (!session?.user?.id) {
      setError('You must be signed in to create products.')
      return
    }

    setSaving(true)
    const payload: any = {
      id: productId,
      name: name.trim(),
      description: description.trim(),
      price: Math.round(Number(price) * 100) / 100,
      stock: parseInt(stock, 10),
      mp_enabled: mpEnabled,
      mp_price_decimal: mpPrice === '' ? null : Math.round(Number(mpPrice) * 100) / 100,
      userId: session.user.id,
    }
    try {
      const method = productId ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/products', { method, headers: { 'content-type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Unknown error' }))
        setError(err?.message || JSON.stringify(err))
        setSaving(false)
        return
      }
      window.location.href = '/admin/products'
    } catch (e: any) {
      console.error('Save failed', e)
      setError(e?.message || 'Save failed')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input className="w-full border rounded px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea className="w-full border rounded px-3 py-2" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <input className="w-full border rounded px-3 py-2" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Stock</label>
          <input className="w-full border rounded px-3 py-2" value={stock} onChange={(e) => setStock(e.target.value)} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label className="inline-flex items-center">
          <input type="checkbox" className="mr-2" checked={mpEnabled} onChange={(e) => setMpEnabled(e.target.checked)} />
          <span>Enable Mercado Pago</span>
        </label>
      </div>
      {mpEnabled && (
        <div>
          <label className="block text-sm font-medium mb-1">MP override price</label>
          <input className="w-full border rounded px-3 py-2" value={mpPrice} onChange={(e) => setMpPrice(e.target.value)} />
        </div>
      )}
      <div className="pt-4">
        <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  )
}
