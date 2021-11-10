import randomColor from "randomcolor";
import { useContext, useEffect, useState } from "react";
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PropTypes from 'prop-types';
import { ApiContext } from "../api";
import { transformTimeStr } from "./StocksGraph";


export default function PerformanceGraph(props) {
  const [ dataCache, setDataCache ] = useState({});
  const api = useContext(ApiContext);
  useEffect(() => {
    const token = localStorage.getItem('token');
    // Fetch the portfolio performance for each of the portfolios that arent cached
    const callApi = async () => {
      const dataCacheCopy = Object.assign({}, dataCache);
      // Loop through each of the pids
      for (const pid of props.pids.split(",")) {
        const resp = await api.userPortfoliosOpen(pid, token);
        if (resp.status === 200) {
          const respJson = await resp.json();
          // Store in datacache
          dataCacheCopy[pid] = respJson.value.performance;
        }
      }
      setDataCache(dataCacheCopy);
    }
    callApi();
  }, [api, props.pids]);
  
  const renderLines = () => {
    const pids = props.pids.split(",");
    const hasAllPData = pids.every(pid => pid in dataCache);
    if (hasAllPData) {
      return pids.map(pid => (
        <Line unit="%" dot={false} type="monotone" dataKey={pid}
          stroke={randomColor({ luminosity: 'dark' })}>
        </Line>
      ))
    }
    return null;
  }
  
  return (
    <ResponsiveContainer width={'99%'} height={props.height}>
      <LineChart
        data={transformDataCache(props.pids.split(","), dataCache)}
        margin={{ top: 25, bottom: 25, left: 25 }}
      >
        <XAxis minTickGap={25} dataKey="date" dy={15}></XAxis>
        <YAxis
          dx={-15}
          unit="%"
          label={{ value: 'Value', angle: -90, position: 'insideLeft', dx: -15, dy: 20 }}
          type="number"
        ></YAxis>
        <Tooltip/>
        { renderLines() }
        <Legend/>
      </LineChart>
    </ResponsiveContainer>
  )
}

PerformanceGraph.propTypes = {
  // pids of the portfolio. For multiple portfolios, separate them with a comma
  pids: PropTypes.string,
  height: PropTypes.number,
}

// Transform the datacache into a format that can be displayed
const transformDataCache = (pids, dataCache) => {
  const dateNum = dataCache[pids[0]].length;
  const output = [];
  for (let i = 0; i < dateNum; i++) {
    const datePoint = {
      date: transformTimeStr(dataCache[pids[0]][i].date)
    };
    for (const pid of pids) {
      datePoint[pid] = dataCache[pid][i].performance;
    }
    output.push(datePoint);
  }
  return output;
}