"use client";

import { Loader2 } from 'lucide-react';

const logo = "/logo.png";

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <img src={logo} alt="EYWA" className="w-16 h-16 object-contain mb-6" />
      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-4" />
      <p className="text-sm text-gray-500">Cargando plataforma...</p>
    </div>
  );
}
