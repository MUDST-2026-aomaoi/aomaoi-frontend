import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../controller/authController';
import { useT } from '../../i18n';
import { tError } from '../../i18n/backendMessages';
import { Spinner } from '../ui/Spinner';

export default function SetPasswordModal({ onSuccess }) {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const setFirstLoginDone = useAuthStore(state => state.setFirstLoginDone);
  const replaceToken = useAuthStore(state => state.replaceToken);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMessage(t('setpw.err.fillAll'));
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage(t('setpw.err.minLength'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage(t('setpw.err.mismatch'));
      return;
    }
    setIsSaving(true);
    try {
      // Assuming api wrapper handles the JWT token
      const { default: api } = await import('../../service/api');
      const response = await api.post('/auth/change-password', { oldPassword, newPassword });
      replaceToken(response.data.token);
      
      // Update global state immediately
      setFirstLoginDone();
      setIsSuccess(true);
    } catch (error) {
      console.error("Failed to change password", error);
      const msg = tError(error, t('setpw.err.failed'));
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    // Clear the router state (showSetPassword: true) so it doesn't reappear on refresh (F5)
    navigate(location.pathname, { replace: true, state: {} });
    onSuccess();
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[440px] mx-4 relative flex flex-col items-center py-16">
          {/* Close Button */}
          <button
            data-test="setpw-success-close"
            onClick={handleClose}
            className="absolute top-5 right-5 text-[#3B5323] hover:opacity-70 transition-opacity"
          >
            <X size={28} strokeWidth={2.5} />
          </button>
          
          {/* Success Icon */}
          <div className="mt-4 mb-10 w-44 h-44 rounded-full border-[6px] border-[#3B5323] flex items-center justify-center shrink-0">
            <Check size={80} strokeWidth={5} className="text-[#3B5323] ml-2" />
          </div>
          
          {/* Success Text */}
          <p data-test="setpw-success" className="text-gray-900 font-medium text-[17px] mb-2">
            {t('setpw.success')}
          </p>
        </div>
      </div>
    );
  }

  return (
    /* Overlay */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      {/* Modal Card */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[520px] mx-4 px-12 py-14 relative">
        {/* Title */}
        <h2 className="text-[30px] font-extrabold text-[#3B5323] text-center mb-6">
          {t('setpw.title')}
        </h2>

        {errorMessage && (
          <div data-test="setpw-error" className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-600 text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Old Password */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-[#3B5323]">
              {t('setpw.old')}
            </label>
            <input
              type="password"
              data-test="setpw-old"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder={t('setpw.oldPlaceholder')}
              className="w-full px-5 py-4 border border-gray-300 rounded-2xl text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#708238] transition-colors"
            />
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-[#3B5323]">
              {t('setpw.new')}
            </label>
            <input
              type="password"
              data-test="setpw-new"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('setpw.newPlaceholder')}
              className="w-full px-5 py-4 border border-gray-300 rounded-2xl text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#708238] transition-colors"
            />
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-[#3B5323]">
              {t('setpw.confirm')}
            </label>
            <input
              type="password"
              data-test="setpw-confirm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('setpw.newPlaceholder')}
              className="w-full px-5 py-4 border border-gray-300 rounded-2xl text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#708238] transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            data-test="setpw-submit"
            disabled={isSaving}
            aria-busy={isSaving || undefined}
            className="mt-2 flex w-full items-center justify-center gap-2.5 py-4 bg-[#3B5323] hover:bg-[#2f4319] text-white font-bold text-[14px] tracking-widest rounded-2xl transition-colors disabled:cursor-wait"
          >
            {isSaving && <Spinner className="h-4 w-4" />}
            {t('setpw.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
