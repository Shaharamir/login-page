/** @jsx jsx */
import{ Global, css, jsx } from '@emotion/core';
import React from 'react';

export const GlobalCSS: React.FC = () => {

    const fontFamily = css`
        * {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
    `;

    const bodyStyling = css`
        body {
            background-color: #eeeeee;
        }
        * {
            margin: 0;
            padding: 0;
        }
    `;

    const globalStyling = css`
        ${fontFamily}
        ${bodyStyling}
    `;

    return (
        <Global styles={globalStyling} />
    )
}

export default GlobalCSS;
