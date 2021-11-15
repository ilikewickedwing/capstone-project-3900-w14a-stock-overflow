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
import PerformanceGraph from '../graph/PerformanceGraph';
import WatchlistCard from '../comp/WatchlistCard';



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
    const [pid, setPid] = React.useState('');
    const [tab, setTab] = React.useState('Summary');
    const [stocks, setStocks] = React.useState([]);
    const [selected, setGraphSelected] = React.useState([]);

    // Store friends activities
    const [activity, setActivity] = React.useState([]);
    const [likes, setLikes] = React.useState([]);

      // on first load 
    React.useEffect(() => {   
      getUid();
    },[]);

    // load based on friendUId getting awaited 
    React.useEffect(() => {   
      loadPortfolios();
      loadActivities();

    },[friendUid]);

    const loadActivities = async () => {
      if (friendUid === "") {
        return;
      }
      try {
        let list = [];
        let likesList = [];
        const resp = await axios.get(`${apiBaseUrl}/activity/friend?token=${token}&friendId=${friendUid}`);
        list.push(...resp.data);
        for (let index = 0; index < resp.data.length; index++) {
          const e = resp.data[index];
          list.push(e);
          let liked = 0;
          if(e.likedUsers.indexOf(friendUid) !== -1) {
            liked = 1;
          }
          likesList.push(liked);
        }
        setActivity(list);
        setLikes(likesList);
      } catch (e) {
        alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
      }
    }

    const getUserType = async () => {
      try {
        const resp = await axios.get(`${apiBaseUrl}/user/profile?uid=`);
        
      } catch (e) {
        alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
      }
    }

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

    const likeClick = async (id) => {
      try {
        let likesArray = likes;
        await axios.post(`${apiBaseUrl}/activity/like`, {token, aid: id});
        const newActivity = activity.map((e, i) => {
          if (e.aid === id) {
            likesArray[i] = (likesArray[i] + 1) % 2;
          }
        });
        setLikes(likesArray);
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
                  {portData.map((e)=>(
                      <FriendTab
                        key={e.name}
                        name={e.name}
                        pid={e.pid}
                        stocks={e.stocks}
                        setTab={setTab} 
                        setStocks={setStocks}
                        setPid={setPid}
                      / >
                  ))}
                  < br/> 
                  <h3>{tab}</h3>
                  {stocks.length > 0 && 
                  tab !== "Watchlist" ?(
                    <div>
                      <PerformanceGraph 
                        pids={pid}
                        height={300}
                        isFriend={true}
                        friendUid={friendUid}
                      />
                      <PfTable 
                        stocks={stocks}
                        load={loadPortfolios}
                        setGraphSelected={setGraphSelected}
                        isFriend={1}
                      />
                    </div>
                  ) : (
                    stocks.map(item => {
                    return <WatchlistCard
                      key={item.stock}
                      name={item.stock}
                      isFriend={1}
                    />})
                  )
                  }
              </LeftBody>
              <RightBody elevation={10}>
                <RightCard elevation={5} style={{overflowY:'scroll', height:'50vh'}}>
                  <h3 style={{textAlign:'center'}}>{handle}'s Activity</h3>
                  {activity.map((e, index) => (
                    <div key={index} >
                      <div>{e.ownerName}  Time: {e.time.split('T')[0]} {e.time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}</div>
                      <div>{e.message}</div>
                      <div>{e.likes} </div>
                      <Button onClick={()=> likeClick(e.aid)} style={ likes[index] ? {color:'green'} : {color:'grey'}}>Like</Button>
                      <Button onClick={()=> {}}>Comment</Button>
                    </div>
                  ))
                  }
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
