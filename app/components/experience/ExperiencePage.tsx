"use client";

import RecordCrate from "./RecordCrate";
import { releases, type ReleaseId } from "./releases";
import { stories } from "./stories";
import type { Collection } from "./types";

const experience: Collection<ReleaseId> = {
  heading: "Experience",
  word: "EXPERIENCE",
  releases,
  stories,
  sides: { A: "Projects", B: "Internships" },
  fit: { default: 0.96, pasqua: 0.72, skycloud: 0.8 },
  hashAliases: { borromeo: "bds" },
};

export default function ExperiencePage() {
  return <RecordCrate collection={experience} />;
}
