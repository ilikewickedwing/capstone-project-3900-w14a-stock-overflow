import React, { useContext } from 'react'; 
import { useHistory } from 'react-router';
import {TabBar, TabButton, CreatePortField, CreatePortContent} from '../styles/styling';
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';
import TabName from './TabName';
import axios from "axios";

import { apiBaseUrl } from './const';
import { AlertContext } from '../App';


const Tabs = ({isChanged}) => {
  const alert = useContext(AlertContext);
  const history = useHistory();
  const token = localStorage.getItem('token');

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [name, setName] = React.useState('');
  const [portfolios, setPortfolios] = React.useState([]);


  const fetchPortfolios = async () => {
    try {
      const request = await axios.get(`${apiBaseUrl}/user/portfolios?token=${token}`);
      setPortfolios(request.data);
    } catch (e) {
      alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
    }
  };

  // fetch the tabs on load 
  React.useEffect(() => {      
    fetchPortfolios();
  }, []);

  // refresh the tabs on every changed name
  React.useEffect(() =>{
    fetchPortfolios();
  },[isChanged])
  
  // handle popover open and close
  const handleCreatePort = (event) => {
    setAnchorEl(event.currentTarget);
  }
  const handleClose = () => {
    setAnchorEl(null);  
  }
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover': undefined;

  // handle dashboard button
  const gotoDash = () => {
    history.push('/dashboard');
  }
      
  const submitNewPort = async (e) => {
    e.preventDefault();      
    try {
      const request = await axios.post(`${apiBaseUrl}/user/portfolios/create`, {token, name});
      const newPid = request.data;
      fetchPortfolios();
      handleClose();
      history.push(`/portfolio/${newPid.pid}`);
    } catch (e) {
      alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
    }
  }

// TODO IMPLEMENT PROFILE AND DELETE ACC
    return (
        <TabBar>
            <TabButton onClick={gotoDash}>
                Dashboard
            </TabButton>
            { portfolios &&
              portfolios.map((a) => 
                <TabName
                  key={a?.name}
                  name={a?.name}
                  pid={a?.pid}
                />
              )
            }
            <TabButton id="createPortButton" onClick={handleCreatePort}>
            Add New Portfolio
            </TabButton>

            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                vertical:'bottom',
                horizontal:'left',
                }}
                transformOrigin={{
                vertical:'top',
                horizontal:'center',
                }}
            >
                <CreatePortContent>
                <form autoComplete="off" onSubmit={submitNewPort}>
                    <CreatePortField
                    required
                    fullWidth
                    id="createPortButton"
                    label="Enter New Portfolio Name"
                    onChange={(e)=> {setName(e.target.value);}}
                    />
                    <br />
                    <Button type="button" onClick={handleClose}>Cancel</Button>
                    <Button type="submit">Create Portfolio</Button>
                </form>
                </CreatePortContent>
            </Popover>
        </TabBar>
    );
};

export default Tabs;