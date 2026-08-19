"use client";

import BookshelfPage from "./bookshelf/BookshelfPage";
import { projectBooks } from "./bookshelf/project-books";

export default function ProjectsPage() {
  return (
    <BookshelfPage
      theme="terminal"
      kicker="~/filippo/projects $ ls -la"
      heading="Projects"
      intro="Three products founded and built solo. Pull one off the shelf."
      shelfLabel="Projects bookshelf"
      books={projectBooks}
    />
  );
}
