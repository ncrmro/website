import AboutRoute from "@routes/About";
import PageLayout from "@components/PageLayout";
import { JobDocument } from "@utils/documents";
import { GetStaticProps } from "next";
import React from "react";

const About: React.FC<{ jobs: JobDocument[] }> = (props) => (
  <PageLayout title="About">
    <AboutRoute jobs={props.jobs} />
  </PageLayout>
);

export const getStaticProps: GetStaticProps = async (context) => {
  const { getDocuments, DocumentType } = require("@utils/documents");
  const jobs: JobDocument = getDocuments(DocumentType.jobs).reverse();
  return {
    props: {
      jobs,
    },
  };
};

export default About;
