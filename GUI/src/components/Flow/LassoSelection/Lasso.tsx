import { useRef, type PointerEvent, useEffect } from 'react';
import { useReactFlow, useStore } from '@xyflow/react';
import { getSvgPathFromStroke } from 'utils/lasso-utils';

type NodePoints = ([number, number] | [number, number, number])[];
type NodePointObject = Record<string, NodePoints>;

export function Lasso() {
  const { screenToFlowPosition, setNodes } = useReactFlow();
  const { width, height, nodeLookup } = useStore((state) => ({
    width: state.width,
    height: state.height,
    nodeLookup: state.nodeLookup,
  }));
  const canvas = useRef<HTMLCanvasElement>(null);
  const ctx = useRef<CanvasRenderingContext2D | undefined | null>(null);

  const nodePoints = useRef<NodePointObject>({});
  const pointRef = useRef<[number, number][]>([]);
  const isDrawing = useRef(false);
  const startPoint = useRef<[number, number] | null>(null);

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

  function calculatePolygonArea(polygon: [number, number][]): number {
    if (polygon.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < polygon.length; i++) {
      const j = (i + 1) % polygon.length;
      area += polygon[i][0] * polygon[j][1];
      area -= polygon[j][0] * polygon[i][1];
    }
    return Math.abs(area) / 2;
  }

  function calculateIntersectionArea(nodeId: string, polygon: [number, number][]): number {
    const node = nodeLookup.get(nodeId);
    if (!node) return 0;

    const { x, y } = node.internals.positionAbsolute;
    const { width = 0, height = 0 } = node.measured;
    
    // Use flow coordinates directly since polygon is now in flow coordinates
    const nodeBounds = [
      [x, y],
      [x + width, y],
      [x + width, y + height],
      [x, y + height],
    ] as [number, number][];

    let cornersInside = 0;
    for (const corner of nodeBounds) {
      if (isPointInPolygon(corner, polygon)) {
        cornersInside++;
      }
    }

    const center = [x + width / 2, y + height / 2] as [number, number];
    const centerInside = isPointInPolygon(center, polygon);

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
    startPoint.current = [x, y];

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

    // Convert screen coordinates to flow coordinates for testing
    // Use the actual client coordinates directly, just like in flow-builder.ts
    const flowPoints = pointRef.current.map(([canvasX, canvasY]) => {
      // Convert canvas coordinates back to client coordinates
      const clientX = canvasX + rect.left;
      const clientY = canvasY + rect.top;
      const flowPos = screenToFlowPosition({ x: clientX, y: clientY });
      return [flowPos.x, flowPos.y] as [number, number];
    });
    
    
    // Create a simple polygon from the flow coordinates for testing
    const closedPolygon = [...flowPoints, flowPoints[0]] as [number, number][];
    
    // Create the smooth path for visual display
    const path = new Path2D(getSvgPathFromStroke(pointRef.current));

    ctx.current.clearRect(0, 0, width, height);
    ctx.current.fill(path);
    ctx.current.stroke(path);

    const nodesToSelect = new Set<string>();

    // Only perform selection if the polygon has a meaningful area (minimum 100 square pixels)
    // and the user has dragged a reasonable distance (minimum 10 pixels)
    const polygonArea = calculatePolygonArea(closedPolygon);
    const hasMinimumDrag = startPoint.current && 
      pointRef.current.length > 1 && 
      Math.sqrt(
        Math.pow(pointRef.current[pointRef.current.length - 1][0] - startPoint.current[0], 2) + 
        Math.pow(pointRef.current[pointRef.current.length - 1][1] - startPoint.current[1], 2)
      ) >= 10;
    
    // Use a more conservative approach - only select if we have a meaningful selection
    if (polygonArea >= 200 && hasMinimumDrag && pointRef.current.length >= 3) {
      for (const nodeId of Object.keys(nodePoints.current)) {
        const intersectionArea = calculateIntersectionArea(nodeId, closedPolygon);
        
        if (intersectionArea >= 0.7) {
          nodesToSelect.add(nodeId);
        }
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
    startPoint.current = null;
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
