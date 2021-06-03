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

const HistoryItem: React.FC<{ job: JobDocument; verticalLine?: boolean }> = ({
  job,
  ...props
}) => (
  <li>
    <div className="relative pb-8">
      {props.verticalLine && <VerticalLine />}
      <div className="relative flex items-start space-x-3">
        <div className="relative">
          <img
            className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white"
            src={job.favicon}
            alt=""
          />
        </div>
        <div className="min-w-0 flex-1">
          <div>
            <div className="text-sm">
              {job.url ? <a href={job.url}> {job.title}</a> : job.title}
            </div>
            <p className="mt-0.5 text-sm text-gray-500">
              {job.start}-{job.end}
            </p>
          </div>
          <div className="mt-2 text-sm text-gray-700">
            <p>{job.body}</p>
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

const HistorySmallItem: React.FC = () => (
  <li>
    <div className="relative pb-8">
      <VerticalLine />
      <div className="relative flex items-start space-x-3">
        <div>
          <div className="relative px-1">
            <div className="h-8 w-8 bg-gray-100 rounded-full ring-8 ring-white flex items-center justify-center">
              <svg
                className="h-5 w-5 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1 py-0">
          <div className="text-sm leading-8 text-gray-500">
            <span className="mr-0.5">
              <a href="#" className="font-medium text-gray-900">
                Hilary Mahy
              </a>
              added tags
            </span>
            <span className="mr-0.5">
              <a
                href="#"
                className="relative inline-flex items-center rounded-full border border-gray-300 px-3 py-0.5 text-sm"
              >
                <span className="absolute flex-shrink-0 flex items-center justify-center">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-rose-500"
                    aria-hidden="true"
                  />
                </span>
                <span className="ml-3.5 font-medium text-gray-900">Bug</span>
              </a>

              <a
                href="#"
                className="relative inline-flex items-center rounded-full border border-gray-300 px-3 py-0.5 text-sm"
              >
                <span className="absolute flex-shrink-0 flex items-center justify-center">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-indigo-500"
                    aria-hidden="true"
                  >
                    /
                  </span>
                </span>
                <span className="ml-3.5 font-medium text-gray-900">
                  Accessibility
                </span>
              </a>
            </span>
            <span className="whitespace-nowrap">6h ago</span>
          </div>
        </div>
      </div>
    </div>
  </li>
);

const History: React.FC<{ jobs: JobDocument[] }> = (props) => (
  <div className="flow-root">
    <ul className="-mb-8">
      {props.jobs.map((item, idx) => (
        <HistoryItem
          job={item}
          // Show vertical line on all but last item
          verticalLine={props.jobs.length !== idx + 1}
        />
      ))}
    </ul>
  </div>
);

export default History;
