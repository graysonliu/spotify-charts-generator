import React from "react";
import ReactDOM from "react-dom";
import App from "./App.js";

function component() {
    const element = document.createElement('div');
    element.id = 'root'
    return element;
}

document.body.appendChild(component());
ReactDOM.render(<App/>, document.getElementById("root"));
