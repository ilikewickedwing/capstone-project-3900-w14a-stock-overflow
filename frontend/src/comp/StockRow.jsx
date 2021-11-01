import React from 'react'; 

const StockRow = ({data}) => {
  return (
    <div>
      <ul>{data.stock}</ul>
      <ul>{data.avgPrice}</ul>
      <ul>{data.quantity}</ul>
      <button>More</button>
      <button>Delete</button>
    </div>
  )
}

export default StockRow;