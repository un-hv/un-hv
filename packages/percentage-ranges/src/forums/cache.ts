const CACHE_PREFIX = 'HvPerc_';

export const getCache = (url: string) => sessionStorage.getItem(CACHE_PREFIX + url);

export const setCache = (url: string, data: string) => {
  const save = () => {
    sessionStorage.setItem(CACHE_PREFIX + url, data);
  };
  try {
    save();
  } catch {
    console.warn('SessionStorage is full, cache failed');
    for (const k of Object.keys(sessionStorage)) {
      if (k.startsWith(CACHE_PREFIX)) {
        sessionStorage.removeItem(k);
      }
    }
    console.info('Cleared cache, retrying...');
    try {
      save();
    } catch (err) {
      console.error('Retry failed', err);
    }
  }
};
