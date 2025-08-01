/**
 * theme/colors.js
 * This file defines the color palette used across the application. 
 * It is used to ensure consistency in design and branding.
 * It matches the colors defined in tailwind.config.cjs.    
 * This way we do not have to repeat the colors in multiple places.
 */

export const BRAND_COLORS = {
        'black-purple-dweebe': '#1a0123', // black with a little purple fade
        'eblue-dweebe': '#00e1ff', // turquise electric blue
        'eorange-dweebe': '#fb6e05',  // electric orange
        'epink-dweebe': '#f617de', // pink electric
        'egreen-dweebe': '#17f851', // green electric
        'emint-dweebe': '#01ffcd', // electric mint
        'mred-dweebe': '#d24a24', // text color for david and anna d24 & a24
        'ered-dweebe': '#f70000', // red electric
        'mblue-dweebe': '#0f227e', // medium blue
        'msalmon-dweebe': '#d6976f', // medium salmon color
        'dgray-dweebe': '#141414', // not black but dark gray
        'nightsky-dweebe': '#05010d',  // very dark blueish purple
        'epurple-dweebe': '#8c1ffa', // purple electric
        'white-dweebe':   '#f9f9ef', /* BRAND_COLORS.white.dweebe white with a little sun*/
        'midnight-anna-dweebe': '#00000a', // Tribute to Anna's Midnight theme
        'melyellow-dweebe': '#eded06ff', // mellow yellow
};

export const COLOR_ARRAY = Object.values(BRAND_COLORS);
 