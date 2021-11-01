import { CircularProgress } from "@material-ui/core";

export default function LoadingScreen() {
  const loadingStyle = {
    position: "absolute",
    opacity: "0.8",
    zIndex: '999',
    backgroundColor: "#000000",
    width: "100%",
    height: "100%",
    display: "grid",
    placeItems: "center",
  }
  return (
    <div style={loadingStyle}>
      <CircularProgress style={{ opacity: "1" }}/>
    </div>
  )
}