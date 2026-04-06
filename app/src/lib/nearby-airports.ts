export const NEARBY_AIRPORTS: Record<
  string,
  { code: string; city: string; drive_minutes: number }[]
> = {
  YEG: [{ code: "YYC", city: "Calgary", drive_minutes: 180 }],
  YYC: [{ code: "YEG", city: "Edmonton", drive_minutes: 180 }],
  YVR: [{ code: "SEA", city: "Seattle", drive_minutes: 180 }],
  YYZ: [
    { code: "BUF", city: "Buffalo", drive_minutes: 120 },
    { code: "YHM", city: "Hamilton", drive_minutes: 60 },
  ],
  JFK: [
    { code: "EWR", city: "Newark", drive_minutes: 40 },
    { code: "LGA", city: "LaGuardia", drive_minutes: 30 },
  ],
  SFO: [
    { code: "OAK", city: "Oakland", drive_minutes: 30 },
    { code: "SJC", city: "San Jose", drive_minutes: 45 },
  ],
  LAX: [
    { code: "BUR", city: "Burbank", drive_minutes: 30 },
    { code: "SNA", city: "Santa Ana", drive_minutes: 45 },
  ],
  IAD: [
    { code: "DCA", city: "Reagan National", drive_minutes: 45 },
    { code: "BWI", city: "Baltimore", drive_minutes: 60 },
  ],
  ORD: [{ code: "MDW", city: "Midway", drive_minutes: 40 }],
  MIA: [{ code: "FLL", city: "Fort Lauderdale", drive_minutes: 40 }],
  SEA: [{ code: "YVR", city: "Vancouver", drive_minutes: 180 }],
};
