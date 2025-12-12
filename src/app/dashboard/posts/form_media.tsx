import { default as NextImage } from "next/image";
import React, { useState } from "react";
import { PostType } from "../../posts/types";

export default function PostMedia(props: { post: PostType }) {
  const [files, setFiles] = useState([]);
  React.useEffect(() => {
    fetch(`/api/posts/uploads?postId=${props.post.id}`).then(async (res) => {
      const data = (await res.json()) as { files: string[] };
      setFiles(data.files as []);
    });
  }, [props.post.id]);
  return (
    <div>
      {files.map((file) => (
        <div key={file}>
          {file}
          <NextImage
            alt=""
            width={500}
            height={500}
            src={`https://r2.ncrmro.com/uploads/posts/${props.post.id}/${file}`}
          />
        </div>
      ))}
    </div>
  );
}
