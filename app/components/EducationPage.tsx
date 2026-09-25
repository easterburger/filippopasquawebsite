"use client";

import { records, type EducationId } from "./education/records";
import { stories } from "./education/stories";
import RecordCrate from "./experience/RecordCrate";
import type { Collection } from "./experience/types";

import "./education/education.css";

// Education is a record crate, like Experience: school on one side, summer
// school and service on the other.
const education: Collection<EducationId> = {
  heading: "Education",
  word: "EDUCATION",
  releases: records,
  stories,
  sides: { A: "At school", B: "Away from school" },
  fit: { default: 0.96 },
};

export default function EducationPage() {
  return <RecordCrate collection={education} />;
}
