import React, { useContext, useState } from 'react'; 
import axios from 'axios';
import { apiBaseUrl } from './const';
import { ApiContext } from '../api';

const StockRow = ({data}) => {
  const api = useContext(ApiContext);
  const stock = data.stock;
  async function handleDeleteStock() {
    // get token from local storage
    const token = localStorage.getItem('token');
    // get pid
    const res = await axios.get(`${apiBaseUrl}/user/portfolios/getPid`, {
      params: {
        token: token,
        name: 'Watchlist'
      }
    })
    const pid = res.data;
    const resp = await axios.put(`${apiBaseUrl}/user/stocks/edit`, {
      token: token,
      pid: pid,
      stock: stock,
      price: 0,
      quantity: 0,
      option: 0
    })
  }

  // async function getStockDetails() {
  //   const resp = await api.stocksInfo(1, data.stock, null, null);
  //   const jsonResp = await resp.json();
  //   //console.log(jsonResp.data.quotes.quote.change);
  //   setChange(jsonResp.data.quotes.quote.change);
  //   setChangePercentage(jsonResp.data.quotes.quote.change_percentage);
  // }
  return (
    <div>
      <ul>Symbol: {data.stock}</ul>
      <ul>Name: {data.name}</ul>
      <ul>Price change: {data.change}</ul>
      <ul>Price change percentage: {data.changePercentage}</ul>
      {/* <button onClick={getStockDetails}>Get Recent Data</button> */}
      <button onClick={handleDeleteStock}>Delete</button>
    </div>
  )
}

export default StockRow;