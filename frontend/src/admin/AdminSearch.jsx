import { Button, Snackbar, TextField } from "@material-ui/core"
import { useContext, useState } from "react"
import { ApiContext } from "../api";
import { AlertContext } from "../App";
import UserEditPage from "./UserEditPage";
import PropTypes from 'prop-types';

export default function AdminSearch() {
  const [ username, setUsername ] = useState('');
  const [ userData, setUserData ] = useState({});
  const [ loadedUid, setLoadedUid ] = useState('');
  const [ showSnackBar, setShowSnackBar ] = useState(false);
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
  
  const onDeleteConfirm = async (value) => {
    if (value === 'yes') {
      const resp = await api.adminUserDelete(token, loadedUid);
      if (resp.status !== 200) {
        const respJson = resp.json();
        alert(respJson.error, 'error');
      } else {
        alert("Deletion successful", "success");
        // Reset user search
        setUserData({});
        setLoadedUid('');
      }
    } else {
      alert("Deletion canceled due to wrong response", "error")
    }
    setShowSnackBar(false);
  }
  
  return (
    <div style={wrapperStyle}>
      <InputSnackBar 
        message="Are you sure you want to delete this account? This is permanent. Type 'yes' to confirm"
        open={showSnackBar}
        onClose={() => setShowSnackBar(false)}
        onSubmit={onDeleteConfirm}
      />
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
            onDelete={() => setShowSnackBar(true)}
          /> 
        )
      }
    </div>
  )
}

function InputSnackBar(props) {
  const [ input, setInput ] = useState('');
  const snackBarStyle = {
    backgroundColor: '#323232',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem',
    borderRadius: '5px',
    color: '#DFDFDF',
    fontFamily: 'Arial, Helvetica, sans-serif',
    
  }
  const msgStyle = {
    marginBottom: '1rem',
  }
  const inputStyle = {
    color: '#DFDFDF',
    backgroundColor: 'inherit',
    padding: '1rem',
    border: '1px solid #444444',
    borderRadius: '5px',
    outline: 'none',
    marginBottom: '1rem',
  }
  return (
    <Snackbar
      open={props.open}
      onClose={props.onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <div style={snackBarStyle}>
          <div
            style={msgStyle}
          >
            {props.message}
          </div>
          <input
            style={inputStyle}
            value={input}
            onChange={e => setInput(e.target.value)}
            variant="outlined"
          />
          <Button
            color="secondary"
            variant="contained"
            style={{ color: '#323232' }}
            onClick={() => props.onSubmit(input)}
          >
            Submit
          </Button>
        </div>
    </Snackbar>
  )
}

InputSnackBar.propTypes = {
  message: PropTypes.string,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
}