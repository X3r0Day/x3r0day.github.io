const oldPosts = new Map([
    ['Hermes Agent Unauth RCE', 'hermes-agent-unauth-rce'],
    ['FSMonitor LRCE', 'fsmonitor-lrce'],
    ['Bun File Traversal', 'bun-file-traversal']
]);
let oldPath = location.pathname;
try {
    oldPath = decodeURIComponent(oldPath);
} catch (_) {
    // Invalid percent encoding is left on the not-found page.
}
const legacyPages = new Map([
    ['/redteaming.html', '/#research'],
    ['/audit/', '/#more-research'],
    ['/audit', '/#more-research'],
    ['/audit/index.html', '/#more-research'],
    ['/exploits/', '/blog/'],
    ['/exploits', '/blog/'],
    ['/exploits/exploits.html', '/blog/'],
    ['/portfolio.html', '/#about']
]);
const legacyTarget = legacyPages.get(oldPath);
const match = oldPath.match(/^\/writeups\/([^/]+)\.(md|html)$/);
const slug = match && oldPosts.get(match[1]);
if (legacyTarget) {
    location.replace(legacyTarget);
} else if (slug) {
    location.replace(`/blog/${slug}/${location.search}${location.hash}`);
} else if (oldPath === '/writeups/' || oldPath === '/writeups/index.html') {
    location.replace(`/blog/${location.search}${location.hash}`);
}
