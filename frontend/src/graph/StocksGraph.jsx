import React, { useContext, useEffect, useState } from "react"
import PropTypes from "prop-types";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import { ApiContext } from "../api";

const compareTime = (time1, time2) => {
  const t1 = Date.parse(time1);
  const t2 = Date.parse(time2);
  return t1 < t2;
}

const transformData = (data) => {
  const timeSeriesData = data["Time Series (5min)"];
  const parsedData = [];
  for (const timeKey of Object.keys(timeSeriesData)) {
    const objData = timeSeriesData[timeKey];
    const newData = {
      time: timeKey,
      open: objData["1. open"],
      high: objData["2. high"],
      low: objData["3. low"],
      close: objData["4.close"],
      volume: objData["5. volume"],
    }
    let i = 0;
    for (; i < parsedData.length; i++) {
      if (compareTime(timeKey, parsedData[i].time)) {
        break;
      }
    }
    parsedData.splice(i, 0, newData);
  }
  console.log(parsedData);
  return parsedData;
}

const StocksGraph = (props) => {
  const [ data, setData ] = useState([]);
  const api = useContext(ApiContext);
  const wrapperStyle = {
    backgroundColor: "black"
  }
  useEffect(() => {
    api.stockTimeSeries('IBM')
      .then(r => r.json())
      .then(r => setData(transformData(r)))
  }, [api])
  return (
    <div style={wrapperStyle}>
      <LineChart
        width={500}
        height={300}
        data={data}
      >
        <XAxis datakey="time"/>
        <YAxis domain={['dataMin', 'dataMax']} type="number"/>
        <Line type="monotone" stroke="blue" dataKey="open" dot={false}/>
        <Line type="monotone" stroke="red" dataKey="high" dot={false}/>
        <Line type="monotone" stroke="green" dataKey="low" dot={false}/>
        <Line type="monotone" stroke="yellow" dataKey="close" dot={false}/>
        <Legend/>
      </LineChart>
    </div>
  )
}

StocksGraph.propTypes = {
  timeSeries: PropTypes.object
}

export default StocksGraph