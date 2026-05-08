import { MainBrownSecondaryColor, MainSecondaryBlueColor } from '../styles/GeneralAppStyle';

/** Cool light grey — crisp, modern surface for lane cards (better contrast than warm beige). */
export const DISCUSSION_LANE_CARD_SURFACE = '#F8F9FB';

/** 6-char hex → rgba(..., alpha) for borders / icon tiles */
function hexToRgba(hex, alpha) {
    if (hex == null || typeof hex !== 'string') return `rgba(0,0,0,${alpha})`;
    const raw = hex.trim().replace('#', '');
    if (raw.length !== 6 || Number.isNaN(parseInt(raw, 16))) {
        return `rgba(0,0,0,${alpha})`;
    }
    const n = parseInt(raw, 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Category colour shows on border, icon tile, and vote controls — not on the main card fill.
 */
const PALETTES = {
    Politics: {
        // Slightly deeper, less saturated red (more editorial, less “alert”)
        base: '#C81E1E',
        accent: '#B91C1C',
        cardSurface: DISCUSSION_LANE_CARD_SURFACE,
        // Very soft red tints to avoid beige+red clash
        iconTileBg: '#FEF2F2',
        cardBorder: hexToRgba('#B91C1C', 0.14),
        primaryBorderUnvoted: hexToRgba('#B91C1C', 0.22),
        opposeBorder: '#E5E7EB',
        opposeSelected: '#374151',
    },
    Economy: {
        base: '#51783F',
        accent: '#3E5F30',
        cardSurface: DISCUSSION_LANE_CARD_SURFACE,
        iconTileBg: hexToRgba('#51783F', 0.085),
        cardBorder: hexToRgba('#51783F', 0.1),
        primaryBorderUnvoted: hexToRgba('#51783F', 0.18),
        opposeBorder: '#E5E7EB',
        opposeSelected: '#374151',
    },
    Tech: {
        base: '#2563EB',
        accent: '#1D4ED8',
        cardSurface: DISCUSSION_LANE_CARD_SURFACE,
        iconTileBg: hexToRgba('#2563EB', 0.085),
        cardBorder: hexToRgba('#2563EB', 0.1),
        primaryBorderUnvoted: hexToRgba('#2563EB', 0.18),
        opposeBorder: '#E5E7EB',
        opposeSelected: '#374151',
    },
    Social: {
        base: '#7C3AED',
        accent: '#6D28D9',
        cardSurface: DISCUSSION_LANE_CARD_SURFACE,
        iconTileBg: hexToRgba('#7C3AED', 0.085),
        cardBorder: hexToRgba('#7C3AED', 0.1),
        primaryBorderUnvoted: hexToRgba('#7C3AED', 0.18),
        opposeBorder: '#E5E7EB',
        opposeSelected: '#374151',
    },
    Business: {
        base: '#562C2C',
        accent: '#3B1F1F',
        cardSurface: DISCUSSION_LANE_CARD_SURFACE,
        iconTileBg: hexToRgba('#562C2C', 0.09),
        cardBorder: hexToRgba('#562C2C', 0.1),
        primaryBorderUnvoted: hexToRgba('#562C2C', 0.18),
        opposeBorder: '#E5E7EB',
        opposeSelected: '#374151',
    },
    Sports: {
        base: '#C24A0A',
        accent: '#9A3B08',
        cardSurface: DISCUSSION_LANE_CARD_SURFACE,
        iconTileBg: hexToRgba('#C24A0A', 0.085),
        cardBorder: hexToRgba('#C24A0A', 0.1),
        primaryBorderUnvoted: hexToRgba('#C24A0A', 0.18),
        opposeBorder: '#E5E7EB',
        opposeSelected: '#374151',
    },
    Culture: {
        base: '#57755F',
        accent: '#3F5746',
        cardSurface: DISCUSSION_LANE_CARD_SURFACE,
        iconTileBg: hexToRgba('#57755F', 0.085),
        cardBorder: hexToRgba('#57755F', 0.1),
        primaryBorderUnvoted: hexToRgba('#57755F', 0.18),
        opposeBorder: '#E5E7EB',
        opposeSelected: '#374151',
    },
    Africa: {
        base: MainBrownSecondaryColor,
        accent: '#66462C',
        cardSurface: DISCUSSION_LANE_CARD_SURFACE,
        iconTileBg: hexToRgba(MainBrownSecondaryColor, 0.09),
        cardBorder: hexToRgba(MainBrownSecondaryColor, 0.1),
        primaryBorderUnvoted: hexToRgba(MainBrownSecondaryColor, 0.18),
        opposeBorder: '#E5E7EB',
        opposeSelected: '#374151',
    },
    World: {
        base: '#1A7474',
        accent: '#155E5E',
        cardSurface: DISCUSSION_LANE_CARD_SURFACE,
        iconTileBg: hexToRgba('#1A7474', 0.085),
        cardBorder: hexToRgba('#1A7474', 0.1),
        primaryBorderUnvoted: hexToRgba('#1A7474', 0.18),
        opposeBorder: '#E5E7EB',
        opposeSelected: '#374151',
    },
    Entertainment: {
        base: MainSecondaryBlueColor,
        accent: '#006688',
        cardSurface: DISCUSSION_LANE_CARD_SURFACE,
        iconTileBg: hexToRgba(MainSecondaryBlueColor, 0.085),
        cardBorder: hexToRgba(MainSecondaryBlueColor, 0.1),
        primaryBorderUnvoted: hexToRgba(MainSecondaryBlueColor, 0.18),
        opposeBorder: '#E5E7EB',
        opposeSelected: '#374151',
    },
};

/** Muted fill for “other” button after a vote */
export const LANE_UNSELECTED_FILL = '#F4F4F5';
export const LANE_UNSELECTED_BORDER = '#E5E7EB';
export const LANE_FADED_TEXT = '#9CA3AF';

/** Sentiment bar — neutral track */
export const SENTIMENT_SECONDARY_SEGMENT = '#94A3B8';
export const SENTIMENT_TRACK_BG = '#F4F4F5';

const DEFAULT_PALETTE = PALETTES.Entertainment;

export function getDiscussionLanePalette(articleGroup) {
    if (!articleGroup || !PALETTES[articleGroup]) {
        return DEFAULT_PALETTE;
    }
    return PALETTES[articleGroup];
}
