# Getting Started

This assumes you are comfortable with the terminal and have installed [`npm`](https://www.npmjs.com/).

1. First clone the GitHub [repository](https://github.com/FRC1257/team-website-new/tree/main)
1. `cd` into `./SnailSite` and run `npm i` to initialize all dependencies
1. Enter `npm run dev` to start the website at `http://localhost:5173`

> [!ATTENTION]
> When you are updating the website, **DO NOT** commit directly to `main`. Instead, enter `git checkout -b new-branch-name` to create a new branch to push to. After committing, you would run `git push origin new-branch-name` to publish that new branch. Vercel will automatically create a testing deployment that you can access to make sure your changes deployed correctly.

> [!TIP]
> If you are the only one who is updating the website (i.e., there are no concurrent changes), then I recommend that you use the `dev` branch already set up to make your changes.

When you are ready to merge your changes to the live website (at [frc1257.org](https://frc1257.org)), make a pull request and accept the changes that way. Make sure the pull request is descriptive enough to document what you actually modified.
