/**
 * Axes, grid, and text labels
 */
import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { formatNumber } from './utils.js';

/**
 * Labels and axes manager class
 */
export class LabelsManager {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        
        // Setup CSS2D renderer for labels
        this.setupCSS2DRenderer();
        
        // Create groups for organization
        this.axesGroup = new THREE.Group();
        this.gridGroup = new THREE.Group();
        this.labelsGroup = new THREE.Group();
        
        this.scene.add(this.axesGroup);
        this.scene.add(this.gridGroup);
        this.scene.add(this.labelsGroup);
        
        this.domain = {
            xMin: -6 * Math.PI,
            xMax: 6 * Math.PI,
            yMin: -6 * Math.PI,
            yMax: 6 * Math.PI
        };
        
        this.showAxes = true;
        this.showGrid = true;
        this.showLabels = true;
        
        this.createAxes();
        this.createGrid();
        this.createLabels();
    }

    /**
     * Setup CSS2D renderer for text labels
     */
    setupCSS2DRenderer() {
        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = '0px';
        this.labelRenderer.domElement.style.pointerEvents = 'none';
        this.labelRenderer.domElement.style.zIndex = '100';
        
        document.body.appendChild(this.labelRenderer.domElement);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    /**
     * Create coordinate axes
     */
    createAxes() {
        this.clearAxes();
        
        if (!this.showAxes) return;
        
        const axisLength = Math.max(
            Math.abs(this.domain.xMax - this.domain.xMin),
            Math.abs(this.domain.yMax - this.domain.yMin)
        ) * 0.6;
        
        // X-axis (darker red for white background)
        const xAxisGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-axisLength, 0, 0),
            new THREE.Vector3(axisLength, 0, 0)
        ]);
        const xAxisMaterial = new THREE.LineBasicMaterial({ color: 0xcc0000, linewidth: 3 });
        const xAxis = new THREE.Line(xAxisGeometry, xAxisMaterial);
        this.axesGroup.add(xAxis);
        
        // X-axis arrow
        const xArrowGeometry = new THREE.ConeGeometry(0.3, 1, 8);
        const xArrowMaterial = new THREE.MeshBasicMaterial({ color: 0xcc0000 });
        const xArrow = new THREE.Mesh(xArrowGeometry, xArrowMaterial);
        xArrow.position.set(axisLength, 0, 0);
        xArrow.rotateZ(-Math.PI / 2);
        this.axesGroup.add(xArrow);
        
        // Y-axis (darker green for white background)
        const yAxisGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, -axisLength, 0),
            new THREE.Vector3(0, axisLength, 0)
        ]);
        const yAxisMaterial = new THREE.LineBasicMaterial({ color: 0x00aa00, linewidth: 3 });
        const yAxis = new THREE.Line(yAxisGeometry, yAxisMaterial);
        this.axesGroup.add(yAxis);
        
        // Y-axis arrow
        const yArrowGeometry = new THREE.ConeGeometry(0.3, 1, 8);
        const yArrowMaterial = new THREE.MeshBasicMaterial({ color: 0x00aa00 });
        const yArrow = new THREE.Mesh(yArrowGeometry, yArrowMaterial);
        yArrow.position.set(0, axisLength, 0);
        this.axesGroup.add(yArrow);
        
        // Z-axis (darker blue for white background)
        const zAxisGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, -5),
            new THREE.Vector3(0, 0, 5)
        ]);
        const zAxisMaterial = new THREE.LineBasicMaterial({ color: 0x0000cc, linewidth: 3 });
        const zAxis = new THREE.Line(zAxisGeometry, zAxisMaterial);
        this.axesGroup.add(zAxis);
        
        // Z-axis arrow
        const zArrowGeometry = new THREE.ConeGeometry(0.3, 1, 8);
        const zArrowMaterial = new THREE.MeshBasicMaterial({ color: 0x0000cc });
        const zArrow = new THREE.Mesh(zArrowGeometry, zArrowMaterial);
        zArrow.position.set(0, 0, 5);
        zArrow.rotateX(Math.PI / 2);
        this.axesGroup.add(zArrow);
    }

    /**
     * Create grid at z=0
     */
    createGrid() {
        this.clearGrid();
        
        if (!this.showGrid) return;
        
        const { xMin, xMax, yMin, yMax } = this.domain;
        
        // Create grid lines with darker colors for white background
        const gridMaterial = new THREE.LineBasicMaterial({
            color: 0x999999,
            transparent: true,
            opacity: 0.4
        });
        
        const majorGridMaterial = new THREE.LineBasicMaterial({
            color: 0x555555,
            transparent: true,
            opacity: 0.7
        });
        
        // Major grid lines (every π)
        const majorStep = Math.PI;
        
        // Vertical lines (constant x)
        for (let x = Math.ceil(xMin / majorStep) * majorStep; x <= xMax; x += majorStep) {
            if (Math.abs(x) < 0.01) continue; // Skip x=0 (axis)
            
            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(x, yMin, 0),
                new THREE.Vector3(x, yMax, 0)
            ]);
            
            const line = new THREE.Line(geometry, majorGridMaterial);
            this.gridGroup.add(line);
        }
        
        // Horizontal lines (constant y)
        for (let y = Math.ceil(yMin / majorStep) * majorStep; y <= yMax; y += majorStep) {
            if (Math.abs(y) < 0.01) continue; // Skip y=0 (axis)
            
            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(xMin, y, 0),
                new THREE.Vector3(xMax, y, 0)
            ]);
            
            const line = new THREE.Line(geometry, majorGridMaterial);
            this.gridGroup.add(line);
        }
        
        // Minor grid lines (every π/4)
        const minorStep = Math.PI / 4;
        
        // Minor vertical lines
        for (let x = Math.ceil(xMin / minorStep) * minorStep; x <= xMax; x += minorStep) {
            if (Math.abs(x % majorStep) < 0.01) continue; // Skip major lines
            if (Math.abs(x) < 0.01) continue; // Skip x=0
            
            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(x, yMin, 0),
                new THREE.Vector3(x, yMax, 0)
            ]);
            
            const line = new THREE.Line(geometry, gridMaterial);
            this.gridGroup.add(line);
        }
        
        // Minor horizontal lines
        for (let y = Math.ceil(yMin / minorStep) * minorStep; y <= yMax; y += minorStep) {
            if (Math.abs(y % majorStep) < 0.01) continue; // Skip major lines
            if (Math.abs(y) < 0.01) continue; // Skip y=0
            
            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(xMin, y, 0),
                new THREE.Vector3(xMax, y, 0)
            ]);
            
            const line = new THREE.Line(geometry, gridMaterial);
            this.gridGroup.add(line);
        }
    }

    /**
     * Create text labels
     */
    createLabels() {
        this.clearLabels();
        
        if (!this.showLabels) return;
        
        // Axis labels
        this.createAxisLabels();
        
        // Tick labels
        this.createTickLabels();
    }

    /**
     * Create axis labels (X, Y, Z)
     */
    createAxisLabels() {
        const axisLength = Math.max(
            Math.abs(this.domain.xMax - this.domain.xMin),
            Math.abs(this.domain.yMax - this.domain.yMin)
        ) * 0.6;
        
        // X label
        const xLabelDiv = document.createElement('div');
        xLabelDiv.className = 'axis-label';
        xLabelDiv.textContent = 'x';
        xLabelDiv.style.color = 'red';
        xLabelDiv.style.fontSize = '18px';
        xLabelDiv.style.fontWeight = 'bold';
        xLabelDiv.style.fontFamily = 'Arial, sans-serif';
        const xLabel = new CSS2DObject(xLabelDiv);
        xLabel.position.set(axisLength + 1, 0, 0);
        this.labelsGroup.add(xLabel);
        
        // Y label
        const yLabelDiv = document.createElement('div');
        yLabelDiv.className = 'axis-label';
        yLabelDiv.textContent = 'y';
        yLabelDiv.style.color = 'green';
        yLabelDiv.style.fontSize = '18px';
        yLabelDiv.style.fontWeight = 'bold';
        yLabelDiv.style.fontFamily = 'Arial, sans-serif';
        const yLabel = new CSS2DObject(yLabelDiv);
        yLabel.position.set(0, axisLength + 1, 0);
        this.labelsGroup.add(yLabel);
        
        // Z label
        const zLabelDiv = document.createElement('div');
        zLabelDiv.className = 'axis-label';
        zLabelDiv.textContent = 'z';
        zLabelDiv.style.color = 'blue';
        zLabelDiv.style.fontSize = '18px';
        zLabelDiv.style.fontWeight = 'bold';
        zLabelDiv.style.fontFamily = 'Arial, sans-serif';
        const zLabel = new CSS2DObject(zLabelDiv);
        zLabel.position.set(0, 0, 6);
        this.labelsGroup.add(zLabel);
    }

    /**
     * Create tick labels for major grid lines
     */
    createTickLabels() {
        const { xMin, xMax, yMin, yMax } = this.domain;
        const step = Math.PI;
        
        // X-axis tick labels
        for (let x = Math.ceil(xMin / step) * step; x <= xMax; x += step) {
            if (Math.abs(x) < 0.01) continue; // Skip origin
            
            const labelDiv = document.createElement('div');
            labelDiv.className = 'tick-label';
            labelDiv.textContent = formatNumber(x);
            labelDiv.style.color = 'white';
            labelDiv.style.fontSize = '12px';
            labelDiv.style.fontFamily = 'monospace';
            labelDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
            labelDiv.style.padding = '2px 4px';
            labelDiv.style.borderRadius = '2px';
            
            const label = new CSS2DObject(labelDiv);
            label.position.set(x, -1, 0);
            this.labelsGroup.add(label);
        }
        
        // Y-axis tick labels
        for (let y = Math.ceil(yMin / step) * step; y <= yMax; y += step) {
            if (Math.abs(y) < 0.01) continue; // Skip origin
            
            const labelDiv = document.createElement('div');
            labelDiv.className = 'tick-label';
            labelDiv.textContent = formatNumber(y);
            labelDiv.style.color = 'white';
            labelDiv.style.fontSize = '12px';
            labelDiv.style.fontFamily = 'monospace';
            labelDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
            labelDiv.style.padding = '2px 4px';
            labelDiv.style.borderRadius = '2px';
            
            const label = new CSS2DObject(labelDiv);
            label.position.set(-1, y, 0);
            this.labelsGroup.add(label);
        }
        
        // Origin label
        const originDiv = document.createElement('div');
        originDiv.className = 'origin-label';
        originDiv.textContent = '0';
        originDiv.style.color = 'white';
        originDiv.style.fontSize = '12px';
        originDiv.style.fontFamily = 'monospace';
        originDiv.style.backgroundColor = 'rgba(0,0,0,0.8)';
        originDiv.style.padding = '2px 4px';
        originDiv.style.borderRadius = '2px';
        
        const originLabel = new CSS2DObject(originDiv);
        originLabel.position.set(-1, -1, 0);
        this.labelsGroup.add(originLabel);
    }

    /**
     * Clear axes
     */
    clearAxes() {
        while (this.axesGroup.children.length > 0) {
            const child = this.axesGroup.children[0];
            this.axesGroup.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        }
    }

    /**
     * Clear grid
     */
    clearGrid() {
        while (this.gridGroup.children.length > 0) {
            const child = this.gridGroup.children[0];
            this.gridGroup.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        }
    }

    /**
     * Clear labels
     */
    clearLabels() {
        while (this.labelsGroup.children.length > 0) {
            const child = this.labelsGroup.children[0];
            this.labelsGroup.remove(child);
        }
    }

    /**
     * Update domain and regenerate grid/labels
     * @param {Object} newDomain - New domain settings
     */
    updateDomain(newDomain) {
        this.domain = { ...this.domain, ...newDomain };
        this.createAxes();
        this.createGrid();
        this.createLabels();
    }

    /**
     * Set axes visibility
     * @param {boolean} visible - Show axes
     */
    setAxesVisible(visible) {
        this.showAxes = visible;
        this.axesGroup.visible = visible;
        if (visible) this.createAxes();
    }

    /**
     * Set grid visibility
     * @param {boolean} visible - Show grid
     */
    setGridVisible(visible) {
        this.showGrid = visible;
        this.gridGroup.visible = visible;
        if (visible) this.createGrid();
    }

    /**
     * Set labels visibility
     * @param {boolean} visible - Show labels
     */
    setLabelsVisible(visible) {
        this.showLabels = visible;
        this.labelsGroup.visible = visible;
        if (visible) this.createLabels();
    }

    /**
     * Render labels (call in render loop)
     */
    render() {
        this.labelRenderer.render(this.scene, this.camera);
    }

    /**
     * Cleanup resources
     */
    dispose() {
        this.clearAxes();
        this.clearGrid();
        this.clearLabels();
        
        this.scene.remove(this.axesGroup);
        this.scene.remove(this.gridGroup);
        this.scene.remove(this.labelsGroup);
        
        if (this.labelRenderer.domElement.parentElement) {
            this.labelRenderer.domElement.parentElement.removeChild(this.labelRenderer.domElement);
        }
    }
}
