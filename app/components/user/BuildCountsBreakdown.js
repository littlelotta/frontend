// @flow

import React from 'react';
import PropTypes from 'prop-types';

import PusherStore from '../../stores/PusherStore';
import StateSwitcher from '../build/StateSwitcher';

type Props = {
  viewer: {
    builds: {
      count: number
    },
    scheduledBuilds: {
      count: number
    },
    runningBuilds: {
      count: number
    }
  },
  state?: string
};

type State = {
  buildsCount: number,
  scheduledBuildsCount: number,
  runningBuildsCount: number
};

export default class BuildCountsBreakdown extends React.PureComponent<Props, State> {
  static propTypes = {
    viewer: PropTypes.shape({
      builds: PropTypes.shape({
        count: PropTypes.number.isRequired
      }).isRequired,
      scheduledBuilds: PropTypes.shape({
        count: PropTypes.number.isRequired
      }).isRequired,
      runningBuilds: PropTypes.shape({
        count: PropTypes.number.isRequired
      }).isRequired
    }).isRequired,
    state: PropTypes.string
  };

  state = {
    buildsCount: this.props.viewer.builds.count,
    scheduledBuildsCount: this.props.viewer.scheduledBuilds.count,
    runningBuildsCount: this.props.viewer.runningBuilds.count
  };

  componentDidMount() {
    PusherStore.on("user_stats:change", this.handleStoreChange);
  }

  componentWillUnmount() {
    PusherStore.off("user_stats:change", this.handleStoreChange);
  }

  render() {
    return (
      <StateSwitcher
        path="/builds"
        state={this.props.state}
        buildsCount={this.state.buildsCount}
        runningBuildsCount={this.state.runningBuildsCount}
        scheduledBuildsCount={this.state.scheduledBuildsCount}
      />
    );
  }

  handleStoreChange = (payload: State) => {
    this.setState({
      buildsCount: payload.buildsCount,
      scheduledBuildsCount: payload.scheduledBuildsCount,
      runningBuildsCount: payload.runningBuildsCount
    });
  }
}
