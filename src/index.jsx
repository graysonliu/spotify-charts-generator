import React from "react";
import ReactDOM from "react-dom";
import App from "./App";


function createTitle(title) {
    const element = document.createElement('title');
    element.innerText = title;
    return element;
}

function component() {
    const element = document.createElement('div');
    element.id = 'root';
    return element;
}

document.head.appendChild(createTitle("Spotify Charts Generator"))
document.body.appendChild(component());
ReactDOM.render(<App/>, document.getElementById("root"));