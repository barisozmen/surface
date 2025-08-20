/**
 * Surface geometry generation and materials
 */
import * as THREE from 'three';
import { ColorMap, COLOR_MAP_TYPES } from './colormap.js';
import { clamp } from './utils.js';
import { FormulaEvaluator, FORMULA_PRESETS } from './formula.js';

/**
 * Surface configuration object
 */
export const defaultSurfaceConfig = {
    domain: {
        xMin: -3 * Math.PI,
        xMax: 3 * Math.PI,
        yMin: -3 * Math.PI,
        yMax: 3 * Math.PI
    },
    resolution: {
        x: 120,
        y: 120
    },
    animation: {
        amplitude: 1.0,
        omega: 0.5,
        playing: false,
        time: 0
    },
    rendering: {
        colorMap: COLOR_MAP_TYPES.RGB_SPATIAL, // Start with educational RGB mapping
        wireframe: true,
        wireframeOpacity: 0.8, // More visible wireframe
        showSurface: true,
        surfaceOpacity: 0.6, // Semi-transparent surface
        grayBelowZero: true // Gray coloring for below-zero parts
    },
    formula: {
        expression: 'A * sin(x + ω*t) * cos(y - ω*t)',
        preset: 'sin(x) * cos(y)'
    }
};

/**
 * Surface generator class
 */
export class SurfaceGenerator {
    constructor(scene) {
        this.scene = scene;
        this.config = { ...defaultSurfaceConfig };
        this.colorMap = new ColorMap(this.config.rendering.colorMap);
        
        this.surfaceMesh = null;
        this.wireframeMesh = null;
        this.surfaceGroup = new THREE.Group();
        this.scene.add(this.surfaceGroup);
        
        this.minZ = -1;
        this.maxZ = 1;
        this.minX = -3 * Math.PI;
        this.maxX = 3 * Math.PI;
        this.minY = -3 * Math.PI;
        this.maxY = 3 * Math.PI;
        
        // Initialize formula evaluator
        this.formulaEvaluator = new FormulaEvaluator();
        this.currentEvaluator = null;
        this.setFormula(this.config.formula.expression);
        
        this.generateSurface();
    }

    /**
     * Set custom formula for surface generation
     * @param {string} formula - Mathematical formula string
     */
    setFormula(formula) {
        try {
            this.currentEvaluator = this.formulaEvaluator.createEvaluator(formula);
            this.config.formula.expression = formula;
            console.log(`Formula set successfully: ${formula}`);
        } catch (error) {
            console.error('Formula error:', error.message);
            // Fallback to default formula
            this.currentEvaluator = this.formulaEvaluator.createEvaluator('A * sin(x + ω*t) * cos(y - ω*t)');
            throw error;
        }
    }

    /**
     * Set formula from preset
     * @param {string} presetName - Name of the preset
     */
    setFormulaPreset(presetName) {
        if (FORMULA_PRESETS[presetName]) {
            this.config.formula.preset = presetName;
            this.setFormula(FORMULA_PRESETS[presetName].formula);
        }
    }

    /**
     * Mathematical function evaluator using custom formula
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} amplitude - Amplitude multiplier
     * @param {number} omega - Angular frequency
     * @param {number} time - Time parameter
     * @returns {number} Z value
     */
    calculateZ(x, y, amplitude = 1.0, omega = 0.5, time = 0) {
        if (!this.currentEvaluator) {
            return 0;
        }
        
        return this.formulaEvaluator.evaluate(
            this.currentEvaluator, 
            x, y, time, amplitude, omega
        );
    }

    /**
     * Generate the surface geometry
     */
    generateSurface() {
        const { domain, resolution } = this.config;
        const { animation } = this.config;
        
        // Clamp resolution to safe bounds
        const segmentsX = clamp(resolution.x, 20, 600);
        const segmentsY = clamp(resolution.y, 20, 600);
        
        // Create vertices manually for proper XY domain mapping
        const vertices = [];
        const indices = [];
        
        // Generate vertices over the XY domain
        this.minZ = Infinity;
        this.maxZ = -Infinity;
        this.minX = Infinity;
        this.maxX = -Infinity;
        this.minY = Infinity;
        this.maxY = -Infinity;
        
        // Create grid of vertices
        for (let j = 0; j <= segmentsY; j++) {
            for (let i = 0; i <= segmentsX; i++) {
                // Map grid indices to actual X,Y coordinates
                const x = domain.xMin + (i / segmentsX) * (domain.xMax - domain.xMin);
                const y = domain.yMin + (j / segmentsY) * (domain.yMax - domain.yMin);
                
                // Calculate Z value using the mathematical function
                const z = this.calculateZ(x, y, animation.amplitude, animation.omega, animation.time);
                
                // Add vertex (X, Y, Z)
                vertices.push(x, y, z);
                
                // Track min/max for color mapping
                this.minZ = Math.min(this.minZ, z);
                this.maxZ = Math.max(this.maxZ, z);
                this.minX = Math.min(this.minX, x);
                this.maxX = Math.max(this.maxX, x);
                this.minY = Math.min(this.minY, y);
                this.maxY = Math.max(this.maxY, y);
            }
        }
        
        // Generate indices for triangular faces
        for (let j = 0; j < segmentsY; j++) {
            for (let i = 0; i < segmentsX; i++) {
                const a = i + j * (segmentsX + 1);
                const b = i + (j + 1) * (segmentsX + 1);
                const c = (i + 1) + j * (segmentsX + 1);
                const d = (i + 1) + (j + 1) * (segmentsX + 1);
                
                // Two triangles per quad
                indices.push(a, b, c);
                indices.push(b, d, c);
            }
        }
        
        // Create geometry from vertices and indices
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        
        // Compute vertex normals for smooth shading
        geometry.computeVertexNormals();
        
        // Create or update surface mesh
        if (this.surfaceMesh) {
            this.surfaceMesh.geometry.dispose();
            this.surfaceMesh.geometry = geometry;
        } else {
            const material = new THREE.MeshStandardMaterial({
                vertexColors: true, // Enable vertex colors for spatial coloring
                flatShading: false,
                metalness: 0.1,
                roughness: 0.4, // Slightly more reflective for better lighting
                side: THREE.DoubleSide,
                transparent: true,
                opacity: this.config.rendering.surfaceOpacity || 0.6 // Semi-transparent surface
            });
            
            this.surfaceMesh = new THREE.Mesh(geometry, material);
            this.surfaceMesh.castShadow = true;
            this.surfaceMesh.receiveShadow = true;
            this.surfaceGroup.add(this.surfaceMesh);
        }
        
        // Apply initial color mapping
        this.applyColorMapping();
        
        // Create or update wireframe
        if (this.config.rendering.wireframe) {
            this.updateWireframe(geometry);
        }
    }

    /**
     * Update wireframe overlay
     * @param {THREE.BufferGeometry} geometry - Base geometry
     */
    updateWireframe(geometry) {
        if (this.wireframeMesh) {
            this.wireframeMesh.geometry.dispose();
            this.surfaceGroup.remove(this.wireframeMesh);
        }
        
        const wireframeGeometry = new THREE.WireframeGeometry(geometry);
        const wireframeMaterial = new THREE.LineBasicMaterial({
            color: 0x333333, // Darker lines for better contrast
            opacity: this.config.rendering.wireframeOpacity,
            transparent: true,
            linewidth: 2 // Thicker lines (may not work on all browsers)
        });
        
        this.wireframeMesh = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
        this.surfaceGroup.add(this.wireframeMesh);
    }

    /**
     * Update surface for animation
     * @param {number} time - Current time
     */
    updateAnimation(time) {
        if (!this.config.animation.playing) return;
        
        this.config.animation.time = time;
        
        // Update only the Z positions for efficiency
        const positions = this.surfaceMesh.geometry.attributes.position;
        const vertices = positions.array;
        const { domain, resolution, animation } = this.config;
        
        // Clamp resolution to safe bounds
        const segmentsX = clamp(resolution.x, 20, 600);
        const segmentsY = clamp(resolution.y, 20, 600);
        
        this.minZ = Infinity;
        this.maxZ = -Infinity;
        this.minX = Infinity;
        this.maxX = -Infinity;
        this.minY = Infinity;
        this.maxY = -Infinity;
        
        // Update Z values for each vertex in the grid
        let vertexIndex = 0;
        for (let j = 0; j <= segmentsY; j++) {
            for (let i = 0; i <= segmentsX; i++) {
                // Get X,Y coordinates from the vertex (they don't change during animation)
                const x = vertices[vertexIndex * 3];
                const y = vertices[vertexIndex * 3 + 1];
                
                // Calculate new Z value
                const z = this.calculateZ(x, y, animation.amplitude, animation.omega, animation.time);
                vertices[vertexIndex * 3 + 2] = z;
                
                // Track all coordinate ranges for animation updates
                this.minZ = Math.min(this.minZ, z);
                this.maxZ = Math.max(this.maxZ, z);
                this.minX = Math.min(this.minX, x);
                this.maxX = Math.max(this.maxX, x);
                this.minY = Math.min(this.minY, y);
                this.maxY = Math.max(this.maxY, y);
                
                vertexIndex++;
            }
        }
        
        positions.needsUpdate = true;
        this.surfaceMesh.geometry.computeVertexNormals();
        
        // Update colors for new Z values
        this.applyColorMapping();
    }

    /**
     * Update domain (regenerates surface)
     * @param {Object} newDomain - New domain settings
     */
    updateDomain(newDomain) {
        this.config.domain = { ...this.config.domain, ...newDomain };
        this.generateSurface();
    }

    /**
     * Update resolution (regenerates surface)
     * @param {Object} newResolution - New resolution settings
     */
    updateResolution(newResolution) {
        this.config.resolution = { ...this.config.resolution, ...newResolution };
        this.generateSurface();
    }

    /**
     * Update animation parameters
     * @param {Object} newAnimation - New animation settings
     */
    updateAnimation(newAnimation) {
        this.config.animation = { ...this.config.animation, ...newAnimation };
        if (!this.config.animation.playing) {
            this.generateSurface(); // Regenerate for static mode
        }
    }

    /**
     * Apply color mapping to the current surface geometry
     */
    applyColorMapping() {
        if (this.surfaceMesh && this.surfaceMesh.geometry) {
            this.colorMap.applyToGeometry(
                this.surfaceMesh.geometry, 
                this.minZ, this.maxZ,
                this.minX, this.maxX,
                this.minY, this.maxY,
                this.config.rendering.grayBelowZero
            );
        }
    }

    /**
     * Update color map and apply to surface
     * @param {string} colorMapType - Color map type
     */
    updateColorMap(colorMapType) {
        this.config.rendering.colorMap = colorMapType;
        this.colorMap.setType(colorMapType);
        this.applyColorMapping();
    }

    /**
     * Toggle gray coloring for below-zero parts
     * @param {boolean} enabled - Enable gray below zero
     */
    setGrayBelowZero(enabled) {
        this.config.rendering.grayBelowZero = enabled;
        this.applyColorMapping();
    }

    /**
     * Toggle wireframe visibility
     * @param {boolean} visible - Show wireframe
     */
    setWireframeVisible(visible) {
        this.config.rendering.wireframe = visible;
        if (visible && !this.wireframeMesh) {
            this.updateWireframe(this.surfaceMesh.geometry);
        } else if (!visible && this.wireframeMesh) {
            this.surfaceGroup.remove(this.wireframeMesh);
            this.wireframeMesh.geometry.dispose();
            this.wireframeMesh = null;
        }
    }

    /**
     * Set surface opacity
     * @param {number} opacity - Opacity value
     */
    setSurfaceOpacity(opacity) {
        this.config.rendering.surfaceOpacity = opacity;
        if (this.surfaceMesh && this.surfaceMesh.material) {
            this.surfaceMesh.material.opacity = opacity;
            this.surfaceMesh.material.transparent = opacity < 1.0;
        }
    }

    /**
     * Set wireframe opacity
     * @param {number} opacity - Opacity value
     */
    setWireframeOpacity(opacity) {
        this.config.rendering.wireframeOpacity = opacity;
        if (this.wireframeMesh) {
            this.wireframeMesh.material.opacity = opacity;
        }
    }

    /**
     * Toggle surface visibility
     * @param {boolean} visible - Show surface
     */
    setSurfaceVisible(visible) {
        this.config.rendering.showSurface = visible;
        if (this.surfaceMesh) {
            this.surfaceMesh.visible = visible;
        }
    }

    /**
     * Get current vertex count
     * @returns {number} Vertex count
     */
    getVertexCount() {
        return this.surfaceMesh ? this.surfaceMesh.geometry.attributes.position.count : 0;
    }

    /**
     * Get surface bounds for camera positioning
     * @returns {THREE.Box3} Bounding box
     */
    getBounds() {
        if (this.surfaceMesh) {
            const box = new THREE.Box3().setFromObject(this.surfaceMesh);
            return box;
        }
        return new THREE.Box3();
    }

    /**
     * Get current Z range
     * @returns {Object} Min and max Z values
     */
    getZRange() {
        return { min: this.minZ, max: this.maxZ };
    }

    /**
     * Cleanup resources
     */
    dispose() {
        if (this.surfaceMesh) {
            this.surfaceMesh.geometry.dispose();
            this.surfaceMesh.material.dispose();
        }
        if (this.wireframeMesh) {
            this.wireframeMesh.geometry.dispose();
            this.wireframeMesh.material.dispose();
        }
        this.scene.remove(this.surfaceGroup);
    }
}
