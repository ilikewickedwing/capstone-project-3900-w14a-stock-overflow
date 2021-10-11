import React from 'react'; 
import { useHistory } from 'react-router';
import {Link} from 'react-router-dom';
import { ApiContext } from '../api';
import Navigation from './Navigation'; 
import Tabs from './Tabs'; 

const Portfolio= () => {
    const api = React.useContext(ApiContext);
    const history = useHistory();
    
    return (
        <div>
            <Navigation />
            <Tabs />
            <h1> PORTFOLIO PAGE: Display page name here </h1> 
            <p> print the list of stocks in this  </p>
        </div>
    );
};

export default Portfolio;