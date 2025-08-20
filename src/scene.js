/**
 * Scene setup, camera, lights, and controls
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Scene manager class
 */
export class SceneManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.setupRenderer();
        this.setupScene();
        this.setupCamera();
        this.setupLights();
        this.setupControls();
        this.setupEventListeners();
        
        this.lightAnimationEnabled = true;
        this.lightTime = 0;
    }

    /**
     * Setup WebGL renderer
     */
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: false
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        // Use modern lighting approach (Three.js r155+)
        this.renderer.useLegacyLights = false;
        
        // Set background to bright white for morning feel
        this.renderer.setClearColor(0xffffff, 1.0);
    }

    /**
     * Setup Three.js scene
     */
    setupScene() {
        this.scene = new THREE.Scene();
        // No fog for bright, clear morning atmosphere
        // this.scene.fog = new THREE.Fog(0x1a1a2e, 50, 200);
    }

    /**
     * Setup camera with proper positioning
     */
    setupCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        
        // Position camera to view the surface properly with Z-axis pointing up
        // Surface will be centered at origin, spanning roughly [-6π, 6π]
        const surfaceSize = 6 * Math.PI; // ~18.8 units
        const distance = surfaceSize * 1.2; // Good viewing distance
        
        // Position camera so Z-axis appears to point upward
        this.camera.position.set(distance * 0.8, -distance * 0.6, distance * 0.8);
        this.camera.lookAt(0, 0, 0);
        
        // Set the camera's up vector to ensure Z-axis points up
        this.camera.up.set(0, 0, 1);
    }

    /**
     * Setup lighting system
     */
    setupLights() {
        // Bright ambient light for morning atmosphere
        this.ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
        this.scene.add(this.ambientLight);

        // Main directional light - warm morning sun
        this.directionalLight = new THREE.DirectionalLight(0xfffacd, Math.PI * 1.2);
        this.directionalLight.position.set(20, 25, 15); // Higher angle like morning sun
        this.directionalLight.castShadow = true;
        
        // Shadow camera setup
        const shadowSize = 50;
        this.directionalLight.shadow.camera.left = -shadowSize;
        this.directionalLight.shadow.camera.right = shadowSize;
        this.directionalLight.shadow.camera.top = shadowSize;
        this.directionalLight.shadow.camera.bottom = -shadowSize;
        this.directionalLight.shadow.camera.near = 0.1;
        this.directionalLight.shadow.camera.far = 100;
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.bias = -0.0001;
        
        this.scene.add(this.directionalLight);

        // Soft fill light with warm tone
        this.fillLight = new THREE.DirectionalLight(0xfff8dc, Math.PI * 0.4);
        this.fillLight.position.set(-15, 15, -8);
        this.scene.add(this.fillLight);
    }

    /**
     * Setup orbit controls
     */
    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = false; // Disabled for immediate stop
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 200;
        this.controls.maxPolarAngle = Math.PI; // Allow full rotation
        
        // Zoom and rotation settings
        this.controls.enableZoom = true;
        this.controls.zoomSpeed = 1.0;
        this.controls.rotateSpeed = 1.0; // Normal rotation speed
        
        // Set target to center of surface
        this.controls.target.set(0, 0, 0);
        
        // Update controls to work with Z-up orientation
        this.controls.update();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        window.addEventListener('resize', () => this.handleResize());
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }

    /**
     * Update animation (call in render loop)
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        // Only update controls if damping is enabled (which it isn't now)
        // this.controls.update();
        
        // Light animation disabled for consistent lighting
        // if (this.lightAnimationEnabled) {
        //     this.lightTime += deltaTime * 0.5;
        //     
        //     // Animate directional light position
        //     const radius = 25;
        //     this.directionalLight.position.x = Math.cos(this.lightTime) * radius;
        //     this.directionalLight.position.z = Math.sin(this.lightTime) * radius;
        //     this.directionalLight.position.y = 20 + Math.sin(this.lightTime * 2) * 5;
        // }
    }

    /**
     * Render the scene
     */
    render() {
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Set light intensities
     * @param {number} ambientIntensity - Ambient light intensity
     * @param {number} directionalIntensity - Directional light intensity
     */
    setLightIntensities(ambientIntensity, directionalIntensity) {
        this.ambientLight.intensity = ambientIntensity;
        this.directionalLight.intensity = directionalIntensity * Math.PI;
        this.fillLight.intensity = directionalIntensity * Math.PI * 0.3;
    }

    /**
     * Enable/disable light animation
     * @param {boolean} enabled - Enable animation
     */
    setLightAnimation(enabled) {
        this.lightAnimationEnabled = enabled;
    }

    /**
     * Set performance mode
     * @param {boolean} performanceMode - Enable performance mode
     */
    setPerformanceMode(performanceMode) {
        if (performanceMode) {
            this.renderer.shadowMap.enabled = false;
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
        } else {
            this.renderer.shadowMap.enabled = true;
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }
    }

    /**
     * Get the camera for external use
     * @returns {THREE.PerspectiveCamera} Camera
     */
    getCamera() {
        return this.camera;
    }

    /**
     * Get the scene for external use
     * @returns {THREE.Scene} Scene
     */
    getScene() {
        return this.scene;
    }

    /**
     * Get the renderer for external use
     * @returns {THREE.WebGLRenderer} Renderer
     */
    getRenderer() {
        return this.renderer;
    }

    /**
     * Cleanup resources
     */
    dispose() {
        this.controls.dispose();
        this.renderer.dispose();
        window.removeEventListener('resize', this.handleResize);
    }
}
