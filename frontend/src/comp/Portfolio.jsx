import React from 'react'; 
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { ApiContext } from '../api';
import axios from "axios";
import Navigation from './Navigation'; 
import Tabs from './Tabs'; 
import Popover from '@mui/material/Popover';
import {
  CreatePortField, 
  CreatePortContent, 
  ConfirmCancel,
  PfBody, 
  LeftBody, 
  RightBody, 
  RightCard, 
  PageBody, 
  FlexRows
} from '../styles/styling';
import Button from '@mui/material/Button';
import PfTable from './PfTable';
import AddStock from './AddStock';
import { apiBaseUrl } from './const';

const Portfolio = () => {
  const api = React.useContext(ApiContext);
  const history = useHistory();
  const { pid } = useParams();
  const token = localStorage.getItem('token');

  // popover code 
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [name, setName] = React.useState('');
  const [changedName, editName ] = React.useState('');
  const [isWatchlist, setIsWatchlist] = React.useState(0);
  const [portfolios, setPortfolios] = React.useState([]); 

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover': undefined;

  // on first load 
  React.useEffect(() => {   
    loadPorfolioData();
  },[pid]);
  
  const loadPorfolioData = async () => {
    try {
      const request = await axios.get(`${apiBaseUrl}/user/portfolios/open?pid=${pid}`);
      const porfolioData = request.data;
      setName(porfolioData.name);

      if (porfolioData.name === "Watchlist"){
        setIsWatchlist(1);
      } else {setIsWatchlist(0)}
    } catch (e) {
      alert(e.error);
    }
  }; 

  //TODO IMPLEMENT TO DELETE THE PAGE 
  const submitPfRename = async (e) => {
    e.preventDefault();
    try {
      setName(changedName);
      await axios.post(`${apiBaseUrl}/user/portfolios/edit`, {token, pid, name: changedName});
      setAnchorEl(null);
      // reload the page to refresh the tab
      window.location.reload(false);
    } catch (e) {
      alert(e.error);
    }
  }

  // TODO: handle delete portfolio
  const handleDelete = async (e) => {
    e.preventDefault();
    api.delete(`user/portfolios/delete?token=${token}&pid=${pid}`,{})
      .then ((e) => {
        if(e.status !== 200 ){
          e.json().then((e) => alert(e.error))
        }
      })
      .then(()=> history.push('/dashboard')) 
  }

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
                  <Button id="renamePf" onClick={(e) => setAnchorEl(e.currentTarget)}> 
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
              onClose={() => setAnchorEl(null)}
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
                  onChange={(e)=> editName(e.target.value)}
                  />
                  <br />
                  <ConfirmCancel>
                      <Button type="button" onClick={() => setAnchorEl(null)}>Cancel</Button>
                      <Button type="submit">CONFIRM</Button>
                  </ConfirmCancel>
              </form>
              </CreatePortContent>
          </Popover>
      </PageBody>
  );
};

export default Portfolio; 