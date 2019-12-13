/** @jsx jsx */
import React from 'react';
import { jsx, css } from '@emotion/core'
import Checker from '../Checker/Checker';

interface props {
    column: number;
    row: number;
    isChecker: boolean;
    checkerColor: 'white' | 'black' | undefined;
    squareColor: 'white' | 'black';
    onSquareClick: () => void;
    onSquareOut: () => void;
    shouldHighlight: boolean;
}

const Square: React.FC<props> = (props) => {

    const { row, column, isChecker, checkerColor, onSquareClick, squareColor, shouldHighlight, onSquareOut } = props;
    const squareColorStyle = css`
        background-color:${squareColor};
        ${shouldHighlight && 'background-color: #ff7543;'}
        width: 100%;
        height: 100%;
    `;
    const sqaureStyle = css`
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    return (
        <React.Fragment>
            <div css={[squareColorStyle, sqaureStyle]} onClick={onSquareClick}>
                {(isChecker && checkerColor) &&
                    <Checker checkerColor={checkerColor}/>}
            </div>
        </React.Fragment>
    )
}
export default Square;