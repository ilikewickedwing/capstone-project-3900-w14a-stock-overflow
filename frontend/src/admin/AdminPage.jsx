import { Accordion, AccordionDetails, AccordionSummary, Button, IconButton } from "@material-ui/core";
import { useContext, useEffect, useState } from "react"
import { useHistory } from "react-router";
import { ApiContext } from "../api";
import profileImg from '../assets/profile.png';
import { LogoutButton } from "../styles/styling";
import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const callApi = async (api, token, setResponse) => {
  const resp = await api.getAdminCelebrityRequests(token);
  const respJson = await resp.json();
  if (resp.status !== 200) {
    alert(respJson.error);
    return
  }
  setResponse(respJson);
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
        
        // Render a list of the files included in the request
        const renderFiles = () => {
          const fileItemStyle = {
            borderTop: '1px solid grey',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }
          return r.fids.map((fid, i) => {
            const download = async () => {
              console.log("Clciked");
              const resp = await api.fileDownload(token, fid)
              if (resp.status === 200) {
                console.log("Called");
                const respJson = await resp.json();
                console.log(respJson.data);
                const link = document.createElement('a');
                // Download the file
                document.body.appendChild(link);
                link.setAttribute('href', `base64,${respJson.data}`);
                link.setAttribute('download', respJson.filename);
                link.click();
                document.body.removeChild(link);
                
              } else {
                alert(`Server returned with status of ${resp.status}`)
              }
            }
            return (
              <div key={i} style={fileItemStyle}>
                <div>{response.files[fid]}</div>
                <IconButton onClick={download} color="primary">
                  <DownloadIcon/>
                </IconButton>
              </div>
            )
          })
        }
        
        const onApprove = async () => {
          const resp = await api.postAdminCelebrityHandlerequest(token, true, r.rid)
          if (resp.status !== 200) {
            alert(`Server responded with ${resp.status}`);
            return;
          }
          // Get updated data
          callApi(api, token, setResponse);
        }
        
        const onReject = async () => {
          const resp = await api.postAdminCelebrityHandlerequest(token, false, r.rid)
          if (resp.status !== 200) {
            alert(`Server responded with ${resp.status}`);
            return;
          }
          // Get updated data
          callApi(api, token, setResponse);
        }
        
        const accordionStyle = {
          width: '100%',
          marginBottom: '1rem',
        }
        
        const fileItemsWrapperStyle = {
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }
        
        return (
          <div style={requestWrapStyle} key={i}>
            <img style={dpStyle} src={profileImg} alt='logo'/>
            <div style={usernameStyle}>{ userData.username }</div>
            <div style={infoStyle}>{ r.info }</div>
            <Accordion style={ accordionStyle }>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                { `${r.fids.length} included files` }
              </AccordionSummary>
              <AccordionDetails>
                <div style={fileItemsWrapperStyle}>{ renderFiles() }</div>
              </AccordionDetails>
            </Accordion>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
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