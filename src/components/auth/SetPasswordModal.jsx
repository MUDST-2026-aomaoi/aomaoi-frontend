import { useState } from 'react';

export default function SetPasswordModal({ onSuccess }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // นำทางไปหน้า dashboard ทันทีโดยไม่มี logic เช็คใดๆ
    onSuccess();
  };

  return (
    /* Overlay */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      {/* Modal Card */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[520px] mx-4 px-12 py-14">
        {/* Title */}
        <h2 className="text-[30px] font-extrabold text-[#3B5323] text-center mb-10">
          Set New Password
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* New Password */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-[#3B5323]">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="enter your new password"
              className="w-full px-5 py-4 border border-gray-300 rounded-2xl text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#708238] transition-colors"
            />
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-[#3B5323]">
              New Password Again
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="enter your new password"
              className="w-full px-5 py-4 border border-gray-300 rounded-2xl text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#708238] transition-colors"
            />
          </div>



          {/* Submit Button */}
          <button
            type="submit"
            className="mt-2 w-full py-4 bg-[#3B5323] hover:bg-[#2f4319] text-white font-bold text-[14px] tracking-widest rounded-2xl transition-colors"
          >
            CREATE PASSWORD
          </button>
        </form>
      </div>
    </div>
  );
}
