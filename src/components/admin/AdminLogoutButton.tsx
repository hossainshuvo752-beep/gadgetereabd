"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

/** Clears the admin session cookie server-side and re-renders the gate. */
export default function AdminLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="px-5 py-2.5 border border-accent text-accent font-medium rounded-md hover:bg-accent/10 transition-colors"
    >
      Logout
    </button>
  );
}
