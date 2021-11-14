import * as React from 'react';
// component imports
import Navigation from '../comp/Navigation';
import Tabs from '../comp/Tabs';
import PerformanceTable from '../comp/PerformanceTable/PerformanceTable';
import { apiBaseUrl } from '../comp/const';
import axios from "axios";


// styling imports 
import { 
  PfBody, 
  LeftBody, 
  RightBody, 
  RightCard, 
  PageBody,
  Heading,
  PfBar,
} from '../styles/styling';
import leaderboard from '../assets/leaderboard.png';
import star from '../assets/star.png';

export default function Dashboard() {

    // first load render 
    React.useEffect(() => {  
      getGlobalRanks();
    },[]);

  const getGlobalRanks = async () => {
    try {
      const request = axios.get(`${apiBaseUrl}/rankings/global`);
      console.log(request.data);
    } catch (e) {
      alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
    }
  }
  
  return (
    <PageBody className="font-two">
      <Navigation />
      <Tabs />
      <PfBody>
              <LeftBody elevation={10}>
              <PfBar>
                <Heading>Dashboard</Heading> 
              </PfBar>
                <h3>Overall Performance</h3>
                <PerformanceTable />
              </LeftBody>
              <RightBody elevation={10}>
                <RightCard elevation={5}>
                  <div style={{textAlign:'center'}}>
                    <img style={{height:"auto", width:"50px"}} src={star} alt="star icon"/>
                  </div>
                  <h3 style={{textAlign:'center'}}>Today's Top Performer</h3>
                </RightCard>
                <RightCard elevation={5}>
                <div style={{textAlign:'center'}}>
                  <img style={{height:"auto", width:"50px"}} src={leaderboard} alt="leaderboard icon"/>
                </div>
                  <h3 style={{textAlign:'center'}}>Global Rankings</h3>
                </RightCard>
                <RightCard elevation={5}>
                  3rd
                </RightCard>
              </RightBody>
            </PfBody>
    </PageBody>
  );
}
