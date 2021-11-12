import React, {useContext, useState} from 'react'; 
import { useHistory, useParams } from 'react-router-dom';
import axios from "axios";
import Navigation from '../comp/Navigation'; 
import Tabs from '../comp/Tabs'; 
import StockRow from '../comp/StockRow';
import AddStock from '../comp/AddStock';
import { apiBaseUrl } from '../comp/const';
import { ApiContext } from '../api';
import PfTable from '../comp/PfTable';
import StocksGraph from "../graph/StocksGraph";
import { AlertContext } from '../App';
import Popover from '@mui/material/Popover';
import {
  CreatePortField, 
  CreatePortContent, 
  ConfirmCancel,
  PfBody, 
  LeftBody, 
  RightBody, 
  RightCard, 
  PageBody, 
  Heading,
  PfBar,
  WatchlistBody,
} from '../styles/styling';

import Button from '@mui/material/Button';

const Portfolio = () => {
  const history = useHistory();
  const alert = useContext(AlertContext);
  const { pid } = useParams();
  const token = localStorage.getItem('token');

  // popover code 
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [name, setName] = React.useState('');
  const [changedName, editName ] = React.useState('');
  const [isWatchlist, setIsWatchlist] = React.useState(0);
  const [isChanged, setChanged ] = React.useState(0);
  const [stocks, setStocks] = React.useState([]);
  const [stockArray, setStockArray ] = React.useState([{
    open: null,
    stock: null,
    stockName: null,
    change: null,
    changePercentage: null
  }]);

  const [selected, setGraphSelected] = React.useState([]);
  const api = useContext(ApiContext);

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover': undefined;

  // on first load 
  React.useEffect(() => {   
    loadPorfolioData();
    getWatchlist()
  },[pid]);
  
  const loadPorfolioData = async () => {
    try {
      const request = await axios.get(`${apiBaseUrl}/user/portfolios/open?token=${token}&pid=${pid}`);
      const portfolioData = request.data;
      setName(portfolioData.name);

      if (portfolioData.name === "Watchlist"){
        setIsWatchlist(1);
      } else {
        setStocks(portfolioData.stocks);
        setIsWatchlist(0);
      }
    } catch (e) {
      alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
    }
  }; 

  const submitPfRename = async (e) => {
    e.preventDefault();
    try {
      setName(changedName);
      await axios.post(`${apiBaseUrl}/user/portfolios/edit`, {token, pid, name: changedName});
      setAnchorEl(null);
      setChanged(isChanged + 1);
    } catch (e) {
      alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
    }
  }

  const handleDelete = async (e) => {
    e.preventDefault();
    try {
      await axios.delete(`${apiBaseUrl}/user/portfolios/delete`,{data: {token, pid}});
      history.push('/dashboard');
    } catch (e) {
      alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
    }
  }
  
  const getWatchlist = async () => {
    let array = [];
    const token = localStorage.getItem('token');
    // get pid for the watchlist
    try {
      const res = await axios.get(`${apiBaseUrl}/user/portfolios/getPid`, {
        params: {
          token: token,
          name: 'Watchlist'
        }
      })
      const pid = res.data;
      const request = await axios.get(`${apiBaseUrl}/user/portfolios/open?token=${token}&pid=${pid}`);
      
      array = request.data['stocks'];
      let propsArray = [];
      for (let i = 0; i < array.length; i++) {
        const data = await getStockDetails(array[i]['stock']);
        propsArray.push(data);
      }
      // console.log(propsArray);
      setStockArray(propsArray);
    } catch (e){
      alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
    }
  }

  async function getStockDetails(stockSymbol) {
    const resp = await api.stocksInfo(1, stockSymbol, null, null);
    const jsonResp = await resp.json();
    const respData = jsonResp.data.quotes.quote;
    let data = null; 
    if (respData.open === null){
      const resp2 = await api.stocksInfo(2, stockSymbol, null, null);
      const json2 = await resp2.json();
      const prevDay = json2.data.history.day;
      let latest = prevDay.length -1;
      let difference = (respData.ask - prevDay[latest-1].close).toFixed(4);
      let percentage = ((difference/respData.ask)*100).toFixed(2);

      data = {
        open: respData.ask,
        change: difference,
        changePercentage: percentage,
        name: respData.description,
        stock: respData.symbol,
      }
    } else {
      data = {
        open: respData.ask,
        change: respData.change,
        changePercentage: respData.change_percentage,
        name: respData.description,
        stock: respData.symbol
      }
    }
    return data;
  }

  async function handleReload() {
    const res = await axios.get(`${apiBaseUrl}/user/portfolios/getPid`, {
      params: {
        token: token,
        name: 'Watchlist'
      }
    })
    const pid = res.data;
    // history.push(`/dashboard`)
    history.push(`/portfolio/${pid}`)
  }

  return (
      <PageBody className="font-two">
          <Navigation />
          <Tabs isChanged={isChanged}/>
              {isWatchlist 
              ? (<PfBody>
                    <WatchlistBody elevation={10}>
                      <PfBar>
                        <Heading>{name}</Heading> 
                        {/* <Button onClick={handleReload}>Update Data</Button> */}
                      </PfBar>
                      {
                        stockArray.map(item => {
                          return <StockRow key={item.stock} data={item} onDeleteCallback={() => { getWatchlist() }}/>
                        })
                      }
                      < AddStock 
                        token={token}
                        pid={pid}
                        onAddCallback={() => { getWatchlist() }}
                        load={loadPorfolioData}
                        name={name}
                      />
                    </WatchlistBody>
                </PfBody>)
              :
            (<PfBody>
              <LeftBody elevation={10}>
              <PfBar>
              <Heading>{name}</Heading> 
              <div>
                <Button id="renamePf" onClick={(e) => setAnchorEl(e.currentTarget)}> 
                    Rename Portfolio
                </Button>
                <Button color="secondary" onClick={handleDelete}>
                    Delete Portfolio
                </Button>
              </div>
              </PfBar>
              {
                selected.length !== 0 &&
                  <StocksGraph companyId={selected.toString()} height={300}/>
              }
              <PfTable 
                stocks={stocks}
                load={loadPorfolioData}
                setGraphSelected={setGraphSelected}
              />
              < AddStock 
                token={token}
                pid={pid}
                onAddCallback={() => { getWatchlist() }}
                load={loadPorfolioData}
                name={name}
              />
              </LeftBody>
            <RightBody elevation={10}>
              <RightCard elevation={5}>
                <h3 style={{textAlign:'center'}}>Daily Estimated Earnings</h3>
              </RightCard>
              <RightCard elevation={5}>
                2nd card
              </RightCard>
            </RightBody>
            </PfBody>
            )}
          <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{
              vertical:'bottom',
              horizontal:'left',
              }}
              transformOrigin={{
              vertical:'top',
              horizontal:'center',
              }}
          >
              <CreatePortContent>
              <form autoComplete="off" onSubmit={submitPfRename}>
                  <CreatePortField
                  required
                  fullWidth
                  id="renamePf"
                  label="Enter New Portfolio Name"
                  onChange={(e)=> editName(e.target.value)}
                  />
                  <br />
                  <ConfirmCancel>
                      <Button type="button" onClick={() => setAnchorEl(null)}>Cancel</Button>
                      <Button type="submit">CONFIRM</Button>
                  </ConfirmCancel>
              </form>
              </CreatePortContent>
          </Popover>
      </PageBody>
  );
};

export default Portfolio; 