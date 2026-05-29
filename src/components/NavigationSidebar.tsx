"use client";

import { useState } from 'react';
import {
  LayoutDashboard,
  Stethoscope,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  Bell,
  User,
  CheckCircle,
  Shield,
  Users,
  Database,
  GraduationCap,
  Building2,
  Network,
  PieChart,
} from 'lucide-react';
import type { UserRole } from '@/lib/types/database';
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/constants/roles';

const logo = "/logo.png";

interface NavigationSidebarProps {
  currentView: string;
  userRole: UserRole;
  userName: string;
  userEmail: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export function NavigationSidebar({ currentView, userRole, userName, userEmail, onNavigate, onLogout }: NavigationSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const baseItems = [
    { id: 'hero', icon: LayoutDashboard, label: 'Panel Principal' },
    { id: 'resumen', icon: PieChart, label: 'Resumen', href: '/resumen' },
    { id: 'diagnostic', icon: Stethoscope, label: 'Diagnóstico' },
    { id: 'validator', icon: CheckCircle, label: 'Validador de Proyectos' },
    { id: 'organization', icon: Building2, label: 'Mi Organización' },
    { id: 'simbiocreacion', icon: Network, label: 'Simbiocreación' },
    { id: 'portfolio', icon: BarChart3, label: 'Portfolio' },
    { id: 'edutech', icon: GraduationCap, label: 'Academia' },
  ];

  const roleItems: { id: string; icon: typeof Shield; label: string; roles: UserRole[] }[] = [
    { id: 'gestor', icon: Database, label: 'Gestión de Datos', roles: ['gestor', 'admin', 'superadmin'] },
    { id: 'admin', icon: Users, label: 'Gestión de Usuarios', roles: ['admin', 'superadmin'] },
    { id: 'superadmin', icon: Shield, label: 'Administración', roles: ['superadmin'] },
  ];

  const visibleRoleItems = roleItems.filter(item => item.roles.includes(userRole));

  const renderNavButton = (item: { id: string; icon: typeof Shield; label: string; href?: string }, isActive: boolean) => {
    const Icon = item.icon;
    const cls = `w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group relative ${
      isActive ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;
    const inner = (
      <>
        <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
        {isExpanded && <span className="font-medium text-sm truncate">{item.label}</span>}
        {!isExpanded && (
          <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
            {item.label}
          </div>
        )}
      </>
    );
    if (item.href) {
      return (
        <a key={item.id} href={item.href} className={cls}>{inner}</a>
      );
    }
    return (
      <button key={item.id} onClick={() => onNavigate(item.id)} className={cls}>{inner}</button>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 flex-col ${
          isExpanded ? 'w-72' : 'w-20'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img src={logo} alt="EYWA Logo" className="w-10 h-10 object-contain flex-shrink-0" />
            {isExpanded && (
              <div className="overflow-hidden">
                <div className="text-gray-900 font-bold text-xl tracking-tight">EYWA</div>
                <div className="text-emerald-600 text-xs tracking-wider">PLATFORM</div>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {baseItems.map((item) => renderNavButton(item, currentView === item.id))}

          {/* Role-based items */}
          {visibleRoleItems.length > 0 && (
            <>
              {isExpanded && (
                <div className="pt-4 pb-2">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4">Administración</div>
                </div>
              )}
              {!isExpanded && <div className="border-t border-gray-200 my-2"></div>}
              {visibleRoleItems.map((item) => renderNavButton(item, currentView === item.id))}
            </>
          )}
        </nav>

        {/* Secondary Actions */}
        <div className="px-4 py-4 border-t border-gray-200 space-y-2">
          <button
            onClick={() => onNavigate('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative ${
              currentView === 'notifications'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className="relative flex-shrink-0">
              <Bell className={`w-5 h-5 ${currentView === 'notifications' ? 'text-white' : ''}`} />
              {!isExpanded && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                  3
                </span>
              )}
            </div>
            {isExpanded && (
              <>
                <span className="font-medium text-sm">Notificaciones</span>
                <span className="ml-auto w-5 h-5 text-xs font-semibold rounded-full flex items-center justify-center bg-emerald-500 text-white">
                  3
                </span>
              </>
            )}
            {!isExpanded && (
              <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                Notificaciones
              </div>
            )}
          </button>

          <button
            onClick={() => onNavigate('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative ${
              currentView === 'settings'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Settings className={`w-5 h-5 flex-shrink-0 ${currentView === 'settings' ? 'text-white' : ''}`} />
            {isExpanded && <span className="font-medium text-sm">Configuración</span>}
            {!isExpanded && (
              <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                Configuración
              </div>
            )}
          </button>
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-200">
          {isExpanded ? (
            <div className="mb-3 px-4 py-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{userName}</div>
                  <div className="text-xs text-gray-500 truncate">{userEmail}</div>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${ROLE_COLORS[userRole]}`}>
                    {ROLE_LABELS[userRole]}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-3 flex justify-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          )}

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all bg-red-50 text-red-600 hover:bg-red-100 group relative"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isExpanded && <span className="font-medium text-sm">Cerrar Sesión</span>}
            {!isExpanded && (
              <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                Cerrar Sesión
              </div>
            )}
          </button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -right-3 top-8 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all shadow-sm"
        >
          {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe">
        <div className="flex items-center justify-around px-2 py-2">
          {baseItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                  isActive ? 'text-emerald-600' : 'text-gray-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : ''}`} />
                <span className="text-xs font-medium truncate max-w-[60px]">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
          <button
            onClick={() => onNavigate('settings')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
              currentView === 'settings' ? 'text-emerald-600' : 'text-gray-600'
            }`}
          >
            <Settings className={`w-5 h-5 ${currentView === 'settings' ? 'text-emerald-600' : ''}`} />
            <span className="text-xs font-medium">Más</span>
          </button>
        </div>
      </nav>
    </>
  );
}
