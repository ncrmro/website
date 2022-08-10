import MarkdownRenderer from "../../components/MarkdownRenderer";
import SmallBadge from "../../components/SmallBadge";
import TechUrls from "../../utils/techUrls";
import React from "react";
import { JobDocument } from '../../types'
import styles from "./History.module.css";

const History: React.FC<{ jobs: JobDocument[]; className?: string }> = (
  props
) => (
  <ul className={styles.historyList}>
    {props.jobs.map((job, idx) => (
      <li key={job.title} className={styles.historyItem}>
        <img
          className={styles.img}
          // @ts-ignore
          src={job.favicon}
          alt={`${job.title} Icon`}
        />
        <div className={styles.historyItemTitle}>
          <div>
            <h2>
              {
                // @ts-ignore
                job.role
              }
            </h2>
            <h3>
              {
                // @ts-ignore
                job.url ? <a href={job.url}>{job.title}</a> : job.title
              }
            </h3>
          </div>
          <div>
            {job.start} {job.end}
          </div>
        </div>
        <div>
          <MarkdownRenderer {...job} />
        </div>
        <div className={styles.badges}>
          {
            // @ts-ignore
            job.tech?.split(',').map((tech) => (
              <SmallBadge key={tech} children={tech} link={TechUrls[tech]} />
            ))
          }
        </div>
      </li>
    ))}
  </ul>
);

export default History;
