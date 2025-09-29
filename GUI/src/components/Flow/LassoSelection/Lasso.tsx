import { useRef, type PointerEvent } from 'react';
import { useReactFlow, useStore } from '@xyflow/react';
import { getSvgPathFromStroke } from 'utils/lasso-utils';

type NodePoints = ([number, number] | [number, number, number])[];
type NodePointObject = Record<string, NodePoints>;

export function Lasso() {
  const { flowToScreenPosition, setNodes } = useReactFlow();
  const { width, height, nodeLookup } = useStore((state) => ({
    width: state.width,
    height: state.height,
    nodeLookup: state.nodeLookup,
    transform: state.transform,
  }));
  const canvas = useRef<HTMLCanvasElement>(null);
  const ctx = useRef<CanvasRenderingContext2D | undefined | null>(null);

  const nodePoints = useRef<NodePointObject>({});
  const pointRef = useRef<[number, number][]>([]);
  const isDrawing = useRef(false);

  function handlePointerDown(e: PointerEvent) {
    if (!canvas.current) return;

    canvas.current.setPointerCapture(e.pointerId);
    isDrawing.current = true;

    const rect = canvas.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    pointRef.current = [[x, y]];

    nodePoints.current = {};
    for (const node of nodeLookup.values()) {
      const { x, y } = node.internals.positionAbsolute;
      const { width = 0, height = 0 } = node.measured;
      const points = [
        [x, y],
        [x + width, y],
        [x + width, y + height],
        [x, y + height],
      ] satisfies NodePoints;
      nodePoints.current[node.id] = points;
    }

    ctx.current = canvas.current.getContext('2d');
    if (!ctx.current) return;

    ctx.current.lineWidth = 2;
    ctx.current.fillStyle = 'rgba(0, 89, 220, 0.1)';
    ctx.current.strokeStyle = 'rgba(0, 89, 220, 0.8)';
    ctx.current.setLineDash([5, 5]);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDrawing.current || !ctx.current) return;

    const rect = canvas.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    pointRef.current = [...pointRef.current, [x, y]];

    const path = new Path2D(getSvgPathFromStroke(pointRef.current));

    ctx.current.clearRect(0, 0, width, height);
    ctx.current.fill(path);
    ctx.current.stroke(path);

    const nodesToSelect = new Set<string>();

    for (const [nodeId, points] of Object.entries(nodePoints.current)) {
      for (const point of points) {
        const screenPoint = flowToScreenPosition({ x: point[0], y: point[1] });
        if (ctx.current.isPointInPath(path, screenPoint.x, screenPoint.y)) {
          nodesToSelect.add(nodeId);
          break;
        }
      }
    }

    setNodes((nodes) =>
      nodes.map((node) => ({
        ...node,
        selected: nodesToSelect.has(node.id),
      })),
    );
  }

  function handlePointerUp(e: PointerEvent) {
    if (!canvas.current) return;

    canvas.current.releasePointerCapture(e.pointerId);
    isDrawing.current = false;

    if (ctx.current) {
      ctx.current.clearRect(0, 0, width, height);
    }
    pointRef.current = [];
  }

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
