import React from 'react'; 
import { useHistory } from 'react-router';
import {Link} from 'react-router-dom';
import { ApiContext } from '../api';
import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import {NavBar, Logo, LogoutButton, FlexRows } from '../styles/styling';
import { Button } from '@material-ui/core';

const Navigation = () => {
    const api = React.useContext(ApiContext);
    const history = useHistory();

   // handle logout
   const onLogOut = async () => {
    const token = localStorage.getItem('token');
    const resp = await api.authLogout(token);
    if (resp.status === 403) alert('Invalid token');
    if (resp.status === 200) {
        alert('Token has been invalidated');
        history.push('/');
    } else {
        alert(`Server returned unexpected status code of ${resp.status}`);
    }
  }
// TODO IMPLEMENT PROFILE AND DELETE ACC
    return (
        <NavBar>
            <Link to="/dashboard">
                <Logo>
                    Stock Overflow 
                </Logo>
            </Link>
            <FlexRows style={{padding:"1%"}}>
                <Link to="/profile">
                    <Button>
                        Edit Profile
                    </Button>
                </Link>
                <LogoutButton 
                    name="logOut"
                    startIcon={<ExitToAppRoundedIcon />}
                    onClick={onLogOut}
                >
                    Log Out
                </LogoutButton >
            </FlexRows>
        </NavBar>
    );
};

export default Navigation;