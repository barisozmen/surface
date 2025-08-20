# 1
Can you create a three.js template in this directory? I want to use vite as a build tool, and I just want to use javascript.

# 2



# 2
I want the following. Can you please tell me which components do I need? What kind of task plan would make it possible? Create a necessary design doc at @design.md as a three.js math animation website design

```
Build a responsive Three.js scene that visualizes the 3D scalar field z = sin(x) * cos(y) as a surface mesh with both wireframe and smooth shading.

Functional requirements:
1) Domain & sampling
   - Plot over x ∈ [-8π, 8π], y ∈ [-8π, 8π].
   - Provide GUI sliders for domain limits (min/max for x and y) and resolution (segmentsX, segmentsY).
   - Default resolution: 300 × 300; clamp to [20, 600] per axis.

2) Geometry
   - Use PlaneGeometry (or BufferGeometry) parameterized over the domain, then displace vertices by z = sin(x) * cos(y).
   - Recompute vertex normals after displacement for smooth shading.
   - Add an optional “amplitude” multiplier A (default 1.0) controlled via GUI.

3) Materials & rendering
   - Render the surface twice:
     a) Base surface with a MeshStandardMaterial (flatShading: false).
     b) Overlay wireframe (THREE.WireframeGeometry + LineSegments) with subtle opacity.
   - Apply a height-based color map to the base surface by writing per-vertex colors (or via a simple onBeforeCompile chunk). Include GUI to select color map:
     - “Viridis”, “Inferno”, “CoolWarm”, and “Grayscale”.
   - Add an optional “grid” toggle that shows a transparent XY grid at z=0 with major ticks every π and minor ticks every π/4.

4) Scene, camera, controls
   - Create a perspective camera (fov≈45, near=0.1, far auto-fit) positioned to see the full surface; include OrbitControls with damping enabled.
   - Add ambient light plus one directional light (with a small moving animation for highlights). Include GUI sliders for light intensity.

5) Axes & labels
   - Add thin XYZ axes with arrow helpers. Tick labels for x and y every π (…−2π, −π, 0, π, 2π…) using a simple sprite-text or CSS2DRenderer.
   - Label the axes “x”, “y”, “z”. Provide a toggle to show/hide labels.

6) Animation
   - Animate parameter t (time) and support a “time warp” mode: z = A * sin(x + ωt) * cos(y − ωt).
   - GUI controls: play/pause, ω (angular speed), and a “static” checkbox that freezes time.
   - Keep animation efficient with requestAnimationFrame; do not recreate geometry each frame—update a shader uniform or displace in a single compute pass if using a custom shader, else rebuild position attribute in-place.

7) Performance
   - Use WebGLRenderer with antialias true, physicallyCorrectLights true, outputColorSpace sRGB.
   - Handle window resize; pixelRatio capped at 2.
   - Provide a “Performance mode” toggle that halves resolution and disables shadows.
   - Show FPS (stats.js) and current vertex count in a small unobtrusive overlay.

8) Interactivity & readout
   - Raycast on mouse move; display a small tooltip with (x, y, z) at the nearest vertex.
   - GUI numeric inputs for a specific (x0, y0) marker; place a small sphere at that point on the surface and show its z value.

9) Export & share
   - Add buttons to:
     - Export PNG of the current view.
     - Export current parameters as JSON.
     - Import parameters from JSON to restore a view.

10) Code quality
   - Use ES modules and import from 'three' and 'three/examples/jsm/*'.
   - Organize code into modules: scene.js, surface.js (geometry/material), gui.js, labels.js, main.js (entry).
   - Include a simple ColorMap utility that returns THREE.Color from normalized height in [0,1].
   - Add JSDoc comments for public functions. No external CSS frameworks; minimal, clean styling.

11) Defaults & UX
   - Default camera fits the entire surface with some margin.
   - Initial GUI values:
       amplitude A = 1.0
       domain: x,y ∈ [-6π, 6π]
       resolution: 240 × 240
       color map: Viridis
       wireframe: on (opacity 0.25)
       grid: on
       labels: on
       animate: off
   - Provide a “Reset to defaults” button.

12) Accessibility
   - Ensure all controls are keyboard accessible and labeled.
   - Provide high-contrast mode (dark background, bright wireframe) via a toggle.

13) Validation
   - Verify symmetry: z(x, y) = z(−x, −y).
   - Sanity-test z at (0,0) = 0 and at (π/2, 0) = 1.

Deliverables:
- A single index.html that imports main.js as a module.
- /src/ with modules (main.js, scene.js, surface.js, gui.js, labels.js, colormap.js).
- No build step required; run via a static server.
- Works on desktop and modern mobile; gracefully degrades by lowering resolution on low GPU power.
```


# 3
Can you please implement the website design at @design.md step by step? 