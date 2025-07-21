import JobDocument from "@/app/resume/JobItem";
import { parseJobFiles } from "@/app/resume/utils";
import Navbar from "@/components/Navbar";
import React from "react";
import Image from "next/image";

export default async function AboutPage(props: any) {
  const jobFiles = await parseJobFiles();
  const jobs = jobFiles
    .reverse()
    .map((job, index) => <JobDocument key={index} job={job} />);
  return (
    <main className="w-full flex flex-col items-center p-4">
      
    </main>
  );
}
