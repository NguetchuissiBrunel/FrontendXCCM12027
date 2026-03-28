'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useLocale, useTranslations } from 'next-intl';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check, ChevronDown, Globe } from 'lucide-react';
import type { AppLocale } from '@/i18n/config';

const availableLocales: AppLocale[] = ['fr', 'en'];

interface LanguageSwitcherProps {
  className?: string;
  compact?: boolean;
}

export default function LanguageSwitcher({
  className = '',
  compact = false,
}: LanguageSwitcherProps) {
  const router = useRouter();
  const locale = useLocale() as AppLocale;
  const t = useTranslations('languageSwitcher');
  const [isPending, startTransition] = useTransition();

  const handleChange = (nextLocale: AppLocale) => {
    if (nextLocale === locale) {
      return;
    }

    Cookies.set('NEXT_LOCALE', nextLocale, {
      expires: 365,
      sameSite: 'lax',
    });

    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className={className}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-label={t('label')}
            disabled={isPending}
            className={`inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm outline-none transition-colors hover:border-purple-300 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-purple-500 dark:hover:text-purple-300 ${
              compact ? 'h-10 w-10' : 'px-3 py-2'
            }`}
          >
            <Globe className={compact ? 'h-4 w-4' : 'h-4 w-4'} />
            {!compact && (
              <>
                <span className="text-sm font-medium uppercase">{locale}</span>
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={8}
            className="z-[100] min-w-[160px] rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-gray-700 dark:bg-gray-900"
          >
            {availableLocales.map((availableLocale) => {
              const isActive = availableLocale === locale;

              return (
                <DropdownMenu.Item
                  key={availableLocale}
                  onSelect={() => handleChange(availableLocale)}
                  className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-gray-700 outline-none transition-colors hover:bg-purple-50 hover:text-purple-700 focus:bg-purple-50 focus:text-purple-700 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-purple-300 dark:focus:bg-gray-800 dark:focus:text-purple-300"
                >
                  <span>{t(`languages.${availableLocale}`)}</span>
                  {isActive ? <Check className="h-4 w-4 text-purple-600 dark:text-purple-300" /> : null}
                </DropdownMenu.Item>
              );
            })}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
