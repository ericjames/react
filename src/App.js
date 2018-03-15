import React, {
    Component
} from 'react';
import tslogo from './ts_square.svg';
import theme1 from './theme1.css';

// const blocks = [{
//     mode: "Rail",
//     id: 1,
// }, {
//     mode: "Bus",
//     id: 2,
// }]

var _userLat = null
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
        <div className="Header">
                <div className="title">Nearby</div>
                <img className="logo" src={tslogo} />
        </div>
    )
}

class BlockList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            styles: {},
            heightSet: false
        }
        this.updateHeight = this.updateHeight.bind(this);
    }
    componentDidMount() {}
    componentDidUpdate() {
        if (!this.state.heightSet && this.instance && this.instance.offsetHeight > 0) {
            this.updateHeight();
            this.setState({
                heightSet: true
            });
        }
    }
    updateHeight() {
        let newHeight = this.instance.offsetHeight;
        this.setState({
            styles: {
                height: newHeight + 'px'
            }
        });
    }
    render() {
        let blocks = filterBlocks(this.props.blocks);
        if (blocks.length > 0) {
            let count = blocks.length;
            let blocklist = blocks.map((blockData, i) => {
                let zindex = count - i;
                // if (i > 5) {
                //     return
                // }
                return <Block key={blockData.id} zindex={zindex} blockData={blockData}></Block>
            })
            return (
                <div ref={(el) => this.instance = el } className="BlockList" style={this.state.styles}>
                    <div className="caption">Nearby transit stops to you ↓</div>
                    {blocklist}
                    <div className="caption footer">That's all!</div>
                </div>
            )
        }
        return false
    }
}

function filterBlocks(blocks) {
    let out = [];
    blocks.map((block, i) => {
        if (block.display_class == 'masstransit') {
            out.push(block);
        }
    });
    return out;
}

class Block extends Component {
    constructor(props) {
        super(props);
        this.state = {
            classNames: 'Block',
            zindex: this.props.zindex
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

        this.handleScroll();

        // let scrollPosition = document.documentElement.scrollTop;
        // let positionTop = this.instance.getBoundingClientRect().top;
        // let offsetTop = positionTop + scrollPosition;

        // this.setState({
        //     styles: {
        //         position: 'absolute',
        //         top: offsetTop
        //     }
        // })
        let zindex = this.state.zindex;
        this.setState({
            styles: {
                zIndex: zindex
            }
        })


        var scrollTop = window.pageYOffset;
        window.scrollTo(0, scrollTop + 1);

    }
    componentDidUpdate() {

    }
    handleScroll(e) {
        let positionTop = this.instance.getBoundingClientRect().top;
        let positionBottom = this.instance.getBoundingClientRect().bottom;

        // let offsetTop = this.instance.offsetTop;
        // console.log(offsetTop);
        let eleHeight = this.instance.clientHeight;
        let viewportHeight = window.innerHeight - 50;
        let isBelowFold = this.state.classNames.indexOf('belowfold') !== -1;
        let scrollPosition = document.documentElement.scrollTop;

        var body = document.body;
        var docEl = document.documentElement;

        var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
        var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

        var offsetTop = scrollTop + positionTop;
        var offsetBottom = scrollTop + positionBottom;

        console.log(this.props.blockData.title, "Scroll Top", scrollTop, "Position Bottom", positionBottom, "Viewport", viewportHeight, "Bottomlimit", this.state.scrollBottomLimit);

        if (positionTop < 30) {
            this.setState({
                classNames: 'Block aboveview'
            });
        } else if (positionBottom < viewportHeight - 60) {
            this.setState({
                classNames: 'Block inview'
            });
        } else {
            this.setState({
                classNames: 'Block belowview'
            });
        }

        if (positionBottom >= viewportHeight) {
            this.setState({
                styles: {
                    position: 'fixed',
                    bottom: 40 + ( 6 * this.state.zindex ),
                    zIndex: this.state.zindex
                },
            });
            if (!this.state.scrollBottomLimit) {
                this.setState({
                    scrollBottomLimit: scrollTop
                });
            }
        }

        if (scrollTop > this.state.scrollBottomLimit) {
            this.setState({
                styles: {
                    position: null,
                    bottom: null,
                    zIndex: this.state.zindex
                },
                scrollBottomLimit: null
            });
        }

        // if (offsetTop < 300) {
        //     this.setState({
        //         newHeight: this.state.originalHeight
        //     });
        // } else {
        //     this.setState({
        //         newHeight: 40
        //     });
        // }
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
        return <div ref={(el) => this.instance = el } style={this.state.styles} className={this.state.classNames}>
              <div className="container">
                  <h2>{this.props.blockData.title}</h2>
                  <ol>
                  {rowList}
                  </ol>
              </div>
            </div>
    }
}

function Placeholder(props) {
    var bottomPosition = (this.props.placeholderPosition + 1) * 20 + 'px';
    return <div className="placeholder" style={{bottom: bottomPosition}}>{this.props.blockData.title}</div>
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
        <div className="label"><span>min</span></div>
     </div>
  </li>

}

function Predictions(props) {
    let predictions = props.predictions;

    let list = predictions.map((numeral, i) => {
        if (i == predictions.length - 1) {
            return <span key={i}>{numeral}</span>
        } else if (i < 1) {
            return <span key={i}>{numeral}, </span>
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
