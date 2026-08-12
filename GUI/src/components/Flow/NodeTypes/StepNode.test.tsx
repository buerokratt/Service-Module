import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import useServiceStore from 'store/new-services.store';
import useToastStore from 'store/toasts.store';
import { StepType } from 'types';
import { NodeDataProps } from 'types/service-flow';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import StepNode from './StepNode';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('i18next', () => {
  const mockI18n = {
    use: vi.fn().mockReturnThis(),
    init: vi.fn().mockResolvedValue(undefined),
    t: (key: string) => key,
  };
  return { default: mockI18n, t: mockI18n.t };
});

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const jumpToServiceData: NodeDataProps = {
  label: 'Jump to another service',
  onDelete: vi.fn(),
  onEdit: vi.fn(),
  type: 'jump-to-service',
  stepType: StepType.JumpToService,
  readonly: false,
  childrenCount: 0,
  jumpToService: { serviceName: 'Other Service', serviceId: 'other-service-id', input: [] },
  setClickedNode: vi.fn(),
};

describe('StepNode jump-to-service navigation', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    useServiceStore.setState({ serviceId: 'current-service-id', hasUnsavedChanges: false, nextLocation: null });
    useToastStore.setState({ toasts: [] });
  });

  it('does not navigate away and shows a toast when the node references the currently open service (self-loop)', () => {
    useServiceStore.setState({ serviceId: 'other-service-id', hasUnsavedChanges: false, nextLocation: null });
    const resetStateSpy = vi.spyOn(useServiceStore.getState(), 'resetState');

    render(
      <MemoryRouter>
        <StepNode data={jumpToServiceData} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText(/Other Service/));

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(resetStateSpy).not.toHaveBeenCalled();
    expect(useServiceStore.getState().nextLocation).toBeNull();
    expect(useToastStore.getState().toasts).toHaveLength(1);
    expect(useToastStore.getState().toasts[0].title).toBe('serviceFlow.element.jumpToService.title');
    expect(useToastStore.getState().toasts[0].message).toBe('serviceFlow.element.jumpToService.alreadyOnService');
  });

  it('navigates directly to the target service when there are no unsaved changes', () => {
    render(
      <MemoryRouter>
        <StepNode data={jumpToServiceData} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText(/Other Service/));

    expect(mockNavigate).toHaveBeenCalledWith('/edit/other-service-id');
    expect(useServiceStore.getState().nextLocation).toBeNull();
  });

  it('defers navigation through the unsaved-changes dialog when there are unsaved changes', () => {
    useServiceStore.setState({ hasUnsavedChanges: true });

    render(
      <MemoryRouter>
        <StepNode data={jumpToServiceData} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText(/Other Service/));

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(useServiceStore.getState().nextLocation).toBe('/edit/other-service-id');
  });
});
