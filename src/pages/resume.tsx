import History from "@components/History";
import PageLayout from "@components/PageLayout";
import { JobDocument } from "@utils/documents";
import { GetStaticProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const Resume: React.FC<{ jobs: JobDocument[] }> = (props) => {
  const router = useRouter();
  const [contactInfo, setContactInfo] = useState();

  const loadContactInfo = async () => {
    const res = await fetch(
      `/api/contact-info?password=${router.query.password}`
    );
    const data = await res.json();
    setContactInfo(data);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      loadContactInfo();
    }
  }, [contactInfo === null]);

  return (
    <PageLayout
      title="Resume"
      description="The Resume of Nicholas Romero"
      path="/resume"
    >
      <div className="pt-12">
        <History jobs={props.jobs} />
      </div>
    </PageLayout>
  );
};

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
