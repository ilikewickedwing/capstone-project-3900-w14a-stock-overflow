import React from "react";
import { GRAPHCOLORS } from "./StocksGraph";

/**
 * Ohlc shape
 */
export default function Ohlc(props) {
  const [ high, low ] = props.highLow;
  const isIncreasing = props.open < props.close;
  const xIncrem = props.width / 3;
  const drawOpenCloseLines = () => {
    const heightRatio = Math.abs(props.height / (high - low));
    if (Number.isNaN(heightRatio) || !Number.isFinite(heightRatio)) {
      return null;
    }
    return (
      <React.Fragment>
        {/* open line */}
        <path
            d={`
              M ${props.x - 0.75 * xIncrem}, ${props.y + (props.open - high) * heightRatio}
              h ${1.5 * xIncrem}
            `}
          />
        {/* close line */}
        <path
            d={`
              M ${props.x + props.width + 0.75 * xIncrem}, ${props.y + (props.close - high) * heightRatio}
              h ${-1.5 * xIncrem}
            `}
          />
      </React.Fragment>
    )
  }
  const color = isIncreasing ? GRAPHCOLORS.INCREASING : GRAPHCOLORS.DECREASING;
  return (
    <g
      stroke={color} fill={color} strokeWidth="2">
      <path
        d={`
          M ${props.x + xIncrem},${props.y}
          L ${props.x + xIncrem},${props.y + props.height}
          L ${props.x + props.width - xIncrem},${props.y + props.height}
          L ${props.x + props.width - xIncrem},${props.y}
        `}
      />
      { drawOpenCloseLines() }
    </g>
  );
}