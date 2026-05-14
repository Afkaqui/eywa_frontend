"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DiagnosticRepository } from '@/lib/repositories/diagnostic-repository';
import { DiagnosticService } from '@/lib/services/diagnostic-service';
import { hasMinimumRole } from '@/lib/constants/roles';
import { HomePage } from '@/components/HomePage';
import { LoginPage } from '@/components/LoginPage';
import { HeroDashboard } from '@/components/HeroDashboard';
import { DiagnosticInterface } from '@/components/DiagnosticInterface';
import { InvestorPortfolio } from '@/components/InvestorPortfolio';
import { MobileApp } from '@/components/MobileApp';
import { NavigationSidebar } from '@/components/NavigationSidebar';
import { ValidadorProyectos } from '@/components/ValidadorProyectos';
import { SuperAdminDashboard } from '@/components/SuperAdminDashboard';
import { AdminDashboard } from '@/components/AdminDashboard';
import { GestorDashboard } from '@/components/GestorDashboard';
import { EdutechDashboard } from '@/components/EdutechDashboard';
import { LoadingScreen } from '@/components/LoadingScreen';
import type { DiagnosticResult } from '@/lib/types/database';

type ViewType =
  | 'hero' | 'diagnostic' | 'portfolio' | 'mobile' | 'validator' | 'edutech'
  | 'notifications' | 'settings'
  | 'superadmin' | 'admin' | 'gestor';

export default function Page() {
  const { user, profile, loading, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('hero');
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);

  const diagnosticService = useMemo(
    () => new DiagnosticService(new DiagnosticRepository()),
    []
  );

  // Load latest diagnostic result (non-blocking)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    diagnosticService.getLatestResult(user.id)
      .then(result => { if (!cancelled) setDiagnosticResult(result); })
      .catch(() => { /* table may not exist */ });

    return () => { cancelled = true; };
  }, [user, diagnosticService]);

  // Save diagnostic result via service
  const handleDiagnosticComplete = useCallback(async (result: DiagnosticResult) => {
    setDiagnosticResult(result);
    if (user) {
      await diagnosticService.saveResult(user.id, result).catch(() => {});
    }
  }, [user, diagnosticService]);

  if (loading) return <LoadingScreen />;
  if (!user && showLogin) return <LoginPage onBack={() => setShowLogin(false)} />;
  if (!user) return <HomePage onGetStarted={() => setShowLogin(true)} />;

  const role = profile?.role || 'user';

  return (
    <div className="flex min-h-screen bg-white">
      <NavigationSidebar
        currentView={currentView}
        userRole={role}
        userName={profile?.full_name || 'Usuario'}
        userEmail={profile?.email || ''}
        onNavigate={(view) => setCurrentView(view as ViewType)}
        onLogout={signOut}
      />

      <div className="flex-1 ml-0 md:ml-20 pb-20 md:pb-0 transition-all duration-300">
        {currentView === 'hero' && <HeroDashboard diagnosticResult={diagnosticResult} onStartDiagnostic={() => setCurrentView('diagnostic')} />}
        {currentView === 'diagnostic' && <DiagnosticInterface onScoreComplete={(result) => { handleDiagnosticComplete(result); setCurrentView('hero'); }} />}
        {currentView === 'validator' && <ValidadorProyectos />}
        {currentView === 'portfolio' && <InvestorPortfolio />}
        {currentView === 'mobile' && <MobileApp />}
        {currentView === 'edutech' && <EdutechDashboard />}

        {currentView === 'superadmin' && role === 'superadmin' && <SuperAdminDashboard />}
        {currentView === 'admin' && hasMinimumRole(role, 'admin') && <AdminDashboard />}
        {currentView === 'gestor' && hasMinimumRole(role, 'gestor') && <GestorDashboard />}

        {currentView === 'notifications' && (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 md:p-8">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">Notificaciones</h2>
              <p className="text-sm md:text-base text-gray-600">Panel de notificaciones en desarrollo</p>
            </div>
          </div>
        )}
        {currentView === 'settings' && (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 md:p-8">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">Configuracion</h2>
              <p className="text-sm md:text-base text-gray-600">Panel de configuracion en desarrollo</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
