import * as React from 'react';

import { 
  PfBody, 
  LeftBody, 
  RightBody, 
  RightCard, 
  PageBody,
  Heading,
  PfBar,
  WatchlistBody,
} from '../styles/styling';
import Button from '@mui/material/Button';
import Navigation from '../comp/Navigation';
import Tabs from '../comp/Tabs';
import { AlertContext } from '../App';
import { useHistory, useParams } from 'react-router-dom';
import axios from "axios";
import { apiBaseUrl } from '../comp/const';
import FriendTab from '../comp/FriendTab';
import PfTable from '../comp/PfTable';

import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';


// note: friend is inclusive of celebrity profiles except celebrities are public profiles while friends are private 
export default function Friend() {
    let history = useHistory();
    const alert = React.useContext(AlertContext);
    const { handle } = useParams();
    const token = localStorage.getItem('token');
    const uid = localStorage.getItem('uid');

    const [friendUid, setUid] = React.useState('');
    
    // list of portfolios of all the portfolios given a uid 
    const [portData, setPortfolio ] = React.useState([]);

    // private: 0, public: 1
    const [isPublic, setPublic] = React.useState(0);

    // set which current stocks and tab to view 
    const [tab, setTab] = React.useState('Summary');
    const [stocks, setStocks] = React.useState([]);
    const [selected, setGraphSelected] = React.useState([]);

      // on first load 
    React.useEffect(() => {   
      getUid();
    },[]);

    // load based on friendUId getting awaited 
    React.useEffect(() => {   
      loadPortfolios();
    },[friendUid]);

  
    const getUid = async() => {
      try {
        const resp = await axios.get(`${apiBaseUrl}/user/uid?username=${handle}`);
        if (uid === resp.data.uid ){
          history.push('/dashboard');
          alert(`Cannot view your own portfolio, redirected to dashboard`,'error');
        } 
        setUid(resp.data.uid); 
      } catch (e){
        history.push('/oops');
        alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
      }
    }

    const sendRequest = async (e) => {
      e.preventDefault();
      try {
        await axios.post(`${apiBaseUrl}/friends/add`, {token, friendID:friendUid});
        alert("Friend request has been sent",'success'); 
      } catch (e){
        alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
      }
    }

    const loadPortfolios = async () => {
      try {
        let list = [];
        const summary = {
          name: "Summary",
          stocks: []
        }
        list.push(summary);
        const resp = await axios.get(`${apiBaseUrl}/friends/portfolios?token=${token}&uid=${friendUid}`);
        list.push(...resp.data);
        setPortfolio(list);
        console.dir(list, {depth:null});
        if (resp.data.length > 0 ){
          setPublic(1);
        }
      } catch (e) {
        alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
      }
    }

  return (
    <PageBody className="font-two">
      <Navigation />
      <Tabs />
        {isPublic?(
                // public to the user portfolio
                <PfBody>
                <LeftBody elevation={10}>
                <PfBar>
                  <Heading>{handle} </Heading>
                </PfBar>
                  {portData.map((e) =>(
                    <Tab key={e.name} label={e.name} onClick={setStocks(e.stocks)} />
                  ))}
                  {portData.map((e)=>(
                      <FriendTab
                        key={e.name}
                        name={e.name}
                        stocks={e.stocks}
                        setTab={setTab} 
                        setStocks={setStocks}
                      / >
                  ))}
                  < br/> 
                  <h3>{tab}</h3>
                  {stocks.length > 0 && (
                    <PfTable 
                      stocks={stocks}
                      load={loadPortfolios}
                      setGraphSelected={setGraphSelected}
                      isFriend={1}
                    />
                  )}
              </LeftBody>
              <RightBody elevation={10}>
                <RightCard elevation={5}>
                  <h3 style={{textAlign:'center'}}>{handle}'s Activity</h3>
                </RightCard>
              </RightBody>
            </PfBody>
          ):(
            //private portfolio
            <PfBody>
              <WatchlistBody elevation={10}>
                <PfBar>
                  <Heading>{handle} (private portfolio) </Heading>
                  <Button id="addFriend" onClick={sendRequest}> 
                      Send Friend Request
                  </Button>
                </PfBar>
              </WatchlistBody>
        </PfBody>
            )}
    </PageBody>
  );
}
