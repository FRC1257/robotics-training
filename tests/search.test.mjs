import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  searchLessons,
  tokenize,
  buildSearchIndex,
} from "../platform/search.mjs";
const specs = [
  [
    "frc/1-Basics/Modern_Drivetrain_Project.md",
    "Project: swerve, localization and autonomous",
    "frc",
  ],
  ["frc/2-Sensors_And_Shuffleboard/3-Encoders.md", "Encoders", "frc"],
  [
    "frc/2-Sensors_And_Shuffleboard/8-Zeroing_Sensors.md",
    "Homing and zeroing sensors",
    "frc",
  ],
  [
    "frc/3-Closed_Loop_Control/2-Basics_of_PID.md",
    "PID: correct the error",
    "frc",
  ],
  [
    "frc/3-Closed_Loop_Control/4-Feedforward.md",
    "Feedforward: predict the effort",
    "frc",
  ],
  ["vision/PhotonVision/Code.md", "PhotonVision pose integration", "vision"],
  ["guides/troubleshooting.md", "Debug with evidence", "guides"],
  ["frc/1-Basics/2a-Motors.md", "Motors", "frc"],
  ["java/Textbook_Practice.md", "Java practice: predict, run, explain", "java"],
  ["java/1-Basics/6-Arrays.md", "Arrays", "java"],
];
const pages = specs.map(([id, title, section]) => ({
  id,
  title,
  section,
  href: "/" + id.replace(/\.md$/, ".html"),
  text: fs.readFileSync(new URL("../docs/" + id, import.meta.url), "utf8"),
}));
test("identifier tokenization preserves acronym and word boundaries", () => {
  assert.deepEqual(tokenize("PIDController CANSparkMax ArrayList"), [
    "pid",
    "controller",
    "can",
    "spark",
    "max",
    "array",
    "list",
  ]);
});
test("transposed spelling finds relevant lessons and marks fuzzy results", () => {
  for (const [query, id] of [
    ["swevre", "Modern_Drivetrain_Project"],
    ["encdoer", "3-Encoders"],
  ]) {
    const results = searchLessons(pages, query);
    assert.ok(
      results.some((r) => r.id.includes(id) && r.fuzzyUsed),
      query,
    );
    assert.ok(results[0].snippet);
    assert.deepEqual(results[0].matchedTerms, [query]);
  }
});
test("natural language and FRC synonyms find relevant modern lessons", () => {
  for (const [query, id] of [
    ["how do i tune pid", "2-Basics_of_PID"],
    ["robot not moving", "troubleshooting"],
    ["pose estimation", "PhotonVision"],
    ["feed forward", "4-Feedforward"],
    ["CANSparkMax", "Motors"],
    ["ArrayList", "Textbook_Practice"],
  ]) {
    const hits = searchLessons(pages, query, 10);
    assert.ok(
      hits.some((r) => r.id.includes(id)),
      `${query}: ${hits.map((h) => h.id)}`,
    );
  }
});
test("field weighting, phrase match, archive demotion and section filter", () => {
  const index = [
    {
      id: "frc/new.md",
      title: "PID tuning",
      section: "frc",
      href: "/new",
      text: "PID tuning helps.",
    },
    {
      id: "frc/archive/old.md",
      title: "PID tuning",
      section: "frc",
      href: "/old",
      text: "Historical lesson: PID tuning helps.",
    },
    {
      id: "java/other.md",
      title: "Other",
      section: "java",
      href: "/other",
      text: "pid tuning appears here.",
    },
  ];
  assert.equal(searchLessons(index, "PID tuning")[0].id, "frc/new.md");
  assert.deepEqual(
    searchLessons(index, "PID tuning", 20, { section: "java" }).map(
      (x) => x.id,
    ),
    ["java/other.md"],
  );
  assert.equal(buildSearchIndex(index), buildSearchIndex(index));
});
test("unusual input is bounded, safe, and does not invent matches", () => {
  assert.deepEqual(searchLessons(pages, "<script> !@#$%^&*"), []);
  assert.deepEqual(searchLessons(pages, "how do i"), []);
  assert.deepEqual(searchLessons(pages, "swevre", 0), []);
  assert.doesNotThrow(() => searchLessons(pages, "x".repeat(10000), 10));
  assert.deepEqual(searchLessons([], null), []);
});
test('advanced terminology finds concepts without counting one synonym as several query words',()=>{const advanced=[{id:'io.md',title:'Subsystem IO interfaces',section:'frc',href:'/io',text:'Define SubsystemIO as an interface for robot input and output abstraction.'},{id:'sim.md',title:'Simulated IO',section:'frc',href:'/sim',text:'Implement SubsystemIOSim with a separate simulation model.'},{id:'tables.md',title:'Interpolation lookup tables',section:'frc',href:'/tables',text:'Interpolate between measured table values using a lookup.'},{id:'other.md',title:'Kitchen table',section:'other',href:'/other',text:'The table is wooden.'}];for(const [query,id] of [['SubsystemIO','io.md'],['SubSystemIOSim','sim.md'],['IO abstractions','io.md'],['interpolation lookup tables','tables.md']])assert.ok(searchLessons(advanced,query,3).some(p=>p.id===id),query);assert.ok(!searchLessons(advanced,'interpolation lookup tables').some(p=>p.id==='other.md'));});
test('normalizes common subsystem casing and relevant technical aliases',()=>{assert.deepEqual(tokenize('SubSystemIOSim'),tokenize('SubsystemIOSim'));const index=[{id:'vision.md',title:'Vision delay',section:'vision',href:'/vision',text:'Capture timestamp and delayed measurements.'},{id:'filter.md',title:'Signal smoothing',section:'frc',href:'/filter',text:'Filter measurement noise.'},{id:'units.md',title:'Conversion factors',section:'frc',href:'/units',text:'Convert rotations to meters.'}];for(const [q,id] of [['latency','vision.md'],['filters','filter.md'],['low pass filter','filter.md'],['units','units.md']])assert.ok(searchLessons(index,q).some(p=>p.id===id),q);});
test('advanced queries find the actual generated lessons',async t=>{const {buildSite}=await import('../scripts/build-site.mjs');const os=await import('node:os'),path=await import('node:path');const temp=fs.mkdtempSync(path.join(os.tmpdir(),'frc-search-test-'));t.after(()=>fs.rmSync(temp,{recursive:true,force:true}));buildSite({outDir:temp});const index=JSON.parse(fs.readFileSync(path.join(temp,'search-index.json'),'utf8'));for(const [query,target] of [['SubsystemIO','1-IO_Interfaces.md'],['SubSystemIOSim','2-Simulation_IO.md'],['IO abstractions','1-IO_Interfaces.md'],['interpolation lookup tables','4-Interpolation_Tables.md'],['low pass filter','7-Filtering_And_Validity.md']])assert.ok(searchLessons(index,query,3).some(r=>r.id.endsWith(target)),`${query} did not find ${target} in top three`);const result=searchLessons(index,'interpolation lookup tables',1)[0];assert.ok(result.id.endsWith('4-Interpolation_Tables.md'));assert.ok(!result.snippet.replace(/^…/,'').startsWith(result.title));assert.doesNotMatch(result.snippet,/Prerequisites:|Outcome:|Time:/);assert.ok(result.text.includes(result.snippet.replace(/^…|…$/g,'')));assert.match(result.snippet,/calibration table/i);});

test('snippet falls back to real text when content has no body prose',()=>{const x=[{id:'one',title:'Encoder',section:'frc',href:'/one',text:'Encoder'}];assert.equal(searchLessons(x,'encoder')[0].snippet,'Encoder');});
