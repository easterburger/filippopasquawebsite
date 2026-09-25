export const INTRO_GATE_KEY = "fp-intro-gate-seen";

// Runs before first paint so returning visitors never see the server-rendered
// gate flash while React hydrates. PortfolioPage then unmounts it for real.
export const INTRO_SEEN_SCRIPT = `try{if(sessionStorage.getItem(${JSON.stringify(
  INTRO_GATE_KEY,
)})==="1")document.documentElement.dataset.introSeen=""}catch(e){}`;
