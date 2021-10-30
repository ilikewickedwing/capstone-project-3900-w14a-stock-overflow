import React from 'react'; 
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { ApiContext } from '../api';
import axios from "axios";
import Navigation from './Navigation'; 
import Tabs from './Tabs'; 
import Popover from '@mui/material/Popover';
import {
  CreatePortField, 
  CreatePortContent, 
  ConfirmCancel,
  PfBody, 
  LeftBody, 
  RightBody, 
  RightCard, 
  PageBody, 
  FlexRows,
  FlexColumns
} from '../styles/styling';
import Button from '@mui/material/Button';
import PfTable from './PfTable';
import AddStock from './AddStock';
import { apiBaseUrl } from './const';

const Stock = () => {
  const api = React.useContext(ApiContext);
  const history = useHistory();
  const { pid } = useParams();
  const token = localStorage.getItem('token');

  const [name, setName] = React.useState('');

  return (
      <PageBody>
          <Navigation />
          <Tabs />
          <h1> STOCK PAGE: {name}</h1> 
          <FlexRows>
          </FlexRows> 
          <PfBody>
            <LeftBody>
        
              <PfTable />
            < AddStock />
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