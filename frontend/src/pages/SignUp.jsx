import { Grid,Paper, Avatar, TextField, Button } from '@material-ui/core'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { useContext, useState } from 'react';
import { ApiContext } from '../api';
import { useHistory, Link } from 'react-router-dom';
import { Welcome } from '../styles/styling';

function SignUp() {
    const api = useContext(ApiContext);
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ email, setEmail ] = useState('');

    let history = useHistory();
    const onLogIn = async () => {
        const resp = await api.authRegister(username, password);
        if (resp.status === 403) {
            alert('username already exists')
            history.push('/');
        } else if (resp.status === 200) {
            const jsondata = await resp.json();
            alert('Signup successfull')
            console.log(jsondata);
            history.push('/');
        } else {
            alert(`Server returned unexpected status code of ${resp.status}`);
        }
    }
    const paperStyle={padding :'3%', width:'50%', margin:"20px auto"}
    const avatarStyle={backgroundColor:'#1bbd7e'}
    const btnstyle={margin:'8px 0'}
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
                <Link to="/">
                    <Button style={{}}
                    aria-label="back to login page" variant="contained">Back to login</Button>
                </Link>
                <Grid align='center'>
                     <Avatar style={avatarStyle}><LockOutlinedIcon/></Avatar>
                    <h2>Sign Up</h2>
                </Grid>
                <TextField 
                    value = {username} onChange={e => setUsername(e.target.value)}
                    label='Username' placeholder='Enter username' fullWidth required/>
                  <TextField 
                   style={{marginTop: "1em"}}
                    value = {email} onChange={e => setEmail(e.target.value)}
                    label='Email' placeholder='Enter Email' fullWidth required/>
                <TextField
                    style={{margin: "1em 0"}}
                    value = {password} onChange={e => setPassword(e.target.value)}
                    label='Password' placeholder='Enter password' type='password' fullWidth required/>
                <Button 
                    onClick = {onLogIn}
                    type='submit' color='primary' variant="contained" style={btnstyle} fullWidth>
                    Sign Up
                </Button>
            </Paper>
        </Grid>
    )
}

export default SignUp