export const GM_Request = <T extends GmResponseType = 'text', K = undefined>(
  { method = 'GET', ...rest }: GmXmlhttpRequestOption<T, unknown>,
  signal?: AbortSignal,
) =>
  new Promise<GmResponseEvent<T, K>>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('Aborted'));
      return;
    }

    let abortHandle: GmAbortHandle | null = null;
    const onSignalAbort = () => abortHandle?.abort();
    const cleanup = () => {
      if (signal) {
        signal.removeEventListener('abort', onSignalAbort);
      }
    };
    if (signal) {
      signal.addEventListener('abort', onSignalAbort);
    }

    abortHandle = GM_xmlhttpRequest<T>({
      method,
      ...rest,
      onload: (res) => {
        cleanup();
        if (res.status >= 200 && res.status < 300) resolve(res);
        else reject(new Error(`HTTP Error: ${res.status} ${res.statusText}`));
      },
      onerror: (event) => {
        cleanup();
        reject(new Error(event.error || 'Network Error'));
      },
      ontimeout: () => {
        cleanup();
        reject(new Error('Timeout'));
      },
      onabort: () => {
        cleanup();
        reject(new Error('Aborted'));
      },
    });
  });
