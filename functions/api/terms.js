function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// GET /api/terms — public, anyone can read
export async function onRequestGet(context) {
  const { env } = context;
  try {
    const { results } = await env.DB
      .prepare('SELECT * FROM terms ORDER BY term COLLATE NOCASE ASC')
      .all();
    return json(results);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

// POST /api/terms — requires x-edit-code header matching the EDIT_CODE secret
export async function onRequestPost(context) {
  const { request, env } = context;

  const code = request.headers.get('x-edit-code');
  if (!code || code !== env.EDIT_CODE) {
    return json({ error: 'Invalid or missing access code' }, 401);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const term = (body.term || '').trim();
  const def = (body.def || '').trim();
  const pron = (body.pron || '').trim();
  const pos = (body.pos || 'noun').trim();
  const example = (body.example || '').trim();

  if (!term || !def) {
    return json({ error: 'Term and definition are required' }, 400);
  }

  try {
    const result = await env.DB
      .prepare('INSERT INTO terms (term, pron, pos, def, example) VALUES (?, ?, ?, ?, ?)')
      .bind(term, pron, pos, def, example)
      .run();
    return json({ id: result.meta.last_row_id, term, pron, pos, def, example }, 201);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}
