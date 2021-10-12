import * as React from 'react';

import { useHistory } from 'react-router';
import { ApiContext } from '../api';

import { PfBody, LeftBody, RightBody, RightCard, PageBody} from '../styles/styling';

// MUI4 for the rest
import { makeStyles } from '@material-ui/core/styles';

import Navigation from './Navigation';
import Tabs from './Tabs';

// adjust container height to change how many cards are displayed on the right column. hacky solution
const useStyles = makeStyles({
  box: {
    height: "100%",
    width: "100%"
  },
  container: {
    height: "800px"
  },
  innerContainer: {
    height: "100%"
  },
  item: {
    flex: "auto"
  },
  root: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

export default function Dashboard() {
  const api = React.useContext(ApiContext);
  let history = useHistory(); 
  const token = localStorage.getItem('token');

  // handle delete user
  const onDeleteUser = async () => {
    console.log(token);

    const resp = await api.authDelete(token);
    if (resp.status === 403) alert('Invalid token');
    if (resp.status === 200) {
        alert('Account has been delted');
        history.push('/');
    } else {
        alert(`Server returned unexpected status code of ${resp.status}`);
    }
  }

  return (
    <PageBody>
      <Navigation />
      <Tabs />
      <h1>Dashboard</h1>
      <PfBody>
              <LeftBody>Left Body
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
