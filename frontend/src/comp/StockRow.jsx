import React from 'react'; 

const StockRow = ({data}) => {
  return (
    <li>
      <ul>{data.stock}</ul>
      <ul>{data.avgPrice}</ul>
      <ul>{data.quantity}</ul>
    </li>
  )
}

export default StockRow;