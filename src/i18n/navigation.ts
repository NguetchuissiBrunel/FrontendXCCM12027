// src/i18n/navigation.ts
import { createNavigation } from 'next-intl/navigation';
import { locales } from './config';

// La nouvelle fonction s'appelle simplement createNavigation
export const { Link, redirect, usePathname, useRouter } =
  createNavigation({ locales });