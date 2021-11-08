import { Button } from "@material-ui/core";
import { useContext, useEffect, useState } from "react"
import { useHistory } from "react-router";
import { ApiContext } from "../api";

const mockRequests = [
  {
    ownerUid: '1',
    info: 'I want to be a celebrity',
  },
  {
    ownerUid: '2',
    info: 'Im tony stark',
  },
  {
    ownerUid: '3',
    info: 'Pls give it to me',
  },
]

export default function AdminPage() {
  const [ requests, setRequests ] = useState([]);
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
      setRequests(mockRequests);
    }
    callApi();
  }, [history, api]);
  
  const renderRequests = () => {
    console.log(requests);
    const requestWrapStyle = {
      backgroundColor: 'red',
      padding: '1rem',
      marginBottom: '1rem',
      borderRadius: '5px',
      display: 'flex',
      justifyContent: 'space-between',
    }
    const dpStyle = {
      backgroundColor: 'blue'
    }
    const infoStyle = {
      fontSize: '1.2rem',
      backgroundColor: 'green'
    }
    return requests.map((r, i) => (
      <div style={requestWrapStyle} key={i}>
        <div style={dpStyle}></div>
        <div style={infoStyle}>{ r.info }</div>
        <Button color='primary' variant="contained">Respond</Button>
      </div>
    ))
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