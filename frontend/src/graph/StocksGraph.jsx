import React, { useContext, useEffect, useState } from "react"
import PropTypes from "prop-types";
import { LineChart, Line, XAxis, YAxis, Legend } from "recharts";
import { ApiContext } from "../api";
import { useParams } from "react-router";
import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";

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
  const { companyId } = useParams();
  const [ data, setData ] = useState([]);
  const [ timeOptions, setTimeOptions ] = useState("1d");
  const api = useContext(ApiContext);
  const wrapperStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  }
  useEffect(() => {
    api.stockTimeSeries(companyId)
      .then(r => r.json())
      .then(r => setData(transformData(r)))
  }, [api, companyId])
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
  timeSeries: PropTypes.object
}

export default StocksGraph