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
 * Predefined formula presets
 */
export const FORMULA_PRESETS = {
    'sin(x) * cos(y)': {
        formula: 'A * sin(x + ω*t) * cos(y - ω*t)',
        name: 'Sine-Cosine Wave',
        description: 'Classic wave interference pattern'
    },
    'sin(sqrt(x² + y²))': {
        formula: 'A * sin(sqrt(x*x + y*y) + ω*t)',
        name: 'Radial Waves',
        description: 'Concentric circular waves'
    },
    'exp(-r²) * cos(r)': {
        formula: 'A * exp(-(x*x + y*y)/4) * cos(sqrt(x*x + y*y) + ω*t)',
        name: 'Gaussian Ripples',
        description: 'Damped circular waves'
    },
    'x² - y²': {
        formula: 'A * (x*x - y*y) / 10',
        name: 'Hyperbolic Paraboloid',
        description: 'Saddle-shaped surface'
    },
    'sin(x) + cos(y)': {
        formula: 'A * (sin(x + ω*t) + cos(y + ω*t))',
        name: 'Additive Waves',
        description: 'Sum of perpendicular waves'
    },
    'sin(xy)': {
        formula: 'A * sin(x*y + ω*t)',
        name: 'Product Waves',
        description: 'Waves based on coordinate product'
    },
    'Bessel Function': {
        formula: 'A * sin(sqrt(x*x + y*y)) / (sqrt(x*x + y*y) + 0.1)',
        name: 'Bessel-like Function',
        description: 'Approximation of Bessel function'
    },
    'Tornado': {
        formula: 'A * sin(sqrt(x*x + y*y)) * cos(atan(y/x) * 3 + ω*t)',
        name: 'Tornado Pattern',
        description: 'Spiral wave pattern'
    }
};

/**
 * Get formula preset names for GUI dropdown
 * @returns {Array<string>} Preset names
 */
export function getFormulaPresetNames() {
    return Object.keys(FORMULA_PRESETS);
}
