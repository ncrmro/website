import History from "@components/History";
import PageLayout from "@components/PageLayout";
import { JobDocument } from "@utils/documents";
import { GetStaticProps } from "next";
import Head from "next/head";
import React from "react";

const Resume: React.FC<{ jobs: JobDocument[] }> = (props) => (
  <PageLayout>
    <Head>
      <title>Resume</title>
    </Head>
    <div className="pt-12">
      <History jobs={props.jobs} />
    </div>
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

export default Resume;
