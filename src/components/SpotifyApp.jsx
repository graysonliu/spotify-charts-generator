import React, {Component} from "react";
import processURL from "../utils/process_url";
import "../styles.scss"
import "flag-icon-css/css/flag-icon.min.css"
import MyLogo from "./MyLogo";
import CountryList from "./CountryList";
import SelectAllCheckBox from "./SelectAllCheckBox";
import MainButton from "./MainButton";
import ConsoleOutput from "./ConsoleOutput";

class SpotifyApp extends Component {
    constructor(props) {
        super(props);

        // mapping country code to its index in window.env.charts
        // initialized by this.initialize_selected()
        this.country_index = new Map()

        this.state = {
            access_token: null,
            refresh_token: null,
            selected_list: this.initialize_selected(),
            user_name: null,
            user_id: null,
            console_text: ''
        };
        window.spotifyAuthSuccessCallback = this.spotifyAuthSuccessCallback;
        window.spotifyAuthCanceledCallback = this.spotifyAuthCanceledCallback;
    }

    initialize_selected = () => {
        const selected_list = {};
        window.env.charts.forEach((chart, i) => {
            selected_list[chart[0]] = false;
            this.country_index[chart[0]] = i;
        });
        return selected_list;
    }

    spotifyAuthSuccessCallback = async (code) => {
        // close the popup window
        this.popup.close();

        // use 'code' to request token
        let response = await fetch(
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
            });
        let data = await response.json();
        this.setState(() => ({
            access_token: data['access_token'],
            refresh_token: data['refresh_token'],
        }));

        // get user info using token
        data = await this.spotify_api_fetch('/me')
        this.setState(() => ({
            user_name: data['display_name'],
            user_id: data['id'],
            console_text: `Logged in as "${data['display_name']}".`
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

    spotify_api_fetch = async (endpoint, method = 'GET', data) => {
        const spotify_api_uri = 'https://api.spotify.com/v1';

        const response =
            method.toUpperCase() === 'GET' ?
                await fetch(
                    spotify_api_uri + endpoint,
                    {
                        method: method,
                        headers: {
                            Authorization: `Bearer ${this.state.access_token}`
                        }
                    }
                ) :
                await fetch(
                    spotify_api_uri + endpoint,
                    {
                        method: method,
                        headers: {
                            Authorization: `Bearer ${this.state.access_token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data || '')
                    }
                );
        return await response.json();
    }

    createPlaylists = async () => {
        for (const country_code in this.state.selected_list) {
            if (this.state.selected_list[country_code]) {
                const country_name = window.env.charts[this.country_index[country_code]][1];
                const tracks = window.env.charts[this.country_index[country_code]][2];
                let data = await this.spotify_api_fetch(
                    `/users/${this.state.user_id}/playlists`,
                    'POST',
                    {
                        name: `${country_name} Top 200 Daily`,
                        description: `Created by ${window.env.redirect_uri}`
                    }
                );
                const playlist_id = data['id'];
                const playlist_name = data['name'];
                // we can only add 100 tracks at maximum per request
                if (tracks.length > 0) {
                    await this.spotify_api_fetch(
                        `/playlists/${playlist_id}/tracks`,
                        'POST',
                        {
                            uris: tracks.slice(0, 100).map(
                                track_id => `spotify:track:${track_id}`)
                        }
                    )
                }
                if (tracks.length > 100) {
                    await this.spotify_api_fetch(
                        `/playlists/${playlist_id}/tracks`,
                        'POST',
                        {
                            uris: tracks.slice(100).map(
                                track_id => `spotify:track:${track_id}`)
                        }
                    )
                }
                this.appendConsoleText(`Playlist "${playlist_name}" Created`);
            }
        }
        // clear all selected items after clicking create-playlists button
        this.handleClickSelectAll(false);
    }

    appendConsoleText = (text) => {
        this.setState(preState => {
            const console_text = `${preState.console_text}\n${text}`;
            return {console_text};
        });
    }

    clearOutput = () => {
        this.setState(() =>
            ({console_text: `Logged in as "${this.state.user_name}".`})
        );
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
                            style='main-button'
                            onClick={this.createPlaylists}
                            text='Create Playlists'
                        /> :
                        <MainButton
                            style='main-button'
                            onClick={this.handleClickLoginButton}
                            text='Login with Spotify'
                        />
                }

                {this.state.user_name &&
                <ConsoleOutput text={this.state.console_text}/>}

                {this.state.user_name &&
                <MainButton style='main-button'
                            onClick={this.clearOutput}
                            text='Clear Output'/>}

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
