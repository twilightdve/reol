import * as React from "react";
import { HeadFC } from "gatsby";
import SEO from "../components/SEO";

const NotFoundPage = () => {
  return (
    <main>
      <h1>404 not found</h1>
    </main>
  );
};

export default NotFoundPage;

export const Head: HeadFC = () => (
  <SEO
    title="404 Not Found"
    description="お探しのページが見つかりませんでした。"
    path="/404/"
  />
);
