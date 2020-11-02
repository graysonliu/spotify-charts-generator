import React, {Component} from "react";
import '../styles.scss'

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
                {/*<span className={`flag-icon flag-icon-${this.props.country_code}`}/>*/}
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

export default CountryList;