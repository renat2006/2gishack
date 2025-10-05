'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChatMessage } from '@/types';
// import { Card } from '@/components/ui/card';
// import { MapPin } from '@phosphor-icons/react/dist/ssr';
import { PlacesModule } from './places-module';
import { ComplexesModule } from './complexes-module';

export interface MessageBubbleProps {
  message: ChatMessage;
}

// const TypingIndicator = () => (
//   <div className="flex items-center gap-1 py-1">
//     {[0, 1, 2].map((i) => (
//       <motion.span
//         key={i}
//         initial={{ y: 0, opacity: 0.4 }}
//         animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
//         transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
//         className="h-2 w-2 rounded-full bg-current"
//       />
//     ))}
//   </div>
// );

// Тайпрайтер с несколькими сценариями "думанья"
// const ThinkingTypewriter: React.FC = () => {
//   const phrases = React.useMemo(
//     () => [
//       'Анализирую запрос…',
//       'Сверяю с картой и рейтингами…',
//       'Фильтрую по расстоянию…',
//       'Проверяю часы работы…',
//       'Подбираю лучшие варианты…',
//     ],
//     []
//   );
//   const [phraseIndex, setPhraseIndex] = React.useState(0);
//   const [text, setText] = React.useState('');
//   const [isDeleting, setIsDeleting] = React.useState(false);

//   React.useEffect(() => {
//     let timer: ReturnType<typeof setTimeout> | null = null;
//     const current = phrases[phraseIndex % phrases.length] || '';
//     if (!isDeleting && text.length < current.length) {
//       timer = setTimeout(() => setText(current.slice(0, text.length + 1)), 36);
//     } else if (!isDeleting && text.length === current.length) {
//       timer = setTimeout(() => setIsDeleting(true), 650);
//     } else if (isDeleting && text.length > 0) {
//       timer = setTimeout(() => setText(current.slice(0, text.length - 1)), 20);
//     } else if (isDeleting && text.length === 0) {
//       setIsDeleting(false);
//       setPhraseIndex((i) => (i + 1) % phrases.length);
//     }
//     return () => {
//       if (timer) clearTimeout(timer);
//     };
//   }, [text, isDeleting, phraseIndex, phrases]);

//   return (
//     <span className="relative inline-flex min-h-[1em] items-center">
//       <span className="whitespace-pre">{text}</span>
//       <motion.span
//         className="ml-1 h-4 w-0.5 bg-current"
//         animate={{ opacity: [1, 0, 1] }}
//         transition={{ duration: 0.8, repeat: Infinity }}
//       />
//     </span>
//   );
// };

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  // const isTyping = false;
  // Updated: removed duplicate badge display

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-2 py-1.5"
    >
      {message.kind === 'text' ? (
        <div
          className={`text-[15px] leading-relaxed whitespace-pre-wrap px-0.5 ${
            isUser ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-700 dark:text-zinc-300'
          }`}
        >
          {message.text}
        </div>
      ) : message.kind === 'module' && message.module ? (
        <div className="mt-1">
          {message.module.type === 'places' && (
            <PlacesModule items={message.module.items} loading={message.module.loading} />
          )}
          {message.module.type === 'complexes' && (
            <ComplexesModule items={message.module.items} entities={message.module.entities} />
          )}
        </div>
      ) : message.kind === 'module' ? (
        <div className="text-sm text-zinc-400 dark:text-zinc-500 italic px-0.5">
          Неподдерживаемый модуль
        </div>
      ) : null}
    </motion.div>
  );
};
