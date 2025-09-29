import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'hi', 'bng'],

  // Used when no locales matches
  defaultLocale: 'en',
  pathnames: {
    "/dashboard": {
      en: "/dashboard",
      hi: "/डैशबोर्ड"
    }
  }
})

// Lightweight wrappers around Next.js navigation APIs
// that will consider the routing configuration
export type Locale = (typeof routing.locales)[number];
export const {Link, redirect, usePathname, useRouter} = createNavigation(routing)