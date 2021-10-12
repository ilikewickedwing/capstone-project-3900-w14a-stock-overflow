import * as React from 'react';

import { useHistory } from 'react-router';
import { ApiContext } from '../api';

import { PfBody, LeftBody, RightBody, RightCard, PageBody} from '../styles/styling';

import Navigation from './Navigation';
import Tabs from './Tabs';


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
