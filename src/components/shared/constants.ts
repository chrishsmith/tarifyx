/**
 * Shared constants used across the application
 */

// Countries with flags for origin/destination selection
// Covers top 40 US import partners + key FTA/trade countries
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
    // Americas
    { value: 'BR', label: '🇧🇷 Brazil', flag: '🇧🇷', name: 'Brazil' },
    { value: 'CO', label: '🇨🇴 Colombia', flag: '🇨🇴', name: 'Colombia' },
    { value: 'CL', label: '🇨🇱 Chile', flag: '🇨🇱', name: 'Chile' },
    { value: 'PE', label: '🇵🇪 Peru', flag: '🇵🇪', name: 'Peru' },
    { value: 'DO', label: '🇩🇴 Dominican Republic', flag: '🇩🇴', name: 'Dominican Republic' },
    { value: 'GT', label: '🇬🇹 Guatemala', flag: '🇬🇹', name: 'Guatemala' },
    { value: 'HN', label: '🇭🇳 Honduras', flag: '🇭🇳', name: 'Honduras' },
    { value: 'CR', label: '🇨🇷 Costa Rica', flag: '🇨🇷', name: 'Costa Rica' },
    // Middle East & Africa
    { value: 'IL', label: '🇮🇱 Israel', flag: '🇮🇱', name: 'Israel' },
    { value: 'SA', label: '🇸🇦 Saudi Arabia', flag: '🇸🇦', name: 'Saudi Arabia' },
    { value: 'AE', label: '🇦🇪 UAE', flag: '🇦🇪', name: 'UAE' },
    { value: 'JO', label: '🇯🇴 Jordan', flag: '🇯🇴', name: 'Jordan' },
    { value: 'EG', label: '🇪🇬 Egypt', flag: '🇪🇬', name: 'Egypt' },
    { value: 'MA', label: '🇲🇦 Morocco', flag: '🇲🇦', name: 'Morocco' },
    { value: 'ZA', label: '🇿🇦 South Africa', flag: '🇿🇦', name: 'South Africa' },
    // Oceania
    { value: 'AU', label: '🇦🇺 Australia', flag: '🇦🇺', name: 'Australia' },
    { value: 'NZ', label: '🇳🇿 New Zealand', flag: '🇳🇿', name: 'New Zealand' },
] as const;

export type CountryCode = typeof COUNTRIES[number]['value'];

// Helper to get country by code
export const getCountryByCode = (code: string) => 
    COUNTRIES.find(c => c.value === code);

// Helper to get country label
export const getCountryLabel = (code: string) => 
    getCountryByCode(code)?.label || code;

// Helper to get country name without flag
export const getCountryName = (code: string) => 
    getCountryByCode(code)?.name || code;

// Helper to get country flag
export const getCountryFlag = (code: string) => 
    getCountryByCode(code)?.flag || '🌍';





