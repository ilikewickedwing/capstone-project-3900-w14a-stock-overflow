import React from 'react';
import { TabButton } from '../styles/styling';
import {useHistory} from 'react-router-dom';

const TabName = ({
  name, pid,
}) => {
  const history = useHistory(); 
  return (
    <TabButton onClick={()=> {
      history.push(`/portfolio/${pid}`);
    }}>
      {name}
    </TabButton>
  )
};

export default TabName; 