import React from 'react'; 
import { useParams } from "react-router";
import axios from "axios";
import Navigation from '../comp/Navigation'; 
import Tabs from '../comp/Tabs'; 
import StocksGraph from "../graph/StocksGraph";

import {
  PfBody, 
  LeftBody, 
  RightBody, 
  RightCard, 
  PageBody, 
  StockOverview,
  ContentBody
} from '../styles/styling';
import { apiBaseUrl } from '../comp/const';


const Stock = () => {
  const { stockCode } = useParams();
  
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

  // change: the difference between current price and last trade of prev day
  React.useEffect(() => {
    loadStockInfo();
  },[]);

  function calculatePerc(a,b){
    let res = (a/b)*100;
    return `${res.toFixed(2)}%`;
  }
  
  const loadStockInfo = async () => {
      try {
        const request = await axios.get(`${apiBaseUrl}/stocks/info?type=1&stocks=${stockCode}`);
        const reqInfo = request.data.data.quotes.quote;
        console.log(reqInfo);
        setName(reqInfo.description);
        setPrice(reqInfo.ask);
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
        }
      } catch (e) {
          alert(e);
      }
  }

  return (
      <PageBody className="font-two">
          <Navigation />
          <Tabs />
          <ContentBody>
          <h3>{stockCode} {name}</h3>
          <h4>{price} USD {change} {percentage} </h4> 
          <StockOverview >
          open: {open} 
          low: {low} 
          high: {high} 
          volume: {volume} 
          close:  {close} 
          </ StockOverview >
          <PfBody>
            <LeftBody>
              <StocksGraph companyId={stockCode} height={200}/>
            </LeftBody>
            <RightBody>
              <RightCard>
                <p>previous close: {prevClose}</p>
                <p>day range: {dayRange}</p>
              </RightCard>
              <RightCard>
                <h3 style={{textAlign:'center'}}>Business Summary</h3>
              </RightCard>
            </RightBody>
          </PfBody>
          </ContentBody>
      </PageBody>
  );
};

export default Stock; 