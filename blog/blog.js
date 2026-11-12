async function loadPost() {
    const content = document.getElementById('notepad-content');
    const source = document.getElementById('post-source');

    try {
        const response = await fetch(source.href);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const text = await response.text();
        if (!window.marked) throw new Error('Markdown renderer unavailable');
        content.innerHTML = marked.parse(text);
    } catch (error) {
        const message = document.createElement('p');
        message.textContent = `Could not load this post (${error.message}). Try reloading, or read the Markdown file below.`;
        content.replaceChildren(message);
    } finally {
        content.setAttribute('aria-busy', 'false');
    }
}

loadPost();
