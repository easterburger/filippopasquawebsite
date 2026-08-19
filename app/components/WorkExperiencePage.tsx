"use client";

import BookshelfPage from "./bookshelf/BookshelfPage";
import { workBooks } from "./bookshelf/work-books";

export default function WorkExperiencePage() {
  return (
    <BookshelfPage
      theme="paper"
      kicker="the library · software internships"
      heading="Work Experience"
      intro="Two internships, bound and shelved. Pull one out and open it."
      shelfLabel="Work experience bookshelf"
      books={workBooks}
    />
  );
}
