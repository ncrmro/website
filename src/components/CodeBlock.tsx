import Highlight, { defaultProps, Language } from "prism-react-renderer";
import React from "react";

interface Props {
  code: string;
  language: Language;
}
const CodeBlock: React.FC<Props> = (props) => (
  <Highlight {...defaultProps} code={props.code} language={props.language}>
    {({ className, style, tokens, getLineProps, getTokenProps }) => (
      <pre className={className} style={style}>
        {tokens.map((line, i) => (
          <div {...getLineProps({ line, key: i })}>
            {line.map((token, key) => (
              <span {...getTokenProps({ token, key })} />
            ))}
          </div>
        ))}
      </pre>
    )}
  </Highlight>
);

export default CodeBlock;
