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
  FlexRows,
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
          <h1> STOCK PAGE: {name}</h1> 
          <FlexRows>
          </FlexRows> 
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
      </PageBody>
  );
};

export default Stock; 