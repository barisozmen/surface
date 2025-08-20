/**
 * Color mapping utilities for height-based surface coloring
 */
import * as THREE from 'three';

/**
 * Available color map types
 */
export const COLOR_MAP_TYPES = {
    VIRIDIS: 'viridis',
    INFERNO: 'inferno',
    COOL_WARM: 'coolWarm',
    GRAYSCALE: 'grayscale',
    RGB_SPATIAL: 'rgbSpatial',
    HSV_HEIGHT: 'hsvHeight',
    TERRAIN: 'terrain',
    COORDINATE_GRID: 'coordinateGrid'
};

/**
 * Color map implementations
 */
const colorMaps = {
    /**
     * Viridis color map (perceptually uniform)
     * @param {number} t - Normalized value [0,1]
     * @returns {THREE.Color} Color
     */
    [COLOR_MAP_TYPES.VIRIDIS]: (t) => {
        // Simplified viridis approximation
        const r = Math.max(0, Math.min(1, 0.267 + 0.004 * t + 0.329 * t * t));
        const g = Math.max(0, Math.min(1, 0.004 + 0.729 * t + 0.267 * t * t));
        const b = Math.max(0, Math.min(1, 0.329 + 0.267 * t + 0.004 * t * t));
        return new THREE.Color(r, g, b);
    },

    /**
     * Inferno color map (warm colors)
     * @param {number} t - Normalized value [0,1]
     * @returns {THREE.Color} Color
     */
    [COLOR_MAP_TYPES.INFERNO]: (t) => {
        const hue = 0.05 + 0.1 * t; // Red to yellow
        const saturation = 1.0;
        const lightness = 0.2 + 0.6 * t;
        return new THREE.Color().setHSL(hue, saturation, lightness);
    },

    /**
     * Cool-warm color map (blue to red)
     * @param {number} t - Normalized value [0,1]
     * @returns {THREE.Color} Color
     */
    [COLOR_MAP_TYPES.COOL_WARM]: (t) => {
        const coolBlue = new THREE.Color(0.23, 0.30, 0.75);
        const warmRed = new THREE.Color(0.86, 0.20, 0.18);
        return new THREE.Color().lerpColors(coolBlue, warmRed, t);
    },

    /**
     * Grayscale color map
     * @param {number} t - Normalized value [0,1]
     * @returns {THREE.Color} Color
     */
    [COLOR_MAP_TYPES.GRAYSCALE]: (t) => {
        return new THREE.Color(t, t, t);
    },

    /**
     * RGB Spatial mapping: R=X position, G=Y position, B=Z height
     * Educational - shows all three dimensions simultaneously
     * @param {number} t - Normalized Z value [0,1]
     * @param {number} x - Normalized X value [0,1] 
     * @param {number} y - Normalized Y value [0,1]
     * @returns {THREE.Color} Color
     */
    [COLOR_MAP_TYPES.RGB_SPATIAL]: (t, x = 0.5, y = 0.5) => {
        // Ensure values are in valid range
        const r = Math.max(0, Math.min(1, x));
        const g = Math.max(0, Math.min(1, y));
        const b = Math.max(0, Math.min(1, t));
        return new THREE.Color(r, g, b);
    },

    /**
     * HSV Height mapping: Hue from X/Y position, Brightness from Z height
     * Educational - position determines color family, height determines brightness
     * @param {number} t - Normalized Z value [0,1]
     * @param {number} x - Normalized X value [0,1]
     * @param {number} y - Normalized Y value [0,1]
     * @returns {THREE.Color} Color
     */
    [COLOR_MAP_TYPES.HSV_HEIGHT]: (t, x = 0.5, y = 0.5) => {
        // Calculate hue from X,Y position (creates rainbow patterns)
        const hue = ((x + y) * 0.5) % 1.0; // Average of X,Y for hue
        const saturation = 0.8; // Keep saturation high for vivid colors
        const lightness = 0.3 + 0.6 * t; // Height controls brightness
        return new THREE.Color().setHSL(hue, saturation, lightness);
    },

    /**
     * Terrain-like height mapping with natural elevation colors
     * Educational - intuitive height representation like topographic maps
     * @param {number} t - Normalized Z value [0,1]
     * @returns {THREE.Color} Color
     */
    [COLOR_MAP_TYPES.TERRAIN]: (t) => {
        // Deep blue to cyan to green to yellow to red (like real terrain)
        if (t < 0.2) {
            // Deep water to shallow water (dark blue to cyan)
            const local_t = t / 0.2;
            const deepBlue = new THREE.Color(0.0, 0.1, 0.4);
            const cyan = new THREE.Color(0.0, 0.6, 0.8);
            return new THREE.Color().lerpColors(deepBlue, cyan, local_t);
        } else if (t < 0.4) {
            // Shore to lowlands (cyan to green)
            const local_t = (t - 0.2) / 0.2;
            const cyan = new THREE.Color(0.0, 0.6, 0.8);
            const green = new THREE.Color(0.1, 0.7, 0.2);
            return new THREE.Color().lerpColors(cyan, green, local_t);
        } else if (t < 0.7) {
            // Plains to hills (green to yellow)
            const local_t = (t - 0.4) / 0.3;
            const green = new THREE.Color(0.1, 0.7, 0.2);
            const yellow = new THREE.Color(0.8, 0.8, 0.1);
            return new THREE.Color().lerpColors(green, yellow, local_t);
        } else {
            // Mountains to peaks (yellow to red)
            const local_t = (t - 0.7) / 0.3;
            const yellow = new THREE.Color(0.8, 0.8, 0.1);
            const red = new THREE.Color(0.9, 0.2, 0.1);
            return new THREE.Color().lerpColors(yellow, red, local_t);
        }
    },

    /**
     * Coordinate grid highlighting - emphasizes mathematical structure
     * Educational - highlights zero lines and coordinate planes
     * @param {number} t - Normalized Z value [0,1]
     * @param {number} x - Normalized X value [0,1]
     * @param {number} y - Normalized Y value [0,1]
     * @param {number} rawX - Raw X coordinate
     * @param {number} rawY - Raw Y coordinate
     * @param {number} rawZ - Raw Z coordinate
     * @returns {THREE.Color} Color
     */
    [COLOR_MAP_TYPES.COORDINATE_GRID]: (t, x = 0.5, y = 0.5, rawX = 0, rawY = 0, rawZ = 0) => {
        const baseColor = new THREE.Color().setHSL(0.6, 0.3, 0.3 + 0.4 * t); // Blue-ish base
        
        // Highlight special coordinate lines
        const tolerance = 0.3; // Tolerance for highlighting lines
        
        // Highlight X=0 plane (YZ plane) in red
        if (Math.abs(rawX) < tolerance) {
            return new THREE.Color().lerpColors(baseColor, new THREE.Color(0.9, 0.2, 0.2), 0.7);
        }
        
        // Highlight Y=0 plane (XZ plane) in green  
        if (Math.abs(rawY) < tolerance) {
            return new THREE.Color().lerpColors(baseColor, new THREE.Color(0.2, 0.9, 0.2), 0.7);
        }
        
        // Highlight Z=0 plane in bright yellow
        if (Math.abs(rawZ) < tolerance) {
            return new THREE.Color().lerpColors(baseColor, new THREE.Color(0.9, 0.9, 0.2), 0.8);
        }
        
        // Highlight π intervals with subtle brightening
        const piTolerance = 0.5;
        if (Math.abs(rawX % Math.PI) < piTolerance || Math.abs(rawY % Math.PI) < piTolerance) {
            return new THREE.Color().lerpColors(baseColor, new THREE.Color(1, 1, 1), 0.2);
        }
        
        return baseColor;
    }
};

/**
 * ColorMap utility class
 */
export class ColorMap {
    constructor(type = COLOR_MAP_TYPES.VIRIDIS) {
        this.type = type;
        this.mapFunction = colorMaps[type];
    }

    /**
     * Set the color map type
     * @param {string} type - Color map type
     */
    setType(type) {
        if (colorMaps[type]) {
            this.type = type;
            this.mapFunction = colorMaps[type];
        }
    }

    /**
     * Get color for normalized height value with optional spatial coordinates
     * @param {number} normalizedHeight - Height value normalized to [0,1]
     * @param {number} normalizedX - X coordinate normalized to [0,1] (optional)
     * @param {number} normalizedY - Y coordinate normalized to [0,1] (optional)
     * @param {number} rawX - Raw X coordinate (optional)
     * @param {number} rawY - Raw Y coordinate (optional)
     * @param {number} rawZ - Raw Z coordinate (optional)
     * @returns {THREE.Color} Color
     */
    getColor(normalizedHeight, normalizedX = 0.5, normalizedY = 0.5, rawX = 0, rawY = 0, rawZ = 0) {
        return this.mapFunction(
            Math.max(0, Math.min(1, normalizedHeight)),
            Math.max(0, Math.min(1, normalizedX)),
            Math.max(0, Math.min(1, normalizedY)),
            rawX,
            rawY,
            rawZ
        );
    }

    /**
     * Apply color map to geometry vertices based on height and spatial coordinates
     * @param {THREE.BufferGeometry} geometry - Geometry to color
     * @param {number} minZ - Minimum Z value for normalization
     * @param {number} maxZ - Maximum Z value for normalization
     * @param {number} minX - Minimum X value for normalization (optional)
     * @param {number} maxX - Maximum X value for normalization (optional)
     * @param {number} minY - Minimum Y value for normalization (optional)
     * @param {number} maxY - Maximum Y value for normalization (optional)
     * @param {boolean} grayBelowZero - Color below-zero parts in gray (optional)
     */
    applyToGeometry(geometry, minZ, maxZ, minX = -1, maxX = 1, minY = -1, maxY = 1, grayBelowZero = true) {
        const positions = geometry.attributes.position;
        const colors = new Float32Array(positions.count * 3);
        
        const rangeZ = maxZ - minZ;
        const rangeX = maxX - minX;
        const rangeY = maxY - minY;
        
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            
            let color;
            
            // Use gray for below-zero parts if enabled
            if (grayBelowZero && z < 0) {
                // Create a gray color with intensity based on depth
                const grayIntensity = Math.max(0.3, Math.min(0.7, 0.5 + (z / Math.min(minZ, -0.1)) * 0.2));
                color = new THREE.Color(grayIntensity, grayIntensity, grayIntensity);
            } else {
                // Use normal color mapping for above-zero parts
                // For below-zero with grayBelowZero=false, or above-zero parts
                const normalizedHeight = rangeZ > 0 ? (z - minZ) / rangeZ : 0.5;
                const normalizedX = rangeX > 0 ? (x - minX) / rangeX : 0.5;
                const normalizedY = rangeY > 0 ? (y - minY) / rangeY : 0.5;
                
                color = this.getColor(normalizedHeight, normalizedX, normalizedY, x, y, z);
            }
            
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }

    /**
     * Get all available color map types
     * @returns {Object} Color map types
     */
    static getTypes() {
        return COLOR_MAP_TYPES;
    }
}
