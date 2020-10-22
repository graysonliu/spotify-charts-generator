import React, {Component} from "react";
import processURL from "./process_url";
import logo_thinking from "./images/thinking.svg"
import "./styles.scss"
import "flag-icon-css/css/flag-icon.css"

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
            <div className={this.props.style || ''}>
                <ImageLink
                    target='_self'
                    img={logo_thinking}
                />
            </div>
        );
    }
}

class MainButton extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={this.props.style}>
                <button
                    onClick={this.props.onClick}>
                    {this.props.text}
                </button>
            </div>
        );
    }

}

class CountryItem extends Component {
    constructor(props) {
        super(props);
    }

    onChange = (e) => {
        this.props.handleClickCountryItem(this.props.country_code, e.target.checked);
    }

    render() {
        return (
            <div className='country-item'>
                <input
                    type="checkbox"
                    checked={this.props.checked}
                    onChange={this.onChange}
                />
                <span>{` ${this.props.country_name} `}</span>
                <span className={`flag-icon flag-icon-${this.props.country_code}`}/>
            </div>);
    }
}

class CountryList extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const country_list = [];
        window.env.charts.forEach(chart => {
            country_list.push(
                <CountryItem
                    key={chart[0]}
                    country_code={chart[0]}
                    country_name={chart[1]}
                    checked={this.props.selected_list[chart[0]]}
                    handleClickCountryItem={this.props.handleClickCountryItem}
                />
            );
        });
        return (
            <div className='country-list'>
                {country_list}
            </div>
        );
    }
}

class SelectAllCheckBox extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className='select-all-item'>
                <input type='checkbox'
                       checked={this.props.all_selected}
                       onChange={e => this.props.handleClickSelectAll(e.target.checked)}
                />
                <span> Select All</span>
            </div>
        );
    }

}

class SpotifyApp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            access_token: null,
            refresh_token: null,
            selected_list: this.initialize_selected()
        };
        window.spotifyAuthSuccessCallback = this.spotifyAuthSuccessCallback;
        window.spotifyAuthCanceledCallback = this.spotifyAuthCanceledCallback;
    }

    initialize_selected = () => {
        const selected_list = {};
        window.env.charts.forEach(chart => {
            selected_list[chart[0]] = false;
        });
        return selected_list;
    }

    spotifyAuthSuccessCallback = code => {
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

    spotifyAuthCanceledCallback = () => {
        // close the popup window
        this.popup.close();
    }

    handleClickLoginButton = () => {
        this.popup = window.open('https://accounts.spotify.com/authorize' +
            '?response_type=code' +
            '&client_id=' + window.env.client_id +
            (window.env.scopes ? '&scope=' + encodeURIComponent(window.env.scopes) : '') +
            '&redirect_uri=' + encodeURIComponent(window.env.redirect_uri),
            'Login with Spotify');
    }

    handleClickCountryItem = (country_code, checked) => {
        this.setState(preState => {
            const selected_list = {...preState.selected_list};
            selected_list[country_code] = checked;
            return {selected_list};
        });
    }

    checkIfAllSelected = () => {
        return Object.values(this.state.selected_list).reduce((a, b) => a && b, true);
    }

    handleClickSelectAll = (checked) => {
        this.setState(preState => {
            const selected_list = {...preState.selected_list};
            for (const country_code in selected_list) {
                selected_list[country_code] = checked;
            }
            return {selected_list};
        });
    }

    render() {
        const queries = processURL(window.location.href)
        // spotify authentication
        if (!this.state.access_token && 'code' in queries) {
            // authenticated and this is a popup window
            // window.opener is the main window
            window.opener && window.opener.spotifyAuthSuccessCallback(queries['code']);
            return (<div className='app'/>);
        }
        if (!this.state.access_token && 'error' in queries) {
            // authentication canceled and this is a popup window
            // window.opener is the main window
            window.opener && window.opener.spotifyAuthCanceledCallback();
            return (<div className='app'/>);
        }
        return (
            <div className='app'>
                <MyLogo style='my-logo-header'/>
                {
                    this.state.access_token ?
                        <MainButton
                            style='create-playlists-button'
                            text='Create Playlists'
                        /> :
                        <MainButton
                            style='login-button'
                            onClick={this.handleClickLoginButton}
                            text='Login'
                        />
                }
                <SelectAllCheckBox
                    all_selected={this.checkIfAllSelected()}
                    handleClickSelectAll={this.handleClickSelectAll}
                />
                <CountryList
                    selected_list={this.state.selected_list}
                    handleClickCountryItem={this.handleClickCountryItem}
                />
            </div>
        );
    }
}

export default SpotifyApp;
