import React from "react";
import { GRAPHCOLORS } from "./StocksGraph";

/**
 * Ohlc shape
 */
export default function Ohlc(props) {
  console.log(props);
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
        {/* {isIncreasing ? (
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
        )} */}
        <path
            d={`
              M ${props.x}, ${props.y + (props.open - high) * heightRatio}
              h ${xIncrem}
            `}
          />
        {/* close line */}
        <path
            d={`
              M ${props.x + props.width}, ${props.y + (props.close - high) * heightRatio}
              h ${-1 * xIncrem}
            `}
          />
      </React.Fragment>
    )
  }
  const color = isIncreasing ? GRAPHCOLORS.INCREASING : GRAPHCOLORS.DECREASING;
  return (
    <g
      stroke={color} fill={color} strokeWidth="4">
      <path
        d={`
          M ${props.x + xIncrem},${props.y}
          L ${props.x + xIncrem},${props.y + props.height}
          L ${props.x + props.width - xIncrem},${props.y + props.height}
          L ${props.x + props.width - xIncrem},${props.y}
          L ${props.x + xIncrem},${props.y}
        `}
      />
      { drawOpenCloseLines() }
    </g>
  );
}