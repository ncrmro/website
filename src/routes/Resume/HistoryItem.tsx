import MarkdownRenderer from "@components/MarkdownRenderer";
import { JobDocument } from "@utils/documents";
import TechUrls from "@utils/techUrls";
import React from "react";
import SmallBadge from "@components/SmallBadge";
import styles from "./HistoryItem.module.css";

const HistoryItem: React.FC<{
  job: JobDocument;
  pageBreak: boolean;
}> = ({ job, ...props }) => {
  return (
    <div className={styles.root}>
      <img src={job.favicon} />
      <div>
        <div className="text-sm">{job.role}</div>
        <div className="text-sm text-gray-500">
          {job.url ? <a href={job.url}>{props.children}</a> : props.children}
        </div>{" "}
        <p className="mt-0.5 text-sm text-gray-500">
          {job.start} {job.end}
        </p>
      </div>
      <div className="mt-2 text-sm text-gray-700">
        <MarkdownRenderer content={job.body} />
      </div>
      <div className={styles.badges}>
        {job.tech?.map((tech) => (
          <SmallBadge key={tech} children={tech} link={TechUrls[tech]} />
        ))}
      </div>
    </div>
  );
};

export default HistoryItem;
