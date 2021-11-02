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
  // Map of companyid to interval to cache
  const [ dataCache, setDataCache ] = useState({});
  const api = useContext(ApiContext);
  const [ graphStyle, setGraphStyle ] = useState("candlestick");
  const [ timeOptions, setTimeOptions ] = useState("daily");
  const wrapperStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
  }
  
  // make api call for time series
  useEffect(() => {
    const callApi = (company, interval) => {
      const today = new Date();
      const now = new Date(today);
      switch (interval) {
        case "1min": {
          const start = new Date();
          start.setDate(now.getDate()-1);
          const time = start.getFullYear() + '-' + ('0' + (start.getMonth() + 1)).slice(-2) + '-' + ('0' + start.getDate()).slice(-2) + " 00:00";
          return api.stocksInfo(3, company, interval, time.toString());
        }
        case "5min": {
          const start = new Date();
          start.setDate(now.getDate()-1);
          const time = start.getFullYear() + '-' + ('0' + (start.getMonth() + 1)).slice(-2) + '-' + ('0' + start.getDate()).slice(-2) + " 00:00";
          return api.stocksInfo(3, company, interval, time.toString());
        }
        case "15min": {
          const start = new Date();
          start.setDate(now.getDate()-1);
          const time = start.getFullYear() + '-' + ('0' + (start.getMonth() + 1)).slice(-2) + '-' + ('0' + start.getDate()).slice(-2) + " 00:00";
          return api.stocksInfo(3, company, interval, time.toString());
        }
        case "daily":
          return api.stocksInfo(2, company, interval, null);
        case "weekly":
          return api.stocksInfo(2, company, interval, null);
        case "monthly":
          return api.stocksInfo(2, company, interval, null);
        default:
          throw Error(`Invalid interval of ${interval}`);
      }
    }
    const addToDataCache = (data, interval) => {
      const dataCacheCopy = Object.assign({}, dataCache);
      // Add current company id if the current company id is not in dataCache
      if (!(props.companyId in dataCacheCopy)) {
        dataCacheCopy[props.companyId] = {};
      }
      dataCacheCopy[props.companyId][interval] = data;
      setDataCache(dataCacheCopy);
    }
    // Call from api only if needed
    if (!(props.companyId in dataCache) || !(timeOptions in dataCache[props.companyId])) {
      setState(STATES.LOADING);
      callApi(props.companyId.toUpperCase(), timeOptions)
      .then(r => r.json())
      .then(r => {
        console.log(r);
        setState(STATES.RECEIVED);
        addToDataCache(r, timeOptions);
      })
      .catch((error) => console.log(error))
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
    if (props.companyId in dataCache && timeOptions in dataCache[props.companyId]) {
      const data = transformData(dataCache[props.companyId][timeOptions], graphStyle === "candlestick");
      // console.log(data);
      return (
        <ResponsiveContainer width={'99%'} height={props.height}>
          <BarChart
            margin={{ bottom: 25, left: 25 }}
            data={data}
          >
            <XAxis dataKey="time">
              <Label value="Time Interval" offset={-10} position="insideBottom" />
            </XAxis>
            <YAxis 
              label={{ value: 'Price (US Dollars)', angle: -90, position: 'insideLeft', dx: -15, dy: 20 }}
              domain={['dataMin', 'dataMax ']} type="number"/>
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

/**
 * Transforms stocks data to what is needed
 * @param {*} data 
 * @returns 
 */
const transformData = (data, candlestickMode = true) => {
  // console.log(data);
  if ('series' in data.data) {
    return transformIntradayData(data, candlestickMode);
  } else if ('history' in data.data) {
    return transformNonIntradayData(data, candlestickMode)
  }
  throw new Error("Invalid data received");
}
  
function transformIntradayData(data, candlestickMode = true) {
  let timeSeriesData = data.data.series.data;
  return timeSeriesData.map(d => {
    let newData = {
      time: d.time,
      openCloseData: [
        Number(d.open),
        Number(d.close),
      ],
      high: Number(d.high),
      low: Number(d.low),
      volume: Number(d.volume),
    }
    // Data for ohlc
    if (!candlestickMode) {
      newData = {
        time: d.time,
        open: Number(d.open),
        close: Number(d.close),
        highLow: [
          Number(d.high),
          Number(d.low),
        ],
        volume: Number(d.volume),
      }
    }
    return newData;
  });
}
 
function transformNonIntradayData(data, candlestickMode = true) {
  let timeSeriesData = data.data.history.day;
  return timeSeriesData.map(d => {
    let newData = {
      time: d.date,
      openCloseData: [
        Number(d.open),
        Number(d.close),
      ],
      high: Number(d.high),
      low: Number(d.low),
      volume: Number(d.volume),
    }
    // Data for ohlc
    if (!candlestickMode) {
      newData = {
        time: d.date,
        open: Number(d.open),
        close: Number(d.close),
        highLow: [
          Number(d.high),
          Number(d.low),
        ],
        volume: Number(d.volume),
      }
    }
    return newData;
  });
}

