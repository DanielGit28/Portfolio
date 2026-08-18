# Daniel Zúñiga Rojas — Portfolio

Static site. No build step, no framework, no dependencies to install — just HTML, CSS, and vanilla JS, plus a vendored copy of Three.js for the hero's 3D career timeline.

## Structure

```
index.html          all page markup and copy
styles.css           design tokens + component styles + responsive breakpoints
script.js             layer picker / project gallery interactivity + the Three.js scene
vendor/three.min.js  Three.js r128, vendored locally (no CDN dependency)
fonts/                Space Grotesk + JetBrains Mono, self-hosted woff2 (latin subset)
assets/                project screenshots + CV-DanielZuniga.pdf
```

## Preview locally

Any static server works, e.g.:

```
python3 -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000`. Opening `index.html` directly via `file://` also works, though some browsers restrict WebGL canvas sizing slightly differently over `file://` — a local server is the more faithful preview.

## Deploy

Plain static files — no build command, no environment variables. This folder is already a git repo with one commit. Push it to GitHub first:

```
git remote add origin https://github.com/DanielGit28/<repo-name>.git
git branch -M main
git push -u origin main
```

Then pick one:

**Vercel** — `npx vercel --prod` in this directory, or import the GitHub repo at vercel.com/new. Framework preset: "Other". No build command, output directory `.`

**Netlify** — drag this folder onto app.netlify.com/drop for an instant preview URL, or `npx netlify-cli deploy --prod` / import the GitHub repo. Build command: none. Publish directory: `.`

**GitHub Pages** — after pushing, repo Settings → Pages → Deploy from branch → `main` / `/ (root)`. Site is live at `https://danielgit28.github.io/<repo-name>` a minute or two later.

For a custom domain (e.g. from your CV/contact info), all three platforms support adding one for free — the DNS step is the same everywhere: a CNAME (or A record, for apex domains) pointed at the host.

## Updating content

- Copy (bio, experience, project descriptions) lives directly in `index.html` — it's plain markup, not templated, so search-and-replace is safe.
- The 3D scene's slab labels are generated from the `LAYERS` array at the top of `script.js`. If you change a role/date/org in `index.html`'s layer cards or detail panels, update the matching entry in that array too so the 3D labels stay in sync.
- To add a project screenshot: drop the image in `assets/`, then add a `<button class="thumb ...">` in the relevant `.project-thumbs` group in `index.html` (copy an existing one as a template — `data-src`, `data-wide`, `data-caption`, and `aria-label` are all it needs).
