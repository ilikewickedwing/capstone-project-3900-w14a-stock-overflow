import React from 'react'; 
import { useHistory } from 'react-router';
import { ApiContext } from '../api';
import {TabBar, TabButton, CreatePortField, CreatePortContent} from '../styles/styling';
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';
import TabName from './TabName';



const Tabs = () => {
    const api = React.useContext(ApiContext);
    const history = useHistory();
    const token = localStorage.getItem('token');

    const [anchorEl, setAnchorEl] = React.useState(null);
    const [name, setName] = React.useState('');
    const [tabs, setTabs] = React.useState([]); 

    //handle popover open and close
    const handleCreatePort = (event) => {
      setAnchorEl(event.currentTarget);
    }
    const handleClose = () => {
      setAnchorEl(null);  
    }
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover': undefined;
    
    const refreshPortfolios = async () => {
      api.get(`user/portfolios?token=${token}`,{})
      .then((response) => {
        const newList = [];
        // append to new list of tabs 
        // response.forEach((element) => {
          //     console.log(element);
          // })
          response.json().then((e) => {
            e.forEach((obj)=> {
              newList.push({
                name: obj.name, 
                pid: obj.pid
              });
            });
            setTabs(newList);
          })
        })
    }
      // handle dashboard button
      const gotoDash = () => {
        history.push('/dashboard');
      }
      
      const submitNewPort = async(e) => {
        api.post('user/portfolios/create',{
          body:JSON.stringify({
            token,
            name,
          }),
        })
          .then ((e) => {
            console.log(e);
            handleClose();
              e.json().then((e) => {
                console.log(e.pid);
                history.push(`/portfolio?pid=${e.pid}`);
              })
          })
          .catch ((err)=> {
            alert(err);
          })
        e.preventDefault();
        return null;
      }

    React.useEffect(() => refreshPortfolios(),[]);

    React.useEffect(() =>{
      history.listen(() =>{
        refreshPortfolios();
        console.log("refreshing tabs");
      })
    }, [history]);


// TODO IMPLEMENT PROFILE AND DELETE ACC
    return (
        <TabBar>
            <TabButton onClick={gotoDash}>
                Dashboard
            </TabButton>
            {
              tabs.map((a) => 
                <TabName
                  key={a.name}
                  name={a.name}
                  pid={a.pid}
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