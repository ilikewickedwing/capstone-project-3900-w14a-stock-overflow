import * as React from 'react';

import { 
  PfBody, 
  PageBody,
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
        USER OR CELEBRITY YOU SEARCHED DOES NOT EXIST 
        <Button onClick={history.push('/dashboard')}>
            Go Back
        </Button>
        </PfBody>
    </PageBody>
    )
}
export default NotFound;