import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, isValidLocale } from '@/i18n/config';

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const cookieLocale = (await cookies()).get('NEXT_LOCALE')?.value;

  const locale = isValidLocale(requestedLocale)
    ? requestedLocale
    : isValidLocale(cookieLocale)
      ? cookieLocale
      : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
