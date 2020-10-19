import React from "react";
import ReactDOM from "react-dom";
import SpotifyApp from "./App";


function component() {
    const element = document.createElement('div');
    element.id = 'root';
    return element;
}

document.body.appendChild(component());

ReactDOM.render(
    <SpotifyApp/>,
    document.getElementById("root"));