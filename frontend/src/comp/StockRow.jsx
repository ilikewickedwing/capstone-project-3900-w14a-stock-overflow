import React, { useContext } from 'react'; 
import { useHistory } from 'react-router';
import axios from 'axios';
import { apiBaseUrl } from './const';
import { useParams } from 'react-router-dom';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import IconButton from "@mui/material/IconButton";
import ClearIcon from '@mui/icons-material/Clear';
import {
  WatchlistCardContainer,

} from '../styles/styling';
import { AlertContext } from '../App';

const StockRow = ({data, onDeleteCallback = () => {}}) => {
  const alert = useContext(AlertContext);
  const history = useHistory();
  const { pid } = useParams();
  const token = localStorage.getItem('token');

  const stock = data.stock;
  // 0:green ; 1:red 
  const [toggle, setToggle] = React.useState(0);

  
  React.useEffect(() =>{
    const string = JSON.stringify(data.change);
    // if contains a minus change, set the toggle 
    if (string.indexOf('-') !== -1){
      setToggle(1);
    }
  },[])


  async function handleDeleteStock() {
    try {
      await axios.put(`${apiBaseUrl}/user/stocks/edit`, {
        token: token,
        pid: pid,
        stock: stock,
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

  // async function getStockDetails() {
  //   const resp = await api.stocksInfo(1, data.stock, null, null);
  //   const jsonResp = await resp.json();
  //   //console.log(jsonResp.data.quotes.quote.change);
  //   setChange(jsonResp.data.quotes.quote.change);
  //   setChangePercentage(jsonResp.data.quotes.quote.change_percentage);
  // }
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

        <IconButton onClick={handleDeleteStock}>
          <ClearIcon />
        </IconButton>
      </div>
      {/* <button onClick={getStockDetails}>Get Recent Data</button> */}
    </WatchlistCardContainer>
  )
}

export default StockRow;