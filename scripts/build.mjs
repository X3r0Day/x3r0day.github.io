import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { marked } from 'marked';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
async function assetUrl(path) {
    const hash = createHash('sha256').update(await readFile(resolve(root, path))).digest('hex').slice(0, 12);
    return `/${path}?v=${hash}`;
}
const sharedStylesheet = await assetUrl('style.css');
const articleStylesheet = await assetUrl('blog/blog.css');
const sharedScript = await assetUrl('script.js');
const posts = JSON.parse(await readFile(resolve(root, 'content/posts.json'), 'utf8'));
const archive = JSON.parse(await readFile(resolve(root, 'content/archive.json'), 'utf8'));
const origin = 'https://x3r0day.me';
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const searchIcon = '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>';

function header(active = '') {
    return `<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header"><div class="header-inner wrap">
    <a class="brand" href="/" aria-label="X3r0Day home">X3r0Day<span class="brand-suffix">Research &amp; notes</span></a>
    <nav class="site-nav" id="site-nav" aria-label="Main navigation">
        <a href="/"${active === 'home' ? ' aria-current="page"' : ''}>Research</a>
        <a href="/blog/"${active === 'blog' ? ' aria-current="page"' : ''}>Writeups</a>
        <a href="/#tools">Projects</a><a href="/#about">About</a>
    </nav>
    <div class="header-actions"><button class="search-trigger" type="button" aria-label="Search research" aria-controls="site-search" hidden>${searchIcon}</button><button class="menu-toggle" aria-controls="site-nav" aria-expanded="false" hidden>Menu <span aria-hidden="true">+</span></button></div>
</div></header>`;
}

function footer() {
    return `<footer class="site-footer wrap"><a class="footer-name" href="/">X3r0Day<span> / independent research</span></a><div><a href="https://github.com/X3r0Day">GitHub ↗</a><a href="https://x.com/X3r0DaySec">X / Twitter ↗</a><a href="mailto:cr4n@duck.com">Email ↗</a></div><span>© ${new Date().getUTCFullYear()}</span></footer>`;
}

function searchDialog() {
    const records = [...posts.map(post => ({ title: post.title, description: post.description, label: post.topic, url: `/blog/${post.slug}/` })), ...archive];
    return `<dialog id="site-search" class="search-dialog" aria-labelledby="search-title"><div class="search-dialog-heading"><h2 id="search-title">Search the index.</h2><button type="button" class="search-close" aria-label="Close search">×</button></div><label class="sr-only" for="site-query">Search research and projects</label><input id="site-query" type="search" placeholder="A finding, a tool, a question…" autocomplete="off" autofocus><p class="search-status" role="status"></p><ul class="search-results">${records.map(record => `<li data-search="${escape(`${record.title} ${record.description} ${record.label}`.toLowerCase())}"><a href="${escape(record.url)}"><span>${escape(record.label)}</span><strong>${escape(record.title)}</strong><span aria-hidden="true">↗</span></a></li>`).join('')}</ul><p class="search-empty" hidden>No matches. Try a different word.</p><div class="search-dialog-foot"><span>Research, not a search engine.</span><span>Esc to close</span></div></dialog>`;
}

function layout({ title, description, path, body, active = '', extraHead = '', extraScripts = '', bodyClass = '' }) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#1c1d20">
    <title>${escape(title)} | X3r0Day</title>
    <meta name="description" content="${escape(description)}">
    <meta name="author" content="X3r0Day">
    <meta property="og:title" content="${escape(title)}">
    <meta property="og:description" content="${escape(description)}">
    <meta property="og:type" content="${active === 'article' ? 'article' : 'website'}">
    <meta property="og:url" content="${origin}${path}">
    <link rel="canonical" href="${origin}${path}">
    <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
    <link rel="preload" href="/assets/fonts/fragment-mono-latin.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="/assets/fonts/silkscreen-400-latin.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="${sharedStylesheet}">
    ${extraHead}
    <script defer src="${sharedScript}"></script>
    ${extraScripts}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
${header(active === 'article' ? 'blog' : active)}
${body}
${footer()}
${searchDialog()}
</body>
</html>
`;
}

async function save(file, content) {
    const target = resolve(root, file);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, content.replace(/[ \t]+$/gm, ''));
}

const postData = [];
for (const post of posts) {
    const markdown = await readFile(resolve(root, 'blog/writeups', post.file), 'utf8');
    const excerpts = [...markdown.matchAll(/^```([^\n]*)\n([\s\S]*?)^```/gm)]
        .map(match => ({ language: match[1].trim(), code: match[2].trimEnd() }))
        .filter(block => block.code.includes(post.preview.contains))
        .sort((a, b) => a.code.length - b.code.length);
    if (!excerpts.length) throw new Error(`No source excerpt found for ${post.slug}`);
    const words = markdown.replace(/```[\s\S]*?```/g, '').split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 220));
    const headings = [];
    const used = new Map();
    const renderer = new marked.Renderer();
    renderer.heading = function ({ tokens, depth, text }) {
        if (depth === 1) return '';
        const plain = text.replace(/[`*_]/g, '').replace(/<[^>]*>/g, '');
        const base = plain.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
        const count = used.get(base) || 0;
        used.set(base, count + 1);
        const id = count ? `${base}-${count + 1}` : base;
        if (depth === 2) headings.push({ id, text: plain });
        return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
    };
    const content = marked.parse(markdown.replace(/^By X3r0Day[^\n]*\n/m, ''), { renderer });
    const toc = headings.map(heading => `<a href="#${heading.id}">${escape(heading.text)}</a>`).join('');
    const resources = post.resources.map(link => `<a href="${escape(link.url)}">${escape(link.label)} ↗</a>`).join('');
    const next = posts[(posts.indexOf(post) + 1) % posts.length];
    const body = `<div class="reading-progress" aria-hidden="true"></div>
<main id="main" class="article-page wrap">
    <header class="article-header"><a class="back-link" href="/blog/"><span aria-hidden="true">←</span> All writing</a><div class="article-meta"><span class="topic-tag ${post.color}">${escape(post.topic)}</span><span>${escape(post.dateLabel)}</span><span>${minutes} min read</span></div><h1>${escape(post.title)}</h1><p class="article-dek">${escape(post.description)}</p><div class="article-byline"><span class="author-mark" aria-hidden="true">x3</span><span>Words &amp; research by <strong>X3r0Day</strong></span><a class="source-link" href="/blog/writeups/${encodeURIComponent(post.file)}">View Markdown ↗</a></div></header>
    <div class="article-resources">${resources}</div>
    <div class="article-layout"><aside class="article-sidebar"><details class="toc" open><summary>In this article <span aria-hidden="true">⌄</span></summary><nav aria-label="Table of contents">${toc}</nav></details></aside><article class="prose" id="post-content">${content}</article></div>
    <div class="article-end"><span>Thanks for reading.</span><a class="text-link" href="/blog/">Back to all writing <span aria-hidden="true">↗</span></a></div>
    <a class="next-post ${next.color}" href="/blog/${next.slug}/"><div><span>Keep reading</span><h2>${escape(next.title)}</h2></div><span aria-hidden="true">↗</span></a>
</main>`;
    await save(`blog/${post.slug}/index.html`, layout({ title: post.title, description: post.description, path: `/blog/${post.slug}/`, body, active: 'article', bodyClass: 'reading-page', extraHead: `<link rel="stylesheet" href="${articleStylesheet}">`, extraScripts: '<script defer src="/blog/blog.js"></script>' }));
    postData.push({ ...post, minutes, excerpt: excerpts[0] });
}

function sourceExcerpt(post, featured = false) {
    const code = post.excerpt.code.split('\n').map(line => `<span${line.includes(post.preview.focus) ? ' class="code-focus"' : ''}>${escape(line)}</span>`).join('\n');
    return `<figure class="source-excerpt${featured ? ' source-excerpt--featured' : ''}"><figcaption><a href="/blog/${post.slug}/#${post.preview.anchor}">${escape(post.preview.source)}</a><span>From the writeup</span></figcaption><pre tabindex="0" aria-label="Source excerpt from ${escape(post.preview.source)}"><code class="language-${escape(post.excerpt.language)}">${code}</code></pre><p>${escape(post.preview.caption)}</p></figure>`;
}

function featuredEntry(post) {
    return `<article class="featured-entry"><div class="featured-copy"><div class="featured-meta"><span>${escape(post.topic)}</span><span class="finding-status">Release-branch fix / 31.2</span></div><h3><a href="/blog/${post.slug}/">Emacs directory locals:<br>code execution on file open.</a></h3><p class="featured-description">${escape(post.description)}</p><dl class="finding-record"><div><dt>Trigger</dt><dd>Opening a matching project file</dd></div><div><dt>Root cause</dt><dd>Execution before validation</dd></div><div><dt>Tested</dt><dd>31.1 &amp; pre-fix 32.0.50</dd></div></dl><div class="featured-links"><a class="read-link" href="/blog/${post.slug}/">Read the writeup <span aria-hidden="true">↗</span></a><a href="${escape(post.resources[0].url)}">Upstream advisory ↗</a></div></div>${sourceExcerpt(post, true)}</article>`;
}

function entry(post, index, notebook = false) {
    return `<article class="research-entry${notebook ? ' writing-card' : ''}" data-topic="${escape(post.topic)}" data-search="${escape(`${post.title} ${post.description} ${post.topic} ${post.label}`.toLowerCase())}"><div class="entry-copy"><div class="entry-meta"><span>${escape(post.topic)}</span><span>${escape(post.dateLabel)}</span></div><h${notebook ? '2' : '3'}><a href="/blog/${post.slug}/">${escape(post.title)}</a></h${notebook ? '2' : '3'}><p>${escape(post.description)}</p><div class="entry-links"><a class="read-link" href="/blog/${post.slug}/">Read the writeup <span aria-hidden="true">↗</span></a><span>${post.minutes} min read</span></div></div>${sourceExcerpt(post)}</article>`;
}

function archiveEntry(item) {
    return `<article class="archive-entry"><p>${escape(item.label)}</p><h3><a href="${escape(item.url)}">${escape(item.title)} <span aria-hidden="true">↗</span></a></h3><p>${escape(item.description)}</p><a class="archive-source" href="${escape(item.url)}">View original work ↗</a></article>`;
}

const archiveLinks = archive.map(archiveEntry).join('\n');
const home = (await readFile(resolve(root, 'templates/home.html'), 'utf8'))
    .replace('{{featured}}', featuredEntry(postData[0]))
    .replace('{{research}}', postData.slice(1).map((post, index) => entry(post, index)).join('\n'))
    .replace('{{archive}}', archiveLinks);
await save('index.html', layout({ title: 'Security research & notes', description: 'Independent security research by X3r0Day. Findings, source notes, disclosure details, and open-source tools.', path: '/', active: 'home', body: home, bodyClass: 'index-page', extraHead: '<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>', extraScripts: '<script type="module" src="https://cdn.jsdelivr.net/npm/ascii.rest@0.4.0/dist/ascii.js" integrity="sha384-SBNELtJu9hcp9Nd2BljjmOuQ4VUromhUiD1ENpl5swn1R1vJCH7/qR3BsQmmOJZA" crossorigin="anonymous"></script>' }));

const writing = (await readFile(resolve(root, 'templates/writing.html'), 'utf8'))
    .replaceAll('{{count}}', posts.length)
    .replace('{{posts}}', postData.map((post, index) => entry(post, index, true)).join('\n'))
    .replace('{{archive}}', archiveLinks);
await save('blog/index.html', layout({ title: 'The notebook', description: 'Research notes by X3r0Day. Bugs, reproducers, and the code paths behind them.', path: '/blog/', body: writing, active: 'blog' }));

const notFound = `<main id="main" class="simple-page wrap"><span class="error-mark" aria-hidden="true">404</span><p class="intro-label">A little off the map</p><h1>Nothing here.<br>Plenty to explore.</h1><p>This address doesn't point to a page. The research is still right where it belongs.</p><div class="simple-actions"><a class="button button-ink" href="/blog/">Browse the writing <span aria-hidden="true">↗</span></a><a class="text-link" href="/">Back to home</a></div></main><script src="/assets/redirects.js"></script>`;
await save('404.html', layout({ title: 'Page not found', description: 'This page could not be found. Explore security research and writing by X3r0Day.', path: '/404.html', body: notFound, extraHead: '<meta name="robots" content="noindex">' }));

await save('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/', '/blog/', ...posts.map(post => `/blog/${post.slug}/`)].map(path => `<url><loc>${origin}${path}</loc></url>`).join('')}</urlset>\n`);
console.log(`Built homepage, writing index, ${posts.length} articles, ${archive.length} archived research links, and sitemap.`);
