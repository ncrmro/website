import PageLayout from "@components/PageLayout";
import { getDocuments } from "@quiescent/server";
import AboutRoute from "@routes/About";
import { JobDocument } from "@utils/documents";
import { GetStaticProps } from "next";
import React from "react";

const About: React.FC<{ jobs: JobDocument[] }> = (props) => (
  <PageLayout title="About">
    <AboutRoute jobs={props.jobs} />
  </PageLayout>
);

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: { jobs: await getDocuments("jobs", "dynamic") },
  };
};

export default About;
