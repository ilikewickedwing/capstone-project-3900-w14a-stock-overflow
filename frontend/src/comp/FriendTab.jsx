import React from 'react';
import { TabButton } from '../styles/styling';
import {useHistory} from 'react-router-dom';

const FriendTab = ({
  name, stocks, setTab, setStocks
}) => {

  // summon the stock table for that stock
 const handleTabClick = () =>{
     setTab(name);
     let stockList = [];
     for (let i = 0; i < stocks.length; i++){
        if (stocks[i].quantity !== 0){
          stockList.push(stocks[i]);
        }
      }
     setStocks(stockList);
 }
  
  return (
    <TabButton onClick={handleTabClick}>
      {name}
    </TabButton>

  )
};

export default FriendTab; 