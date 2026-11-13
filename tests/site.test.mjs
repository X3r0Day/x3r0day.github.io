import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFile(resolve(root, path), 'utf8');
const posts = JSON.parse(await read('content/posts.json'));
const archive = JSON.parse(await read('content/archive.json'));

async function htmlFiles(directory) {
    const entries = await readdir(resolve(root, directory), { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const name = `${directory}/${entry.name}`;
        if (entry.isDirectory()) files.push(...await htmlFiles(name));
        else if (entry.name.endsWith('.html')) files.push(name);
    }
    return files;
}

test('all research is reachable from the homepage and notebook', async () => {
    const home = await read('index.html');
    const notebook = await read('blog/index.html');
    for (const post of posts) {
        assert.ok(home.includes(`/blog/${post.slug}/`), post.slug);
        assert.ok(notebook.includes(`/blog/${post.slug}/`), post.slug);
    }
    for (const item of archive) {
        assert.ok(home.includes(item.url.replaceAll('&', '&amp;')), item.title);
        assert.ok(notebook.includes(item.url.replaceAll('&', '&amp;')), item.title);
    }
    assert.equal((home.match(/<details class="tool"/g) || []).length, 5);
});

test('articles are rendered HTML, with working section anchors and source links', async () => {
    for (const post of posts) {
        const html = await read(`blog/${post.slug}/index.html`);
        assert.equal((html.match(/<h1[ >]/g) || []).length, 1, post.slug);
        assert.ok(html.includes('id="post-content"'));
        assert.ok(html.includes('<pre><code'), post.slug);
        assert.ok(!html.includes('Loading post...'));
        assert.ok(!html.includes('cdn.jsdelivr.net'));
        assert.ok(html.includes(`/blog/writeups/${encodeURIComponent(post.file)}`));
        const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
        assert.equal(ids.length, new Set(ids).size, `Duplicate IDs in ${post.slug}`);
        const toc = html.match(/aria-label="Table of contents">([\s\S]*?)<\/nav>/)?.[1];
        assert.ok(toc, post.slug);
        for (const [, id] of toc.matchAll(/href="#([^"]+)"/g)) {
            assert.ok(ids.includes(id), `Missing section ${id} in ${post.slug}`);
        }
    }
});

test('generated local links and assets resolve without build-time services', async () => {
    const files = ['index.html', '404.html', ...await htmlFiles('blog')];
    for (const file of files) {
        const html = await read(file);
        assert.ok(html.includes('name="viewport"'));
        assert.ok(html.includes('class="skip-link"'));
        for (const [, value] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
            const url = new URL(value.replaceAll('&amp;', '&'), `https://x3r0day.me/${file}`);
            if (url.origin !== 'https://x3r0day.me') continue;
            // A separate GitHub Pages project, not a route in this repository.
            if (url.pathname.startsWith('/WebShame/')) continue;
            const target = decodeURIComponent(url.pathname);
            await access(resolve(root, `.${target}${target.endsWith('/') ? 'index.html' : ''}`));
        }
    }
});

test('retired layouts are removed and old URLs remain mapped', async () => {
    const redirects = await read('assets/redirects.js');
    for (const file of ['redteaming.html', 'audit/index.html', 'exploits/exploits.html', 'portfolio.html']) {
        await assert.rejects(access(resolve(root, file)), { code: 'ENOENT' });
        assert.ok(redirects.includes(`/${file}`), file);
    }
    assert.ok(redirects.includes('Hermes Agent Unauth RCE'));
    assert.ok(redirects.includes('FSMonitor LRCE'));
    assert.ok(redirects.includes('Bun File Traversal'));
});

test('the Emacs article retains the advisory, fix detail, and original reproductions', async () => {
    const source = await read('blog/writeups/Emacs Dir Locals Code Execution.md');
    const html = await read('blog/emacs-dir-locals-code-execution/index.html');
    for (const text of ['https://www.openwall.com/lists/oss-security/2026/11/11/7', 'https://debbugs.gnu.org/82213', '31.2', 'eval-buffer', 'set-auto-mode--dir-local-valid-p']) {
        assert.ok(source.includes(text));
        assert.ok(html.includes(text));
    }
});

test('homepage previews quote actual writeup code rather than decorative imagery', async () => {
    const home = await read('index.html');
    assert.ok(!/<img\b/.test(home));
    assert.ok(!home.includes('assets/research/'));
    assert.ok(!home.includes('hero-reel'));
    assert.ok(!home.includes('brand-mark'));
    await assert.rejects(access(resolve(root, 'scripts/art.mjs')), { code: 'ENOENT' });

    const decode = value => value.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
    const rendered = [...home.matchAll(/<pre\b[^>]*><code class="language-[^"]*">([\s\S]*?)<\/code><\/pre>/g)].map(match => decode(match[1]));
    assert.equal(rendered.length, posts.length);
    for (const post of posts) {
        const markdown = await read(`blog/writeups/${post.file}`);
        const excerpts = [...markdown.matchAll(/^```[^\n]*\n([\s\S]*?)^```/gm)]
            .map(match => match[1].trimEnd())
            .filter(code => code.includes(post.preview.contains))
            .sort((a, b) => a.length - b.length);
        assert.ok(rendered.includes(excerpts[0]), `${post.slug}: preview differs from the original writeup`);
        const article = await read(`blog/${post.slug}/index.html`);
        assert.ok(article.includes(`id="${post.preview.anchor}"`), `${post.slug}: excerpt context is missing`);
    }
});

test('homepage art uses the pinned scene element with printable ASCII fallbacks', async () => {
    const home = await read('index.html');
    assert.ok(home.includes('<ascii-art'));
    assert.ok(home.includes('piece="aurora-fjord"'));
    assert.ok(home.includes('data-watch-art'));
    assert.ok(!/<img\b/.test(home));
    assert.ok(home.includes('https://cdn.jsdelivr.net/npm/ascii.rest@0.4.0/dist/ascii.js'));
    assert.ok(home.includes('integrity="sha384-'));

    const fallback = home.match(/<pre class="scene-fallback"[^>]*>([\s\S]*?)<\/pre>/)?.[1];
    assert.ok(fallback, 'Hero ASCII fallback is missing');
    assert.match(fallback, /^[\x20-\x7e\n]+$/);
    assert.ok(fallback.includes('___'));

    const watchFallback = home.match(/<pre class="watch-placeholder[^"]*"[^>]*>([\s\S]*?)<\/pre>/)?.[1];
    assert.ok(watchFallback, 'Watch ASCII fallback is missing');
    assert.match(watchFallback, /^[\x20-\x7e\n]+$/);
});

test('all pages share the same two-font typography system', async () => {
    const css = await read('style.css');
    const articleCss = await read('blog/blog.css');
    assert.match(css, /--heading:\s*var\(--pixel\)/);
    assert.match(css, /--body:\s*var\(--display\)/);
    assert.match(css, /h1, h2, h3, h4\s*\{[^}]*font-family:\s*var\(--heading\)/);
    assert.match(articleCss, /\.prose\s*\{[^}]*font-family:\s*var\(--body\)/);
    assert.doesNotMatch(css + articleCss, /Manrope|font-family:\s*sans-serif/);
    assert.doesNotMatch(articleCss, /\.prose h[234]\s*\{[^}]*font-family:/);
    const cssVersion = createHash('sha256').update(css).digest('hex').slice(0, 12);
    const articleVersion = createHash('sha256').update(articleCss).digest('hex').slice(0, 12);

    for (const file of ['index.html', '404.html', 'blog/index.html', ...posts.map(post => `blog/${post.slug}/index.html`)]) {
        const html = await read(file);
        assert.ok(html.includes('/assets/fonts/fragment-mono-latin.woff2'), file);
        assert.ok(html.includes('/assets/fonts/silkscreen-400-latin.woff2'), file);
        assert.ok(!html.includes('/assets/fonts/manrope-latin.woff2'), file);
        assert.ok(html.includes(`/style.css?v=${cssVersion}`), file);
        if (html.includes('class="reading-page"')) {
            assert.ok(html.includes(`/blog/blog.css?v=${articleVersion}`), file);
        }
    }
});

test('scenes have decorative pixel frames without visible labels or captions', async () => {
    const home = await read('index.html');
    const script = await read('script.js');
    const scriptVersion = createHash('sha256').update(script).digest('hex').slice(0, 12);
    assert.ok(home.includes(`/script.js?v=${scriptVersion}`));
    const scenes = [...home.matchAll(/<figure class="scene-frame[^\"]*"[^>]*>[\s\S]*?<\/figure>/g)].map(match => match[0]);
    assert.equal(scenes.length, 2);
    for (const scene of scenes) {
        assert.match(scene, /role="img" aria-label="[^"]+"/);
        assert.doesNotMatch(scene, /scene-bar|scene-live|scene-title|scene-spec|<figcaption/);
        assert.doesNotMatch(scene, /15 fps|200 × 100/);
    }
    assert.ok(home.includes('data-watch-shuffle'));
    assert.doesNotMatch(script, /data-watch-name|data-watch-note/);
    assert.match(script, /watchFigure\.setAttribute\('aria-label'/);
});

test('only the intro and latest research labels use a caret instead of dots', async () => {
    const home = await read('index.html');
    const css = await read('style.css');
    assert.equal((home.match(/class="bracket-label"/g) || []).length, 2);
    assert.match(home, /<p class="bracket-label">Independent security research \/ India<\/p>/);
    assert.match(home, /<h2 id="featured-title" class="bracket-label">Latest research<\/h2>/);
    assert.match(css, /\.bracket-label::before\s*\{[^}]*content: ">"/);
    assert.doesNotMatch(css, /\.bracket-label::after/);
    assert.match(css, /\.section-heading h2:not\(\.bracket-label\)::before\s*\{[^}]*width: 6px;[^}]*background: var\(--accent\)/);
    assert.match(css, /\.watch-heading h2::before\s*\{[^}]*background: var\(--amber\)/);
});

test('the featured panel uses the same border as the rest of the site', async () => {
    const css = await read('style.css');
    const articleCss = await read('blog/blog.css');
    assert.match(css, /\.featured-entry\s*\{[^}]*border:\s*2px solid var\(--line\)/);
    assert.doesNotMatch(css, /\.featured-entry\s*\{[^}]*border-top:\s*4px solid var\(--accent\)/);
    assert.match(articleCss, /\.next-post\s*\{[^}]*border:\s*2px solid var\(--line\)/);
    assert.doesNotMatch(articleCss, /\.next-post\s*\{[^}]*border-top:\s*4px solid var\(--accent\)/);
});
