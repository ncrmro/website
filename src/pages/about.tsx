import PageLayout from "@components/PageLayout";
import AboutRoute from "@routes/About";
import { DocumentType, JobDocument } from "@utils/documents";
import { GetStaticProps } from "next";
import React from "react";

const About: React.FC<{ jobs: JobDocument[] }> = (props) => (
  <PageLayout title="About">
    <AboutRoute jobs={props.jobs} />
  </PageLayout>
);

export const getStaticProps: GetStaticProps = async (context) => {
  const jobs = await import("@utils/documents").then((p) =>
    p.getDocuments(DocumentType.jobs)
  );
  return {
    props: {
      jobs,
    },
  };
};

export default About;
