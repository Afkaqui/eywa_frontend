"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User, Building2, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';

const logo = "/logo.png";

interface LoginPageProps {
  onBack: () => void;
}

export function LoginPage({ onBack }: LoginPageProps) {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    company: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    if (isLogin) {
      const { error: loginError } = await signIn(formData.email, formData.password);
      if (loginError) {
        setError(loginError === 'Invalid login credentials'
          ? 'Credenciales incorrectas. Verifica tu correo y contraseña.'
          : loginError
        );
      }
    } else {
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        setIsSubmitting(false);
        return;
      }
      const { error: signUpError } = await signUp(
        formData.email,
        formData.password,
        { full_name: formData.name, company: formData.company }
      );
      if (signUpError) {
        setError(signUpError);
      } else {
        setSuccessMsg('Cuenta creada. Revisa tu correo para confirmar tu registro.');
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </button>

          <div className="flex items-center gap-3 mb-12">
            <img src={logo} alt="EYWA Logo" className="w-12 h-12 object-contain" />
            <div>
              <div className="text-gray-900 font-bold text-2xl tracking-tight">EYWA</div>
              <div className="text-emerald-600 text-xs tracking-wider">SUSTAINABILITY PLATFORM</div>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-light text-gray-900 mb-3">
              {isLogin ? 'Bienvenido' : 'Crear cuenta'}
            </h1>
            <p className="text-gray-600">
              {isLogin
                ? 'Accede a tu panel de sostenibilidad'
                : 'Regístrate para comenzar tu evaluación'}
            </p>
          </div>

          <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => { setIsLogin(true); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
                isLogin
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
                !isLogin
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Error / Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Juan Pérez"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Nombre de la empresa"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="correo@empresa.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-600">Recordarme</span>
                </label>
                <a
                  href="/recuperar"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-0.5"
                    required
                  />
                  <span className="text-sm text-gray-600">
                    Acepto los{' '}
                    <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                      términos y condiciones
                    </a>
                    {' '}y la{' '}
                    <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                      política de privacidad
                    </a>
                  </span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </button>
          </form>

          {/* Google/Apple retirados hasta configurar sus credenciales OAuth (PLAN B5). */}

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(null); setSuccessMsg(null); }}
                className="text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1622353133218-825cfebb6844?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBhZ3JpY3VsdHVyZSUyMGZpZWxkfGVufDF8fHx8MTc2OTEwMjIwMHww&ixlib=rb-4.1.0&q=80&w=1080')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 to-gray-900/80"></div>
        </div>

        <div className="relative z-10 h-full flex flex-col justify-between p-12">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-emerald-300 text-sm font-medium mb-8">
              Plataforma Institucional
            </div>
          </div>

          <div>
            <h2 className="text-5xl font-light text-white mb-6 leading-tight">
              Sostenibilidad<br />
              <span className="font-semibold">verificable y medible</span>
            </h2>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed max-w-lg">
              Diagnóstico GENES, dataroom por empresa y conexión con fondos e inversores
              de impacto.
            </p>

            {/* Se retiraron cifras de ejemplo (Trust Score 85, 6.5k t CO₂, 24 empresas) que no eran datos reales. */}
          </div>
        </div>
      </div>
    </div>
  );
}
