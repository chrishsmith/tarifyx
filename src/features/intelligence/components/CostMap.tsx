'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Input, Button, Typography, Tag, Card, Select, Tooltip, message, Alert } from 'antd';
import { Search, Globe, Info, TrendingDown, Shield, Loader2, DollarSign, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { formatHtsCode } from '@/utils/htsFormatting';

const { Text, Title } = Typography;

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const MAPTILER_API_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || '';
const GEOJSON_URL = 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedGeoJSON: any = null;

const A2_TO_A3: Record<string, string> = {
    AF:'AFG',AL:'ALB',DZ:'DZA',AD:'AND',AO:'AGO',AG:'ATG',AR:'ARG',AM:'ARM',AU:'AUS',AT:'AUT',
    AZ:'AZE',BS:'BHS',BH:'BHR',BD:'BGD',BB:'BRB',BY:'BLR',BE:'BEL',BZ:'BLZ',BJ:'BEN',BT:'BTN',
    BO:'BOL',BA:'BIH',BW:'BWA',BR:'BRA',BN:'BRN',BG:'BGR',BF:'BFA',BI:'BDI',KH:'KHM',CM:'CMR',
    CA:'CAN',CF:'CAF',TD:'TCD',CL:'CHL',CN:'CHN',CO:'COL',KM:'COM',CG:'COG',CR:'CRI',HR:'HRV',
    CU:'CUB',CY:'CYP',CZ:'CZE',CD:'COD',DK:'DNK',DJ:'DJI',DM:'DMA',DO:'DOM',EC:'ECU',EG:'EGY',
    SV:'SLV',GQ:'GNQ',ER:'ERI',EE:'EST',ET:'ETH',FJ:'FJI',FI:'FIN',FR:'FRA',GA:'GAB',GM:'GMB',
    GE:'GEO',DE:'DEU',GH:'GHA',GR:'GRC',GT:'GTM',GN:'GIN',GW:'GNB',GY:'GUY',HT:'HTI',HN:'HND',
    HU:'HUN',IS:'ISL',IN:'IND',ID:'IDN',IR:'IRN',IQ:'IRQ',IE:'IRL',IL:'ISR',IT:'ITA',JM:'JAM',
    JP:'JPN',JO:'JOR',KZ:'KAZ',KE:'KEN',KR:'KOR',KW:'KWT',KG:'KGZ',LA:'LAO',LV:'LVA',LB:'LBN',
    LS:'LSO',LR:'LBR',LY:'LBY',LT:'LTU',LU:'LUX',MG:'MDG',MW:'MWI',MY:'MYS',MV:'MDV',ML:'MLI',
    MR:'MRT',MU:'MUS',MX:'MEX',MD:'MDA',MN:'MNG',ME:'MNE',MA:'MAR',MZ:'MOZ',MM:'MMR',NA:'NAM',
    NP:'NPL',NL:'NLD',NZ:'NZL',NI:'NIC',NE:'NER',NG:'NGA',NO:'NOR',OM:'OMN',PK:'PAK',PA:'PAN',
    PG:'PNG',PY:'PRY',PE:'PER',PH:'PHL',PL:'POL',PT:'PRT',QA:'QAT',RO:'ROU',RU:'RUS',RW:'RWA',
    SA:'SAU',SN:'SEN',RS:'SRB',SL:'SLE',SG:'SGP',SK:'SVK',SI:'SVN',SO:'SOM',ZA:'ZAF',ES:'ESP',
    LK:'LKA',SD:'SDN',SR:'SUR',SZ:'SWZ',SE:'SWE',CH:'CHE',SY:'SYR',TW:'TWN',TJ:'TJK',TZ:'TZA',
    TH:'THA',TG:'TGO',TT:'TTO',TN:'TUN',TR:'TUR',TM:'TKM',UG:'UGA',UA:'UKR',AE:'ARE',GB:'GBR',
    US:'USA',UY:'URY',UZ:'UZB',VE:'VEN',VN:'VNM',YE:'YEM',ZM:'ZMB',ZW:'ZWE',
    HK:'HKG',MK:'MKD',XK:'XKX',
};

const HTS_CODE_REGEX = /^\d{4,10}$/;

/** Fallback centroids [lng, lat] for countries that may not match GeoJSON properties */
const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
    AF:[65,33],AL:[20,41],DZ:[3,28],AD:[1.5,42.5],AO:[18.5,-12.5],AG:[-61.8,17.1],AR:[-64,-34],
    AM:[45,40],AU:[134,-25],AT:[14,47.5],AZ:[50,40.5],BS:[-76,24],BH:[50.5,26],BD:[90,24],
    BB:[-59.5,13.2],BY:[28,53],BE:[4.5,50.8],BZ:[-88.8,17.2],BJ:[2.3,9.3],BT:[90.5,27.5],
    BO:[-65,-17],BA:[17.8,44],BW:[24,-22],BR:[-53,-10],BN:[114.7,4.5],BG:[25.5,42.7],
    BF:[-1.5,12.3],BI:[29.9,-3.4],KH:[105,12.5],CM:[12.3,6],CA:[-96,60],CF:[20.9,6.6],
    TD:[18.7,15.4],CL:[-71,-30],CN:[105,35],CO:[-72,4],KM:[44.3,-12.2],CG:[15.8,-0.2],
    CR:[-84,10],HR:[15.5,45.2],CU:[-80,21.5],CY:[33,35],CZ:[15.5,49.8],CD:[25,-3],
    DK:[10,56],DJ:[43,11.5],DM:[-61.4,15.4],DO:[-70,19],EC:[-78.5,-1.8],EG:[30,27],
    SV:[-88.9,13.8],GQ:[10.3,1.6],ER:[39,15.3],EE:[26,58.6],ET:[40,9],FJ:[178,-18],
    FI:[26,64],FR:[2.2,46.2],GA:[11.8,-0.8],GM:[-15.4,13.4],GE:[43.5,42],DE:[10.4,51.2],
    GH:[-1.2,7.9],GR:[22,39],GT:[-90.2,15.5],GN:[-11.8,10.8],GW:[-15,12],GY:[-59,5],
    HT:[-72.3,19],HN:[-86.2,14.1],HU:[19.5,47.2],IS:[-19,65],IN:[79,22],ID:[120,-5],
    IR:[53,32],IQ:[44,33],IE:[-8,53.4],IL:[34.8,31.5],IT:[12.6,42.5],JM:[-77.3,18.1],
    JP:[138,36],JO:[36.3,31],KZ:[67,48],KE:[38,1],KR:[128,36],KW:[47.7,29.3],KG:[75,41.2],
    LA:[102,18],LV:[25,57],LB:[35.8,33.9],LS:[28.2,-29.6],LR:[-9.4,6.4],LY:[17.2,27],
    LT:[24,55.4],LU:[6.1,49.8],MG:[47,-20],MW:[34.3,-13.3],MY:[110,4],MV:[73.5,3.2],
    ML:[-4,17],MR:[-12,20],MU:[57.5,-20.3],MX:[-102,23],MD:[28.8,47],MN:[104,46.9],
    ME:[19.3,42.7],MA:[-5,32],MZ:[35.5,-18.7],MM:[96,22],NA:[18.5,-22],NP:[84,28.4],
    NL:[5.3,52.1],NZ:[174,-41],NI:[-85.2,13],NE:[8,16],NG:[8,10],NO:[8.5,62],OM:[57,21],
    PK:[70,30],PA:[-80,9],PG:[147,-6],PY:[-58,-23.4],PE:[-76,-10],PH:[122,12.9],PL:[20,52],
    PT:[-8,39.4],QA:[51.2,25.4],RO:[25,46],RU:[100,60],RW:[29.9,-2],SA:[45,25],SN:[-14.5,14.5],
    RS:[21,44],SL:[-11.8,8.5],SG:[103.8,1.4],SK:[19.7,48.7],SI:[15,46.1],SO:[46,6],ZA:[25,-29],
    ES:[-4,40],LK:[81,7.9],SD:[30,16],SR:[-56,4],SZ:[31.5,-26.5],SE:[18,62],CH:[8.2,46.8],
    SY:[38.9,35],TW:[121,23.7],TJ:[69,39],TZ:[35,-6],TH:[101,15.9],TG:[1.2,8.6],
    TT:[-61,10.4],TN:[9,34],TR:[35.2,39],TM:[60,40],UG:[32.3,1.4],UA:[32,49],AE:[54,24],
    GB:[-3.4,55.4],US:[-97,38],UY:[-56,-33],UZ:[65,41.4],VE:[-66.6,7.5],VN:[108,16],
    YE:[48,15.5],ZM:[28,-15],ZW:[30,-20],HK:[114.2,22.3],MK:[21.7,41.5],XK:[21,42.6],
};

// ─── Color scales ───────────────────────────────────────────────────────
// Sequential teal: starts saturated enough to see on a light map background
// Low = bright teal, High = deep dark teal
const SEQ_COLORS = [
    '#5EEAD4', // teal-300 — lightest (still visible on white)
    '#2DD4BF', // teal-400
    '#14B8A6', // teal-500
    '#0D9488', // teal-600
    '#0F766E', // teal-700
    '#115E59', // teal-800
    '#134E4A', // teal-900
    '#1A3C3C', // custom dark
    '#122D2D', // custom darker
    '#0A1F1F', // custom darkest
];

// Tariff: teal (low) → amber → red (high)
const TARIFF_STOPS: [number, string][] = [
    [0,   '#5EEAD4'], [5,   '#2DD4BF'], [10,  '#14B8A6'],
    [15,  '#FEF3C7'], [20,  '#FDE68A'], [30,  '#FCD34D'],
    [40,  '#FBBF24'], [50,  '#F87171'], [75,  '#EF4444'], [100, '#991B1B'],
];

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface TariffBreakdown {
    baseMfnRate: number;
    ftaDiscount: number;
    ieepaRate: number;
    ieepaBaseline: number;
    ieepaFentanyl: number;
    ieepaReciprocal: number;
    section301Rate: number;
    section232Rate: number;
    section232Product: string | null;
    adcvdRate: number;
    adcvdWarning: string | null;
    totalAdditionalDuties: number;
    effectiveRate: number;
    hasFTA: boolean;
    ftaName: string | null;
    layers: Array<{ program: string; rate: number; description: string }>;
    warnings: string[];
}

type DataConfidence = 'high' | 'medium' | 'low';

interface CountryData {
    code: string;
    name: string;
    flag: string;
    unitValue: number;
    rawQuantityUnit: string;
    displayUnit: string;
    wasNormalized: boolean;
    tariff: TariffBreakdown;
    dutyPerUnit: number;
    transitDays: number;
    importVolume: number;
    importQuantity: number;
    costTrend?: number;
    dataYears: number[];
    dataConfidence: DataConfidence;
    confidenceReason: string;
}

interface HoverData { country: CountryData; x: number; y: number }

type ColorMode = 'unitValue' | 'tariff';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const CostMap: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapRef = useRef<any>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [htsInput, setHtsInput] = useState(searchParams.get('hts') || '');
    const [activeHts, setActiveHts] = useState<string | null>(null);
    const [countries, setCountries] = useState<CountryData[]>([]);
    const [loading, setLoading] = useState(false);
    const [hover, setHover] = useState<HoverData | null>(null);
    const [colorBy, setColorBy] = useState<ColorMode>('unitValue');
    const [baseMfnRate, setBaseMfnRate] = useState<number | null>(null);
    const [displayUnit, setDisplayUnit] = useState<string>('each');
    const [dataYears, setDataYears] = useState<number[]>([]);
    const abortRef = useRef<AbortController | null>(null);
    const countriesRef = useRef<CountryData[]>([]);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => { countriesRef.current = countries; }, [countries]);

    const chinaBaseline = useMemo(() => countries.find(c => c.code === 'CN'), [countries]);

    // ─── Color helpers ──────────────────────────────────────────────────
    const valueRange = useMemo(() => {
        const vals = countries.map(c => c.unitValue).filter(v => v > 0);
        if (vals.length === 0) return { min: 0, max: 1 };
        return { min: Math.min(...vals), max: Math.max(...vals) };
    }, [countries]);

    const getColor = useCallback((c: CountryData): string => {
        if (colorBy === 'tariff') return getTariffColor(c.tariff.effectiveRate);
        const { min, max } = valueRange;
        const range = max - min || 1;
        const t = Math.max(0, Math.min(1, (c.unitValue - min) / range));
        return SEQ_COLORS[Math.min(SEQ_COLORS.length - 1, Math.floor(t * (SEQ_COLORS.length - 1)))];
    }, [colorBy, valueRange]);

    // ─── Initialize map ─────────────────────────────────────────────────
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;
        let cancelled = false;

        const initMap = async () => {
            const maptilersdk = await import('@maptiler/sdk');
            await import('@maptiler/sdk/dist/maptiler-sdk.css');
            if (cancelled || !mapContainerRef.current) return;

            maptilersdk.config.apiKey = MAPTILER_API_KEY;

            const map = new maptilersdk.Map({
                container: mapContainerRef.current,
                style: MAPTILER_API_KEY
                    ? maptilersdk.MapStyle.DATAVIZ.LIGHT
                    : 'https://demotiles.maplibre.org/style.json',
                center: [20, 10],
                zoom: 1.0,
                minZoom: 0.8,
                maxZoom: 8,
                attributionControl: false,
                renderWorldCopies: false,
            });

            mapRef.current = map;

            map.on('load', () => {
                if (cancelled) return;
                map.fitBounds([[-180, -75], [180, 82]], { padding: { top: 20, bottom: 20, left: 20, right: 20 }, duration: 0 });
                setMapLoaded(true);

                map.addSource('country-costs', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
                map.addSource('country-labels-src', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });

                map.addLayer({ id: 'country-fills', type: 'fill', source: 'country-costs', paint: { 'fill-color': ['get', 'fillColor'], 'fill-opacity': ['get', 'fillOpacity'] } });
                map.addLayer({ id: 'country-borders', type: 'line', source: 'country-costs', paint: { 'line-color': '#0F172A', 'line-width': 0.8, 'line-opacity': 0.35 } });
                map.addLayer({ id: 'country-hover', type: 'line', source: 'country-costs', paint: { 'line-color': '#0F172A', 'line-width': 2.5 }, filter: ['==', 'iso_a2', ''] });
                map.addLayer({
                    id: 'country-labels', type: 'symbol', source: 'country-labels-src',
                    layout: {
                        'text-field': ['get', 'label'],
                        'text-size': ['interpolate', ['linear'], ['zoom'], 1, 9, 2, 10, 3, 11, 5, 13, 7, 15],
                        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                        'text-allow-overlap': false,
                        'text-ignore-placement': false,
                        'text-optional': true,
                        'text-padding': 0,
                        'symbol-sort-key': ['get', 'sortKey'],
                        'text-variable-anchor': ['center', 'top', 'bottom', 'left', 'right'],
                        'text-radial-offset': 0.5,
                    },
                    paint: { 'text-color': '#0F172A', 'text-halo-color': 'rgba(255,255,255,0.9)', 'text-halo-width': 1.5 },
                });

                // At zoom ≥ 3 (regional view), allow labels to overlap so every country shows its price
                const OVERLAP_ZOOM_THRESHOLD = 3;
                map.on('zoom', () => {
                    const z = map.getZoom();
                    const shouldOverlap = z >= OVERLAP_ZOOM_THRESHOLD;
                    const currentOverlap = map.getLayoutProperty('country-labels', 'text-allow-overlap');
                    if (currentOverlap !== shouldOverlap) {
                        map.setLayoutProperty('country-labels', 'text-allow-overlap', shouldOverlap);
                        map.setLayoutProperty('country-labels', 'text-ignore-placement', shouldOverlap);
                    }
                });

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                map.on('mousemove', 'country-fills', (e: any) => {
                    if (!e.features?.[0]?.properties || !e.point) return;
                    const code = e.features[0].properties.iso_a2 as string;
                    map.setFilter('country-hover', ['==', 'iso_a2', code]);
                    map.getCanvas().style.cursor = 'pointer';
                    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                    hoverTimeoutRef.current = setTimeout(() => {
                        const country = countriesRef.current.find(c => c.code === code);
                        if (country && e.point) setHover({ country, x: e.point.x, y: e.point.y });
                    }, 40);
                });
                map.on('mouseleave', 'country-fills', () => {
                    map.getCanvas().style.cursor = '';
                    map.setFilter('country-hover', ['==', 'iso_a2', '']);
                    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                    setHover(null);
                });
            });
        };

        initMap();
        return () => { cancelled = true; if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
    }, []);

    // ─── Fetch data ─────────────────────────────────────────────────────
    const fetchCountryData = useCallback(async (htsCode: string) => {
        const clean = htsCode.replace(/\./g, '');
        if (!HTS_CODE_REGEX.test(clean) || clean.length < 4) return;

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setLoading(true);
        setHover(null);

        try {
            const res = await fetch(`/api/cost-map?hts=${encodeURIComponent(clean)}`, { signal: controller.signal });
            const json = await res.json();
            if (!json.success) throw new Error(json.error || 'Failed to fetch');

            const data = json.data;
            setCountries(data.countries || []);
            setActiveHts(clean);
            setBaseMfnRate(data.baseMfnRate ?? null);
            setDisplayUnit(data.displayUnit ?? 'each');
            setDataYears(data.dataYears ?? []);
            router.replace(`/dashboard/intelligence/cost-map?hts=${clean}`, { scroll: false });

            if ((data.countries || []).length === 0) {
                message.info('No USITC import data for this HTS code. Try a broader code (first 6 digits).');
            }
        } catch (err) {
            if ((err as Error).name === 'AbortError') return;
            console.error('[CostMap] fetch_failed', { ts: new Date().toISOString(), error: err });
            message.error('Failed to load data from USITC.');
            setCountries([]);
        } finally {
            setLoading(false);
        }
    }, [router]);

    // ─── Update map ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!mapLoaded || !mapRef.current || countries.length === 0) return;
        const updateMap = async () => {
            const map = mapRef.current;
            const lookup = new Map<string, CountryData>();
            for (const c of countries) { const a3 = A2_TO_A3[c.code]; if (a3) lookup.set(a3, c); }

            try {
                if (!cachedGeoJSON) { cachedGeoJSON = await (await fetch(GEOJSON_URL)).json(); }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const enriched: any[] = [];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const labels: any[] = [];

                // Match GeoJSON features to our country data for fills
                const matchFeature = (props: Record<string, string>): CountryData | undefined => {
                    for (const key of ['iso_a3', 'ISO_A3', 'adm0_a3', 'gu_a3', 'su_a3', 'brk_a3']) {
                        const code = props[key];
                        if (code && code !== '-99' && lookup.has(code)) return lookup.get(code);
                    }
                    const a2 = props.iso_a2 || props.ISO_A2;
                    if (a2) {
                        const a3 = A2_TO_A3[a2];
                        if (a3 && lookup.has(a3)) return lookup.get(a3);
                    }
                    return undefined;
                };

                // 1. Build fill polygons from GeoJSON
                for (const feature of cachedGeoJSON.features) {
                    const cd = matchFeature(feature.properties);
                    if (!cd) continue;
                    const fillColor = getColor(cd);
                    const fillOpacity = cd.dataConfidence === 'high' ? 0.9 : cd.dataConfidence === 'medium' ? 0.7 : 0.45;
                    enriched.push({ ...feature, properties: { ...feature.properties, iso_a2: cd.code, fillColor, fillOpacity } });
                }

                // 2. Build labels from COUNTRY_CENTROIDS — guaranteed one per country with data
                for (const cd of countries) {
                    const coords = COUNTRY_CENTROIDS[cd.code];
                    if (!coords) continue;
                    const label = colorBy === 'tariff'
                        ? `${cd.tariff.effectiveRate.toFixed(0)}%`
                        : `$${cd.unitValue.toFixed(cd.unitValue >= 100 ? 0 : cd.unitValue >= 10 ? 1 : 2)}`;
                    const sortKey = -cd.importVolume;
                    labels.push({
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: coords },
                        properties: { iso_a2: cd.code, label, sortKey },
                    });
                }

                map.getSource('country-costs')?.setData({ type: 'FeatureCollection', features: enriched });
                map.getSource('country-labels-src')?.setData({ type: 'FeatureCollection', features: labels });
            } catch (err) {
                console.error('[CostMap] geojson_load_failed', { ts: new Date().toISOString(), error: err });
            }
        };
        updateMap();
    }, [countries, mapLoaded, colorBy, getColor]);

    // ─── Auto-fetch from URL ────────────────────────────────────────────
    useEffect(() => {
        const hts = searchParams.get('hts');
        if (hts && mapLoaded && !activeHts) { setHtsInput(hts); fetchCountryData(hts); }
    }, [searchParams, mapLoaded, activeHts, fetchCountryData]);

    const handleSearch = () => {
        const clean = htsInput.replace(/\./g, '');
        if (clean.length >= 4) fetchCountryData(clean);
        else message.warning('Enter at least a 4-digit HTS code');
    };

    // ─── Stats ──────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        if (countries.length === 0) return null;
        const byVal = [...countries].sort((a, b) => a.unitValue - b.unitValue);
        const byTariff = [...countries].sort((a, b) => a.tariff.effectiveRate - b.tariff.effectiveRate);
        return {
            cheapest: byVal[0],
            priciest: byVal[byVal.length - 1],
            lowestTariff: byTariff[0],
            highestTariff: byTariff[byTariff.length - 1],
            ftaCountries: countries.filter(c => c.tariff.hasFTA),
        };
    }, [countries]);

    const getSavingsVsChina = (c: CountryData): { amount: number; percent: number } | null => {
        if (!chinaBaseline || c.code === 'CN' || chinaBaseline.unitValue === 0) return null;
        const amount = chinaBaseline.unitValue - c.unitValue;
        const percent = Math.round((amount / chinaBaseline.unitValue) * 100);
        return { amount, percent };
    };

    const perUnit = displayUnit === 'each' ? '/unit' : `/${displayUnit}`;

    return (
        <div className="space-y-4">
            {/* Search bar */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <div className="flex-1 w-full">
                        <Input size="large" placeholder="Enter HTS code (e.g. 6109.10.00)" prefix={<Search size={18} className="text-slate-400" />}
                            value={htsInput} onChange={(e) => setHtsInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="font-mono" allowClear />
                    </div>
                    <div className="flex gap-2 items-center">
                        <Select value={colorBy} onChange={setColorBy} size="large" style={{ width: 190 }}
                            options={[
                                { value: 'unitValue', label: 'Color by Import Price' },
                                { value: 'tariff', label: 'Color by Tariff Rate' },
                            ]} />
                        <Button type="primary" size="large" icon={<Globe size={18} />} onClick={handleSearch} loading={loading} className="bg-teal-600 hover:bg-teal-700">Map It</Button>
                    </div>
                </div>
                {activeHts && (
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                        <Tag color="cyan" className="font-mono text-sm">{formatHtsCode(activeHts)}</Tag>
                        {baseMfnRate !== null && <Text className="text-slate-500 text-sm">Base MFN: {baseMfnRate.toFixed(1)}%</Text>}
                        <Text className="text-slate-400 text-sm">{countries.length} countries</Text>
                        {dataYears.length > 0 && <Text className="text-slate-400 text-sm">Data: {dataYears.join('–')}</Text>}
                        {displayUnit !== 'each' && <Tag color="default" className="text-xs">Prices per {displayUnit}</Tag>}
                    </div>
                )}
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard icon={<DollarSign size={14} />} iconColor="text-emerald-600" label="Lowest Import Price" value={stats.cheapest.name} badge={`$${stats.cheapest.unitValue.toFixed(2)}${perUnit}`} badgeColor="green" />
                    <StatCard icon={<DollarSign size={14} />} iconColor="text-rose-500" label="Highest Import Price" value={stats.priciest.name} badge={`$${stats.priciest.unitValue.toFixed(2)}${perUnit}`} badgeColor="red" />
                    <StatCard icon={<TrendingDown size={14} />} iconColor="text-teal-600" label="Lowest Tariff" value={stats.lowestTariff.name} badge={`${stats.lowestTariff.tariff.effectiveRate.toFixed(1)}%`} badgeColor="cyan" />
                    <StatCard icon={<Shield size={14} />} iconColor="text-teal-700" label="FTA Partners" value={`${stats.ftaCountries.length} countries`} badge={stats.ftaCountries.slice(0, 3).map(c => c.code).join(', ') || 'None'} badgeColor="default" />
                </div>
            )}

            {/* Map */}
            <div className="relative bg-slate-50 border border-slate-200 rounded-xl shadow-sm overflow-hidden" style={{ height: 620 }}>
                {loading && (
                    <div className="absolute inset-0 z-20 bg-white/80 flex flex-col items-center justify-center gap-3">
                        <Loader2 size={32} className="text-teal-500 animate-spin" />
                        <Text className="text-slate-500">Fetching USITC import data...</Text>
                    </div>
                )}

                {!loading && !activeHts && mapLoaded && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                        <div className="text-center bg-white rounded-xl p-8 shadow-lg border border-slate-100 pointer-events-auto max-w-md">
                            <Globe size={48} className="text-teal-600 mx-auto mb-3" />
                            <Title level={4} className="!mb-2">Global Cost Map</Title>
                            <Text className="text-slate-500 block mb-1">Real USITC customs value data for any HTS code.</Text>
                            <Text className="text-slate-400 block mb-4 text-xs">Import prices reflect actual invoice/FOB values from U.S. customs records.</Text>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {[
                                    { code: '6109.10.00', label: 'T-shirts' },
                                    { code: '8471.30.01', label: 'Laptops' },
                                    { code: '9403.60.80', label: 'Furniture' },
                                    { code: '6402.99.31', label: 'Shoes' },
                                ].map(({ code, label }) => (
                                    <Tag key={code} className="cursor-pointer font-mono hover:bg-teal-50 transition-colors" color="default"
                                        onClick={() => { setHtsInput(code); fetchCountryData(code); }}>
                                        {code} <span className="text-slate-400 font-sans ml-1">{label}</span>
                                    </Tag>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {!loading && activeHts && countries.length === 0 && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 max-w-md">
                        <Alert type="info" showIcon message="No data available" description={`No USITC import data for HTS ${formatHtsCode(activeHts)}. Try a broader code (first 6 digits).`} />
                    </div>
                )}

                {/* Legend */}
                {activeHts && countries.length > 0 && (
                    <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-lg border border-slate-200 p-3 shadow-sm">
                        <Text className="text-[11px] text-slate-500 block mb-1.5 font-medium">
                            {colorBy === 'tariff' ? 'Effective Tariff Rate (all layers)' : `USITC Customs Value${perUnit}`}
                        </Text>
                        <div className="flex items-center">
                            {(colorBy === 'tariff' ? TARIFF_STOPS.map(([, c]) => c) : SEQ_COLORS).map((color, i) => (
                                <div key={i} className="w-5 h-3 first:rounded-l last:rounded-r" style={{ backgroundColor: color }} />
                            ))}
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                            <span>{colorBy === 'tariff' ? '0%' : `$${valueRange.min.toFixed(2)}`}</span>
                            <span>{colorBy === 'tariff' ? '100%+' : `$${valueRange.max.toFixed(2)}`}</span>
                        </div>
                    </div>
                )}

                {/* Source badge */}
                {activeHts && countries.length > 0 && (
                    <div className="absolute top-4 right-4 z-10">
                        <Tooltip title="Import prices are USITC DataWeb customs values (invoice/FOB). Tariff rates from Tarifyx registry include MFN, IEEPA, Section 301, Section 232, and AD/CVD.">
                            <Tag color="default" className="text-[10px] cursor-help"><Info size={10} className="inline mr-1" />Source: USITC DataWeb + Tariff Registry</Tag>
                        </Tooltip>
                    </div>
                )}

                {hover && (
                    <HoverTooltip data={hover.country} x={hover.x} y={hover.y}
                        containerWidth={mapContainerRef.current?.clientWidth ?? 1024}
                        savings={getSavingsVsChina(hover.country)} perUnit={perUnit} />
                )}

                <div ref={mapContainerRef} className="w-full h-full" />
            </div>

            {/* Table */}
            {countries.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                        <div>
                            <Text strong>All Countries</Text>
                            <Text className="text-slate-400 ml-2 text-sm">{countries.length} countries — sorted by {colorBy === 'tariff' ? 'effective tariff' : 'import price'}</Text>
                        </div>
                        {chinaBaseline && <Tag color="default" className="text-xs">China: ${chinaBaseline.unitValue.toFixed(2)}{perUnit} + {chinaBaseline.tariff.effectiveRate.toFixed(1)}% tariff</Tag>}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 text-left text-slate-500 text-xs">
                                    <th className="px-4 py-2.5 font-medium">Country</th>
                                    <th className="px-4 py-2.5 font-medium text-right">
                                        <Tooltip title="USITC customs value per unit — the invoice/FOB price"><span className="border-b border-dashed border-slate-300 cursor-help">Import Price</span></Tooltip>
                                    </th>
                                    <th className="px-4 py-2.5 font-medium text-right">
                                        <Tooltip title="Full effective tariff: MFN + IEEPA + 301 + 232 + AD/CVD - FTA"><span className="border-b border-dashed border-slate-300 cursor-help">Eff. Tariff</span></Tooltip>
                                    </th>
                                    <th className="px-4 py-2.5 font-medium text-right">
                                        <Tooltip title="Estimated duty per unit (import price × effective tariff)"><span className="border-b border-dashed border-slate-300 cursor-help">Duty{perUnit}</span></Tooltip>
                                    </th>
                                    <th className="px-4 py-2.5 font-medium text-right">vs. China</th>
                                    <th className="px-4 py-2.5 font-medium">Tariff Layers</th>
                                    <th className="px-4 py-2.5 font-medium text-right">Transit</th>
                                    <th className="px-4 py-2.5 font-medium text-right">
                                        <Tooltip title="Total USITC customs value"><span className="border-b border-dashed border-slate-300 cursor-help">Volume</span></Tooltip>
                                    </th>
                                    <th className="px-4 py-2.5 font-medium">
                                        <Tooltip title="Based on import volume — low volume means price may reflect niche shipments"><span className="border-b border-dashed border-slate-300 cursor-help">Confidence</span></Tooltip>
                                    </th>
                                    <th className="px-4 py-2.5 font-medium text-right">Trend</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...countries]
                                    .sort((a, b) => colorBy === 'tariff' ? a.tariff.effectiveRate - b.tariff.effectiveRate : a.unitValue - b.unitValue)
                                    .map((c) => {
                                        const savings = getSavingsVsChina(c);
                                        const t = c.tariff;
                                        return (
                                            <tr key={c.code} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-2">
                                                    <span className="mr-1.5">{c.flag}</span>
                                                    <span className="font-medium text-slate-900">{c.name}</span>
                                                </td>
                                                <td className="px-4 py-2 text-right font-mono font-semibold text-slate-900">${c.unitValue.toFixed(2)}</td>
                                                <td className="px-4 py-2 text-right">
                                                    <span className="inline-block px-1.5 py-0.5 rounded text-xs font-medium"
                                                        style={{ backgroundColor: getTariffColor(t.effectiveRate) + '30', color: t.effectiveRate > 30 ? '#7C2D12' : '#065F46' }}>
                                                        {t.effectiveRate.toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-right font-mono text-rose-600 text-xs">${c.dutyPerUnit.toFixed(2)}</td>
                                                <td className="px-4 py-2 text-right">
                                                    {savings ? (
                                                        <span className={`text-xs font-medium ${savings.amount > 0 ? 'text-emerald-600' : savings.amount < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                                                            {savings.amount > 0 ? `-$${savings.amount.toFixed(2)}` : savings.amount < 0 ? `+$${Math.abs(savings.amount).toFixed(2)}` : '-'}
                                                        </span>
                                                    ) : <span className="text-slate-300 text-xs">baseline</span>}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <div className="flex flex-wrap gap-1">
                                                        {t.hasFTA && <Tag color="cyan" className="m-0 text-[10px] leading-tight">{t.ftaName || 'FTA'}</Tag>}
                                                        {t.ieepaRate > 0 && <Tag color="orange" className="m-0 text-[10px] leading-tight">IEEPA {t.ieepaRate}%</Tag>}
                                                        {t.section301Rate > 0 && <Tag color="red" className="m-0 text-[10px] leading-tight">301: {t.section301Rate}%</Tag>}
                                                        {t.section232Rate > 0 && <Tag color="purple" className="m-0 text-[10px] leading-tight">232: {t.section232Rate}%</Tag>}
                                                        {t.adcvdRate > 0 && <Tag color="volcano" className="m-0 text-[10px] leading-tight">AD/CVD</Tag>}
                                                        {t.effectiveRate === 0 && <span className="text-emerald-500 text-[10px] font-medium">Duty Free</span>}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-right text-slate-500 text-xs">{c.transitDays}d</td>
                                                <td className="px-4 py-2 text-right text-slate-400 text-xs font-mono">{formatVolume(c.importVolume)}</td>
                                                <td className="px-4 py-2">
                                                    <Tooltip title={c.confidenceReason}>
                                                        <Tag color={c.dataConfidence === 'high' ? 'green' : c.dataConfidence === 'medium' ? 'orange' : 'red'}
                                                            className="m-0 text-[10px] leading-tight cursor-help">
                                                            {c.dataConfidence === 'high' ? 'High' : c.dataConfidence === 'medium' ? 'Med' : 'Low'}
                                                        </Tag>
                                                    </Tooltip>
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    {c.costTrend != null ? (
                                                        <span className={`text-xs font-medium flex items-center justify-end gap-0.5 ${c.costTrend > 0 ? 'text-rose-500' : c.costTrend < 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                            {c.costTrend > 0 ? <TrendingUp size={10} /> : c.costTrend < 0 ? <TrendingDown size={10} /> : null}
                                                            {c.costTrend > 0 ? '+' : ''}{c.costTrend}%
                                                        </span>
                                                    ) : <span className="text-slate-200 text-xs">-</span>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════════════════

const StatCard: React.FC<{ icon: React.ReactNode; iconColor: string; label: string; value: string; badge: string; badgeColor: string }> = ({ icon, iconColor, label, value, badge, badgeColor }) => (
    <Card size="small" className="border-slate-200">
        <div className="flex items-center gap-1.5 mb-1">
            <span className={iconColor}>{icon}</span>
            <Text className="text-slate-500 text-xs">{label}</Text>
        </div>
        <Text strong className="text-sm">{value}</Text>
        <Tag color={badgeColor} className="ml-1 text-xs">{badge}</Tag>
    </Card>
);

// ═══════════════════════════════════════════════════════════════════════════
// HOVER TOOLTIP — shows full tariff breakdown
// ═══════════════════════════════════════════════════════════════════════════

const HoverTooltip: React.FC<{
    data: CountryData; x: number; y: number; containerWidth: number;
    savings: { amount: number; percent: number } | null; perUnit: string;
}> = ({ data, x, y, containerWidth, savings, perUnit }) => {
    const tooltipW = 290;
    const tooltipH = 280;
    const halfW = tooltipW / 2;
    const left = Math.min(Math.max(x, halfW + 8), containerWidth - halfW - 8);
    const fitsAbove = y - tooltipH - 20 > 0;
    const top = fitsAbove ? y - 16 : y + 24;
    const t = data.tariff;

    const tooltipBody = (
        <div className="bg-slate-900 text-white rounded-xl shadow-2xl px-4 py-3 w-[290px] border border-slate-700">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{data.flag}</span>
                <span className="font-semibold text-sm">{data.name}</span>
                {t.hasFTA && <span className="text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded-full">{t.ftaName || 'FTA'}</span>}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ml-auto ${
                    data.dataConfidence === 'high' ? 'bg-emerald-500/20 text-emerald-300' :
                    data.dataConfidence === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-rose-500/20 text-rose-300'
                }`}>
                    {data.dataConfidence === 'high' ? 'High confidence' : data.dataConfidence === 'medium' ? 'Medium confidence' : 'Low confidence'}
                </span>
            </div>

            {/* Import price */}
            <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold tracking-tight">${data.unitValue.toFixed(2)}</span>
                <span className="text-slate-400 text-xs">{perUnit} import price</span>
            </div>

            {/* Savings vs China */}
            {savings && (
                <div className={`text-xs font-medium mb-2 ${savings.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {savings.amount > 0
                        ? `${savings.percent}% cheaper than China (-$${savings.amount.toFixed(2)}${perUnit})`
                        : `${Math.abs(savings.percent)}% more than China (+$${Math.abs(savings.amount).toFixed(2)}${perUnit})`}
                </div>
            )}

            {/* Full tariff breakdown */}
            <div className="border-t border-slate-700 pt-2 mt-1 space-y-1">
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1">Tariff Breakdown</div>
                <TariffRow label="Base MFN" rate={t.baseMfnRate} />
                {t.ftaDiscount > 0 && <TariffRow label={`FTA (${t.ftaName})`} rate={-t.ftaDiscount} color="text-emerald-400" />}
                {t.ieepaBaseline > 0 && <TariffRow label="IEEPA Baseline" rate={t.ieepaBaseline} />}
                {t.ieepaFentanyl > 0 && <TariffRow label="IEEPA Fentanyl" rate={t.ieepaFentanyl} />}
                {t.ieepaReciprocal > 0 && <TariffRow label="IEEPA Reciprocal" rate={t.ieepaReciprocal} />}
                {t.section301Rate > 0 && <TariffRow label="Section 301" rate={t.section301Rate} color="text-rose-400" />}
                {t.section232Rate > 0 && <TariffRow label={`Section 232 (${t.section232Product})`} rate={t.section232Rate} color="text-amber-400" />}
                {t.adcvdRate > 0 && <TariffRow label="AD/CVD" rate={t.adcvdRate} color="text-rose-400" />}
                <div className="flex justify-between text-xs font-semibold pt-1 border-t border-slate-700">
                    <span>Effective Rate</span>
                    <span style={{ color: t.effectiveRate > 30 ? '#FCA5A5' : t.effectiveRate > 10 ? '#FDE68A' : '#99F6E4' }}>
                        {t.effectiveRate.toFixed(1)}%
                    </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Duty{perUnit}</span>
                    <span className="text-rose-400">${data.dutyPerUnit.toFixed(2)}</span>
                </div>
            </div>

            {/* Confidence + Warnings */}
            {(data.dataConfidence !== 'high' || t.warnings.length > 0) && (
                <div className="mt-2 pt-1 border-t border-slate-700 space-y-0.5">
                    {data.dataConfidence !== 'high' && (
                        <div className="flex items-start gap-1 text-[10px] text-amber-400">
                            <Info size={10} className="mt-0.5 shrink-0" /><span>{data.confidenceReason}</span>
                        </div>
                    )}
                    {t.warnings.map((w, i) => (
                        <div key={i} className="flex items-start gap-1 text-[10px] text-amber-400">
                            <AlertTriangle size={10} className="mt-0.5 shrink-0" /><span>{w}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1.5 mt-1 border-t border-slate-700">
                <span className="flex items-center gap-1"><Clock size={10} />{data.transitDays}d transit</span>
                <span>{formatVolume(data.importVolume)} volume</span>
            </div>
        </div>
    );

    const arrowDown = <div className="w-3 h-3 bg-slate-900 rotate-45 mx-auto -mt-1.5 border-r border-b border-slate-700" />;
    const arrowUp = <div className="w-3 h-3 bg-slate-900 rotate-45 mx-auto -mb-1.5 border-l border-t border-slate-700" />;

    return (
        <div className="absolute z-30 pointer-events-none" style={{ left, top, transform: fitsAbove ? 'translate(-50%, -100%)' : 'translate(-50%, 0%)' }}>
            {fitsAbove ? <>{tooltipBody}{arrowDown}</> : <>{arrowUp}{tooltipBody}</>}
        </div>
    );
};

const TariffRow: React.FC<{ label: string; rate: number; color?: string }> = ({ label, rate, color }) => (
    <div className="flex justify-between text-[11px]">
        <span className="text-slate-400">{label}</span>
        <span className={color || 'text-slate-300'}>{rate > 0 ? '+' : ''}{rate.toFixed(1)}%</span>
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function getTariffColor(value: number): string {
    for (let i = TARIFF_STOPS.length - 1; i >= 0; i--) {
        if (value >= TARIFF_STOPS[i][0]) return TARIFF_STOPS[i][1];
    }
    return TARIFF_STOPS[0][1];
}

function formatVolume(value: number): string {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
}

