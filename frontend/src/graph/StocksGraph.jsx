import React, { useContext, useEffect, useState } from "react"
import PropTypes from "prop-types";
import { BarChart, Bar, XAxis, YAxis, Legend, Tooltip, Label, ResponsiveContainer } from "recharts";
import { ApiContext } from "../api";
import { CircularProgress, InputLabel, MenuItem, Select } from "@material-ui/core";


const STATES = {
  LOADING: 0,
  RECEIVED: 1,
  ERROR: 2,
}
export default function StocksGraph(props) {
  const [ state, setState ] = useState(STATES.LOADING);
  const [ data, setData ] = useState([]);
  const api = useContext(ApiContext);
  const [ timeOptions, setTimeOptions ] = useState("1day");
  const wrapperStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
  }
  // make api call for time series
  useEffect(() => {
    const callApi = (company, interval) => {
      switch (interval) {
        case "1min":
          return api.stockTimeSeriesIntraday(company, interval);
        case "5min":
          return api.stockTimeSeriesIntraday(company, interval);
        case "15min":
          return api.stockTimeSeriesIntraday(company, interval);
        case "30min":
          return api.stockTimeSeriesIntraday(company, interval);
        case "60min":
          return api.stockTimeSeriesIntraday(company, interval);
        case "1day":
          return api.stockTimeSeriesDaily(company);
        case "1week":
          return api.stockTimeSeriesWeekly(company);
        case "1month":
          return api.stockTimeSeriesMonthly(company);
        default:
          throw Error(`Invalid interval of ${interval}`);
      }
    }
    setState(STATES.LOADING);
    callApi(props.companyId.toUpperCase(), timeOptions)
      .then(r => r.json())
      .then(r => {
        setState(STATES.RECEIVED);
        setData(transformData(r));
      })
  }, [api, props.companyId, timeOptions])
  const renderLoad = () => {
    if (state === STATES.LOADING) {
      return (<LoadingScreen/>)
    }
    return null;
  }
  const optionsItemStyle = { 
    minWidth: "10%",
    boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
    padding: "0.7rem",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "center",
  }
  return (
    <div style={wrapperStyle}>
      <div style={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "flex-start", marginBottom: '1rem' }}>
        <div style={optionsItemStyle}>
          <div>
            <InputLabel>Interval</InputLabel>
            <Select
              style = {{ marginBottom: '10px' }}
              value={timeOptions}
              label="Time"
              onChange={e => setTimeOptions(e.target.value)}
            >
              <MenuItem value={"1min"}>1 min</MenuItem>
              <MenuItem value={"5min"}>5 min</MenuItem>
              <MenuItem value={"15min"}>15 min</MenuItem>
              <MenuItem value={"30min"}>30 min</MenuItem>
              <MenuItem value={"60min"}>1 hour</MenuItem>
              <MenuItem value={"1day"}>1 day</MenuItem>
              <MenuItem value={"1week"}>1 week</MenuItem>
              <MenuItem value={"1month"}>1 month</MenuItem>
            </Select>
          </div>
        </div>
      </div>
      { renderLoad() }
      <ResponsiveContainer width={'99%'} height={300}>
        <BarChart
          margin={{ bottom: 25 }}
          data={data}
        >
          <XAxis datakey="time">
            <Label value="Time" offset={-10} position="insideBottom" />
          </XAxis>
          <YAxis 
            label={{ value: 'Price (US Dollars)', angle: -90, position: 'insideLeft' }}
            domain={['dataMin', 'dataMax']} type="number"/>
          <Tooltip content={<StocksToolTip/>}/>
          <Bar dataKey='openCloseData' shape={<CandleStick/>}></Bar>
        </BarChart>
      </ResponsiveContainer>
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
  // Find the name of the key
  let timeKey = '';
  for (const dataKey of Object.keys(data)) {
    if (dataKey.includes("Time Series")) {
      timeKey = dataKey;
      break;
    }
  }
  if (timeKey.length === 0) {
    console.log(data);
    alert(`Received ${data}`);
    return [];
  }
  // Get the data and parse it
  const timeSeriesData = data[timeKey];
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
    // Sort it into an array as it is returned as
    // an object
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

function StocksToolTip (props) {
  if (props.active && props.payload && props.payload.length > 0) {
    const dataPoint = props.payload[0].payload;
    const tooltipStyle = {
      backgroundColor: "#ffffff",
      padding: "0.5rem",
      borderRadius: "10px",
      boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
    }
    return (
      <div style={tooltipStyle}>
        <div style={{ fontSize: '20px', fontWeight: '600' }} >{dataPoint.time}</div>
        <div>High: {dataPoint.high}</div>
        <div>Low: {dataPoint.low}</div>
        <div>Open: {dataPoint.openCloseData[0]}</div>
        <div>Close: {dataPoint.openCloseData[1]}</div>
        <div>Volume: {dataPoint.volume}</div>
      </div>
    ) 
  }
  return null;
}

function LoadingScreen() {
  const loadingStyle = {
    position: "absolute",
    opacity: "0.8",
    zIndex: '999',
    backgroundColor: "#000000",
    width: "100%",
    height: "100%",
    display: "grid",
    placeItems: "center",
  }
  return (
    <div style={loadingStyle}>
      <CircularProgress style={{ opacity: "1" }}/>
    </div>
  )
}