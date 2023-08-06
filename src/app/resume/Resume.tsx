import Link from "next/link";
import routes from "@router";
import History from "./History";
import React from "react";
import styles from "./Resume.module.css";

interface InfoProps {
  contactInfo: { phoneNumber: string; email: string };
}

const Info: React.FC<InfoProps> = (props) => (
  <div className={styles.info}>
    <Link {...routes.about}>
      <a>Nicholas Romero</a>
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

const Resume: React.FC<{
  jobs;
  contactInfo: { phoneNumber: string; email: string };
}> = (props) => (
  <div className={styles.root}>
    <Info contactInfo={props.contactInfo} />
    <History jobs={props.jobs} />
  </div>
);

export default Resume;
