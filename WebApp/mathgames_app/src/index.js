import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Menu from './Menu.js';
import reportWebVitals from './reportWebVitals';


import io from "socket.io-client";
let socket = io("http://localhost:4000");
export default socket;

ReactDOM.render(<Menu />, document.getElementById('root'));


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
