import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl: (config?: NextConfig | undefined) => NextConfig = createNextIntlPlugin();

export const nextConfig: NextConfig = {
    eslint: {
        ignoreDuringBuilds: true
    }
};

export default withNextIntl(nextConfig)

