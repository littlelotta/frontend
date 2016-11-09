import React from 'react';
import Relay from 'react-relay';
import classNames from 'classnames';

import Emojify from '../../shared/Emojify';
import Panel from '../../shared/Panel';

import 'highlight.js/styles/atom-one-light.css';

// Grab guides from the file system (at ../../docs)
const GUIDES = ((guideRequire) =>
  guideRequire.keys().map((guidePath) =>
    guideRequire(guidePath).default
  )
)(require.context(
  '../../docs',
  true,
  /^\.\/[^\/]+(?:\/index)?\.[^\/]*$/ // matches any file in ../../docs, or any index file in a subdirectory of ../../docs
));

class QuickStart extends React.Component {
  static propTypes = {
    organization: React.PropTypes.shape({
      id: React.PropTypes.string.isRequired,
      name: React.PropTypes.string.isRequired,
      slug: React.PropTypes.string.isRequired,
      agentTokens: React.PropTypes.shape({
        edges: React.PropTypes.array.isRequired
      })
    }).isRequired,
    viewer: React.PropTypes.shape({
      apiAccessTokens: React.PropTypes.shape({
        edges: React.PropTypes.array.isRequired
      })
    }),
    relay: React.PropTypes.object.isRequired
  };

  state = {
    selectedGuide: null
  };

  componentDidMount() {
    this.props.relay.setVariables({
      isMounted: true,
      organizationId: this.props.organization.slug
    });
  }

  handleSelectedGuideChange(selectedGuide, evt) {
    evt.preventDefault();
    const newState = { selectedGuide: null };

    if (selectedGuide !== this.state.selectedGuide) {
      newState.selectedGuide = selectedGuide;
    }

    this.setState(newState);
  }

  renderGuideButtons() {
    return (
      <div className="center" style={{ margin: -5 }}>
        {
          GUIDES.map((Guide, index) => (
            <a
              key={index}
              href="#"
              className={classNames(
                'inline-block blue hover-navy text-decoration-none border rounded m1 p1',
                {
                  'border-white': index !== this.state.selectedGuide,
                  'border-gray': index === this.state.selectedGuide
                }
              )}
              onClick={this.handleSelectedGuideChange.bind(this, index)} // eslint-disable-line react/jsx-no-bind
            >
              <Emojify
                className="block mt1"
                style={{ fontSize: '1.15em' }}
                text={Guide.emoji || `:${Guide.title.toLowerCase()}:`}
              />
              {Guide.title}
            </a>
          ))
        }
      </div>
    );
  }

  renderGuide() {
    const GuideToRender = GUIDES[this.state.selectedGuide];
    const { id, name, slug, agentTokens: { edges: agentTokens } = {} } = this.props.organization;
    const { apiAccessTokens: { edges: apiAccessTokens } = {} } = this.props.viewer;

    if (GuideToRender) {
      return (
        <GuideToRender
          className="border border-gray mt3"
          style={{
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: 'none'
          }}
          elementProps={{
            'code': {
              style: { fontFamily: 'Monaco, Consolas, monospace', fontSize: '.9em' }
            },
            'a': {
              className: 'blue hover-navy text-decoration-none hover-underline'
            },
            'pre': {
              className: 'border border-gray rounded bg-silver overflow-auto p2 monospace'
            }
          }}
          token={
            agentTokens
              && agentTokens.length
              && agentTokens[0].node.token
          }
          apiAccessTokens={apiAccessTokens ? apiAccessTokens.map((edge) => edge.node) : []}
          organization={{ id, name, slug }}
        />
      );
    }
  }

  render() {
    return (
      <Panel className="mb3">
        <Panel.Header className="center">Agent Quick Start Guides</Panel.Header>
        <Panel.Section>
          {this.renderGuideButtons()}
          {this.renderGuide()}
        </Panel.Section>
      </Panel>
    );
  }
}

export default Relay.createContainer(QuickStart, {
  initialVariables: {
    isMounted: false,
    organizationId: null
  },

  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        apiAccessTokens(
          first: 10,
          template: [ API_ACCESS_TOKEN_TEMPLATE_ELASTIC_CI_AWS ],
          organizations: [ $organizationId ]
        ) @include(if: $isMounted) {
          edges {
            node {
              description
              uuid
              token
            }
          }
        }
      }
    `,
    organization: () => Relay.QL`
      fragment on Organization {
        id
        name
        slug
        agentTokens(first: 1, revoked: false) @include(if: $isMounted) {
          edges {
            node {
              token
            }
          }
        }
      }
    `
  }
});
