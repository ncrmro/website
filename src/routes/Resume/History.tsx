import HistoryItem from "./HistoryItem";
import { JobDocument } from "@utils/documents";
import React from "react";
import styles from "./Resume.module.css";

const History: React.FC<{ jobs: JobDocument[]; className?: string }> = (
  props
) => (
  <ul className={styles.history}>
    {props.jobs.map((item, idx) => (
      <li key={item.title} className={styles.historyItem}>
        <HistoryItem
          key={item.title}
          job={item}
          pageBreak={[3].includes(idx)}
        />
      </li>
    ))}
  </ul>
);

export default History;
