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

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Portfolio= () => {
    const api = React.useContext(ApiContext);
    const history = useHistory();
    const token = localStorage.getItem('token');

    // popover code 
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [name, setName] = React.useState('');
    const [changedName, editName ] = React.useState('');
    const [isWatchlist, setIsWatchlist] = React.useState(0); 
    const pid = useQuery().get('pid');
    console.log(pid);

    const handlePfRename = (event) => {
        setAnchorEl(event.currentTarget);
    }
    const handleClose = () => {
        setAnchorEl(null);  
    }

    const loadPf = async () => {
      api.get(`user/portfolios/open?pid=${pid}`,{})
      .then((response) => {
          response.json().then((e) => {
            console.log(e.name);
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
          name: changedName
        }));
        api.post('user/portfolios/edit',{
          body:JSON.stringify({
            token: token,
            pid: pid ,
            name: changedName
          }),
        })
          .then ((e) => {
            if(e.status !== 200 ){
              e.json().then((e) => alert(e.error))
            } else {
              setName(changedName);
              loadPf();
            }
          })
          .then (() =>handleClose())
        e.preventDefault();
      }
    // TODO: handle delete portfolio
    const handleDelete = async(e) => {
        api.delete(`user/portfolios/delete?token=${token}&pid=${pid}`,{})
          .then ((e) => {
            if(e.status !== 200 ){
              e.json().then((e) => alert(e.error))
            }
          })
          .then(()=> history.push('/dashboard')) 
        e.preventDefault();
    }

    // // on first load 
    React.useEffect(() => loadPf(),[]);

    // on url change 
    React.useEffect(() =>{
      history.listen((location) =>{
        loadPf();
        console.log("refreshing portfolios");
      })
    }, [history]);

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