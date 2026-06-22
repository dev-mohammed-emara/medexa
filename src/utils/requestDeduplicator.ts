/**
 * In-flight request deduplication for GET requests.
 *
 * When two callers request the same GET URL simultaneously,
 * only one network request is made. The second caller receives
 * a cloned copy of the same Response.
 *
 * Mutations (POST/PUT/DELETE/PATCH) are never deduplicated.
 */

const inflightRequests = new Map<string, Promise<Response>>();

export const deduplicatedFetch = (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const method = (init?.method || 'GET').toUpperCase();
  const urlString = typeof input === 'string' ? input : input.toString();

  // Only deduplicate GET requests
  if (method !== 'GET') {
    return fetch(input, init);
  }

  // If this exact URL is already in-flight, return a clone of the pending response
  if (inflightRequests.has(urlString)) {
    return inflightRequests.get(urlString)!.then((r) => r.clone());
  }

  // Fire the actual request and track it
  const promise = fetch(input, init)
    .then((response) => {
      // Keep a clone in the map so subsequent .clone() calls work
      return response;
    })
    .finally(() => {
      inflightRequests.delete(urlString);
    });

  inflightRequests.set(urlString, promise);
  return promise.then((r) => r.clone());
};
