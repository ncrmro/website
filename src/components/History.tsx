import HistoryItem from "@components/HistoryItem";
import { JobDocument } from "@utils/documents";
import React from "react";

const History: React.FC<{ jobs: JobDocument[]; className?: string }> = (
  props
) => (
  <ul className={props.className && props.className}>
    {props.jobs.map((item, idx) => (
      <HistoryItem
        key={item.title}
        job={item}
        // Show vertical line on all but last item
        verticalLine={props.jobs.length !== idx + 1}
        pageBreak={[3].includes(idx)}
      />
    ))}
  </ul>
);

export default History;
