import React from 'react'; 
import { useParams } from "react-router";
import axios from "axios";
import Navigation from '../comp/Navigation'; 
import Tabs from '../comp/Tabs'; 
import StockSelect from '../comp/StockSelect';

import StocksGraph from "../graph/StocksGraph";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Button from '@mui/material/Button';
import MenuList from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';


import {
  PfBody, 
  LeftBody, 
  RightBody, 
  RightCard, 
  PageBody, 
  StockOverview,
  ContentBody,
  Heading,
  StockHeading,
  PfBar,
} from '../styles/styling';
import { apiBaseUrl } from '../comp/const';


const Stock = () => {
  const { stockCode } = useParams();
  var request = require('request');
  var url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${stockCode}&apikey=59SO8FIM49NYQS21`;
  const token = localStorage.getItem('token');

  // live info
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState('');
  
  // daily info 
  const [close, setClose] = React.useState('-');
  const [low, setLow] = React.useState('');
  const [high, setHigh] = React.useState('');
  const [open,setOpen] = React.useState('');
  const [volume, setVolume] = React.useState('');

  // prev day info + overview 
  const [prevClose, setPrevClose] = React.useState('');
  const [dayRange, setRange]= React.useState('');
  const [change, setChange] = React.useState('');
  const [percentage, setPercentage] = React.useState('');

  // overview of the company 
  const [description, setDescription] = React.useState('');

  // 0:green ; 1:red 
  const [toggle, setToggle] = React.useState(0);

  // portfolios 
  const [portfolios, setPortfolios] = React.useState([]);

  // dropdown options
  const [anchorEl, setAnchorEl] = React.useState(null);
  const isOpen = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // change: the difference between current price and last trade of prev day
  React.useEffect(() => {
    loadStockInfo();
    fetchPortfolios();
  },[]);

  // rerender of the page in searchbar query 
  React.useEffect(() => {
    loadStockInfo();
    fetchPortfolios();
  },[stockCode])

  function calculatePerc(a,b){
    let res = ((a-b)/a)*100; 
    return `${res.toFixed(2)}`;
  }

  const fetchPortfolios = async () => {
    const request = await axios.get(`${apiBaseUrl}/user/portfolios?token=${token}`);
    setPortfolios(request.data);
  };
  
  const loadStockInfo = async () => {
    try {
      const request = await axios.get(`${apiBaseUrl}/stocks/info?type=1&stocks=${stockCode}`);
      const reqInfo = request.data.data.quotes.quote;
      // console.log(reqInfo);
      setName(reqInfo.description);
      setPrice(reqInfo.ask);
      loadOverview();
      // if the market is closed, grab the most recent trading day and the day before that
      if (reqInfo.open === null){
        const request2 = await axios.get(`${apiBaseUrl}/stocks/info?type=2&stocks=${stockCode}`);
        const prevDay = request2.data.data.history.day;
        let latest = prevDay.length -1;
        // set curr day stats
        setClose(prevDay[latest].close);
        setHigh(prevDay[latest].high);
        setLow(prevDay[latest].low);
        setOpen(prevDay[latest].open);
        setVolume(prevDay[latest].volume);

        // set prev day stats
        setRange(`${prevDay[latest-1].low} - ${prevDay[latest-1].high}`);
        setPrevClose(prevDay[latest-1].close);
        let difference = reqInfo.ask - prevDay[latest-1].close;
        setChange(difference.toFixed(4));
        const string1 = JSON.stringify(difference);

        // if contains a minus change, set the toggle 
        if (string1.indexOf('-') !== -1){
          setToggle(1);
        }

        setPercentage(calculatePerc(reqInfo.ask, prevDay[latest-1].close));
        
        // if the markets currently open 
      } else {
        setChange(reqInfo.change);
        setPercentage(reqInfo.change_percentage);
        setOpen(reqInfo.open);
        setLow(reqInfo.low);
        setPrevClose(reqInfo.prevclose);
        setHigh(reqInfo.high);
        setVolume(reqInfo.volume);
        setRange(`${reqInfo.low} - ${reqInfo.high}`);

        const string2 = JSON.stringify(reqInfo.change);
        // if contains a minus change, set the toggle 
        if (string2.indexOf('-') !== -1){
          setToggle(1);
        }
    }}
    catch (e) {
      alert(e);
    }
  }

  const loadOverview = async () => {
    request.get({
      url: url,
      json: true,
      headers: {'User-Agent': 'request'}
    }, (err, res, data) => {
      if (err) {
        console.log('Error:', err);
      } else if (res.statusCode !== 200) {
        console.log('Status:', res.statusCode);
      } else {
        setDescription(data.Description);
      }
  });
  }

  //popup form to submit if its not watchlist
  const submitAdd = async (e) => {
    e.preventDefault();
  }

  return (
      <PageBody className="font-two">
          <Navigation />
          <Tabs />
          <ContentBody>
          <PfBody>
            <LeftBody>
              <PfBar>
                <Heading>{stockCode} {name}</Heading>
                <div>
                <Button
                  id="basic-button"
                  aria-controls="basic-menu"
                  aria-haspopup="true"
                  aria-expanded={isOpen ? 'true' : undefined}
                  onClick={handleClick}
                  endIcon={<KeyboardArrowDownIcon />}
                >
                  Add to Page
                </Button>
                <MenuList
                  id="basic-menu"
                  anchorEl={anchorEl}
                  open={isOpen}
                  onClose={handleClose}
                >
                  { portfolios && 
                    portfolios.map((a) => 
                        <StockSelect
                          stockCode = {stockCode}
                          key={a?.name}
                          name={a?.name}
                          pid={a?.pid}
                          setClose={handleClose}
                        />
                  )
                } 
                </MenuList>
              </div>
              </PfBar>
              <StockHeading> {price} USD {toggle?(
                <div style= {{color:'red'}}>
                  <ArrowDropDownIcon style={{fontSize:'2em', margin:'-10% 0%'}}/>
                  {change} {percentage}%
                </div>
              ):(
                <div style={{color:'green'}}>
                  <ArrowDropUpIcon style={{fontSize:'2em', margin:'-10% 0%'}}/>
                  {change} {percentage}%
                </div>
              )} </StockHeading> 
              <StockOverview >
              open: {open} &nbsp;
              low: {low} &nbsp;
              high: {high} &nbsp;
              volume: {volume} &nbsp;
              close:  {close} 
              </ StockOverview >
              <StocksGraph companyId={stockCode} height={300}/>
            </LeftBody>
            <RightBody>
              <RightCard>
                <p>previous close: {prevClose}</p>
                <p>day range: {dayRange}</p>
              </RightCard>
              <RightCard>
                <h3 style={{textAlign:'center'}}>Business Summary</h3>
                <p>{description}</p>
              </RightCard>
            </RightBody>
          </PfBody>
          </ContentBody>
      </PageBody>
  );
};

export default Stock; 