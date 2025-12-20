'use client';

import { useEffect, useMemo, useState } from 'react';
// No URL syncing; state-managed pagination and search
import { Loader2, Pencil, Plus, Trash2, Package, Search } from 'lucide-react';
import EmptyState from '@/app/admin/components/EmptyState';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ProductRow {
  id: string;
  name: string;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ProductsManager() {
  const initialPage = 1;
  const initialLimit = 10;

  const [items, setItems] = useState<ProductRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });
  const [limit, setLimit] = useState<number>(initialLimit || 10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // No router push; keep state local only

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', quantity: 0, price: 0 });
  const isEdit = useMemo(() => editId !== null, [editId]);
  const [q, setQ] = useState<string>('');

  const fetchPage = async (page = 1, nextLimit = limit, nextQ = q) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(nextLimit));
      if (nextQ) params.set('q', nextQ);
      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      setItems(data.items);
      setPagination(data.pagination);
      // no URL sync; state only
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ name: '', quantity: 0, price: 0 });
    setModalOpen(true);
  };

  const openEdit = (row: ProductRow) => {
    setEditId(row.id);
    setForm({ name: row.name, quantity: row.quantity, price: row.price });
    setModalOpen(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity),
        price: Number(form.price),
      };
      const res = await fetch(
        isEdit ? `/api/admin/products/${editId}` : '/api/admin/products',
        {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setModalOpen(false);
      await fetchPage(pagination.page);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      await fetchPage(pagination.page);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  useEffect(() => {
    fetchPage(initialPage, initialLimit);
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 max-md:px-4 py-2 max-md:py-4 gap-y-4 flex-wrap">
        <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
          Products
        </h2>
        <div className="flex items-center gap-3 max-md:w-full max-md:justify-between max-md:flex-wrap">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={q}
              onChange={(e) => {
                const next = e.target.value;
                setQ(next);
                fetchPage(1, limit, next);
              }}
              className="w-56 rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-sm text-slate-700 outline-none focus:border-slate-400"
            />
          </div>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-950"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="px-6 py-3 text-sm text-red-600 bg-red-50">{error}</div>
      )}
      {loading ? (
        <div className="px-6 py-10 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" />
          <p className="mt-2 text-sm text-slate-500">Loading products...</p>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Package className="h-6 w-6" />}
          title="No products yet"
          description="Get started by adding your first product."
        >
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-950"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <Table className="divide-y divide-slate-100 text-left text-sm text-slate-600">
            <TableHeader className="bg-white">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-6 max-md:px-4 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500 min-w-50"
                >
                  Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 max-md:px-4 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500 min-2-20"
                >
                  Quantity
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 max-md:px-4 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500"
                >
                  Price
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 max-md:px-4 py-3 min-w-52"
                />
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 bg-white">
              {items.map((row) => (
                <TableRow key={row.id} className="hover:bg-slate-50/70">
                  <TableCell className="px-6 max-md:px-4 py-4 text-slate-900">
                    {row.name}
                  </TableCell>
                  <TableCell className="px-6 max-md:px-4 py-4">
                    {row.quantity}
                  </TableCell>
                  <TableCell className="px-6 max-md:px-4 py-4">
                    ₹{row.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-6 max-md:px-4 py-4">
                    <div className="inline-flex gap-2 flex-wrap justify-end">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50"
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(row.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {(loading || items.length > 0) && (
        <div className="flex items-center justify-between flex-wrap gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 ">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-500  whitespace-nowrap">
              Rows per page
            </label>
            <select
              className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700"
              value={limit}
              onChange={(e) => {
                const newLimit = Number(e.target.value);
                setLimit(newLimit);
                fetchPage(1, newLimit, q);
              }}
            >
              {[5, 10, 25, 50, 100].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between sm:justify-end sm:gap-4">
              <p className="text-sm text-slate-500  whitespace-nowrap">
                Page {pagination.page} of {pagination.totalPages} •{' '}
                {pagination.total} total
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    fetchPage(Math.max(1, pagination.page - 1), limit, q)
                  }
                  disabled={pagination.page <= 1 || loading}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    fetchPage(
                      Math.min(pagination.totalPages, pagination.page + 1),
                      limit,
                      q
                    )
                  }
                  disabled={pagination.page >= pagination.totalPages || loading}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
              {isEdit ? 'Edit Product' : 'Add Product'}
            </div>
            <form onSubmit={onSubmit} className="space-y-4 px-5 py-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Product Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.quantity}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        quantity: Number(e.target.value),
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Price
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: Number(e.target.value) }))
                    }
                    required
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-950"
                >
                  {isEdit ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
