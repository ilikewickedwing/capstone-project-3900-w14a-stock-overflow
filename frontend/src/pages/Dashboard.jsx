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
              <LeftBody>
              <PfBar>
                <Heading>Dashboard</Heading> 
              </PfBar>
                <p> print the list of stocks in this  </p>
              </LeftBody>
              <RightBody> Right Body: contains the 3 side cards 
                <RightCard>
                  First card
                </RightCard>
                <RightCard>
                  2nd card
                </RightCard>
                <RightCard>
                  3rd
                </RightCard>
              </RightBody>
            </PfBody>
    </PageBody>
  );
}
