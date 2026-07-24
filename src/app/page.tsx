"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import { OrganizationProfile } from '@/components/OrganizationProfile';
import { SimbiocreacionDashboard } from '@/components/SimbiocreacionDashboard';
import { SettingsDashboard } from '@/components/SettingsDashboard';
import { NotificationsPanel } from '@/components/NotificationsPanel';
import { DiagnosticCompleted } from '@/components/DiagnosticCompleted';
import { LoadingScreen } from '@/components/LoadingScreen';
import type { DiagnosticResult } from '@/lib/types/database';

type ViewType =
  | 'hero' | 'diagnostic' | 'portfolio' | 'mobile' | 'validator' | 'edutech'
  | 'organization' | 'simbiocreacion'
  | 'notifications' | 'settings'
  | 'superadmin' | 'admin' | 'gestor';

export default function Page() {
  const { user, profile, loading, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('hero');
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);

  // Al ENTRAR a "Diagnóstico" se decide una sola vez si mostrar el resumen de
  // "ya completado" (evita que la pantalla cambie a mitad del cuestionario si el
  // resultado llega tarde). "Nueva evaluación" lo apaga y abre el cuestionario.
  const [showDiagnosticSummary, setShowDiagnosticSummary] = useState(false);
  const diagnosticResultRef = useRef<DiagnosticResult | null>(null);
  useEffect(() => { diagnosticResultRef.current = diagnosticResult; }, [diagnosticResult]);
  useEffect(() => {
    if (currentView === 'diagnostic') setShowDiagnosticSummary(!!diagnosticResultRef.current);
  }, [currentView]);

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

  // SEO: durante `loading` se renderiza la LANDING, no un spinner.
  // En el servidor la sesión siempre está resolviéndose, así que devolver
  // <LoadingScreen/> hacía que Google (y todo rastreador que no ejecuta JS)
  // recibiera una pantalla de carga vacía en la página más importante del sitio.
  // Coste asumido: un usuario ya logueado ve la landing unos ms al recargar.
  if (loading) return <HomePage onGetStarted={() => setShowLogin(true)} />;
  if (!user && showLogin) return <LoginPage onBack={() => setShowLogin(false)} />;
  if (!user) return <HomePage onGetStarted={() => setShowLogin(true)} />;

  const role = profile?.role || 'user';

  return (
    <div className="flex min-h-screen bg-white">
      <NavigationSidebar
        currentView={currentView}
        userRole={role}
        userName={profile?.fullName || 'Usuario'}
        userEmail={profile?.email || ''}
        userId={profile?.id ?? user?.id}
        onNavigate={(view) => setCurrentView(view as ViewType)}
        onLogout={signOut}
      />

      <div className="flex-1 ml-0 md:ml-20 pb-20 md:pb-0 transition-all duration-300">
        {currentView === 'hero' && <HeroDashboard diagnosticResult={diagnosticResult} onStartDiagnostic={() => setCurrentView('diagnostic')} />}
        {currentView === 'diagnostic' && (
          diagnosticResult && showDiagnosticSummary ? (
            <DiagnosticCompleted
              result={diagnosticResult}
              onRetake={() => setShowDiagnosticSummary(false)}
              onNavigate={(view) => setCurrentView(view as ViewType)}
            />
          ) : (
            <DiagnosticInterface onScoreComplete={(result) => { handleDiagnosticComplete(result); setCurrentView('hero'); }} />
          )
        )}
        {currentView === 'validator' && <ValidadorProyectos />}
        {currentView === 'organization' && <OrganizationProfile onNavigate={(view) => setCurrentView(view as ViewType)} />}
        {currentView === 'simbiocreacion' && <SimbiocreacionDashboard />}
        {currentView === 'portfolio' && <InvestorPortfolio />}
        {currentView === 'mobile' && <MobileApp />}
        {currentView === 'edutech' && <EdutechDashboard />}

        {currentView === 'superadmin' && role === 'superadmin' && <SuperAdminDashboard />}
        {currentView === 'admin' && hasMinimumRole(role, 'admin') && <AdminDashboard />}
        {currentView === 'gestor' && hasMinimumRole(role, 'gestor') && <GestorDashboard />}

        {currentView === 'notifications' && (
          <NotificationsPanel onNavigate={(view) => setCurrentView(view as ViewType)} />
        )}
        {currentView === 'settings' && <SettingsDashboard />}
      </div>
    </div>
  );
}
