import randomColor from "randomcolor";
import { useContext, useEffect, useState } from "react";
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PropTypes from 'prop-types';
import { ApiContext } from "../api";
import { transformTimeStr } from "./StocksGraph";

// Used for testing
const makeMockResponse = (pid) => {
  return {
    pid: pid,
    name: `Porfolio ${Math.floor(Math.random() * 100)}`,
    value: {
      performance: [
        {
          date: '2014-5-5',
          performance: Math.random() * 100
        },
        {
          date: '2014-5-6',
          performance: Math.random() * 100
        },
        {
          date: '2014-5-7',
          performance: Math.random() * 100
        },
        {
          date: '2014-5-8',
          performance: Math.random() * 100
        },
        {
          date: '2014-5-9',
          performance: Math.random() * 100
        },
        {
          date: '2014-5-10',
          performance: Math.random() * 100
        }
      ]
    }
  }
}

const makeMockFriendResponse = () => {
  const output = []
  for (let i = 0; i < 5; i++) {
    output.push(makeMockResponse(i.toString()));
  }
  return output;
}

export default function PerformanceGraph(props) {
  // Maps pid to performance array
  const [ dataCache, setDataCache ] = useState({});
  const [ pidToName, setPidToName ] = useState({});
  // When it is in friend mode, store all their portfolio ids
  const [ totalFriendPids, setTotalFriendPids ] = useState([]);
  const api = useContext(ApiContext);
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Fetch the portfolio performance for each of the portfolios that arent cached
    const callApi = async () => {
      const dataCacheCopy = Object.assign({}, dataCache);
      const pidToNameCopy = Object.assign({}, pidToName);
      if(props.pids !== ""){
        // Loop through each of the pids
        for (const pid of props.pids.split(",")) {
          const resp = await api.userPortfoliosOpen(pid, token);
          if (resp.status === 200) {
            const respJson = await resp.json();
            // Store in datacache
            dataCacheCopy[pid] = respJson.value.performance;
            pidToNameCopy[pid] = respJson.name;
          }
        }
      }
      setDataCache(dataCacheCopy);
      setPidToName(pidToNameCopy);
    }
    
    // Fetch data if in friend mode
    const callFriendApi = async () => {
      const dataCacheCopy = Object.assign({}, dataCache);
      const pidToNameCopy = Object.assign({}, pidToName);
      const resp = await api.friendsPortfolios(token, props.friendUid);
      if (resp.status === 200) {
        const portfolios = await resp.json();
        const friendsPid = [];
        // Loop through and store each of the pids
        for (const pf of portfolios) {
          dataCacheCopy[pf.pid] = pf.value.performance;
          pidToNameCopy[pf.pid] = pf.name;
          friendsPid.push(pf.pid);
        }
        setDataCache(dataCacheCopy);
        setPidToName(pidToNameCopy);
        setTotalFriendPids(friendsPid);
      }
    }
    if (props.isFriend === true) {
      callFriendApi();
    } else {
      callApi();
    }
    // Note: Please dont put dataCache or pidToName in the dependency list or it
    // leads to a continuous loop
  }, [api, props.pids]);
  
  const renderLines = () => {
    // Return net lines
    if (props.pids.length === 0) {
      if (props.isFriend) {
        return (
          <Line unit="%" dot={false} type="monotone" dataKey="Average Performance"
            stroke={randomColor({ luminosity: 'dark' })}>
          </Line>
        )
      }
    }
    // Return multiple lines
    const pids = props.pids.split(",");
    const hasAllPData = pids.every(pid => pid in dataCache);
    if (hasAllPData) {
      return pids.map(pid => (
        <Line key={pid} unit="%" dot={false} type="monotone" dataKey={pidToName[pid]}
          stroke={randomColor({ luminosity: 'dark' })}>
        </Line>
      ))
    }
    return null;
  }
  
  return (
    <ResponsiveContainer width={'99%'} height={props.height}>
      <LineChart
        data={
          props.pids.length !== 0 ? 
          transformDataCache(props.pids.split(","), dataCache, pidToName) :
          transformNetDataCache(totalFriendPids, dataCache, [])
        }
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
        <Legend wrapperStyle={{bottom: 0, right: 0}}/>
      </LineChart>
    </ResponsiveContainer>
  )
}

PerformanceGraph.propTypes = {
  // pids of the portfolio. For multiple portfolios, separate them with a comma
  pids: PropTypes.string,
  height: PropTypes.number,
  // Set this to true if viewing a friends graph
  isFriend: PropTypes.bool,
  // This is the friends uid - you can leave this blank if viewing your own graph
  friendUid: PropTypes.string,
}

// Transforms a net of the data cache into one line of data
const transformNetDataCache = (pids, dataCache, pidToName) => {
  // Return empty array if datacache is empty
  if (Object.keys(dataCache).length === 0) {
    return [];
  }
  // Maps the date to the an object containing running avg performance and number
  // of points
  const dateMap = {};
  for (const pid of pids) {
    for (const timePoint of dataCache[pid]) {
      // Add point to date map
      if (!(timePoint.date in dateMap)) {
        dateMap[timePoint.date] = {
          num: 1,
          avgPerf: timePoint.performance
        }
      } else {
        const oldAvg = dateMap[timePoint.date].avgPerf;
        const oldNum = dateMap[timePoint.date].num;
        const oldTotal = oldAvg * oldNum;
        const newTotal = oldTotal + timePoint.performance;
        const newNum = oldNum + 1;
        const newAvg = newTotal / newNum;
        dateMap[timePoint.date].num = newNum;
        dateMap[timePoint.date].avgPerf = newAvg;
      }
    }
  }
  // Convert the map into an array
  const output = Object.keys(dateMap).map(date => {
    return {
      date: date,
      'Average Performance': dateMap[date].avgPerf
    }
  })
  return output;
}

// Transform the datacache into a format that can be displayed
const transformDataCache = (pids, dataCache, pidToName) => {
  const hasAllPData = pids.every(pid => pid in dataCache);
  if (!hasAllPData) {
    return [];
  }
  const dateNum = dataCache[pids[0]].length;
  const output = [];
  for (let i = 0; i < dateNum; i++) {
    const datePoint = {
      date: transformTimeStr(dataCache[pids[0]][i].date)
    };
    for (const pid of pids) {
      try {
        datePoint[pidToName[pid]] = dataCache[pid][i].performance;
      } catch (err) {
      
      }
    }
    output.push(datePoint);
  }
  return output;
}