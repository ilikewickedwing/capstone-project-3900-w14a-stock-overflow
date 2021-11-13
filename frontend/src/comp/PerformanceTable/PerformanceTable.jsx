import * as React from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import axios from 'axios';
import { apiBaseUrl } from '../../comp/const';
import PerformanceRow from './PerformanceRow';

// layer 1= overview: portfolio name, total value and profit loss 
// layer 2 = stocks: code,name, buyprice, current price, change %, units, value, pro/loss

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

const PerformanceTable = () => {
  const token = localStorage.getItem('token');
  const [portfolios, setPortfolios] = React.useState([]);
    // first load render 
  React.useEffect(() => {   
    fetchPortfolios();
  },[]);
  
  const fetchPortfolios = async () => {
    try {
      const request1 = await axios.get(`${apiBaseUrl}/user/portfolios?token=${token}`);
      let newList = [];
      // iterate throught the portfolio names
      // for each name, gather data needed for display 
      request1.data.forEach(async(e) => {
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
            name: portfolioData.name,
            stocks: stockRows,
          });   
        }
      });
      setPortfolios(newList); 
      console.log(newList);
    } catch (e) {
      alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
    }
  };
    return (
        <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell />
              <TableCell>Portfolio Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {portfolios &&
            portfolios.map((info) =>{
              console.log(info);
              return (
                <PerformanceRow key={info.name} row={info} />
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
}

export default PerformanceTable;