import { Button, TextField } from "@material-ui/core"
import { useContext, useState } from "react"
import { ApiContext } from "../api";
import { AlertContext } from "../App";


export default function AdminSearch() {
  const [ username, setUsername ] = useState('');
  const api = useContext(ApiContext);
  const alert = useContext(AlertContext);
  const wrapperStyle = {
    width: '100%',
  }
  const searchWrapStyle = {
    display: 'flex',
    justifyContent: 'center',
    padding: '1rem',
  }
  
  const onSearch = async () => {
    if (username.length === 0) {
      alert("Username cannot be empty",'error');
      return;
    }
    const resp = await api.userUid(username);
    if (resp.status === 404) {
      alert(`User ${username} does not exist`,'error');
      return;
    }
    const respJson = await resp.json();
    const uid = respJson.uid;
    
  }
  
  return (
    <div style={wrapperStyle}>
      <div style={searchWrapStyle}>
        <TextField 
          onChange={e => setUsername(e.target.value)}
          value={username}
          label="Username"/>
        <Button 
          onClick={onSearch}
          color="secondary" variant="contained"
        >
          Search
        </Button>
      </div>
    </div>
  )
}