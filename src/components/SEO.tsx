import Head from "next/head";

export interface SEOProps {
  description?: string;
  title?: string;
  image?: string;
  path?: string;
  article?: boolean;
  articleTags?: string[];
  articleSection?: string;
  articleAuthorUrl?: string;
}

const SEO: React.FC<SEOProps> = ({
  description,
  title,
  image,
  path,
  article,
  articleTags,
  articleSection,
  articleAuthorUrl,
}) => {
  const {
    originalTitle,
    originalDescription,
    siteName,
    social: { twitter },
    currentURL,
    originalImage,
  } = {
    originalTitle: "NCRMRO",
    originalDescription: "Personal Site of Nicholas Romero",
    siteName: "",
    social: { twitter: "ncrmro" },
    currentURL: "https://ncrmro.com",
    originalImage: "",
  };
  return (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      <title>{title ?? originalTitle}</title>
      <meta
        name="description"
        content={`${description ? description : originalDescription}`}
      />
      <meta
        name="image"
        content={`${image ? image : originalImage}`}
        key="ogtitle"
      />
      {article ? (
        <>
          <meta property="og:type" content="article" key="ogtype" />
          {articleAuthorUrl && (
            <meta property="article:author" content={articleAuthorUrl} />
          )}
          {articleSection && (
            <meta property="article:section" content={articleSection} />
          )}
          {articleTags &&
            articleTags.map((tag) => (
              <meta property="article:tag" content={tag} />
            ))}
        </>
      ) : (
        <meta property="og:type" content="website" key="ogtype" />
      )}
      <meta
        property="og:title"
        content={`${title ? title : originalTitle}`}
        key="ogtitle"
      />
      <meta
        property="og:description"
        content={`${description ? description : originalDescription}`}
        key="ogdesc"
      />
      <meta
        property="twitter:card"
        content="summary_large_image"
        key="twcard"
      />
      <meta name="twitter:creator" content={twitter} key="twhandle" />
      <meta
        name="twitter:title"
        content={`${title ? title : originalTitle}`}
        key="twtitle"
      />
      <meta
        name="twitter:description"
        content={`${description ? description : originalDescription}`}
        key="twdescription"
      />
      <meta
        name="twitter:image"
        content={`${image ? image : originalImage}`}
        key="twimage"
      />
      <meta
        property="og:url"
        content={path ? currentURL + path : currentURL}
        key="ogurl"
      />
      <meta
        property="og:image"
        content={`${image ? image : originalImage}`}
        key="ogimage"
      />
      <meta property="og:site_name" content={siteName} key="ogsitename" />
    </Head>
  );
};

export default SEO;
