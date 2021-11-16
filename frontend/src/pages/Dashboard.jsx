import React, { useContext } from 'react'; 
import { AlertContext } from '../App';
// component imports
import Navigation from '../comp/Navigation';
import Tabs from '../comp/Tabs';
import PerformanceTable from '../comp/PerformanceTable/PerformanceTable';
import { apiBaseUrl } from '../comp/const';
import axios from "axios";
import PerformanceGraph from '../graph/PerformanceGraph';
import RankTable from '../comp/RankTable'; 

// styling imports 
import { 
  PfBody, 
  LeftBody, 
  RightBody, 
  RightCard, 
  PageBody,
  Heading,
  PfBar,
} from '../styles/styling';
import leaderboard from '../assets/leaderboard.png';
import star from '../assets/star.png';
import globe from '../assets/globe.png';

import Activity from './Activity';

function createData(code, name, buyPrice, currPrice, changePer, units, value, profitLoss) {
  return {
    code,
    name,
    buyPrice,
    currPrice,
    changePer,
    units,
    value,
    profitLoss,
  };
}

// stub data for rankings
function createRankData(name, performance, rank) {
  return { name, performance, rank };
}

// demo data for rankings
const rows = [
  createData('richard_mo', '400', 1),
  createData('elon_musk', '150', 2),
  createData('user1', "100", 3),
  createData('dragonalxd', "59", 4),
];


export default function Dashboard() {
  const myName = localStorage.getItem('username');
  const token = localStorage.getItem('token');
  const alert = useContext(AlertContext);
  const [selected, setSelected] = React.useState([]);
  const [portfolios, setPortfolios] = React.useState([]);
  
  // friend's activity
  const [activity, setActivity] = React.useState([]); 

  // rankings 
  const [globalRank, setGlobal ] = React.useState(rows);
  const [rankings, setRankings] = React.useState(rows);
  const [myFriendRanking, setMyRanking] =React.useState(createRankData("lily","20","8888"));
  const [myGlobalRanking, setMyGlobal] = React.useState(createRankData("lily","20","8888"));

  React.useEffect(() => {  
    getGlobalRanks();
    fetchPortfolios();
    getFriendRanking();
    getActivity();
  },[]);

const getGlobalRanks = async () => {
  try {
    const request = await axios.get(`${apiBaseUrl}/rankings/global`);
    let list = [];
    for (let i=0; i< request.data.length; i++){
      // push the top 5 global ranks
      if (i < 5) {
        list.push(createRankData(request.data[i].name, request.data[i].performance.performance, request.data[i].rank));
      }
      if (request.data[i].name === myName){
        setMyGlobal(createRankData(request.data[i].name, request.data[i].performance.performance, request.data[i].rank));
      }
    }
    setGlobal(list);
  } catch (e) {
    // alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
  }
}

const getFriendRanking = async () => {
  try {
    const resp = await axios.get(`${apiBaseUrl}/rankings/friends?token=${token}`);
    let list = [];
    for (let i=0; i< resp.data.length; i++){
      list.push(createRankData(resp.data[i].name, resp.data[i].performance.performance, resp.data[i].rank));
      if (resp.data[i].name === myName){
        setMyRanking(createRankData(resp.data[i].name, resp.data[i].performance.performance, resp.data[i].rank));
      }
    }
    setRankings(list);

    // todo set ranking of the new thing 
  } catch (e) {
    alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
  }
}

  const fetchPortfolios = async () => {
    try {
      const request1 = await axios.get(`${apiBaseUrl}/user/portfolios?token=${token}`);
      let newList = [];
      // iterate throught the portfolio names
      // for each name, gather data needed for display 
      for (let i = 0; i < request1.data.length; i++) {
        const e = request1.data[i];
        // grab the stock list for each portfolio 
        const request2 = await axios.get(`${apiBaseUrl}/user/portfolios/open?token=${token}&pid=${e.pid}`);
        const portfolioData = request2.data;
        
        // plot the data if its not 'watchlist" or the stock list is empty
        if (portfolioData.name !== "Watchlist" && portfolioData.stocks.length !== 0){
          const getNames = portfolioData.stocks.map(x=>x.stock);
          const stockNames = getNames.join(',');
          const request3 = await axios.get(`${apiBaseUrl}/stocks/info?type=1&stocks=${stockNames}`);
          let apiInfo = request3.data.data.quotes.quote;
          if (!Array.isArray(apiInfo)) {
            apiInfo = [apiInfo];
          }
          let stockRows = [];
          for (let i = 0; i < portfolioData.stocks.length; i++) {
            const inf = apiInfo[i];
            const totalPrice = portfolioData.stocks[i].quantity * inf.last;
            const profitLoss = totalPrice - (portfolioData.stocks[i].avgPrice * portfolioData.stocks[i].quantity);
            const changePer = (inf.last - portfolioData.stocks[i].avgPrice) / portfolioData.stocks[i].avgPrice * 100;
            stockRows.push(createData(portfolioData.stocks[i].stock, inf.description, portfolioData.stocks[i].avgPrice, inf.last.toFixed(2), changePer.toFixed(2),portfolioData.stocks[i].quantity, totalPrice.toFixed(2), profitLoss.toFixed(2)));
          }
          newList.push({
            pid: e.pid,
            name: portfolioData.name,
            stocks: stockRows,
          });   
      }
    }
      setPortfolios(newList); 
    } catch (e) {
      alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
    }
  };

   
  const getActivity = async() => {
    try {
    const resp = await axios.get(`${apiBaseUrl}/activity/all?token=${token}`);
    console.log(resp.data);
    setActivity(resp.data);
    } catch (e) {
			console.dir(e, {depth:null});
      // alert(`Status Code ${e.data.status} : ${e.data.error}`,'error');
    }
  }
  
  return (
    <PageBody className="font-two">
      <Navigation />
      <Tabs />
      <PfBody>
              <LeftBody elevation={10}>
              <PfBar>
                <Heading>Dashboard</Heading> 
              </PfBar>
                <h3>Overall Performance</h3>
                <PerformanceGraph 
                  pids={selected.toString()} 
                  height={400}
                  isFriend={false}
                  />
                <PerformanceTable 
                  portfolios={portfolios}
                  setPerfSelected={setSelected} />
                <div style={{marginTop: 30, fontWeight: 'bold'}}>
                  Friend's activities:
                </div>
                {
                  activity.length > 0 ? activity.map(index =>{
                    let subString = index.time.substring(11,16)
                    return <Activity message={index.message} time={subString} aid={index.aid} likes={index.likes} getActivityCallBack={getActivity} userComments={index.userComments}></Activity>
                  }): <p>Empty feed :\</p>
                }
              </LeftBody>
              <RightBody elevation={10}>
                <RightCard elevation={5}>
                  <div style={{textAlign:'center'}}>
                    <img style={{height:"auto", width:"50px"}} src={star} alt="star icon"/>
                  </div>
                  <h3 style={{textAlign:'center'}}>Performer of the Month </h3>
                </RightCard>
                <RightCard elevation={5}>
                  <div style={{textAlign:'center'}}>
                    <img style={{height:"auto", width:"50px"}} src={leaderboard} alt="leaderboard icon"/>
                  </div>
                  <h3 style={{textAlign:'center'}}>Friend Rankings</h3>
                  <RankTable
                    rows={rankings}
                    myRanking={myFriendRanking}
                  />
                </RightCard>
                <RightCard elevation={5}>
                <div style={{textAlign:'center'}}>
                  <img style={{height:"auto", width:"50px"}} src={globe} alt="global icon"/>
                </div>
                  <h3 style={{textAlign:'center'}}>Global Rankings</h3>
                    <RankTable
                      rows={globalRank}
                      myRanking={myGlobalRanking}
                    />
                </RightCard>
              </RightBody>
            </PfBody>
    </PageBody>
  );
}
