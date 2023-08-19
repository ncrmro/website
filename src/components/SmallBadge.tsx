import React from "react";
import styles from "./SmallBadge.module.css";

const SmallBadge: React.FC<{ children: any }> = (props) => (
  <span className={styles.root}>
    <svg viewBox="0 0 8 8">
      <circle cx="4" cy="4" r="3" />
    </svg>
    {props.children}
  </span>
);

export default SmallBadge;
