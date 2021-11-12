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
                print the list of stocks in this 
              </LeftBody>
              <RightBody elevation={10}> Right Body: contains the 3 side cards 
                <RightCard elevation={5}>
                  First card
                </RightCard>
                <RightCard elevation={5}>
                  2nd card
                </RightCard>
                <RightCard elevation={5}>
                  3rd
                </RightCard>
              </RightBody>
            </PfBody>
    </PageBody>
  );
}
