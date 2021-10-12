import React from 'react'; 
import { useHistory } from 'react-router';
import { ApiContext } from '../api';
import Navigation from './Navigation'; 
import Tabs from './Tabs'; 
import Popover from '@mui/material/Popover';
import {CreatePortField, CreatePortContent, ConfirmCancel,
        PfBody, LeftBody, RightBody, RightCard, PageBody, FlexRows} from '../styles/styling';
import Button from '@mui/material/Button';
import PfTable from './PfTable';
import AddStock from './AddStock';

const Portfolio= () => {
    const api = React.useContext(ApiContext);
    const history = useHistory();
    const token = localStorage.getItem('token');

    // popover code 
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [name, setName] = React.useState('');
          //handle popover open and close
    const handlePfRename = (event) => {
        setAnchorEl(event.currentTarget);
    }
    const handleClose = () => {
        setAnchorEl(null);  
    }
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover': undefined;

    //TODO IMPLEMENT TO DELETE THE PAGE 
    const submitPfRename = async(e) => {
        api.post('user/pf/',{
          body:JSON.stringify({
            token,
            name,
          }),
        })
          .then (() =>{
            alert('Portfolio renamed to: ' + name);
          })
          .then (() => {
            // refresh the page 
          })
          .catch ((err)=> {
            alert(err);
          })
        e.preventDefault();
      }

    // TODO: handle delete portfolio
    const handleDelete = async(e) => {

        e.preventDefault();
    }


    return (
        <PageBody>
            <Navigation />
            <Tabs />
            <h1> PORTFOLIO PAGE: Display page name here </h1> 
            <FlexRows>
              <Button id="renamePf" onClick={handlePfRename}> 
                  Rename Portfolio
              </Button>
              <Button color="secondary" onClick={handleDelete}>
                  Delete Portfolio
              </Button>
            </FlexRows> 
            <PfBody>
              <LeftBody>Left Body
                <p> print the list of stocks in this  </p>
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
                <form autoComplete="off" onSubmit={submitPfRename}>
                    <CreatePortField
                    required
                    fullWidth
                    id="renamePf"
                    label="Enter New Portfolio Name"
                    onChange={(e)=> {setName(e.target.value);}}
                    />
                    <br />
                    <ConfirmCancel>
                        <Button type="button" onClick={handleClose}>Cancel</Button>
                        <Button type="submit">CONFIRM</Button>
                    </ConfirmCancel>
                </form>
                </CreatePortContent>
            </Popover>
        </PageBody>
    );
};

export default Portfolio; 