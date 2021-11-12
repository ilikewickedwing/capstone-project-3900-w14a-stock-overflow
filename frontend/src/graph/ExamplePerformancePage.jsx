import { useParams } from "react-router";
import PerformanceGraph from "./PerformanceGraph";

export function ExamplePerformancePage () {
  const { pids } = useParams();
  return (
    <PerformanceGraph height={200} pids={pids}/>
  )
}