import { Button } from "@material-ui/core";
import { useContext, useEffect, useState } from "react"
import { useHistory } from "react-router";
import { ApiContext } from "../api";
import profileImg from '../assets/profile.png';
import { LogoutButton } from "../styles/styling";
import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';

const mockResponse = {
  requests: [
    {
      rid: '341324132',
      ownerUid: '1',
      info: 'I want to be a celebrity I want to be a celebrityI want to be a celebrityI want to be a celebrityI want to be a celebrityI want to be a celebrityI want to be a celebrityI want to be a celebrityI want to be a celebrityI want to be a celebrityI want to be a celebrityI want to be a celebrityI want to be a celebrityI want to be a celebrityI want to be a celebrityI want to be a celebrityI want to be a celebrityI want to be a celebrityI want to be a celebrityI want to be a celebrityI want to be a celebrityI want to be a celebrityI want to be a celebrityI want to be a celebrity',
    },
    {
      rid: '3413241asdf32',
      ownerUid: '2',
      info: 'Im tony sasdfasdfasdtark',
    },
    {
      rid: '341324132asdf',
      ownerUid: '3',
      info: 'Pls give it sdfadsfasdfasdfsadfsadfasfto me',
    },
  ],
  users: {
    '1': {
      username: 'Bob',
      userType: 'user'
    },
    '2': {
      username: 'Dave',
      userType: 'user'
    },
    '3': {
      username: 'Blake',
      userType: 'user'
    }
  }
}

const callApi = async (api, token, setResponse) => {
  const resp = await api.getAdminCelebrityRequests(token);
  const respJson = await resp.json();
  if (resp.status !== 200) {
    alert(respJson.error);
    return
  }
  setResponse(mockResponse);
  // setResponse(respJson.requests);
}

export default function AdminPage() {
  const [ response, setResponse ] = useState({});
  const api = useContext(ApiContext);
  const history = useHistory();
  // Get celebrity requests
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token === null) {
      alert('No token saved. Please log in');
      history.push('/');
    }
    callApi(api, token, setResponse);
  }, [history, api]);
  
  const renderRequests = () => {
    console.log(response);
    const requestWrapStyle = {
      backgroundColor: '#ffffff',
      boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
      padding: '1rem',
      marginBottom: '1rem',
      borderRadius: '5px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '500px',
    }
    const dpStyle = {
      height: '7rem',
      borderRadius: '50%',
    }
    const infoStyle = {
      fontSize: '1.2rem',
      marginBottom: '1rem',
      border: '1px solid grey',
      padding: '5px',
      borderRadius: '5px',
      width: '100%'
    }
    const usernameStyle = {
      fontSize: '2rem'
    }
    if ('requests' in response && 'users' in response) {
      return response.requests.map((r, i) => {
        const userData = response.users[r.ownerUid];
        const token = localStorage.getItem('token');
        const onApprove = async () => {
          const resp = await api.postAdminCelebrityHandlerequest(token, true, r.rid)
          const respJson = await resp.json();
          if (resp !== 200) {
            alert(respJson.error);
            return;
          }
          // Get updated data
          callApi(api, token, setResponse);
        }
        const onReject = async () => {
          const resp = await api.postAdminCelebrityHandlerequest(token, false, r.rid)
          const respJson = await resp.json();
          if (resp !== 200) {
            alert(respJson.error);
            return;
          }
          // Get updated data
          callApi(api, token, setResponse);
        }
        return (
          <div style={requestWrapStyle} key={i}>
            <div style={{ display: 'flex', flexDirection: 'column',
              alignItems: 'center' }}>
              <img style={dpStyle} src={profileImg} alt='logo'/>
              <div style={usernameStyle}>{ userData.username }</div>
            </div>
            <div style={{ display: 'flex', 
              padding: '1rem',
              flexDirection: 'column',
              justifyContent: 'space-evenly' }}>
              <div style={infoStyle}>{ r.info }</div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button style={{ backgroundColor: '#05BE70', marginRight: '1rem' }} onClick={onApprove} color='primary' variant="contained">Approve</Button>
                <Button style={{ backgroundColor: '#F14423', marginLeft: '1rem' }} onClick={onReject} color='primary' variant="contained">Reject</Button>
              </div>
            </div>
          </div>
        )
      })
    }
    return null;
  }
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
  const pageStyle = {
    
  }
  const requestsWrapStyle = {
    margin: '0.5rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  }
  const headerStyle = {
    fontSize: '2rem',
    backgroundColor: '#6D6875',
    padding: '2rem',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }
  const requestsHeaderStyle = {
    textAlign: 'center',
    fontSize: '1.5rem',
    marginTop: '1.5rem',
    marginBottom: '1.5rem',
  }
  return (
    <div style={pageStyle}>
      <div className='font-two' style= {headerStyle}>
        <div>Stock Overflow Admin Panel</div>
        <LogoutButton 
            name="logOut"
            startIcon={<ExitToAppRoundedIcon />}
            onClick={onLogOut}
        >
            Log Out
        </LogoutButton >
      </div>
      <div className='font-two' style={requestsHeaderStyle}>Celebrity Requests</div>
      <div style={requestsWrapStyle}>
        { renderRequests() }
      </div>
    </div>
  )
}