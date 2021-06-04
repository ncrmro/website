import History from "@components/History";
import React from "react";

const Resume: React.FC<{
  jobs;
  contactInfo: { phoneNumber: string; email: string };
}> = (props) => (
  <div className="grid md:grid-cols-3 gap-4">
    <div className="md:col-span-1 flex flex-col">
      <div className="text-blue-700">Nicholas Romero</div>
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
      <p className="pt-4">
        Full-stack software engineer with experience architecting, deploying and
        supporting technical solutions. Including automation of tasks, quality
        assurance, uptime reliability and cloud migrations. Speaker at PyCon
        India and other community meetup.
      </p>
    </div>
    <History className="md:col-span-2" jobs={props.jobs} />
  </div>
);

export default Resume;
