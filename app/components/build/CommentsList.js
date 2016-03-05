import React from 'react';
import Relay from 'react-relay';

const CommentsList = () =>
  <span>Comments</span>

export default Relay.createContainer(CommentsList, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
         user {
           name
         }
      }
    `,
    build: () => Relay.QL`
      fragment on Build {
         id
      }
    `
  }
});
