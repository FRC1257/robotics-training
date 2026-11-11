<!-- ai-assisted -->

# About this course

Team 1257 students and mentors wrote this library over many seasons. In 2026 it was modernized: new lessons, runnable examples and interactive labs were added, and older lessons were kept with a "Historical lesson" note when their APIs predate the current season. This page explains two things the site shows you: lesson progress and AI-assisted content.

## Progress on this browser

Opening a lesson marks it complete. The check icon beside the lesson title records the visit, and learning paths use it to suggest what comes next. It does not show that you understood the lesson.

- **It is a visit, not a test.** Use the [knowledge checks](knowledge-checks.md), the labs and the practice projects to check yourself, then explain your result to a teammate or mentor.
- **You can undo it.** Select the check icon to mark a lesson not complete. The site remembers that choice and will not mark that lesson again when you reopen it.
- **Index pages are not lessons.** Section landing pages and the learning-paths hub never mark themselves complete.
- **Labs inside lessons do not count automatically.** A lab embedded in a lesson is marked complete only when you select its check icon or open the full lab page.
- **The knowledge checks are marked by hand.** Select the icon once you have worked through them.
- **It stays on this device.** Progress lives in this browser's local storage. Nothing is sent to a server and the site has no analytics. Use [Learning paths](learning-paths.md) to export, import or reset it.

## AI-assisted lessons

Some lessons and all seven interactive labs were drafted or substantially rewritten with help from an AI model during the 2026 modernization. These pages show a small "AI-assisted lesson" or "AI-assisted teaching model" label near the title.

AI assistance does not replace review. These pages cite their sources, pin the code they quote, and where possible are checked by automated tests: Java examples compile, lab models have numerical tests, and links are checked. Tests and sources reduce mistakes but cannot prove that an explanation is clear, complete or safe for your robot. **Ask a mentor to review anything before you apply it to hardware**, and report anything that looks wrong using the "Edit this lesson" link at the bottom of each page.

The label describes the writing only. Photographs, diagrams and screenshots are credited in their captions to their real sources. They are not AI-generated.

Labs are teaching models. They make their simplifying assumptions explicit and are not validated robot simulators or tuning tools.

## How to contribute

Lessons are Markdown files in the repository's `docs/` folder. To embed a lab in a lesson, add a marker such as `<!-- lab: pid -->` on its own line; the available labs are `pid`, `swerve`, `scheduler`, `encoder`, `motion`, `log` and `odometry`. To label a newly drafted page, add `<!-- ai-assisted -->` at the top. Older pages are listed in `platform/content-provenance.json`.
