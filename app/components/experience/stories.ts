import type { ReleaseId } from "./releases";
import type { Story } from "./types";

// Long-form stories for each record, written from each project's own repo and
// docs and fact-checked against them. Paragraphs are sized for the big
// scroll-reveal type; each highlight appears verbatim in its paragraph.

export const stories: Record<ReleaseId, Story> = {
  skycloud: {
    dek: "A team of AI employees you hire in a sentence and text like colleagues, spun out of Dawn in one afternoon.",
    sections: [
      {
        label: "the itch",
        paragraphs: [
          {
            text: "Dawn is one assistant, the kind you stop thinking about. SkyCloud is the team around her, built for founders running a small company mostly alone, who want staff they can brief from their phone and check on when they like.",
            highlight: "staff",
          },
          {
            text: "Agent products tend to hurt in the same places. You cannot predict what they spend or read what they remember. Worst of all, they keep asking permission. Ninety-five percent autonomy that still needs thirty approvals a day is a job, not autonomy.",
            highlight: "approvals",
          },
        ],
      },
      {
        label: "day one",
        paragraphs: [
          {
            text: "The employees first lived inside Dawn's code under the codename dusk, because it pairs with Dawn. On 5 September I cut them out into their own repo. The skeleton, backend, docs and web app all landed in under half an hour.",
            highlight: "dusk",
          },
          {
            text: "That same day, Dawn handed a job to one of the new employees and got the answer back in 37 seconds, across three systems. The product was called SKYLIMIT until the next evening. The repo still answers to that name, so nothing already configured would break.",
            highlight: "37 seconds",
          },
        ],
      },
      {
        label: "how it works",
        paragraphs: [
          {
            text: "You hire an employee in a first meeting, not a form. Pick its face and name, describe the job in a sentence, then choose the harness it thinks on. There are fourteen, from my own cheap native loop to Claude Code, Codex and midnight.",
            highlight: "first meeting",
          },
          {
            text: "After that you just text it. In the web window, in its own Telegram bot, or in a Slack or Discord channel it makes for itself, under its own name and face. A reply that is a single emoji becomes a reaction.",
            highlight: "text",
          },
          {
            text: "The design rule is a messaging app, not a dashboard, and no price ever shows on screen. Budgets still stop an employee in the backend. The team's memory is a wiki you can read, and every fact in it keeps a receipt of who wrote it and when.",
            highlight: "receipt",
          },
        ],
      },
      {
        label: "the long shift",
        paragraphs: [
          {
            text: "For work that takes hours I built midnight, a harness with one rule. The model never decides that the work is done. Something that can actually fail decides that.",
            highlight: "midnight",
          },
          {
            text: "In one experiment, the plain profile fixed the stated bug for two cents, still failed 5 of 13 checks and reported success. The deep profile passed all 13 for about five times the cost. The surprise was that naming the check up front did the work, not the refusal loop.",
            highlight: "success",
          },
          {
            text: "I lifted that loop out of midnight and into the platform. A round is not a turn. Between rounds SkyCloud, not the model, runs the project's own check and decides whether to continue, deliver, or stop and ask. The Software Engineer gets twelve rounds.",
            highlight: "turn",
          },
        ],
      },
      {
        label: "so far",
        paragraphs: [
          {
            text: "My sneakiest bug was imaginary money. Claude Code reports what a subscription run would have cost on an API, and SkyCloud counted it against a $10 platform ceiling. On 10 September, $2.20 of $3.03 had never been spent. Now the ledger splits by who actually pays.",
            highlight: "imaginary money",
          },
          {
            text: "Today SkyCloud is invite-only, behind a Dawn sign-in, and the Mac app that drives your computer by voice is still being built. A post now waits for your tap before it goes out. Autonomy without thirty approvals a day is the hard problem I started with, and it is still open.",
            highlight: "still open",
          },
        ],
      },
    ],
    quote:
      "The model never decides the work is done. Something that can fail does.",
    specs: [
      { label: "Role", value: "Founder & solo developer" },
      { label: "Started", value: "5 September 2026" },
      { label: "Status", value: "Invite-only, Mac app in progress" },
      {
        label: "Built with",
        value:
          "TypeScript, Convex, Next.js, Vercel AI SDK, OpenRouter, Fly.io, Tauri (Mac app)",
      },
      {
        label: "Harnesses",
        value: "14, from a native loop to Claude Code and midnight",
      },
      { label: "Commits", value: "166 on main, 5 to 16 Sep 2026" },
      { label: "Sibling", value: "Dawn, the chief of staff" },
    ],
  },
  dawn: {
    dek: "I built Dawn as the assistant you never have to open. It texts first, and by default nothing it writes leaves without your tap.",
    sections: [
      {
        label: "the itch",
        paragraphs: [
          {
            text: "Busy people rarely lose their day to the hard work. They lose it to keeping track, like the reply they owed on Tuesday and forgot by Thursday. Meanwhile every assistant waits politely to be asked.",
            highlight: "keeping track",
          },
          {
            text: "That felt backwards to me, so Dawn works the other way round. It lives in WhatsApp, Telegram and iMessage, and it speaks up when something needs you. I pitch it as an employee, not a chatbot.",
            highlight: "employee",
          },
        ],
      },
      {
        label: "the night shift",
        paragraphs: [
          {
            text: "The name comes from the hour it hands your day back. Mail keeps landing from other timezones after the laptop closes, and tomorrow's calendar quietly grows a conflict. Dawn keeps watching through the night and meets you in the morning with a briefing written as prose.",
            highlight: "night",
          },
          {
            text: "It triages your inbox, silently drops most of it, and drafts replies in your voice, learned from what you actually sent. My first beta user summed it up better than I could. “I hate writing emails. I don't write them anymore.”",
            highlight: "your voice",
          },
          {
            text: "One rule sits underneath all of it. The model's send tools can't reach another person without your tap, and no setting loosens that. The only unattended replies go to senders you allowlisted yourself, and any action Dawn doesn't recognise waits for you too.",
            highlight: "your tap",
          },
        ],
      },
      {
        label: "glass box",
        paragraphs: [
          {
            text: "Dawn's memory is a wiki you can open and edit, not a black box. Every change is versioned. When it gets something wrong, you fix the page once, and the fixed page is what it reads next time.",
            highlight: "wiki",
          },
          {
            text: "I wrote the agent loop by hand on the Vercel AI SDK instead of adopting an agent framework, so Dawn can stop between any two tool calls and wait for you. Which actions need that is decided by plain code, never by the model grading its own risk.",
            highlight: "by hand",
          },
        ],
      },
      {
        label: "what broke",
        paragraphs: [
          {
            text: "The best lessons came from things breaking. Dawn's first real slide deck got 0/10 from its own quality reviewer and shipped anyway, behind a cheerful “Done”. The reviewer had been checking titles and links instead of opening the deck.",
            highlight: "0/10",
          },
          {
            text: "In beta week every scheduled reminder in Rome fired two hours late, because the model kept writing local time as if it were UTC. So I stopped asking it. Timezones now live in server code.",
            highlight: "two hours",
          },
          {
            text: "My favourite number is a bad one. Dawn spent ten days picking nudges in shadow mode, logged but never sent, and I graded them against reality. The four that cleared its gate matched nothing, no better than random. Those pings were switched off. What goes out now is mostly one narrow nudge into free time.",
            highlight: "shadow mode",
          },
        ],
      },
      {
        label: "where it is now",
        paragraphs: [
          {
            text: "Dawn has been in production beta since 16 July 2026. Every commit in the repo is mine, and most of them also credit Claude as co-author. Hiding that would be odd for a project about delegating.",
            highlight: "delegating",
          },
          {
            text: "In September it moved into the room. I reflashed a smart speaker puck, turned its light ring Dawn orange and trained a “Hey Dawn” wake word on 5,000 synthetic voice samples. The first model did worse than a coin flip. The second reached an AUC of 0.80.",
            highlight: "coin flip",
          },
          {
            text: "The lesson I keep relearning is that prose loses to code. A paragraph in a prompt won't stop a model that thinks it knows better. A rule at the right seam will. Dawn's harness is also what SkyCloud, the product that came next, is built on.",
            highlight: "prose",
          },
        ],
      },
    ],
    quote:
      "The machinery was sophisticated. The measurement said it didn't work yet. The measurement won.",
    specs: [
      { label: "Role", value: "Founder & solo developer" },
      { label: "When", value: "Jun 2026 - now" },
      { label: "Team", value: "One developer, plus AI coding agents" },
      {
        label: "Built with",
        value: "TypeScript, Convex, Vercel AI SDK, OpenRouter, MCP",
      },
      {
        label: "Lives in",
        value: "WhatsApp, Telegram, iMessage, email, voice",
      },
      { label: "Status", value: "Production beta since 16 Jul 2026" },
      {
        label: "Code",
        value: "Sole human author, most commits co-written with Claude",
      },
    ],
  },
  zayno: {
    dek: "Studying turned me into the glue between five apps, so I built one workspace that remembers you and plans your study time around your calendar.",
    sections: [
      {
        label: "the backpack",
        paragraphs: [
          {
            text: "Studying meant ChatGPT, Notion, Google Docs, NotebookLM and Quizlet, all open at once. None of them knew my syllabus or my exam dates. I was the integration layer, carrying context from tab to tab.",
            highlight: "integration layer",
          },
          {
            text: "It started as my IB CAS project, and I meant it to become a real product. The first name was Lumo, with a gold sparkle icon and a lightbulb mascot that never made it into the app. Then I renamed it after zaino, Italian for backpack, the one bag that carries everything.",
            highlight: "zaino",
          },
        ],
      },
      {
        label: "one library",
        paragraphs: [
          {
            text: "Everything lands in one library. PDFs, YouTube videos, web pages, Drive files and Canva designs get cut into chunks of up to 512 tokens, embedded with Cohere and stored in pgvector, so every answer can point to the exact passage it came from.",
            highlight: "exact passage",
          },
          {
            text: "Vector search alone can miss exact terms. Ask about the Krebs cycle by name and the right chunk might never surface. So keyword search runs beside it, the rankings get fused and reranked, and a per-document cap stops one long textbook from taking every slot.",
            highlight: "Krebs cycle",
          },
          {
            text: "Then there's memory. Every message is screened for facts worth keeping, and a nightly job hunts for weak topics. What it believes about you lives in editable notes, and it throws out guesses about things like health or religion.",
            highlight: "memory",
          },
        ],
      },
      {
        label: "my own wallet",
        paragraphs: [
          {
            text: "I paid for every API call myself, out of a budget of roughly one to two thousand euros, so cost shaped the architecture. Working out what kind of question you asked costs nothing. It's a weighted keyword scorer, not another model call.",
            highlight: "nothing",
          },
          {
            text: "Quick answers go to Gemini, writing to Claude and, on Pro, hard reasoning to DeepSeek R1, all through OpenRouter with backups lined up if a provider fails. There's also a manual picker, cut down to 15 models in May, for anyone who would rather choose.",
            highlight: "15 models",
          },
          {
            text: "Free memory fades on purpose. Standard depth for the first ten days, shallow until day fourteen, then minimal. People decide early, so it has to feel smart early, and the fade gives a reason to go Pro without locking anyone out.",
            highlight: "on purpose",
          },
        ],
      },
      {
        label: "hitting walls",
        paragraphs: [
          {
            text: "Vercel's free plan cuts requests off at 60 seconds, and my agent loop kept timing out. I deleted an evaluation step worth five to eight seconds a round, went from five rounds to four, and gave the loop a 38-second budget so the answer still has time to stream.",
            highlight: "60 seconds",
          },
          {
            text: "Before booking a study session, the agent checks your Google Calendar for free time. Creating, moving or deleting an event directly waits for your approval. The AI SDK can't pause a stream, so the loop ends there, saves a resume token and replays the conversation once you approve or decline.",
            highlight: "approval",
          },
        ],
      },
      {
        label: "where it is now",
        paragraphs: [
          {
            text: "It isn't tidy. The main chat route grew to about 7,000 lines, and my own audit already lists what I'd build differently from day one, starting with a background job queue and an agent that doesn't live inside one long HTTP request.",
            highlight: "7,000 lines",
          },
          {
            text: "The first beta was aimed at my school's IB cohort during finals season, with a feedback form and a feature poll built in. Cursor and Claude show up in the commit trailers as coding assistants, but every product call, from pricing to retrieval, was mine.",
            highlight: "was mine",
          },
        ],
      },
    ],
    quote:
      "Students shouldn't be the integration layer between their own study apps.",
    specs: [
      { label: "Role", value: "Founder & solo developer" },
      { label: "When", value: "Nov 2025 - Jun 2026" },
      {
        label: "Team",
        value: "One, with Cursor and Claude as coding assistants",
      },
      {
        label: "Built with",
        value: "Next.js 16, Supabase + pgvector, OpenRouter, Cohere",
      },
      { label: "Pricing", value: "Free, or Pro at €9.99/month" },
      { label: "Formerly", value: "Lumo" },
      { label: "Where", value: "zaynoai.vercel.app" },
    ],
  },
  lumostudio: {
    dek: "A study app built for $300 laptops, where a real language model can run on the student's own machine, even with no internet.",
    sections: [
      {
        label: "the itch",
        paragraphs: [
          {
            text: "Students already use ChatGPT. But a chat window isn't a study workflow. I wanted something where you drop in a PDF or your notes and get back a summary, a study guide, flashcards to revisit and a timed quiz with explanations.",
            highlight: "workflow",
          },
          {
            text: "It started in August 2025 as Lumo, an iPhone app talking to Gemini. It had an Offline switch, but in the code that mode was only simulated. A couple of days later I moved to the desktop, where a real model could run on the student's own machine.",
            highlight: "simulated",
          },
        ],
      },
      {
        label: "on the laptop",
        paragraphs: [
          {
            text: "My spec targeted $300 laptops running on CPU alone, with an offline mode that never sends data out. Cloud AI also costs money every time someone hits enter, so a free tier needs a fallback that lives on the machine itself.",
            highlight: "fallback",
          },
          {
            text: "That decided the model menu. Qwen2.5-3B, about 2.2 GB, is the recommended default. SmolLM2-1.7B squeezes onto machines with 4 GB of RAM, and Qwen2.5-7B is there if you have headroom.",
            highlight: "menu",
          },
          {
            text: "Rust then starts a bundled llama.cpp server as a child process on localhost, with a 4096-token context. Online mode goes to the cloud, Offline stays on the laptop, and Auto tries the cloud first, then falls back to local.",
            highlight: "Auto",
          },
        ],
      },
      {
        label: "the craft",
        paragraphs: [
          {
            text: "I wanted Lumo to sound the same everywhere. Every model gets the same opening line, \"a calm, clear, and supportive study assistant\", and a small prompt engine in the proxy rewrites it into each model's chat format. Switching from the cloud to your laptop doesn't change who you're talking to.",
            highlight: "same",
          },
          {
            text: "Errors get a plan instead of a screen. A cloud request retries along a chain of fallback models. If all of them fail, the app flips itself to Offline, shows a toast and adds a note to the answer so you know what happened.",
            highlight: "Offline",
          },
          {
            text: "The installer size surprised me. My own build guide guessed 150 to 200 MB, assuming a full Node.js runtime inside. The finished macOS DMGs came out under 30 MB, partly because the models download separately and the online proxy expects Node.js already installed.",
            highlight: "30 MB",
          },
        ],
      },
      {
        label: "fighting json",
        paragraphs: [
          {
            text: "The quiz screen grew to 2,313 lines, the biggest file in the app, and a good share of its logic is me arguing with the model's JSON. It strips code fences, finds the array, then patches single quotes, unquoted keys and trailing commas.",
            highlight: "arguing",
          },
          {
            text: "The model also had a habit of putting every correct answer in the same slot, so the app spots that and reshuffles the options. When the model still comes up short, it builds the missing questions from sentences in your own material rather than inventing generic ones.",
            highlight: "reshuffles",
          },
        ],
      },
      {
        label: "the honest bit",
        paragraphs: [
          {
            text: 'Shipping was the humbling part; my build folder still holds DMGs named Fixed, Debug and AuthEnabled. Unsigned, the macOS app hits the "app is damaged" warning. An Apple developer account alone costs $99 a year, so the plan was to pay once revenue came in. There was never a public download.',
            highlight: "damaged",
          },
          {
            text: "I also built a Research tool, but its web search only ever returned mock results. So I pulled the tab from the app instead of shipping a search that wasn't real.",
            highlight: "pulled",
          },
          {
            text: "Development wound down in autumn 2025, with the last builds in November, and it stayed a working early beta. Chat has no multi-turn memory, and the bundled offline engine only runs on Apple Silicon. But it's where I learned to design for models that misbehave.",
            highlight: "misbehave",
          },
        ],
      },
    ],
    quote: "A chat window isn't a study workflow.",
    specs: [
      { label: "Role", value: "Founder & solo developer, team of one" },
      { label: "Publisher", value: "OurMind" },
      { label: "When", value: "Aug – Nov 2025" },
      {
        label: "Built with",
        value: "Tauri v2, Rust, React + TypeScript, llama.cpp",
      },
      {
        label: "Local models",
        value: "Qwen2.5-3B (recommended), SmolLM2-1.7B, Qwen2.5-7B",
      },
      { label: "Installer", value: "Under 30 MB macOS DMG (Apple Silicon)" },
      {
        label: "Status",
        value: "Working early beta, v1.0.5, unsigned, never publicly released",
      },
    ],
  },
  bds: {
    dek: "During my BDS internship I turned a real Italian hillclimb into a 90s arcade racer that runs in a browser tab.",
    sections: [
      {
        label: "the road",
        paragraphs: [
          {
            text: "Once a year, a private toll road above Lake Maggiore becomes Tutto Bene, half hillclimb and half culture festival, run by Borromeo de Silva and Race Service. It's the Strada Borromea, the Borromeo family's own road up Mottarone, open to cars since 1948.",
            highlight: "Strada Borromea",
          },
          {
            text: "When the 2025 edition was teased with a Sega Rally-style graphic, the idea clicked. That image already wanted to be an arcade cabinet, so I started building one people could actually play, on a phone or a laptop.",
            highlight: "arcade cabinet",
          },
        ],
      },
      {
        label: "the climb",
        paragraphs: [
          {
            text: "The game recreates the real road, from the casello above Gignese at 703 metres to Vetta Mottarone at 1,492. An altimeter counts all 789 metres, and a co-driver pacenote flashes TORNANTE 3 or SECCA SINISTRA before every hairpin and sharp kink.",
            highlight: "789 metres",
          },
          {
            text: "First you pick a car. The Delta Futurista drifts, the Eccentrica V12 burns NOS, and the 928 Nardone has no special move at all, which is kind of the point. Then the clock starts at 65 seconds, and every checkpoint, named after a corner on the event poster, buys you more.",
            highlight: "65 seconds",
          },
        ],
      },
      {
        label: "pixels and physics",
        paragraphs: [
          {
            text: "There is no build step and no framework. It's one HTML file, a 3,620-line game.js and a small serverless function for scores and ghosts. Anything that isn't a loaded PNG gets painted in code, and every sound effect is synthesized live in WebAudio.",
            highlight: "painted",
          },
          {
            text: "The first real fight was resolution. I tried a 32-bit version and threw it out the same day, because smoothing smeared the whole world. Twenty-five minutes later I kept the logic at 320 by 240 and doubled the density of the art instead. Crisp pixels won.",
            highlight: "density",
          },
          {
            text: "The Delta's drift needed real physics. My first attempt barely felt different. The rewrite tracks a sideways slip that hardly decays, so the car keeps sliding until you catch it with countersteer.",
            highlight: "countersteer",
          },
        ],
      },
      {
        label: "real players",
        paragraphs: [
          {
            text: "The leaderboard started in localStorage, where nobody could see anybody. The same day it moved to Redis on Vercel, so a friend's time on their phone shows up on your laptop. By mid-afternoon you could race their ghost, replayed from positions sampled ten times a second.",
            highlight: "ghost",
          },
          {
            text: "Before that, the demo car had been signing the local board under whoever typed a name last, so I sent it back to the title screen. Its other job was tuning: the demo Delta climbs in about 136 seconds, so par sits at 148 and TUTTO BENE! means beating the AI.",
            highlight: "demo car",
          },
          {
            text: "My favourite bug report came from a player who said drift only worked to the right. Shift doubles as the drift button, and holding it makes the browser report A and D as capitals, while steering only listened for lowercase. It had been there since day one. The drift buff made everyone hold Shift.",
            highlight: "lowercase",
          },
        ],
      },
      {
        label: "credits",
        paragraphs: [
          {
            text: "I built it with an AI pair-programmer, and every commit says so. The direction was mine, from the reference photos and generated art to round after round of notes, until the lake finally sat far below the road.",
            highlight: "direction",
          },
          {
            text: "Forty-one commits in ten days, and it's live now as a fan-made tribute. The event's motto is slow down to go fast. When your clock runs out, my game-over screen answers, ma non così tanto. Not that slow. That's roughly how the whole build felt.",
            highlight: "go fast",
          },
        ],
      },
    ],
    quote:
      "That teaser already wanted to be an arcade cabinet. So I built one.",
    specs: [
      {
        label: "Role",
        value: "Software Development Intern, Borromeo de Silva (BDS)",
      },
      { label: "Where", value: "Milano, Summer 2026 (3 weeks)" },
      {
        label: "Built",
        value: "Tutto Bene Hill Climb, 1492m (browser arcade racer)",
      },
      {
        label: "Built with",
        value: "Vanilla JS, Canvas 2D, Web Audio, Vercel serverless, Redis",
      },
      {
        label: "Footprint",
        value: "1 HTML file, 3,620-line game.js, no build step",
      },
      { label: "Timeline", value: "41 commits, 7 to 16 July 2026" },
      {
        label: "Status",
        value:
          "Live at tuttobenegame2026.vercel.app. Fan-made, non-commercial, not affiliated or endorsed",
      },
    ],
  },
  pasqua: {
    dek: "Two weeks at a Verona wine house: a room calendar that refuses double bookings, and a podcast made from the daily press review.",
    sections: [
      {
        label: "two weeks",
        paragraphs: [
          {
            text: "Summer 2025, Verona. Pasqua has made wine here since 1925, and I had two weeks inside as their software and AI intern. That's not long, so I stuck to two small, everyday problems and tried to finish both properly.",
            highlight: "properly",
          },
          {
            text: "One was the meeting rooms, and the old question of who has which one and when. The other was the daily press review, an email of headlines and outlet names stacked in HTML tables. Useful, and very easy to skip.",
            highlight: "skip",
          },
        ],
      },
      {
        label: "the rooms",
        paragraphs: [
          {
            text: "The booking app started as a bare React, Vite and Supabase project, plus a v0 mockup stocked with invented rooms. I kept the mockup's palette, cut its fifty or so generated components down to two, and wired everything to a real database with real rules.",
            highlight: "real rules",
          },
          {
            text: "Before anything saves, the app checks whether that room already has an overlapping booking. Drag a meeting onto a taken slot and it snaps straight back. It works in Italian and English, and on a phone a 150 millisecond long-press lets you drag with your thumb.",
            highlight: "overlapping",
          },
          {
            text: "Signing in takes your full name and no password, a shortcut that only makes sense for an internal tool. Ownership still counts in the interface. Only your own bookings open for editing or dragging, and clicking a colleague's tells you whose it is.",
            highlight: "password",
          },
        ],
      },
      {
        label: "daily pour",
        paragraphs: [
          {
            text: "The podcast started as a weekend prototype called Cantina Cast, which fed six public wine news feeds to Gemini and an ElevenLabs voice. The oldest episode I still have lasts 37 seconds, the next just over two minutes. Fun, but it only knew generic industry news.",
            highlight: "37 seconds",
          },
          {
            text: "So I changed the input. Daily Pour reads the company's own press-review email, keeps the wine stories, and turns them into one short episode in Italian and one in English. Both links arrive together in a single text message. Nothing to install.",
            highlight: "Daily Pour",
          },
        ],
      },
      {
        label: "the fiddly bits",
        paragraphs: [
          {
            text: "The press-review email is messy HTML. Rather than trust one extractor I wrote four, each with its own confidence score, and kept the surest copy of every headline. Then 55 wine keywords in two languages, from vendemmia to dazi, decide what stays.",
            highlight: "four",
          },
          {
            text: "A headline isn't an article, though. The email gives titles and outlets, not the stories themselves, so each one becomes a Google search. Social media results get skipped, the first page with real article text wins, and five seconds pass between lookups to keep rate limits calm.",
            highlight: "headline",
          },
          {
            text: "Now the money part. Summaries run on the cheaper GPT-4o-mini and only the two final scripts get GPT-4o. ElevenLabs voices the Italian, OpenAI's nova reads the English at 1.1x. The script prompts ban stage directions, a rule kept from the prototype, because nobody wants a narrator solemnly reading out cork pops.",
            highlight: "cork pops",
          },
        ],
      },
      {
        label: "what stuck",
        paragraphs: [
          {
            text: "The best bug of the fortnight was my Mac's fault. Its filesystem ignores letter case, so the app imported dashboard.jsx while git had stored Dashboard.jsx, and the deploy disagreed. My first fix left both spellings in git. Three commits in under twenty minutes, one deleting both files, put it right.",
            highlight: "twenty minutes",
          },
          {
            text: "Internal tools turned out to be a craft of their own. Nobody applauds a calendar that refuses double bookings. Neither tool is public, and that's fine. They were built for the people inside one wine house, not for a launch page.",
            highlight: "craft",
          },
        ],
      },
    ],
    quote:
      "Nobody applauds a calendar that refuses double bookings. I built one anyway.",
    specs: [
      { label: "Role", value: "Software & AI intern" },
      { label: "Where", value: "Pasqua Wines, Verona" },
      { label: "When", value: "Summer 2025, 2 weeks" },
      { label: "Built", value: "Pasqua Wines Booking + Daily Pour podcast" },
      { label: "Booking app", value: "React, Vite, Supabase, FullCalendar" },
      {
        label: "Podcast",
        value: "Python, GPT-4o, ElevenLabs, OpenAI TTS, Twilio",
      },
      { label: "Status", value: "Internal tools, not public" },
    ],
  },
};
