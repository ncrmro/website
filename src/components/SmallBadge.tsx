import React from "react";
import styles from "./SmallBadge.module.css";

const SmallBadge: React.FC<{ link: string; children: any }> = (props) => (
  <span className={styles.root}>
    <svg viewBox="0 0 8 8">
      <circle cx="4" cy="4" r="3" />
    </svg>
    <a href={props.link}>{props.children}</a>
  </span>
);

export default SmallBadge;
