import React, { useContext, useEffect, useState } from "react"
import PropTypes from "prop-types";
import { BarChart, Legend, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import CandleStick from "./CandleStick";
import { ApiContext } from "../api";
import Ohlc from "./Ohlc";
import GraphOptions from "./GraphOptions";
import StocksToolTip from "./StocksToolTip";
import LoadingScreen from "./GraphLoading";
import randomColor from "randomcolor";

export const GRAPHCOLORS = {
  INCREASING: '#60CD71',
  DECREASING: '#F14C62',
}

const STATES = {
  LOADING: 0,
  RECEIVED: 1,
  ERROR: 2,
}

/**
 * Graph component that displays stocks data
 * @param {*} props 
 * @returns 
 */
export default function StocksGraph(props) {
  const [ state, setState ] = useState(STATES.LOADING);
  // Map of companyid to interval to cache
  const [ dataCache, setDataCache ] = useState({});
  const api = useContext(ApiContext);
  const [ graphStyle, setGraphStyle ] = useState("line");
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
        /*
        case "1 day": {
          const start = new Date();
          start.setDate(now.getDate()-1);
          const time = start.getFullYear() + '-' + ('0' + (start.getMonth() + 1)).slice(-2) + '-' + ('0' + start.getDate()).slice(-2) + " 00:00";
          return api.stocksInfo(3, company, '1min', time.toString());
        }
        case "5 day": {
          const start = new Date();
          start.setDate(now.getDate()-5);
          const time = start.getFullYear() + '-' + ('0' + (start.getMonth() + 1)).slice(-2) + '-' + ('0' + start.getDate()).slice(-2) + " 00:00";
          return api.stocksInfo(3, company, '15min', time.toString());
        }
        case "1 month": {
          const start = new Date();
          start.setMonth(now.getMonth() - 1);
          const time = start.getFullYear() + '-' + ('0' + (start.getMonth() + 1)).slice(-2) + '-' + ('0' + start.getDate()).slice(-2);
          return api.stocksInfo(2, company, 'daily', time.toString());
        }
        case "6 month": {
          const start = new Date();
          start.setMonth(now.getMonth() - 6);
          const time = start.getFullYear() + '-' + ('0' + (start.getMonth() + 1)).slice(-2) + '-' + ('0' + start.getDate()).slice(-2);
          return api.stocksInfo(2, company, 'daily', time.toString());
        }
        case "1 year": {
          const start = new Date();
          start.setFullYear(start.getFullYear() - 1);
          const time = start.getFullYear() + '-' + ('0' + (start.getMonth() + 1)).slice(-2) + '-' + ('0' + start.getDate()).slice(-2);
          return api.stocksInfo(2, company, 'weekly', time.toString());
        }
        case "5 year": {
          const start = new Date();
          start.setFullYear(start.getFullYear() - 5);
          const time = start.getFullYear() + '-' + ('0' + (start.getMonth() + 1)).slice(-2) + '-' + ('0' + start.getDate()).slice(-2);
          return api.stocksInfo(2, company, 'weekly', time.toString());
        }
        case "10 year": {
          const start = new Date();
          start.setFullYear(start.getFullYear() - 10);
          const time = start.getFullYear() + '-' + ('0' + (start.getMonth() + 1)).slice(-2) + '-' + ('0' + start.getDate()).slice(-2);
          return api.stocksInfo(2, company, 'monthly', time.toString())
        } */
        default:
          throw Error(`Invalid interval of ${interval}`);
      }
    }
    
    // Add a data to received from the api to the cache
    const addToDataCache = (companyIds, companyDatas, interval) => {
      const dataCacheCopy = Object.assign({}, dataCache);
      // Add current company id if the current company id is not in dataCache
      for (let cidIndex = 0; cidIndex < companyIds.length; cidIndex++) {
        const cid = companyIds[cidIndex];
        // Cid is null when the backend isnt called
        if (!(cid in dataCacheCopy)) {
          dataCacheCopy[cid] = {};
        }
        const cData = companyDatas[cidIndex];
        if (cData !== null) {
          dataCacheCopy[cid][interval] = cData;
        }
      }
      setDataCache(dataCacheCopy);
    }
    
    // Loop through the given companies and call the api for data if needed
    const loadData = async () => {
      setState(STATES.LOADING);
      // Loop through each company id
      const companyIds = props.companyId.split(',');
      // Fetches a specific company's data
      const loadCompanyData = async (cid) => {
        // Call from api only if needed
        if (!(cid in dataCache) || !(timeOptions in dataCache[cid])) {
          try {
            const resp = await callApi(cid.toUpperCase(), timeOptions)
            const respJson = await resp.json();
            return respJson  
          } catch (err) {
            console.log(err);
          }
        }
        return null;
      }
      // Wait for all company data to be loaded
      const companyDatas = await Promise.all(companyIds.map(cid => loadCompanyData(cid)));
      addToDataCache(companyIds, companyDatas, timeOptions);
      setState(STATES.RECEIVED);
    }
    loadData();
    /**
      NOTE: This may show a warning about not having datacache
      in the dependency list but please leave it out. If you leave it in
      it leads to an infinite useEffect loop - so just ignore the warning
    */
  }, [api, props.companyId, timeOptions])
  
  // Render loading screen if needed
  const renderLoad = () => {
    if (state === STATES.LOADING) {
      return (<LoadingScreen/>)
    }
    return null;
  }
  
  // Choose the correct type graph
  const renderGraphShape = () => {
    if (graphStyle === "candlestick") {
      return (<CandleStick/>)
    } else if (graphStyle === "ohlc") {
      return (<Ohlc/>)
    }
    throw Error("Invalid graph type");
  }
  
  // Choose the correct data key for the graph
  const getDataKey = () => {
    if (graphStyle === "candlestick") {
      return "openCloseData";
    } else if (graphStyle === "ohlc") {
      return "highLow";
    }
    throw Error("Invalid graph type");
  }
  
  // Renders the graph in the graph component
  const renderGraph = () => {
    const companyIds = props.companyId.split(',');
    const hasAllCData = companyIds.every(v => v in dataCache && timeOptions in dataCache[v]);
    if (hasAllCData) {
      if (companyIds.length > 1) {
        const formatedData = transformMultiStockData(companyIds, timeOptions, dataCache);
        return (
          <ResponsiveContainer width={'99%'} height={props.height}>
            <LineChart
              margin={{ bottom: 25, left: 25, right: 25 }}
              data={formatedData}
            >
              <XAxis minTickGap={25} dataKey="time"></XAxis>
              <YAxis 
                label={{ value: 'Price (US Dollars)', angle: -90, position: 'insideLeft', dx: -15, dy: 20 }}
                domain={[0, 'dataMax']} type="number"/>
              <Tooltip/>
              {
                companyIds.map(cid => (
                  <Line key={cid} dot={false} type="monotone" dataKey={cid} stroke={randomColor({ luminosity: 'dark' })}/>    
                ))
              }
              <Legend wrapperStyle={{bottom: 0, right: 0}}/>
            </LineChart>
          </ResponsiveContainer>
        )
      }
      if (companyIds.length === 1) {
        const data = transformData(dataCache[props.companyId][timeOptions], graphStyle);
        if (graphStyle === 'line') {
          return (
            <ResponsiveContainer width={'99%'} height={props.height}>
              <LineChart
                margin={{ bottom: 25, left: 25 }}
                data={data}
              >
                <XAxis minTickGap={25} dataKey="time"></XAxis>
                <YAxis
                  label={{ value: 'Price (US Dollars)', angle: -90, position: 'insideLeft', dx: -15, dy: 20 }}
                  domain={['dataMin', 'dataMax ']} type="number"/>
                <Tooltip content={<StocksToolTip graphStyle={graphStyle}/>}/>
                <Line dot={false} type="monotone" dataKey="close" stroke={randomColor({luminosity: 'dark'})}/>
              </LineChart>
            </ResponsiveContainer>
          )
        }
        return (
          <ResponsiveContainer width={'99%'} height={props.height}>
            <BarChart
              margin={{ bottom: 25, left: 25 }}
              data={data}
            >
              <XAxis minTickGap={25} dataKey="time"></XAxis>
              <YAxis 
                label={{ value: 'Price (US Dollars)', angle: -90, position: 'insideLeft', dx: -15, dy: 20 }}
                domain={['dataMin', 'dataMax ']} type="number"/>
              <Tooltip content={<StocksToolTip graphStyle={graphStyle}/>}/>
              <Bar dataKey={getDataKey()} shape={renderGraphShape()}></Bar>
            </BarChart>
          </ResponsiveContainer>
        )
      } else {
        return (
          <div>This is a multigraph</div>
        )
      }
    }
    return <div style={{ height: props.height }}></div>;
  }
  
  return (
    <div style={wrapperStyle}>
      <GraphOptions
        isMulti={props.companyId.split(',').length > 1}
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
  /**
    The company id of stock. For multiple stocks, separate with a comma
  */
  companyId: PropTypes.string,
  height: PropTypes.number,
}

// Converts a time string to a nicely displayed one
export const transformTimeStr = (timeStr) => {
  const date = new Date(Date.parse(timeStr));
  if (timeStr.includes('T')) {
    return date.toLocaleTimeString('en-US',
      {timeZone:'UTC',hour12:true,hour:'numeric',minute:'numeric'}
    );
  }
  return date.toLocaleString('default',{month:'short', year:'numeric', day: 'numeric'})
}

const transformMultiStockData = (companyIds, interval, dataCache) => {
  const timePointsNum = getTimeSeriesData(dataCache[companyIds[0]][interval]).length;
  const output = []
  for (let i = 0; i < timePointsNum; i++) {    
    const timePoint = {
      time: transformTimeStr(getDataTime(getTimeSeriesData(dataCache[companyIds[0]][interval])[i]))
    };
    for (const cid of companyIds) {
      try {
        timePoint[cid] = getTimeSeriesData(dataCache[cid][interval])[i].close
      } catch(err) {
      
      }
    }
    output.push(timePoint);
  }
  return output;
}

const getDataTime = (data) => {
  if ('date' in data) {
    return data.date;
  } else if ('time' in data) {
    return data.time;
  }
  return null;
}

/**
 * Given the api data received from the backend
 * return the actual timeseries of the data
 * @param {*} apiData 
 * @returns 
 */
const getTimeSeriesData = (apiData) => {
  if ('series' in apiData.data) {
    return apiData.data.series.data;
  } else if ('history' in apiData.data) {
    return apiData.data.history.day;
  }
  return null;
}

/**
 * Transforms stocks data to what is needed
 * @param {*} data 
 * @returns 
 */
const transformData = (data, graphStyle) => {
  if ('series' in data.data) {
    return transformIntradayData(data, graphStyle);
  } else if ('history' in data.data) {
    return transformNonIntradayData(data, graphStyle)
  }
  throw new Error("Invalid data received");
}
  
function transformIntradayData(data, graphStyle) {
  let timeSeriesData = data.data.series.data;
  return timeSeriesData.map(d => {
    switch (graphStyle) {
      case 'candlestick':
        return {
          time: transformTimeStr(d.time),
          openCloseData: [
            Number(d.open),
            Number(d.close),
          ],
          high: Number(d.high),
          low: Number(d.low),
          volume: Number(d.volume),
        }
      case 'ohlc':
        return {
          time: transformTimeStr(d.time),
          open: Number(d.open),
          close: Number(d.close),
          highLow: [
            Number(d.high),
            Number(d.low),
          ],
          volume: Number(d.volume),
        }
      case 'line':
        return {
          time: transformTimeStr(d.time),
          open: Number(d.open),
          close: Number(d.close),
          high: Number(d.high),
          low: Number(d.low),
          volume: Number(d.volume),  
        }
      default:
        throw new Error('Invalid style');
    }
  });
}
 
function transformNonIntradayData(data, graphStyle) {
  let timeSeriesData = data.data.history.day;
  return timeSeriesData.map(d => {
    switch (graphStyle) {
      case 'candlestick':
        return {
          time: transformTimeStr(d.date),
          openCloseData: [
            Number(d.open),
            Number(d.close),
          ],
          high: Number(d.high),
          low: Number(d.low),
          volume: Number(d.volume),
        }
      case 'ohlc':
        return {
          time: transformTimeStr(d.date),
          open: Number(d.open),
          close: Number(d.close),
          highLow: [
            Number(d.high),
            Number(d.low),
          ],
          volume: Number(d.volume),
        }
      case 'line':
        return {
          time: transformTimeStr(d.date),
          open: Number(d.open),
          close: Number(d.close),
          high: Number(d.high),
          low: Number(d.low),
          volume: Number(d.volume),  
        }
      default:
        throw new Error('Invalid style');
    }
  });
}

