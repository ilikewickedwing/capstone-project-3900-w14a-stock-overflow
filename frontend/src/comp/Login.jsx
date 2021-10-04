import { Grid,Paper, Avatar, TextField, Button, Typography,Link } from '@material-ui/core'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { useContext, useState } from 'react';
import { ApiContext } from '../api';

function Login() {
    const api = useContext(ApiContext);
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');
    const onLogIn = async () => {
        const resp = await api.authLogin(username, password);
        if (resp.status === 403) {
            alert('Invalid username and password combination')
        } else if (resp.status === 200) {
            const jsondata = await resp.json();
            alert('Log in successful')
            console.log(jsondata);
        } else {
            alert(`Server returned unexpected status code of ${resp.status}`);
        }
    }
    const paperStyle={padding :20,height:'70vh',width:280, margin:"20px auto"}
    const avatarStyle={backgroundColor:'#1bbd7e'}
    const btnstyle={margin:'8px 0'}
    return(
        <Grid>
            <Paper elevation={10} style={paperStyle}>
                <Grid align='center'>
                     <Avatar style={avatarStyle}><LockOutlinedIcon/></Avatar>
                    <h2>Log In</h2>
                </Grid>
                <TextField 
                    value = {username} onChange={e => setUsername(e.target.value)}
                    label='Username' placeholder='Enter username' fullWidth required/>
                <TextField
                    value = {password} onChange={e => setPassword(e.target.value)}
                    label='Password' placeholder='Enter password' type='password' fullWidth required/>
             
                <Button 
                    onClick = {onLogIn}
                    type='submit' color='primary' variant="contained" style={btnstyle} fullWidth>Log in</Button>
                <Typography >
                     <Link href="#" >
                        Forgot password ?
                </Link>
                </Typography>
                <Typography >
                     <Link href="#" >
                        Sign Up 
                </Link>
                </Typography>
            </Paper>
        </Grid>
    )
}

export default Login