import React from 'react';
import { TabButton } from '../styles/styling';

const FriendTab = ({
  name, stocks,pid, setTab, setStocks, setPid
}) => {
  // summon the stock table for that stock
 const handleTabClick = () =>{
    setTab(name);
    setPid(pid);
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