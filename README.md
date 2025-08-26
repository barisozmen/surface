# Surface - 3D Field Visualization

Live at [bozmen.io/surface](https://bozmen.io/surface)

A sophisticated Three.js application that visualizes arbitrary 3D fields as an interactive surface mesh with advanced controls, animations, gradients, and export capabilities.

![Preview](./assets/preview.png)

## Run

```bash
npm install && npm run dev
```

## Build

```bash
npm run build && npm run preview
```
Then find the whole necessary code under /dist folder.

## Other similar
- https://www.geogebra.org/3d
- https://www.desmos.com/calculator

## Features

### Core Visualization
- **Interactive 3D Surface**: Renders `z = A * sin(x + ωt) * cos(y - ωt)` with customizable parameters
- **Real-time Animation**: Time-based parameter animation with play/pause controls
- **Color Mapping**: Multiple color schemes (Viridis, Inferno, Cool-Warm, Grayscale)
- **Surface Options**: Toggle between solid surface and wireframe overlay

### Advanced Controls
- **Domain Configuration**: Adjustable X/Y ranges with π-based increments
- **Resolution Control**: Dynamic mesh density from 20×20 to 600×600 vertices
- **Animation Parameters**: Amplitude and angular frequency (ω) controls
- **Lighting System**: Configurable ambient and directional lighting with animation

### Interactive Features
- **Mouse Interaction**: Hover tooltip showing (x,y,z) coordinates
- **Point Markers**: Click to place markers on the surface
- **Camera Controls**: Orbit, zoom, and pan with smooth damping
- **Keyboard Shortcuts**: Space (play/pause), R (reset), G (toggle GUI)

### Visual Elements
- **Coordinate System**: XYZ axes with colored arrows and labels
- **Grid System**: π-based major/minor grid lines at z=0
- **Performance Monitor**: Real-time FPS and vertex count display
- **Responsive Design**: Mobile-friendly interface

### Export & Sharing
- **PNG Export**: High-quality screenshots
- **Parameter Export/Import**: Save and restore complete configurations
- **Session Export**: Combined PNG + JSON export
- **OBJ Export**: 3D mesh export for external applications

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Modern web browser with WebGL support

### Installation
```bash
# Clone or download the project
cd mathviz

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open automatically at `http://localhost:3000`.

### Building for Production
```bash
npm run build
npm run preview
```

## Usage Guide

### Basic Controls
- **Mouse**: Drag to rotate, scroll to zoom, right-drag to pan
- **Space**: Play/pause animation
- **R**: Reset camera and parameters to defaults
- **G**: Toggle GUI visibility

### GUI Panels

#### Domain
- Adjust the X and Y coordinate ranges
- Default: x,y ∈ [-6π, 6π]

#### Resolution
- Control mesh density (vertices per axis)
- Higher values = smoother surface but lower performance

#### Animation
- **Amplitude**: Height multiplier for the surface
- **Angular Speed (ω)**: Animation frequency
- **Play Animation**: Enable time-based animation
- **Time Warp Mode**: Advanced animation with phase shifts

#### Rendering
- **Color Map**: Choose from 4 color schemes
- **Wireframe**: Toggle wireframe overlay
- **Surface Visibility**: Show/hide the main surface

#### Lighting
- **Ambient Light**: Overall illumination level
- **Directional Light**: Main light source intensity
- **Animate Lights**: Moving light animation

#### Display
- **Grid**: π-based coordinate grid at z=0
- **Labels**: Axis labels and tick marks
- **Axes**: XYZ coordinate axes

#### Performance
- **Performance Mode**: Reduce quality for better frame rate
- **Show Stats**: FPS and performance metrics

#### Point Marker
- **X/Y Position**: Coordinates for surface marker
- **Show Marker**: Toggle marker visibility

#### Actions
- **Reset to Defaults**: Restore all settings
- **Export PNG**: Save screenshot
- **Export Parameters**: Save configuration as JSON
- **Import Parameters**: Load saved configuration
- **Export Session**: Save both PNG and JSON

### Keyboard Shortcuts
- `Space`: Toggle animation
- `R`: Reset view and parameters
- `G`: Toggle GUI visibility
- `Ctrl/Cmd + S`: Export parameters

### Mathematical Function
The surface represents:
```
z = A * sin(x + ωt) * cos(y - ωt)
```

Where:
- `A`: Amplitude (height multiplier)
- `ω`: Angular frequency (animation speed)
- `t`: Time parameter

### Performance Tips
- Reduce resolution for better performance on mobile devices
- Enable Performance Mode for low-end hardware
- Use wireframe-only view for maximum performance
- Monitor FPS in the stats panel

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

Requires WebGL 1.0 support.

## Technical Architecture

### Modular Design
- `main.js`: Application coordination and lifecycle
- `scene.js`: Three.js scene, camera, and lighting
- `surface.js`: Mathematical surface generation
- `gui.js`: User interface controls
- `labels.js`: Axes, grid, and text rendering
- `colormap.js`: Color mapping utilities
- `performance.js`: Performance monitoring
- `interaction.js`: Mouse and keyboard handling
- `export.js`: Export functionality
- `utils.js`: Shared utilities

### Key Technologies
- **Three.js**: 3D graphics and WebGL rendering
- **dat.GUI**: Real-time parameter controls
- **Vite**: Fast development and building
- **CSS2DRenderer**: Text label rendering

### Performance Optimizations
- Efficient vertex buffer updates
- Dynamic level-of-detail
- GPU memory management
- Frustum culling
- Optimized raycasting

## Customization

### Adding New Color Maps
Edit `src/colormap.js` to add new color schemes:

```javascript
const newColorMap = (t) => {
    // Your color function here
    return new THREE.Color(r, g, b);
};
```

### Modifying the Mathematical Function
Edit the `calculateZ` method in `src/surface.js`:

```javascript
calculateZ(x, y, amplitude, omega, time) {
    // Your mathematical function here
    return amplitude * Math.sin(x + omega * time) * Math.cos(y - omega * time);
}
```

## Contributing
Feel free to submit issues and enhancement requests!

## License
MIT License - feel free to use this code for your own projects.

---

Built with ❤️ using Three.js and modern web technologies.
