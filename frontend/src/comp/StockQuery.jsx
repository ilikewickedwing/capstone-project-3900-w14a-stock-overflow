import React from 'react'; 
import { useHistory, useParams } from 'react-router-dom';
import { StockQueryButton} from '../styles/styling';

const StockQuery = ({stockCode, stockName}) => {
    const history = useHistory(); 
    return (
        <StockQueryButton onClick={()=>
            history.push(`/stock/${stockCode}`)
        }>
            {stockCode}
            {' '}
            {stockName}
        </StockQueryButton>
    )
}

export default StockQuery; 