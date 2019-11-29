/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import { Paper } from '@material-ui/core';

const Container: React.FC = (props) => {
    
    const page = css`
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 1em 0;
    `;
    
    const container = css`
        padding: 1em;
        width: 70%;
        min-width: 19em;
        max-width: 50em;
    `;
  return (
      <div css={page}>
          <Paper css={container}>
              {props.children}
          </Paper>
      </div>
  );
}

export default Container;
