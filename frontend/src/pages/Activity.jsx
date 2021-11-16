import Paper from '@material-ui/core/Paper';

const Activity = (props) => {
  return (
  <Paper elevation={1} style={{display: 'flex', marginBottom: 10, marginTop:10, padding: 10}}>
    <div>{props.time}</div>:
    <div style={{marginLeft: 30}}>{props.message}</div>
  </Paper>
  )
}

export default Activity;