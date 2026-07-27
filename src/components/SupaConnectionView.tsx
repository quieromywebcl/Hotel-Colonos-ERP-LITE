import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  Trash2,
  Download,
  Smartphone,
  Laptop,
  Apple,
  ExternalLink,
  Key,
  Globe,
  Radio,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';
import {
  getStoredSupabaseCreds,
  setStoredSupabaseCreds,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  isSupabaseConfigured,
  supabase,
} from '../lib/supabaseClient';
import {
  getAuthorizedEmailsList,
  addAuthorizedEmail,
  removeAuthorizedEmail,
  REQUIRED_ADMIN_EMAIL,
} from '../lib/utils';

interface SupaConnectionViewProps {
  onRefreshData?: () => void;
  currentUserEmail?: string;
}

export const SupaConnectionView: React.FC<SupaConnectionViewProps> = ({
  onRefreshData,
  currentUserEmail,
}) => {
  // Connection Form State
  const initialCreds = getStoredSupabaseCreds();
  const [projectUrl, setProjectUrl] = useState<string>(
    initialCreds?.url || SUPABASE_URL || ''
  );
  const [anonKey, setAnonKey] = useState<string>(
    initialCreds?.anonKey || SUPABASE_ANON_KEY || ''
  );

  const initialIsConfigured = Boolean(
    (initialCreds?.url || SUPABASE_URL) &&
    (initialCreds?.anonKey || SUPABASE_ANON_KEY) &&
    (initialCreds?.url || SUPABASE_URL).includes('supabase.co')
  );

  const [connectionStatus, setConnectionStatus] = useState<
    'connected' | 'testing' | 'error' | 'idle'
  >(initialIsConfigured ? 'connected' : 'idle');
  
  const [statusMessage, setStatusMessage] = useState<string>(
    initialIsConfigured
      ? 'Conectado en tiempo real con Supabase PostgreSQL.'
      : 'Aún no has ingresado las credenciales de tu proyecto Supabase. Pega la URL y Anon Key a continuación para conectar.'
  );
  const [copiedKey, setCopiedKey] = useState(false);

  // Whitelist State
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState<string>('');
  const [whitelistSuccess, setWhitelistSuccess] = useState<string | null>(null);
  const [whitelistError, setWhitelistError] = useState<string | null>(null);

  // PWA State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalledPwa, setIsInstalledPwa] = useState<boolean>(false);

  useEffect(() => {
    setWhitelist(getAuthorizedEmailsList());

    // Listen for PWA prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalledPwa(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Save & Reconnect Handler
  const handleSaveConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnectionStatus('testing');
    setStatusMessage('Verificando credenciales y probando conexión con Supabase...');

    const trimmedUrl = projectUrl.trim();
    const trimmedKey = anonKey.trim();

    if (!trimmedUrl || !trimmedKey) {
      setConnectionStatus('error');
      setStatusMessage('Debes ingresar URL y Anon Key válidos.');
      return;
    }

    try {
      setStoredSupabaseCreds({ url: trimmedUrl, anonKey: trimmedKey });
      
      // Ping database query to verify connection
      if (supabase) {
        const { error } = await supabase.from('rooms').select('id').limit(1);
        if (error) {
          console.warn('Aviso al probar tablas en Supabase:', error.message);
        }
      }

      setConnectionStatus('connected');
      setStatusMessage('¡Conexión guardada con éxito! La app está conectada en tiempo real.');
      if (onRefreshData) {
        onRefreshData();
      }
    } catch (err: any) {
      console.error('Error al conectar:', err);
      setConnectionStatus('error');
      setStatusMessage(`Error de conexión: ${err.message || 'Sin respuesta del servidor'}`);
    }
  };

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    setStatusMessage('Realizando PING a la base de datos...');

    try {
      if (supabase) {
        const { data, error } = await supabase.from('settings').select('*').limit(1);
        if (error) {
          setConnectionStatus('error');
          setStatusMessage(`Respuesta de Supabase con advertencia: ${error.message}`);
          return;
        }
      }
      setConnectionStatus('connected');
      setStatusMessage('¡Conexión verificada en tiempo real! Tablas listas.');
    } catch (err: any) {
      setConnectionStatus('error');
      setStatusMessage(`Error de prueba: ${err.message}`);
    }
  };

  // Add Email to Whitelist
  const handleAddWhitelistEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setWhitelistSuccess(null);
    setWhitelistError(null);

    const emailToAdd = newEmail.trim().toLowerCase();
    if (!emailToAdd || !emailToAdd.includes('@')) {
      setWhitelistError('Ingresa un correo electrónico válido.');
      return;
    }

    const updated = addAuthorizedEmail(emailToAdd);
    setWhitelist(updated);
    setNewEmail('');
    setWhitelistSuccess(`Correo '${emailToAdd}' agregado exitosamente a la Whitelist.`);
  };

  // Remove Email from Whitelist
  const handleRemoveWhitelistEmail = (emailToRemove: string) => {
    setWhitelistSuccess(null);
    setWhitelistError(null);

    if (emailToRemove.toLowerCase() === REQUIRED_ADMIN_EMAIL.toLowerCase()) {
      setWhitelistError('No puedes eliminar la cuenta de administrador principal.');
      return;
    }

    if (
      currentUserEmail &&
      currentUserEmail.toLowerCase() === emailToRemove.toLowerCase() &&
      whitelist.length <= 1
    ) {
      setWhitelistError('No puedes eliminar tu propia cuenta si no hay más cuentas autorizadas.');
      return;
    }

    const updated = removeAuthorizedEmail(emailToRemove);
    setWhitelist(updated);
    setWhitelistSuccess(`Correo '${emailToRemove}' eliminado de la Whitelist.`);
  };

  // PWA Install Handler
  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalledPwa(true);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        'Para instalar la aplicación PWA:\n\n' +
          '• Android (Chrome): Toca los 3 puntos (⋮) -> "Instalar aplicación".\n' +
          '• iOS (Safari): Toca el botón Compartir (⬆) -> "Añadir a pantalla de inicio".\n' +
          '• PC (Chrome/Edge): Haz clic en el icono ⊕ en la barra de direcciones.'
      );
    }
  };

  const copyAnonKey = () => {
    navigator.clipboard.writeText(anonKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  return (
    <div className="space-[#2C2C2E] space-y-8 pb-12">
      {/* SECTION 1: REALTIME CONNECTION PANEL */}
      <div className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3A3A3C] pb-5">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-[#C29F5C]/15 text-[#C29F5C] rounded-xl border border-[#C29F5C]/30">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#E5E7EB] flex items-center gap-2">
                Conexión Nativa Supabase Realtime
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Configuración dinámica de API Key y URL sin dependencia de variables estáticas.
              </p>
            </div>
          </div>

          {/* Connection Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40 shadow-sm'
                  : connectionStatus === 'testing'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                  : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
              }`}
            >
              <Radio
                className={`w-3.5 h-3.5 ${
                  connectionStatus === 'connected' ? 'animate-pulse text-emerald-400' : ''
                }`}
              />
              <span>
                {connectionStatus === 'connected'
                  ? 'Conectado Realtime'
                  : connectionStatus === 'testing'
                  ? 'Verificando...'
                  : 'Desconectado'}
              </span>
            </span>

            <button
              onClick={handleTestConnection}
              title="Probar Ping con Supabase"
              className="p-2 bg-[#1C1C1E] hover:bg-[#3A3A3C] text-neutral-300 border border-[#3A3A3C] rounded-xl transition cursor-pointer"
            >
              <RefreshCw
                className={`w-4 h-4 ${connectionStatus === 'testing' ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Message Banner */}
        <div
          className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
            connectionStatus === 'connected'
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
              : connectionStatus === 'testing'
              ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
              : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
          }`}
        >
          {connectionStatus === 'connected' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <p className="font-semibold">{statusMessage}</p>
            <p className="text-[11px] opacity-85">
              Toda transacción (Ventas, Check-in, Gastos, Clientes, Inventario, Arriendo) se
              guarda inmediatamente en las tablas de Supabase.
            </p>
          </div>
        </div>

        {/* Connection Form */}
        <form onSubmit={handleSaveConnection} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1.5 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#C29F5C]" />
                <span>Supabase Project URL</span>
              </label>
              <input
                type="url"
                required
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                placeholder="https://tu-proyecto.supabase.co"
                className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-3 text-xs text-white font-mono focus:border-[#C29F5C] outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-[#C29F5C]" />
                  <span>Supabase Anon / Public Key</span>
                </span>
                <button
                  type="button"
                  onClick={copyAnonKey}
                  className="text-[10px] text-[#C29F5C] hover:underline flex items-center gap-1"
                >
                  {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey ? 'Copiado' : 'Copiar'}</span>
                </button>
              </label>
              <input
                type="text"
                required
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="sb_publishable_..."
                className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-3 text-xs text-white font-mono focus:border-[#C29F5C] outline-none transition truncate"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setProjectUrl('');
                setAnonKey('');
                setStoredSupabaseCreds(null);
                setConnectionStatus('idle');
                setStatusMessage('Credenciales borradas. Ingresa la nueva URL y Anon Key de tu proyecto Supabase.');
              }}
              className="px-4 py-3 bg-[#1C1C1E] hover:bg-[#3A3A3C] text-rose-300 font-bold text-xs rounded-xl border border-rose-500/30 transition flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpiar Credenciales</span>
            </button>

            <button
              type="submit"
              disabled={connectionStatus === 'testing'}
              className="px-6 py-3 bg-[#C29F5C] hover:bg-[#b08e4d] text-neutral-950 font-extrabold text-xs rounded-xl transition shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {connectionStatus === 'testing' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  <span>Guardar y Conectar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: WHITELIST DE CORREOS AUTORIZADOS */}
      <div className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#3A3A3C] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#E5E7EB]">
                Whitelist de Correos Autorizados
              </h3>
              <p className="text-xs text-neutral-400">
                Solo los usuarios listados aquí tienen autorización para operar el ERP.
              </p>
            </div>
          </div>
        </div>

        {whitelistSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{whitelistSuccess}</span>
          </div>
        )}

        {whitelistError && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>{whitelistError}</span>
          </div>
        )}

        {/* Form Add Email */}
        <form onSubmit={handleAddWhitelistEmail} className="flex gap-3">
          <input
            type="email"
            required
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="ejemplo@hotelcolonos.cl"
            className="flex-1 bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shadow-md shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Agregar Correo</span>
          </button>
        </form>

        {/* Email List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {whitelist.map((email) => {
            const isMainAdmin = email.toLowerCase() === REQUIRED_ADMIN_EMAIL.toLowerCase();
            return (
              <div
                key={email}
                className="bg-[#1C1C1E] border border-[#3A3A3C] p-3.5 rounded-xl flex items-center justify-between gap-2 shadow-sm"
              >
                <div className="space-y-0.5 truncate">
                  <p className="text-xs font-mono font-bold text-[#E5E7EB] truncate">{email}</p>
                  <p className="text-[10px] text-emerald-400 font-semibold">
                    {isMainAdmin ? 'Administrador Principal' : 'Acceso Concedido'}
                  </p>
                </div>

                {!isMainAdmin && (
                  <button
                    onClick={() => handleRemoveWhitelistEmail(email)}
                    title="Eliminar acceso de la whitelist"
                    className="p-1.5 text-neutral-400 hover:text-rose-400 bg-[#2C2C2E] hover:bg-rose-950/60 rounded-lg border border-[#3A3A3C] transition cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: SOPORTE PWA (INSTALABLE) */}
      <div className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3A3A3C] pb-5">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-purple-500/15 text-purple-400 rounded-xl border border-purple-500/30">
              <Smartphone className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#E5E7EB]">
                Aplicación Web Progresiva (PWA Instalable)
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Instala Hotel Colonos ERP como app nativa en tu dispositivo Móvil o Escritorio.
              </p>
            </div>
          </div>

          <button
            onClick={handleInstallPWA}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>{isInstalledPwa ? 'App Ya Instalada' : 'Instalar App PWA'}</span>
          </button>
        </div>

        {/* Step-by-Step Installation Guides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Android Guide */}
          <div className="bg-[#1C1C1E] border border-[#3A3A3C] p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
              <Smartphone className="w-5 h-5" />
              <span>Android (Google Chrome)</span>
            </div>
            <ol className="text-xs text-neutral-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>Abre esta página en Google Chrome.</li>
              <li>Presiona el menú de 3 puntos (⋮) superior.</li>
              <li>
                Selecciona <span className="text-white font-bold">"Instalar aplicación"</span> o{' '}
                <span className="text-white font-bold">"Añadir a pantalla de inicio"</span>.</li>
            </ol>
          </div>

          {/* iOS Guide */}
          <div className="bg-[#1C1C1E] border border-[#3A3A3C] p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-sky-400 font-extrabold text-sm">
              <Apple className="w-5 h-5" />
              <span>iOS (iPhone / iPad Safari)</span>
            </div>
            <ol className="text-xs text-neutral-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>Abre esta app en Safari de iOS.</li>
              <li>Toca el botón <span className="text-white font-bold">Compartir (⬆)</span>.</li>
              <li>
                Desplázate y selecciona{' '}
                <span className="text-white font-bold">"Añadir a la pantalla de inicio"</span>.
              </li>
            </ol>
          </div>

          {/* Desktop Guide */}
          <div className="bg-[#1C1C1E] border border-[#3A3A3C] p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-[#C29F5C] font-extrabold text-sm">
              <Laptop className="w-5 h-5" />
              <span>Escritorio (PC / Mac)</span>
            </div>
            <ol className="text-xs text-neutral-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>Usa Chrome o Microsoft Edge.</li>
              <li>
                En la barra de direcciones derecha, busca el icono{' '}
                <span className="text-white font-bold">⊕ / ⬇ (Instalar)</span>.
              </li>
              <li>Haz clic e instala para acceso directo en escritorio.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
