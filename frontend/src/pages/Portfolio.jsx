import React, {useContext} from 'react'; 
import { useHistory, useParams } from 'react-router-dom';
import axios from "axios";
import { apiBaseUrl } from '../comp/const';

import Navigation from '../comp/Navigation'; 
import Tabs from '../comp/Tabs'; 
import AddStock from '../comp/AddStock';
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
import WatchlistCard from '../comp/WatchlistCard';
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
  const [selected, setGraphSelected] = React.useState([]);
  const [profit, setProfit] = React.useState(0);

  const [earnings, setEarnings] = React.useState(0);

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover': undefined;

  // on first load 
  React.useEffect(() => {   
    loadPorfolioData();
  },[pid]);
  
  const loadPorfolioData = async () => {
    // reset the stocks list (cached from loads)
    setStocks([]);
    try {
      const request = await axios.get(`${apiBaseUrl}/user/portfolios/open?token=${token}&pid=${pid}`);
      const portfolioData = request.data;
      const performance = portfolioData.value.performance;
      setProfit(portfolioData.value.profit);
      setEarnings(performance[performance.length-1]);
      setName(portfolioData.name);

      if (portfolioData.name === "Watchlist"){
        setIsWatchlist(1);
      } else {
        setIsWatchlist(0);
      }
      let stockList =[];
      // console.log(portfolioData.stocks);
      // push the stock if its not quantity 0 (which is kept for history purposes)
      for (let i = 0; i < portfolioData.stocks.length; i++){
        if (portfolioData.stocks[i].quantity !== 0){
          stockList.push(portfolioData.stocks[i]);
        }
      }
      setStocks(stockList);
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
  
  return (
      <PageBody className="font-two">
          <Navigation />
          <Tabs isChanged={isChanged}/>
              {isWatchlist 
              ? (<PfBody>
                    <WatchlistBody elevation={10}>
                      <PfBar>
                        <Heading>{name}</Heading> 
                      </PfBar>
                      {
                        stocks.map(item => {
                          return <WatchlistCard
                            key={item.stock}
                            name={item.stock}
                            onDeleteCallback={() => { loadPorfolioData() }}
                            isFriend={0}
                          />
                        })
                      }
                      < AddStock 
                        token={token}
                        pid={pid}
                        onAddCallback={loadPorfolioData}
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
                onAddCallback={loadPorfolioData}
                load={loadPorfolioData}
                name={name}
              />
              </LeftBody>
            <RightBody elevation={10}>
              <RightCard elevation={5} style={{textAlign:'center'}}>
                <h3>Daily Estimated Earnings</h3>
                {parseFloat(earnings.money).toFixed(2)} USD
              </RightCard>
              <RightCard elevation={5} style={{textAlign:'center'}}>
                <h3>Net Profit</h3>
                {parseFloat(profit).toFixed(2)} USD
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