/**
 * Export functionality for PNG and JSON
 */

/**
 * Export manager class
 */
export class ExportManager {
    constructor(renderer, guiController) {
        this.renderer = renderer;
        this.gui = guiController;
    }

    /**
     * Export current view as PNG
     * @param {string} filename - Optional filename
     */
    exportPNG(filename = null) {
        const canvas = this.renderer.domElement;
        
        // Create a temporary canvas with white background for better PNG export
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        
        const ctx = tempCanvas.getContext('2d');
        
        // Fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Draw the WebGL canvas on top
        ctx.drawImage(canvas, 0, 0);
        
        // Create download link
        const link = document.createElement('a');
        link.download = filename || `mathviz-${this.getTimestamp()}.png`;
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
        
        console.log(`Exported PNG: ${link.download}`);
    }

    /**
     * Export current parameters as JSON
     * @param {string} filename - Optional filename
     */
    exportParameters(filename = null) {
        const params = this.gui.getParameters();
        
        const exportData = {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            application: 'MathViz',
            parameters: {
                domain: {
                    xMin: params.xMin,
                    xMax: params.xMax,
                    yMin: params.yMin,
                    yMax: params.yMax
                },
                resolution: {
                    x: params.resolutionX,
                    y: params.resolutionY
                },
                animation: {
                    amplitude: params.amplitude,
                    omega: params.omega,
                    playing: params.playing,
                    timeWarp: params.timeWarp
                },
                rendering: {
                    colorMap: params.colorMap,
                    wireframe: params.wireframe,
                    wireframeOpacity: params.wireframeOpacity,
                    showSurface: params.showSurface
                },
                lighting: {
                    ambientIntensity: params.ambientIntensity,
                    directionalIntensity: params.directionalIntensity,
                    animateLights: params.animateLights
                },
                display: {
                    showGrid: params.showGrid,
                    showLabels: params.showLabels,
                    showAxes: params.showAxes
                },
                performance: {
                    performanceMode: params.performanceMode,
                    showStats: params.showStats
                },
                marker: {
                    x: params.markerX,
                    y: params.markerY,
                    show: params.showMarker
                }
            }
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.download = filename || `mathviz-params-${this.getTimestamp()}.json`;
        link.href = url;
        link.click();
        
        URL.revokeObjectURL(url);
        console.log(`Exported parameters: ${link.download}`);
    }

    /**
     * Import parameters from JSON file
     * @returns {Promise} Promise that resolves when import is complete
     */
    importParameters() {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = (event) => {
                const file = event.target.files[0];
                if (!file) {
                    reject(new Error('No file selected'));
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        
                        if (!this.validateImportData(data)) {
                            reject(new Error('Invalid file format'));
                            return;
                        }
                        
                        this.applyImportedParameters(data.parameters);
                        console.log('Parameters imported successfully');
                        resolve(data);
                        
                    } catch (error) {
                        console.error('Error importing parameters:', error);
                        reject(error);
                    }
                };
                
                reader.onerror = () => reject(new Error('Error reading file'));
                reader.readAsText(file);
            };
            
            input.oncancel = () => reject(new Error('Import cancelled'));
            input.click();
        });
    }

    /**
     * Validate imported data structure
     * @param {Object} data - Imported data
     * @returns {boolean} Is valid
     */
    validateImportData(data) {
        if (!data || typeof data !== 'object') return false;
        if (!data.parameters || typeof data.parameters !== 'object') return false;
        
        // Check for required sections
        const requiredSections = ['domain', 'resolution', 'animation', 'rendering'];
        return requiredSections.every(section => 
            data.parameters[section] && typeof data.parameters[section] === 'object'
        );
    }

    /**
     * Apply imported parameters to GUI
     * @param {Object} parameters - Parameter object
     */
    applyImportedParameters(parameters) {
        const currentParams = this.gui.getParameters();
        
        // Apply domain parameters
        if (parameters.domain) {
            Object.assign(currentParams, {
                xMin: parameters.domain.xMin ?? currentParams.xMin,
                xMax: parameters.domain.xMax ?? currentParams.xMax,
                yMin: parameters.domain.yMin ?? currentParams.yMin,
                yMax: parameters.domain.yMax ?? currentParams.yMax
            });
        }
        
        // Apply resolution parameters
        if (parameters.resolution) {
            Object.assign(currentParams, {
                resolutionX: parameters.resolution.x ?? currentParams.resolutionX,
                resolutionY: parameters.resolution.y ?? currentParams.resolutionY
            });
        }
        
        // Apply animation parameters
        if (parameters.animation) {
            Object.assign(currentParams, {
                amplitude: parameters.animation.amplitude ?? currentParams.amplitude,
                omega: parameters.animation.omega ?? currentParams.omega,
                playing: parameters.animation.playing ?? currentParams.playing,
                timeWarp: parameters.animation.timeWarp ?? currentParams.timeWarp
            });
        }
        
        // Apply rendering parameters
        if (parameters.rendering) {
            Object.assign(currentParams, {
                colorMap: parameters.rendering.colorMap ?? currentParams.colorMap,
                wireframe: parameters.rendering.wireframe ?? currentParams.wireframe,
                wireframeOpacity: parameters.rendering.wireframeOpacity ?? currentParams.wireframeOpacity,
                showSurface: parameters.rendering.showSurface ?? currentParams.showSurface
            });
        }
        
        // Apply lighting parameters
        if (parameters.lighting) {
            Object.assign(currentParams, {
                ambientIntensity: parameters.lighting.ambientIntensity ?? currentParams.ambientIntensity,
                directionalIntensity: parameters.lighting.directionalIntensity ?? currentParams.directionalIntensity,
                animateLights: parameters.lighting.animateLights ?? currentParams.animateLights
            });
        }
        
        // Apply display parameters
        if (parameters.display) {
            Object.assign(currentParams, {
                showGrid: parameters.display.showGrid ?? currentParams.showGrid,
                showLabels: parameters.display.showLabels ?? currentParams.showLabels,
                showAxes: parameters.display.showAxes ?? currentParams.showAxes
            });
        }
        
        // Apply performance parameters
        if (parameters.performance) {
            Object.assign(currentParams, {
                performanceMode: parameters.performance.performanceMode ?? currentParams.performanceMode,
                showStats: parameters.performance.showStats ?? currentParams.showStats
            });
        }
        
        // Apply marker parameters
        if (parameters.marker) {
            Object.assign(currentParams, {
                markerX: parameters.marker.x ?? currentParams.markerX,
                markerY: parameters.marker.y ?? currentParams.markerY,
                showMarker: parameters.marker.show ?? currentParams.showMarker
            });
        }
        
        // Trigger GUI update to apply changes
        this.gui.resetToDefaults();
    }

    /**
     * Export scene as OBJ file (advanced feature)
     * @param {THREE.Mesh} surfaceMesh - Surface mesh to export
     * @param {string} filename - Optional filename
     */
    exportOBJ(surfaceMesh, filename = null) {
        if (!surfaceMesh || !surfaceMesh.geometry) {
            console.error('No surface mesh to export');
            return;
        }
        
        const geometry = surfaceMesh.geometry;
        const vertices = geometry.attributes.position.array;
        const indices = geometry.index ? geometry.index.array : null;
        
        let objContent = '# MathViz exported OBJ file\n';
        objContent += `# Generated on ${new Date().toISOString()}\n\n`;
        
        // Export vertices
        for (let i = 0; i < vertices.length; i += 3) {
            objContent += `v ${vertices[i]} ${vertices[i + 1]} ${vertices[i + 2]}\n`;
        }
        
        objContent += '\n';
        
        // Export faces
        if (indices) {
            for (let i = 0; i < indices.length; i += 3) {
                // OBJ indices are 1-based
                objContent += `f ${indices[i] + 1} ${indices[i + 1] + 1} ${indices[i + 2] + 1}\n`;
            }
        } else {
            // No indices, assume triangles
            for (let i = 0; i < vertices.length / 3; i += 3) {
                objContent += `f ${i + 1} ${i + 2} ${i + 3}\n`;
            }
        }
        
        // Create download
        const blob = new Blob([objContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.download = filename || `mathviz-surface-${this.getTimestamp()}.obj`;
        link.href = url;
        link.click();
        
        URL.revokeObjectURL(url);
        console.log(`Exported OBJ: ${link.download}`);
    }

    /**
     * Get formatted timestamp for filenames
     * @returns {string} Timestamp string
     */
    getTimestamp() {
        const now = new Date();
        return now.toISOString()
            .replace(/[:.]/g, '-')
            .replace('T', '_')
            .slice(0, -5); // Remove milliseconds and Z
    }

    /**
     * Export current session data (parameters + screenshot)
     * @param {string} baseName - Base filename
     */
    async exportSession(baseName = null) {
        const base = baseName || `mathviz-session-${this.getTimestamp()}`;
        
        // Export PNG
        this.exportPNG(`${base}.png`);
        
        // Small delay to ensure PNG export completes
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Export parameters
        this.exportParameters(`${base}.json`);
        
        console.log(`Exported session: ${base}`);
    }
}
