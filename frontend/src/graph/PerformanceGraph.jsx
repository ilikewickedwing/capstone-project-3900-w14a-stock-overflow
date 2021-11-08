import randomColor from "randomcolor";
import { useContext, useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PropTypes from 'prop-types';
import { ApiContext } from "../api";
import { transformTimeStr } from "./StocksGraph";


export default function PerformanceGraph(props) {
  const [ data, setData ] = useState();
  const api = useContext(ApiContext);
  useEffect(() => {
    const callApi = async () => {
      const resp = await api.userPortfoliosOpen(props.pid);
      if (resp.status === 200) {
        const respJson = await resp.json();
        const transformData = d => d.map(p => {
          p.date = transformTimeStr(p.date);
          return p;
        })
        setData(transformData(respJson.value.performance));
      }
    }
    callApi();
  }, [api, props.pid]);
  return (
    <ResponsiveContainer width={'99%'} height={props.height}>
      <LineChart
        data={data}
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
        <Line unit="%" dot={false} type="monotone" dataKey={'performance'}
          stroke={randomColor({ luminosity: 'dark' })}>
        </Line>
      </LineChart>
    </ResponsiveContainer>
  )
}

PerformanceGraph.propTypes = {
  // pid of the portfolio
  pid: PropTypes.string,
  height: PropTypes.number,
}