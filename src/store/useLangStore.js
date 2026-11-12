import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function applyHtmlLang(lang) {
  if (typeof document !== 'undefined') document.documentElement.lang = lang;
}

export const useLangStore = create(
  persist(
    (set) => ({
      lang: 'th',
      setLang: (lang) => {
        applyHtmlLang(lang);
        set({ lang });
      },
    }),
    {
      name: 'lang-storage',
      partialize: (state) => ({ lang: state.lang }),
      onRehydrateStorage: () => (state) => applyHtmlLang(state?.lang ?? 'th'),
    }
  )
);
