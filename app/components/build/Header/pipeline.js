/* global Buildkite */

import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';

import Emojify from '../../shared/Emojify';
import Icon from '../../shared/Icon';

import jobCommandOneliner from '../../../lib/jobCommandOneliner';
import BootstrapTooltipMixin from '../../../lib/BootstrapTooltipMixin';

const BuildHeaderPipelineComponent = createReactClass({ // eslint-disable-line react/prefer-es6-class
  displayName: 'BuildHeaderPipelineComponent',

  mixins: [BootstrapTooltipMixin],

  getInitialState() {
    return { showHiddenJobs: false };
  },

  propTypes: {
    build: PropTypes.shape({
      id: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      jobs: PropTypes.arrayOf(PropTypes.shape({
        state: PropTypes.string.isRequired
      })),
      jobsCount: PropTypes.number.isRequired
    }).isRequired
  },

  render() {
    return (
      <div className="flex">
        <div className="build-pipeline-container clearfix flex-auto">
          {this.stepNodes()}
        </div>
        <div className="flex-none" style={{ paddingTop: 18 }}>
          {this.renderHiddenJobsButton()}
        </div>
      </div>
    );
  },

  renderHiddenJobsButton() {
    // Figure out how many hidden jobs we have (if any?)
    const hiddenJobsCount = this.hiddenJobsCount();
    if (hiddenJobsCount === 0) {
      return null;
    }

    const action = this.state.showHiddenJobs ? "Hide" : "Show";
    const icon = this.state.showHiddenJobs ? "eye-strikethrough" : "eye";
    const suffix = hiddenJobsCount > 1 ? "jobs" : "job";

    return (
      <button
        className="btn dark-gray hover-black regular mt0 ml0 pt0 pl0"
        onClick={this.handleToggleBrokenStepsClick}
      >
        <div
          title={`${action} ${hiddenJobsCount} hidden ${suffix}`}
          data-toggle="tooltip"
          data-animation="false"
        >
          <Icon icon={icon} className="relative" style={{ top: -3 }} />
        </div>
      </button>
    );
  },

  hiddenJobsCount() {
    return this.props.build.jobs
      .filter((job) => (
        ((job.state === 'broken') && (job.type !== 'waiter')) || job.retriedInJobUuid
      )).length;
  },

  stepNodes() {
    if (this.props.build.jobs.length === 0) {
      return (
        <p className="text-danger" style={{ margin: '10px 0 5px' }}>
          There are no build steps for this pipeline. To add a step, go to your Pipeline Settings.
        </p>
      );
    }

    const jobs = this.state.showHiddenJobs
      ? this.props.build.jobs
      : this.props.build.jobs.filter(({ state, retriedInJobUuid }) => state !== 'broken' && !retriedInJobUuid);

    const renderedJobs = jobs.map((job) => this.pipelineStep(job));

    // If the build has hidden jobs (such as on the project show / build index
    // page, we want to add a "..." build step that links to the build so you
    // can see all the steps)
    if (this.props.build.jobs.length !== this.props.build.jobsCount) {
      renderedJobs.push(
        <a
          key={`${this.props.build.id}-more-jobs`}
          href={this.props.build.path}
          className="build-pipeline-job truncate align-middle"
        >
          ...
        </a>
      );
    }

    return renderedJobs;
  },

  pipelineStep(job) {
    const stepClassName = this.stepClassName(job);

    const { BuildHeaderPipelineManualStepComponent, BuildHeaderPipelineTriggerStepComponent } = Buildkite;

    if (job.type === 'script') {
      if (job.state === 'broken') {
        return (
          <div
            key={job.id}
            data-toggle="tooltip"
            title={job.tooltip}
            className={stepClassName}
            style={{ maxWidth: '15em' }}
          >
            {this.jobName(job)}
          </div>
        );
      }

      const href = `${this.props.build.path}#${job.id}`;

      let retriedIcon;
      if (job.retriedInJobUuid) {
        retriedIcon = (
          <Icon
            icon="retry"
            style={{ height: 12, width: 12, top: -2, marginRight: 5 }}
            className="relative"
          />
        );
      }

      return (
        <a
          key={job.id}
          href={href}
          onClick={this.handleScriptJobClick(job)}
          className={stepClassName}
          style={{ maxWidth: '15em' }}
        >
          {retriedIcon}
          {this.jobName(job)}
        </a>
      );
    } else if (job.type === 'waiter') {
      if (job.continueOnFailure) {
        return (
          <div
            key={job.id}
            className={`${stepClassName} dark-gray relative`}
            title="Wait for all previous steps to finish including failures"
          >
            <i
              className="fa fa-times absolute"
              style={{ fontSize: 12, top: 3, right: 3 }}
            />
            <Icon icon="chevron-right" style={{ height: 15, width: 15 }} />
          </div>
        );
      }

      return (
        <div
          key={job.id}
          className={`${stepClassName} dark-gray`}
          title="Wait for all previous steps to pass"
        >
          <Icon icon="chevron-right" style={{ height: 15, width: 15 }} />
        </div>
      );
    } else if (job.type === 'manual') {
      return (
        <BuildHeaderPipelineManualStepComponent
          key={job.id}
          build={this.props.build}
          job={job}
          stepClassName={stepClassName}
        />
      );
    } else if (job.type === 'trigger') {
      return (
        <BuildHeaderPipelineTriggerStepComponent
          key={job.id}
          build={this.props.build}
          job={job}
          stepClassName={stepClassName}
        />
      );
    }

    return (
      <div key={job.id} className={stepClassName}>
        {job.type}
      </div>
    );
  },

  stepClassName(job) {
    const state = job.state === 'finished' && (job.type === 'script' || job.type === 'trigger')
      ? (
        job.passed
          ? 'passed'
          : 'failed'
      )
      : job.state;

    return [
      'build-pipeline-job',
      `build-pipeline-job-${job.type.replace(/_/g, '-')}`,
      `build-pipeline-state-${state}`,
      'truncate',
      'align-middle'
    ].join(' ');
  },

  handleScriptJobClick(job) {
    return function(evt) {
      // return if the user did a middle-click, right-click, or used a modifier
      // key (like ctrl-click, meta-click, shift-click, etc.)
      if ((evt.button !== 0) || evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey) {
        return;
      }

      evt.preventDefault();

      Buildkite.dispatcher.emit("job:toggle", { job, source: "BUILD_HEADER" });
    };
  },

  jobName(job) {
    if (job.name) {
      return <Emojify text={job.name} />;
    }

    return (
      <span className="monospace" style={{ fontSize: '0.9em' }}>
        {jobCommandOneliner(job.command)}
      </span>
    );
  },

  handleToggleBrokenStepsClick(evt) {
    evt.preventDefault();
    evt.target.blur();
    return this.setState({ showHiddenJobs: !this.state.showHiddenJobs });
  }
});

export default BuildHeaderPipelineComponent;

