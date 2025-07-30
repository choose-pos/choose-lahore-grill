/**
 * Calculates the relative luminance of a hex color.
 * @param hex - Hex color code (e.g., "#FFFFFF").
 * @returns The relative luminance (a value between 0 and 1).
 */
function getLuminance(hex: string): number {
    const rgb = hex.replace("#", "").match(/.{1,2}/g)?.map(val => parseInt(val, 16)) || [0, 0, 0];
    const [r, g, b] = rgb.map(c => {
        const sRGB = c / 255;
        return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculates the contrast ratio between two colors.
 * @param bgColor - Background hex color (e.g., "#FFFFFF").
 * @param textColor - Text hex color (e.g., "#000000").
 * @returns The contrast ratio (a value >= 1.0).
 */
function getContrastRatio(bgColor: string, textColor: string): number {
    const bgLuminance = getLuminance(bgColor);
    const textLuminance = getLuminance(textColor);
    return (Math.max(bgLuminance, textLuminance) + 0.05) / (Math.min(bgLuminance, textLuminance) + 0.05);
}

/**
 * Checks if the contrast ratio between a background and text color is sufficient.
 * @param bgColor - Background hex color (e.g., "#FFFFFF").
 * @param textColor - Text hex color (e.g., "#000000").
 * @param largeText - Whether the text is large (defaults to false).
 * @returns True if contrast is sufficient, otherwise false.
 */
export function isContrastOkay(bgColor: string, textColor: string, largeText: boolean = false): boolean {
    const contrastRatio = getContrastRatio(bgColor, textColor);
    const minimumContrast = largeText ? 3.0 : 4.5; // WCAG AA standards
    return contrastRatio >= minimumContrast;
}


