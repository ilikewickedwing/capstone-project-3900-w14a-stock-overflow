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

import IconButton from '@mui/material/IconButton';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import StocksGraph from '../graph/StocksGraph';


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
    const [userType, setUserType] = React.useState('');

    // set which current stocks and tab to view 
    const [pid, setPid] = React.useState('');
    const [tab, setTab] = React.useState('Summary');
    const [stocks, setStocks] = React.useState([]);
    const [selected, setGraphSelected] = React.useState([]);

    // Store friends activities
    const [activity, setActivity] = React.useState([]);

    const [followers, setFollowers] = React.useState([]);

      // on first load 
    React.useEffect(() => {   
      getUid();
    },[]);

    // load based on friendUId getting awaited 
    React.useEffect(() => {   
      loadPortfolios();
      loadActivities();
      getUserType();
      loadDiscover();

    },[friendUid]);

    // load all current celebrities 
    const loadDiscover = async () => {
      try {
        const resp = await axios.get(`${apiBaseUrl}/celebrity/discover`);
        setFollowers(resp.data.followers[friendUid]);
      } 
      catch (e) {
        alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
      }
    }

    // loop through the current celebrities and determine whether to follow or unfollow celeb
    const followCeleb = async () => {
      try {
        await axios.post(`${apiBaseUrl}/celebrity/follow`,{token, isFollow: !followers.includes(uid), celebUid: friendUid});
        loadDiscover();
      } catch (e) {
        alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
      }
    }
    
    // load the friend/ celeb's activities
    const loadActivities = async () => {
      if (friendUid === "") {
        return;
      }
      try {
        let list = [];
        const resp = await axios.get(`${apiBaseUrl}/activity/friend?token=${token}&friendId=${friendUid}`);
        list.push(... resp.data);
        setActivity(list);
      } catch (e) {
        alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
      }
    }

    // check if user is celeb/ user
    const getUserType = async () => {
      if (friendUid === "") {
        return;
      }
      try {
        const resp = await axios.get(`${apiBaseUrl}/user/profile?uid=${friendUid}&token=${token}`);
        setUserType(resp.data.userType);
        if (resp.data.userType ==="celebrity"){
          loadDiscover();
        }
      } catch (e) {
        alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
      }
    }

    // grab uid based on username 
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

    // handle add friend event 
    const sendRequest = async (e) => {
      e.preventDefault();
      try {
        await axios.post(`${apiBaseUrl}/friends/add`, {token, friendID:friendUid});
        alert("Friend request has been sent",'success'); 
      } catch (e){
        alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
      }
    }

    // load all the portfolios and a summary page of overall performance 
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
        if (resp.data.length > 0 ){
          setPublic(1);
        } else {
          setPublic(0);
        }
      } catch (e) {
        alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
      }
    }

    //handle like activity event 
    const likeClick = async (id) => {
      try {
        await axios.post(`${apiBaseUrl}/activity/like`, {token, aid: id});
        loadActivities();
      } catch (e){
        alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
      }
    }

    const unfriend = async () => {
      try {
        await axios.delete(`${apiBaseUrl}/friends/remove`,{data:{token, friendID: friendUid}});
        setPublic(0);
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
                  <Heading>{handle}'s Portfolios </Heading>
                  {userType==="celebrity" && 
                    <Button variant="outlined" color="secondary" id="addFriend" onClick={followCeleb}> 
                      {`${followers.includes(uid) ? 'Unfollow' : 'Follow'}`}
                    </Button>
                  }
                  {userType==="user" && 
                    <Button variant="outlined" color="secondary" id="addFriend" onClick={unfriend}> 
                      Unfriend
                    </Button>
                  }
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
                  {tab ==='Summary' &&
                  <PerformanceGraph 
                  pids={''}
                  height={300}
                  isFriend={true}
                  friendUid={friendUid}
                />}
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
              <RightBody>
                <RightCard elevation={10}>
                  <h3 style={{textAlign:'center'}}>{handle}'s Net Profits</h3>
                </RightCard>
                {selected.length > 0 && 
                  <RightCard elevation={10}>
                    <h3 style={{textAlign:'center'}}>Stocks Comparison</h3>
                    <StocksGraph companyId={selected.toString()} height={150}/>
                  </RightCard>
                }
                <RightCard elevation={10} style={{overflowY:'scroll', height:'50vh'}}>
                  <h3 style={{textAlign:'center'}}>{handle}'s Activity</h3>
                  {activity.map((e, index) => (
                    <div key={index} >
                      <div>{e.ownerName}  Time: {e.time.split('T')[0]} {e.time.substring(11,16)}</div>
                      <div>{e.message}</div>
                      <div>{e.likes} </div>
                      <IconButton onClick={()=> likeClick(e.aid)}>
                          {
                            (e.likedUsers.indexOf(uid) !== -1) ? (
                              <ThumbUpOutlinedIcon style={{color:"green"}} />
                            ):(
                              <ThumbUpOutlinedIcon style={{color:"grey"}}  />  
                            )
                          }
                      </IconButton>
                      <IconButton>
                          <CommentOutlinedIcon /> 
                      </IconButton>
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
                  <Heading>{handle}'s (private) </Heading>
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
