import { Grid,Paper, Avatar, TextField, Button, Typography,Link } from '@material-ui/core'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { Welcome } from '../styles/styling';
import axios from 'axios';
import { apiBaseUrl } from '../comp/const';
import { ApiContext } from '../api';
import { AlertContext } from '../App';

function Login() {
    const alert = useContext(AlertContext);
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');
    const api = useContext(ApiContext);
    let history = useHistory();
    const onLogIn = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${apiBaseUrl}/auth/login`, 
                {username, password});
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('uid', res.data.uid); 
            console.log("token =" + localStorage.getItem('token'));
            directToPage(api, res.data.uid, res.data.token, history);
        } catch (e) {
            alert(`Status Code ${e.response.status} : ${e.response.data.message}`,'error');
        }
    }
    const paperStyle={padding :'3%', width:'50%', margin:"20px auto"}
    const avatarStyle={backgroundColor:'#1bbd7e'}
    const btnstyle={margin:'3% 0'}
    const gridStyle = {
        height: '100vh',
        placeItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor:'#6d6875',
    }
    return(
        <Grid style={gridStyle} className="font-two">
            <Welcome> Welcome to Stock Overflow </Welcome>
            <Paper elevation={10} style={paperStyle}>
                <Grid align='center'>
                     <Avatar style={avatarStyle}><LockOutlinedIcon/></Avatar>
                    <h2>Log In</h2>
                </Grid>
                <form>
                <TextField 
                    value = {username} onChange={e => setUsername(e.target.value)}
                    label='Username' placeholder='Enter username' fullWidth required/>
                <br />
                <TextField
                    style={{margin: "1em 0"}}
                    value = {password} onChange={e => setPassword(e.target.value)}
                    label='Password' placeholder='Enter password' type='password' fullWidth required/>
                <br />
                <Button 
                    onClick = {onLogIn}
                    type='submit' color='primary' variant="contained" style={btnstyle} fullWidth>Log in</Button>
                </form>
                <Typography >
                    Don't have an account? &nbsp;
                    <Link style={{ cursor: 'pointer' }} onClick={() => {history.push('/signup')}}>
                    Sign Up Here
                    </Link>
                </Typography>
            </Paper>
        </Grid>
    )
}

export default Login

// Direct to dashboard if it is a user, else to admin page if an admin
const directToPage = async (api, uid, token, history) => {
    // Get user type to see whether to go to dashboard or admin page
    const userResp = await api.userProfile(uid, token);
    const userRespData = await userResp.json();
    if (userRespData.userType === 'admin') {
        history.push('/admin');
    } else {
        history.push('/dashboard');
    }
}