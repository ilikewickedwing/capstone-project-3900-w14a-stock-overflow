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
    <div  className="font-two" style={pageStyle}>
      <div style={compWrapper}>
        <InputLabel>Username</InputLabel>
        <TextField
          variant="outlined"
          value={props.userData.username}
          onChange={e => setUsername(e.target.value)}
        />
      </div>
      <div style={compWrapper}>
        <InputLabel>User type</InputLabel>
        <Select
          variant="outlined"
          value={props.userData.userType}
          onChange={e => setUserType(e.target.value)}
        >
          <MenuItem value="user">User</MenuItem>
          <MenuItem value="celebrity">Celebrity</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </Select>
      </div>
      <div style={compWrapper}>
        <InputLabel>New password</InputLabel>
        <TextField
          type="password"
          variant="outlined"
          value={props.newPassword}
          onChange={e => props.setNewPassword(e.target.value)}
        />
      </div>
      <div style={compWrapper}>
        <Button 
          style={{ backgroundColor: '#58BF71' }}
          color="secondary"
          variant="contained"
          onClick={() => props.saveChanges()}
        >
          Save Changes
        </Button>
      </div>
      <div style={compWrapper}>
        <Button 
          color="secondary"
          variant="contained"
          onClick={() => props.onDelete()}
        >
          Delete Account
        </Button>
      </div>
    </div>
  )
}

UserEditPage.propTypes = {
  userData: PropTypes.object,
  setUserData: PropTypes.func,
  newPassword: PropTypes.string,
  setNewPassword: PropTypes.func,
  saveChanges: PropTypes.func,
  onDelete: PropTypes.func,
}