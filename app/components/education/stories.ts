import type { Story } from "../experience/types";

import type { EducationId } from "./records";

// Stories for the Education records, written from the CV, the Oxford Royale
// project report and the Experience stories. Each highlight appears verbatim
// in its paragraph.

export const stories: Record<EducationId, Story> = {
  ib: {
    dek: "Two years, six subjects and a core, at the American School of Milan. One of the requirements turned into a product.",
    sections: [
      {
        label: "the programme",
        paragraphs: [
          {
            text: "I'm at the American School of Milan, working through the International Baccalaureate Diploma. It runs for two years, with six subjects plus a core that every candidate takes, and most of it is decided by exams at the very end.",
            highlight: "six subjects",
          },
          {
            text: "Three subjects are taken at higher level, with more hours and more depth. Mine are Physics, Computer Science and Economics. The other three are at standard level: Math Analysis and Approaches, English Language and Literature, and French ab initio.",
            highlight: "higher level",
          },
        ],
      },
      {
        label: "the heavy three",
        paragraphs: [
          {
            text: "Physics, Computer Science and Economics are the three I go deepest in, and they map neatly onto what I build: how things behave, how software runs, and what it all costs.",
            highlight: "what it all costs",
          },
          {
            text: "Physics also became something I pass on. Since 2025 I've tutored younger students in it, from the concepts to the problem-solving.",
            highlight: "tutored",
          },
          {
            text: "French is the opposite story. Ab initio means from the beginning: the course is built for students who start the language with nothing, which is exactly where I started.",
            highlight: "from the beginning",
          },
        ],
      },
      {
        label: "the core",
        paragraphs: [
          {
            text: "Around the six subjects sits the core. Theory of Knowledge asks how we know what we claim to know. The Extended Essay is independent research of up to 4,000 words. CAS stands for Creativity, Activity and Service.",
            highlight: "4,000 words",
          },
          {
            text: "My CAS project didn't stop when it was done. It became Zayno, the AI workspace for students in my Experience crate, and its first beta went out to my own school's IB cohort in finals season.",
            highlight: "Zayno",
          },
          {
            text: "The rest of school life is on the other records in this crate: two varsity teams, two clubs, the tutoring, and a week spent building in the Dominican Republic.",
            highlight: "varsity",
          },
        ],
      },
    ],
    quote: "My CAS project didn't stop when it was done. It became Zayno.",
    specs: [
      { label: "School", value: "American School of Milan, since 2024" },
      { label: "Programme", value: "IB Diploma" },
      { label: "Higher level", value: "Physics, Computer Science, Economics" },
      {
        label: "Standard level",
        value: "Math AA, English Lang & Lit, French ab initio",
      },
      { label: "Core", value: "Theory of Knowledge, Extended Essay, CAS" },
      { label: "CAS project", value: "Zayno" },
    ],
  },

  varsity: {
    dek: "Two varsity teams, two years on each: one loud and fast, one quiet and entirely on you.",
    sections: [
      {
        label: "two teams",
        paragraphs: [
          {
            text: "At the American School of Milan I play on two varsity teams, basketball and golf, and I've been on each for two years. Both compete in ESC tournaments.",
            highlight: "two years",
          },
          {
            text: "They're opposite sports. Basketball is loud, fast and physical, ten players on a small court. Golf is quiet and slow, just you and a ball that won't move until you hit it.",
            highlight: "opposite",
          },
        ],
      },
      {
        label: "results",
        paragraphs: [
          {
            text: "Last year basketball finished third at ESC. Golf went one better, and we placed first as a team.",
            highlight: "first",
          },
          {
            text: "A team title in golf is an odd thing to win. Everyone plays their own ball, alone, and the team only exists when the scores get added up at the end.",
            highlight: "added up",
          },
        ],
      },
    ],
    quote: "Basketball is loud and golf is quiet. I play both.",
    specs: [
      { label: "Teams", value: "Varsity basketball, varsity golf" },
      { label: "Years", value: "Two on each" },
      { label: "League", value: "ESC tournaments" },
      { label: "Golf", value: "1st place as a team" },
      { label: "Basketball", value: "3rd place" },
    ],
  },

  clubs: {
    dek: "Astronomy on one side, AI on the other, and physics in between, taught to younger students.",
    sections: [
      {
        label: "two clubs",
        paragraphs: [
          {
            text: "Since 2025 I've been in the Astronomy Club, where the meetings are about astronomical phenomena, new discoveries and the space research happening right now.",
            highlight: "space research",
          },
          {
            text: "AI Club started the same year. It covers AI technology, how it's used in the real world and how to use it responsibly, down to the basics of large language models: parameters, capabilities and limits.",
            highlight: "limits",
          },
          {
            text: "It sits right next to what I build. Dawn and SkyCloud run on the same kind of model the club takes apart.",
            highlight: "takes apart",
          },
        ],
      },
      {
        label: "tutoring",
        paragraphs: [
          {
            text: "Also since 2025, I tutor younger students in physics. The work is understanding the concepts, getting better at problem-solving, and the part that matters most, confidence.",
            highlight: "confidence",
          },
          {
            text: "Before any of that, in 2024, I helped run school events: the budget, the food, the logistics and the people coming through the door.",
            highlight: "budget",
          },
        ],
      },
    ],
    quote: "Astronomy on one side, AI on the other, physics in between.",
    specs: [
      { label: "Astronomy Club", value: "2025 – now" },
      { label: "AI Club", value: "2025 – now" },
      { label: "Physics tutoring", value: "Younger students, 2025 – now" },
      { label: "School events", value: "2024: budgeting, food, logistics" },
    ],
  },

  oxford: {
    dek: "Two weeks of engineering at Oxford, and a six-day team project: a free AI study partner that never leaves your laptop.",
    sections: [
      {
        label: "summer 2025",
        paragraphs: [
          {
            text: "Summer 2025, Oxford. I spent two weeks on the Oxford Royale summer programme studying engineering, split across three branches: civil, mechanical and electrical.",
            highlight: "three branches",
          },
          {
            text: "It ended with a group project: three of us, six days, and a brief to solve a real problem the way engineers do. Plan it, spec it, cost it, build it, then present it.",
            highlight: "six days",
          },
        ],
      },
      {
        label: "the problem",
        paragraphs: [
          {
            text: "We picked the price of AI study tools. The good ones run on subscriptions that add up to hundreds of dollars a year, and not every student can pay that.",
            highlight: "hundreds of dollars",
          },
          {
            text: "So the brief was a free study partner. It had to explain homework step by step, work across subjects and adapt to each student's level. It also had a list of what not to do: no finishing assignments, no taking tests, no replacing teachers.",
            highlight: "what not to do",
          },
        ],
      },
      {
        label: "the design",
        paragraphs: [
          {
            text: "Our first idea was the obvious one, a cloud app calling GPT-4 or Claude. We dropped it. Student data would leave the device, it needed a connection, and every question would cost money, forever.",
            highlight: "dropped it",
          },
          {
            text: "A simple chatbot came next, and it was too rigid. What we built instead runs entirely on the student's own computer. A small open model, Llama 3.2 or Phi-3 Mini, runs through Ollama, so nothing is sent anywhere and nothing is billed.",
            highlight: "entirely",
          },
        ],
      },
      {
        label: "the build",
        paragraphs: [
          {
            text: "It's Python with a Streamlit interface. You upload a PDF, PyMuPDF pulls the text out page by page, and a 32,000-character limit stops the small model from drowning. A system prompt keeps it teaching rather than handing out answers.",
            highlight: "32,000-character",
          },
          {
            text: "Then you pick one of four tools: chat with the document, make flashcards, write a study guide or generate a quiz. Anything it makes exports as a PDF, and the whole thing runs on a laptop with 4 to 8 GB of memory.",
            highlight: "four tools",
          },
          {
            text: "I led the development and coordinated the team, and wrote a large part of the report and the final presentation. My two teammates owned the research, the documentation and the presentation's story.",
            highlight: "coordinated",
          },
        ],
      },
      {
        label: "after",
        paragraphs: [
          {
            text: "We presented on 29 July. The next month I started LumoStudio, a private desktop AI tutor in Rust and Tauri that could also run models offline through Ollama, the same tool the study buddy ran on.",
            highlight: "same tool",
          },
        ],
      },
    ],
    quote: "Every question to a cloud model costs money. Ours ran on the laptop, for free.",
    specs: [
      { label: "Programme", value: "Oxford Royale summer school" },
      { label: "Subject", value: "Engineering: civil, mechanical, electrical" },
      { label: "When", value: "Summer 2025, two weeks" },
      { label: "Final project", value: "AI Study Buddy, in six days" },
      { label: "Team", value: "Three; I led development" },
      { label: "Stack", value: "Python, Streamlit, PyMuPDF, Ollama, FPDF" },
      { label: "Models", value: "Llama 3.2 or Phi-3 Mini, on device" },
    ],
  },

  nph: {
    dek: "A week in the Dominican Republic with NPH, building a bike shed for the community.",
    sections: [
      {
        label: "the trip",
        paragraphs: [
          {
            text: "In February 2025 I spent a week in the Dominican Republic on a service project with NPH, Nuestros Pequeños Hermanos, and the Francesco Rava Foundation.",
            highlight: "a week",
          },
          {
            text: "The job was a building: a community bike shed, so bikes had somewhere safe to be kept and getting around locally was a little easier.",
            highlight: "bike shed",
          },
        ],
      },
      {
        label: "the week",
        paragraphs: [
          {
            text: "It's a different kind of project from everything else on this site. No code, no screens, nothing to deploy. A week of physical work with other people, and at the end a structure standing that wasn't there before.",
            highlight: "No code",
          },
          {
            text: "NPH runs homes and schools for children across Latin America and the Caribbean, and the Francesco Rava Foundation supports its work from Italy.",
            highlight: "homes and schools",
          },
        ],
      },
    ],
    quote: "No code, no screens, nothing to deploy. Just a bike shed that wasn't there before.",
    specs: [
      { label: "Where", value: "Dominican Republic" },
      { label: "When", value: "February 2025, one week" },
      { label: "With", value: "NPH and the Francesco Rava Foundation" },
      { label: "Built", value: "A community bike shed" },
    ],
  },
};
