import MarkdownRenderer from "@components/MarkdownRenderer";
import { JobDocument } from "@utils/documents";
import TechUrls from "@utils/techUrls";
import React from "react";

const VerticalLine: React.FC = () => (
  <span
    className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
    aria-hidden="true"
  />
);

const SmallBadge: React.FC<{ link: string }> = (props) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
    <svg
      className="mr-1.5 h-2 w-2 text-indigo-400"
      fill="currentColor"
      viewBox="0 0 8 8"
    >
      <circle cx="4" cy="4" r="3" />
    </svg>
    <a href={props.link}>{props.children}</a>
  </span>
);
const HistoryTitle: React.FC<{ url?: string }> = (props) => (
  <div className="text-sm text-gray-500">
    {props.url ? <a href={props.url}>{props.children}</a> : props.children}
  </div>
);

const HistoryItem: React.FC<{
  job: JobDocument;
  verticalLine?: boolean;
  pageBreak: boolean;
}> = ({ job, ...props }) => {
  let style, className;
  if (props.pageBreak) {
    style = { "page-break-before": "always" };
    className = "print:pt-6";
  }
  return (
    <li className={className} style={style}>
      <div className="relative pb-8">
        {props.verticalLine && <VerticalLine />}
        <div className="relative flex items-start space-x-3">
          <div className="relative">
            <img
              className="h-10 w-10 bg-white rounded-full flex items-center justify-center ring-8 ring-white"
              src={job.favicon}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div>
              <div className="text-sm">{job.role}</div>
              <HistoryTitle url={job.url}>{job.title}</HistoryTitle>
              <p className="mt-0.5 text-sm text-gray-500">
                {job.start} {job.end}
              </p>
            </div>
            <div className="mt-2 text-sm text-gray-700">
              <MarkdownRenderer content={job.body} />
            </div>
            <div className="flex flex-wrap gap-1 pt-3">
              {job.tech?.map((tech) => (
                <SmallBadge key={tech} children={tech} link={TechUrls[tech]} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export default HistoryItem;
