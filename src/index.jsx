import React from "react";
import ReactDOM from "react-dom";
import SpotifyApp from "./App";
import spotify_client from "./spotify_client_config";

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

ReactDOM.render(
    <SpotifyApp
        client_id={spotify_client.client_id}
        client_secret={spotify_client.client_secret}
        redirect_uri={spotify_client.redirect_uri}
        scope={spotify_client.scope}
    />,
    document.getElementById("root"));