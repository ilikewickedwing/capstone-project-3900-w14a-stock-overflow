import React from 'react'; 
import { useHistory} from 'react-router-dom';
import { useParams } from "react-router";
import { ApiContext } from '../api';
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
  const api = React.useContext(ApiContext);
  const history = useHistory();
  const { stockCode } = useParams();
  const token = localStorage.getItem('token');
  console.log(stockCode);

  const [name, setName] = React.useState('');

  React.useEffect(() =>{
      loadStockInfo();
  },[]);

  const loadStockInfo = async () => {
      try {

      } catch (e) {
          alert(e);
      }
  }

  return (
      <PageBody>
          <Navigation />
          <Tabs />
          <ContentBody>
          <h3>StockCode:StockName</h3>
          <h4>$price -3%(live %) (day change %) </h4> 
          <StockOverview >
          STOCK PAGE: {name}
          previous close: 
          day range: 
          year range: 
          market cap: 
          </ StockOverview >
          <PfBody>
            <LeftBody>
              <StocksGraph companyId={stockCode} height={200}/>
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
          </ContentBody>
      </PageBody>
  );
};

export default Stock; 