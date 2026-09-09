import { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useWorkerStore } from '../../store/useWorkerStore';
import SetPasswordModal from '../../components/auth/SetPasswordModal';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const workers = useWorkerStore((s) => s.workers);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showSetPassword, setShowSetPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('กรุณากรอก Username และ Password ให้ครบถ้วน');
      return;
    }

    const result = login(username.trim(), password.trim(), workers);

    if (!result.success) {
      setError(result.error);
      return;
    }

    if (result.isFirstLogin) {
      setShowSetPassword(true);
    } else {
      navigate('/worker/dashboard');
    }
  };

  const handlePasswordSet = () => {
    setShowSetPassword(false);
    navigate('/worker/dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      {/* Set Password Modal */}
      {showSetPassword && (
        <SetPasswordModal onSuccess={handlePasswordSet} />
      )}

      {/* Login Card */}
      <div className="w-full max-w-[420px] px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-[32px] font-extrabold text-[#3B5323] tracking-wide mb-3">
            LOG IN
          </h1>
          <div className="relative inline-block">
            <p className="text-[#708238] font-semibold text-[15px]">
              Sugarcane Farm Accounting Management
            </p>
            <div className="absolute -bottom-2 left-0 right-0 h-[2px] bg-[#708238] rounded-full" />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="mt-10 flex flex-col gap-5">
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-gray-600">username</label>
            <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-2xl focus-within:border-[#708238] transition-colors">
              <User size={17} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="enter your username"
                className="flex-1 outline-none text-sm text-gray-700 placeholder:text-gray-400 bg-transparent"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-gray-600">password</label>
            <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-2xl focus-within:border-[#708238] transition-colors">
              <Lock size={17} className="text-gray-400 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="enter your password"
                className="flex-1 outline-none text-sm text-gray-700 placeholder:text-gray-400 bg-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-[13px] text-center font-medium">{error}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="mt-2 w-full py-3.5 bg-[#3B5323] hover:bg-[#2f4319] text-white font-bold text-[14px] tracking-widest rounded-2xl transition-colors"
          >
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
}
