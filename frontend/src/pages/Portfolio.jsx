import React, {useContext} from 'react'; 
import { useHistory, useParams } from 'react-router-dom';
import axios from "axios";
import Navigation from '../comp/Navigation'; 
import Tabs from '../comp/Tabs'; 
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
} from '../styles/styling';
import Button from '@mui/material/Button';
import StockRow from '../comp/StockRow';
import AddStock from '../comp/AddStock';
import { apiBaseUrl } from '../comp/const';
import { ApiContext } from '../api';

const Portfolio = () => {
  const history = useHistory();
  const { pid } = useParams();
  const token = localStorage.getItem('token');

  // popover code 
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [name, setName] = React.useState('');
  const [changedName, editName ] = React.useState('');
  const [isWatchlist, setIsWatchlist] = React.useState(0);
  const [isChanged, setChanged ] = React.useState(0);
  const [stockArray, setStockArray ] = React.useState([{
    stock: null,
    stockName: null,
    change: null,
    changePercentage: null
  }]);
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
      const request = await axios.get(`${apiBaseUrl}/user/portfolios/open?pid=${pid}`);
      const porfolioData = request.data;
      setName(porfolioData.name);

      if (porfolioData.name === "Watchlist"){
        setIsWatchlist(1);
      } else {setIsWatchlist(0)}
    } catch (e) {
      alert(e.error);
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
      alert(e.error);
    }
  }

  const handleDelete = async (e) => {
    e.preventDefault();
    try {
      await axios.delete(`${apiBaseUrl}/user/portfolios/delete`,{data: {token, pid}});
      history.push('/dashboard');
    } catch (e) {
      alert(e);
    }
  }
  
  const getWatchlist = async () => {
    let array = [];
    const token = localStorage.getItem('token');
    // get pid for the watchlist
    const res = await axios.get(`${apiBaseUrl}/user/portfolios/getPid`, {
      params: {
        token: token,
        name: 'Watchlist'
      }
    })
    const pid = res.data;
    const request = await axios.get(`${apiBaseUrl}/user/portfolios/open?pid=${pid}`);
    
    array = request.data['stocks'];
    let propsArray = [];
    for (let i = 0; i < array.length; i++) {
      const data = await getStockDetails(array[i]['stock']);
      propsArray.push(data);
    }
    // console.log(propsArray);
    setStockArray(propsArray);
  }

  async function getStockDetails(stockSymbol) {
    const resp = await api.stocksInfo(1, stockSymbol, null, null);
    const jsonResp = await resp.json();
    let data = {
      change: jsonResp.data.quotes.quote.change,
      changePercentage: jsonResp.data.quotes.quote.change_percentage,
      name: jsonResp.data.quotes.quote.description,
      stock: jsonResp.data.quotes.quote.symbol
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
    history.push(`/dashboard`)
    history.push(`/portfolio/${pid}`)
  }

  return (
      <PageBody className="font-two">
          <Navigation />
          <Tabs isChanged={isChanged}/>
          <PfBody>
            <LeftBody>
              {isWatchlist === 0 &&
                <div style={{textAlign: 'right', width:'100%'}}>
                  <Button id="renamePf" onClick={(e) => setAnchorEl(e.currentTarget)}> 
                      Rename Portfolio
                  </Button>
                  <Button color="secondary" onClick={handleDelete}>
                      Delete Portfolio
                  </Button>
                </div>
              }
              <Button onClick={handleReload}>Reload</Button>
              <p> Stock List: </p>
              {
                stockArray.map(item => {
                  return <StockRow key={item.stock} data={item}/>
                })
              }
              
              {isWatchlist 
              ? (<PfBar>
                <Heading>{name}</Heading> 
                </PfBar>)
              :
            (<PfBar>
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
            )}
            
            < AddStock 
              token={token}
              pid={pid}
              onAddCallback={() => { getWatchlist() }}
            />
            </LeftBody>
            <RightBody>
              <RightCard>
                <h3 style={{textAlign:'center'}}>Daily Estimated Earnings</h3>
              </RightCard>
              <RightCard>
                2nd card
              </RightCard>
            </RightBody>
          </PfBody>
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