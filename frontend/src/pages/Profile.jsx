import React from 'react'; 
import { useHistory } from 'react-router';
import { ApiContext } from '../api';
import { useContext, useState } from 'react';
import { NavBar } from '../styles/styling';
import { Link } from 'react-router-dom';
import { Logo } from '../styles/styling';
import { apiBaseUrl } from '../comp/const';
import axios from 'axios';

import { Grid,Paper, Avatar, TextField, Button, Container } from '@material-ui/core'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';


export default function Profile() {
  const api = useContext(ApiContext);
  const history = useHistory();
  const token = localStorage.getItem('token');
  const uid = localStorage.getItem('uid');

  const paperStyle={padding :20,height:'70vh',width:280, margin:"20px auto"}
  const avatarStyle={backgroundColor:'#1bbd7e'}
  const btnstyle={margin:'8px 0'}

  const [ username, setUsername ] = useState('');

  // handle delete user
  const onDeleteUser = async () => {
    console.log(token);
    // const resp = await api.authDelete(token);
    // if (resp.status === 403) alert('Invalid token');
    // if (resp.status === 200) {
    //     alert('Account has been delted');
    //     history.push('/');
    // } else {
    //     alert(`Server returned unexpected status code of ${resp.status}`);
    // }
    try {
      const resp = await axios.delete(`${apiBaseUrl}/auth/delete`, {data: {token}});
      alert('Account has been deleted');
      history.push('/');
    } catch (e){
      alert(`Status Code ${e.response.status} : ${e.response.data.message}`);
    }
  }

  // handle edit submit 
  const onEditUser = async() => {
    // const resp = await api.post('user/profile', {
    //   body: JSON.stringify({
    //     uid: uid,
    //     token: token,
    //     userData: {
    //       "username": username,
    //     }
    //   })
    // })

    // if (resp.status === 403) {
    //   alert('invalid data given')
    //   history.push('/');
    // } else if (resp.status === 200) {
    //     alert('username changed')
    //     history.push('/');
    // } else {
    //     alert(`Server returned unexpected status code of ${resp.status}`);
    // }
    try {
      const resp = await axios.post(`${apiBaseUrl}/user/profile`, {uid, token, userData: {username}})
      alert('username changed');
      history.push('/');
    } catch (e){
      alert(`Status Code ${e.response.status} : ${e.response.data.message}`);
    }
  }

  return(
    <div className="font-two">
      <NavBar>
        <Link to="/dashboard">
            <Logo>
                Stock Overflow 
            </Logo>
        </Link>
        <Link to="/dashboard">
            <Button>
                Go back
            </Button>
        </Link>
      </NavBar>

      <Container>
      <Grid>
        <Paper elevation={10} style={paperStyle}>
            <Grid align='center'>
                  <Avatar style={avatarStyle}><LockOutlinedIcon/></Avatar>
                <h2>Change account details</h2>
            </Grid>
            <TextField 
                value = {username} onChange={e => setUsername(e.target.value)}
                label='New username' placeholder='Enter new username' fullWidth required/>
            {/* <TextField
                value = {password} onChange={e => setPassword(e.target.value)}
                label='New Password' placeholder='Enter new password' type='password' fullWidth required/> */}
          
            <Button 
                onClick={onEditUser}
                type='submit' color='primary' variant="contained" style={btnstyle} fullWidth>Save</Button>
        </Paper>
      </Grid>
      
      
      <Button variant="contained" color="secondary" onClick={onDeleteUser}>
        Delete account
      </Button>
      </Container>
      
    </div>
   
  )
}