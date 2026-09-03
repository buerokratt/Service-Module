import { describe, expect, it } from 'vitest';

import { getStateModalConfig } from './service-table-utils';

describe('getStateModalConfig', () => {
  const t = (key: string) => key;

  it('returns activate config for ready services', () => {
    expect(getStateModalConfig('ready', t)).toEqual({
      title: 'overview.popup.setActive',
      action: 'activate',
      confirmLabel: 'overview.popup.activateService',
    });
  });

  it('returns ready config for draft services', () => {
    expect(getStateModalConfig('draft', t)?.action).toBe('ready');
  });

  it('returns null for unknown states', () => {
    expect(getStateModalConfig('unknown', t)).toBeNull();
  });
});
