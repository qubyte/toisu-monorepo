import { METHODS } from 'node:http';

export default function normalizeHandlers(handlers) {
  const normalized = Object.create(null);

  if (!handlers) {
    throw new Error('Handlers must be an object with HTTP methods as keys.');
  }

  for (const [method, handler] of Object.entries(handlers)) {
    const upperMethod = method.toUpperCase();

    if (!METHODS.includes(upperMethod)) {
      throw new Error(`Unknown method: ${method}`);
    }

    if (normalized[upperMethod]) {
      throw new Error(`A method can only be used once: ${upperMethod}`);
    }

    if (!Array.isArray(handler)) {
      throw new Error('Middleware for a method must be in an array.');
    }

    normalized[upperMethod] = handler;
  }

  return normalized;
}
