import JobDocument from "@/app/resume/JobItem";
import { parseJobFiles } from "@/app/resume/utils";
import Link from "next/link";
import React from "react";

interface InfoProps {
  contactInfo?: { phoneNumber: string; email: string };
}

const Info: React.FC<InfoProps> = (props) => (
  <div className="flex flex-col">
    <Link href="/about" className="text-blue-700">
      Nicholas Romero
    </Link>
    <div>Houston, TX</div>
    {props.contactInfo && (
      <>
        <a href={`tel:${props.contactInfo.phoneNumber}`}>
          {props.contactInfo.phoneNumber}
        </a>
        <a href={`mailto: ${props.contactInfo.email}`}>
          {props.contactInfo.email}
        </a>
      </>
    )}
    <p>
      Full-stack software engineer with experience architecting, deploying and
      supporting technical solutions. Including automation of tasks, quality
      assurance, uptime reliability and cloud migrations. Speaker at PyCon India
      and other community meetups.
    </p>
  </div>
);

export default async function ResumePage() {
  const jobFiles = await parseJobFiles();
  const jobs = jobFiles.reverse().map((job) => <JobDocument job={job} />);
  return (
    <div className="flex flex-col items-center">
      <div className="max-w-3xl flex flex-col gap-4">
        <Info />
        <ul className="flex flex-col gap-4">{jobs}</ul>
      </div>
    </div>
  );
}
