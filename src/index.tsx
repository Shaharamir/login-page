import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { StylesProvider } from '@material-ui/core/styles';

if (process.env.NODE_ENV !== 'production') {
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(React);
}

ReactDOM.render(<StylesProvider injectFirst><App /></StylesProvider>, document.getElementById('root'));