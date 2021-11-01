import React from 'react'; 
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { ApiContext } from '../api';
import axios from "axios";
import Navigation from './Navigation'; 
import Tabs from './Tabs'; 

import {
  PfBody, 
  LeftBody, 
  RightBody, 
  RightCard, 
  PageBody, 
  StockOverview,
  ContentBody
} from '../styles/styling';
import { apiBaseUrl } from './const';

const Stock = () => {
  const api = React.useContext(ApiContext);
  const history = useHistory();
  const { pid } = useParams();
  const token = localStorage.getItem('token');

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