import React, {Component} from "react";
import $ from "jquery"
import processURL from "./process_url";
import spotify_client from "./spotify_client_config";


const scopes = 'playlist-modify-public';

const client_id = spotify_client.client_id
const client_secret = spotify_client.client_secret
const redirect_uri = spotify_client.redirect_uri

console.log(client_id, client_secret)

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {access_token: null, refresh_token: null}
    }

    render() {
        // spotify authentication
        if (!this.state.access_token && !('code' in processURL(window.location.href))) {
            window.location.href = 'https://accounts.spotify.com/authorize' +
                '?response_type=code' +
                '&client_id=' + client_id +
                (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
                '&redirect_uri=' + encodeURIComponent(redirect_uri) +
                '&show_dialog=' + true;
        }

        const queries = processURL(window.location.href)

        // use code to request token
        if (!this.state.access_token && 'code' in queries) {
            $.ajax({
                method: "POST",
                url: "https://accounts.spotify.com/api/token",
                data: {
                    grant_type: 'authorization_code',
                    code: queries['code'],
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
            }).fail(() => window.location.href = redirect_uri);
        }

        return (
            <div>
            </div>);
    }
}

export default App;
