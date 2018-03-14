import React, {
    Component
} from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import tslogo from './ts_square.svg';

// const blocks = [{
//     mode: "Rail",
//     id: 1,
// }, {
//     mode: "Bus",
//     id: 2,
// }]

var _userLat = null;
var _userLng = null;

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            blocks: []
        }
    }
    componentDidMount() {
        // if (!_userLat && !_userLng) {
        //     getUserLocation((lat, lng) => {
        //         _userLat = lat;
        //         _userLng = lng;
        //         this.fetchData(lat, lng);
        //     });
        // } else {
        // }
        this.fetchData(_userLat, _userLng);
    }
    fetchData(lat, lng) {
        fetch("/test.json?lat=" + lat + "&lng=" + lng)
            .then(res => res.json())
            .then(
                (result) => {
                    this.updateData(result)
                },
                (error) => {
                    console.log(error);
                    this.setState({
                        isLoaded: true,
                        errorLoading: true,
                        error: error
                    });
                }
            )
    }
    updateData(result) {
        this.setState({
            isLoaded: true,
            errorLoading: false,
            blocks: result.blocks,
        });
    }

    render() {
        return (
            <div className="App">
            <header className="App-header">
            </header>
            <Header />
            <BlockList blocks={this.state.blocks} />
          </div>
        );
    }
}

function getUserLocation(callback) {

    if (!navigator.geolocation) {
        console.log("no navigator");
        return;
    }

    function success(position) {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        console.log("success", latitude, longitude);
        callback(latitude, longitude);
    }

    function error(e) {
        console.log(e);
    }
    navigator.geolocation.getCurrentPosition(success, error, {
        maximumAge: 600000
    });
}

function Header() {
    return (
        <div className="Header"><div className="title">Nearby</div><img className="logo" src={tslogo} /></div>
    )
}

function BlockList(props) {
    let blocklist = props.blocks.map((blockData) => {
        if (blockData.display_class === 'masstransit') {
            return <Block key={blockData.id} blockData={blockData}></Block>
        }
        return false;
    })
    return (
        <div className="BlockList">
            <div class="caption">Nearby transit stops to you ↓</div>
            {blocklist}
            <div class="caption footer">That's all!</div>
        </div>
    )
}

class Block extends Component {
    constructor(props) {
        super(props);
        this.state = {
            classNames: 'Block',
        }
        this.handleScroll = this.handleScroll.bind(this);
    }

    componentDidMount() {
        let originalHeight = this.instance.offsetHeight;
        this.setState({
            originalHeight: originalHeight
        });

        window.addEventListener('touchmove', this.handleScroll);
        window.addEventListener('scroll', this.handleScroll);
    }
    handleScroll(e) {
        let offsetTop = this.instance.getBoundingClientRect().top;
        let offsetBottom = this.instance.getBoundingClientRect().bottom;

        // let offsetTop = this.instance.offsetTop;
        // console.log(offsetTop);
        let currentHeight = this.instance.clientHeight;

        if (offsetTop < 30) {
            this.setState({
                newHeight: 100
            });
            this.setState({
                classNames: 'Block collapsed'
            });
        } else {
            this.setState({
                classNames: 'Block'
            });
            this.setState({
                newHeight: this.state.originalHeight
            });
        }

        if (offsetBottom < 30) {

        }
    }
    render() {
        var rowList = [];
        let items = this.props.blockData.items;
        if (items) {
            let combined = combineDestinations(items);
            for (var i in combined) {
                rowList.push(<Row key={i} rowData={combined[i]}></Row>)
            };
        }
        return <div ref={(el) => this.instance = el } style={{height: this.state.newHeight + 'px'}} className={this.state.classNames}>
              <h2>{this.props.blockData.title}</h2>
              <ol>
              {rowList}
              </ol>
            </div>
    }
}

function Row(props) {
    let row = props.rowData;
    return <li className="Row">
    <div className="Cell Cell--Route">
    <div className="route-name" style={{backgroundColor: row.route_color, color: row.text_color}}>
     {row.short_route}
     </div>
     </div>
    <div className="Cell Cell--Destination">
     {row.destination}<br/>
     {row.direction}
     </div>
    <div className="Cell Cell--Prediction">
        <Predictions predictions={row.predictions}></Predictions>
        <span className="label">min</span>
     </div>
  </li>

}

function Predictions(props) {
    let predictions = props.predictions;

    let list = predictions.map((numeral, i) => {
        if (i == predictions.length - 1) {
            return <span>{numeral}</span>
        } else if (i < 1) {
            return <span>{numeral}, </span>
        }
    });

    return <div className="predictions">{list}</div>
}

function combineDestinations(items) {
    var out = [];
    items.map((item) => {
        if (out[item.destination]) {
            out[item.destination].predictions.push(item.prediction)
        } else {
            out[item.destination] = item;
            out[item.destination].predictions = [item.prediction]
        }
    });
    return out;
}

export default App;
