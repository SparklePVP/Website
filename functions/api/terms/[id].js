function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function checkCode(request, env) {
  const code = request.headers.get('x-edit-code');
  return code && code === env.EDIT_CODE;
}

// PUT /api/terms/:id — update an existing entry
export async function onRequestPut(context) {
  const { request, env, params } = context;

  if (!checkCode(request, env)) {
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
    await env.DB
      .prepare('UPDATE terms SET term=?, pron=?, pos=?, def=?, example=? WHERE id=?')
      .bind(term, pron, pos, def, example, params.id)
      .run();
    return json({ success: true });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

// DELETE /api/terms/:id — remove an entry
export async function onRequestDelete(context) {
  const { request, env, params } = context;

  if (!checkCode(request, env)) {
    return json({ error: 'Invalid or missing access code' }, 401);
  }

  try {
    await env.DB.prepare('DELETE FROM terms WHERE id=?').bind(params.id).run();
    return json({ success: true });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}
