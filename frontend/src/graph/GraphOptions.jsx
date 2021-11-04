import PropTypes from "prop-types";
import { InputLabel, MenuItem, Select } from "@material-ui/core";

export default function GraphOptions (props) {
  const optionsItemStyle = { 
    minWidth: "10%",
    padding: "0.1rem",
    paddingTop: "0.9rem",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "center",
  }
  const headerElemStyle = {
    marginLeft: "0.5rem",
    marginRight: "0.5rem",
  }
  const renderStyleOptions = () => {
    if (!props.isMulti) {
      return (
        <div style={headerElemStyle}>
          <InputLabel>Graph Style</InputLabel>
          <Select
            style = {{ marginBottom: '10px' }}
            value={props.graphStyle}
            onChange={e => props.setGraphStyle(e.target.value)}
          >
            <MenuItem value={"line"}>Line</MenuItem>
            <MenuItem value={"candlestick"}>CandleStick</MenuItem>
            <MenuItem value={"ohlc"}>OHLC</MenuItem>
          </Select>
        </div>
      )          
    }
    return null;
  }
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "flex-end", marginBottom: '1rem' }}>
      <div style={optionsItemStyle}>
        <div style={headerElemStyle}>
          <InputLabel>Interval</InputLabel>
          <Select
            style = {{ marginBottom: '10px' }}
            value={props.timeOptions}
            onChange={e => props.setTimeOptions(e.target.value)}
          >
            <MenuItem value={"1min"}>1 min</MenuItem>
            <MenuItem value={"5min"}>5 min</MenuItem>
            <MenuItem value={"15min"}>15 min</MenuItem>
            <MenuItem value={"daily"}>Daily</MenuItem>
            <MenuItem value={"weekly"}>Weekly</MenuItem>
            <MenuItem value={"monthly"}>Monthly</MenuItem>
          
          </Select>
        </div>
        { renderStyleOptions() }
      </div>
    </div>
  )
}

GraphOptions.propTypes = {
  isMulti: PropTypes.bool,
  timeOptions: PropTypes.string,
  setTimeOptions: PropTypes.func,
  graphStyle: PropTypes.string,
  setGraphStyle: PropTypes.func,
}