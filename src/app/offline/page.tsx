'use client';

import { WifiSlash, ArrowClockwise } from '@phosphor-icons/react';

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-[#0a0a0a]">
      <div className="w-full max-w-md">
        <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-[#2a2a2a]">
          <div className="p-8 text-center">
            <div className="mx-auto mb-6 w-24 h-24 rounded-full bg-[#2a2a2a] flex items-center justify-center">
              <WifiSlash size={48} weight="fill" className="text-[#ff6b35]" />
            </div>
            <h1 className="text-white text-[24px] font-bold mb-3">Вы оффлайн</h1>
            <p className="text-[#999] text-[15px] leading-relaxed mb-2">
              Проверьте подключение к интернету и попробуйте снова
            </p>
            <p className="text-[#666] text-[13px] leading-relaxed">
              Некоторые функции могут быть недоступны в оффлайн режиме
            </p>
          </div>

          <div className="p-4 pt-0">
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 bg-[#2db87c] text-white px-6 py-4 rounded-xl text-[15px] font-medium hover:bg-[#25a06a] transition-all duration-200 active:scale-95"
            >
              <ArrowClockwise size={20} weight="bold" />
              <span>Повторить попытку</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[#666] text-[13px]">PWA работает в оффлайн режиме</p>
        </div>
      </div>
    </main>
  );
}
