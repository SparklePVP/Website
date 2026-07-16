(function () {
  const lockScreen = document.getElementById('lockScreen');
  const editScreen = document.getElementById('editScreen');
  const accessCodeInput = document.getElementById('accessCode');
  const unlockBtn = document.getElementById('unlockBtn');
  const unlockError = document.getElementById('unlockError');
  const lockBtn = document.getElementById('lockBtn');
  const editStatus = document.getElementById('editStatus');
  const entriesEditList = document.getElementById('entriesEditList');
  const addBtn = document.getElementById('addBtn');

  let accessCode = '';

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function setStatus(msg, isError) {
    editStatus.textContent = msg || '';
    editStatus.style.color = isError ? '#e58a8a' : '';
  }

  async function apiRequest(path, options = {}) {
    const headers = Object.assign({}, options.headers, {
      'Content-Type': 'application/json',
      'x-edit-code': accessCode,
    });
    const res = await fetch(path, Object.assign({}, options, { headers }));
    let data = null;
    try {
      data = await res.json();
    } catch {
      // no body
    }
    if (!res.ok) {
      throw new Error((data && data.error) || `Request failed (${res.status})`);
    }
    return data;
  }

  async function loadEntries() {
    entriesEditList.innerHTML = '<div class="load-state">Loading entries…</div>';
    try {
      const res = await fetch('/api/terms', { cache: 'no-store' });
      const data = await res.json();
      renderEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      entriesEditList.innerHTML = '<div class="load-state error">Couldn\u2019t load entries.</div>';
      console.error(err);
    }
  }

  function renderEntries(entries) {
    if (entries.length === 0) {
      entriesEditList.innerHTML = '<div class="empty">No entries yet.</div>';
      return;
    }

    entriesEditList.innerHTML = '';
    entries.forEach((entry) => {
      const card = document.createElement('div');
      card.className = 'edit-card';
      card.innerHTML = `
        <div class="field">
          <label>Term</label>
          <input type="text" class="f-term" value="${escapeHtml(entry.term)}" maxlength="60">
        </div>
        <div class="field">
          <label>Definition</label>
          <textarea class="f-def" maxlength="400">${escapeHtml(entry.def)}</textarea>
        </div>
        <div class="field">
          <label>Example (optional)</label>
          <textarea class="f-example" maxlength="300">${escapeHtml(entry.example)}</textarea>
        </div>
        <div class="edit-card-actions">
          <button type="button" class="danger" data-action="delete">Delete</button>
          <button type="button" class="primary" data-action="save">Save</button>
        </div>
        <div class="save-hint" data-role="hint"></div>
      `;

      const hint = card.querySelector('[data-role="hint"]');

      card.querySelector('[data-action="save"]').addEventListener('click', async () => {
        const term = card.querySelector('.f-term').value.trim();
        const def = card.querySelector('.f-def').value.trim();
        const example = card.querySelector('.f-example').value.trim();
        if (!term || !def) {
          hint.textContent = 'Term and definition are required.';
          return;
        }
        hint.textContent = 'Saving…';
        try {
          await apiRequest(`/api/terms/${entry.id}`, {
            method: 'PUT',
            body: JSON.stringify({ term, pron: entry.pron, pos: entry.pos, def, example }),
          });
          hint.textContent = 'Saved.';
          setTimeout(() => (hint.textContent = ''), 1500);
        } catch (err) {
          hint.textContent = 'Error: ' + err.message;
        }
      });

      card.querySelector('[data-action="delete"]').addEventListener('click', async () => {
        if (!confirm(`Delete "${entry.term}"? This can't be undone.`)) return;
        try {
          await apiRequest(`/api/terms/${entry.id}`, { method: 'DELETE' });
          card.remove();
        } catch (err) {
          hint.textContent = 'Error: ' + err.message;
        }
      });

      entriesEditList.appendChild(card);
    });
  }

  unlockBtn.addEventListener('click', () => {
    const code = accessCodeInput.value.trim();
    if (!code) {
      unlockError.style.display = '';
      unlockError.textContent = 'Enter the access code.';
      return;
    }
    accessCode = code;
    unlockError.style.display = 'none';
    lockScreen.style.display = 'none';
    editScreen.style.display = '';
    setStatus('Editing unlocked');
    loadEntries();
  });

  accessCodeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') unlockBtn.click();
  });

  lockBtn.addEventListener('click', () => {
    accessCode = '';
    accessCodeInput.value = '';
    editScreen.style.display = 'none';
    lockScreen.style.display = '';
    setStatus('');
  });

  addBtn.addEventListener('click', async () => {
    const term = document.getElementById('nTerm').value.trim();
    const def = document.getElementById('nDef').value.trim();
    const example = document.getElementById('nExample').value.trim();
    if (!term || !def) {
      setStatus('Term and definition are required.', true);
      return;
    }
    setStatus('Adding…');
    try {
      await apiRequest('/api/terms', {
        method: 'POST',
        body: JSON.stringify({ term, def, example }),
      });
      document.getElementById('nTerm').value = '';
      document.getElementById('nDef').value = '';
      document.getElementById('nExample').value = '';
      setStatus('Added.');
      loadEntries();
    } catch (err) {
      setStatus('Error: ' + err.message, true);
    }
  });
})();
