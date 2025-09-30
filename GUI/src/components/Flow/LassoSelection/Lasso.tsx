import { useRef, type PointerEvent, useEffect } from 'react';
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

  function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
    const [x, y] = point;
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  }

  function calculateIntersectionArea(nodeId: string, polygon: [number, number][]): number {
    const node = nodeLookup.get(nodeId);
    if (!node) return 0;

    const { x, y } = node.internals.positionAbsolute;
    const { width = 0, height = 0 } = node.measured;
    
    const nodeBounds = [
      flowToScreenPosition({ x, y }),
      flowToScreenPosition({ x: x + width, y }),
      flowToScreenPosition({ x: x + width, y: y + height }),
      flowToScreenPosition({ x, y: y + height }),
    ];

    let cornersInside = 0;
    for (const corner of nodeBounds) {
      if (isPointInPolygon([corner.x, corner.y], polygon)) {
        cornersInside++;
      }
    }

    const center = flowToScreenPosition({ x: x + width / 2, y: y + height / 2 });
    const centerInside = isPointInPolygon([center.x, center.y], polygon);

    return centerInside ? 1 : cornersInside / 4;
  }

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
      if (node.type === 'start' || node.type === 'ghost') {
        continue;
      }

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

    const closedPolygon = [...pointRef.current, pointRef.current[0]] as [number, number][];
    const path = new Path2D(getSvgPathFromStroke(pointRef.current));

    ctx.current.clearRect(0, 0, width, height);
    ctx.current.fill(path);
    ctx.current.stroke(path);

    const nodesToSelect = new Set<string>();

    for (const nodeId of Object.keys(nodePoints.current)) {
      const intersectionArea = calculateIntersectionArea(nodeId, closedPolygon);
      
      if (intersectionArea >= 0.7) {
        nodesToSelect.add(nodeId);
      }
    }

    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.type === 'start' || node.type === 'ghost') {
          return node;
        }

        const shouldSelect = nodesToSelect.has(node.id);
        
        return {
          ...node,
          selected: shouldSelect,
        };
      }),
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNodes((nodes) =>
          nodes.map((node) => ({
            ...node,
            selected: false,
          })),
        );
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setNodes]);

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
