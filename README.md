# X3r0Day's research notebook

A static personal site. No build framework; all articles are rendered into HTML before deployment. GitHub Pages can serve the committed files directly.

## Work locally

```sh
npm ci
npm run build
npm test
npm run preview
```

The preview runs at `http://127.0.0.1:3000` and serves the custom 404 page, including redirects from the retired layouts. Use `python3 scripts/serve.py --port 4173` for another port.

## Edit the site

- `templates/home.html`: personal introduction, projects, and about section.
- `templates/writing.html`: notebook layout and filter controls.
- `content/posts.json`: post titles, summaries, categories, and source filenames.
- `content/archive.json`: research links merged from the old audit and red-team pages.
- `blog/writeups/*.md`: the original article sources.
- `scripts/build.mjs`: shared page shell and Markdown-to-HTML generation.
- `style.css` and `blog/blog.css`: shared visual design and article typography.

Run `npm run build` after editing content or templates, and include the generated HTML in the same commit. Existing article URLs remain unchanged. The old `portfolio.html`, `redteaming.html`, `audit/`, and `exploits/exploits.html` layouts are retired; `assets/redirects.js` maps those addresses from the custom 404 page.

Typography uses two self-hosted fonts everywhere: Silkscreen for headings and Fragment Mono for body text, navigation, metadata, and code. `--heading` and `--body` in `style.css` define these shared roles; article pages inherit the same system. Their SIL Open Font License files are in `assets/fonts/`. Research previews are extracted from fenced code blocks in the original Markdown writeups. `content/posts.json` identifies the source block, contextual anchor, and highlighted line; the build fails if that block cannot be found. There are no bitmap images or generated research screenshots.

The homepage's hero scene and closing band use the ascii.rest library (MIT), loaded from a pinned, integrity-checked build through jsDelivr. The hero shows a fixed scene; the closing band picks a random scene from a short list on each visit, lazy-loads it when it comes near the viewport, and offers a button to choose another. The artwork has stepped pixel frames without visible labels or captions; descriptions are provided to screen readers instead. Both pieces pause off screen and hold a still frame when the reader prefers reduced motion. Both carry printable ASCII fallbacks, so the page still reads without the script.
