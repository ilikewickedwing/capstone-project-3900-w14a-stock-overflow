import React, { useContext, useEffect, useState } from "react"
import PropTypes from "prop-types";
import { BarChart, Bar, XAxis, YAxis, Legend } from "recharts";
import { ApiContext } from "../api";
import { InputLabel, MenuItem, Select } from "@material-ui/core";

export default function StocksGraph(props) {
  const [ data, setData ] = useState([]);
  const api = useContext(ApiContext);
  const [ timeOptions, setTimeOptions ] = useState("1d");
  const wrapperStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  }
  // make api call for time series
  useEffect(() => {
    api.stockTimeSeries(props.companyId)
      .then(r => r.json())
      .then(r => setData(transformData(r)))
  }, [api, props.companyId])
  return (
    <div style={wrapperStyle}>
      <BarChart
        width={1000}
        height={600}
        data={data}
      >
        <XAxis datakey="time"/>
        <YAxis domain={['dataMin', 'dataMax']} type="number"/>
        <Bar dataKey='openCloseData' shape={<CandleStick/>}></Bar>
        <Legend/>
      </BarChart>
      <InputLabel>Time</InputLabel>
      <Select
        value={timeOptions}
        label="Time"
        onChange={e => setTimeOptions(e.target.value)}
      >
        <MenuItem value={"1d"}>1 day</MenuItem>
        <MenuItem value={"5d"}>5 days</MenuItem>
        <MenuItem value={"1m"}>1 month</MenuItem>
        <MenuItem value={"6m"}>6 month</MenuItem>
        <MenuItem value={"1y"}>1 year</MenuItem>
        <MenuItem value={"5y"}>5 years</MenuItem>
        <MenuItem value={"10y"}>10 years</MenuItem>
      </Select>
    </div>
  )
}

StocksGraph.propTypes = {
  companyId: PropTypes.string
}

// Compares to time periods
const compareTime = (time1, time2) => {
  const t1 = Date.parse(time1);
  const t2 = Date.parse(time2);
  return t1 < t2;
}

/**
 * Transforms stocks data to what is needed
 * @param {*} data 
 * @returns 
 */
const transformData = (data) => {
  const timeSeriesData = data["Time Series (5min)"];
  const parsedData = [];
  for (const timeKey of Object.keys(timeSeriesData)) {
    const objData = timeSeriesData[timeKey];
    const newData = {
      time: timeKey,
      openCloseData: [
        Number(objData["1. open"]),
        Number(objData["4. close"]),
      ],
      high: Number(objData["2. high"]),
      low: Number(objData["3. low"]),
      volume: Number(objData["5. volume"]),
    }
    let i = 0;
    for (; i < parsedData.length; i++) {
      if (compareTime(timeKey, parsedData[i].time)) {
        break;
      }
    }
    parsedData.splice(i, 0, newData);
  }
  return parsedData;
}

const GRAPHCOLORS = {
  INCREASING: '#60CD71',
  DECREASING: '#F14C62'
}

/**
 * Candle stick shape
 * This is referenced from this code: https://codesandbox.io/s/8m6n8
 */
function CandleStick(props) {
  const [ open, close ] = props.openCloseData;
  const isIncreasing = open < close;
  const drawTopBottomLines = () => {
    const heightRatio = Math.abs(props.height / (open - close));
    if (Number.isNaN(heightRatio)) {
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