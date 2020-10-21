const fetch = require('node-fetch');
const cheerio = require('cheerio');

const fetch_chart = async () => {
    const country_list = [];
    const response = await fetch('https://spotifycharts.com/');
    const body = await response.text();
    const $ = cheerio.load(body);
    const list = $('div.responsive-select[data-type=country] ul li');
    list.each(function (i, element) {
        country_list.push([
            $(this).data('value'),
            $(this).text()
        ]);
    })
    return country_list;
}

module.exports.fetch_chart = fetch_chart;