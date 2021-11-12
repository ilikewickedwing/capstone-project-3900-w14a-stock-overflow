import { Accordion, AccordionDetails, AccordionSummary, Button, IconButton } from "@material-ui/core";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useContext } from "react";
import { ApiContext } from "../api";
import PropTypes from 'prop-types';
import DownloadIcon from '@mui/icons-material/Download';
import { AlertContext } from "../App";
export default function FileDownload(props) {
  const alert = useContext(AlertContext);
  const api = useContext(ApiContext);
  const download = async (fid) => {
    const token = localStorage.getItem('token');
    const resp = await api.fileDownload(token, fid)
    if (resp.status === 200) {
      /**
      
      TO DO: Implement the downloading from base64 string!!!
      It currently doesnt work!!
      
      */
      const respJson = await resp.json();
      const link = document.createElement('a');
      // Download the file
      document.body.appendChild(link);
      link.setAttribute('href', `data:${respJson.mimetype};base64,${respJson.data}`);
      link.setAttribute('download', respJson.filename);
      link.click();
      document.body.removeChild(link);
      
    } else {
      alert(`Server returned with status of ${resp.status}`,'error')
    }
  }
  
  const downloadAll = async () => {
    for (const fid of props.fids) {
      await download(fid);
    }
  }
  
  // Render a list of the files included in the request
  const renderFiles = () => {
    const fileItemStyle = {
      borderTop: '1px solid grey',
      paddingTop: '0.5rem',
      paddingBottom: '0.5rem',
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }
    return props.fids.map((fid, i) => {
      return (
        <div key={i} style={fileItemStyle}>
          <div>{props.fileMap[fid]}</div>
          <IconButton onClick={() => download(fid)} color="primary">
            <DownloadIcon/>
          </IconButton>
        </div>
      )
    })
  }
  
  const accordionStyle = {
    width: '100%',
    marginBottom: '1rem',
    position: 'absolute',
    backgroundColor: '#ffffff',
    zIndex: '100',
  }
  
  const fileItemsWrapperStyle = {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    maxHeight: '100px',
  }
  
  const wrapStyle = {
    position: 'relative',
    width: '100%',
    paddingBottom: '3rem',
  }
  
  return (
    <div style={wrapStyle}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={downloadAll} color="primary">Download All</Button>
      </div>
      <Accordion style={ accordionStyle }>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <div>{ `${props.fids.length} included files` }</div>
        </AccordionSummary>
        <AccordionDetails>
          <div style={fileItemsWrapperStyle}>{ renderFiles() }</div>
        </AccordionDetails>
      </Accordion>
    </div>
  )
}

FileDownload.propTypes = {
  fids: PropTypes.array,
  fileMap: PropTypes.object,
}