import History from "@components/History";
import PageLayout from "@components/PageLayout";
import { JobDocument } from "@utils/documents";
import { GetStaticProps } from "next";
import Head from "next/head";
import React from "react";

const Home: React.FC<{ jobs: JobDocument[] }> = (props) => (
  <PageLayout>
    <Head>
      <title>About</title>
    </Head>

    <div className="space-y-4 sm:grid sm:grid-cols-3 sm:items-start sm:gap-6 sm:space-y-0">
      <div className="aspect-w-3 aspect-h-2 sm:aspect-w-3 sm:aspect-h-4 flex justify-center">
        <img
          src="/images/avatar.jpg"
          alt="Picture of the author"
          // width={500}
          // height={500}
          className="object-cover shadow-lg rounded-lg max-h-72"
        />
      </div>
      <div className="sm:col-span-2">
        <div className="space-y-4">
          <div className="text-lg leading-6 font-medium space-y-1">
            <h3>Nicholas Romero</h3>
            <p className="text-indigo-600">Software Engineer</p>
          </div>
          <div className="text-lg">
            <p className="text-gray-500">
              Howdy, I'm Nic. I live in Houston. PyCon India 2017 Speaker. I
              enjoy dabling in music production and been known to dj here and
              there. Plants are Jazz and Animals my diggs.
            </p>
          </div>
        </div>
      </div>
    </div>
    <div className="flex justify-center pt-12">
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

export default Home;
