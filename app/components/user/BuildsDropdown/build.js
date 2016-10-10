import React from 'react';
import Relay from 'react-relay';

import Emojify from '../../shared/Emojify';

import PusherStore from '../../../stores/PusherStore';
import BuildState from '../../icons/BuildState';
import Duration from "../../shared/Duration";

import { buildTime } from '../../../lib/builds';
import { shortMessage, shortCommit } from '../../../lib/commits';

class BuildsDropdownBuild extends React.Component {
  static propTypes = {
    build: React.PropTypes.object,
    relay: React.PropTypes.object.isRequired
  }

  state = {
    hover: false
  }

  componentDidMount() {
    PusherStore.on("websocket:event", this.handlePusherWebsocketEvent);
  }

  componentWillUnmount() {
    PusherStore.off("websocket:event", this.handlePusherWebsocketEvent);
  }

  render() {
    const messageClassName = `semi-bold ${this.state.hover ? 'lime' : 'black'}`;

    return (
      <div>
        <a href={this.props.build.url} className="flex text-decoration-none dark-gray hover-lime mb2" onMouseOver={this.handleMouseOver} onMouseOut={this.handleMouseOut}>
          <div className="pr2 center">
            <BuildState className="block" state={this.props.build.state} size="small" />
            <small><Duration.Micro className="dark-gray" {...buildTime(this.props.build)} /></small>
          </div>
          <div className="flex-auto line-height-2">
            <span className="block line-height-3 overflow-hidden overflow-ellipsis">
              <Emojify className={messageClassName} text={shortMessage(this.props.build.message)} /> {shortCommit(this.props.build.commit)}
            </span>
            <small className="block">{this.props.build.organization.name} / {this.props.build.pipeline.name}</small>
          </div>
        </a>
      </div>
    );
  }

  handleMouseOver = () => {
    this.setState({ hover: true });
  }

  handleMouseOut = () => {
    this.setState({ hover: false });
  }

  handlePusherWebsocketEvent = (payload) => {
    if (payload.event === "build:updated" && payload.graphql.id === this.props.build.id) {
      this.props.relay.forceFetch();
    }
  };
}

export default Relay.createContainer(BuildsDropdownBuild, {
  fragments: {
    build: () => Relay.QL`
      fragment on Build {
        id
        message
        state
        startedAt
        finishedAt
        url
        commit
        organization {
          name
          slug
        }
        pipeline {
          name
          slug
        }
      }
    `
  }
});
