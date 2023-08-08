import JobDocument from "@/app/resume/JobItem";
import { parseJobFiles } from "@/app/resume/utils";
import React from "react";
import Image from "next/image";

export default async function AboutPage(props: any) {
  const jobFiles = await parseJobFiles();
  const jobs = jobFiles.reverse().map((job) => <JobDocument job={job} />);
  return (
    <div className="flex flex-col md:flex-row md:max-w-4xl justify-center">
      <div className="">
        <Image
          src="/images/avatar.jpg"
          alt="Picture of the author"
          width={288}
          height={288}
          // layout="responsive"
          className="m-2"
        />

        <div>
          <h3>Nicholas Romero</h3>
          <p>
            Howdy, I'm Nic. I live in Houston. PyCon India 2017 Speaker. I enjoy
            dabling in music production and been known to dj here and there.
            Plants are Jazz and Animals my diggs.
          </p>
        </div>
      </div>
      <div className="">
        <ul className="flex flex-col gap-4">{jobs}</ul>
      </div>
    </div>
  );
}
