import React, {Component} from "react";
import $ from "jquery"
import processURL from "./process_url";


const scopes = 'playlist-modify-public';
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URL;

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
