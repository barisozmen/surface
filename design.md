# MathViz - 3D Scalar Field Visualization Design Document

## Project Overview
A responsive Three.js application that visualizes the 3D scalar field `z = sin(x) * cos(y)` as an interactive surface mesh with advanced controls, animations, and export capabilities.

## Architecture & Components

### Core Modules Structure
```
src/
├── main.js          # Entry point, app initialization
├── scene.js         # Scene setup, camera, lights, controls
├── surface.js       # Surface geometry generation and materials
├── gui.js           # dat.GUI interface and controls
├── labels.js        # Axes, grid, and text labels
├── colormap.js      # Color mapping utilities
├── performance.js   # FPS monitoring and optimization
├── export.js        # PNG/JSON export functionality
└── utils.js         # Shared utilities and helpers
```

### Key Three.js Components Required

#### Core Three.js Imports
- `THREE.Scene, PerspectiveCamera, WebGLRenderer`
- `THREE.PlaneGeometry, BufferGeometry, BufferAttribute`
- `THREE.MeshStandardMaterial, LineSegments, WireframeGeometry`
- `THREE.AmbientLight, DirectionalLight`
- `THREE.Group, Mesh, Points`
- `THREE.Raycaster, Vector2, Vector3`

#### Additional Three.js Modules
- `OrbitControls` from `three/examples/jsm/controls/OrbitControls.js`
- `CSS2DRenderer, CSS2DObject` from `three/examples/jsm/renderers/CSS2DRenderer.js`
- `Stats` from `three/examples/jsm/libs/stats.module.js`

#### External Libraries
- `dat.GUI` for control interface
- Custom color map implementation (no external lib needed)

## Technical Implementation Plan

### Phase 1: Foundation (Core Scene Setup)
**Components:**
- Basic Three.js scene with camera and renderer
- OrbitControls for navigation
- Lighting system (ambient + directional)
- Window resize handling

**Files:** `main.js`, `scene.js`

### Phase 2: Surface Generation
**Components:**
- PlaneGeometry with custom vertex displacement
- Surface mesh with MeshStandardMaterial
- Wireframe overlay system
- Height-based vertex coloring

**Mathematical Implementation:**
```javascript
// Core function: z = A * sin(x + ωt) * cos(y - ωt)
function calculateZ(x, y, amplitude, omega, time) {
    return amplitude * Math.sin(x + omega * time) * Math.cos(y - omega * time);
}
```

**Files:** `surface.js`, `colormap.js`

### Phase 3: GUI Controls
**Components:**
- Domain controls (x/y min/max sliders)
- Resolution controls (segmentsX/Y with clamping)
- Amplitude and animation controls
- Material and rendering toggles
- Color map selection

**Files:** `gui.js`

### Phase 4: Axes & Labels
**Components:**
- XYZ axis helpers with custom styling
- Grid system at z=0 with π-based ticks
- CSS2D labels for axes and tick marks
- Toggle system for show/hide

**Files:** `labels.js`

### Phase 5: Animation System
**Components:**
- Time-based parameter animation
- Efficient vertex position updates
- Play/pause controls
- Performance-optimized rendering loop

**Implementation Strategy:**
- Pre-allocate position buffers
- Update geometry.attributes.position directly
- Use `needsUpdate` flag for efficient GPU updates

### Phase 6: Interactivity
**Components:**
- Mouse raycasting for surface intersection
- Tooltip system with (x,y,z) readout
- Point marker placement
- Keyboard accessibility

### Phase 7: Performance & Export
**Components:**
- FPS monitoring with stats.js
- Performance mode (reduced resolution/quality)
- PNG screenshot export
- JSON parameter save/load

## Data Structures

### Surface Configuration
```javascript
const surfaceConfig = {
    domain: {
        xMin: -6 * Math.PI,
        xMax: 6 * Math.PI,
        yMin: -6 * Math.PI,
        yMax: 6 * Math.PI
    },
    resolution: {
        x: 240,
        y: 240
    },
    animation: {
        amplitude: 1.0,
        omega: 0.5,
        playing: false,
        time: 0
    },
    rendering: {
        colorMap: 'viridis',
        wireframe: true,
        wireframeOpacity: 0.25,
        showGrid: true,
        showLabels: true
    }
};
```

### Color Map System
```javascript
const colorMaps = {
    viridis: (t) => new THREE.Color().setHSL(0.8 - 0.8 * t, 0.9, 0.3 + 0.4 * t),
    inferno: (t) => new THREE.Color().setHSL(0.05 + 0.1 * t, 1.0, 0.2 + 0.6 * t),
    coolWarm: (t) => new THREE.Color().lerpColors(coolBlue, warmRed, t),
    grayscale: (t) => new THREE.Color(t, t, t)
};
```

## Performance Optimization Strategy

### Geometry Management
- Use BufferGeometry for efficient memory usage
- Pre-allocate vertex arrays to avoid garbage collection
- Update position attributes in-place during animation
- Implement LOD (Level of Detail) for different performance modes

### Rendering Optimization
- Frustum culling for off-screen elements
- Pixel ratio capping at 2x for high-DPI displays
- Conditional shadow rendering based on performance mode
- Efficient raycasting with spatial optimization

### Memory Management
- Dispose of unused geometries and materials
- Pool objects for tooltips and markers
- Lazy loading of complex features

## User Experience Design

### Default State
- Camera positioned to show full surface with margin
- Smooth orbit controls with damping
- Responsive GUI that adapts to screen size
- High contrast mode for accessibility

### Mobile Considerations
- Touch-friendly GUI controls
- Automatic performance mode on low-end devices
- Simplified interface on small screens
- Gesture support for camera controls

### Progressive Enhancement
- Basic functionality works without advanced features
- Graceful degradation on older browsers
- Feature detection for WebGL capabilities

## Testing & Validation

### Mathematical Verification
- Symmetry tests: `z(x,y) = z(-x,-y)`
- Boundary condition checks
- Animation continuity validation
- Color mapping accuracy

### Performance Benchmarks
- Target: 60fps on mid-range hardware
- Graceful degradation to 30fps on mobile
- Memory usage monitoring
- GPU utilization optimization

### Cross-browser Compatibility
- Chrome, Firefox, Safari, Edge support
- WebGL 1.0 fallback
- Mobile browser testing

## Implementation Timeline

1. **Week 1**: Core scene setup and basic surface generation
2. **Week 2**: GUI implementation and mathematical functions
3. **Week 3**: Animation system and performance optimization
4. **Week 4**: Interactivity, export features, and polish

## Technical Notes

### Coordinate System
- X-axis: horizontal (left-right)
- Y-axis: depth (forward-back)  
- Z-axis: vertical (up-down)
- Grid aligned with mathematical convention

### Performance Targets
- Default: 240×240 resolution (57,600 vertices)
- Performance mode: 120×120 resolution (14,400 vertices)
- Maximum: 600×600 resolution (360,000 vertices)

### Browser Requirements
- WebGL 1.0 support
- ES6 modules support
- CSS2D rendering capability
- File API for export functionality

This design provides a robust foundation for creating an advanced mathematical visualization tool with professional-grade features and performance.
