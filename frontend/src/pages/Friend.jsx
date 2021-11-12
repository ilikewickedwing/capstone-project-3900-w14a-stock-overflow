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
import { AlertContext } from '../App';

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
    // private: 0, public: 1
    const [isPublic, setPublic] = React.useState(1);

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
              <RightBody elevation={10}>
                <RightCard elevation={5}>
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
