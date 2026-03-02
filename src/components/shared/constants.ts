/**
 * Shared constants used across the application.
 * Single source of truth for country data — do NOT duplicate in feature components.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// COMPREHENSIVE COUNTRY NAME LOOKUP
// Used by getCountryName() for code→name resolution (90+ countries)
// ═══════════════════════════════════════════════════════════════════════════════

export const COUNTRY_NAMES: Record<string, string> = {
    // Major Asian manufacturing
    CN: 'China', VN: 'Vietnam', IN: 'India', BD: 'Bangladesh',
    TH: 'Thailand', ID: 'Indonesia', JP: 'Japan', KR: 'South Korea',
    TW: 'Taiwan', MY: 'Malaysia', PH: 'Philippines', PK: 'Pakistan',
    KH: 'Cambodia', SG: 'Singapore', HK: 'Hong Kong', LK: 'Sri Lanka',
    MM: 'Myanmar', LA: 'Laos', NP: 'Nepal', MN: 'Mongolia',
    // North America (USMCA)
    US: 'United States', MX: 'Mexico', CA: 'Canada',
    // Europe
    DE: 'Germany', IT: 'Italy', FR: 'France', ES: 'Spain',
    NL: 'Netherlands', BE: 'Belgium', GB: 'United Kingdom', PL: 'Poland',
    RO: 'Romania', IE: 'Ireland', SE: 'Sweden', CH: 'Switzerland',
    DK: 'Denmark', NO: 'Norway', FI: 'Finland', AT: 'Austria',
    CZ: 'Czech Republic', HU: 'Hungary', PT: 'Portugal', GR: 'Greece',
    BG: 'Bulgaria', SK: 'Slovakia', SI: 'Slovenia', HR: 'Croatia',
    LT: 'Lithuania', LV: 'Latvia', EE: 'Estonia', LU: 'Luxembourg',
    UA: 'Ukraine', RS: 'Serbia', BA: 'Bosnia and Herzegovina',
    BY: 'Belarus', RU: 'Russia',
    // Turkey
    TR: 'Turkey',
    // Middle East
    AE: 'UAE', SA: 'Saudi Arabia', IL: 'Israel',
    JO: 'Jordan', KW: 'Kuwait', QA: 'Qatar', BH: 'Bahrain', OM: 'Oman',
    IR: 'Iran', IQ: 'Iraq', SY: 'Syria', LB: 'Lebanon', YE: 'Yemen',
    AF: 'Afghanistan',
    // Africa
    ZA: 'South Africa', MA: 'Morocco', EG: 'Egypt', TN: 'Tunisia',
    KE: 'Kenya', ET: 'Ethiopia', NG: 'Nigeria', GH: 'Ghana',
    MU: 'Mauritius', MG: 'Madagascar', SD: 'Sudan', TZ: 'Tanzania',
    CF: 'Central African Republic', CD: 'DR Congo', ZW: 'Zimbabwe',
    SO: 'Somalia', LY: 'Libya',
    // Latin America
    BR: 'Brazil', AR: 'Argentina', PE: 'Peru', CO: 'Colombia',
    CL: 'Chile', EC: 'Ecuador', DO: 'Dominican Republic',
    HN: 'Honduras', GT: 'Guatemala', SV: 'El Salvador',
    NI: 'Nicaragua', CR: 'Costa Rica', PA: 'Panama',
    UY: 'Uruguay', PY: 'Paraguay', BO: 'Bolivia',
    VE: 'Venezuela', CU: 'Cuba', PR: 'Puerto Rico',
    // Oceania
    AU: 'Australia', NZ: 'New Zealand',
    // Central Asia
    KZ: 'Kazakhstan', UZ: 'Uzbekistan', AZ: 'Azerbaijan', GE: 'Georgia',
    // East Asia (sanctioned)
    KP: 'North Korea',
    // EU aggregate
    EU: 'European Union',
};

// ═══════════════════════════════════════════════════════════════════════════════
// COUNTRIES — UI dropdown list with flags
// Used by Ant Design <Select> components. Covers top import partners,
// FTA countries, and sanctioned/restricted nations for compliance tools.
// ═══════════════════════════════════════════════════════════════════════════════

export const COUNTRIES = [
    // Top import partners
    { value: 'CN', label: '🇨🇳 China', flag: '🇨🇳', name: 'China' },
    { value: 'MX', label: '🇲🇽 Mexico', flag: '🇲🇽', name: 'Mexico' },
    { value: 'CA', label: '🇨🇦 Canada', flag: '🇨🇦', name: 'Canada' },
    { value: 'VN', label: '🇻🇳 Vietnam', flag: '🇻🇳', name: 'Vietnam' },
    { value: 'IN', label: '🇮🇳 India', flag: '🇮🇳', name: 'India' },
    { value: 'DE', label: '🇩🇪 Germany', flag: '🇩🇪', name: 'Germany' },
    { value: 'JP', label: '🇯🇵 Japan', flag: '🇯🇵', name: 'Japan' },
    { value: 'KR', label: '🇰🇷 South Korea', flag: '🇰🇷', name: 'South Korea' },
    { value: 'TW', label: '🇹🇼 Taiwan', flag: '🇹🇼', name: 'Taiwan' },
    { value: 'TH', label: '🇹🇭 Thailand', flag: '🇹🇭', name: 'Thailand' },
    { value: 'BD', label: '🇧🇩 Bangladesh', flag: '🇧🇩', name: 'Bangladesh' },
    { value: 'ID', label: '🇮🇩 Indonesia', flag: '🇮🇩', name: 'Indonesia' },
    { value: 'MY', label: '🇲🇾 Malaysia', flag: '🇲🇾', name: 'Malaysia' },
    { value: 'PH', label: '🇵🇭 Philippines', flag: '🇵🇭', name: 'Philippines' },
    { value: 'KH', label: '🇰🇭 Cambodia', flag: '🇰🇭', name: 'Cambodia' },
    { value: 'PK', label: '🇵🇰 Pakistan', flag: '🇵🇰', name: 'Pakistan' },
    { value: 'SG', label: '🇸🇬 Singapore', flag: '🇸🇬', name: 'Singapore' },
    { value: 'LK', label: '🇱🇰 Sri Lanka', flag: '🇱🇰', name: 'Sri Lanka' },
    { value: 'HK', label: '🇭🇰 Hong Kong', flag: '🇭🇰', name: 'Hong Kong' },
    { value: 'MM', label: '🇲🇲 Myanmar', flag: '🇲🇲', name: 'Myanmar' },
    // Europe
    { value: 'GB', label: '🇬🇧 United Kingdom', flag: '🇬🇧', name: 'United Kingdom' },
    { value: 'IT', label: '🇮🇹 Italy', flag: '🇮🇹', name: 'Italy' },
    { value: 'FR', label: '🇫🇷 France', flag: '🇫🇷', name: 'France' },
    { value: 'ES', label: '🇪🇸 Spain', flag: '🇪🇸', name: 'Spain' },
    { value: 'NL', label: '🇳🇱 Netherlands', flag: '🇳🇱', name: 'Netherlands' },
    { value: 'PL', label: '🇵🇱 Poland', flag: '🇵🇱', name: 'Poland' },
    { value: 'TR', label: '🇹🇷 Turkey', flag: '🇹🇷', name: 'Turkey' },
    { value: 'CH', label: '🇨🇭 Switzerland', flag: '🇨🇭', name: 'Switzerland' },
    { value: 'SE', label: '🇸🇪 Sweden', flag: '🇸🇪', name: 'Sweden' },
    { value: 'IE', label: '🇮🇪 Ireland', flag: '🇮🇪', name: 'Ireland' },
    { value: 'RU', label: '🇷🇺 Russia', flag: '🇷🇺', name: 'Russia' },
    { value: 'UA', label: '🇺🇦 Ukraine', flag: '🇺🇦', name: 'Ukraine' },
    { value: 'BY', label: '🇧🇾 Belarus', flag: '🇧🇾', name: 'Belarus' },
    // Americas
    { value: 'US', label: '🇺🇸 United States', flag: '🇺🇸', name: 'United States' },
    { value: 'BR', label: '🇧🇷 Brazil', flag: '🇧🇷', name: 'Brazil' },
    { value: 'CO', label: '🇨🇴 Colombia', flag: '🇨🇴', name: 'Colombia' },
    { value: 'CL', label: '🇨🇱 Chile', flag: '🇨🇱', name: 'Chile' },
    { value: 'PE', label: '🇵🇪 Peru', flag: '🇵🇪', name: 'Peru' },
    { value: 'AR', label: '🇦🇷 Argentina', flag: '🇦🇷', name: 'Argentina' },
    { value: 'DO', label: '🇩🇴 Dominican Republic', flag: '🇩🇴', name: 'Dominican Republic' },
    { value: 'GT', label: '🇬🇹 Guatemala', flag: '🇬🇹', name: 'Guatemala' },
    { value: 'HN', label: '🇭🇳 Honduras', flag: '🇭🇳', name: 'Honduras' },
    { value: 'CR', label: '🇨🇷 Costa Rica', flag: '🇨🇷', name: 'Costa Rica' },
    { value: 'SV', label: '🇸🇻 El Salvador', flag: '🇸🇻', name: 'El Salvador' },
    { value: 'NI', label: '🇳🇮 Nicaragua', flag: '🇳🇮', name: 'Nicaragua' },
    { value: 'VE', label: '🇻🇪 Venezuela', flag: '🇻🇪', name: 'Venezuela' },
    { value: 'CU', label: '🇨🇺 Cuba', flag: '🇨🇺', name: 'Cuba' },
    // Middle East & Africa
    { value: 'IL', label: '🇮🇱 Israel', flag: '🇮🇱', name: 'Israel' },
    { value: 'SA', label: '🇸🇦 Saudi Arabia', flag: '🇸🇦', name: 'Saudi Arabia' },
    { value: 'AE', label: '🇦🇪 UAE', flag: '🇦🇪', name: 'UAE' },
    { value: 'JO', label: '🇯🇴 Jordan', flag: '🇯🇴', name: 'Jordan' },
    { value: 'BH', label: '🇧🇭 Bahrain', flag: '🇧🇭', name: 'Bahrain' },
    { value: 'OM', label: '🇴🇲 Oman', flag: '🇴🇲', name: 'Oman' },
    { value: 'IR', label: '🇮🇷 Iran', flag: '🇮🇷', name: 'Iran' },
    { value: 'IQ', label: '🇮🇶 Iraq', flag: '🇮🇶', name: 'Iraq' },
    { value: 'SY', label: '🇸🇾 Syria', flag: '🇸🇾', name: 'Syria' },
    { value: 'LB', label: '🇱🇧 Lebanon', flag: '🇱🇧', name: 'Lebanon' },
    { value: 'AF', label: '🇦🇫 Afghanistan', flag: '🇦🇫', name: 'Afghanistan' },
    { value: 'YE', label: '🇾🇪 Yemen', flag: '🇾🇪', name: 'Yemen' },
    { value: 'SD', label: '🇸🇩 Sudan', flag: '🇸🇩', name: 'Sudan' },
    { value: 'EG', label: '🇪🇬 Egypt', flag: '🇪🇬', name: 'Egypt' },
    { value: 'MA', label: '🇲🇦 Morocco', flag: '🇲🇦', name: 'Morocco' },
    { value: 'ZA', label: '🇿🇦 South Africa', flag: '🇿🇦', name: 'South Africa' },
    // East Asia (sanctioned)
    { value: 'KP', label: '🇰🇵 North Korea', flag: '🇰🇵', name: 'North Korea' },
    // Oceania
    { value: 'AU', label: '🇦🇺 Australia', flag: '🇦🇺', name: 'Australia' },
    { value: 'NZ', label: '🇳🇿 New Zealand', flag: '🇳🇿', name: 'New Zealand' },
] as const;

/** Ant Select-compatible alias for COUNTRIES (backward compat) */
export const COUNTRY_OPTIONS = COUNTRIES;

export type CountryCode = typeof COUNTRIES[number]['value'];

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Get a country entry from the COUNTRIES array by ISO code */
export const getCountryByCode = (code: string) =>
    COUNTRIES.find(c => c.value === code?.toUpperCase());

/** Get full label with flag (e.g. "🇨🇳 China") */
export const getCountryLabel = (code: string): string =>
    getCountryByCode(code)?.label || code;

/** Get country name without flag — uses comprehensive 90+ country map */
export const getCountryName = (code: string): string =>
    COUNTRY_NAMES[code?.toUpperCase()] || code;

/** Get country flag emoji — works for any valid ISO 3166-1 alpha-2 code */
export const getCountryFlag = (code: string): string => {
    if (!code || code.length !== 2) return '🌍';
    const found = getCountryByCode(code)?.flag;
    if (found) return found;
    // Generate flag emoji from country code for countries not in COUNTRIES array
    return String.fromCodePoint(
        ...code.toUpperCase().split('').map(c => c.charCodeAt(0) + 127397)
    );
};

