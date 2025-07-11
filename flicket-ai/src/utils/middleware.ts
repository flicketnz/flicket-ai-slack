import type { AssistantUserMessageMiddleware, Middleware } from "@slack/bolt";

/**
 * Type for a class constructor that can be used as middleware
 */
export type MiddlewareClass<T extends Middleware<any> = Middleware<any>> = new (...args: any[]) => {
  handle: T;
};

/**
 * Type for an object that has a handle method that can be used as middleware
 */
export type MiddlewareInstance<T extends Middleware<any> = Middleware<any>> = {
  handle: T;
};



/**
 * Union type for all possible middleware inputs
 */
export type MiddlewareInput<T extends Middleware<any>> = MiddlewareClass<T> | MiddlewareInstance<T> | T;

/**
 * Creates a middleware function from various input types
 * @param input A middleware class, instance, or function
 * @returns A middleware function
 */
export function createMiddleware<T extends Middleware<any> = Middleware<any>>(input: MiddlewareInput<T>): T {
  // If input is a function, it's already a middleware
  if (typeof input === 'function' && !isClass(input)) {
    return input as T;
  }

  // If input is a class, instantiate it and return its handle method
  if (isClass(input)) {
    const instance = new (input as MiddlewareClass<T>)();
    return instance.handle.bind(instance) as T;
  }

  // If input is an instance with a handle method, return the bound handle method
  if (typeof input === 'object' && input !== null && 'handle' in input && typeof input.handle === 'function') {
    return ((input as MiddlewareInstance<T>).handle.bind(input) as unknown) as T;
  }


  throw new Error('Invalid middleware input');
}

/**
 * Creates middleware functions from an array of inputs
 * @param inputs Array of middleware classes, instances, or functions
 * @returns Array of middleware functions
 */
export function createMiddlewares<T extends Middleware<any> = Middleware<any>>(inputs: MiddlewareInput<T>[]): T[] {
  return inputs.map(createMiddleware);
}

/**
 * Checks if a value is a class constructor
 * @param value The value to check
 * @returns True if the value is a class constructor
 */
function isClass(value: any): boolean {
  return typeof value === 'function' &&
    /^\s*class\s+/.test(value.toString()) || // ES6 class syntax
    (value.prototype && value.prototype.constructor === value); // ES5 class syntax
}