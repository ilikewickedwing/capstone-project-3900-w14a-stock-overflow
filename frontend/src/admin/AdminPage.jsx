import { Button } from "@material-ui/core";
import { useContext, useEffect, useState } from "react"
import { useHistory } from "react-router";
import { ApiContext } from "../api";
import profileImg from '../assets/profile.png';

const mockResponse = {
  requests: [
    {
      ownerUid: '1',
      info: 'I want to be a celebrity',
    },
    {
      ownerUid: '2',
      info: 'Im tony sasdfasdfasdtark',
    },
    {
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
    const callApi = async () => {
      const resp = await api.getAdminCelebrityRequests(token);
      const respJson = await resp.json();
      if (resp.status !== 200) {
        alert(respJson.error);
        return
      }
      // setRequests(respJson.requests);
      setResponse(mockResponse);
    }
    callApi();
  }, [history, api]);
  
  const renderRequests = () => {
    console.log(response);
    const requestWrapStyle = {
      backgroundColor: 'red',
      padding: '1rem',
      marginBottom: '1rem',
      borderRadius: '5px',
      display: 'flex',
      justifyContent: 'center',
    }
    const dpStyle = {
      height: '4rem',
      borderRadius: '50%',
    }
    const infoStyle = {
      fontSize: '1.2rem',
      backgroundColor: 'green'
    }
    if ('requests' in response && 'users' in response) {
      return response.requests.map((r, i) => {
        const userData = response.users[r.ownerUid];
        const onApprove = () => {
          
        }
        const onReject = () => {
        
        }
        return (
          <div style={requestWrapStyle} key={i}>
            <div style={{ display: 'flex', flexDirection: 'column',
              backgroundColor: 'pink', alignItems: 'center' }}>
              <img style={dpStyle} src={profileImg} alt='logo'/>
              <div >{ userData.username }</div>
            </div>
            <div style={{ display: 'flex', 
              padding: '1rem',
              flexDirection: 'column', backgroundColor: 'yellow',
              justifyContent: 'space-evenly' }}>
              <div style={infoStyle}>{ r.info }</div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button onClick={onApprove} color='primary' variant="contained">Approve</Button>
                <Button onClick={onReject} color='primary' variant="contained">Reject</Button>
              </div>
            </div>
          </div>
        )
      })
    }
    return null;
  }
  
  const pageStyle = {
    
  }
  const requestsWrapStyle = {
    margin: '0.5rem',
    backgroundColor: 'pink',
  }
  return (
    <div style={pageStyle}>
      <div style={requestsWrapStyle}>
        { renderRequests() }
      </div>
    </div>
  )
}