/** @jsx jsx */
import React from 'react';
import { jsx, css } from '@emotion/core'
import Checker from '../Checker/Checker';

interface props {
    column: number;
    row: number;
    isChecker: boolean;
    checkerColor: 'white' | 'black' | undefined; 
}

const Square: React.FC<props> = (props) => {

    const { row, column, isChecker, checkerColor  } = props;
    const squareColor = css`
        background-color:${row%2 === 0 ? 
                                column%2===0 ? 'black' : 'white' : 
                                column%2===0 ? 'white' : 'black'};
        width: 100%;
        height: 100%;
    `;
    const sqaureStyle = css`
        display: flex;
        justify-content: center;
        align-items: center;
    `
    return (
        <React.Fragment>
            <div css={[squareColor, sqaureStyle]}>
                {(isChecker && checkerColor) &&
                    <Checker checkerColor={checkerColor}/>}
            </div>
        </React.Fragment>
    )
}
export default Square;