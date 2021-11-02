import MarkdownRenderer from "@components/MarkdownRenderer";
import SmallBadge from "@components/SmallBadge";
import TechUrls from "@utils/techUrls";
import { JobDocument } from "@utils/documents";
import React from "react";
import styles from "./History.module.css";

// if (props.pageBreak) {
//   style = { "page-break-before": "always" };
//   className = "print:pt-6";
// }

const History: React.FC<{ jobs: JobDocument[]; className?: string }> = (
  props
) => (
  <ul className={styles.historyList}>
    {props.jobs.map((job, idx) => (
      <li key={job.title} className={styles.historyItem}>
        <img
          className={styles.img}
          src={job.favicon}
          alt={`${job.title} Icon`}
        />
        <div className={styles.historyItemTitle}>
          <div>
            <h2>{job.role}</h2>
            <h3>{job.url ? <a href={job.url}>{job.title}</a> : job.title}</h3>
          </div>
          <div>
            {job.start} {job.end}
          </div>
        </div>
        <div>
          <MarkdownRenderer content={job.body} />
        </div>
        <div className={styles.badges}>
          {job.tech?.map((tech) => (
            <SmallBadge key={tech} children={tech} link={TechUrls[tech]} />
          ))}
        </div>
      </li>
    ))}
  </ul>
);

export default History;
