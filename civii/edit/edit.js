(function () {
  const accessCodeInput = document.getElementById('accessCode');
  const unlockBtn = document.getElementById('unlockBtn');
  const unlockError = document.getElementById('unlockError');
  const lockBtn = document.getElementById('lockBtn');
  const accessInline = document.getElementById('accessInline');
  const unlockedInline = document.getElementById('unlockedInline');
  const editStatus = document.getElementById('editStatus');
  const entriesEditList = document.getElementById('entriesEditList');
  const addBtn = document.getElementById('addBtn');
  const toggleAddBtn = document.getElementById('toggleAddBtn');
  const cancelAddBtn = document.getElementById('cancelAddBtn');
  const newEntryCard = document.getElementById('newEntryCard');
  const addToggleRow = document.getElementById('addToggleRow');
  const editSearch = document.getElementById('editSearch');
  const editCount = document.getElementById('editCount');
  const recentList = document.getElementById('recentList');
  const nPosPickerSlot = document.getElementById('nPosPicker');

  let accessCode = '';
  let unlocked = false;
  let allEntries = [];
  let query = '';
  const posOptions = ['noun', 'proper noun', 'verb', 'phrase', 'idiom', 'abbreviation', 'adjective', 'interjection'];

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function fakePron(word) {
    return '/' + word.toLowerCase().replace(/[^a-z]/g, '-').replace(/-+/g, '-') + '/';
  }

  function setStatus(msg, isError) {
    editStatus.textContent = msg || 'Editing unlocked';
    editStatus.style.color = isError ? '#e58a8a' : '';
  }

  function createPosPicker(selected) {
    const wrap = document.createElement('div');
    wrap.className = 'pos-picker';

    const selectedList = (selected || 'noun')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (selectedList.length === 0) selectedList.push('noun');

    const allOptions = [...posOptions];
    selectedList.forEach((s) => {
      if (!allOptions.some((o) => o.toLowerCase() === s.toLowerCase())) allOptions.push(s);
    });

    const pillsRow = document.createElement('div');
    pillsRow.className = 'pos-pills-row';
    wrap.appendChild(pillsRow);

    function updateValue() {
      const active = Array.from(pillsRow.querySelectorAll('.pos-pill.active')).map((b) => b.textContent);
      wrap.dataset.value = active.length ? active.join(', ') : 'noun';
    }

    function addPill(label, isActive) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pos-pill' + (isActive ? ' active' : '');
      btn.textContent = label;
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        updateValue();
      });
      pillsRow.appendChild(btn);
    }

    allOptions.forEach((opt) => addPill(opt, selectedList.some((s) => s.toLowerCase() === opt.toLowerCase())));

    const customRow = document.createElement('div');
    customRow.className = 'pos-custom-row';
    const customInput = document.createElement('input');
    customInput.type = 'text';
    customInput.placeholder = 'Custom tag…';
    customInput.maxLength = 30;
    const customBtn = document.createElement('button');
    customBtn.type = 'button';
    customBtn.className = 'pos-custom-add';
    customBtn.textContent = '+ Add';

    function addCustomTag() {
      const val = customInput.value.trim();
      if (!val) return;
      const existing = Array.from(pillsRow.querySelectorAll('.pos-pill')).find(
        (b) => b.textContent.toLowerCase() === val.toLowerCase()
      );
      if (existing) {
        existing.classList.add('active');
      } else {
        addPill(val, true);
      }
      customInput.value = '';
      updateValue();
    }

    customBtn.addEventListener('click', addCustomTag);
    customInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addCustomTag();
      }
    });

    customRow.appendChild(customInput);
    customRow.appendChild(customBtn);
    wrap.appendChild(customRow);

    updateValue();
    return wrap;
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
      allEntries = Array.isArray(data) ? data : [];
      renderEntries();
    } catch (err) {
      entriesEditList.innerHTML = '<div class="load-state error">Couldn\u2019t load entries.</div>';
      console.error(err);
    }
  }

  function truncate(str, max) {
    if (!str) return '';
    return str.length > max ? str.slice(0, max).trim() + '…' : str;
  }

  function renderRecent() {
    const recent = [...allEntries]
      .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))
      .slice(0, 5);
    if (recent.length === 0) {
      recentList.innerHTML = '<div class="recent-empty">No entries yet.</div>';
      return;
    }
    recentList.innerHTML = recent
      .map(
        (e) => `
        <div class="recent-item">
          <div class="recent-term">${escapeHtml(e.term)}</div>
          <div class="recent-def">${escapeHtml(truncate(e.def, 70))}</div>
        </div>
      `
      )
      .join('');
  }

  function renderEntries() {
    const filtered = allEntries.filter((e) => {
      const q = query.toLowerCase();
      return e.term.toLowerCase().includes(q) || (e.def || '').toLowerCase().includes(q);
    });

    editCount.textContent = query
      ? `${filtered.length} of ${allEntries.length}`
      : `${allEntries.length} ${allEntries.length === 1 ? 'entry' : 'entries'}`;

    entriesEditList.innerHTML = '';

    if (allEntries.length === 0) {
      entriesEditList.innerHTML = '<div class="empty">No entries yet.</div>';
      renderRecent();
      return;
    }
    if (filtered.length === 0) {
      entriesEditList.innerHTML = '<div class="empty">No matches.</div>';
      renderRecent();
      return;
    }

    filtered.forEach((entry) => {
      entriesEditList.appendChild(unlocked ? buildEditableCard(entry) : buildReadonlyCard(entry));
    });

    renderRecent();
  }

  function buildReadonlyCard(entry) {
    const el = document.createElement('div');
    el.className = 'readonly-entry';
    el.innerHTML = `
      <div class="entry-head">
        <span class="entry-term">${escapeHtml(entry.term)}</span>
        <span class="entry-pron">${escapeHtml(entry.pron || fakePron(entry.term))}</span>
        <span class="entry-pos">${escapeHtml(entry.pos || 'noun')}</span>
      </div>
      <p class="entry-def">${escapeHtml(entry.def)}</p>
      ${entry.example ? `<p class="entry-example">"${escapeHtml(entry.example)}"</p>` : ''}
    `;
    return el;
  }

  function buildEditableCard(entry) {
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
        <label>Part of speech</label>
        <div class="pos-picker-slot"></div>
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

    const posPicker = createPosPicker(entry.pos);
    card.querySelector('.pos-picker-slot').appendChild(posPicker);
    const hint = card.querySelector('[data-role="hint"]');

    card.querySelector('[data-action="save"]').addEventListener('click', async () => {
      const term = card.querySelector('.f-term').value.trim();
      const def = card.querySelector('.f-def').value.trim();
      const example = card.querySelector('.f-example').value.trim();
      const pos = posPicker.dataset.value;
      if (!term || !def) {
        hint.textContent = 'Term and definition are required.';
        return;
      }
      hint.textContent = 'Saving…';
      try {
        await apiRequest(`/api/terms/${entry.id}`, {
          method: 'PUT',
          body: JSON.stringify({ term, pron: entry.pron, pos, def, example }),
        });
        entry.term = term;
        entry.def = def;
        entry.example = example;
        entry.pos = pos;
        entry.updated_at = new Date().toISOString();
        renderRecent();
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
        allEntries = allEntries.filter((e) => e.id !== entry.id);
        renderEntries();
      } catch (err) {
        hint.textContent = 'Error: ' + err.message;
      }
    });

    return card;
  }

  function resetAddPosPicker() {
    const fresh = createPosPicker('noun');
    fresh.id = 'nPosPicker';
    addPosPicker.replaceWith(fresh);
    addPosPicker = fresh;
  }

  editSearch.addEventListener('input', (e) => {
    query = e.target.value;
    renderEntries();
  });

  unlockBtn.addEventListener('click', () => {
    const code = accessCodeInput.value.trim();
    if (!code) {
      unlockError.style.display = '';
      unlockError.textContent = 'Enter the access code.';
      return;
    }
    accessCode = code;
    unlocked = true;
    unlockError.style.display = 'none';
    accessInline.style.display = 'none';
    unlockedInline.style.display = '';
    addToggleRow.style.display = '';
    setStatus('Editing unlocked');
    renderEntries();
  });

  accessCodeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') unlockBtn.click();
  });

  lockBtn.addEventListener('click', () => {
    accessCode = '';
    unlocked = false;
    accessCodeInput.value = '';
    unlockedInline.style.display = 'none';
    accessInline.style.display = '';
    addToggleRow.style.display = 'none';
    newEntryCard.style.display = 'none';
    toggleAddBtn.textContent = '+ Add a new word';
    renderEntries();
  });

  toggleAddBtn.addEventListener('click', () => {
    const showing = newEntryCard.style.display !== 'none';
    newEntryCard.style.display = showing ? 'none' : '';
    toggleAddBtn.textContent = showing ? '+ Add a new word' : '\u2212 Hide add form';
    if (!showing) document.getElementById('nTerm').focus();
  });

  cancelAddBtn.addEventListener('click', () => {
    newEntryCard.style.display = 'none';
    toggleAddBtn.textContent = '+ Add a new word';
    document.getElementById('nTerm').value = '';
    document.getElementById('nDef').value = '';
    document.getElementById('nExample').value = '';
    resetAddPosPicker();
  });

  addBtn.addEventListener('click', async () => {
    const term = document.getElementById('nTerm').value.trim();
    const def = document.getElementById('nDef').value.trim();
    const example = document.getElementById('nExample').value.trim();
    const pos = addPosPicker.dataset.value;
    if (!term || !def) {
      setStatus('Term and definition are required.', true);
      return;
    }
    setStatus('Adding…');
    try {
      const created = await apiRequest('/api/terms', {
        method: 'POST',
        body: JSON.stringify({ term, def, example, pos }),
      });
      document.getElementById('nTerm').value = '';
      document.getElementById('nDef').value = '';
      document.getElementById('nExample').value = '';
      resetAddPosPicker();
      newEntryCard.style.display = 'none';
      toggleAddBtn.textContent = '+ Add a new word';
      setStatus('Added.');
      allEntries.push(created);
      renderEntries();
    } catch (err) {
      setStatus('Error: ' + err.message, true);
    }
  });

  const backToTopBtn = document.getElementById('backToTopBtn');
  window.addEventListener('scroll', () => {
    backToTopBtn.classList.toggle('visible', window.scrollY > 400);
  });
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // pos picker for the "add new word" form is built once, up front
  let addPosPicker = createPosPicker('noun');
  addPosPicker.id = 'nPosPicker';
  nPosPickerSlot.replaceWith(addPosPicker);

  loadEntries();
})();
