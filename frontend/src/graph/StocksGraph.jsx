import React, { useContext, useEffect, useState } from "react"
import PropTypes from "prop-types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Label, ResponsiveContainer } from "recharts";
import CandleStick from "./CandleStick";
import { ApiContext } from "../api";
import Ohlc from "./Ohlc";
import GraphOptions from "./GraphOptions";
import StocksToolTip from "./StocksToolTip";
import LoadingScreen from "./GraphLoading";

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
        console.log(r);
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
      <GraphOptions
        timeOptions={timeOptions}
        setTimeOptions={setTimeOptions}
        graphStyle={graphStyle}
        setGraphStyle={setGraphStyle}
      />
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
