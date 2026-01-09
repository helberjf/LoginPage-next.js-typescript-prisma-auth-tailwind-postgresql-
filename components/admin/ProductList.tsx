"use client"

import React, { useEffect, useState } from 'react'

type Product = any

export default function ProductList() {
  const [products, setProducts] = useState<Product[] | null>(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    setLoading(true)
    fetch('/api/admin/products', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete product?')) return
    await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE', credentials: 'include' })
    setProducts((p) => p?.filter((x) => x.id !== id) ?? null)
  }

  if (loading) return <div className="text-center py-8">Loading...</div>
  if (!products || products.length === 0) return <div className="text-center py-8">No products</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium">Products</h3>
        <a href="/admin/products/new" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">New product</a>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {products.map((p: Product) => (
          <div key={p.id} className="flex items-center justify-between p-4 border rounded-md bg-neutral-50 dark:bg-neutral-900">
            <div>
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm text-neutral-500">Price: {p.price} • Stock: {p.stock}</div>
            </div>
            <div className="flex items-center gap-3">
              <a className="text-sm text-indigo-600 hover:underline" href={`/admin/products/${p.id}`}>Edit</a>
              <button className="text-sm text-red-600 hover:underline" onClick={() => handleDelete(p.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
