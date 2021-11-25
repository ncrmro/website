import React from "react";
import remarkFrontmatter from "remark-frontmatter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import slug from "rehype-slug";
import remarkToc from "remark-toc";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeReact from "rehype-react";

const processor = unified()
  .use(remarkParse)
  .use(slug)
  .use(remarkToc)
  .use(remarkRehype)
  .use(rehypeHighlight)
  .use(remarkFrontmatter, ["yaml"])
  .use(rehypeReact, { createElement: React.createElement });

const MarkdownRenderer: React.FC<{ mediaPath?: string; content: string }> = (
  props
) => {
  const content = processor.processSync(props.content);
  console.log("render");
  return (
    <>
      <div>{content.result}</div>
    </>
  );
};

// (
//
//   // <Remark
//   //   rehypeReactOptions={{
//   //     components: {
//   //       pre: (props) => {
//   //         const className: string = props.children[0].props?.className;
//   //         if (className && className.includes("language-")) {
//   //           let language = className.replace("language-", "");
//   //           const code = props.children[0].props.children[0];
//   //           if (language === "typescript") {
//   //             language = "jsx";
//   //           }
//   //
//   //           return <CodeBlock code={code} language={language as Language} />;
//   //         }
//   //
//   //         return <pre>{props.children}</pre>;
//   //       },
//   //       h2: (props) => (
//   //         <h2
//   //           id={slugify(
//   //             typeof props.children[0] === "string"
//   //               ? props.children[0]
//   //               : props.children[0].props.children[0]
//   //           )}
//   //         >
//   //           {props.children}
//   //         </h2>
//   //       ),
//   //       h3: (props) => (
//   //         <h3
//   //           id={slugify(
//   //             typeof props.children[0] === "string"
//   //               ? props.children[0]
//   //               : props.children[0].props.children[0]
//   //           )}
//   //         >
//   //           {props.children}
//   //         </h3>
//   //       ),
//   //       img: (props) => {
//   //         console.log("SRC", props.src);
//   //         return (
//   //           <img
//   //             src={`${mediaPath}/${props.src as string}`}
//   //             alt={props.alt as string}
//   //             className={styles.link}
//   //           />
//   //         );
//   //       },
//   //       a: (props: { href; children }) => (
//   //         <a href={props.href}>{props.children}</a>
//   //       ),
//   //       p: (props) => <p>{props.children}</p>,
//   //       ul: (props) => <ul className={styles.list}>{props.children}</ul>,
//   //     },
//   //   }}
//   // >
//   //   {props.content}
//   // </Remark>
// );

export default MarkdownRenderer;
