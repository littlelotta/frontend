// @flow
/* eslint-disable react/prop-types */

import React from "react";
import Loadable from "react-loadable";

import Spinner from "../../shared/Spinner";
import { fetchAndBuildGraphQLSchema, getGraphQLSchema } from "./schema";

type Props = {
  value?: string,
  onChange: () => mixed
};

type LoadedProps = {
  CodeMirror: () => mixed
};

type ReactLoadableLoadingProps = {
  error?: string,
  pastDelay?: boolean
};

const AUTO_COMPLETE_AFTER_KEY = /^[a-zA-Z0-9_@(]$/;

class GraphQLExplorerConsoleEditor extends React.PureComponent<Props, LoadedProps> {
  componentDidMount() {
    const schema = getGraphQLSchema();

    this.editorCodeMirror = this.props.CodeMirror.fromTextArea(
      this.textAreaElement,
      {
        lineNumbers: true,
        tabSize: 2,
        mode: 'graphql',
        keyMap: 'sublime',
        autoCloseBrackets: true,
        matchBrackets: true,
        showCursorWhenSelecting: true,
        viewportMargin: Infinity,
        gutters: ['CodeMirror-linenumbers'],
        theme: "graphql",
        extraKeys: {
          'Cmd-Space': () => this.editorCodeMirror.showHint({ completeSingle: true }),
          'Ctrl-Space': () => this.editorCodeMirror.showHint({ completeSingle: true }),
          'Alt-Space': () => this.editorCodeMirror.showHint({ completeSingle: true }),
          'Shift-Space': () => this.editorCodeMirror.showHint({ completeSingle: true }),
          'Cmd-Enter': () => {
            this.executeCurrentQuery();
          },
          'Ctrl-Enter': () => {
            this.executeCurrentQuery();
          },
          // Persistent search box in Query Editor
          'Cmd-F': 'findPersistent',
          'Ctrl-F': 'findPersistent',
          // Editor improvements
          'Ctrl-Left': 'goSubwordLeft',
          'Ctrl-Right': 'goSubwordRight',
          'Alt-Left': 'goGroupLeft',
          'Alt-Right': 'goGroupRight'
        },
        lint: {
          schema: schema
        },
        hintOptions: {
          schema: schema,
          closeOnUnfocus: false,
          completeSingle: false
        }
      }
    );

    this.editorCodeMirror.on("change", this.onEditorChange);
    this.editorCodeMirror.on("keyup", this.onEditorKeyUp);
  }

  componentWillUnmount() {
    if (this.editorCodeMirror) {
      this.editorCodeMirror.off("change", this.onEditorChange);
      this.editorCodeMirror.off("keyup", this.onEditorKeyUp);
      this.editorCodeMirror = null;
    }
  }

  render() {
    return (
      <div>
        <textarea
          defaultValue={this.props.value}
          ref={(input) => this.textAreaElement = input}
        />
      </div>
    );
  }

  onEditorChange = () => {
    this.props.onChange(this.editorCodeMirror.getValue());
  };

  onEditorKeyUp = () => {
    if (AUTO_COMPLETE_AFTER_KEY.test(event.key)) {
      this.editorCodeMirror.execCommand('autocomplete');
    }
  };
}

// Instead of exporting the editor directly, we'll export a `Loadable`
// Component that will allow us to load in dependencies and render the editor
// until then.
export default Loadable.Map({
  loader: {
    CodeMirror: () => (
      import('./codemirror').then((module) => (
        // Add a "zero" delay after the module has loaded, to allow their
        // styles to take effect.
        new Promise((resolve) => {
          setTimeout(() => resolve(module.default), 0);
        })
      ))
    ),
    // Load in the GraphQL schema at the same time
    graaphQLSchema: () => {
      return fetchAndBuildGraphQLSchema();
    }
  },

  loading(props: ReactLoadableLoadingProps) {
    if (props.error) {
      return (
        <div>{props.error}</div>
      );
    } else if (props.pastDelay) {
      return (
        <div className="flex items-center justify-center" style={{ height: 500 }}>
          <Spinner /> Loading GraphQL Editor…
        </div>
      );
    }

    return null;
  },

  render(loaded: LoadedProps, props: Props) {
    return (
      <GraphQLExplorerConsoleEditor
        CodeMirror={loaded.CodeMirror}
        graaphQLSchema={loaded.graaphQLSchema}
        value={props.value}
        onChange={props.onChange}
      />
    );
  }
});
