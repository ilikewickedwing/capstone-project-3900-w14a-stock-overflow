import { useParams } from "react-router";
import PerformanceGraph from "./PerformanceGraph";

export function ExamplePerformancePage () {
  const { pid } = useParams();
  return (
    <PerformanceGraph height={200} pid={pid}/>
  )
}