import React from 'react'; 
import { useHistory, useLocation } from 'react-router-dom';
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
    const [changedName, editName ] = React.useState('');
    const [isWatchlist, setIsWatchlist] = React.useState(0); 

    const handlePfRename = (event) => {
        setAnchorEl(event.currentTarget);
    }
    const handleClose = () => {
        setAnchorEl(null);  
    }

    function useQuery() {
      return new URLSearchParams(useLocation().search);
    }
    const pid = useQuery().get('pid');


    const loadPf = async () => {
      api.get(`user/portfolios/open?pid=${pid}`,{})
        .then((response) => {
          response.json().then((e) => {
            setName(e.name);
            if (e.name === "Watchlist"){
              setIsWatchlist(1);
            } else {setIsWatchlist(0)}
          })
        })
        .catch((err) => {
          alert(err); 
        })
    }


    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover': undefined;

    //TODO IMPLEMENT TO DELETE THE PAGE 
    const submitPfRename = async(e) => {
        console.log(JSON.stringify({
          token,
          pid,
          changedName,
        }));
        api.post('user/portfolios/edit',{
          body:JSON.stringify({
            token,
            pid,
            changedName,
          }),
        })
          .then ((e) =>{
            e.json().then((e) => {
              console.log(e);
            })
          })
          .then (() =>handleClose())
          // .then (() =>{
          //   alert('Portfolio renamed to: ' + changedName);
          // })
          .catch ((err)=> alert(err))
        e.preventDefault();
      }
    
    // TODO: handle delete portfolio
    const handleDelete = async(e) => {
        api.delete(`user/portfolios/delete?token=${token}&pid=${pid}`,{})
          .then(()=> alert('delete successful'))
          .then(()=> history.push('/dashboard'))
          .catch((err) => {
            alert(err);
          })
        e.preventDefault();
    }

    React.useEffect(() => loadPf(),[]);

    return (
        <PageBody>
            <Navigation />
            <Tabs />
            <h1> PORTFOLIO PAGE: {name}</h1> 
            <FlexRows>
            </FlexRows> 
            <PfBody>
              <LeftBody>
                {isWatchlist === 0 &&
                  <div style={{textAlign: 'right', width:'100%'}}>
                    <Button id="renamePf" onClick={handlePfRename}> 
                        Rename Portfolio
                    </Button>
                    <Button color="secondary" onClick={handleDelete}>
                        Delete Portfolio
                    </Button>
                  </div>
                }
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
                    onChange={(e)=> {editName(e.target.value);}}
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