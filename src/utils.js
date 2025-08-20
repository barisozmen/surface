/**
 * Shared utilities and helper functions
 */

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Map a value from one range to another
 * @param {number} value - Input value
 * @param {number} inMin - Input range minimum
 * @param {number} inMax - Input range maximum
 * @param {number} outMin - Output range minimum
 * @param {number} outMax - Output range maximum
 * @returns {number} Mapped value
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
    return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
}

/**
 * Format a number for display (handle π multiples)
 * @param {number} value - Number to format
 * @returns {string} Formatted string
 */
export function formatNumber(value) {
    const piRatio = value / Math.PI;
    if (Math.abs(piRatio - Math.round(piRatio)) < 0.01) {
        const rounded = Math.round(piRatio);
        if (rounded === 0) return '0';
        if (rounded === 1) return 'π';
        if (rounded === -1) return '-π';
        return `${rounded}π`;
    }
    return value.toFixed(2);
}

/**
 * Detect if device has limited GPU capabilities
 * @returns {boolean} True if low-end device
 */
export function isLowEndDevice() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return true;
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        // Simple heuristic for mobile/integrated graphics
        return /mobile|intel|integrated/i.test(renderer);
    }
    
    // Fallback: check if mobile user agent
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
