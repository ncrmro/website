import React from "react";
import { JobDocument } from "@utils/documents";
import History from "@routes/Resume/History";
import styles from "./About.module.css";
import Image from "next/image";

const AboutRoute: React.FC<{ jobs: JobDocument[] }> = (props) => {
  return (
    <div className={styles.root}>
      <div className={styles.info}>
        <Image
          src="/images/avatar.jpg"
          alt="Picture of the author"
          width={288}
          height={288}
          layout="responsive"
          className={styles.img}
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
      <div className={styles.history}>
        <History jobs={props.jobs} />
      </div>
    </div>
  );
};

export default AboutRoute;
