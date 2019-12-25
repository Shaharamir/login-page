/** @jsx jsx */
import React from 'react';
import { jsx, css } from '@emotion/core'

interface props {
    checkerColor: 'white' | 'black';
    isChecked: boolean;
    isKing: boolean;
}

const Checker: React.FC<props> = (props) => {
    const { checkerColor, isChecked, isKing } = props;
    const checker = css`
        border-radius: 50%;
        border: 2px solid #ccc;
        background-color: ${checkerColor};
        box-shadow: 0 0 1px black;
        width: 50%;
        height: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        ${isChecked && `
            box-shadow: 0 0 17px white;
        `}
        user-select: none;
    `;

    const kingColor = css`
        color: ${checkerColor === 'white' ? 'black' : 'white'};
    `;
    return (
        <div css={checker}>
            {isKing && <div css={kingColor}>♚</div>}
        </div>
    )
}
export default Checker;