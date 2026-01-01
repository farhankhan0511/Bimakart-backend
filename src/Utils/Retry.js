export async function withRetry(fn, options = {}) {
  const {
    retries = 3,
    delay = 1000,
    backoff = 2,
    shouldRetry = () => true,
    label = "operation",
  } = options;

  let attempt = 0;
  let lastError;

  while (attempt < retries) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      attempt++;

      if (attempt >= retries || !shouldRetry(err)) {
        break;
      }

      const wait = delay * Math.pow(backoff, attempt - 1);
      console.warn(`[${label}] retry ${attempt}/${retries} in ${wait}ms`);
      await new Promise(res => setTimeout(res, wait));
    }
  }

  throw lastError;
}


export function isRetryableError(err) {
  if (!err) return false;

  // Axios network error
  if (!err.response) return true;

  const status = err.response.status;

  return (
    status >= 500 ||
    status === 408 ||
    status === 429
  );
}
