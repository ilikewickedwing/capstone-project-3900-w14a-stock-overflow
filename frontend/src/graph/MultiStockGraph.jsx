import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useContext } from "react";
import { ApiContext } from "../api";

const STATES = {
  LOADING: 0,
  RECEIVED: 1,
  ERROR: 2,
}

export default function MultiStockGraph(props) {
  const [ state, setState ] = useState(STATES.LOADING);
  // Maps time options to an object that maps company id to its data
  const [ stocksCache, setStocksCache ] = useState({});
  const api = useContext(ApiContext);
  // make api call for time series
  useEffect(() => {
    const callApi = (company, interval) => {
      switch (interval) {
        case "1min":
          return api.stockTimeSeriesIntraday(company, interval);
        case "5min":
          return api.stockTimeSeriesIntraday(company, interval);
        case "15min":
          return api.stockTimeSeriesIntraday(company, interval);
        case "30min":
          return api.stockTimeSeriesIntraday(company, interval);
        case "60min":
          return api.stockTimeSeriesIntraday(company, interval);
        case "1day":
          return api.stockTimeSeriesDaily(company);
        case "1week":
          return api.stockTimeSeriesWeekly(company);
        case "1month":
          return api.stockTimeSeriesMonthly(company);
        default:
          throw Error(`Invalid interval of ${interval}`);
      }
    }
  })
}

MultiStockGraph.propTypes = {
  companyIds: PropTypes.array,
}