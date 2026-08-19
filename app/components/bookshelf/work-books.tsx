import {
  ArrowUpRight,
  CalendarBlank,
  HourglassMedium,
  LockSimple,
  MapPinLine,
} from "@phosphor-icons/react";

import type { BookDef } from "./types";

/* ------------------------------------------------------------------ */
/* Borromeo de Silva: matte black cloth, white monogram, MMXXVI.       */
/* Bigger, thicker binding — multi-spread Tutto Bene hill-climb story. */
/* ------------------------------------------------------------------ */

const borromeo: BookDef = {
  id: "borromeo",
  title: "Borromeo de Silva",
  size: { h: 352, d: 62 },
  spine: {
    bg: "#141518",
    color: "#f2f0e9",
    label: "BORROMEO DE SILVA",
    sub: "TUTTO BENE · 1492m",
  },
  coverBg: "#141518",
  paper: "#ece7d8",
  lean: 0,
  cover: (
    <span className="bookcover bookcover-borromeo">
      <img
        className="bookcover-borromeo-logo"
        src="/stickers/borromeo-desilva.png"
        alt=""
      />
      <span className="bookcover-borromeo-title">
        Engineering
        <br />
        Internship
      </span>
      <span className="bookcover-borromeo-foot">MILANO · MMXXVI</span>
    </span>
  ),
  spreads: [
    /* ---- Spread 1: colophon + pitch -------------------------------- */
    {
      left: (
        <div className="bookpage bookpage-colophon">
          <span className="bookpage-mark">
            <img src="/stickers/borromeo-desilva.png" alt="" />
          </span>
          <h2 className="bookpage-title">Borromeo de Silva</h2>
          <p className="bookpage-role">Software Development Intern</p>
          <ul className="bookpage-meta">
            <li>
              <MapPinLine weight="bold" size={14} />
              Milano, Italy
            </li>
            <li>
              <CalendarBlank weight="bold" size={14} />
              Summer 2026
            </li>
            <li>
              <HourglassMedium weight="bold" size={14} />
              3 weeks
            </li>
          </ul>
          <div className="bookpage-tags">
            <span>Game dev</span>
            <span>Frontend</span>
            <span>Redis</span>
            <span>Event tech</span>
          </div>
          <p className="bookpage-folio">I</p>
        </div>
      ),
      right: (
        <div className="bookpage bookpage-story">
          <p className="bookpage-kicker">Tutto Bene Hill Climb — 1492m</p>
          <p className="bookpage-lede">
            A love letter to a mountain road, built in a browser tab — a
            geographically accurate OutRun/Sega Rally cabinet for Borromeo de
            Silva&rsquo;s yearly climb with Race Service.
          </p>
          <ul className="bookpage-points">
            <li>
              Recreates the real ~9&nbsp;km climb from the casello above Gignese
              (703&nbsp;m), past Alpino and the Giardino Alpinia, through
              numbered <em>tornanti</em>, to Vetta Mottarone (1,492&nbsp;m) —
              789&nbsp;m of elevation, tracked live on an in-game altimeter.
            </li>
            <li>
              Three cool cars, a shared global leaderboard with ghost racing, a
              CRT bezel with scanlines and vignette — open one{" "}
              <code>index.html</code> and ~3,600-line <code>game.js</code>, zero
              build step, zero framework.
            </li>
            <li>
              Shipped as a playable fan tribute for event attendees — Italian
              native voice, IT/EN toggle, race-car emoji favicon so the tab
              wasn&rsquo;t blank.
            </li>
          </ul>
          <figure className="bookpage-plate">
            <img
              src="/projects/tuttobene.webp"
              alt="Title screen of the TUTTO BENE racing game, styled like a 90's arcade cabinet"
              loading="lazy"
            />
            <figcaption>Title screen · Mottarone Hill Climb</figcaption>
          </figure>
          <a
            className="bookpage-cta"
            href="https://tuttobenegame2026.vercel.app/"
            target="_blank"
            rel="noreferrer"
          >
            Play TUTTO BENE
            <ArrowUpRight weight="bold" size={15} />
          </a>
          <p className="bookpage-folio">II</p>
        </div>
      ),
    },

    /* ---- Spread 2: story + build beats ----------------------------- */
    {
      left: (
        <div className="bookpage bookpage-story">
          <p className="bookpage-kicker">The story</p>
          <p className="bookpage-prose">
            Every summer, on a private toll road above Lake Maggiore,{" "}
            <strong>Tutto Bene</strong> happens: half hillclimb, half culture
            festival — dreamed up by BorromeodeSilva (Milano) and Race Service
            (LA) on the <strong>Strada Borromea</strong>, the Borromeo
            family&rsquo;s own road up Mottarone, opened to cars in 1948.
          </p>
          <p className="bookpage-prose">
            Beautiful old cars, haybale corners wrapped in event banners, giant
            sponsor balloons, a crowd at 1,492 metres with the Borromean Islands
            and the Monte Rosa massif laid out behind them. When the event
            teased its 2025 edition with a Sega Rally-style graphic, the idea
            clicked: <em>what if this were a 90s arcade cabinet?</em>
          </p>
          <p className="bookpage-prose">
            Over ten days in July 2026 that cabinet got built — not a generic
            racer with an Italian skin, but the actual climb. Checkpoints carry
            the event&rsquo;s poster names —{" "}
            <strong>Borromeo Bend, Stazione, Essess</strong> — and the title
            screen borrows the real slogans:{" "}
            <em>&ldquo;Slow down to go fast&rdquo;</em> and{" "}
            <em>&ldquo;Only cool cars allowed.&rdquo;</em>
          </p>
          <p className="bookpage-prose is-quiet">
            Fan tribute — non-commercial, unaffiliated. One nerd&rsquo;s homage
            to a road and a party that deserved a cabinet of its own.
          </p>
          <p className="bookpage-folio">III</p>
        </div>
      ),
      right: (
        <div className="bookpage bookpage-story">
          <p className="bookpage-kicker">The build, in beats</p>
          <ol className="bookpage-timeline">
            <li>
              <span className="bookpage-timeline-day">Day one</span>
              Baseline hill-climb engine, three cars painted in code, a
              hand-built inflatable start arch redrawn pixel-by-pixel from
              event photos, flag marshals, crowds, a chiptune loop — a
              playable game by the end of the first day.
            </li>
            <li>
              <span className="bookpage-timeline-day">Day two</span>
              Art pipeline day: procedural trees and haybales swapped for
              AI-generated sprite sheets (tall alpine spruce, broadleaf, five
              haybale variants, a Monte Rosa mountain strip). Lake Maggiore
              vista sculpted in — road dropping away to the lake below, ribbons
              and balloons strung across the canopy.
            </li>
            <li>
              <span className="bookpage-timeline-day">Week later</span>
              Second pass focused on being a real product: harder, more honest
              corners; a shared Redis leaderboard; a pause menu; and ghost
              racing — pick any name off the board and race their exact
              recorded run as a translucent rival, replayed from 10Hz samples
              stored server-side.
            </li>
            <li>
              <span className="bookpage-timeline-day">Final days</span>
              The unglamorous polish: a steering bug that went dead if you held
              Shift (alt drift) or had caps lock on; personal bests tracked{" "}
              <em>per car</em>; &ldquo;NUOVO RECORD&rdquo; only for the actual
              leaderboard; IT/EN toggle; race-car favicon.
            </li>
          </ol>
          <p className="bookpage-folio">IV</p>
        </div>
      ),
    },

    /* ---- Spread 3: cars + road ------------------------------------- */
    {
      left: (
        <div className="bookpage bookpage-story">
          <p className="bookpage-kicker">The cars — only cool ones allowed</p>
          <p className="bookpage-prose">
            A 4:3, 320×240-internal-resolution pseudo-3D racer in the
            OutRun/Sega Rally lineage — sprite-scaling road segments, curves,
            crests and fog, wrapped in a CRT bezel with scanlines and vignette.
            Scoring ranks straight out of the arcades:{" "}
            <strong>TUTTO BENE! → MOLTO BENE → BENE → BENINO</strong>.
          </p>
          <ul className="bookpage-cars">
            <li>
              <span className="bookpage-cars-name">
                Delta Futurista{" "}
                <em>&ldquo;La Regina&rdquo;</em>
              </span>
              <span className="bookpage-cars-stats">
                Verde Brinzio · Vel 4 · Scatto 4 · Tenuta 5
              </span>
              <span className="bookpage-cars-note">
                Automobili Amos-inspired hero — floating roof wing, black
                diffuser. Momentum drift: hold Space/Shift while steering; a
                well-fed slide holds speed instead of bleeding it. Drift poses
                face into the corner.
              </span>
            </li>
            <li>
              <span className="bookpage-cars-name">
                Eccentrica V12{" "}
                <em>&ldquo;La Bestia&rdquo;</em>
              </span>
              <span className="bookpage-cars-stats">
                Grigio titanio · Vel 5 · Scatto 4 · Tenuta 2
              </span>
              <span className="bookpage-cars-note">
                The brute. NOS: hold Space on the throttle to burn a
                fuel-gauge bottle for a two-frame flame speed burst.
              </span>
            </li>
            <li>
              <span className="bookpage-cars-name">
                928 Nardone{" "}
                <em>&ldquo;Gran Turismo&rdquo;</em>
              </span>
              <span className="bookpage-cars-stats">
                Oro champagne · Vel 4 · Scatto 3 · Tenuta 4
              </span>
              <span className="bookpage-cars-note">
                911/928-flavored all-rounder — the balanced, no-drama climb.
              </span>
            </li>
          </ul>
          <p className="bookpage-prose is-quiet">
            Hand-painted PNG sprites (plain, brake-lit, special frames) with a
            procedural painted fallback that shows instantly while real art
            streams in.
          </p>
          <p className="bookpage-folio">V</p>
        </div>
      ),
      right: (
        <div className="bookpage bookpage-story">
          <p className="bookpage-kicker">The road</p>
          <ul className="bookpage-points">
            <li>
              Four zones — forest → vista → meadow → summit — hand-laid in a
              track builder seeded with real waypoints. Sega Rally-style
              co-driver pacenotes call out what&rsquo;s coming (
              <em>TORNANTE 3 →</em>, <em>CURVA DESTRA</em>,{" "}
              <em>SECCA SINISTRA</em> for a tight hairpin), and a red-flag
              marshal stands at the outside of every bend.
            </li>
            <li>
              Checkpoint clock: 65-second start, then +48 / +50 / +40s as you
              pass Borromeo Bend, Stazione, and Essess. Miss the pace and the
              clock — not a wall — ends your run.
            </li>
            <li>
              Eighty &ldquo;cool cars&rdquo; of slow classic traffic share the
              hill to pick through, but never during attract mode or car select,
              which both run a live autopilot ghost behind the UI. Crashes have
              weight — car-to-car hits tumble you — but hitboxes stay tight on
              purpose: you only crash when you actually clip something.
            </li>
          </ul>
          <p className="bookpage-kicker is-follow">Dressing, true to the event</p>
          <p className="bookpage-prose">
            Built from event photos and the official route poster: navy
            inflatable <strong>TUTTO BENE</strong> arch with vertical START legs
            and pink peace/spiral/globe icons; haybales in navy chevrons, pink,
            gold, and pink/navy checkers; giant sponsor balloons; ribbon
            streamers over the forest road; poster palette throughout (navy{" "}
            <code>#232e7a</code>, salmon <code>#ef9d94</code>, cream{" "}
            <code>#f4ecd9</code>); pixel wordmark matching the groovy rounded
            letterforms.
          </p>
          <p className="bookpage-folio">VI</p>
        </div>
      ),
    },

    /* ---- Spread 4: systems + numbers ------------------------------- */
    {
      left: (
        <div className="bookpage bookpage-story">
          <p className="bookpage-kicker">Under the hood</p>
          <ul className="bookpage-points">
            <li>
              <strong>Leaderboard</strong> — Vercel serverless function + Redis
              (Vercel Marketplace), sorted set capped at the top 50, names
              sanitized and capped at 8 characters. Deployed as{" "}
              <code>tuttobenegame2026</code>.
            </li>
            <li>
              <strong>Ghost racing</strong> — every ranked run&rsquo;s replay
              (flat <code>[position, x×100]</code> pairs at 10Hz) lives under
              its own key; pick a name off the board and their translucent rival
              pops in mid-race as soon as the data arrives.
            </li>
            <li>
              <strong>Personal bests</strong> — tracked per car in{" "}
              <code>localStorage</code>, so switching cars never clobbers a
              Delta time with an Eccentrica one.
            </li>
            <li>
              <strong>Debug console</strong> —{" "}
              <code>TB.race(carIdx, autopilot)</code> and{" "}
              <code>TB.step(seconds)</code> fast-forward the sim; the 65s base
              clock and checkpoint bonuses were tuned by running the autopilot
              AI to the summit and reading its time.
            </li>
            <li>
              <strong>Audio</strong> — licensed/generated 8-bit tribute loop,
              layered with procedural WebAudio for engine, skid, checkpoint
              jingles, and an italo-flavored title theme.
            </li>
            <li>
              <strong>Input &amp; locale</strong> — keyboard (arrows/WASD +
              Space/Enter + M/P/R/Esc) and full touch (left/right half steers
              with auto-throttle; tapping both brakes). Italian is the native
              voice; every UI string is translatable via the IT/EN toggle.
            </li>
          </ul>
          <p className="bookpage-folio">VII</p>
        </div>
      ),
      right: (
        <div className="bookpage bookpage-story">
          <p className="bookpage-kicker">By the numbers</p>
          <ul className="bookpage-stats">
            <li>
              <strong>~3,620</strong>
              <span>lines in one game.js · zero build · zero framework</span>
            </li>
            <li>
              <strong>3 / 4 / 789</strong>
              <span>cars · track zones · metres of real elevation</span>
            </li>
            <li>
              <strong>50</strong>
              <span>global leaderboard slots, each with a ghost replay</span>
            </li>
            <li>
              <strong>10 days</strong>
              <span>two work sessions roughly a week apart</span>
            </li>
          </ul>
          <p className="bookpage-prose">
            Art pipeline mixed hand-painted car sprites with AI-generated
            environment art — trees, haybale variants, the Monte Rosa strip —
            pair-programmed commit by commit with an AI coding assistant.
          </p>
          <p className="bookpage-disclaimer">
            Omaggio a Tutto Bene · BorromeodeSilva × Race Service — fan-made,
            non-commercial. Not affiliated with or endorsed by the event; built
            purely as a tribute to a real road, a real climb, and a real party.
          </p>
          <a
            className="bookpage-cta"
            href="https://tuttobenegame2026.vercel.app/"
            target="_blank"
            rel="noreferrer"
          >
            Play TUTTO BENE
            <ArrowUpRight weight="bold" size={15} />
          </a>
          <p className="bookpage-folio">VIII</p>
        </div>
      ),
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Pasqua Wines: burgundy case with a cream wine label.                */
/* ------------------------------------------------------------------ */

const pasqua: BookDef = {
  id: "pasqua",
  title: "Pasqua Wines",
  size: { h: 336, d: 50 },
  spine: {
    bg: "#511422",
    color: "#efe3cf",
    label: "PASQUA",
    sub: "HOUSE OF THE UNCONVENTIONAL",
    font: "serif",
  },
  coverBg: "#511422",
  paper: "#efe6d2",
  lean: 0,
  cover: (
    <span className="bookcover bookcover-pasqua">
      <span className="bookcover-pasqua-rule" />
      <span className="bookcover-pasqua-label">
        <img src="/stickers/pasqua-logo.png" alt="" />
      </span>
      <span className="bookcover-pasqua-title">Software &amp; AI Internship</span>
      <span className="bookcover-pasqua-foot">VERONA · EST. 1925</span>
    </span>
  ),
  spread: {
    left: (
      <div className="bookpage bookpage-colophon">
        <span className="bookpage-mark is-wide">
          <img src="/stickers/pasqua-logo.png" alt="" />
        </span>
        <h2 className="bookpage-title">Pasqua Wines</h2>
        <p className="bookpage-role">Software &amp; AI Intern</p>
        <ul className="bookpage-meta">
          <li>
            <MapPinLine weight="bold" size={14} />
            Verona, Italy
          </li>
          <li>
            <CalendarBlank weight="bold" size={14} />
            Summer 2025
          </li>
          <li>
            <HourglassMedium weight="bold" size={14} />2 weeks
          </li>
        </ul>
        <div className="bookpage-tags">
          <span>Internal tools</span>
          <span>AI</span>
          <span>Automation</span>
        </div>
      </div>
    ),
    right: (
      <div className="bookpage bookpage-story">
        <ul className="bookpage-points">
          <li>
            Developed an internal meeting-room booking web app used across the
            estate.
          </li>
          <li>
            Built a bespoke AI-powered podcast that summarizes company news and
            key developments in the wine industry for employees.
          </li>
        </ul>
        <figure className="bookpage-plate is-bottle">
          <img
            src="/stickers/pasqua-amarone.png"
            alt="Bottle of Pasqua Amarone della Valpolicella"
            loading="lazy"
          />
          <figcaption>Amarone della Valpolicella, the flagship</figcaption>
        </figure>
        <span className="bookpage-private">
          <LockSimple weight="bold" size={14} />
          Internal tools, not public
        </span>
      </div>
    ),
  },
};

export const workBooks: BookDef[] = [borromeo, pasqua];
