import React from 'react';
import update from "react-addons-update";
import classNames from "classnames";

class Spinner extends React.Component {
  static propTypes = {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    className: React.PropTypes.string,
    style: React.PropTypes.object,
    color: React.PropTypes.bool
  };

  static defaultProps = {
    width: 20,
    height: 20,
    color: true
  };

  render() {
    let style = update(this.props.style || {}, {
      verticalAlign: { $set: "middle" },
      width:         { $set: this.props.width },
      height:        { $set: this.props.height }
    });

    return (
      <div className={classNames("inline-block relative", this.props.className)} style={style}>
        <div className="absolute top-0 left-0">
          <svg viewBox="0 0 20 20" width="20px" height="20px" className="absolute top-0 left-0" style={{width: this.props.width, height: this.props.height}}>
            <circle fill="transparent" stroke="#ddd" strokeMiterlimit="10" strokeWidth="3" cx="10" cy="10" r="7"/>
          </svg>
          <svg viewBox="0 0 20 20" width="20px" height="20px" className="absolute top-0 left-0 animation-spin" style={{width: this.props.width, height: this.props.height}}>
            <defs>
              <clipPath id="spinner-clip-path">
                <rect fill="none" x="10" y="-10" width="20" height="20"/>
              </clipPath>
            </defs>
            <g transform="translate(10, 10)">
              <g className="animation-spin">
                <g transform="translate(-10, -10)">
                  <g clipPath="url(#spinner-clip-path)">
                    <circle fill="transparent" stroke={this._arcColor()} strokeMiterlimit="10" strokeWidth="3" cx="10" cy="10" r="7"/>
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </div>
      </div>
    );
  }

  _arcColor() {
    if (this.props.color) {
      return "#7EAF25"; // lime-green
    } else {
      return "#777";
    }
  }
}

export default Spinner;
