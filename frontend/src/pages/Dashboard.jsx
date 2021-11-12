import * as React from 'react';

import { 
  PfBody, 
  LeftBody, 
  RightBody, 
  RightCard, 
  PageBody,
  Heading,
  PfBar,
} from '../styles/styling';

import Navigation from '../comp/Navigation';
import Tabs from '../comp/Tabs';
import leaderboard from '../assets/leaderboard.png';


export default function Dashboard() {
  return (
    <PageBody className="font-two">
      <Navigation />
      <Tabs />
      <PfBody>
              <LeftBody elevation={10}>
              <PfBar>
                <Heading>Dashboard</Heading> 
              </PfBar>
              </LeftBody>
              <RightBody elevation={10}>
                <RightCard elevation={5}>
                  <h3 style={{textAlign:'center'}}>Top Performer Amongst Friends</h3>
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
