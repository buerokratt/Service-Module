import { useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useTheme } from '../utils/useTheme';

export function useThemeSyncWithFlow() {
    const { setNodes } = useReactFlow();
    const theme = useTheme();

    useEffect(() => {
        setNodes((nodes) =>
            nodes.map((node) => {
                if (
                    node.className?.includes('step') ||
                    node.className?.includes('finishing-step')
                ) {
                    const newClassName = node.className
                        .replace(/\b(light|dark)\b/g, '')
                        .trim() + ` ${theme}`;
                    return { ...node, className: newClassName };
                }
                return node;
            })
        );
    }, [theme, setNodes]);
}