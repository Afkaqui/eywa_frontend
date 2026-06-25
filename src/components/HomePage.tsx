"use client";

import { useState, useEffect } from 'react';
import { ArrowRight, Shield, BarChart3, Leaf, Award, ChevronDown, Network, Database, GitBranch, Layers, Mail, MapPin, Phone, Linkedin, Twitter, Globe } from 'lucide-react';

const logo = "/logo.png";

interface HomePageProps {
  onGetStarted: () => void;
}

export function HomePage({ onGetStarted }: HomePageProps) {
  const [fogVisible, setFogVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setFogVisible(false), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <img src={logo} alt="EYWA Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
              <div>
                <div className="text-gray-900 font-bold text-base md:text-xl tracking-tight">EYWA</div>
                <div className="text-emerald-600 text-[10px] md:text-xs tracking-wider hidden sm:block">ORQUESTACIÓN DE ECOSISTEMAS</div>
              </div>
            </div>
            <div className="flex items-center gap-3 md:gap-8">
              <a href="#platform" className="hidden md:block text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">Plataforma</a>
              <a href="#features" className="hidden md:block text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">Características</a>
              <a href="#about" className="hidden lg:block text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">Nosotros</a>
              <button 
                onClick={onGetStarted}
                className="px-4 md:px-6 py-2 md:py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all text-xs md:text-sm font-medium shadow-sm"
              >
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1705998989555-87ed424a269d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbWF6b24lMjByYWluZm9yZXN0JTIwYWVyaWFsfGVufDF8fHx8MTc2OTEwMTY4NHww&ixlib=rb-4.1.0&q=80&w=1080')`,
          }}
        >
          {/* White fade — solo en el tercio inferior para transición de página */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent 55%, white 100%)' }}
          />
          {/* Fog oscuro que se disipa al cargar */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, rgba(17,24,39,0.92) 0%, rgba(17,24,39,0.55) 65%, transparent 100%)',
              opacity: fogVisible ? 1 : 0.58,
              transition: 'opacity 2.8s ease-out',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-emerald-300 text-xs md:text-sm font-medium mb-6 md:mb-8">
            <Network className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Plataforma de Orquestación Ecosistémica</span>
            <span className="sm:hidden">Orquestación Ecosistémica</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-light text-white mb-4 md:mb-6 tracking-tight leading-tight px-4" style={{ textShadow: '0 2px 16px rgba(0,0,0,0.6)' }}>
            Orquestando Ecosistemas<br />
            <span className="font-semibold">a través de Datos</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/80 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed px-4" style={{ textShadow: '0 1px 10px rgba(0,0,0,0.55)' }}>
            EYWA combina y conecta los ecosistemas de gobierno, empresas, inversores y sociedad civil 
            a través de una plataforma inteligente de gestión de datos para impulsar la sostenibilidad medible.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 px-4">
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-all text-sm md:text-lg font-semibold shadow-2xl flex items-center justify-center gap-2"
            >
              Acceder a la Plataforma
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-xl hover:bg-white/20 transition-all text-sm md:text-lg font-medium">
              Ver Demo
            </button>
          </div>

          {/* Stats */}
          <div
            className="mt-12 md:mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-12 max-w-4xl mx-auto px-4 py-6 rounded-2xl"
            style={{ background: 'radial-gradient(ellipse at center, rgba(17,24,39,0.45) 0%, rgba(17,24,39,0.15) 70%, transparent 100%)' }}
          >
            {[
              { value: '4', label: 'Ecosistemas Conectados', unit: '+' },
              { value: '12.8k', label: 'Puntos de Datos / Día', unit: '' },
              { value: '142.5', label: 'Millones USD Gestionados', unit: 'M' },
            ].map((stat, i) => (
              <div key={i} className="border-b border-white/25 pb-4 md:pb-6">
                <div
                  className="text-2xl md:text-4xl font-light text-white mb-2"
                  style={{ textShadow: '0 2px 14px rgba(0,0,0,0.95), 0 0 4px rgba(0,0,0,0.8)' }}
                >
                  {stat.value}<span className="text-emerald-400">{stat.unit}</span>
                </div>
                <div
                  className="text-xs md:text-sm text-white uppercase tracking-wider"
                  style={{ textShadow: '0 1px 10px rgba(0,0,0,0.95), 0 0 4px rgba(0,0,0,0.8)' }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:block">
          <ChevronDown className="w-6 h-6 text-white/50 animate-bounce" />
        </div>
      </section>

      {/* Platform Section */}
      <section id="platform" className="py-16 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-20">
            <div className="text-xs md:text-sm text-emerald-600 uppercase tracking-wider font-semibold mb-4">La Plataforma</div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-4 md:mb-6 px-4">
              Conectando Ecosistemas<br />
              <span className="font-semibold">a través de Inteligencia de Datos</span>
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto px-4">
              Una plataforma de gestión que orquesta la interacción entre gobierno, empresas, inversores 
              y sociedad civil mediante flujos de datos verificables, análisis predictivo y toma de decisiones informada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Left Image */}
            <div 
              className="relative rounded-2xl overflow-hidden h-[300px] md:h-[500px] bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1765739099940-83ce53c649b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXN0YWluYWJsZSUyMGJ1c2luZXNzJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjkwMDQ2NDZ8MA&ixlib=rb-4.1.0&q=80&w=1080')`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
              <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8 right-4 md:right-8">
                <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-xl p-4 md:p-6 shadow-2xl">
                  <h3 className="text-base md:text-xl font-semibold text-gray-900 mb-2">Integración de Ecosistemas</h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    Conectamos gobierno, empresas e inversores en un único flujo de trabajo colaborativo basado en datos verificables.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div 
              className="relative rounded-2xl overflow-hidden h-[300px] md:h-[500px] bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1622353133218-825cfebb6844?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBhZ3JpY3VsdHVyZSUyMGZpZWxkfGVufDF8fHx8MTc2OTEwMjIwMHww&ixlib=rb-4.1.0&q=80&w=1080')`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 to-transparent"></div>
              <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8 right-4 md:right-8">
                <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-xl p-4 md:p-6 shadow-2xl">
                  <h3 className="text-base md:text-xl font-semibold text-gray-900 mb-2">Inteligencia Analítica</h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    Procesamiento continuo de datos ESG con trazabilidad digital para insights accionables y reportes automatizados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-20">
            <div className="text-xs md:text-sm text-emerald-600 uppercase tracking-wider font-semibold mb-4">Funcionalidades</div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-4 md:mb-6 px-4">
              Capacidades de<br />
              <span className="font-semibold">Orquestación Inteligente</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                icon: Network,
                title: 'Orquestación',
                description: 'Conecta ecosistemas de gobierno, empresas e inversores en tiempo real.',
              },
              {
                icon: Database,
                title: 'Gestión de Datos',
                description: 'Centraliza, valida y procesa datos ESG de múltiples fuentes.',
              },
              {
                icon: GitBranch,
                title: 'Flujos Inteligentes',
                description: 'Automatiza workflows entre stakeholders con lógica adaptativa.',
              },
              {
                icon: Layers,
                title: 'Interoperabilidad',
                description: 'APIs e integraciones con sistemas gubernamentales y financieros.',
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 hover:shadow-lg transition-shadow">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-emerald-50 flex items-center justify-center mb-4 md:mb-6">
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">{feature.title}</h3>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>

          {/* Modules - Ecosystems */}
          <div className="mt-12 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                title: 'Ecosistema Gobierno',
                description: 'Gestión de políticas públicas, cumplimiento normativo y reportes institucionales con trazabilidad completa.',
                metrics: 'Public Sector',
              },
              {
                title: 'Ecosistema Empresas',
                description: 'Diagnóstico ESG, certificaciones, y acceso a financiamiento verde con métricas verificables en tiempo real.',
                metrics: 'Private Sector',
              },
              {
                title: 'Ecosistema Inversores',
                description: 'Due diligence automatizado, portfolio monitoring y análisis de riesgo sostenible con datos auditables.',
                metrics: 'Financial Sector',
              },
            ].map((module, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 md:p-6">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">{module.title}</h3>
                  <span className="px-2 md:px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg">
                    {module.metrics}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-gray-600">{module.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div>
              <div className="text-xs md:text-sm text-emerald-600 uppercase tracking-wider font-semibold mb-4">Sobre EYWA</div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-4 md:mb-6">
                Orquestación ecosistémica<br />
                <span className="font-semibold">impulsada por datos</span>
              </h2>
              <p className="text-sm md:text-base lg:text-lg text-gray-600 mb-6 md:mb-8 leading-relaxed">
                EYWA es una plataforma de gestión que combina y orquesta los ecosistemas de gobierno, empresas, 
                inversores y sociedad civil a través de flujos de datos inteligentes, análisis predictivo y 
                automatización de procesos para impulsar decisiones sostenibles basadas en evidencia.
              </p>
              <div className="space-y-3 md:space-y-4">
                {[
                  'Integración API con sistemas gubernamentales y financieros',
                  'Data pipelines automatizados con validación multi-fuente',
                  'Orquestación de workflows entre stakeholders heterogéneos',
                  'Analytics en tiempo real con trazabilidad digital blockchain',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                    </div>
                    <span className="text-sm md:text-base text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div 
              className="relative rounded-2xl overflow-hidden h-[300px] md:h-[400px] lg:h-[600px] bg-cover bg-center order-first lg:order-last"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1759668499016-4ec0b1663485?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3Jlc3QlMjB0ZWNobm9sb2d5JTIwZGF0YXxlbnwxfHx8fDE3NjkxMDIxOTl8MA&ixlib=rb-4.1.0&q=80&w=1080')`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/50 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-32 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-4 md:mb-6 px-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-300 mb-8 md:mb-12 px-4">
            Accede a la plataforma y empieza a medir, certificar y reportar tu impacto sostenible.
          </p>
          <button 
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 md:px-10 py-3 md:py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-all text-base md:text-lg font-semibold shadow-2xl inline-flex items-center justify-center gap-3"
          >
            Iniciar Sesión
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800/50">
        {/* Main Footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                <img src={logo} alt="EYWA Logo" className="w-10 h-10 object-contain" />
                <div>
                  <div className="text-white font-bold text-lg tracking-tight">EYWA</div>
                  <div className="text-emerald-400 text-[10px] tracking-[0.2em] font-medium">SUSTAINABILITY PLATFORM</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Orquestando ecosistemas a través de datos inteligentes para impulsar decisiones sostenibles basadas en evidencia.
              </p>
              <div className="flex items-center gap-3">
                {[
                  { icon: Linkedin, href: "#", label: "LinkedIn" },
                  { icon: Twitter, href: "#", label: "Twitter" },
                  { icon: Globe, href: "#", label: "Website" },
                ].map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className="w-9 h-9 rounded-lg bg-gray-800/80 hover:bg-emerald-600 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Platform Column */}
            <div>
              <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-5">Plataforma</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Diagnóstico ESG', href: '#' },
                  { label: 'Validador de Proyectos', href: '#' },
                  { label: 'Portfolio de Inversores', href: '#' },
                  { label: 'Reportes y Analítica', href: '#' },
                  { label: 'Programa Edutech', href: '#' },
                ].map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-gray-400 hover:text-emerald-400 text-sm transition-colors duration-200">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-5">Empresa</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Sobre Nosotros', href: '#about' },
                  { label: 'Blog', href: '#' },
                  { label: 'Carreras', href: '#' },
                  { label: 'Alianzas', href: '#' },
                  { label: 'Prensa', href: '#' },
                ].map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-gray-400 hover:text-emerald-400 text-sm transition-colors duration-200">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div>
              <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-5">Contacto</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <a href="mailto:contacto@eywa.com" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors duration-200">
                    contacto@eywa.com
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-400 text-sm">+1 (555) 000-0000</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-400 text-sm">Pucallpa, Perú</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-500 order-2 md:order-1">
                &copy; {new Date().getFullYear()} EYWA Platform. Todos los derechos reservados.
              </p>
              <div className="flex items-center gap-6 order-1 md:order-2">
                {[
                  { label: 'Política de Privacidad', href: '#' },
                  { label: 'Términos de Uso', href: '#' },
                  { label: 'Cookies', href: '#' },
                ].map((link, i) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-gray-500 hover:text-gray-300 text-xs transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}