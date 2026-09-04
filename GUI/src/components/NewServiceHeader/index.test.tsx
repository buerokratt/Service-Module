import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import api from 'services/api-dev';
import useServiceStore from 'store/new-services.store';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import NewServiceHeader from './index';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  initReactI18next: {},
}));

vi.mock('i18n', () => ({
  default: { t: (key: string) => key },
}));

vi.mock('services/api-dev', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderHeader = () =>
  render(
    <MemoryRouter initialEntries={['/edit/current-service-id']}>
      <Routes>
        <Route
          path="/edit/:id"
          element={
            <NewServiceHeader activeStep={1} backOnClick={vi.fn()} continueOnClick={vi.fn()} saveOnClick={vi.fn()} />
          }
        />
      </Routes>
    </MemoryRouter>,
  );

describe('NewServiceHeader service switcher dropdown', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    useServiceStore.setState({ hasUnsavedChanges: false, nextLocation: null, name: 'Current Service' });
    vi.mocked(api.get).mockResolvedValue({
      data: [
        { serviceId: 'current-service-id', name: 'Current Service' },
        { serviceId: 'other-service-id', name: 'Other Service' },
      ],
    });
  });

  it('lists other services and navigates immediately with no unsaved changes', async () => {
    const user = userEvent.setup();
    renderHeader();

    await user.click(screen.getByRole('button', { name: 'Current_Service' }));

    const option = await screen.findByText('Other Service');
    // The current service should not be offered as a navigation target
    expect(screen.queryByText('Current Service')).not.toBeInTheDocument();

    await user.click(option);

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/edit/other-service-id'));
  });

  it('defers navigation through the unsaved-changes dialog when there are unsaved changes', async () => {
    useServiceStore.setState({ hasUnsavedChanges: true });
    const user = userEvent.setup();
    renderHeader();

    await user.click(screen.getByRole('button', { name: 'Current_Service' }));
    const option = await screen.findByText('Other Service');
    await user.click(option);

    await waitFor(() => expect(useServiceStore.getState().nextLocation).toBe('/edit/other-service-id'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
