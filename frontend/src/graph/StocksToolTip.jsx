import PropTypes from "prop-types";

export default function StocksToolTip (props) {
  if (props.active && props.payload && props.payload.length > 0) {
    const dataPoint = props.payload[0].payload;
    const tooltipStyle = {
      backgroundColor: "#ffffff",
      padding: "0.5rem",
      borderRadius: "10px",
      boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
    }
    switch (props.graphStyle) {
      case 'candlestick':
        return (
          <div style={tooltipStyle}>
            <div style={{ fontSize: '20px', fontWeight: '600' }} >{dataPoint.time}</div>
            <div>High: {dataPoint.high}</div>
            <div>Low: {dataPoint.low}</div>
            <div>Open: {dataPoint.openCloseData[0]}</div>
            <div>Close: {dataPoint.openCloseData[1]}</div>
            <div>Volume: {dataPoint.volume}</div>
          </div>
        ) 
      case 'ohlc':
        return (
          <div style={tooltipStyle}>
            <div style={{ fontSize: '20px', fontWeight: '600' }} >{dataPoint.time}</div>
            <div>High: {dataPoint.highLow[0]}</div>
            <div>Low: {dataPoint.highLow[1]}</div>
            <div>Open: {dataPoint.open}</div>
            <div>Close: {dataPoint.close}</div>
            <div>Volume: {dataPoint.volume}</div>
          </div>
        ) 
      case 'line':
        return (
          <div style={tooltipStyle}>
            <div style={{ fontSize: '20px', fontWeight: '600' }} >{dataPoint.time}</div>
            <div>High: {dataPoint.high}</div>
            <div>Low: {dataPoint.low}</div>
            <div>Open: {dataPoint.open}</div>
            <div>Close: {dataPoint.close}</div>
            <div>Volume: {dataPoint.volume}</div>
          </div>
        ) 
      default:
        throw new Error(`Invalid graph style of ${props.graphStyle}`);
    }
  }
  return null;
}

StocksToolTip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  graphStyle: PropTypes.string
}