import React from 'react'; 
import { useHistory, useParams } from 'react-router-dom';
import axios from "axios";
import Navigation from '../comp/Navigation'; 
import Tabs from '../comp/Tabs'; 
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
  FlexRows,
  PfBar,
} from '../styles/styling';
import Button from '@mui/material/Button';
import PfTable from '../comp/PfTable';
import AddStock from '../comp/AddStock';
import { apiBaseUrl } from '../comp/const';

const Portfolio = () => {
  const history = useHistory();
  const { pid } = useParams();
  const token = localStorage.getItem('token');

  // popover code 
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [name, setName] = React.useState('');
  const [changedName, editName ] = React.useState('');
  const [isWatchlist, setIsWatchlist] = React.useState(0);
  const [isChanged, setChanged ] = React.useState(0);

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

  const submitPfRename = async (e) => {
    e.preventDefault();
    try {
      setName(changedName);
      await axios.post(`${apiBaseUrl}/user/portfolios/edit`, {token, pid, name: changedName});
      setAnchorEl(null);
      setChanged(isChanged + 1);
    } catch (e) {
      alert(e.error);
    }
  }

  const handleDelete = async (e) => {
    e.preventDefault();
    try {
      await axios.delete(`${apiBaseUrl}/user/portfolios/delete`,{data: {token, pid}});
      history.push('/dashboard');
    } catch (e) {
      alert(e);
    }
  }

  const handleStockLoad = async (e) => {
    e.preventDefault();

  }

  return (
      <PageBody className="font-two">
          <Navigation />
          <Tabs isChanged={isChanged}/>
          <PfBody>
            <LeftBody>
              {isWatchlist 
              ? (<PfBar>
                <h1>{name}</h1> 
                </PfBar>)
              :
            (<PfBar>
              <div style={{}}>{name}</div> 
              <div style={{width:'100%'}}>
                <Button id="renamePf" onClick={(e) => setAnchorEl(e.currentTarget)}> 
                    Rename Portfolio
                </Button>
                <Button color="secondary" onClick={handleDelete}>
                    Delete Portfolio
                </Button>
              </div>
              </PfBar>
            )}
              <PfTable />
            < AddStock 
              token={token}
              pid={pid}
            />
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