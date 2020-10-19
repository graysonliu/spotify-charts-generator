import React from "react";
import ReactDOM from "react-dom";
import SpotifyApp from "./App";

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

// Why do we need to set those environment variables as global variables?
// See https://create-react-app.dev/docs/adding-custom-environment-variables
// Note this solution will expose the client secret, which brings security issue.
window.client_id = process.env.CLIENT_ID
window.client_secret = process.env.CLIENT_SECRET
window.redirect_uri = process.env.REDIRECT_URL
window.scopes = process.env.SCOPES

ReactDOM.render(
    <SpotifyApp/>,
    document.getElementById("root"));