import { Button, TextField } from "@material-ui/core"
import { useContext, useState } from "react"
import { ApiContext } from "../api";
import { AlertContext } from "../App";
import UserEditPage from "./UserEditPage";


export default function AdminSearch() {
  const [ username, setUsername ] = useState('');
  const [ userData, setUserData ] = useState({});
  const [ loadedUid, setLoadedUid ] = useState('');
  const api = useContext(ApiContext);
  const alert = useContext(AlertContext);
  const token = localStorage.getItem('token');
  const wrapperStyle = {
    width: '100%',
    height: 'fill',
  }
  const searchWrapStyle = {
    display: 'flex',
    justifyContent: 'center',
    padding: '1rem',
  }
  
  const headerStyle = {
    fontSize: '2rem',
    padding: '1rem',
    textAlign: 'center',
    fontFamily: 'Arial, Helvetica, sans-serif',
  }
  
  const onSearch = async () => {
    if (username.length === 0) {
      alert("Username cannot be empty");
      return;
    }
    const resp = await api.userUid(username);
    if (resp.status === 404) {
      alert(`User ${username} does not exist`);
      return;
    }
    const respJson = await resp.json();
    const uid = respJson.uid;
    setLoadedUid(uid);
    const profileResp = await api.userProfile(uid, token);
    if (profileResp.status !== 200) {
      alert(`Server responded with ${profileResp.status}`);
      return;
    }
    const profileRespJson = await profileResp.json();
    setUserData(profileRespJson);
  }
  
  const onSaveChanges = async () => {
    const resp = await api.postUserProfile(loadedUid, token, userData);
    if (resp.status !== 200) {
      const respJson = await resp.json();
      alert(respJson.message);
      return;
    }
    // Update data of user
    const profileResp = await api.userProfile(loadedUid, token);
    if (profileResp.status !== 200) {
      alert(`Server responded with ${profileResp.status}`);
      return;
    }
    const profileRespJson = await profileResp.json();
    setUserData(profileRespJson);
    alert("Changes saved successfully");
  }
  
  return (
    <div style={wrapperStyle}>
      <div style={headerStyle}>Edit User Profiles</div>
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
      {
        Object.keys(userData).length === 0 ? null : (
          <UserEditPage 
            userData={userData}
            setUserData={setUserData}
            saveChanges={onSaveChanges}
          /> 
        )
      }
    </div>
  )
}