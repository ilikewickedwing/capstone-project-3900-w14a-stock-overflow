import { Button, Tab, Tabs } from "@material-ui/core";
import { useContext, useEffect, useState } from "react"
import { useHistory } from "react-router";
import { ApiContext } from "../api";
import profileImg from '../assets/dp.jpg';
import { LogoutButton } from "../styles/styling";
import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import FileDownload from "../files/FileDownload";
import { AlertContext } from "../App";
import AdminSearch from "./AdminSearch";
import PropTypes from 'prop-types';

const callApi = async (api, token, setResponse, alert) => {
  const resp = await api.getAdminCelebrityRequests(token);
  const respJson = await resp.json();
  if (resp.status !== 200) {
    console.log(respJson.error);
    return
  }
  setResponse(respJson);
}

export default function AdminPage() {
  const [ response, setResponse ] = useState({});
  const [ tabValue, setTabValue ] = useState(0);
  const api = useContext(ApiContext);
  const alert = useContext(AlertContext);
  const history = useHistory();
  // Get celebrity requests
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token === null) {
      alert('No token saved. Please log in','error');
      history.push('/');
    }
    callApi(api, token, setResponse, alert);
  }, [history, api]);
  
  const renderRequests = () => {
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
      width: '75%',
    }
    const dpStyle = {
      height: '7rem',
      borderRadius: '50%',
    }
    const infoStyle = {
      boxSizing: 'border-box',
      fontSize: '1.2rem',
      marginBottom: '1rem',
      border: '1px solid #dddddd',
      padding: '5px',
      borderRadius: '2px',
      width: '100%',
      wordWrap: 'break-word',
    }
    const usernameStyle = {
      fontSize: '2rem'
    }
    if ('requests' in response && 'users' in response) {
      if (response.requests.length === 0) {
        const noRequestsStyle = { 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          height: '100%',
        }
        return (
          <div style={noRequestsStyle}>
            There are currently no celebrity requests
          </div>
        )
      }
      return response.requests.map((r, i) => {
        const userData = response.users[r.ownerUid];
        const token = localStorage.getItem('token');
        
        const onApprove = async () => {
          const resp = await api.postAdminCelebrityHandlerequest(token, true, r.rid)
          if (resp.status !== 200) {
            alert(`Server responded with ${resp.status}`,'error');
            return;
          }
          // Get updated data
          callApi(api, token, setResponse, alert);
        }
        
        const onReject = async () => {
          const resp = await api.postAdminCelebrityHandlerequest(token, false, r.rid)
          if (resp.status !== 200) {
            alert(`Server responded with ${resp.status}`,'error');
            return;
          }
          // Get updated data
          callApi(api, token, setResponse, alert);
        }
        
        return (
          <div  className="font-two" style={requestWrapStyle} key={i}>
            <img style={dpStyle} src={profileImg} alt='logo'/>
            <div style={usernameStyle}>{ userData.username }</div>
            <div style={infoStyle}>{ r.info }</div>
            <FileDownload fids={r.fids} fileMap={response.files}/>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
              <Button style={{ backgroundColor: '#05BE70', marginRight: '1rem' }} onClick={onApprove} color='primary' variant="contained">Approve</Button>
              <Button style={{ backgroundColor: '#F14423', marginLeft: '1rem' }} onClick={onReject} color='primary' variant="contained">Reject</Button>
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
    if (resp.status === 403) alert('Invalid token','error');
    if (resp.status === 200) {
        alert('Token has been invalidated','success');
        history.push('/');
    } else {
        alert(`Server returned unexpected status code of ${resp.status}`,'error');
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
      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
        <Tab label="Celebrity Requests"/>
        <Tab label="User Search"/>
      </Tabs>
      <TabPanel value={tabValue} index={0}>
        <div style={{ width: '100%' }} >
          <div className='font-two' style={requestsHeaderStyle}>Celebrity Requests</div>
          <div style={requestsWrapStyle}>
            { renderRequests() }
          </div>
        </div>
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <AdminSearch/>
      </TabPanel>
    </div>
  )
}

function TabPanel (props) {
  return (
    <div hidden={props.index !== props.value}>
      { props.children }
    </div>
  )
}

TabPanel.propTypes = {
  value: PropTypes.number,
  index: PropTypes.number,
  children: PropTypes.any,
}