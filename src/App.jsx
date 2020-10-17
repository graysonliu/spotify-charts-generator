import React, {Component} from "react";
import $ from "jquery"
import processURL from "./process_url";

class SpotifyApp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            access_token: null,
            refresh_token: null,
            redirect_uri: this.props.redirect_uri
        };
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
                redirect_uri: this.props.redirect_uri,
                client_id: this.props.client_id,
                client_secret: this.props.client_secret,
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
                '&client_id=' + this.props.client_id +
                (this.props.scopes ? '&scope=' + encodeURIComponent(this.props.scopes) : '') +
                '&redirect_uri=' + encodeURIComponent(this.props.redirect_uri) +
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

export default SpotifyApp;
