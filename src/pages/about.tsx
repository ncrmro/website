import History from "@components/History";
import PageLayout from "@components/PageLayout";
import Head from "next/head";
import React from "react";
import Image from "next/image";

function Home(props) {
  return (
    <PageLayout>
      <Head>
        <title>About</title>
      </Head>

      <div className="space-y-4 sm:grid sm:grid-cols-3 sm:items-start sm:gap-6 sm:space-y-0 pt-10">
        <div className="aspect-w-3 aspect-h-2 sm:aspect-w-3 sm:aspect-h-4">
          <Image
            src="/images/avatar.jpg"
            alt="Picture of the author"
            width={500}
            height={500}
            className="object-cover shadow-lg rounded-lg"
          />
        </div>
        <div className="sm:col-span-2">
          <div className="space-y-4">
            <div className="text-lg leading-6 font-medium space-y-1">
              <h3>Nicholas Romero</h3>
              <p className="text-indigo-600">SR Software Engineer</p>
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
      {/*<History />*/}
    </PageLayout>
  );
}

export default Home;
