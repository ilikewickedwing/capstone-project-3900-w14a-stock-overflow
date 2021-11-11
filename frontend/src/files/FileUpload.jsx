import { useContext } from "react"
import { ApiContext } from "../api"
import PropTypes from "prop-types";

export default function FileUpload(props) {
  const api = useContext(ApiContext);
  const token = localStorage.getItem('token');
  const onInputChange = async (e) => {
    const files = e.target.files;
    // Stores all the file ids of the uploaded files
    const fids = [];
    const fileMap = {};
    for (let i = 0; i < files.length; i++) {
      const resp = await api.fileUpload(token, files[i]);
      if (resp.status !== 200) {
        alert(`Server returned with ${resp.status}`);
        continue;
      }
      const respJson = await resp.json()
      fids.push(respJson.fid);
      fileMap[respJson.fid] = files[i].name;
    }
    props.setFids(fids);
    props.setFileMap(fileMap);
  }
  const wrapperStyle = {
  
  }
  return (
    <div style={wrapperStyle}>
      <input onChange={onInputChange}
        type="file" id="input" multiple/>
    </div>
  )
}

FileUpload.propTypes = {
  // Function called to return the fids of the files once uploaded
  setFids: PropTypes.func,
  setFileMap: PropTypes.func,
}