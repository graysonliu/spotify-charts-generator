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
                   target={this.props.target || '_blank'}>
                    <img src={this.props.img}
                         alt={this.props.alt || ''}
                         className={this.props.rotating && 'rotating-img'}
                         onMouseOver={this.props.onMouseOverImage}
                         onMouseLeave={this.props.onMouseLeaveImage}/>
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
            <div className='my-logo'>
                <ImageLink
                    target='_self'
                    img={logo_thinking}
                    rotating={true}
                />
            </div>);
    }

}

class LoginButton extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
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

        // use code to request token
        $.ajax({
            method: "POST",
            url: "https://accounts.spotify.com/api/token",
            data: {
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: window.env.redirect_uri,
                client_id: window.env.client_id,
                client_secret: window.env.client_secret,
            }
        }).done(data => {
            this.setState({
                access_token: data['access_token'],
                refresh_token: data['refresh_token'],
            });
        });
    }

    handleClickLoginButton(e) {
        this.popup = window.open('https://accounts.spotify.com/authorize' +
            '?response_type=code' +
            '&client_id=' + window.env.client_id +
            (window.env.scopes ? '&scope=' + encodeURIComponent(window.env.scopes) : '') +
            '&redirect_uri=' + encodeURIComponent(window.env.redirect_uri) +
            '&show_dialog=' + true,
            'Login with Spotify');
    }

    spotifyAuthCanceledCallback() {
        // close the popup window
        this.popup.close();
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
                        <MyLogo/>
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
                    <MyLogo/>
                </div>
            );
        }
    }
}

export default SpotifyApp;
