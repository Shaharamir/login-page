/** @jsx jsx */
import React from 'react';
import { jsx, css } from '@emotion/core'
import Square from './Square/Square';
import { SquareFootSharp } from '@material-ui/icons';

interface props {
}


const MainGame: React.FC<props> = () => {
    const sqaures = Array.from({length: 8}, (v, columnsIndex) => Array.from({length: 8}, (v, rowsIndex) => {
        if(columnsIndex === 0) {
            return <Square xIndex={columnsIndex} yIndex={rowsIndex} isChecker={rowsIndex%2 === 0} checkerColor={'white'} />
        }
        else if(columnsIndex === 1) {
            return <Square xIndex={columnsIndex} yIndex={rowsIndex} isChecker={rowsIndex%2 === 1} checkerColor={'white'} />
        }
        else if(columnsIndex === 2) {
            return <Square xIndex={columnsIndex} yIndex={rowsIndex} isChecker={rowsIndex%2 === 0} checkerColor={'white'} />
        }
        else if(columnsIndex === 5) {
            return <Square xIndex={columnsIndex} yIndex={rowsIndex} isChecker={rowsIndex%2 === 1} checkerColor={'black'} />
        }
        else if(columnsIndex === 6) {
            return <Square xIndex={columnsIndex} yIndex={rowsIndex} isChecker={rowsIndex%2 === 0} checkerColor={'black'} />
        }
        else if(columnsIndex === 7) {
            return <Square xIndex={columnsIndex} yIndex={rowsIndex} isChecker={rowsIndex%2 === 1} checkerColor={'black'} />
        }
        else {
            return <Square xIndex={columnsIndex} yIndex={rowsIndex} isChecker={false} />
        }
    }));
    return (
        <div css={css`display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;`}>
            {sqaures.map((x, xIndex) => (
                <div css={css`display: flex;`}>
                    {x.map((checker, yIndex) => checker)}
                </div>
            ))}
        </div>
    )
}
export default MainGame;