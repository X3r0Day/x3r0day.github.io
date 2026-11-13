const article = document.querySelector('#post-content');
const tocLinks = [...document.querySelectorAll('.toc a')];
const progress = document.querySelector('.reading-progress');

if (article) {
    for (const table of article.querySelectorAll('table')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-scroll';
        wrapper.tabIndex = 0;
        wrapper.setAttribute('role', 'region');
        wrapper.setAttribute('aria-label', (table.querySelector('th')?.textContent.trim() || 'Data') + ' table');
        table.before(wrapper);
        wrapper.append(table);
    }

    for (const [index, pre] of [...article.querySelectorAll('pre')].entries()) {
        const code = pre.querySelector('code');
        if (!code) continue;
        const label = document.createElement('span');
        label.className = 'code-label';
        label.textContent = code.className.match(/language-([\w-]+)/)?.[1] || 'text';
        label.setAttribute('aria-hidden', 'true');
        pre.prepend(label);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'copy-code';
        button.textContent = 'Copy';
        button.setAttribute('aria-label', `Copy code block ${index + 1}`);
        button.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(code.textContent);
                button.textContent = 'Copied';
                button.setAttribute('aria-label', `Code block ${index + 1} copied`);
            } catch (_) {
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(code);
                selection.removeAllRanges();
                selection.addRange(range);
                button.textContent = 'Selected';
                button.setAttribute('aria-label', `Code block ${index + 1} selected; use your copy shortcut`);
            }
            setTimeout(() => {
                button.textContent = 'Copy';
                button.setAttribute('aria-label', `Copy code block ${index + 1}`);
            }, 1800);
        });
        pre.prepend(button);
    }

    const headings = [...article.querySelectorAll('h2[id]')];
    let scheduled = false;
    const updateReading = () => {
        scheduled = false;
        const top = article.getBoundingClientRect().top + window.scrollY;
        const range = article.offsetHeight - window.innerHeight;
        const position = Math.max(0, Math.min(1, (window.scrollY - top) / Math.max(1, range)));
        if (progress) progress.style.transform = `scaleX(${position})`;
        let current = headings[0]?.id;
        for (const heading of headings) {
            if (heading.getBoundingClientRect().top <= 130) current = heading.id;
        }
        for (const link of tocLinks) {
            if (link.getAttribute('href') === `#${current}`) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        }
    };
    const scheduleReading = () => {
        if (!scheduled) {
            scheduled = true;
            requestAnimationFrame(updateReading);
        }
    };
    window.addEventListener('scroll', scheduleReading, { passive: true });
    window.addEventListener('resize', scheduleReading);
    document.fonts.ready.then(updateReading);
    const toc = document.querySelector('.toc');
    if (toc && window.matchMedia('(max-width: 900px)').matches) toc.open = false;
    updateReading();
}
