import { useReactFlow, useStore } from '@xyflow/react';
import { type PointerEvent, useCallback, useEffect, useRef } from 'react';
import { getSvgPathFromStroke } from 'utils/lasso-utils';

type Point = [number, number];
type NodeBounds = Record<string, Point[]>;

export function Lasso() {
  const { screenToFlowPosition, setNodes } = useReactFlow();
  const { width, height, nodeLookup } = useStore((state) => ({
    width: state.width,
    height: state.height,
    nodeLookup: state.nodeLookup,
  }));

  const canvas = useRef<HTMLCanvasElement>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const nodeBounds = useRef<NodeBounds>({});
  const points = useRef<Point[]>([]);
  const isDrawing = useRef(false);
  const startPoint = useRef<Point | null>(null);

  const isPointInPolygon = (point: Point, polygon: Point[]): boolean => {
    const [x, y] = point;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];

      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
  };

  const getPolygonArea = (polygon: Point[]): number => {
    if (polygon.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < polygon.length; i++) {
      const j = (i + 1) % polygon.length;
      area += polygon[i][0] * polygon[j][1] - polygon[j][0] * polygon[i][1];
    }
    return Math.abs(area) / 2;
  };

  const getNodeIntersectionRatio = (nodeId: string, polygon: Point[]): number => {
    const node = nodeLookup.get(nodeId);
    if (!node) return 0;

    const { x, y } = node.internals.positionAbsolute;
    const { width = 0, height = 0 } = node.measured;

    const corners = [
      [x, y],
      [x + width, y],
      [x + width, y + height],
      [x, y + height],
    ] as Point[];

    const cornersInside = corners.filter((corner) => isPointInPolygon(corner, polygon)).length;
    const center = [x + width / 2, y + height / 2] as Point;
    const centerInside = isPointInPolygon(center, polygon);

    return centerInside ? 1 : cornersInside / 4;
  };

  const handlePointerDown = (e: PointerEvent) => {
    if (!canvas.current) return;

    canvas.current.setPointerCapture(e.pointerId);
    isDrawing.current = true;

    const rect = canvas.current.getBoundingClientRect();
    const point: Point = [e.clientX - rect.left, e.clientY - rect.top];

    points.current = [point];
    startPoint.current = point;

    nodeBounds.current = {};
    for (const node of nodeLookup.values()) {
      if (node.type === 'start' || node.type === 'ghost') continue;

      const { x, y } = node.internals.positionAbsolute;
      const { width = 0, height = 0 } = node.measured;
      nodeBounds.current[node.id] = [
        [x, y],
        [x + width, y],
        [x + width, y + height],
        [x, y + height],
      ];
    }

    ctx.current = canvas.current.getContext('2d');
    if (!ctx.current) return;

    Object.assign(ctx.current, {
      lineWidth: 2,
      fillStyle: 'rgba(0, 89, 220, 0.1)',
      strokeStyle: 'rgba(0, 89, 220, 0.8)',
      setLineDash: [5, 5],
    });
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDrawing.current || !ctx.current || !canvas.current) return;

    const rect = canvas.current.getBoundingClientRect();
    const point: Point = [e.clientX - rect.left, e.clientY - rect.top];
    points.current.push(point);

    const flowPoints = points.current.map(([canvasX, canvasY]) => {
      const clientX = canvasX + rect.left;
      const clientY = canvasY + rect.top;
      const flowPos = screenToFlowPosition({ x: clientX, y: clientY });
      return [flowPos.x, flowPos.y] as Point;
    });

    const closedPolygon = [...flowPoints, flowPoints[0]];
    const path = new Path2D(getSvgPathFromStroke(points.current));

    ctx.current.clearRect(0, 0, width, height);
    ctx.current.fill(path);
    ctx.current.stroke(path);

    const polygonArea = getPolygonArea(closedPolygon);
    const lastPoint = points.current.at(-1);
    const hasMinimumDrag =
      startPoint.current &&
      lastPoint &&
      points.current.length > 1 &&
      Math.hypot(lastPoint[0] - startPoint.current[0], lastPoint[1] - startPoint.current[1]) >= 10;

    const nodesToSelect = new Set<string>();
    if (polygonArea >= 200 && hasMinimumDrag && points.current.length >= 3) {
      for (const nodeId of Object.keys(nodeBounds.current)) {
        if (getNodeIntersectionRatio(nodeId, closedPolygon) >= 0.7) {
          nodesToSelect.add(nodeId);
        }
      }
    }

    setNodes((nodes) =>
      nodes.map((node) => ({
        ...node,
        selected: node.type !== 'start' && node.type !== 'ghost' && nodesToSelect.has(node.id),
      })),
    );
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (!canvas.current) return;

    canvas.current.releasePointerCapture(e.pointerId);
    isDrawing.current = false;

    if (ctx.current) {
      ctx.current.clearRect(0, 0, width, height);
    }
    points.current = [];
    startPoint.current = null;
  };

  const clearSelection = useCallback(
    () => setNodes((nodes) => nodes.map((node) => ({ ...node, selected: false }))),
    [setNodes],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') clearSelection();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [clearSelection]);

  return (
    <canvas
      ref={canvas}
      width={width}
      height={height}
      className="lasso-overlay"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        cursor: 'crosshair',
        pointerEvents: 'auto',
      }}
    />
  );
}
