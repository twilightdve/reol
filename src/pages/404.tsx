import * as React from "react";
import { HeadFC } from "gatsby";

const NotFoundPage = () => {
  return (
    <main>
      <h1>404 not found</h1>
    </main>
  );
};

export default NotFoundPage;

export const Head: HeadFC = () => <title>404 Not found</title>;
