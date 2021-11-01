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
            <MenuItem value={"30min"}>30 min</MenuItem>
            <MenuItem value={"60min"}>1 hour</MenuItem>
            <MenuItem value={"1day"}>1 day</MenuItem>
            <MenuItem value={"1week"}>1 week</MenuItem>
            <MenuItem value={"1month"}>1 month</MenuItem>
          </Select>
        </div>
        <div style={headerElemStyle}>
          <InputLabel>Graph</InputLabel>
          <Select
            style = {{ marginBottom: '10px' }}
            value={props.graphStyle}
            onChange={e => props.setGraphStyle(e.target.value)}
          >
            <MenuItem value={"candlestick"}>CandleStick</MenuItem>
            <MenuItem value={"ohlc"}>OHLC</MenuItem>
          </Select>
        </div>
      </div>
    </div>
  )
}

GraphOptions.propTypes = {
  timeOptions: PropTypes.string,
  setTimeOptions: PropTypes.func,
  graphStyle: PropTypes.string,
  setGraphStyle: PropTypes.func,
}