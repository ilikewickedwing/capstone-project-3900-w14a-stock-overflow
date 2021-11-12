import { TextField, Select, MenuItem, Button, InputLabel } from "@material-ui/core";
import PropTypes from 'prop-types';

export default function UserEditPage(props) {
  
  const setUsername = username => {
    const userDataCopy = Object.assign({}, props.userData);
    userDataCopy.username = username;
    props.setUserData(userDataCopy);
  }
  
  const setUserType = userType => {
    const userDataCopy = Object.assign({}, props.userData);
    userDataCopy.userType = userType;
    props.setUserData(userDataCopy);
  }
  
  const pageStyle = {
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
    borderRadius: '5px',
    margin: '1rem',
    boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
  }
  
  const compWrapper = {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
  }
  
  return (
    <div style={pageStyle}>
      <div style={compWrapper}>
        <InputLabel>Username</InputLabel>
        <TextField
          value={props.userData.username}
          onChange={e => setUsername(e.target.value)}
        />
      </div>
      <div style={compWrapper}>
        <InputLabel>User type</InputLabel>
        <Select
          value={props.userData.userType}
          onChange={e => setUserType(e.target.value)}
        >
          <MenuItem value="user">User</MenuItem>
          <MenuItem value="celebrity">Celebrity</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </Select>
      </div>
      <div style={compWrapper}>
        <Button 
          color="secondary"
          variant="contained"
          onClick={() => props.saveChanges()}
        >
          Save Changes
        </Button>
      </div>
    </div>
  )
}

UserEditPage.propTypes = {
  userData: PropTypes.object,
  setUserData: PropTypes.func,
  saveChanges: PropTypes.func,
}