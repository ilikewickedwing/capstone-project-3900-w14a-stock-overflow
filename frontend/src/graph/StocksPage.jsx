import { useParams } from "react-router";
import StocksGraph from "./StocksGraph";

export function StocksPage (props) {
  const { companyId } = useParams();
  const wrapperStyle ={
    
  }
  return (
    <div style={wrapperStyle}>
      <StocksGraph companyId={companyId}/>
    </div>
  )
}
