import Link from 'next/link';
import { House, MapTrifold } from '@phosphor-icons/react/dist/ssr';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#0a0a0a]">
      <div className="w-full max-w-md">
        <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-[#2a2a2a]">
          <div className="p-8 text-center">
            <div className="mx-auto mb-6 w-24 h-24 rounded-full bg-[#2a2a2a] flex items-center justify-center">
              <MapTrifold size={48} weight="fill" className="text-[#666]" />
            </div>
            <h1 className="text-[#2db87c] text-[24px] font-bold mb-3">Страница не найдена</h1>
            <p className="text-[#999] text-[15px] leading-relaxed mb-2">
              К сожалению, запрашиваемая страница не существует
            </p>
            <p className="text-[#666] text-[13px] leading-relaxed">
              Возможно, вы перешли по устаревшей ссылке или ввели неверный адрес
            </p>
          </div>

          <div className="p-4 pt-0 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 bg-[#2db87c] text-white px-6 py-4 rounded-xl text-[15px] font-medium hover:bg-[#25a06a] transition-all duration-200 active:scale-95"
            >
              <House size={20} weight="fill" />
              <span>На главную</span>
            </Link>
            <Link
              href="/offline"
              className="flex-1 flex items-center justify-center gap-2 bg-[#2a2a2a] text-white px-6 py-4 rounded-xl text-[15px] font-medium hover:bg-[#333] transition-all duration-200 active:scale-95"
            >
              <span>Оффлайн режим</span>
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[#666] text-[13px]">Ошибка 404</p>
        </div>
      </div>
    </div>
  );
}
