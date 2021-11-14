import React, { useContext } from 'react'; 
import { useHistory } from 'react-router';
import { useState } from 'react';
import axios from 'axios';

import { apiBaseUrl } from '../comp/const';
import Navigation from '../comp/Navigation';
import FriendRequestCard from '../comp/FriendRequestCard';
import FriendListCard from '../comp/FriendListCard';

import { Grid,Paper, TextField, Button} from '@material-ui/core'
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Modal from '@mui/material/Modal';
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { PageBody } from '../styles/styling';
import { AlertContext } from '../App';

// styling 
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const mockInvs = [
  {
    handle: 'friend 1',
  },
  {
    handle: 'friend 2',
  },
  {
    handle: 'friend 3',
  },
  {
    handle: 'friend 4',
  },
]
const mockFriends = [
  {
    handle: 'friend a',
  },
  {
    handle: 'friend b',
  },
  {
    handle: 'friend c',
  },
  {
    handle: 'friend d',
  },
]


const paperStyle={padding :20,width:280, margin:'3em'}
const avatarStyle={backgroundColor:'#1bbd7e'}
const btnstyle={margin:'8px 0'}

export default function Profile() {
  const alert = useContext(AlertContext);
  const history = useHistory();
  const token = localStorage.getItem('token');
  const uid = localStorage.getItem('uid');

  const [ username, setUsername ] = useState('');
  
  // states from get request of current default broker fee
  const [currDef, setDef] = useState('');
  const [flag, setFlag] = useState(0); 
  
  // select options : flat fee - 0; percentage- 1 ; default flat fee
  const [option, setOption] = React.useState(0);
  const [fee, setFee] = useState('');

  const [reqList, setReqlist] = useState(mockInvs);
  const [friendList, setFriendList] = useState(mockFriends);

  // modal states 
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // on first load grab the default brokerage cost
  React.useEffect(() => {   
    getDefaultBrokerage();
    getFriendRequests();
    getFriendList();
  },[]);
      
  const handleChange = (e) => {
    setOption(e.target.value);
  }

  // confirm delete modal
  const confirmDelete = () => {
    handleOpen();
  }
  // handle delete user
  const onDeleteUser = async () => {
    console.log(token);
    try {
      const resp = await axios.delete(`${apiBaseUrl}/auth/delete`, {data: {token}});
      alert('Account has been deleted','success');
      history.push('/');
    } catch (e){
      alert(`Status Code ${e.response.status} : ${e.response.data.message}`,'error');
    }
  }

  // handle edit submit 
  const onEditUser = async() => {
    try {
      const resp = await axios.post(`${apiBaseUrl}/user/profile`, {uid, token, userData: {username}})
      alert('username changed','success');
      history.push('/');
    } catch (e){
      alert(`Status Code ${e.response.status} : ${e.response.data.message}`,'error');
    }
  }

  // handle default brokerage fee 
  const submitBrokerage = async ()=> {
    try {
      await axios.post(`${apiBaseUrl}/user/setDefBroker`, {token, defBroker: fee, brokerFlag: option}); 
      if (option){
        alert(`New fee has been set to ${fee} %`,'success'); 
      } else {
        alert(`New fee has been set to $${fee}`,'success'); 
      }
      getDefaultBrokerage();
    } catch (e) {
      alert(`Status Code ${e.response.status} : ${e.response.data.message}`,'error');
    }
  }

  // grab the current default
  const getDefaultBrokerage = async ()=> {
    try {
      const res = await axios.get(`${apiBaseUrl}/user/getDefBroker?token=${token}`);
      setDef(res.data.defBroker.defBroker); 
      setFlag(res.data.defBroker.brokerFlag);
      
    } catch (e) {
      alert(`Status Code ${e.status} : ${e.response.data.message}`,'error');
    }
  }

  const getFriendRequests = async () => {
    try {
      const res = await axios.get(`${apiBaseUrl}/friends/requests?token=${token}`);
      setReqlist(res.data.friendReq);
      
    } catch (e) {
      alert(`Status Code ${e.status} : ${e.response.data.message}`,'error');
    }
  }

  const getFriendList = async () => {
    try {
    } catch (e) {
      alert(`Status Code ${e.status} : ${e.response.data.message}`,'error');
    }
  }

  return(
    <PageBody className="font-two">
      <Navigation />
      <Grid container direction="row" justifyContent="center">
        <Grid>
          <Grid>
          <Paper elevation={10} style={paperStyle}>
              <h2 style={{textAlign:'center'}}>Change account details</h2>
              <h3>Change Username</h3>
              <TextField style = {{marginBottom:'5%'}}
                  value = {username} onChange={e => setUsername(e.target.value)}
                  label='New username' placeholder='Enter new username' fullWidth/>
              {/* <TextField
                  value = {password} onChange={e => setPassword(e.target.value)}
                  label='New Password' placeholder='Enter new password' type='password' fullWidth required/> */}
              <Button
                  onClick={onEditUser}
                  type='submit' color='primary' variant="contained" style={btnstyle} fullWidth>Save</Button>
              <h3>Delete Account</h3>
              <Button variant="contained" color="secondary" fullWidth onClick={confirmDelete}>
                Delete account
              </Button>
          </Paper>
          </Grid>
          <Grid>
            <Paper elevation={10} style={paperStyle}>
                  <h2 style={{textAlign:'center'}}>Set default brokerage fee</h2>
                  <span style={{fontWeight:'bold'}}>
                    Current Default Brokerage
                  </span>
                  {flag ? (
                    <div>{currDef}%</div>
                  ):(
                    <div>${currDef}</div>
                  ) }
                  <h3>Set fee</h3>
                    <Select
                      style={{width: '100%'}}
                      value={option}
                      onChange={handleChange}
                      label="Select Option"
                      displayEmpty
                    >
                      <MenuItem style={{width:"100%"}} value={1}>Percentage (_%) </MenuItem>
                      <MenuItem style={{width:"100%"}} value={0}>Flat Fee ($USD)</MenuItem>
                    </Select>
                    <TextField style = {{marginBottom:'5%'}}
                    value = {fee} onChange={e => setFee(e.target.value)}
                    label='Enter Fee' placeholder='Enter Flat Fee ' fullWidth/>
                      <Button
                      onClick={submitBrokerage}
                      type='submit' color='primary' variant="contained" style={btnstyle} fullWidth>Save</Button>
            </Paper>
          </Grid>
        </Grid>
        <Grid>
          <Grid>
          <Paper elevation={10} style={paperStyle}>
              <h2 style={{textAlign:'center'}}>Friend Requests</h2>
              {reqList.length !== 0 ?
              (
                <div>
                  { reqList &&
                    reqList.map((a) => 
                      <FriendRequestCard
                        key={a}
                        name={a}
                        reload={getFriendRequests}
                      />
                    )
                  }
                </div>
              ) :
              (
                <span>No pending friend requests</span>
              )}
          </Paper>
          </Grid>
          <Grid>
            <Paper elevation={10} style={paperStyle}>
                <h2 style={{textAlign:'center'}}>Friends List</h2>
                {friendList.length !== 0 ?
                (
                  <div>
                    { friendList &&
                      friendList.map((a) => 
                        <FriendListCard
                          key={a.handle}
                          name={a.handle}
                        />
                      )
                    }
                  </div>
                ) :
                (
                  <span>No pending friend requests</span>
                )}
            </Paper>
          </Grid>
        </Grid>
      </Grid>
      <Modal
          open={open}
          onClose={handleClose}
      >
          <Box sx={style}>
              <Typography variant="h6" component="h2">
                  Are you sure you want to delete account?
              </Typography>
              <Typography sx={{ mt: 2 }}>
                <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
                    <Button onClick={handleClose}> Cancel
                    </Button>
                    <Button onClick={onDeleteUser} color='secondary' variant="contained">
                      Confirm
                    </Button>
                </div>
              </Typography>
          </Box>
      </Modal>
    </PageBody>
   
  )
}