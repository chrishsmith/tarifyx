'use client';

import React from 'react';
import { Tooltip } from 'antd';

// ═══════════════════════════════════════════════════════════════════════════════
// TRADE GLOSSARY — Single source of truth for trade term definitions
// ═══════════════════════════════════════════════════════════════════════════════

export const TRADE_GLOSSARY: Record<string, string> = {
    'HTS': 'Harmonized Tariff Schedule — a standardized classification system used by US Customs to identify imported goods and determine applicable duty rates. Codes range from 6 to 10 digits.',
    'HTS code': 'Harmonized Tariff Schedule code — a standardized number used by US Customs to classify imported goods and determine applicable duties. Typically 10 digits (e.g., 6109.10.00.12).',
    'MFN': 'Most Favored Nation — the base tariff rate applied to imports from most countries under normal trade relations, unless a preferential or additional rate applies.',
    'AD/CVD': 'Antidumping / Countervailing Duties — extra duties on imports sold below fair market value (AD) or benefiting from foreign government subsidies (CVD).',
    'PGA': 'Partner Government Agency — federal agencies other than CBP that regulate certain imports (e.g., FDA for food/drugs, EPA for chemicals, FCC for electronics).',
    'RVC': 'Regional Value Content — the percentage of a product\'s value originating in FTA member countries. Used to determine if a product qualifies for preferential FTA rates.',
    'HMF': 'Harbor Maintenance Fee — a 0.125% fee on the value of commercial cargo shipped through US ports, collected by CBP.',
    'MPF': 'Merchandise Processing Fee — a CBP processing fee of 0.3464% of the declared value (min $33.58, max $651.50 per entry for FY2026).',
    'IEEPA': 'International Emergency Economic Powers Act — presidential authority to impose tariffs during declared national emergencies. Currently used for fentanyl-related tariffs on China, Canada, and Mexico.',
    'Section 301': 'Section 301 of the Trade Act of 1974 — tariffs imposed to address unfair foreign trade practices. Currently includes 25% tariffs on approximately $370B of Chinese goods across multiple tranches.',
    'Section 232': 'Section 232 of the Trade Expansion Act of 1962 — tariffs on imports deemed a threat to national security. Currently 25% on steel (Ch 72 + headings 7301-7313) and 25% on aluminum (Ch 76).',
    'FTA': 'Free Trade Agreement — international agreements that reduce or eliminate tariffs between member countries. US FTAs include USMCA (Canada/Mexico), KORUS (South Korea), and 18 others.',
    'USMCA': 'United States–Mexico–Canada Agreement — the FTA replacing NAFTA, providing duty-free treatment for qualifying goods traded between the US, Mexico, and Canada.',
    'Country of Origin': 'The country where a product was manufactured or substantially transformed — not where it was shipped from. Determines which tariff rates and trade programs apply.',
    'Landed Cost': 'The total cost to import a product: purchase price + freight + insurance + duties + taxes + fees. The true cost of getting goods to your warehouse.',
    'Duty Drawback': 'A refund of up to 99% of duties paid on imported goods that are subsequently re-exported or used in manufacturing exported products.',
    'Tariff Engineering': 'Legally restructuring a product\'s design, composition, or classification to qualify for a lower tariff rate — e.g., importing components separately vs. assembled.',
};

// ═══════════════════════════════════════════════════════════════════════════════
// GLOSSARY TERM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface GlossaryTermProps {
    /** The glossary key to look up (must match a key in TRADE_GLOSSARY) */
    term: string;
    /** Override the displayed text (defaults to the term key) */
    children?: React.ReactNode;
    /** Show dotted underline indicator (default: true) */
    showIndicator?: boolean;
}

/**
 * Wraps text in a tooltip with the trade term definition.
 * Usage: <GlossaryTerm term="MFN">MFN Rate</GlossaryTerm>
 * Or: <GlossaryTerm term="HTS code" /> (displays "HTS code" as text)
 */
export const GlossaryTerm: React.FC<GlossaryTermProps> = ({
    term,
    children,
    showIndicator = true,
}) => {
    const definition = TRADE_GLOSSARY[term];

    if (!definition) {
        return <>{children || term}</>;
    }

    return (
        <Tooltip title={definition} overlayStyle={{ maxWidth: 360 }}>
            <span
                className={showIndicator
                    ? 'cursor-help border-b border-dotted border-slate-400'
                    : 'cursor-help'
                }
            >
                {children || term}
            </span>
        </Tooltip>
    );
};
