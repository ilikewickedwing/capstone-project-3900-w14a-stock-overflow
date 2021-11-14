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
import RankTable from '../comp/RankTable'; 
import leaderboard from '../assets/leaderboard.png';
import { AlertContext } from '../App';
import { useHistory, useParams } from 'react-router-dom';
import axios from "axios";
import { apiBaseUrl } from '../comp/const';

// stub data for rankings
function createData(name, performance, rank) {
  return { name, performance, rank };
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0),
  createData('Ice cream sandwich', 237, 9.0),
  createData('Eclair', 262, 16.0),
  createData('Cupcake', 305, 3.7),
  createData('Gingerbread', 356, 16.0),
];

const myRanking = createData('dollalilz', 300, 99999);

// note: friend is inclusive of celebrity profiles except celebrities are public profiles while friends are private 
export default function Friend() {
    const alert = React.useContext(AlertContext);
    const { handle } = useParams();
    const token = localStorage.getItem('token');

    const [uid, setUid] = React.useState('');

      // on first load 
    React.useEffect(() => {   
      getUid();
    },[]);

    const getUid = async() => {
      try {
        const resp = await axios.get(`${apiBaseUrl}/user/uid?username=${handle}`);
        setUid(resp.data.uid); 
      } catch (e){
        alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
      }
    }
    // private: 0, public: 1
    const [isPublic, setPublic] = React.useState(0);

    const sendRequest = async (e) => {
      e.preventDefault();
      try {
        await axios.post(`${apiBaseUrl}/friends/add`, {token, friendID:uid});
        alert("Friend request has been sent",'success'); 
      } catch (e){
        alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
      }
    }

    // calls the backend to check if the page is viewable from the current user 
    const checkPublic = async () => {
      try {
      // go through friends list 
      
      } catch (e){
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
              </LeftBody>
              <RightBody elevation={10}>
                <RightCard elevation={5}>
                  <div style={{textAlign:'center'}}>
                    <img style={{height:"auto", width:"50px"}} src={leaderboard} alt="leaderboard icon"/>
                  </div>
                  <h3 style={{textAlign:'center'}}>Ranking amongst friends</h3>
                  <RankTable
                    rows={rows}
                    myRanking={myRanking}
                  />
                </RightCard>
                <RightCard elevation={5}>
                  <h3 style={{textAlign:'center'}}>Friend Activity</h3>
                </RightCard>
              </RightBody>
            </PfBody>
          ):(
            //private portfolio
            <PfBody>
              <WatchlistBody elevation={10}>
                <PfBar>
                  <Heading>{handle} (private) </Heading>
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
