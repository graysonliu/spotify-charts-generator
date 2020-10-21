import React, {Component} from "react";
import $ from "jquery"
import processURL from "./process_url";
import logo_thinking from "./images/thinking.svg"
import "./styles.scss"

class ImageLink extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className='image-link'>
                <a href={this.props.href || '#'}
                   target={this.props.target || '_blank'}
                >
                    <img src={this.props.img}
                         alt={this.props.alt || ''}
                    />
                </a>
            </div>);
    }
}

class MyLogo extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={this.props.style ?
                `my-logo ${this.props.style}` :
                'my-logo'}>
                <ImageLink
                    target='_self'
                    img={logo_thinking}
                />
            </div>
        );
    }
}

class LoginButton extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className='login-button'>
                <button onClick={this.props.onClick}>Login</button>
            </div>
        );
    }

}

class SpotifyApp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            access_token: null,
            refresh_token: null
        };
        this.popup = null;
        window.spotifyAuthSuccessCallback = this.spotifyAuthSuccessCallback.bind(this);
        window.spotifyAuthCanceledCallback = this.spotifyAuthCanceledCallback.bind(this);
        this.handleClickLoginButton = this.handleClickLoginButton.bind(this);
    }

    spotifyAuthSuccessCallback(code) {
        // close the popup window
        this.popup.close();

        // use 'code' to request token
        fetch(
            'https://accounts.spotify.com/api/token',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    grant_type: "authorization_code",
                    code: code,
                    redirect_uri: window.env.redirect_uri,
                    client_id: window.env.client_id,
                    client_secret: window.env.client_secret,
                })
            })
            .then(response => response.json())
            .then(data => this.setState({
                access_token: data['access_token'],
                refresh_token: data['refresh_token'],
            }));
    }

    spotifyAuthCanceledCallback() {
        // close the popup window
        this.popup.close();
    }

    handleClickLoginButton(e) {
        this.popup = window.open('https://accounts.spotify.com/authorize' +
            '?response_type=code' +
            '&client_id=' + window.env.client_id +
            (window.env.scopes ? '&scope=' + encodeURIComponent(window.env.scopes) : '') +
            '&redirect_uri=' + encodeURIComponent(window.env.redirect_uri),
            'Login with Spotify');
    }

    render() {
        const queries = processURL(window.location.href)
        // spotify authentication
        if (!this.state.access_token) {
            if (!('code' in queries) && !('error' in queries)) {
                // not authenticated yet
                // this is the main window
                return (
                    <div className='app'>
                        <MyLogo style='my-logo-header'/>
                        <LoginButton onClick={this.handleClickLoginButton}/>
                    </div>);
            }
            if ('code' in queries) {
                // authenticated and this is a popup window
                // window.opener is the main window
                window.opener && window.opener.spotifyAuthSuccessCallback(queries['code']);
                return (<div className='app'/>);
            }
            if ('error' in queries) {
                // authentication canceled and this is a popup window
                // window.opener is the main window
                window.opener && window.opener.spotifyAuthCanceledCallback();
                return (<div className='app'/>);
            }
        } else {
            return (
                <div className='app'>
                    <MyLogo style='my-logo-header'/>
                </div>
            );
        }
    }
}

export default SpotifyApp;
