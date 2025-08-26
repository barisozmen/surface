/**
 * Formula parsing and evaluation utilities
 */

/**
 * Safe mathematical expression evaluator
 */
export class FormulaEvaluator {
    constructor() {
        // Allowed mathematical functions and constants
        this.allowedFunctions = {
            sin: Math.sin,
            cos: Math.cos,
            tan: Math.tan,
            asin: Math.asin,
            acos: Math.acos,
            atan: Math.atan,
            sinh: Math.sinh,
            cosh: Math.cosh,
            tanh: Math.tanh,
            exp: Math.exp,
            log: Math.log,
            log10: (x) => Math.log(x) / Math.log(10),
            sqrt: Math.sqrt,
            abs: Math.abs,
            floor: Math.floor,
            ceil: Math.ceil,
            round: Math.round,
            pow: Math.pow,
            min: Math.min,
            max: Math.max,
            sign: Math.sign
        };
        
        this.allowedConstants = {
            pi: Math.PI,
            π: Math.PI,
            e: Math.E,
            PI: Math.PI,
            E: Math.E
        };
    }

    /**
     * Preprocess formula string to handle common mathematical notation
     * @param {string} formula - Raw formula string
     * @returns {string} Processed formula
     */
    preprocessFormula(formula) {
        // Replace common mathematical notation
        let processed = formula
            // Replace ** with pow() function calls
            .replace(/([a-zA-Z0-9\.\)]+)\s*\*\*\s*([a-zA-Z0-9\.\(]+)/g, 'pow($1, $2)')
            // Replace ^ with pow() function calls
            .replace(/([a-zA-Z0-9\.\)]+)\s*\^\s*([a-zA-Z0-9\.\(]+)/g, 'pow($1, $2)')
            // Add multiplication signs where needed (but not before function calls)
            .replace(/(\d+)([a-zA-Z])/g, '$1*$2')
            .replace(/([a-zA-Z])(\d+)/g, '$1*$2')
            .replace(/(\))(\()/g, '$1*$2')
            .replace(/(\))([a-zA-Z])/g, '$1*$2')
            // Add * between single variables and parentheses (like x( -> x*(), but NOT sin( -> sin*()
            .replace(/\b([xytAωπe])\s*(\()/g, '$1*$2')
            // Replace common constants
            .replace(/\bpi\b/g, 'π')
            .replace(/\bPI\b/g, 'π');
        
        return processed;
    }

    /**
     * Validate formula for security (basic check)
     * @param {string} formula - Formula to validate
     * @returns {boolean} Is formula safe
     */
    validateFormula(formula) {
        // Check for dangerous patterns
        const dangerousPatterns = [
            /while\s*\(/,
            /for\s*\(/,
            /function\s*\(/,
            /eval\s*\(/,
            /new\s+/,
            /import\s+/,
            /require\s*\(/,
            /document\./,
            /window\./,
            /global\./,
            /process\./,
            /constructor/,
            /prototype/,
            /__proto__/,
            /return\s+/
        ];
        
        return !dangerousPatterns.some(pattern => pattern.test(formula));
    }

    /**
     * Create a safe evaluation function for a formula
     * @param {string} formula - Mathematical formula string
     * @returns {Function} Evaluation function
     */
    createEvaluator(formula) {
        if (!this.validateFormula(formula)) {
            throw new Error('Formula contains potentially unsafe expressions');
        }
        
        const processed = this.preprocessFormula(formula);
        
        try {
            // Create function with limited scope
            const funcBody = `
                "use strict";
                const {${Object.keys(this.allowedFunctions).join(', ')}} = funcs;
                const {${Object.keys(this.allowedConstants).join(', ')}} = consts;
                return ${processed};
            `;
            
            return new Function('x', 'y', 't', 'A', 'ω', 'funcs', 'consts', funcBody);
        } catch (error) {
            throw new Error(`Invalid formula syntax: ${error.message}`);
        }
    }

    /**
     * Evaluate formula at given point
     * @param {Function} evaluator - Function created by createEvaluator
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate  
     * @param {number} t - Time parameter
     * @param {number} A - Amplitude
     * @param {number} ω - Omega (angular frequency)
     * @returns {number} Z value
     */
    evaluate(evaluator, x, y, t = 0, A = 1, ω = 0.5) {
        try {
            const result = evaluator(x, y, t, A, ω, this.allowedFunctions, this.allowedConstants);
            
            // Check for invalid results
            if (!isFinite(result)) {
                return 0; // Return 0 for NaN or Infinity
            }
            
            return result;
        } catch (error) {
            console.warn(`Formula evaluation error at (${x}, ${y}):`, error.message);
            return 0;
        }
    }
}

/**
 * Label categories and their colors
 */
export const FORMULA_LABELS = {
    trigonometric: { color: '#ff6b6b', name: 'Trigonometric' },
    harmonic: { color: '#4ecdc4', name: 'Harmonic' },
    symmetric: { color: '#45b7d1', name: 'Symmetric' },
    radial: { color: '#f9ca24', name: 'Radial' },
    polynomial: { color: '#f0932b', name: 'Polynomial' },
    exponential: { color: '#eb4d4b', name: 'Exponential' },
    logarithmic: { color: '#6c5ce7', name: 'Logarithmic' },
    hyperbolic: { color: '#a55eea', name: 'Hyperbolic' },
    periodic: { color: '#26de81', name: 'Periodic' },
    fractal: { color: '#fd79a8', name: 'Fractal' },
    geometric: { color: '#fdcb6e', name: 'Geometric' },
    wave: { color: '#74b9ff', name: 'Wave' },
    spiral: { color: '#e17055', name: 'Spiral' },
    oscillating: { color: '#81ecec', name: 'Oscillating' },
    special: { color: '#fab1a0', name: 'Special Functions' }
};

/**
 * Predefined formula presets with categorization
 */
export const FORMULA_PRESETS = {
    // Trigonometric & Harmonic Functions
    'sin(x) * cos(y)': {
        formula: 'A * sin(x + ω*t) * cos(y - ω*t)',
        name: 'Sine-Cosine Wave',
        description: 'Classic wave interference pattern',
        labels: ['trigonometric', 'harmonic', 'wave', 'symmetric']
    },
    'sin(x) + cos(y)': {
        formula: 'A * (sin(x + ω*t) + cos(y + ω*t))',
        name: 'Additive Waves',
        description: 'Sum of perpendicular waves',
        labels: ['trigonometric', 'harmonic', 'wave']
    },
    'sin(x) * sin(y)': {
        formula: 'A * sin(x + ω*t) * sin(y + ω*t)',
        name: 'Sine Product',
        description: 'Product of sine waves',
        labels: ['trigonometric', 'harmonic', 'symmetric']
    },
    'cos(x) * cos(y)': {
        formula: 'A * cos(x + ω*t) * cos(y + ω*t)',
        name: 'Cosine Product',
        description: 'Product of cosine waves',
        labels: ['trigonometric', 'harmonic', 'symmetric']
    },
    'sin(x + y)': {
        formula: 'A * sin(x + y + ω*t)',
        name: 'Diagonal Sine Wave',
        description: 'Sine wave along diagonal',
        labels: ['trigonometric', 'harmonic', 'wave']
    },
    'cos(x - y)': {
        formula: 'A * cos(x - y + ω*t)',
        name: 'Diagonal Cosine Wave',
        description: 'Cosine wave along diagonal',
        labels: ['trigonometric', 'harmonic', 'wave']
    },
    'sin(2*x) * cos(3*y)': {
        formula: 'A * sin(2*x + ω*t) * cos(3*y + ω*t)',
        name: 'Harmonic Grid',
        description: 'Different frequency harmonics',
        labels: ['trigonometric', 'harmonic', 'periodic']
    },
    'sin(x)*sin(y)*sin(x*y)': {
        formula: 'A * sin(x + ω*t) * sin(y + ω*t) * sin(x*y)',
        name: 'Triple Sine Product',
        description: 'Complex trigonometric interaction',
        labels: ['trigonometric', 'harmonic']
    },

    // Radial & Circular Functions
    'sin(sqrt(x² + y²))': {
        formula: 'A * sin(sqrt(x*x + y*y) + ω*t)',
        name: 'Radial Waves',
        description: 'Concentric circular waves',
        labels: ['trigonometric', 'radial', 'wave', 'symmetric']
    },
    'cos(sqrt(x² + y²))': {
        formula: 'A * cos(sqrt(x*x + y*y) + ω*t)',
        name: 'Radial Cosine',
        description: 'Concentric cosine ripples',
        labels: ['trigonometric', 'radial', 'wave', 'symmetric']
    },
    'sin(x² + y²)': {
        formula: 'A * sin(x*x + y*y + ω*t)',
        name: 'Quadratic Ripples',
        description: 'Circular waves with quadratic frequency',
        labels: ['trigonometric', 'radial', 'polynomial']
    },
    'r * sin(r)': {
        formula: 'A * sqrt(x*x + y*y) * sin(sqrt(x*x + y*y) + ω*t)',
        name: 'Radial Amplitude',
        description: 'Amplitude grows with radius',
        labels: ['trigonometric', 'radial', 'wave']
    },
    'sin(3*sqrt(x² + y²))': {
        formula: 'A * sin(3*sqrt(x*x + y*y) + ω*t)',
        name: 'High Frequency Radial',
        description: 'Dense concentric rings',
        labels: ['trigonometric', 'radial', 'wave', 'periodic']
    },

    // Exponential Functions
    'exp(-r²) * cos(r)': {
        formula: 'A * exp(-(x*x + y*y)/4) * cos(sqrt(x*x + y*y) + ω*t)',
        name: 'Gaussian Ripples',
        description: 'Damped circular waves',
        labels: ['exponential', 'radial', 'wave', 'symmetric']
    },
    'exp(-x²) * sin(y)': {
        formula: 'A * exp(-x*x/4) * sin(y + ω*t)',
        name: 'Gaussian Curtain',
        description: 'Gaussian envelope with sine waves',
        labels: ['exponential', 'trigonometric', 'wave']
    },
    'exp(-(x²+y²)/8) * sin(5*r)': {
        formula: 'A * exp(-(x*x + y*y)/8) * sin(5*sqrt(x*x + y*y) + ω*t)',
        name: 'Localized Ripples',
        description: 'Concentrated high-frequency ripples',
        labels: ['exponential', 'trigonometric', 'radial']
    },
    'exp(x) * cos(y)': {
        formula: 'A * exp(x/5) * cos(y + ω*t)',
        name: 'Exponential Cosine',
        description: 'Growing exponential with cosine modulation',
        labels: ['exponential', 'trigonometric']
    },
    'exp(-abs(x)-abs(y))': {
        formula: 'A * exp(-abs(x) - abs(y))',
        name: 'Diamond Exponential',
        description: 'Diamond-shaped exponential decay',
        labels: ['exponential', 'symmetric', 'geometric']
    },

    // Polynomial Surfaces
    'x² - y²': {
        formula: 'A * (x*x - y*y) / 10',
        name: 'Hyperbolic Paraboloid',
        description: 'Saddle-shaped surface',
        labels: ['polynomial', 'symmetric', 'geometric']
    },
    'x² + y²': {
        formula: 'A * (x*x + y*y) / 10',
        name: 'Paraboloid',
        description: 'Bowl-shaped surface',
        labels: ['polynomial', 'symmetric', 'radial']
    },
    'x³ - 3*x*y²': {
        formula: 'A * (x*x*x - 3*x*y*y) / 50',
        name: 'Cubic Surface',
        description: 'Cubic polynomial surface',
        labels: ['polynomial', 'symmetric']
    },
    'x*y': {
        formula: 'A * x * y / 5',
        name: 'Hyperbolic Paraboloid (xy)',
        description: 'Product surface',
        labels: ['polynomial', 'symmetric', 'geometric']
    },
    'x⁴ + y⁴ - 6*x²*y²': {
        formula: 'A * (x*x*x*x + y*y*y*y - 6*x*x*y*y) / 100',
        name: 'Quartic Surface',
        description: 'Fourth-degree polynomial',
        labels: ['polynomial', 'symmetric']
    },

    // Product and Complex Functions
    'sin(xy)': {
        formula: 'A * sin(x*y + ω*t)',
        name: 'Product Waves',
        description: 'Waves based on coordinate product',
        labels: ['trigonometric', 'wave']
    },
    'cos(x*y)': {
        formula: 'A * cos(x*y + ω*t)',
        name: 'Product Cosine',
        description: 'Cosine of coordinate product',
        labels: ['trigonometric', 'wave']
    },
    'sin(x/y)': {
        formula: 'A * sin(x/(abs(y) + 0.1) + ω*t)',
        name: 'Ratio Waves',
        description: 'Sine of coordinate ratio',
        labels: ['trigonometric', 'wave']
    },
    'xy * sin(x+y)': {
        formula: 'A * x * y * sin(x + y + ω*t) / 10',
        name: 'Modulated Product',
        description: 'Product modulated by sine',
        labels: ['trigonometric', 'polynomial']
    },

    // Spiral and Angular Functions
    'Tornado': {
        formula: 'A * sin(sqrt(x*x + y*y)) * cos(atan(y/x) * 3 + ω*t)',
        name: 'Tornado Pattern',
        description: 'Spiral wave pattern',
        labels: ['spiral', 'trigonometric', 'radial']
    },
    'Angular Spiral': {
        formula: 'A * sin(atan(y/x) * 5 + sqrt(x*x + y*y) + ω*t)',
        name: 'Angular Spiral',
        description: 'Combined angular and radial waves',
        labels: ['spiral', 'trigonometric', 'radial']
    },
    'Rose Pattern': {
        formula: 'A * cos(3 * atan(y/x)) * sin(sqrt(x*x + y*y) + ω*t)',
        name: 'Rose Pattern',
        description: 'Three-petaled rose with ripples',
        labels: ['spiral', 'trigonometric', 'radial', 'geometric']
    },
    'Fibonacci Spiral': {
        formula: 'A * sin(1.618 * atan(y/x) + sqrt(x*x + y*y) + ω*t)',
        name: 'Fibonacci Spiral',
        description: 'Golden ratio spiral pattern',
        labels: ['spiral', 'trigonometric', 'special']
    },

    // Logarithmic Functions
    'log(r) * sin(θ)': {
        formula: 'A * log(sqrt(x*x + y*y) + 1) * sin(atan(y/x) + ω*t)',
        name: 'Logarithmic Spiral',
        description: 'Logarithmic amplitude with angular variation',
        labels: ['logarithmic', 'spiral', 'trigonometric']
    },
    'log(x²+y²+1)': {
        formula: 'A * log(x*x + y*y + 1)',
        name: 'Logarithmic Cone',
        description: 'Logarithmic radial surface',
        labels: ['logarithmic', 'radial', 'symmetric']
    },

    // Hyperbolic Functions
    'sinh(x) * cosh(y)': {
        formula: 'A * sinh(x/3) * cosh(y/3)',
        name: 'Hyperbolic Product',
        description: 'Product of hyperbolic functions',
        labels: ['hyperbolic', 'symmetric']
    },
    'tanh(x) + tanh(y)': {
        formula: 'A * (tanh(x) + tanh(y))',
        name: 'Hyperbolic Sum',
        description: 'Sum of hyperbolic tangents',
        labels: ['hyperbolic']
    },

    // Special Functions
    'Bessel Function': {
        formula: 'A * sin(sqrt(x*x + y*y)) / (sqrt(x*x + y*y) + 0.1)',
        name: 'Bessel-like Function',
        description: 'Approximation of Bessel function',
        labels: ['special', 'radial', 'trigonometric']
    },
    'Sinc Function': {
        formula: 'A * sin(sqrt(x*x + y*y)) / (sqrt(x*x + y*y) + 0.001)',
        name: 'Sinc Function',
        description: 'Cardinal sine function',
        labels: ['special', 'radial', 'trigonometric']
    },
    'Mexican Hat': {
        formula: 'A * (2 - (x*x + y*y)) * exp(-(x*x + y*y)/2)',
        name: 'Mexican Hat Wavelet',
        description: 'Ricker wavelet (Mexican hat)',
        labels: ['special', 'exponential', 'radial', 'symmetric']
    },
    'Gabor Function': {
        formula: 'A * exp(-(x*x + y*y)/4) * sin(3*x + ω*t)',
        name: 'Gabor Function',
        description: 'Gaussian modulated sine wave',
        labels: ['special', 'exponential', 'trigonometric', 'wave']
    },

    // Oscillating Functions
    'Beating Waves': {
        formula: 'A * sin(x + ω*t) * sin(x/3 + ω*t/3)',
        name: 'Beating Waves',
        description: 'Interference pattern creating beats',
        labels: ['oscillating', 'trigonometric', 'wave']
    },
    'Amplitude Modulation': {
        formula: 'A * (1 + 0.5*sin(x/2)) * sin(2*x + ω*t)',
        name: 'Amplitude Modulation',
        description: 'AM wave pattern',
        labels: ['oscillating', 'trigonometric', 'wave']
    },
    'Frequency Modulation': {
        formula: 'A * sin(x + sin(x/3) + ω*t)',
        name: 'Frequency Modulation',
        description: 'FM wave pattern',
        labels: ['oscillating', 'trigonometric', 'wave']
    },

    // Fractal-like Functions
    'Fractal Waves': {
        formula: 'A * (sin(x) + sin(2*x)/2 + sin(4*x)/4) * (cos(y) + cos(2*y)/2)',
        name: 'Fractal Waves',
        description: 'Self-similar wave structure',
        labels: ['fractal', 'trigonometric', 'harmonic']
    },
    'Chaotic Attractor': {
        formula: 'A * sin(x*y) * cos(x+y) + 0.5*sin(2*x*y)',
        name: 'Chaotic Attractor',
        description: 'Complex chaotic pattern',
        labels: ['fractal', 'trigonometric']
    },

    // Geometric Patterns
    'Checkerboard': {
        formula: 'A * sin(π*x) * sin(π*y)',
        name: 'Checkerboard',
        description: 'Alternating pattern',
        labels: ['geometric', 'trigonometric', 'periodic', 'symmetric']
    },
    'Diamond Lattice': {
        formula: 'A * cos(x + y) * cos(x - y)',
        name: 'Diamond Lattice',
        description: 'Diamond grid pattern',
        labels: ['geometric', 'trigonometric', 'periodic', 'symmetric']
    },
    'Hexagonal Pattern': {
        formula: 'A * (cos(x) + cos(x/2 - y*sqrt(3)/2) + cos(x/2 + y*sqrt(3)/2))',
        name: 'Hexagonal Pattern',
        description: 'Hexagonal lattice structure',
        labels: ['geometric', 'trigonometric', 'periodic', 'symmetric']
    },

    // Complex Combined Functions
    'Standing Wave': {
        formula: 'A * sin(x + ω*t) * sin(y) + 0.5*sin(2*x - ω*t) * cos(y)',
        name: 'Standing Wave',
        description: 'Complex standing wave pattern',
        labels: ['wave', 'trigonometric', 'harmonic']
    },
    'Interference': {
        formula: 'A * sin(sqrt((x-2)*(x-2) + y*y) + ω*t) + sin(sqrt((x+2)*(x+2) + y*y) + ω*t)',
        name: 'Two-Source Interference',
        description: 'Interference from two point sources',
        labels: ['wave', 'trigonometric', 'radial']
    },
    'Doppler Effect': {
        formula: 'A * sin(sqrt(x*x + y*y) - x*ω*t/5 + ω*t)',
        name: 'Doppler Effect',
        description: 'Moving source wave pattern',
        labels: ['wave', 'trigonometric', 'radial', 'oscillating']
    },
    
    // Advanced Special Functions
    'Airy Function Approximation': {
        formula: 'A * sin((x*x*x + y*y*y)/10 + ω*t) / (sqrt(x*x + y*y) + 0.1)',
        name: 'Airy Function Approximation',
        description: 'Approximation of Airy function with radial damping',
        labels: ['special', 'radial', 'trigonometric']
    },
    'Gamma Function Surface': {
        formula: 'A * log(1 + exp(-sqrt(x*x + y*y))) * sin(ω*t)',
        name: 'Gamma-Inspired Surface',
        description: 'Logarithmic surface inspired by gamma function behavior',
        labels: ['special', 'logarithmic', 'radial']
    },
    'Hermite Polynomial Wave': {
        formula: 'A * (4*x*x - 2) * exp(-(x*x + y*y)/4) * cos(ω*t)',
        name: 'Hermite Polynomial Wave',
        description: 'Hermite polynomial modulated by Gaussian',
        labels: ['special', 'exponential', 'polynomial']
    },
    'Legendre Polynomial Surface': {
        formula: 'A * (3*x*x - 1) * (3*y*y - 1) / 10',
        name: 'Legendre Polynomial Surface',
        description: 'Surface based on second-order Legendre polynomials',
        labels: ['special', 'polynomial', 'symmetric']
    },

    // Nonlinear Dynamics
    'Lorenz Attractor Projection': {
        formula: 'A * (sin(10*x - y*y) + cos(28*y - x*x)) / 10',
        name: 'Lorenz Attractor Projection',
        description: '2D projection inspired by Lorenz system dynamics',
        labels: ['nonlinear', 'chaotic', 'trigonometric']
    },
    'Duffing Oscillator Pattern': {
        formula: 'A * sin(x + ω*t) - 0.3*sin(3*x + ω*t) + 0.1*y*y*sin(ω*t)',
        name: 'Duffing Oscillator Pattern',
        description: 'Pattern inspired by Duffing oscillator nonlinear dynamics',
        labels: ['nonlinear', 'oscillating', 'trigonometric']
    },
    'Van der Pol Oscillator': {
        formula: 'A * sin(x + ω*t) + 0.2*(1 - x*x)*sin(y + ω*t)',
        name: 'Van der Pol Oscillator',
        description: 'Pattern inspired by Van der Pol oscillator',
        labels: ['nonlinear', 'oscillating', 'trigonometric']
    },

    // Advanced Fractal Patterns
    'Mandelbrot-Inspired Pattern': {
        formula: 'A * sin((x*x - y*y + x)*cos(2*x*y + y + ω*t))',
        name: 'Mandelbrot-Inspired Pattern',
        description: 'Pattern inspired by Mandelbrot set iterations',
        labels: ['fractal', 'trigonometric', 'complex']
    },
    'Julia Set Waves': {
        formula: 'A * sin(x*x - y*y + 0.5*cos(2*x*y + ω*t))',
        name: 'Julia Set Waves',
        description: 'Wave pattern inspired by Julia set dynamics',
        labels: ['fractal', 'trigonometric', 'complex']
    },

    // Advanced Geometric Patterns
    'Voronoi-Like Pattern': {
        formula: 'A * sin(min(sqrt((x-1)*(x-1) + (y-1)*(y-1)), sqrt((x+1)*(x+1) + (y+1)*(y+1))) + ω*t)',
        name: 'Voronoi-Like Pattern',
        description: 'Pattern resembling Voronoi cell boundaries',
        labels: ['geometric', 'trigonometric', 'periodic']
    },
    'Penrose Tiling Approximation': {
        formula: 'A * (cos(x + 2*π/5) + cos(y + 4*π/5) + cos(x - y + 6*π/5))',
        name: 'Penrose Tiling Approximation',
        description: 'Approximation of Penrose tiling using trigonometric sums',
        labels: ['geometric', 'trigonometric', 'periodic', 'symmetric']
    },

    // Advanced Hyperbolic Functions
    'Hyperbolic Vortex': {
        formula: 'A * sinh(sqrt(x*x + y*y)/3) * cos(atan(y/x) + ω*t)',
        name: 'Hyperbolic Vortex',
        description: 'Hyperbolic function with angular modulation',
        labels: ['hyperbolic', 'spiral', 'radial']
    },
    'Catenoid Surface': {
        formula: 'A * cosh(sqrt(x*x + y*y)/3) / 5',
        name: 'Catenoid Surface',
        description: 'Minimal surface resembling a catenoid',
        labels: ['hyperbolic', 'radial', 'geometric']
    },

    // Advanced Wave Patterns
    'Schrödinger Wave': {
        formula: 'A * exp(-(x*x + y*y)/4) * sin(5*sqrt(x*x + y*y) + ω*t)',
        name: 'Schrödinger Wave',
        description: 'Wave function inspired by quantum mechanics',
        labels: ['wave', 'exponential', 'radial', 'quantum']
    },
    'Klein-Gordon Pattern': {
        formula: 'A * sin(sqrt(x*x + y*y + 1) + ω*t) / (sqrt(x*x + y*y) + 0.1)',
        name: 'Klein-Gordon Pattern',
        description: 'Pattern inspired by Klein-Gordon wave equation',
        labels: ['wave', 'special', 'radial']
    }
};

/**
 * Get formula preset names for GUI dropdown
 * @returns {Array<string>} Preset names
 */
export function getFormulaPresetNames() {
    return Object.keys(FORMULA_PRESETS);
}
