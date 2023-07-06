import {
    canvasHeightAtom,
    canvasWidthAtom,
    highlightActionsAtom,
    leftDragAtom,
    marginLeftAtom,
    rightDragAtom,
} from '../atoms';
import { colors } from '../internal/utils';
import { useAtomValue } from 'jotai';
import { useGanttContext } from '../internal/gantt-context';
import { useUpdateAtom } from 'jotai/utils';
import React, { useCallback, useEffect } from 'react';
import type { CSSProperties, PropsWithChildren } from 'react';

export function Highlight({ children }: PropsWithChildren<unknown>) {
    const leftDrag = useAtomValue(leftDragAtom);
    const rightDrag = useAtomValue(rightDragAtom);
    const setHighlightActions = useUpdateAtom(highlightActionsAtom);
    const canvasHeight = useAtomValue(canvasHeightAtom);
    const canvasWidth = useAtomValue(canvasWidthAtom);
    const marginLeft = useAtomValue(marginLeftAtom);

    const HighlightActions = useCallback(function HighlightActions({
        children,
    }: PropsWithChildren<unknown>) {
        const { ref } = useGanttContext();

        const rightDrag = useAtomValue(rightDragAtom);

        const dragActionsStyles: CSSProperties = (() => {
            const marginTop = 8;
            const marginLeft = 10;
            return {
                top:
                    ref.current?.getBoundingClientRect().y +
                        window.scrollY +
                        marginTop || 0,
                left:
                    rightDrag +
                    ref.current?.getBoundingClientRect().x +
                    marginLeft,
            };
        })();

        return (
            <div style={{ position: 'absolute', ...dragActionsStyles }}>
                {children}
            </div>
        );
    },
    []);

    useEffect(() => {
        setHighlightActions(<HighlightActions>{children}</HighlightActions>);
    }, [HighlightActions, children, setHighlightActions]);

    return leftDrag !== rightDrag ? (
        <g
            style={{
                cursor: 'ew-resize',
            }}
        >
            <g transform={`translate(${marginLeft})`}>
                <rect
                    fill={colors.grayDark}
                    opacity={0.7}
                    width={Math.abs(leftDrag - marginLeft)}
                    height={canvasHeight}
                />
            </g>
            <g transform={`translate(${leftDrag})`}>
                <rect
                    opacity={0}
                    width={Math.abs(rightDrag - leftDrag - marginLeft)}
                    height={canvasHeight}
                />
            </g>
            <g transform={`translate(${rightDrag})`}>
                <rect
                    fill={colors.grayDark}
                    opacity={0.7}
                    width={canvasWidth - rightDrag + marginLeft}
                    height={canvasHeight}
                />
            </g>
        </g>
    ) : (
        <></>
    );
}