'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function RedirectPage() {
  const { token } = useParams();

  useEffect(() => {
    // Redirect to scan page with token as query param
    window.location.href = `/scan?token=${token}`;
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full" />
    </div>
  );
}
