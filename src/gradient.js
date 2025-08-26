/**
 * Gradient visualization and differential equation tools
 */
import * as THREE from 'three';
import { clamp } from './utils.js';

/**
 * Gradient visualization modes
 */
export const GRADIENT_MODES = {
    FIRST_DERIVATIVE: 'first_derivative',
    SECOND_DERIVATIVE: 'second_derivative', 
    THIRD_DERIVATIVE: 'third_derivative',
    DIRECTIONAL: 'directional',
    LAPLACIAN: 'laplacian'
};

/**
 * Gradient visualization class
 */
export class GradientVisualizer {
    constructor(scene, surfaceGenerator) {
        this.scene = scene;
        this.surface = surfaceGenerator;
        
        // Gradient calculation parameters
        this.deltaH = 0.01; // Small step for numerical derivatives
        
        // Visualization state
        this.isActive = false;
        this.currentMode = GRADIENT_MODES.FIRST_DERIVATIVE;
        this.showVectors = true;
        this.showColors = true;
        this.vectorScale = 1.0;
        this.vectorDensity = 0.3; // 0.1 = sparse, 1.0 = dense
        
        // Three.js objects
        this.gradientGroup = new THREE.Group();
        this.scene.add(this.gradientGroup);
        
        // Vector arrows for gradient visualization
        this.vectorArrows = [];
        this.colorOverlay = null;
        
        // Hover interaction
        this.hoverPoint = null;
        this.hoverGradientInfo = null;
        
        // Initialize visualization elements
        this.initializeVisualization();
    }

    /**
     * Initialize visualization components
     */
    initializeVisualization() {
        // Create hover gradient indicator
        this.createHoverIndicator();
    }

    /**
     * Create hover indicator for gradient at cursor position
     */
    createHoverIndicator() {
        // Main arrow for gradient direction
        const arrowGeometry = new THREE.ConeGeometry(0.1, 0.3, 8);
        const arrowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff4444,
            transparent: true,
            opacity: 0.8
        });
        this.hoverArrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
        
        // Arrow shaft
        const shaftGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
        const shaftMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff4444,
            transparent: true,
            opacity: 0.8
        });
        this.hoverShaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
        
        // Group arrow components
        this.hoverGradientGroup = new THREE.Group();
        this.hoverGradientGroup.add(this.hoverArrow);
        this.hoverGradientGroup.add(this.hoverShaft);
        this.hoverGradientGroup.visible = false;
        
        this.gradientGroup.add(this.hoverGradientGroup);
        
        // Create info panel for gradient values
        this.createGradientInfoPanel();
    }

    /**
     * Create information panel for gradient values
     */
    createGradientInfoPanel() {
        this.gradientInfoPanel = document.createElement('div');
        this.gradientInfoPanel.style.position = 'absolute';
        this.gradientInfoPanel.style.bottom = '120px';
        this.gradientInfoPanel.style.right = '10px';
        this.gradientInfoPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.gradientInfoPanel.style.color = 'white';
        this.gradientInfoPanel.style.padding = '12px';
        this.gradientInfoPanel.style.borderRadius = '8px';
        this.gradientInfoPanel.style.fontSize = '11px';
        this.gradientInfoPanel.style.fontFamily = 'monospace';
        this.gradientInfoPanel.style.border = '1px solid #444';
        this.gradientInfoPanel.style.maxWidth = '250px';
        this.gradientInfoPanel.style.zIndex = '1000';
        this.gradientInfoPanel.style.display = 'none';
        this.gradientInfoPanel.style.userSelect = 'none';
        this.gradientInfoPanel.style.pointerEvents = 'none';
        
        document.body.appendChild(this.gradientInfoPanel);
    }

    /**
     * Calculate numerical partial derivatives at a point
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} t - Time parameter
     * @param {number} A - Amplitude
     * @param {number} ω - Omega
     * @returns {Object} Gradient information
     */
    calculateGradient(x, y, t = 0, A = 1, ω = 0.5) {
        const h = this.deltaH;
        
        // Function value at the point
        const f = this.surface.calculateZ(x, y, A, ω, t);
        
        // First derivatives (gradient)
        const fx = (this.surface.calculateZ(x + h, y, A, ω, t) - 
                   this.surface.calculateZ(x - h, y, A, ω, t)) / (2 * h);
        const fy = (this.surface.calculateZ(x, y + h, A, ω, t) - 
                   this.surface.calculateZ(x, y - h, A, ω, t)) / (2 * h);
        
        // Second derivatives (Hessian matrix)
        const fxx = (this.surface.calculateZ(x + h, y, A, ω, t) - 
                    2 * f + 
                    this.surface.calculateZ(x - h, y, A, ω, t)) / (h * h);
        const fyy = (this.surface.calculateZ(x, y + h, A, ω, t) - 
                    2 * f + 
                    this.surface.calculateZ(x, y - h, A, ω, t)) / (h * h);
        const fxy = (this.surface.calculateZ(x + h, y + h, A, ω, t) - 
                    this.surface.calculateZ(x + h, y - h, A, ω, t) - 
                    this.surface.calculateZ(x - h, y + h, A, ω, t) + 
                    this.surface.calculateZ(x - h, y - h, A, ω, t)) / (4 * h * h);
        
        // Third derivatives
        const fxxx = (this.surface.calculateZ(x + 2*h, y, A, ω, t) - 
                     2 * this.surface.calculateZ(x + h, y, A, ω, t) + 
                     2 * this.surface.calculateZ(x - h, y, A, ω, t) - 
                     this.surface.calculateZ(x - 2*h, y, A, ω, t)) / (2 * h * h * h);
        const fyyy = (this.surface.calculateZ(x, y + 2*h, A, ω, t) - 
                     2 * this.surface.calculateZ(x, y + h, A, ω, t) + 
                     2 * this.surface.calculateZ(x, y - h, A, ω, t) - 
                     this.surface.calculateZ(x, y - 2*h, A, ω, t)) / (2 * h * h * h);
        const fxxy = (this.surface.calculateZ(x + h, y + h, A, ω, t) - 
                     this.surface.calculateZ(x + h, y - h, A, ω, t) - 
                     2 * this.surface.calculateZ(x, y + h, A, ω, t) + 
                     2 * this.surface.calculateZ(x, y - h, A, ω, t) + 
                     this.surface.calculateZ(x - h, y + h, A, ω, t) - 
                     this.surface.calculateZ(x - h, y - h, A, ω, t)) / (2 * h * h * h);
        const fxyy = (this.surface.calculateZ(x + h, y + h, A, ω, t) - 
                     2 * this.surface.calculateZ(x + h, y, A, ω, t) + 
                     this.surface.calculateZ(x + h, y - h, A, ω, t) - 
                     this.surface.calculateZ(x - h, y + h, A, ω, t) + 
                     2 * this.surface.calculateZ(x - h, y, A, ω, t) - 
                     this.surface.calculateZ(x - h, y - h, A, ω, t)) / (2 * h * h * h);
        
        // Gradient magnitude and direction
        const gradMagnitude = Math.sqrt(fx * fx + fy * fy);
        const gradDirection = Math.atan2(fy, fx);
        
        // Laplacian (divergence of gradient)
        const laplacian = fxx + fyy;
        
        // Gaussian curvature (for 2nd derivatives)
        const gaussianCurvature = (fxx * fyy - fxy * fxy) / Math.pow(1 + fx*fx + fy*fy, 2);
        
        // Mean curvature
        const meanCurvature = ((1 + fy*fy) * fxx - 2*fx*fy*fxy + (1 + fx*fx) * fyy) / 
                             (2 * Math.pow(1 + fx*fx + fy*fy, 1.5));
        
        return {
            point: { x, y, z: f },
            first: { fx, fy, magnitude: gradMagnitude, direction: gradDirection },
            second: { fxx, fyy, fxy, gaussian: gaussianCurvature, mean: meanCurvature, laplacian },
            third: { fxxx, fyyy, fxxy, fxyy }
        };
    }

    /**
     * Update hover gradient visualization
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    updateHoverGradient(x, y) {
        if (!this.isActive) return;
        
        const config = this.surface.config;
        const gradient = this.calculateGradient(
            x, y, 
            config.animation.time,
            config.animation.amplitude,
            config.animation.omega
        );
        
        // Update hover point
        this.hoverPoint = gradient.point;
        
        // Update arrow visualization based on current mode
        this.updateHoverArrow(gradient);
        
        // Update info panel
        this.updateGradientInfo(gradient);
        
        this.hoverGradientGroup.visible = true;
    }

    /**
     * Update hover arrow based on gradient mode
     * @param {Object} gradient - Gradient information
     */
    updateHoverArrow(gradient) {
        const { point, first, second } = gradient;
        
        // Position at surface point
        this.hoverGradientGroup.position.set(point.x, point.y, point.z);
        
        if (this.currentMode === GRADIENT_MODES.FIRST_DERIVATIVE) {
            // Show gradient vector
            const magnitude = first.magnitude;
            const direction = first.direction;
            
            // Scale arrow based on gradient magnitude
            const arrowLength = Math.min(magnitude * this.vectorScale, 2.0);
            
            // Position arrow components
            this.hoverShaft.scale.set(1, arrowLength, 1);
            this.hoverShaft.position.set(0, arrowLength / 2, 0);
            this.hoverArrow.position.set(0, arrowLength, 0);
            
            // Rotate to point in gradient direction
            this.hoverGradientGroup.rotation.set(0, 0, -direction);
            
            // Color based on magnitude
            const normalizedMag = clamp(magnitude / 5.0, 0, 1);
            const color = new THREE.Color().setHSL(0.7 - normalizedMag * 0.7, 1, 0.5);
            this.hoverArrow.material.color = color;
            this.hoverShaft.material.color = color;
            
        } else if (this.currentMode === GRADIENT_MODES.SECOND_DERIVATIVE) {
            // Show curvature indicators
            const curvature = Math.abs(second.mean);
            const arrowLength = Math.min(curvature * this.vectorScale * 10, 2.0);
            
            // Scale and color based on curvature
            this.hoverShaft.scale.set(1, arrowLength, 1);
            this.hoverShaft.position.set(0, arrowLength / 2, 0);
            this.hoverArrow.position.set(0, arrowLength, 0);
            
            // Color: blue for negative curvature, red for positive
            const color = second.mean > 0 ? 
                new THREE.Color(1, 0.3, 0.3) : 
                new THREE.Color(0.3, 0.3, 1);
            this.hoverArrow.material.color = color;
            this.hoverShaft.material.color = color;
        }
    }

    /**
     * Update gradient information panel
     * @param {Object} gradient - Gradient information
     */
    updateGradientInfo(gradient) {
        if (!this.gradientInfoPanel) return;
        
        const { point, first, second, third } = gradient;
        
        let content = `<div><strong>🧮 Gradient Analysis</strong></div>`;
        content += `<div style="margin-top: 8px;"><strong>Point:</strong></div>`;
        content += `<div>x: ${point.x.toFixed(3)}</div>`;
        content += `<div>y: ${point.y.toFixed(3)}</div>`;
        content += `<div>z: ${point.z.toFixed(3)}</div>`;
        
        if (this.currentMode === GRADIENT_MODES.FIRST_DERIVATIVE) {
            content += `<div style="margin-top: 8px;"><strong>∇f (Gradient):</strong></div>`;
            content += `<div>∂f/∂x: ${first.fx.toFixed(4)}</div>`;
            content += `<div>∂f/∂y: ${first.fy.toFixed(4)}</div>`;
            content += `<div>|∇f|: ${first.magnitude.toFixed(4)}</div>`;
            content += `<div>Direction: ${(first.direction * 180 / Math.PI).toFixed(1)}°</div>`;
            
        } else if (this.currentMode === GRADIENT_MODES.SECOND_DERIVATIVE) {
            content += `<div style="margin-top: 8px;"><strong>Hessian Matrix:</strong></div>`;
            content += `<div>∂²f/∂x²: ${second.fxx.toFixed(4)}</div>`;
            content += `<div>∂²f/∂y²: ${second.fyy.toFixed(4)}</div>`;
            content += `<div>∂²f/∂x∂y: ${second.fxy.toFixed(4)}</div>`;
            content += `<div style="margin-top: 4px;"><strong>Curvature:</strong></div>`;
            content += `<div>Gaussian: ${second.gaussian.toFixed(4)}</div>`;
            content += `<div>Mean: ${second.mean.toFixed(4)}</div>`;
            content += `<div>Laplacian: ${second.laplacian.toFixed(4)}</div>`;
            
        } else if (this.currentMode === GRADIENT_MODES.THIRD_DERIVATIVE) {
            content += `<div style="margin-top: 8px;"><strong>3rd Derivatives:</strong></div>`;
            content += `<div>∂³f/∂x³: ${third.fxxx.toFixed(4)}</div>`;
            content += `<div>∂³f/∂y³: ${third.fyyy.toFixed(4)}</div>`;
            content += `<div>∂³f/∂x²∂y: ${third.fxxy.toFixed(4)}</div>`;
            content += `<div>∂³f/∂x∂y²: ${third.fxyy.toFixed(4)}</div>`;
        }
        
        this.gradientInfoPanel.innerHTML = content;
        this.gradientInfoPanel.style.display = 'block';
    }

    /**
     * Hide hover gradient visualization
     */
    hideHoverGradient() {
        this.hoverGradientGroup.visible = false;
        if (this.gradientInfoPanel) {
            this.gradientInfoPanel.style.display = 'none';
        }
    }

    /**
     * Generate vector field visualization across the surface
     */
    generateVectorField() {
        // Clear existing vectors
        this.clearVectorField();
        
        if (!this.showVectors || !this.isActive) return;
        
        const { domain, resolution } = this.surface.config;
        const config = this.surface.config;
        
        // Calculate sampling density based on vector density setting
        const sampleStepX = (domain.xMax - domain.xMin) / (resolution.x * this.vectorDensity);
        const sampleStepY = (domain.yMax - domain.yMin) / (resolution.y * this.vectorDensity);
        
        // Generate vectors across the domain
        for (let x = domain.xMin; x <= domain.xMax; x += sampleStepX) {
            for (let y = domain.yMin; y <= domain.yMax; y += sampleStepY) {
                const gradient = this.calculateGradient(
                    x, y,
                    config.animation.time,
                    config.animation.amplitude,
                    config.animation.omega
                );
                
                this.createVectorArrow(gradient);
            }
        }
    }

    /**
     * Regenerate vector field (useful after formula changes)
     */
    regenerateVectorField() {
        if (this.isActive) {
            this.generateVectorField();
            console.log('Gradient vector field regenerated for new formula');
        }
    }

    /**
     * Create a vector arrow at specified position
     * @param {Object} gradient - Gradient information
     */
    createVectorArrow(gradient) {
        const { point, first, second } = gradient;
        
        if (this.currentMode === GRADIENT_MODES.FIRST_DERIVATIVE) {
            const magnitude = first.magnitude;
            if (magnitude < 0.01) return; // Skip very small gradients
            
            const arrowLength = Math.min(magnitude * this.vectorScale * 0.8, 1.5);
            const direction = first.direction;
            
            // Create arrow geometry
            const arrowGroup = new THREE.Group();
            
            // Calculate normalized magnitude for color
            const normalizedMag = clamp(magnitude / 5.0, 0, 1);
            const color = new THREE.Color().setHSL(0.7 - normalizedMag * 0.7, 1, 0.5);
            
            // Arrow shaft - thicker and longer
            const shaftLength = arrowLength * 0.85; // Shaft is 85% of total length
            const shaftGeometry = new THREE.CylinderGeometry(0.02, 0.02, shaftLength, 8);
            const shaftMaterial = new THREE.MeshBasicMaterial({ 
                color,
                transparent: true,
                opacity: 0.8
            });
            const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
            shaft.position.set(0, shaftLength / 2, 0);
            
            // Arrow head - bigger and positioned exactly at shaft end
            const headLength = arrowLength * 0.15; // Head is 15% of total length
            const headGeometry = new THREE.ConeGeometry(0.05, headLength, 8);
            const headMaterial = new THREE.MeshBasicMaterial({ 
                color,
                transparent: true,
                opacity: 0.8
            });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.set(0, shaftLength + headLength / 2, 0);
            
            arrowGroup.add(shaft);
            arrowGroup.add(head);
            
            // Rotate the group to align with +Z axis for lookAt
            arrowGroup.rotation.x = -Math.PI / 2;
            
            // Position and orient the entire arrow
            arrowGroup.position.set(point.x, point.y, point.z);
            
            // Create direction vector and apply rotation
            const dirVector = new THREE.Vector3(
                Math.cos(direction),
                Math.sin(direction),
                0
            );
            arrowGroup.lookAt(
                point.x + dirVector.x,
                point.y + dirVector.y,
                point.z + dirVector.z
            );
            
            this.vectorArrows.push(arrowGroup);
            this.gradientGroup.add(arrowGroup);
        }
    }

    /**
     * Clear vector field visualization
     */
    clearVectorField() {
        this.vectorArrows.forEach(arrow => {
            this.gradientGroup.remove(arrow);
            arrow.children.forEach(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        });
        this.vectorArrows = [];
    }

    /**
     * Set gradient visualization mode
     * @param {string} mode - Gradient mode
     */
    setMode(mode) {
        this.currentMode = mode;
        if (this.isActive) {
            this.generateVectorField();
        }
    }

    /**
     * Set vector scale
     * @param {number} scale - Vector scale multiplier
     */
    setVectorScale(scale) {
        this.vectorScale = scale;
        if (this.isActive) {
            this.generateVectorField();
        }
    }

    /**
     * Set vector density
     * @param {number} density - Vector density (0.1 to 1.0)
     */
    setVectorDensity(density) {
        this.vectorDensity = clamp(density, 0.1, 1.0);
        if (this.isActive) {
            this.generateVectorField();
        }
    }

    /**
     * Toggle vector visibility
     * @param {boolean} visible - Show vectors
     */
    setVectorVisible(visible) {
        this.showVectors = visible;
        if (this.isActive) {
            this.generateVectorField();
        }
    }

    /**
     * Activate gradient visualization
     */
    activate() {
        this.isActive = true;
        this.generateVectorField();
        console.log('Gradient tool activated');
    }

    /**
     * Deactivate gradient visualization
     */
    deactivate() {
        this.isActive = false;
        this.clearVectorField();
        this.hideHoverGradient();
        console.log('Gradient tool deactivated');
    }

    /**
     * Update for animation
     */
    update() {
        if (this.isActive && this.surface.config.animation.playing) {
            // Regenerate vector field for animation
            this.generateVectorField();
        }
    }

    /**
     * Cleanup resources
     */
    dispose() {
        this.clearVectorField();
        this.scene.remove(this.gradientGroup);
        
        if (this.gradientInfoPanel && this.gradientInfoPanel.parentElement) {
            this.gradientInfoPanel.parentElement.removeChild(this.gradientInfoPanel);
        }
    }
}
