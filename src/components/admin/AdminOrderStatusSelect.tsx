"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;

const STATUS_CLASSES: Record<string, string> = {
  pending: 'border-amber-500/40 text-amber-600',
  confirmed: 'border-blue-500/40 text-blue-600',
  shipped: 'border-purple-500/40 text-purple-600',
  delivered: 'border-green-600/40 text-green-600',
  cancelled: 'border-red-500/40 text-red-600',
};

/**
 * Order status dropdown on the admin dashboard. Optimistic UI: the select
 * updates immediately; on failure it flags the error and the page reloads
 * to re-sync from the database.
 */
export default function AdminOrderStatusSelect({
  orderId,
  current,
}: {
  orderId: string;
  current: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(current);
  const [busy, setBusy] = useState(false);

  const update = async (next: string) => {
    const previous = status;
    setStatus(next); // optimistic
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error('update failed');
    } catch {
      setStatus(previous);
      router.refresh(); // re-sync from the DB
    } finally {
      setBusy(false);
    }
  };

  return (
    <select
      value={status}
      disabled={busy}
      onChange={(e) => update(e.target.value)}
      className={`border rounded-md px-2 py-1.5 text-xs font-medium bg-transparent focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60 ${
        STATUS_CLASSES[status] ?? 'border-text-heading/20 text-text-heading'
      }`}
      aria-label={`Order status (${orderId.slice(0, 8)}…)`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
