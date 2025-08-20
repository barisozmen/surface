/**
 * MathViz - 3D Scalar Field Visualization
 * Entry point and main application coordination
 */
import * as THREE from 'three';
import './style.css';
import { SceneManager } from './scene.js';
import { SurfaceGenerator } from './surface.js';
import { GUIController } from './gui.js';
import { LabelsManager } from './labels.js';
import { PerformanceMonitor } from './performance.js';
import { InteractionManager } from './interaction.js';
import { ExportManager } from './export.js';

/**
 * Main application class
 */
class MathVizApp {
    constructor() {
        this.canvas = document.getElementById('canvas');
        if (!this.canvas) {
            throw new Error('Canvas element not found');
        }
        
        this.clock = new THREE.Clock();
        this.time = 0;
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        // Initialize core systems
        this.sceneManager = new SceneManager(this.canvas);
        this.performanceMonitor = new PerformanceMonitor();
        
        // Initialize surface generator
        this.surfaceGenerator = new SurfaceGenerator(this.sceneManager.getScene());
        
        // Initialize labels and axes
        this.labelsManager = new LabelsManager(
            this.sceneManager.getScene(),
            this.sceneManager.getCamera(),
            this.sceneManager.getRenderer()
        );
        
        // Initialize interaction manager
        this.interactionManager = new InteractionManager(
            this.sceneManager.getScene(),
            this.sceneManager.getCamera(),
            this.sceneManager.getRenderer(),
            this.surfaceGenerator
        );
        
        // Initialize GUI controls first
        this.guiController = new GUIController(
            this.surfaceGenerator,
            this.sceneManager,
            this.performanceMonitor
        );
        
        // Initialize export manager with GUI reference
        this.exportManager = new ExportManager(
            this.sceneManager.getRenderer(),
            this.guiController
        );
        
        // Connect export manager to GUI
        this.guiController.setExportManager(this.exportManager);
        this.guiController.setInteractionManager(this.interactionManager);
        
        // Setup GUI event handlers
        this.setupGUIEventHandlers();
        
        // Set initial performance data and apply performance mode
        this.performanceMonitor.setVertexCount(this.surfaceGenerator.getVertexCount());
        this.performanceMonitor.setPerformanceMode(true); // Enable performance mode by default
        this.sceneManager.setPerformanceMode(true);
        this.sceneManager.setLightAnimation(false); // Disable light animation for consistent lighting
        this.performanceMonitor.show();
        
        // Start the render loop
        this.animate();
        
        console.log('MathViz application initialized!');
        console.log('Controls: Space=Play/Pause, R=Reset, G=Toggle GUI');
    }

    /**
     * Setup GUI event handlers
     */
    setupGUIEventHandlers() {
        // Listen for domain changes to update labels
        const originalUpdateDomain = this.surfaceGenerator.updateDomain.bind(this.surfaceGenerator);
        this.surfaceGenerator.updateDomain = (newDomain) => {
            originalUpdateDomain(newDomain);
            this.labelsManager.updateDomain(newDomain);
        };
        
        // Handle visibility toggles
        const params = this.guiController.getParameters();
        
        // Add change listeners for display options
        this.addGUIChangeListener('showGrid', (value) => {
            this.labelsManager.setGridVisible(value);
        });
        
        this.addGUIChangeListener('showLabels', (value) => {
            this.labelsManager.setLabelsVisible(value);
        });
        
        this.addGUIChangeListener('showAxes', (value) => {
            this.labelsManager.setAxesVisible(value);
        });
    }

    /**
     * Add change listener for GUI parameter
     * @param {string} paramName - Parameter name
     * @param {Function} callback - Change callback
     */
    addGUIChangeListener(paramName, callback) {
        // This is a simplified approach - in a real implementation,
        // you'd want to use a proper event system or observer pattern
        const params = this.guiController.getParameters();
        let lastValue = params[paramName];
        
        const checkForChanges = () => {
            if (params[paramName] !== lastValue) {
                lastValue = params[paramName];
                callback(params[paramName]);
            }
        };
        
        // Check for changes in animation loop
        this.guiChangeCheckers = this.guiChangeCheckers || [];
        this.guiChangeCheckers.push(checkForChanges);
    }

    /**
     * Main animation loop
     */
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        this.time += deltaTime;
        
        // Update systems
        this.sceneManager.update(deltaTime);
        this.performanceMonitor.update();
        
        // Update surface animation
        this.surfaceGenerator.updateAnimation(this.time);
        
        // Update interaction manager
        this.interactionManager.update();
        
        // Check for GUI changes
        if (this.guiChangeCheckers) {
            this.guiChangeCheckers.forEach(checker => checker());
        }
        
        // Render
        this.sceneManager.render();
        this.labelsManager.render();
    }

    /**
     * Cleanup resources
     */
    dispose() {
        this.sceneManager.dispose();
        this.surfaceGenerator.dispose();
        this.labelsManager.dispose();
        this.interactionManager.dispose();
        this.guiController.dispose();
        this.performanceMonitor.dispose();
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Add THREE to global scope for debugging
        window.THREE = THREE;
        
        // Create and start the application
        const app = new MathVizApp();
        
        // Make app globally available for debugging
        window.mathVizApp = app;
        
        // Handle page unload cleanup
        window.addEventListener('beforeunload', () => {
            app.dispose();
        });
        
        console.log('MathViz application initialized successfully!');
        console.log('Controls: Space=Play/Pause, R=Reset, G=Toggle GUI');
    } catch (error) {
        console.error('Error initializing MathViz:', error);
        
        // Show error on page
        document.body.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: rgba(255,0,0,0.9); color: white; padding: 20px; 
                        border-radius: 8px; font-family: Arial; max-width: 80%; text-align: center;">
                <h2>MathViz Error</h2>
                <p>${error.message}</p>
                <pre style="background: rgba(0,0,0,0.3); padding: 10px; margin-top: 10px; border-radius: 4px; text-align: left; overflow: auto;">
${error.stack}
                </pre>
            </div>
        `;
    }
});
