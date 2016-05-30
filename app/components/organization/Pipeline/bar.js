import React from 'react';
import shallowCompare from 'react-addons-shallow-compare';

import Build from './build';

class Bar extends React.Component {
  static propTypes = {
    href: React.PropTypes.string,
    color: React.PropTypes.string.isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    left: React.PropTypes.number.isRequired,
    build: React.PropTypes.object
  };

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  render() {
    if(this.props.href) {
      return (
        <Build build={this.props.build}>
          <a href={this.props.href}
            className="border-box inline-block absolute"
            style={{ height: "100%", left: this.props.left, width: this.props.width, bottom: 0 }}
            ref={c => this.barLinkNode = c}>
            <div style={{ height: this.props.height, width: this.props.width, left: 0, bottom: 0, backgroundColor: this.props.color }} className="border-box inline-block absolute" />
          </a>
        </Build>
      );
    } else {
      let style = { backgroundColor: this.props.color, height: this.props.height, left: this.props.left, width: this.props.width, bottom: 0 };

      return (
        <div className="border-box inline-block absolute" style={style} />
      );
    }
  }
}

export default Bar
