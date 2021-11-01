import React from "react";
import { GRAPHCOLORS } from "./StocksGraph";

/**
 * Candle stick shape
 * This is referenced from this code: https://codesandbox.io/s/8m6n8
 */
export default function CandleStick(props) {
  const [ open, close ] = props.openCloseData;
  const isIncreasing = open < close;
  const drawTopBottomLines = () => {
    const heightRatio = Math.abs(props.height / (open - close));
    if (Number.isNaN(heightRatio) || !Number.isFinite(heightRatio)) {
      return null;
    }
    return (
      <React.Fragment>
        {/* bottom line */}
        {isIncreasing ? (
          <path
            d={`
              M ${props.x + props.width / 2}, ${props.y + props.height}
              v ${(open - props.low) * heightRatio}
            `}
          />
        ) : (
          <path
            d={`
              M ${props.x + props.width / 2}, ${props.y}
              v ${(close - props.low) * heightRatio}
            `}
          />
        )}
        {/* top line */}
        {isIncreasing ? (
          <path
            d={`
              M ${props.x + props.width / 2}, ${props.y}
              v ${(close - props.high) * heightRatio}
            `}
          />
        ) : (
          <path
            d={`
              M ${props.x + props.width / 2}, ${props.y + props.height}
              v ${(open - props.high) * heightRatio}
            `}
          />
        )}
      </React.Fragment>
    )
  }
  const color = isIncreasing ? GRAPHCOLORS.INCREASING : GRAPHCOLORS.DECREASING;
  return (
    <g
      stroke={color} fill={color} strokeWidth="2">
      <path
        d={`
          M ${props.x},${props.y}
          L ${props.x},${props.y + props.height}
          L ${props.x + props.width},${props.y + props.height}
          L ${props.x + props.width},${props.y}
          L ${props.x},${props.y}
        `}
      />
      { drawTopBottomLines() }
    </g>
  );
}