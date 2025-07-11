"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMiddleware = createMiddleware;
exports.createMiddlewares = createMiddlewares;
/**
 * Creates a middleware function from various input types
 * @param input A middleware class, instance, or function
 * @returns A middleware function
 */
function createMiddleware(input) {
    // If input is a function, it's already a middleware
    if (typeof input === 'function' && !isClass(input)) {
        return input;
    }
    // If input is a class, instantiate it and return its handle method
    if (isClass(input)) {
        const instance = new input();
        return instance.handle.bind(instance);
    }
    // If input is an instance with a handle method, return the bound handle method
    if (typeof input === 'object' && input !== null && 'handle' in input && typeof input.handle === 'function') {
        return input.handle.bind(input);
    }
    throw new Error('Invalid middleware input');
}
/**
 * Creates middleware functions from an array of inputs
 * @param inputs Array of middleware classes, instances, or functions
 * @returns Array of middleware functions
 */
function createMiddlewares(inputs) {
    return inputs.map(createMiddleware);
}
/**
 * Checks if a value is a class constructor
 * @param value The value to check
 * @returns True if the value is a class constructor
 */
function isClass(value) {
    return typeof value === 'function' &&
        /^\s*class\s+/.test(value.toString()) || // ES6 class syntax
        (value.prototype && value.prototype.constructor === value); // ES5 class syntax
}
