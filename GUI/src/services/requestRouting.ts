export const isAccountRequest = (path: string): boolean => /^(accounts|auth)\//.test(path.replace(/^\//, ''));

export const relativeApiPath = (base: string, path: string): string => {
  const prefix = base.replace(/\/$/, '');
  return prefix && path.startsWith(prefix + '/') ? path.slice(prefix.length) : path;
};
