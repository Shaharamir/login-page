/** @jsx jsx */
import React from 'react';
import { jsx, css } from '@emotion/core'
import Checker from '../Checker/Checker';

interface props {
    xIndex: number;
    yIndex: number;
    isChecker: boolean;
    checkerColor?: 'white' | 'black'; 
}

const Square: React.FC<props> = (props) => {

    const { xIndex, yIndex, isChecker, checkerColor  } = props;
    const squareColor = css`
        background-color: ${xIndex%2 === 0 ? 
                                yIndex%2==0 ? 'black' : 'white' : 
                                yIndex%2==0 ? 'white' : 'black'};
        width: 5em;
        height: 5em;
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