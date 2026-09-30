// The radio's stations: house classics in the key of Robin S's "Show Me Love",
// each tuned to its year, so the dial runs from 1987 to 1999. Every video is
// the official upload from the artist's or label's channel (or, where there is
// none, the label's auto-generated "Topic" track), checked to play embedded.

export type Station = {
  /** Where it sits on the dial, in MHz. */
  frequency: number;
  artist: string;
  title: string;
  year: number;
  videoId: string;
};

export const STATIONS: Station[] = [
  { frequency: 87.9, artist: "Frankie Knuckles", title: "Your Love", year: 1987, videoId: "hJEZNLGDXmo" },
  { frequency: 89.1, artist: "Black Box", title: "Ride on Time", year: 1989, videoId: "M0quXl_od3g" },
  { frequency: 91.1, artist: "CeCe Peniston", title: "Finally", year: 1991, videoId: "xk8mm1Qmt-Y" },
  { frequency: 91.5, artist: "Crystal Waters", title: "Gypsy Woman", year: 1991, videoId: "_KztNIg4cvE" },
  { frequency: 93.1, artist: "Robin S", title: "Show Me Love", year: 1993, videoId: "Ps2Jc28tQrw" },
  { frequency: 94.3, artist: "Barbara Tucker", title: "Beautiful People", year: 1994, videoId: "cAicP_hZzXs" },
  { frequency: 94.7, artist: "Kristine W", title: "Feel What You Want", year: 1994, videoId: "-cpyOYaTPAI" },
  { frequency: 94.9, artist: "Crystal Waters", title: "100% Pure Love", year: 1994, videoId: "zQX2q6WCrbE" },
  { frequency: 95.1, artist: "Livin' Joy", title: "Dreamer", year: 1995, videoId: "QFixpXRLiTU" },
  { frequency: 95.5, artist: "Alcatraz", title: "Giv Me Luv", year: 1995, videoId: "1T9WlUy0b3s" },
  { frequency: 95.7, artist: "Everything But The Girl", title: "Missing (Todd Terry Remix)", year: 1995, videoId: "IAkY5m00rpY" },
  { frequency: 95.9, artist: "Nightcrawlers", title: "Push the Feeling On", year: 1995, videoId: "7-BnB3xxUoA" },
  { frequency: 97.1, artist: "Ultra Naté", title: "Free", year: 1997, videoId: "JgRBkjgXHro" },
  { frequency: 98.1, artist: "Stardust", title: "Music Sounds Better With You", year: 1998, videoId: "FQlAEiCb8m0" },
  { frequency: 99.1, artist: "Moloko", title: "Sing It Back", year: 1999, videoId: "w1eN8vyVFIM" },
  { frequency: 99.5, artist: "Armand Van Helden", title: "You Don't Know Me", year: 1999, videoId: "-bsONE-kZwI" },
];

/** Robin S, where every visit starts. */
export const DEFAULT_STATION = STATIONS.findIndex((station) => station.videoId === "Ps2Jc28tQrw");

/** The printed range of the dial. */
export const DIAL_MIN = 87.5;
export const DIAL_MAX = 100.5;
