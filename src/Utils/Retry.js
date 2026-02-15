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
      if (isQuotaError(err)) {
        // fail fast
        throw new Error("provider_quota_exhausted");
      }
      lastError = err;
      attempt++;

      if (attempt >= retries || !shouldRetry(err)) {
        break;
      }

      const wait = delay * Math.pow(backoff, attempt - 1);

      logger.warn(`[${label}] retry ${attempt}/${retries} in ${wait}ms`);

      await new Promise(res => setTimeout(res, wait));
    }
  }

  throw lastError;
}




function isQuotaError(err) {
  const msg = err?.response?.data?.error?.message || "";

  return (
    err?.response?.status === 429 ||
    err?.response?.status === 503 ||
    msg.includes("quota") ||
    msg.includes("insufficient")
  );
}
