import React, { useContext } from 'react'; 
import { useHistory } from 'react-router';
import axios from 'axios';
import { apiBaseUrl } from './const';
import { useParams } from 'react-router-dom';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import IconButton from "@mui/material/IconButton";
import ClearIcon from '@mui/icons-material/Clear';
import { ApiContext } from '../api';
import {
  WatchlistCardContainer,
  
} from '../styles/styling';
import { AlertContext } from '../App';

const WatchlistCard = ({name,onDeleteCallback = () => {}, isFriend} ) => {
  console.log(isFriend);
    const api = useContext(ApiContext);
    const alert = useContext(AlertContext);
    const history = useHistory();
    const { pid } = useParams();
    const token = localStorage.getItem('token');
    // 0:green ; 1:red 
    const [toggle, setToggle] = React.useState(0);
    
    const [data, setData] = React.useState({});

    
  // on first load 
  React.useEffect(() => {   
    getStockDetails(name);
  },[]);

    // stock details for displaying on watchlist 
  const getStockDetails = async (stockSymbol) => {
      try {
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
          const string = JSON.stringify(data.change);
          // if contains a minus change, set the toggle 
          if (string.indexOf('-') !== -1){
            setToggle(1);
          }
          setData(data);
      } catch (e) {
        alert(`Status Code ${e.status} : ${e.response.data.error}`,'error');
      }
  }


  async function handleDeleteStock() {
    try {
      await axios.put(`${apiBaseUrl}/user/stocks/edit`, {
        token: token,
        pid: pid,
        stock: data.stock,
        price: 0,
        quantity: 0,
        option: 0
      })
      onDeleteCallback();
    } catch (e) {
      alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
    }
  }

  const handleCardClick = async() => {
    history.push(`/stock/${data.stock}`);
  }

  return (
    <WatchlistCardContainer elevation={5}>
      <div style={{display:'flex', flexDirection:'column', padding:'1%', textAlign:'left'}} onClick={handleCardClick}>
        <div style={{fontWeight:'bold'}}>
          {data.stock}: {data.name} 
        </div>
        <div>
        ${data.open}
        </div>
      {toggle?(
        <div style= {{color:'red'}}>
          <ArrowDropDownIcon style={{fontSize:'2em', margin:'-6% 0%'}}/>
          {data.change} {data.changePercentage}%
        </div>
      ):(
        <div style={{color:'green'}}>
          <ArrowDropUpIcon style={{fontSize:'2em', margin:'-6% 0%'}}/>
          {data.change} {data.changePercentage}%
        </div>
      )}
      </div>
      <div>
        {
            isFriend === 0 &&
            <IconButton onClick={handleDeleteStock}>
            <ClearIcon />
            </IconButton>
        }
      </div>
      {/* <button onClick={getStockDetails}>Get Recent Data</button> */}
    </WatchlistCardContainer>
  )
}

export default WatchlistCard;