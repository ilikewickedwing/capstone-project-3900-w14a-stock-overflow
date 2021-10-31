import React, { useContext, useEffect, useState } from "react"
import PropTypes from "prop-types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Label, ResponsiveContainer } from "recharts";
import CandleStick from "./CandleStick";
import { ApiContext } from "../api";
import { CircularProgress, InputLabel, MenuItem, Select } from "@material-ui/core";
import Ohlc from "./Ohlc";

export const GRAPHCOLORS = {
  INCREASING: '#60CD71',
  DECREASING: '#F14C62'
}

const STATES = {
  LOADING: 0,
  RECEIVED: 1,
  ERROR: 2,
}
export default function StocksGraph(props) {
  const [ state, setState ] = useState(STATES.LOADING);
  // Map of interval to cache
  const [ dataCache, setDataCache ] = useState({});
  const api = useContext(ApiContext);
  const [ graphStyle, setGraphStyle ] = useState("candlestick");
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
    const addToDataCache = (data, interval) => {
      const dataCacheCopy = Object.assign({}, dataCache);
      dataCacheCopy[interval] = data;
      setDataCache(dataCacheCopy);
    }
    // Call from api only if needed
    if (!(timeOptions in dataCache)) {
      setState(STATES.LOADING);
      callApi(props.companyId.toUpperCase(), timeOptions)
      .then(r => r.json())
      .then(r => {
        setState(STATES.RECEIVED);
        addToDataCache(r, timeOptions);
      })
    }
    /**
      NOTE: This may show a warning about not having datacache
      in the dependency list but please leave it out. If you leave it in
      it leads to an infinite useEffect loop - so just ignore the warning
    */
  }, [api, props.companyId, timeOptions, graphStyle])
  const renderLoad = () => {
    if (state === STATES.LOADING) {
      return (<LoadingScreen/>)
    }
    return null;
  }
  const optionsItemStyle = { 
    minWidth: "10%",
    padding: "0.1rem",
    paddingTop: "0.9rem",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "center",
  }
  const headerElemStyle = {
    marginLeft: "0.5rem",
    marginRight: "0.5rem",
  }
  const renderGraphShape = () => {
    if (graphStyle === "candlestick") {
      return (<CandleStick/>)
    } else if (graphStyle === "ohlc") {
      return (<Ohlc/>)
    }
    throw Error("Invalid graph type");
  }
  const getDataKey = () => {
    if (graphStyle === "candlestick") {
      return "openCloseData";
    } else if (graphStyle === "ohlc") {
      return "highLow";
    }
    throw Error("Invalid graph type");
  }
  const renderGraph = () => {
    if (timeOptions in dataCache) {
      return (
        <ResponsiveContainer width={'99%'} height={props.height}>
          <BarChart
            margin={{ bottom: 25, left: 25 }}
            data={transformData(dataCache[timeOptions], graphStyle === "candlestick")}
          >
            <XAxis datakey="time">
              <Label value="Time Interval" offset={-10} position="insideBottom" />
            </XAxis>
            <YAxis 
              label={{ value: 'Price (US Dollars)', angle: -90, position: 'insideLeft', dx: -15 }}
              domain={['dataMin', 'dataMax']} type="number"/>
            <Tooltip content={<StocksToolTip candlestickMode={graphStyle === "candlestick"}/>}/>
            <Bar dataKey={getDataKey()} shape={renderGraphShape()}></Bar>
          </BarChart>
        </ResponsiveContainer>
      )
    }
    return <div style={{ height: props.height }}></div>;
  }
  return (
    <div style={wrapperStyle}>
      <div style={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "flex-end", marginBottom: '1rem' }}>
        <div style={optionsItemStyle}>
          <div style={headerElemStyle}>
            <InputLabel>Interval</InputLabel>
            <Select
              style = {{ marginBottom: '10px' }}
              value={timeOptions}
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
          <div style={headerElemStyle}>
            <InputLabel>Graph</InputLabel>
            <Select
              style = {{ marginBottom: '10px' }}
              value={graphStyle}
              onChange={e => setGraphStyle(e.target.value)}
            >
              <MenuItem value={"candlestick"}>CandleStick</MenuItem>
              <MenuItem value={"ohlc"}>OHLC</MenuItem>
            </Select>
          </div>
        </div>
      </div>
      { renderLoad() }
      { renderGraph() }
    </div>
  )
}

StocksGraph.propTypes = {
  companyId: PropTypes.string,
  height: PropTypes.number,
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
const transformData = (data, candlestickMode = true) => {
  // Find the name of the key
  let timeKey = '';
  for (const dataKey of Object.keys(data)) {
    if (dataKey.includes("Time Series")) {
      timeKey = dataKey;
      break;
    }
  }
  if (timeKey.length === 0) {
    if ("Note" in data) {
      alert(data.Note);
    } else {
      alert(`Received ${data}`);
    }
    return [];
  }
  // Get the data and parse it
  const timeSeriesData = data[timeKey];
  const parsedData = [];
  for (const timeKey of Object.keys(timeSeriesData)) {
    const objData = timeSeriesData[timeKey];
    // Data for candlestick mode
    let newData = {
      time: timeKey,
      openCloseData: [
        Number(objData["1. open"]),
        Number(objData["4. close"]),
      ],
      high: Number(objData["2. high"]),
      low: Number(objData["3. low"]),
      volume: Number(objData["5. volume"]),
    }
    // Data for ohlc
    if (!candlestickMode) {
      newData = {
        time: timeKey,
        open: Number(objData["1. open"]),
        close: Number(objData["4. close"]),
        highLow: [
          Number(objData["2. high"]),
          Number(objData["3. low"]),
        ],
        volume: Number(objData["5. volume"]),
      }
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

function StocksToolTip (props) {
  if (props.active && props.payload && props.payload.length > 0) {
    const dataPoint = props.payload[0].payload;
    const tooltipStyle = {
      backgroundColor: "#ffffff",
      padding: "0.5rem",
      borderRadius: "10px",
      boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
    }
    if (props.candlestickMode) {
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
    } else {
      return (
        <div style={tooltipStyle}>
          <div style={{ fontSize: '20px', fontWeight: '600' }} >{dataPoint.time}</div>
          <div>High: {dataPoint.highLow[0]}</div>
          <div>Low: {dataPoint.highLow[1]}</div>
          <div>Open: {dataPoint.open}</div>
          <div>Close: {dataPoint.close}</div>
          <div>Volume: {dataPoint.volume}</div>
        </div>
      ) 
    }
  }
  return null;
}

StocksToolTip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  candlestickMode: PropTypes.bool
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