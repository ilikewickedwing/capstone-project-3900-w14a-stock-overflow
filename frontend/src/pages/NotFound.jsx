import * as React from 'react';

import { 
  PfBody, 
  PageBody,
  WatchlistBody,
} from '../styles/styling';
import Button from '@mui/material/Button';
import Navigation from '../comp/Navigation';
import Tabs from '../comp/Tabs';
import { useHistory } from 'react-router-dom';

const NotFound = () => {
    let history = useHistory();
    return (
    <PageBody className="font-two">
        <Navigation />
        <Tabs />
        <PfBody>
        <WatchlistBody elevation={10}>
            USER OR CELEBRITY YOU SEARCHED DOES NOT EXIST 
            < br />
            <Button onClick={()=> history.push('/dashboard')}>
                Go Back
            </Button>
        </WatchlistBody>
        </PfBody>
    </PageBody>
    )
}
export default NotFound;