(function () {
  const listEl = document.getElementById('entriesList');
  const searchInput = document.getElementById('searchInput');
  const guideFirst = document.getElementById('guideFirst');
  const guideLast = document.getElementById('guideLast');
  const statCount = document.getElementById('statCount');

  let entries = [];
  let query = '';

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function fakePron(word) {
    return '/' + word.toLowerCase().replace(/[^a-z]/g, '-').replace(/-+/g, '-') + '/';
  }

  async function loadEntries() {
    try {
      const res = await fetch('/api/terms', { cache: 'no-store' });
      if (!res.ok) throw new Error('Could not load entries (status ' + res.status + ')');
      const data = await res.json();
      entries = Array.isArray(data) ? data : [];
      render();
    } catch (err) {
      listEl.innerHTML =
        '<div class="load-state error">Couldn\u2019t load the dictionary right now. Try refreshing.</div>';
      console.error(err);
    }
  }

  function render() {
    let list = entries.filter(
      (e) =>
        e.term.toLowerCase().includes(query.toLowerCase()) ||
        e.def.toLowerCase().includes(query.toLowerCase())
    );

    list.sort((a, b) => a.term.localeCompare(b.term));

    listEl.innerHTML = '';

    if (entries.length === 0) {
      listEl.innerHTML = '<div class="empty">No entries yet. Add one to terms.json to get started.</div>';
    } else if (list.length === 0) {
      listEl.innerHTML = '<div class="empty">No entries found. Maybe you should coin one.</div>';
    } else {
      list.forEach((e, i) => {
        const el = document.createElement('div');
        el.className = 'entry';
        el.innerHTML = `
          <div class="entry-num">${String(i + 1).padStart(2, '0')}</div>
          <div>
            <div class="entry-head">
              <span class="entry-term">${escapeHtml(e.term)}</span>
              <span class="entry-pron">${escapeHtml(e.pron || fakePron(e.term))}</span>
              <span class="entry-pos">${escapeHtml(e.pos || 'noun')}</span>
            </div>
            <p class="entry-def">${escapeHtml(e.def)}</p>
            ${e.example ? `<p class="entry-example">"${escapeHtml(e.example)}"</p>` : ''}
          </div>
        `;
        listEl.appendChild(el);
      });
    }

    const alpha = [...entries].sort((a, b) => a.term.localeCompare(b.term));
    guideFirst.textContent = alpha.length ? alpha[0].term : '\u2014';
    guideLast.textContent = alpha.length ? alpha[alpha.length - 1].term : '\u2014';

    statCount.textContent = `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`;
  }

  searchInput.addEventListener('input', (e) => {
    query = e.target.value;
    render();
  });

  loadEntries();
})();
