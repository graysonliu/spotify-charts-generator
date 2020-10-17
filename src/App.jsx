import React, {Component} from "react";
import $ from "jquery"
import processURL from "./process_url";
import spotify_client from "./spotify_client_config";


const scopes = 'playlist-modify-public';

const client_id = spotify_client.client_id
const client_secret = spotify_client.client_secret
const redirect_uri = spotify_client.redirect_uri

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {access_token: null, refresh_token: null};
        this.popup = null;
        window.spotifyAuthCallback = this.spotifyAuthCallback.bind(this);
    }

    spotifyAuthCallback(code) {
        // close popup
        this.popup.close();
        // use code to request token
        $.ajax({
            method: "POST",
            url: "https://accounts.spotify.com/api/token",
            data: {
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirect_uri,
                client_id: client_id,
                client_secret: client_secret,
            }
        }).done(data => {
            console.log(data)
            this.setState({
                access_token: data['access_token'],
                refresh_token: data['refresh_token'],
            });
        });
    }

    render() {
        const queries = processURL(window.location.href)
        // spotify authentication
        if (!this.state.access_token && !('code' in queries)) {
            // not authenticated yet
            // this is the main window
            this.popup = window.open('https://accounts.spotify.com/authorize' +
                '?response_type=code' +
                '&client_id=' + client_id +
                (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
                '&redirect_uri=' + encodeURIComponent(redirect_uri) +
                '&show_dialog=' + true,
                'Login with Spotify',
                'width=800,height=600');
        } else if ('code' in queries) {
            // authenticated
            // this is a popup window, window.opener is the main window
            window.opener.spotifyAuthCallback(queries['code']);
        }

        return (
            <div>
            </div>);
    }
}

export default App;
