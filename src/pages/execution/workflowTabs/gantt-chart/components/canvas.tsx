import { canvasHeightAtom, canvasWidthAtom, marginLeftAtom } from '../atoms';
import { white } from '../../../../../theme/colors';
import { useAtomValue } from 'jotai';
import React from 'react';
import type { Styles } from '../types';

export interface CanvasProps {
    styles?: Pick<Styles, 'canvas'>;
}
export function Canvas({ styles }: CanvasProps) {
    const marginLeft = useAtomValue(marginLeftAtom);
    const canvasWidth = useAtomValue(canvasWidthAtom);
    const canvasHeight = useAtomValue(canvasHeightAtom);

    return (
        <g transform={`translate(${marginLeft})`}>
            <rect
                fill={white}
                width={canvasWidth}
                height={canvasHeight}
                className={styles?.canvas?.className}
                style={{
                    ...(styles?.canvas?.style || {}),
                    ...{
                        cursor: 'crosshair',
                    },
                }}
            />
        </g>
    );
}
