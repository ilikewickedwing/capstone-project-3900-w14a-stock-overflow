import React from 'react'; 
import { useHistory } from 'react-router';
import { ApiContext } from '../api';
import {TabBar, TabButton, CreatePortField, CreatePortContent} from '../styles/styling';
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';
import TabName from './TabName';
import axios from "axios";

import { apiBaseUrl } from './const';


const Tabs = () => {
  const api = React.useContext(ApiContext);
  const history = useHistory();
  const token = localStorage.getItem('token');

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [name, setName] = React.useState('');
  const [portfolios, setPortfolios] = React.useState([]);

  React.useEffect(() => {      
    const fetchPortfolios = async () => {
      const request = await axios.get(`${apiBaseUrl}/user/portfolios?token=${token}`);
      setPortfolios(request.data);
    };
    fetchPortfolios();
  }, []);
  
  //handle popover open and close
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
    const request = await axios.post(`${apiBaseUrl}/user/portfolios/create`, {token, name});
    const newPid = request.data;

    console.log(newPid);
    handleClose();
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