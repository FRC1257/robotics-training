# Awards

Adding awards is simple and is something we hope to do often! (Of course, however, awards aren't everything and are not our main mission in participating in FIRST)

# Tutorial

Navigate to `pages/` and open `awardDescriptions.ts`. It should look something like this.

```ts
export interface AwardProps {
  year: number;
  comp: string;
  award: string;
}

export type AwardPropsList = AwardProps[];

const awards = [
  {
    year: 2024,
    comp: "FMA Seneca Event 2024",
    award: "Engineering Inspiration Award",
  },
  { year: 2023, comp: "FMA Montgomery Event 2023", award: "Finalist" },
  {
    year: 2023,
    comp: "FMA Montgomery Event 2023",
    award: "Autonomous Award sponsored by Ford",
  },
  /* code below ommitted */
];
```

Note that the `AwardsProps` interface tells us exactly how to format our new awards.

To add a new award, simply insert a new `AwardProps` object at the beginning of the list.

For example, if we win DCMP in 2027, you would add it like this:

```ts
const awards = [
  { year: 2024, comp: "FMA District Championship", award: "Winner" },
  {
    year: 2024,
    comp: "FMA Seneca Event 2024",
    award: "Engineering Inspiration Award",
  },
  { year: 2023, comp: "FMA Montgomery Event 2023", award: "Finalist" },
  {
    year: 2023,
    comp: "FMA Montgomery Event 2023",
    award: "Autonomous Award sponsored by Ford",
  },
  /* code below ommitted */
];
```
