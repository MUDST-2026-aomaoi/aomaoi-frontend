import { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../controller/authController';
import { LanguageSwitch } from '../../components/ui/LanguageSwitch';
import { TaskZones } from '../../components/dashboard/TaskZones';
import { useT } from '../../i18n';
import { translateBackendMessage } from '../../i18n/backendMessages';
import logo from '../../assets/sugarcane-logo.png';
import caneBg from '../../assets/login-bg.png';

const FIELD =
  'flex items-center gap-3 rounded-2xl border border-[#E4E9DA] bg-white px-4 py-3.5 transition focus-within:border-[#4F7A2B] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#A8D04A]/30';

// Decorative only: fixed shares so the little field looks lively (no real data on the login page).
const DEMO_ZONES = [
  { id: 'cutting', label: '', pct: 45, color: '#224213' },
  { id: 'planting', label: '', pct: 20, color: '#ADC565' },
  { id: 'watering', label: '', pct: 15, color: '#689142' },
  { id: 'spraying', label: '', pct: 30, color: '#517A34' },
];
const noop = () => {};

export default function Login() {
  const t = useT();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const result = await login(username, password);

    if (result.success) {
      // Backend login success! Redirect to unified dashboard
      navigate('/dashboard', { state: { showSetPassword: result.isFirstLogin } });
    } else {
      setErrorMsg(translateBackendMessage(result.error));
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-skin login-glass relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#F4F6F0] px-4 pb-6 pt-16 text-[#1A1A1A] sm:p-8">
      {/* Blurred cane field + deep green wash, so the low-res photo reads as atmosphere */}
      <img src={caneBg} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover blur-[4px]" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-[#F4F6F0]/80 via-[#E8F1D4]/65 to-[#CFE5A3]/55" />

      <LanguageSwitch className="absolute right-4 top-4 z-10" />

      <div className="relative grid w-full max-w-[1000px] gap-5 rounded-[28px] sm:gap-8 sm:rounded-[32px] bg-white/60 p-5 shadow-[0_24px_64px_rgba(46,74,31,0.16)] ring-1 ring-white/80 backdrop-blur-2xl sm:p-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12 lg:p-10">
        {/* Cute isometric farm in a rounded frame */}
        <div className="relative flex flex-col items-center gap-3 lg:items-stretch lg:justify-between lg:gap-2 overflow-hidden rounded-3xl max-lg:overflow-visible lg:bg-gradient-to-br lg:from-[#5E8F2E] lg:via-[#7DA33A] lg:to-[#A8D04A] lg:ring-1 lg:ring-white/40 lg:min-h-[520px] lg:p-8 lg:py-8">
          <div aria-hidden className="pointer-events-none absolute hidden lg:block -right-16 -top-16 h-56 w-56 rounded-full bg-[#E6F58A]/25 blur-3xl" />

          <div className="relative flex items-center gap-2.5">
            <img src={logo} alt="Sugarcane Logo" className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-white p-1 object-contain" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2E4A1F] lg:text-white/90">Sugarcane</span>
          </div>

          <div className="login-float relative mx-auto my-0 w-[58%] max-w-[210px] sm:max-w-[260px] lg:my-2 lg:w-full lg:max-w-[340px]">
            <TaskZones zones={DEMO_ZONES} activeId={null} onActive={noop} showChips={false} />
          </div>

          <p className="relative hidden text-sm text-white/80 lg:block">{t('login.tagline')}</p>
        </div>

        {/* Form */}
        <div className="flex flex-col justify-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[#4F7A2B]">{t('login.welcome')}</p>
          <h1 className="text-4xl font-extrabold leading-none tracking-tight text-[#1A1A1A] sm:text-6xl">{t('login.title')}</h1>
          <div className="my-3 sm:my-5 h-px w-40 bg-[#2E4A1F]/25" />
          <p className="mb-5 sm:mb-7 max-w-sm text-sm text-[#6B7264]">{t('login.subtitle')}</p>

          <form onSubmit={handleLogin} className="flex max-w-md flex-col gap-5">
            {errorMsg && (
              <div data-test="login-error" className="rounded-xl bg-red-50 p-3 text-center text-sm font-medium text-red-600">
                {errorMsg}
              </div>
            )}

            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold text-[#2E4A1F]">{t('login.username')}</span>
              <div className={FIELD}>
                <User size={18} className="shrink-0 text-[#7DA33A]" />
                <input
                  type="text"
                  data-test="login-username"
                  placeholder={t('login.usernamePlaceholder')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="min-w-0 flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold text-[#2E4A1F]">{t('login.password')}</span>
              <div className={FIELD}>
                <Lock size={18} className="shrink-0 text-[#7DA33A]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  data-test="login-password"
                  placeholder={t('login.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="min-w-0 flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 transition-colors hover:text-[#2E4A1F]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              data-test="login-submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-full bg-[#2E4A1F] py-3.5 text-sm font-bold tracking-widest text-white shadow-[0_10px_24px_rgba(46,74,31,0.25)] transition hover:bg-[#3F6B27] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? t('login.submitting') : t('login.submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
