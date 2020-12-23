import dracula from "prism-react-renderer/themes/dracula";
import Highlight, { defaultProps, Language } from "prism-react-renderer";
import React from "react";

interface Props {
  code: string;
  language: Language;
}
const CodeBlock: React.FC<Props> = (props) => (
  <Highlight
    {...defaultProps}
    theme={dracula}
    code={props.code}
    language={props.language}
  >
    {({ className, style, tokens, getLineProps, getTokenProps }) => (
      <pre
        className={`${className} p-4 my-2 w-screen overflow-x-scroll`}
        style={{ ...style }}
      >
        {/*<code lang={props.language}>*/}
        {tokens.map((line, i) => (
          <div {...getLineProps({ line, key: i })}>
            {line.map((token, key) => (
              <span {...getTokenProps({ token, key })} />
            ))}
          </div>
        ))}
        {/*</code>*/}
      </pre>
    )}
  </Highlight>
);

export default CodeBlock;
