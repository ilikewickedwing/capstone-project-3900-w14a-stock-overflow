import React from 'react'; 
import { useHistory } from 'react-router';
import { ApiContext } from '../api';
import {TabBar, TabButton, CreatePortField, CreatePortContent} from '../styles/styling';
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';



const Tabs = () => {
    const api = React.useContext(ApiContext);
    const history = useHistory();
    const token = localStorage.getItem('token');

    const [anchorEl, setAnchorEl] = React.useState(null);
    const [name, setName] = React.useState('');

    // handle dashboard button
    const gotoDash = () => {
        history.push('/dashboard');
    }
      //handle popover open and close
    const handleCreatePort = (event) => {
        setAnchorEl(event.currentTarget);
    }
    const handleClose = () => {
        setAnchorEl(null);  
    }
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover': undefined;

    const submitNewPort = async(e) => {
        console.log(token);
        api.post('user/pf/create',{
          body:JSON.stringify({
            token,
            name,
          }),
        })
          .then (() =>{
            alert('New portfolio named:'+name+ ' was created');
          })
          // .then (() => {
          //   refreshPortfolios();
          // })
          .catch ((err)=> {
            alert(err);
          })
        e.preventDefault();
        return null;
      }
    
// TODO IMPLEMENT PROFILE AND DELETE ACC
    return (
        <TabBar>
            <TabButton onClick={gotoDash}>
                Dashboard
            </TabButton>
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