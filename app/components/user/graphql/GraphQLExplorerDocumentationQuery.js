import React from "react";

import RootField from "./GraphQLExplorerDocumentation/RootField";
import { getGraphQLSchema } from "./schema";

class GraphQLExplorerDocumentationQuery extends React.PureComponent {
  render() {
    const schema = getGraphQLSchema();
    const field = schema.getQueryType().getFields()[this.props.params.field];

    console.log(field);

    return (
      <div>
        <h2>Field: <RootField name={`query.${this.props.params.field}`} /></h2>
      </div>
    );
  }
}

export default GraphQLExplorerDocumentationQuery;
