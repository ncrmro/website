import PageLayout from "@components/PageLayout";
import Resume from "@routes/Resume";
import { DocumentType, JobDocument } from "@utils/documents";
import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const ResumePage: React.FC<{ jobs: JobDocument[] }> = (props) => {
  const router = useRouter();
  const [contactInfo, setContactInfo] = useState();

  const loadContactInfo = async (password) => {
    const res = await fetch(`/api/contact-info?password=${password}`);
    const data = await res.json();
    setContactInfo(data);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && router.query.password) {
      loadContactInfo(router.query.password);
    }
  }, [contactInfo === null, router.query.password]);

  return (
    <PageLayout
      title="Resume"
      description="The Resume of Nicholas Romero"
      path="/resume"
    >
      <Resume jobs={props.jobs} contactInfo={contactInfo} />
    </PageLayout>
  );
};

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

export default ResumePage;
