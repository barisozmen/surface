/**
 * GUI controls and interface
 */
import * as dat from 'dat.gui';
import { COLOR_MAP_TYPES } from './colormap.js';
import { getFormulaPresetNames, FORMULA_PRESETS } from './formula.js';

/**
 * GUI controller class
 */
export class GUIController {
    constructor(surfaceGenerator, sceneManager, performanceMonitor) {
        this.surface = surfaceGenerator;
        this.scene = sceneManager;
        this.performance = performanceMonitor;
        this.interaction = null;
        this.export = null;
        
        this.gui = new dat.GUI({ width: 300 });
        this.gui.domElement.style.position = 'absolute';
        this.gui.domElement.style.top = '10px';
        this.gui.domElement.style.left = '10px';
        this.gui.domElement.style.zIndex = '1000';
        
        this.params = this.createParameters();
        this.setupGUI();
        this.setupKeyboardShortcuts();
    }

    /**
     * Create parameter object for GUI
     */
    createParameters() {
        return {
            // Domain controls
            xMin: -6 * Math.PI,
            xMax: 6 * Math.PI,
            yMin: -6 * Math.PI,
            yMax: 6 * Math.PI,
            
            // Resolution controls
            resolutionX: 120,
            resolutionY: 120,
            
            // Animation controls
            amplitude: 1.0,
            omega: 0.5,
            playing: false,
            timeWarp: false,
            
            // Rendering controls
            colorMap: COLOR_MAP_TYPES.RGB_SPATIAL, // Start with educational RGB mapping
            wireframe: true,
            wireframeOpacity: 0.8, // More visible wireframe
            showSurface: true,
            surfaceOpacity: 0.6, // Semi-transparent surface
            grayBelowZero: true, // Gray coloring for below-zero parts
            
            // Lighting controls
            ambientIntensity: 0.3,
            directionalIntensity: 0.8,
            animateLights: false, // Disabled for consistent lighting
            
            // Grid and labels
            showGrid: true,
            showLabels: true,
            showAxes: true,
            
            // Performance
            performanceMode: true, // Default to performance mode
            showStats: true,
            
            // Point marker
            markerX: 0,
            markerY: 0,
            showMarker: false,
            
            // Formula controls
            formulaPreset: 'sin(x) * cos(y)',
            customFormula: 'A * sin(x + ω*t) * cos(y - ω*t)',
            
            // Actions
            resetDefaults: () => this.resetToDefaults(),
            exportPNG: () => this.exportPNG(),
            exportParams: () => this.exportParameters(),
            importParams: () => this.importParameters(),
            exportSession: () => this.exportSession()
        };
    }

    /**
     * Setup GUI panels and controls
     */
    setupGUI() {
        // Domain folder
        const domainFolder = this.gui.addFolder('Domain');
        domainFolder.add(this.params, 'xMin', -10 * Math.PI, 0)
            .name('X Min')
            .onChange(() => this.updateDomain());
        domainFolder.add(this.params, 'xMax', 0, 10 * Math.PI)
            .name('X Max')
            .onChange(() => this.updateDomain());
        domainFolder.add(this.params, 'yMin', -10 * Math.PI, 0)
            .name('Y Min')
            .onChange(() => this.updateDomain());
        domainFolder.add(this.params, 'yMax', 0, 10 * Math.PI)
            .name('Y Max')
            .onChange(() => this.updateDomain());
        domainFolder.open();

        // Resolution folder
        const resolutionFolder = this.gui.addFolder('Resolution');
        resolutionFolder.add(this.params, 'resolutionX', 20, 600, 1)
            .name('X Segments')
            .onChange(() => this.updateResolution());
        resolutionFolder.add(this.params, 'resolutionY', 20, 600, 1)
            .name('Y Segments')
            .onChange(() => this.updateResolution());
        resolutionFolder.open();

        // Animation folder
        const animationFolder = this.gui.addFolder('Animation');
        animationFolder.add(this.params, 'amplitude', 0, 3)
            .name('Amplitude')
            .onChange(() => this.updateAnimation());
        animationFolder.add(this.params, 'omega', 0, 2)
            .name('Angular Speed (ω)')
            .onChange(() => this.updateAnimation());
        animationFolder.add(this.params, 'playing')
            .name('Play Animation')
            .onChange(() => this.updateAnimation());
        animationFolder.add(this.params, 'timeWarp')
            .name('Time Warp Mode')
            .onChange(() => this.updateAnimation());
        animationFolder.open();

        // Rendering folder
        const renderingFolder = this.gui.addFolder('Rendering');
        
        // Color map options with educational names
        const colorMapOptions = {
            'RGB Spatial (X=Red, Y=Green, Z=Blue)': COLOR_MAP_TYPES.RGB_SPATIAL,
            'HSV Height (Position=Hue, Height=Brightness)': COLOR_MAP_TYPES.HSV_HEIGHT,
            'Terrain (Natural Elevation Colors)': COLOR_MAP_TYPES.TERRAIN,
            'Coordinate Grid (Highlights X/Y/Z=0)': COLOR_MAP_TYPES.COORDINATE_GRID,
            'Viridis (Perceptually Uniform)': COLOR_MAP_TYPES.VIRIDIS,
            'Inferno (Warm Colors)': COLOR_MAP_TYPES.INFERNO,
            'Cool-Warm (Blue to Red)': COLOR_MAP_TYPES.COOL_WARM,
            'Grayscale': COLOR_MAP_TYPES.GRAYSCALE
        };
        
        renderingFolder.add(this.params, 'colorMap', colorMapOptions)
            .name('Color Scheme')
            .onChange(() => {
                this.surface.updateColorMap(this.params.colorMap);
                this.updateColorLegend();
            });
        renderingFolder.add(this.params, 'grayBelowZero')
            .name('Gray Below Zero')
            .onChange(() => this.surface.setGrayBelowZero(this.params.grayBelowZero));
        renderingFolder.add(this.params, 'wireframe')
            .name('Show Wireframe')
            .onChange(() => this.surface.setWireframeVisible(this.params.wireframe));
        renderingFolder.add(this.params, 'wireframeOpacity', 0, 1)
            .name('Wireframe Opacity')
            .onChange(() => this.surface.setWireframeOpacity(this.params.wireframeOpacity));
        renderingFolder.add(this.params, 'surfaceOpacity', 0, 1)
            .name('Surface Transparency')
            .onChange(() => this.surface.setSurfaceOpacity(this.params.surfaceOpacity));
        renderingFolder.add(this.params, 'showSurface')
            .name('Show Surface')
            .onChange(() => this.surface.setSurfaceVisible(this.params.showSurface));
        renderingFolder.open();

        // Lighting folder
        const lightingFolder = this.gui.addFolder('Lighting');
        lightingFolder.add(this.params, 'ambientIntensity', 0, 1)
            .name('Ambient Light')
            .onChange(() => this.updateLighting());
        lightingFolder.add(this.params, 'directionalIntensity', 0, 2)
            .name('Directional Light')
            .onChange(() => this.updateLighting());
        lightingFolder.add(this.params, 'animateLights')
            .name('Animate Lights')
            .onChange(() => this.scene.setLightAnimation(this.params.animateLights));

        // Display folder
        const displayFolder = this.gui.addFolder('Display');
        displayFolder.add(this.params, 'showGrid')
            .name('Show Grid');
        displayFolder.add(this.params, 'showLabels')
            .name('Show Labels');
        displayFolder.add(this.params, 'showAxes')
            .name('Show Axes');

        // Performance folder
        const performanceFolder = this.gui.addFolder('Performance');
        performanceFolder.add(this.params, 'performanceMode')
            .name('Performance Mode')
            .onChange(() => this.updatePerformanceMode());
        performanceFolder.add(this.params, 'showStats')
            .name('Show FPS Stats')
            .onChange(() => this.toggleStats());

        // Create modal formula selector instead of folder
        this.createModalFormulaSelector();

        // Point Marker folder
        const markerFolder = this.gui.addFolder('Point Marker');
        markerFolder.add(this.params, 'markerX', -10 * Math.PI, 10 * Math.PI)
            .name('X Position')
            .onChange(() => this.updateMarker());
        markerFolder.add(this.params, 'markerY', -10 * Math.PI, 10 * Math.PI)
            .name('Y Position')
            .onChange(() => this.updateMarker());
        markerFolder.add(this.params, 'showMarker')
            .name('Show Marker')
            .onChange(() => this.updateMarker());

        // Actions folder
        const actionsFolder = this.gui.addFolder('Actions');
        actionsFolder.add(this.params, 'resetDefaults').name('Reset to Defaults');
        actionsFolder.add(this.params, 'exportPNG').name('Export PNG');
        actionsFolder.add(this.params, 'exportParams').name('Export Parameters');
        actionsFolder.add(this.params, 'importParams').name('Import Parameters');
        actionsFolder.add(this.params, 'exportSession').name('Export Session');

        // Add info display
        this.createInfoDisplay();
        
        // Add color legend
        this.createColorLegend();
    }

    /**
     * Create information display
     */
    createInfoDisplay() {
        this.infoElement = document.createElement('div');
        this.infoElement.style.position = 'absolute';
        this.infoElement.style.bottom = '10px';
        this.infoElement.style.right = '10px'; // Moved to right side
        this.infoElement.style.color = 'white';
        this.infoElement.style.fontSize = '12px';
        this.infoElement.style.fontFamily = 'monospace';
        this.infoElement.style.backgroundColor = 'rgba(0,0,0,0.7)';
        this.infoElement.style.padding = '10px';
        this.infoElement.style.borderRadius = '5px';
        this.infoElement.style.zIndex = '1000';
        this.infoElement.style.userSelect = 'none';
        this.infoElement.style.pointerEvents = 'none';
        this.infoElement.innerHTML = `
            <div><strong>Controls:</strong></div>
            <div>Mouse: Rotate, Zoom, Pan</div>
            <div>Space: Play/Pause Animation</div>
            <div>R: Reset View</div>
            <div>G: Toggle GUI</div>
        `;
        
        document.body.appendChild(this.infoElement);
    }

    /**
     * Create modal formula selector
     */
    createModalFormulaSelector() {
        // Create the toggle button
        this.formulaToggleButton = document.createElement('div');
        this.formulaToggleButton.style.position = 'absolute';
        this.formulaToggleButton.style.top = '20px';
        this.formulaToggleButton.style.left = '50%';
        this.formulaToggleButton.style.transform = 'translateX(-50%)';
        this.formulaToggleButton.style.backgroundColor = 'rgba(40, 40, 40, 0.95)';
        this.formulaToggleButton.style.color = 'white';
        this.formulaToggleButton.style.padding = '12px 20px';
        this.formulaToggleButton.style.borderRadius = '8px';
        this.formulaToggleButton.style.cursor = 'pointer';
        this.formulaToggleButton.style.fontSize = '14px';
        this.formulaToggleButton.style.fontFamily = 'Arial, sans-serif';
        this.formulaToggleButton.style.fontWeight = 'bold';
        this.formulaToggleButton.style.zIndex = '1001';
        this.formulaToggleButton.style.border = '2px solid #555';
        this.formulaToggleButton.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        this.formulaToggleButton.style.transition = 'all 0.3s ease';
        this.formulaToggleButton.style.userSelect = 'none';
        
        // Create the modal overlay
        this.formulaModalOverlay = document.createElement('div');
        this.formulaModalOverlay.style.position = 'fixed';
        this.formulaModalOverlay.style.top = '0';
        this.formulaModalOverlay.style.left = '0';
        this.formulaModalOverlay.style.width = '100%';
        this.formulaModalOverlay.style.height = '100%';
        this.formulaModalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.formulaModalOverlay.style.display = 'none';
        this.formulaModalOverlay.style.zIndex = '1002';
        this.formulaModalOverlay.style.backdropFilter = 'blur(3px)';
        
        // Create the modal content
        this.formulaModal = document.createElement('div');
        this.formulaModal.style.position = 'absolute';
        this.formulaModal.style.top = '50%';
        this.formulaModal.style.left = '50%';
        this.formulaModal.style.transform = 'translate(-50%, -50%)';
        this.formulaModal.style.backgroundColor = 'rgba(30, 30, 30, 0.95)';
        this.formulaModal.style.color = 'white';
        this.formulaModal.style.padding = '30px';
        this.formulaModal.style.borderRadius = '15px';
        this.formulaModal.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
        this.formulaModal.style.border = '2px solid #666';
        this.formulaModal.style.fontFamily = 'Arial, sans-serif';
        this.formulaModal.style.maxWidth = '600px';
        this.formulaModal.style.minWidth = '500px';
        this.formulaModal.style.maxHeight = '80vh';
        this.formulaModal.style.overflowY = 'auto';
        
        this.updateFormulaButton();
        
        // Event listeners
        this.formulaToggleButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFormulaModal();
        });
        
        this.formulaModalOverlay.addEventListener('click', () => {
            this.hideFormulaModal();
        });
        
        this.formulaModal.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Hover effects for button
        this.formulaToggleButton.addEventListener('mouseenter', () => {
            this.formulaToggleButton.style.backgroundColor = 'rgba(60, 60, 60, 0.95)';
            this.formulaToggleButton.style.transform = 'translateX(-50%) scale(1.05)';
            this.formulaToggleButton.style.borderColor = '#4CAF50';
            this.formulaToggleButton.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.3)';
        });
        
        this.formulaToggleButton.addEventListener('mouseleave', () => {
            this.formulaToggleButton.style.backgroundColor = 'rgba(40, 40, 40, 0.95)';
            this.formulaToggleButton.style.transform = 'translateX(-50%) scale(1)';
            this.formulaToggleButton.style.borderColor = '#555';
            this.formulaToggleButton.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        });
        
        document.body.appendChild(this.formulaToggleButton);
        document.body.appendChild(this.formulaModalOverlay);
        this.formulaModalOverlay.appendChild(this.formulaModal);
    }

    /**
     * Update formula button text
     */
    updateFormulaButton() {
        const currentPreset = this.params.formulaPreset;
        const presetInfo = FORMULA_PRESETS[currentPreset];
        this.formulaToggleButton.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 16px; margin-bottom: 4px;">📊 Current Formula</div>
                <div style="font-size: 12px; color: #aaa;">${presetInfo ? presetInfo.name : currentPreset}</div>
                <div style="font-size: 11px; color: #888; font-family: monospace; margin-top: 2px;">${presetInfo ? presetInfo.formula : 'Custom'}</div>
                <div style="font-size: 13px; color: #4CAF50; font-weight: bold; margin-top: 8px; text-shadow: 0 0 4px rgba(76, 175, 80, 0.3);">
                    👆 Click here to change formula
                </div>
            </div>
        `;
    }

    /**
     * Update formula modal content
     */
    updateFormulaModal() {
        const presets = FORMULA_PRESETS;
        let modalContent = `
            <div style="text-align: center; margin-bottom: 25px;">
                <h2 style="margin: 0 0 10px 0; color: #fff; font-size: 24px;">🧮 Mathematical Functions</h2>
                <p style="margin: 0; color: #aaa; font-size: 14px;">Choose a preset formula or create your own</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
        `;
        
        Object.keys(presets).forEach(presetName => {
            const preset = presets[presetName];
            const isSelected = this.params.formulaPreset === presetName;
            
            modalContent += `
                <div class="formula-preset-card" data-preset="${presetName}" style="
                    background: ${isSelected ? 'rgba(70, 130, 180, 0.3)' : 'rgba(50, 50, 50, 0.8)'};
                    border: 2px solid ${isSelected ? '#4682b4' : '#666'};
                    border-radius: 10px;
                    padding: 15px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                ">
                    <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #fff;">
                        ${preset.name}
                    </div>
                    <div style="font-family: monospace; font-size: 11px; color: #ddd; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 5px; margin-bottom: 8px;">
                        ${preset.formula}
                    </div>
                    <div style="font-size: 11px; color: #aaa;">
                        ${preset.description}
                    </div>
                    ${isSelected ? '<div style="position: absolute; top: 8px; right: 8px; color: #4682b4; font-size: 16px;">✓</div>' : ''}
                </div>
            `;
        });
        
        modalContent += `
            </div>
            
            <div style="border-top: 1px solid #555; padding-top: 20px;">
                <div style="font-weight: bold; margin-bottom: 10px; color: #fff;">Custom Formula:</div>
                <textarea id="customFormulaInput" style="
                    width: 100%;
                    height: 80px;
                    background: rgba(0,0,0,0.5);
                    border: 2px solid #666;
                    border-radius: 8px;
                    color: white;
                    padding: 10px;
                    font-family: monospace;
                    font-size: 12px;
                    resize: vertical;
                    box-sizing: border-box;
                " placeholder="Enter custom formula like: A * sin(x) * cos(y)">${this.params.customFormula}</textarea>
                
                <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: center;">
                    <button id="applyCustomFormula" style="
                        background: #4682b4;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: bold;
                        transition: background 0.3s ease;
                    ">Apply Custom</button>
                    
                    <button id="closeFormulaModal" style="
                        background: #666;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: bold;
                        transition: background 0.3s ease;
                    ">Close</button>
                </div>
            </div>
        `;
        
        this.formulaModal.innerHTML = modalContent;
        
        // Add event listeners to preset cards
        this.formulaModal.querySelectorAll('.formula-preset-card').forEach(card => {
            card.addEventListener('click', () => {
                const presetName = card.dataset.preset;
                this.params.formulaPreset = presetName;
                this.updateFormulaPreset();
                this.updateFormulaButton();
                this.updateFormulaModal();
            });
            
            card.addEventListener('mouseenter', () => {
                if (!card.dataset.preset === this.params.formulaPreset) {
                    card.style.background = 'rgba(70, 70, 70, 0.8)';
                    card.style.borderColor = '#888';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                if (card.dataset.preset === this.params.formulaPreset) {
                    card.style.background = 'rgba(70, 130, 180, 0.3)';
                    card.style.borderColor = '#4682b4';
                } else {
                    card.style.background = 'rgba(50, 50, 50, 0.8)';
                    card.style.borderColor = '#666';
                }
            });
        });
        
        // Add event listeners for buttons (with safety checks)
        const applyButton = document.getElementById('applyCustomFormula');
        const closeButton = document.getElementById('closeFormulaModal');
        
        if (applyButton) {
            applyButton.addEventListener('click', () => {
                const customFormulaInput = document.getElementById('customFormulaInput');
                if (customFormulaInput) {
                    const customFormula = customFormulaInput.value;
                    this.params.customFormula = customFormula;
                    try {
                        this.surface.setFormula(customFormula);
                        this.params.formulaPreset = 'Custom';
                        this.updateFormulaButton();
                        this.hideFormulaModal();
                    } catch (error) {
                        alert('Invalid formula: ' + error.message);
                    }
                }
            });
            
            // Hover effects
            applyButton.addEventListener('mouseenter', (e) => {
                e.target.style.background = '#5a9bd4';
            });
            applyButton.addEventListener('mouseleave', (e) => {
                e.target.style.background = '#4682b4';
            });
        }
        
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.hideFormulaModal();
            });
            
            // Hover effects
            closeButton.addEventListener('mouseenter', (e) => {
                e.target.style.background = '#888';
            });
            closeButton.addEventListener('mouseleave', (e) => {
                e.target.style.background = '#666';
            });
        }
    }

    /**
     * Show formula modal
     */
    showFormulaModal() {
        this.formulaModalOverlay.style.display = 'block';
        // Update modal content when showing it
        this.updateFormulaModal();
    }

    /**
     * Hide formula modal
     */
    hideFormulaModal() {
        this.formulaModalOverlay.style.display = 'none';
    }

    /**
     * Toggle formula modal
     */
    toggleFormulaModal() {
        if (this.formulaModalOverlay.style.display === 'none') {
            this.showFormulaModal();
        } else {
            this.hideFormulaModal();
        }
    }

    /**
     * Create color legend display
     */
    createColorLegend() {
        this.colorLegendElement = document.createElement('div');
        this.colorLegendElement.style.position = 'absolute';
        this.colorLegendElement.style.bottom = '10px';
        this.colorLegendElement.style.left = '320px'; // Next to the GUI
        this.colorLegendElement.style.color = 'white';
        this.colorLegendElement.style.fontSize = '11px';
        this.colorLegendElement.style.fontFamily = 'Arial, sans-serif';
        this.colorLegendElement.style.backgroundColor = 'rgba(0,0,0,0.8)';
        this.colorLegendElement.style.padding = '8px';
        this.colorLegendElement.style.borderRadius = '5px';
        this.colorLegendElement.style.zIndex = '1000';
        this.colorLegendElement.style.userSelect = 'none';
        this.colorLegendElement.style.pointerEvents = 'none';
        this.colorLegendElement.style.maxWidth = '200px';
        
        document.body.appendChild(this.colorLegendElement);
        this.updateColorLegend();
    }

    /**
     * Update color legend based on current color scheme
     */
    updateColorLegend() {
        if (!this.colorLegendElement) return;
        
        const colorMap = this.params.colorMap;
        let legendContent = '<div><strong>Color Guide:</strong></div>';
        
        // Add gray below zero info if enabled
        if (this.params.grayBelowZero) {
            legendContent += '<div style="color: #888888;">⬇️ Gray = Below Z=0</div>';
        }
        
        switch (colorMap) {
            case COLOR_MAP_TYPES.RGB_SPATIAL:
                legendContent += `
                    <div style="color: #ff6666;">🔴 Red = X Position</div>
                    <div style="color: #66ff66;">🟢 Green = Y Position</div>
                    <div style="color: #6666ff;">🔵 Blue = Z Height</div>
                    <div style="margin-top:4px; font-size:10px;">
                        Corners show pure RGB colors<br/>
                        Perfect for understanding 3D coordinates
                    </div>
                `;
                break;
                
            case COLOR_MAP_TYPES.HSV_HEIGHT:
                legendContent += `
                    <div>🌈 Hue = X+Y Position</div>
                    <div>💡 Brightness = Z Height</div>
                    <div style="margin-top:4px; font-size:10px;">
                        Same location = same color family<br/>
                        Higher points = brighter colors
                    </div>
                `;
                break;
                
            case COLOR_MAP_TYPES.TERRAIN:
                legendContent += `
                    <div style="color: #0066cc;">🌊 Blue = Low (valleys)</div>
                    <div style="color: #00aa00;">🌱 Green = Medium</div>
                    <div style="color: #cccc00;">🏔️ Yellow = High</div>
                    <div style="color: #cc3300;">⛰️ Red = Peaks</div>
                    <div style="margin-top:4px; font-size:10px;">
                        Like topographic elevation maps
                    </div>
                `;
                break;
                
            case COLOR_MAP_TYPES.COORDINATE_GRID:
                legendContent += `
                    <div style="color: #ff6666;">🔴 X=0 plane (YZ)</div>
                    <div style="color: #66ff66;">🟢 Y=0 plane (XZ)</div>
                    <div style="color: #ffff66;">🟡 Z=0 plane (XY)</div>
                    <div style="color: #ffffff;">⭐ π intervals</div>
                    <div style="margin-top:4px; font-size:10px;">
                        Highlights coordinate system structure
                    </div>
                `;
                break;
                
            case COLOR_MAP_TYPES.VIRIDIS:
                legendContent += `
                    <div>📏 Height-based coloring</div>
                    <div style="color: #440154;">🟣 Purple = Low</div>
                    <div style="color: #21908c;">🔵 Teal = Medium</div>
                    <div style="color: #fde725;">🟡 Yellow = High</div>
                `;
                break;
                
            case COLOR_MAP_TYPES.INFERNO:
                legendContent += `
                    <div>🔥 Height-based coloring</div>
                    <div style="color: #000004;">⚫ Black = Low</div>
                    <div style="color: #bb3754;">🔴 Red = Medium</div>
                    <div style="color: #fcffa4;">🟡 Yellow = High</div>
                `;
                break;
                
            case COLOR_MAP_TYPES.COOL_WARM:
                legendContent += `
                    <div>❄️🔥 Height-based coloring</div>
                    <div style="color: #3b4cc0;">🔵 Cool Blue = Low</div>
                    <div style="color: #b40426;">🔴 Warm Red = High</div>
                `;
                break;
                
            case COLOR_MAP_TYPES.GRAYSCALE:
                legendContent += `
                    <div>⚫⚪ Height-based coloring</div>
                    <div>Black = Low heights</div>
                    <div>White = High heights</div>
                `;
                break;
                
            default:
                legendContent += '<div>Unknown color scheme</div>';
        }
        
        this.colorLegendElement.innerHTML = legendContent;
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            if (event.target.tagName === 'INPUT') return; // Don't interfere with input fields
            
            switch (event.code) {
                case 'Space':
                    event.preventDefault();
                    this.params.playing = !this.params.playing;
                    this.updateAnimation();
                    this.gui.updateDisplay();
                    break;
                    
                case 'KeyR':
                    this.resetToDefaults();
                    break;
                    
                case 'KeyG':
                    this.gui.domElement.style.display = 
                        this.gui.domElement.style.display === 'none' ? 'block' : 'none';
                    break;
                    
                case 'KeyS':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        this.exportParameters();
                    }
                    break;
            }
        });
    }

    /**
     * Update domain parameters
     */
    updateDomain() {
        this.surface.updateDomain({
            xMin: this.params.xMin,
            xMax: this.params.xMax,
            yMin: this.params.yMin,
            yMax: this.params.yMax
        });
        this.performance.setVertexCount(this.surface.getVertexCount());
    }

    /**
     * Update resolution parameters
     */
    updateResolution() {
        this.surface.updateResolution({
            x: this.params.resolutionX,
            y: this.params.resolutionY
        });
        this.performance.setVertexCount(this.surface.getVertexCount());
    }

    /**
     * Update animation parameters
     */
    updateAnimation() {
        this.surface.updateAnimation({
            amplitude: this.params.amplitude,
            omega: this.params.omega,
            playing: this.params.playing
        });
    }

    /**
     * Update lighting
     */
    updateLighting() {
        this.scene.setLightIntensities(
            this.params.ambientIntensity,
            this.params.directionalIntensity
        );
    }

    /**
     * Update performance mode
     */
    updatePerformanceMode() {
        this.performance.setPerformanceMode(this.params.performanceMode);
        this.scene.setPerformanceMode(this.params.performanceMode);
        
        if (this.params.performanceMode) {
            // Reduce resolution in performance mode
            const newResX = this.performance.getRecommendedResolution(this.params.resolutionX);
            const newResY = this.performance.getRecommendedResolution(this.params.resolutionY);
            this.surface.updateResolution({ x: newResX, y: newResY });
        }
    }

    /**
     * Toggle stats display
     */
    toggleStats() {
        if (this.params.showStats) {
            this.performance.show();
        } else {
            this.performance.hide();
        }
    }

    /**
     * Create custom formula input field
     * @param {dat.GUI} folder - Parent folder
     */
    createFormulaInput(folder) {
        // Create a container div for the formula input
        const container = document.createElement('div');
        container.style.padding = '5px';
        container.style.backgroundColor = 'rgba(0,0,0,0.1)';
        container.style.borderRadius = '3px';
        container.style.margin = '3px';
        
        // Create label
        const label = document.createElement('div');
        label.textContent = 'Custom Formula:';
        label.style.fontSize = '11px';
        label.style.marginBottom = '3px';
        label.style.color = '#ddd';
        container.appendChild(label);
        
        // Create input field
        this.formulaInput = document.createElement('input');
        this.formulaInput.type = 'text';
        this.formulaInput.value = this.params.customFormula;
        this.formulaInput.style.width = '100%';
        this.formulaInput.style.padding = '3px';
        this.formulaInput.style.fontSize = '10px';
        this.formulaInput.style.backgroundColor = '#2c2c2c';
        this.formulaInput.style.color = '#fff';
        this.formulaInput.style.border = '1px solid #444';
        this.formulaInput.style.borderRadius = '2px';
        
        // Create apply button
        const applyButton = document.createElement('button');
        applyButton.textContent = 'Apply';
        applyButton.style.marginTop = '3px';
        applyButton.style.padding = '3px 8px';
        applyButton.style.fontSize = '10px';
        applyButton.style.backgroundColor = '#4a9eff';
        applyButton.style.color = 'white';
        applyButton.style.border = 'none';
        applyButton.style.borderRadius = '2px';
        applyButton.style.cursor = 'pointer';
        
        // Create help text
        const helpText = document.createElement('div');
        helpText.innerHTML = `
            <div style="font-size: 9px; color: #aaa; margin-top: 3px;">
                Variables: x, y, t, A, ω<br>
                Functions: sin, cos, tan, exp, log, sqrt, abs, pow<br>
                Constants: π, e<br>
                Example: A * sin(x) * cos(y + ω*t)
            </div>
        `;
        
        container.appendChild(this.formulaInput);
        container.appendChild(applyButton);
        container.appendChild(helpText);
        
        // Add event listeners
        applyButton.addEventListener('click', () => this.updateCustomFormula());
        this.formulaInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.updateCustomFormula();
            }
        });
        
        // Insert into dat.GUI
        folder.domElement.appendChild(container);
    }

    /**
     * Update formula from preset selection
     */
    updateFormulaPreset() {
        const preset = FORMULA_PRESETS[this.params.formulaPreset];
        if (preset) {
            this.params.customFormula = preset.formula;
            if (this.formulaInput) {
                this.formulaInput.value = preset.formula;
            }
            this.applyFormula(preset.formula);
        }
    }

    /**
     * Update formula from custom input
     */
    updateCustomFormula() {
        const formula = this.formulaInput.value.trim();
        if (formula) {
            this.params.customFormula = formula;
            this.applyFormula(formula);
        }
    }

    /**
     * Apply formula to surface
     * @param {string} formula - Formula string
     */
    applyFormula(formula) {
        try {
            this.surface.setFormula(formula);
            this.surface.generateSurface();
            
            // Show success feedback
            this.showFormulaFeedback('Formula applied successfully!', 'success');
        } catch (error) {
            console.error('Formula error:', error);
            this.showFormulaFeedback(`Error: ${error.message}`, 'error');
        }
    }

    /**
     * Show formula feedback message
     * @param {string} message - Feedback message
     * @param {string} type - 'success' or 'error'
     */
    showFormulaFeedback(message, type) {
        // Remove existing feedback
        const existing = document.querySelector('.formula-feedback');
        if (existing) {
            existing.remove();
        }
        
        const feedback = document.createElement('div');
        feedback.className = 'formula-feedback';
        feedback.textContent = message;
        feedback.style.position = 'fixed';
        feedback.style.top = '20px';
        feedback.style.left = '50%';
        feedback.style.transform = 'translateX(-50%)';
        feedback.style.padding = '8px 16px';
        feedback.style.borderRadius = '4px';
        feedback.style.fontSize = '12px';
        feedback.style.zIndex = '2000';
        feedback.style.backgroundColor = type === 'success' ? 'rgba(0, 200, 0, 0.9)' : 'rgba(200, 0, 0, 0.9)';
        feedback.style.color = 'white';
        feedback.style.animation = 'slideIn 0.3s ease-out';
        
        document.body.appendChild(feedback);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (feedback.parentElement) {
                feedback.remove();
            }
        }, 3000);
    }

    /**
     * Update point marker
     */
    updateMarker() {
        if (this.interaction) {
            this.interaction.setMarkerPosition(this.params.markerX, this.params.markerY);
            this.interaction.setMarkerVisible(this.params.showMarker);
        }
    }

    /**
     * Reset to default values
     */
    resetToDefaults() {
        // Reset all parameters to defaults
        Object.assign(this.params, {
            xMin: -6 * Math.PI,
            xMax: 6 * Math.PI,
            yMin: -6 * Math.PI,
            yMax: 6 * Math.PI,
            resolutionX: 120, // Lower default for performance
            resolutionY: 120,
            amplitude: 1.0,
            omega: 0.5,
            playing: false,
            colorMap: COLOR_MAP_TYPES.RGB_SPATIAL,
            grayBelowZero: true,
            wireframe: true,
            wireframeOpacity: 0.8,
            surfaceOpacity: 0.6,
            showSurface: true,
            ambientIntensity: 0.3,
            directionalIntensity: 0.8,
            animateLights: false, // Disabled for consistent lighting
            performanceMode: true, // Default to performance mode
            markerX: 0,
            markerY: 0,
            showMarker: false,
            formulaPreset: 'sin(x) * cos(y)',
            customFormula: 'A * sin(x + ω*t) * cos(y - ω*t)'
        });
        
        // Update all systems
        this.updateDomain();
        this.updateResolution();
        this.updateAnimation();
        this.surface.updateColorMap(this.params.colorMap);
        this.surface.setWireframeVisible(this.params.wireframe);
        this.surface.setWireframeOpacity(this.params.wireframeOpacity);
        this.updateLighting();
        this.updatePerformanceMode();
        
        // Apply default formula
        this.applyFormula(this.params.customFormula);
        if (this.formulaInput) {
            this.formulaInput.value = this.params.customFormula;
        }
        
        // Update GUI display
        this.gui.updateDisplay();
    }

    /**
     * Export current view as PNG
     */
    exportPNG() {
        if (this.export) {
            this.export.exportPNG();
        } else {
            console.warn('Export manager not available');
        }
    }

    /**
     * Export current parameters as JSON
     */
    exportParameters() {
        if (this.export) {
            this.export.exportParameters();
        } else {
            console.warn('Export manager not available');
        }
    }

    /**
     * Import parameters from JSON file
     */
    importParameters() {
        if (this.export) {
            this.export.importParameters()
                .then(() => {
                    this.gui.updateDisplay();
                    console.log('Parameters imported successfully');
                })
                .catch(error => {
                    console.error('Error importing parameters:', error);
                    if (error.message !== 'Import cancelled') {
                        alert('Error importing parameters. Please check the file format.');
                    }
                });
        } else {
            console.warn('Export manager not available');
        }
    }

    /**
     * Export current session (PNG + JSON)
     */
    exportSession() {
        if (this.export) {
            this.export.exportSession();
        } else {
            console.warn('Export manager not available');
        }
    }

    /**
     * Get current parameters
     * @returns {Object} Current parameters
     */
    getParameters() {
        return { ...this.params };
    }

    /**
     * Set export manager reference
     * @param {ExportManager} exportManager - Export manager instance
     */
    setExportManager(exportManager) {
        this.export = exportManager;
    }

    /**
     * Set interaction manager reference
     * @param {InteractionManager} interactionManager - Interaction manager instance
     */
    setInteractionManager(interactionManager) {
        this.interaction = interactionManager;
    }

    /**
     * Cleanup resources
     */
    dispose() {
        this.gui.destroy();
        if (this.infoElement && this.infoElement.parentElement) {
            this.infoElement.parentElement.removeChild(this.infoElement);
        }
    }
}
