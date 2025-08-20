/**
 * Performance monitoring and optimization utilities
 */
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { isLowEndDevice } from './utils.js';

/**
 * Performance monitor class
 */
export class PerformanceMonitor {
    constructor() {
        this.stats = new Stats();
        this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb
        this.stats.dom.style.position = 'absolute';
        this.stats.dom.style.top = '10px';
        this.stats.dom.style.right = '10px';
        this.stats.dom.style.zIndex = '1000';
        
        this.isLowEnd = isLowEndDevice();
        this.performanceMode = this.isLowEnd;
        this.vertexCount = 0;
        
        this.createOverlay();
    }

    /**
     * Create performance info overlay
     */
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.style.position = 'absolute';
        this.overlay.style.top = '60px';
        this.overlay.style.right = '10px';
        this.overlay.style.color = 'white';
        this.overlay.style.fontSize = '12px';
        this.overlay.style.fontFamily = 'monospace';
        this.overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
        this.overlay.style.padding = '5px';
        this.overlay.style.borderRadius = '3px';
        this.overlay.style.zIndex = '999'; // Lower than controls panel
        this.overlay.style.userSelect = 'none';
        this.overlay.style.pointerEvents = 'none';
        
        document.body.appendChild(this.overlay);
    }

    /**
     * Add stats panel to DOM
     */
    show() {
        document.body.appendChild(this.stats.dom);
    }

    /**
     * Remove stats panel from DOM
     */
    hide() {
        if (this.stats.dom.parentElement) {
            this.stats.dom.parentElement.removeChild(this.stats.dom);
        }
    }

    /**
     * Update performance stats
     */
    update() {
        this.stats.update();
        this.updateOverlay();
    }

    /**
     * Update the performance overlay
     */
    updateOverlay() {
        const mode = this.performanceMode ? 'Performance' : 'Quality';
        const vertexInfo = this.formatVertexCount(this.vertexCount);
        
        this.overlay.innerHTML = `
            Mode: ${mode}<br>
            Vertices: ${vertexInfo}<br>
            Device: ${this.isLowEnd ? 'Low-end' : 'High-end'}
        `;
    }

    /**
     * Format vertex count for display
     * @param {number} count - Vertex count
     * @returns {string} Formatted string
     */
    formatVertexCount(count) {
        if (count > 1000000) {
            return `${(count / 1000000).toFixed(1)}M`;
        } else if (count > 1000) {
            return `${(count / 1000).toFixed(1)}K`;
        }
        return count.toString();
    }

    /**
     * Set vertex count
     * @param {number} count - Current vertex count
     */
    setVertexCount(count) {
        this.vertexCount = count;
    }

    /**
     * Toggle performance mode
     * @param {boolean} enabled - Enable performance mode
     */
    setPerformanceMode(enabled) {
        this.performanceMode = enabled;
    }

    /**
     * Get recommended resolution based on performance mode
     * @param {number} baseResolution - Base resolution
     * @returns {number} Recommended resolution
     */
    getRecommendedResolution(baseResolution) {
        if (this.performanceMode) {
            return Math.floor(baseResolution * 0.5);
        }
        return baseResolution;
    }

    /**
     * Check if shadows should be enabled
     * @returns {boolean} Enable shadows
     */
    shouldEnableShadows() {
        return !this.performanceMode;
    }

    /**
     * Get recommended pixel ratio
     * @returns {number} Pixel ratio
     */
    getRecommendedPixelRatio() {
        const ratio = window.devicePixelRatio || 1;
        return this.performanceMode ? Math.min(ratio, 1) : Math.min(ratio, 2);
    }

    /**
     * Cleanup resources
     */
    dispose() {
        this.hide();
        if (this.overlay && this.overlay.parentElement) {
            this.overlay.parentElement.removeChild(this.overlay);
        }
    }
}
