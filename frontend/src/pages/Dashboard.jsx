import React, { useContext } from 'react'; 
import { AlertContext } from '../App';
// component imports
import Navigation from '../comp/Navigation';
import Tabs from '../comp/Tabs';
import PerformanceTable from '../comp/PerformanceTable/PerformanceTable';
import { apiBaseUrl } from '../comp/const';
import axios from "axios";
import PerformanceGraph from '../graph/PerformanceGraph';

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


export default function Dashboard() {
  const token = localStorage.getItem('token');
  const alert = useContext(AlertContext);
  const [globalRank, setGlobal ] = React.useState([]);
  const [selected, setSelected] = React.useState([]);
  const [portfolios, setPortfolios] = React.useState([]);

  // first load render 
  React.useEffect(() => {  
    getGlobalRanks();
    fetchPortfolios();
  },[]);

const getGlobalRanks = async () => {
  try {
    const request = await axios.get(`${apiBaseUrl}/rankings/global`);
    setGlobal(request.data); 
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
                  height={400}
                  pids={selected.toString()} 
                  />
                <PerformanceTable 
                  portfolios={portfolios}
                  setPerfSelected={setSelected} />
              </LeftBody>
              <RightBody elevation={10}>
                <RightCard elevation={5}>
                  <div style={{textAlign:'center'}}>
                    <img style={{height:"auto", width:"50px"}} src={star} alt="star icon"/>
                  </div>
                  <h3 style={{textAlign:'center'}}>Today's Top Performer</h3>
                </RightCard>
                <RightCard elevation={5}>
                <div style={{textAlign:'center'}}>
                  <img style={{height:"auto", width:"50px"}} src={leaderboard} alt="leaderboard icon"/>
                </div>
                  <h3 style={{textAlign:'center'}}>Global Rankings</h3>
                </RightCard>
              </RightBody>
            </PfBody>
    </PageBody>
  );
}
