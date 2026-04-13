import { MainBrownSecondaryColor, MainSecondaryBlueColor } from '../styles/GeneralAppStyle';

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
 * ~98% white + ~2% category — gray-white with only a hint of hue.
 */
function blendWithWhite(hex, amount = 0.022) {
    const raw = (hex || '').trim().replace('#', '');
    if (raw.length !== 6 || Number.isNaN(parseInt(raw, 16))) {
        return '#F9FAFB';
    }
    const n = parseInt(raw, 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    const w = 1 - amount;
    const R = Math.round(255 * w + r * amount);
    const G = Math.round(255 * w + g * amount);
    const B = Math.round(255 * w + b * amount);
    return `#${[R, G, B].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Near-neutral cards (white/gray-leaning); category shows in rail, icon, buttons, and light accents only.
 */
const PALETTES = {
    Politics: {
        base: '#CB0E01',
        accent: '#A50D00',
        cardSurface: blendWithWhite('#CB0E01'),
        iconTileBg: hexToRgba('#CB0E01', 0.04),
        cardBorder: hexToRgba('#CB0E01', 0.048),
        primaryBorderUnvoted: hexToRgba('#CB0E01', 0.18),
        opposeBorder: '#E5E7EB',
        opposeSelected: '#374151',
    },
    Economy: {
        base: '#51783F',
        accent: '#3E5F30',
        cardSurface: blendWithWhite('#51783F'),
        iconTileBg: hexToRgba('#51783F', 0.04),
        cardBorder: hexToRgba('#51783F', 0.048),
        primaryBorderUnvoted: hexToRgba('#51783F', 0.18),
        opposeBorder: '#E5E7EB',
        opposeSelected: '#374151',
    },
    Tech: {
        base: '#2563EB',
        accent: '#1D4ED8',
        cardSurface: blendWithWhite('#2563EB'),
        iconTileBg: hexToRgba('#2563EB', 0.04),
        cardBorder: hexToRgba('#2563EB', 0.048),
        primaryBorderUnvoted: hexToRgba('#2563EB', 0.18),
        opposeBorder: '#E5E7EB',
        opposeSelected: '#374151',
    },
    Social: {
        base: '#7C3AED',
        accent: '#6D28D9',
        cardSurface: blendWithWhite('#7C3AED'),
        iconTileBg: hexToRgba('#7C3AED', 0.04),
        cardBorder: hexToRgba('#7C3AED', 0.048),
        primaryBorderUnvoted: hexToRgba('#7C3AED', 0.18),
        opposeBorder: '#E5E7EB',
        opposeSelected: '#374151',
    },
    Business: {
        base: '#562C2C',
        accent: '#3B1F1F',
        cardSurface: blendWithWhite('#562C2C', 0.018),
        iconTileBg: hexToRgba('#562C2C', 0.038),
        cardBorder: hexToRgba('#562C2C', 0.045),
        primaryBorderUnvoted: hexToRgba('#562C2C', 0.18),
        opposeBorder: '#E5E7EB',
        opposeSelected: '#374151',
    },
    Sports: {
        base: '#C24A0A',
        accent: '#9A3B08',
        cardSurface: blendWithWhite('#C24A0A'),
        iconTileBg: hexToRgba('#C24A0A', 0.04),
        cardBorder: hexToRgba('#C24A0A', 0.048),
        primaryBorderUnvoted: hexToRgba('#C24A0A', 0.18),
        opposeBorder: '#E5E7EB',
        opposeSelected: '#374151',
    },
    Culture: {
        base: '#57755F',
        accent: '#3F5746',
        cardSurface: blendWithWhite('#57755F'),
        iconTileBg: hexToRgba('#57755F', 0.04),
        cardBorder: hexToRgba('#57755F', 0.048),
        primaryBorderUnvoted: hexToRgba('#57755F', 0.18),
        opposeBorder: '#E5E7EB',
        opposeSelected: '#374151',
    },
    Africa: {
        base: MainBrownSecondaryColor,
        accent: '#66462C',
        cardSurface: blendWithWhite(MainBrownSecondaryColor, 0.02),
        iconTileBg: hexToRgba(MainBrownSecondaryColor, 0.04),
        cardBorder: hexToRgba(MainBrownSecondaryColor, 0.048),
        primaryBorderUnvoted: hexToRgba(MainBrownSecondaryColor, 0.18),
        opposeBorder: '#E5E7EB',
        opposeSelected: '#374151',
    },
    World: {
        base: '#1A7474',
        accent: '#155E5E',
        cardSurface: blendWithWhite('#1A7474'),
        iconTileBg: hexToRgba('#1A7474', 0.04),
        cardBorder: hexToRgba('#1A7474', 0.048),
        primaryBorderUnvoted: hexToRgba('#1A7474', 0.18),
        opposeBorder: '#E5E7EB',
        opposeSelected: '#374151',
    },
    Entertainment: {
        base: MainSecondaryBlueColor,
        accent: '#006688',
        cardSurface: blendWithWhite(MainSecondaryBlueColor),
        iconTileBg: hexToRgba(MainSecondaryBlueColor, 0.04),
        cardBorder: hexToRgba(MainSecondaryBlueColor, 0.048),
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
