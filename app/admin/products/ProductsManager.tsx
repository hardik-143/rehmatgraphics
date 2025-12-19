"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2, Package } from "lucide-react";
import EmptyState from "@/app/admin/components/EmptyState";

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

export default function ProductsManager({ initial }: { initial: { items: ProductRow[]; pagination: Pagination } }) {
  const [items, setItems] = useState<ProductRow[]>(initial.items);
  const [pagination, setPagination] = useState<Pagination>(initial.pagination);
  const [limit, setLimit] = useState<number>(initial.pagination.limit || 10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", quantity: 0, price: 0 });
  const isEdit = useMemo(() => editId !== null, [editId]);

  const fetchPage = async (page = 1, nextLimit = limit) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products?page=${page}&limit=${nextLimit}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch");
      setItems(data.items);
      setPagination(data.pagination);
      // sync URL
      const params = new URLSearchParams(searchParams?.toString());
      params.set("page", String(data.pagination.page));
      params.set("limit", String(data.pagination.limit));
      router.push(`?${params.toString()}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ name: "", quantity: 0, price: 0 });
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
      const payload = { ...form, quantity: Number(form.quantity), price: Number(form.price) };
      const res = await fetch(isEdit ? `/api/admin/products/${editId}` : "/api/admin/products", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setModalOpen(false);
      await fetchPage(pagination.page);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      await fetchPage(pagination.page);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  useEffect(() => {
    // Ensure initial is displayed; lazy refetch not necessary here
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Products</h2>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-950"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {error && <div className="px-6 py-3 text-sm text-red-600 bg-red-50">{error}</div>}

      {loading ? (
        <div className="px-6 py-10 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" />
          <p className="mt-2 text-sm text-slate-500">Loading products...</p>
        </div>
      ) : (
        <>
          {items.length === 0 ? (
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
              <table className="min-w-full divide-y divide-slate-100 text-left text-sm text-slate-600">
                <thead className="bg-white">
                  <tr>
                    <th className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">Name</th>
                    <th className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">Quantity</th>
                    <th className="px-6 py-3 font-semibold uppercase tracking-widest text-xs text-slate-500">Price</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {items.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4 text-slate-900">{row.name}</td>
                      <td className="px-6 py-4">{row.quantity}</td>
                      <td className="px-6 py-4">₹{row.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="mr-2 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50"
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {items.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-500">Rows per page</label>
                <select
                  className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700"
                  value={limit}
                  onChange={(e) => {
                    const newLimit = Number(e.target.value);
                    setLimit(newLimit);
                    fetchPage(1, newLimit);
                  }}
                >
                  {[5, 10, 25, 50, 100].map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between sm:justify-end sm:gap-4">
                  <p className="text-sm text-slate-500 hidden sm:block">
                    Page {pagination.page} of {pagination.totalPages} • {pagination.total} total
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fetchPage(Math.max(1, pagination.page - 1))}
                      disabled={pagination.page <= 1 || loading}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => fetchPage(Math.min(pagination.totalPages, pagination.page + 1))}
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
        </>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
              {isEdit ? "Edit Product" : "Add Product"}
            </div>
            <form onSubmit={onSubmit} className="space-y-4 px-5 py-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Product Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Quantity</label>
                  <input
                    type="number"
                    min={0}
                    value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
                    required
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Price</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
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
                  {isEdit ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
