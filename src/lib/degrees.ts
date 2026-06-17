export const DEGREES = [
  "B.Tech",
  "B.E.",
  "B.Sc.",
  "B.C.A.",
  "B.Com",
  "B.B.A.",
  "B.A.",
  "B.Arch",
  "B.Pharma",
  "B.Ed",
  "B.Des",
  "B.H.M.",
  "M.Tech",
  "M.E.",
  "M.Sc.",
  "M.C.A.",
  "M.Com",
  "M.B.A.",
  "M.A.",
  "M.Arch",
  "PhD",
  "Other"
] as const;

export type Degree = (typeof DEGREES)[number];
