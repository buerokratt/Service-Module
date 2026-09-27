import { FC, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useServiceListStore from 'store/services.store';
import { Service } from 'types';
import { ServiceDependency, ServiceDependencyDirection } from 'types/service-dependency';

import DependencyNode from './DependencyNode';
import ServiceStatusChip from './ServiceStatusChip';

type DependencyViewProps = {
  service: Service;
  serviceIdBeingChecked: string | null;
  onOpen: (dependency: ServiceDependency) => void;
  onLocate: (dependency: ServiceDependency) => void;
  onActivate: (dependency: ServiceDependency) => void;
};

type LoadState = 'loading' | 'loaded' | 'error';

const nodeKey = (direction: ServiceDependencyDirection, serviceId: string) => `${direction}:${serviceId}`;

/** Horizontal S-curve between two points. */
const curve = (x1: number, y1: number, x2: number, y2: number) => {
  const dx = (x2 - x1) / 2;
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
};

const DependencyView: FC<DependencyViewProps> = ({ service, serviceIdBeingChecked, onOpen, onLocate, onActivate }) => {
  const { t } = useTranslation();
  const markerId = useId().replace(/:/g, '');
  const servicesVersion = useServiceListStore((state) => state.servicesVersion);
  const [dependencies, setDependencies] = useState<ServiceDependency[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [paths, setPaths] = useState<string[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLDivElement>());

  useEffect(() => {
    let cancelled = false;
    setLoadState((state) => (state === 'loaded' ? state : 'loading'));
    useServiceListStore
      .getState()
      .loadServiceDependencies(service.serviceId)
      .then((result) => {
        if (cancelled) return;
        setDependencies(result);
        setLoadState('loaded');
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) setLoadState('error');
      });
    return () => {
      cancelled = true;
    };
    // Reload whenever the listing is reloaded (status changes, deletions, pins…).
  }, [service.serviceId, servicesVersion]);

  const incoming = dependencies.filter((dependency) => dependency.direction === 'incoming');
  const outgoing = dependencies.filter((dependency) => dependency.direction === 'outgoing');
  const incomingProblems = incoming.filter((dependency) => dependency.deleted).length;
  const outgoingProblems = outgoing.filter((dependency) => dependency.deleted).length;

  const updatePaths = useCallback(() => {
    const content = contentRef.current;
    const current = currentRef.current;
    if (!content || !current) return;

    const origin = content.getBoundingClientRect();
    const currentRect = current.getBoundingClientRect();
    const currentY = currentRect.top + currentRect.height / 2 - origin.top;
    const nextPaths: string[] = [];

    nodeRefs.current.forEach((node, key) => {
      const rect = node.getBoundingClientRect();
      const y = rect.top + rect.height / 2 - origin.top;
      if (key.startsWith('incoming:')) {
        nextPaths.push(curve(rect.right - origin.left, y, currentRect.left - origin.left, currentY));
      } else {
        nextPaths.push(curve(currentRect.right - origin.left, currentY, rect.left - origin.left, y));
      }
    });

    setPaths(nextPaths);
  }, []);

  useLayoutEffect(() => {
    updatePaths();
    const content = contentRef.current;
    if (!content || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(updatePaths);
    observer.observe(content);
    return () => observer.disconnect();
  }, [updatePaths, dependencies, loadState]);

  const setNodeRef = (key: string) => (element: HTMLDivElement | null) => {
    if (element) nodeRefs.current.set(key, element);
    else nodeRefs.current.delete(key);
  };

  const renderColumn = (direction: ServiceDependencyDirection, items: ServiceDependency[]) => (
    <div className={`dependency-view__column dependency-view__column--${direction}`}>
      {items.length === 0 ? (
        <p className="dependency-view__empty">{t('overview.dependencies.none')}</p>
      ) : (
        items.map((dependency) => (
          <DependencyNode
            key={nodeKey(direction, dependency.serviceId)}
            ref={setNodeRef(nodeKey(direction, dependency.serviceId))}
            dependency={dependency}
            isBeingChecked={!dependency.deleted && serviceIdBeingChecked === dependency.serviceId}
            onOpen={onOpen}
            onLocate={onLocate}
            onActivate={onActivate}
          />
        ))
      )}
    </div>
  );

  const heading = (label: string, problems: number) =>
    problems > 0 ? `${label} · ${t('overview.dependencies.problems', { count: problems })}` : label;

  return (
    <div className="dependency-view">
      <div className="dependency-view__headings">
        <h4 className="dependency-view__heading dependency-view__heading--incoming">
          {heading(t('overview.dependencies.incomingHeading', { count: incoming.length }), incomingProblems)}
        </h4>
        <span />
        <h4 className="dependency-view__heading dependency-view__heading--outgoing">
          {heading(t('overview.dependencies.outgoingHeading', { count: outgoing.length }), outgoingProblems)}
        </h4>
      </div>
      {loadState === 'error' && (
        <p className="dependency-view__status dependency-view__status--error">
          {t('overview.dependencies.loadFailed')}
        </p>
      )}
      {loadState === 'loading' && <p className="dependency-view__status">{t('overview.dependencies.loading')}</p>}
      {loadState === 'loaded' && (
        <div className="dependency-view__scroll">
          <div className="dependency-view__content" ref={contentRef}>
            <svg className="dependency-view__connectors" aria-hidden>
              <defs>
                <marker
                  id={markerId}
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" />
                </marker>
              </defs>
              {paths.map((path, index) => (
                <path key={index} d={path} markerEnd={`url(#${markerId})`} />
              ))}
            </svg>
            {renderColumn('incoming', incoming)}
            <div className="dependency-view__current" ref={currentRef}>
              <span className="dependency-view__current-name" title={service.name}>
                {service.name}
              </span>
              <ServiceStatusChip state={service.state} />
            </div>
            {renderColumn('outgoing', outgoing)}
          </div>
        </div>
      )}
    </div>
  );
};

export default DependencyView;
