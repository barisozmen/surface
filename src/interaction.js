/**
 * Mouse interaction and raycasting functionality
 */
import * as THREE from 'three';
import { formatNumber } from './utils.js';

/**
 * Interaction manager class
 */
export class InteractionManager {
    constructor(scene, camera, renderer, surfaceGenerator) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.surface = surfaceGenerator;
        this.gradient = null;
        
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.isMouseOverCanvas = false;
        
        // Point marker
        this.pointMarker = null;
        this.markerPosition = new THREE.Vector3(0, 0, 0);
        this.showMarker = false;
        
        // Tooltip
        this.tooltip = this.createTooltip();
        this.showTooltip = true;
        
        this.setupEventListeners();
    }

    /**
     * Create tooltip element
     */
    createTooltip() {
        const tooltip = document.createElement('div');
        tooltip.style.position = 'absolute';
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '8px 12px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '12px';
        tooltip.style.fontFamily = 'monospace';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.zIndex = '1000';
        tooltip.style.display = 'none';
        tooltip.style.border = '1px solid #444';
        tooltip.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        
        document.body.appendChild(tooltip);
        return tooltip;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const canvas = this.renderer.domElement;
        
        canvas.addEventListener('mousemove', (event) => this.onMouseMove(event));
        canvas.addEventListener('mouseenter', () => this.isMouseOverCanvas = true);
        canvas.addEventListener('mouseleave', () => {
            this.isMouseOverCanvas = false;
            this.hideTooltip();
        });
        canvas.addEventListener('click', (event) => this.onMouseClick(event));
    }

    /**
     * Handle mouse move for raycasting
     * @param {MouseEvent} event - Mouse event
     */
    onMouseMove(event) {
        if (!this.isMouseOverCanvas) return;
        
        // Update mouse coordinates
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Perform raycasting
        this.updateRaycast();
        
        // Update tooltip position
        if (this.showTooltip) {
            this.tooltip.style.left = (event.clientX + 10) + 'px';
            this.tooltip.style.top = (event.clientY - 30) + 'px';
        }
    }

    /**
     * Handle mouse click
     * @param {MouseEvent} event - Mouse event
     */
    onMouseClick(event) {
        if (!this.isMouseOverCanvas) return;
        
        // Update mouse coordinates
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Perform raycasting and place marker
        const intersection = this.performRaycast();
        if (intersection) {
            this.setMarkerPosition(intersection.point.x, intersection.point.y);
            console.log(`Clicked at: (${formatNumber(intersection.point.x)}, ${formatNumber(intersection.point.y)}, ${formatNumber(intersection.point.z)})`);
        }
    }

    /**
     * Update raycasting for tooltip
     */
    updateRaycast() {
        if (!this.showTooltip) return;
        
        const intersection = this.performRaycast();
        
        if (intersection) {
            this.showTooltipAt(intersection.point);
            
            // Update gradient visualization if gradient tool is active
            if (this.gradient && this.gradient.isActive) {
                this.gradient.updateHoverGradient(intersection.point.x, intersection.point.y);
            }
        } else {
            this.hideTooltip();
            
            // Hide gradient visualization
            if (this.gradient && this.gradient.isActive) {
                this.gradient.hideHoverGradient();
            }
        }
    }

    /**
     * Perform raycast against surface
     * @returns {Object|null} Intersection object or null
     */
    performRaycast() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Get surface mesh
        const surfaceMesh = this.surface.surfaceMesh;
        if (!surfaceMesh) return null;
        
        const intersects = this.raycaster.intersectObject(surfaceMesh);
        
        if (intersects.length > 0) {
            return intersects[0];
        }
        
        return null;
    }

    /**
     * Show tooltip at world position
     * @param {THREE.Vector3} worldPosition - World position
     */
    showTooltipAt(worldPosition) {
        const x = worldPosition.x;
        const y = worldPosition.y;
        const z = worldPosition.z;
        
        this.tooltip.innerHTML = `
            <div><strong>Position:</strong></div>
            <div>x: ${formatNumber(x)}</div>
            <div>y: ${formatNumber(y)}</div>
            <div>z: ${z.toFixed(3)}</div>
        `;
        
        this.tooltip.style.display = 'block';
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
        this.tooltip.style.display = 'none';
    }

    /**
     * Create point marker geometry
     */
    createPointMarker() {
        if (this.pointMarker) {
            this.scene.remove(this.pointMarker);
            this.pointMarker.geometry.dispose();
            this.pointMarker.material.dispose();
        }
        
        const geometry = new THREE.SphereGeometry(0.2, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.8
        });
        
        this.pointMarker = new THREE.Mesh(geometry, material);
        this.scene.add(this.pointMarker);
        
        // Add a wireframe outline
        const wireframeGeometry = new THREE.EdgesGeometry(geometry);
        const wireframeMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.6
        });
        const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
        this.pointMarker.add(wireframe);
        
        this.updateMarkerPosition();
    }

    /**
     * Set marker position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    setMarkerPosition(x, y) {
        this.markerPosition.x = x;
        this.markerPosition.y = y;
        
        // Calculate Z value from surface function
        const config = this.surface.config;
        this.markerPosition.z = this.surface.calculateZ(
            x, y,
            config.animation.amplitude,
            config.animation.omega,
            config.animation.time
        );
        
        if (!this.pointMarker && this.showMarker) {
            this.createPointMarker();
        }
        
        this.updateMarkerPosition();
    }

    /**
     * Update marker position on surface
     */
    updateMarkerPosition() {
        if (!this.pointMarker || !this.showMarker) return;
        
        // Recalculate Z for current animation state
        const config = this.surface.config;
        this.markerPosition.z = this.surface.calculateZ(
            this.markerPosition.x,
            this.markerPosition.y,
            config.animation.amplitude,
            config.animation.omega,
            config.animation.time
        );
        
        this.pointMarker.position.copy(this.markerPosition);
        this.pointMarker.visible = this.showMarker;
    }

    /**
     * Set marker visibility
     * @param {boolean} visible - Show marker
     */
    setMarkerVisible(visible) {
        this.showMarker = visible;
        
        if (visible && !this.pointMarker) {
            this.createPointMarker();
        } else if (this.pointMarker) {
            this.pointMarker.visible = visible;
        }
    }

    /**
     * Set tooltip visibility
     * @param {boolean} visible - Show tooltip
     */
    setTooltipVisible(visible) {
        this.showTooltip = visible;
        if (!visible) {
            this.hideTooltip();
        }
    }

    /**
     * Set gradient visualizer reference
     * @param {GradientVisualizer} gradientVisualizer - Gradient visualizer instance
     */
    setGradientVisualizer(gradientVisualizer) {
        this.gradient = gradientVisualizer;
    }

    /**
     * Get current marker position
     * @returns {Object} Marker position
     */
    getMarkerPosition() {
        return {
            x: this.markerPosition.x,
            y: this.markerPosition.y,
            z: this.markerPosition.z
        };
    }

    /**
     * Update marker for animation (call in render loop)
     */
    update() {
        if (this.showMarker && this.pointMarker) {
            this.updateMarkerPosition();
        }
    }

    /**
     * Cleanup resources
     */
    dispose() {
        if (this.pointMarker) {
            this.scene.remove(this.pointMarker);
            this.pointMarker.geometry.dispose();
            this.pointMarker.material.dispose();
        }
        
        if (this.tooltip && this.tooltip.parentElement) {
            this.tooltip.parentElement.removeChild(this.tooltip);
        }
        
        // Remove event listeners
        const canvas = this.renderer.domElement;
        canvas.removeEventListener('mousemove', this.onMouseMove);
        canvas.removeEventListener('mouseenter', () => {});
        canvas.removeEventListener('mouseleave', () => {});
        canvas.removeEventListener('click', this.onMouseClick);
    }
}
