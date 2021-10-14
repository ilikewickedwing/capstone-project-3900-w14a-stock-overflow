import React from 'react';
import PropTypes from 'prop-types';
import { TabButton } from '../styles/styling';
import {useHistory} from 'react-router-dom';

const TabName = ({
    name, pid,
}) => {
    const history = useHistory(); 
    
    return (
            <TabButton onClick={()=> {
                history.push(`/portfolio?pid=${pid}`);
            }}>
                {name}
            </TabButton>
    )
};

TabName.propTypes = {
    name: PropTypes.string.isRequired,
    pid: PropTypes.string.isRequired,
};

export default TabName; 