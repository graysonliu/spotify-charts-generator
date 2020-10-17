const spotify_client = {
    client_id: 'c86395f9e10f46789da8c175dd76eea5',
    client_secret: '58e139c6808244518abbeb8bc1aed95e',
    redirect_uri: window.location.href.indexOf('localhost') !== -1 ?
        'http://localhost:3000/' :
        'https://graysonliu.github.io/spotify-charts-generator/'
}

export default spotify_client