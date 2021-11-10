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


// note: friend is inclusive of celebrity profiles except celebrities are public profiles while friends are private 
export default function Friend() {
    // private: 0, public: 1
    const [isPublic, setPublic] = React.useState(0);

    const sendRequest = (e) => {
      e.preventDefault();
      try {
        alert("Friend request has been sent"); 
      } catch (e){
        alert(`Status Code ${e.response.status} : ${e.response.data.error}`);
      }
    }

    // calls the backend to check if the page is viewable from the current user 
    const checkPublic = async () => {
      try {

      } catch (e){
        alert(`Status Code ${e.response.status} : ${e.response.data.error}`);
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
                  <Heading>Public Portfolio </Heading>
                </PfBar>

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
          ):(
            //private portfolio
            <PfBody>
              <WatchlistBody elevation={10}>
                <PfBar>
                  <Heading>Private Portfolio </Heading>
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
