import CodeBlock from "@components/CodeBlock";
import slugify from "@utils/slugify";
import { Language } from "prism-react-renderer";
import React from "react";
import { Remark } from "react-remark";
import styles from "./MarkdownRenderer.module.css";

const MarkdownRenderer: React.FC<{ content: string }> = (props) => (
  <div className={styles.root}>
    <Remark
      rehypeReactOptions={{
        components: {
          pre: (props) => {
            const className: string = props.children[0].props?.className;
            if (className && className.includes("language-")) {
              let language = className.replace("language-", "");
              const code = props.children[0].props.children[0];
              if (language === "typescript") {
                language = "jsx";
              }

              return <CodeBlock code={code} language={language as Language} />;
            }

            return <pre>{props.children}</pre>;
          },
          h2: (props) => (
            <h2
              id={slugify(
                typeof props.children[0] === "string"
                  ? props.children[0]
                  : props.children[0].props.children[0]
              )}
              className="font-semibold text-2xl pt-4"
            >
              {props.children}
            </h2>
          ),
          h3: (props) => (
            <h3
              id={slugify(
                typeof props.children[0] === "string"
                  ? props.children[0]
                  : props.children[0].props.children[0]
              )}
              className="font-semibold text-xl  pt-4"
            >
              {props.children}
            </h3>
          ),
          img: (props) => (
            <img src={props.src as string} alt={props.alt as string} />
          ),
          a: (props: { href; children }) => (
            <a href={props.href}>{props.children}</a>
          ),
          p: (props) => <p>{props.children}</p>,
          ul: (props) => (
            <ul className="list-disc list-inside flex flex-col gap-1">
              {props.children}
            </ul>
          ),
        },
      }}
    >
      {props.content}
    </Remark>
  </div>
);

export default MarkdownRenderer;
