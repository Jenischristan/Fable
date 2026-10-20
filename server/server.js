import express from 'express';
import { spawn } from 'node:child_process';

const app = express();
const PORT = 5000;

app.use(express.json());

const SQL_MAP = {
  '\0': '\\0', '\b': '\\b', '\t': '\\t', '\n': '\\n', '\r': '\\r',
  '\x1a': '\\Z', '"': '\\"', "'": "\\'", '\\': '\\\\',
};
// eslint-disable-next-line no-control-regex
const esc = (v) => String(v).replace(/[\0\x08\x09\x1a\n\r"'\\]/g, (m) => SQL_MAP[m]);

function runSql(sql) {
  return new Promise((resolve, reject) => {
    const child = spawn('mysql', ['-u', 'root', '--batch', '--raw', 'employee_db']);
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { err += d; });
    child.on('error', (e) => reject(new Error(`mysql client unavailable: ${e.message}`)));
    child.on('close', (code) => {
      if (code === 0) resolve(out);
      else reject(new Error(err.trim() || `mysql exited with code ${code}`));
    });
    child.stdin.on('error', () => {});
    child.stdin.end(sql);
  });
}

function parseTsv(text) {
  const lines = text.replace(/\n+$/, '').split('\n');
  if (!lines[0]) return [];
  const cols = lines[0].split('\t');
  return lines.slice(1).map((line) => {
    const vals = line.split('\t');
    const row = {};
    cols.forEach((c, i) => { row[c] = vals[i] ?? ''; });
    return row;
  });
}

const badRequest = (res, msg) => res.status(400).json({ ok: false, error: msg });

function validateEmployee(body) {
  const str = (name, max) => {
    const v = body[name];
    if (typeof v !== 'string' || !v.trim()) return `${name.replace('_', ' ')} is required`;
    if (v.trim().length > max) return `${name.replace('_', ' ')} must be at most ${max} characters`;
    return null;
  };
  const errors = [
    str('first_name', 50), str('last_name', 50), str('job_title', 80),
  ].filter(Boolean);

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (!email) errors.push('email is required');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) errors.push('invalid email format');

  const hireDate = typeof body.hire_date === 'string' ? body.hire_date : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(hireDate) || Number.isNaN(Date.parse(hireDate))) {
    errors.push('hire date must be a valid YYYY-MM-DD date');
  }

  const salary = Number(body.salary);
  if (!Number.isFinite(salary) || salary <= 0 || salary > 99999999.99) {
    errors.push('salary must be a positive number');
  }

  const deptId = Number(body.dept_id);
  if (!Number.isInteger(deptId) || deptId <= 0) errors.push('department is required');

  let managerId = body.manager_id;
  if (managerId === '' || managerId === null || managerId === undefined) managerId = null;
  else {
    managerId = Number(managerId);
    if (!Number.isInteger(managerId) || managerId <= 0) errors.push('invalid manager');
  }

  if (errors.length) return { errors };
  return {
    data: {
      first_name: String(body.first_name).trim(),
      last_name: String(body.last_name).trim(),
      email,
      hire_date: hireDate,
      job_title: String(body.job_title).trim(),
      salary,
      dept_id: deptId,
      manager_id: managerId,
    },
  };
}

function mysqlError(res, e) {
  const msg = e.message || '';
  if (msg.includes('1062')) return res.status(409).json({ ok: false, error: 'That email is already registered' });
  if (msg.includes('1452')) return res.status(400).json({ ok: false, error: 'Selected department or manager does not exist' });
  if (msg.includes('1644')) return res.status(400).json({ ok: false, error: msg.replace(/^ERROR \d+ \(45000\) at line \d+: /, '') });
  if (msg.includes('1265') || msg.includes('1264')) return res.status(400).json({ ok: false, error: 'Data truncated: check your input values' });
  return res.status(500).json({ ok: false, error: `Database error: ${msg}` });
}

app.get('/api/departments', async (_req, res) => {
  try {
    const rows = parseTsv(await runSql(
      'SELECT dept_id, dept_name, location, budget FROM departments ORDER BY dept_name;'
    ));
    res.json({ ok: true, departments: rows });
  } catch (e) {
    mysqlError(res, e);
  }
});

app.get('/api/employees', async (_req, res) => {
  try {
    const rows = parseTsv(await runSql(`
      SELECT emp_id, full_name, email, job_title, salary, hire_date,
             dept_name, manager_name, is_active
      FROM v_employee_directory
      ORDER BY emp_id DESC;
    `));
    res.json({ ok: true, employees: rows });
  } catch (e) {
    mysqlError(res, e);
  }
});

app.get('/api/summary', async (_req, res) => {
  try {
    const rows = parseTsv(await runSql('SELECT * FROM v_dept_summary ORDER BY dept_name;'));
    res.json({ ok: true, summary: rows });
  } catch (e) {
    mysqlError(res, e);
  }
});

app.get('/api/audit', async (_req, res) => {
  try {
    const rows = parseTsv(await runSql(`
      SELECT audit_id, emp_id, action, changed_by, changed_at
      FROM employee_audit
      ORDER BY audit_id DESC
      LIMIT 8;
    `));
    res.json({ ok: true, audit: rows });
  } catch (e) {
    mysqlError(res, e);
  }
});

app.post('/api/employees', async (req, res) => {
  const { errors, data } = validateEmployee(req.body || {});
  if (errors) return badRequest(res, errors.join('; '));

  const sql = `
    INSERT INTO employees (first_name, last_name, email, hire_date, job_title, salary, dept_id, manager_id)
    VALUES (
      '${esc(data.first_name)}',
      '${esc(data.last_name)}',
      '${esc(data.email)}',
      '${esc(data.hire_date)}',
      '${esc(data.job_title)}',
      ${data.salary},
      ${data.dept_id},
      ${data.manager_id === null ? 'NULL' : data.manager_id}
    );
    SELECT LAST_INSERT_ID() AS emp_id;
  `;
  try {
    const out = await runSql(sql);
    const rows = parseTsv(out);
    res.status(201).json({
      ok: true,
      emp_id: Number(rows.at(-1)?.emp_id) || null,
      message: 'Employee created — audit log, salary history and department headcount updated by triggers',
    });
  } catch (e) {
    mysqlError(res, e);
  }
});

app.get('/', (_req, res) => {
  res.type('html').send(PAGE);
});

app.listen(PORT, () => {
  console.log(`Employee DB website running on http://localhost:${PORT}`);
});

const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Fable — Employee Database</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: #000; color: #f2f2f2;
    font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
    padding: 32px 20px 64px;
  }
  .wrap { max-width: 960px; margin: 0 auto; }
  h1 { font-size: 22px; font-weight: 600; margin: 0 0 4px; }
  h2 { font-size: 15px; font-weight: 600; margin: 32px 0 12px; color: #d0d0d0; }
  .sub { color: #8a8a8a; font-size: 13px; margin: 0 0 24px; }
  .card { background: #0e0e0e; border: 1px solid #232323; border-radius: 12px; padding: 20px; }
  form { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
  label { display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: #9a9a9a; }
  input, select {
    background: #171717; border: 1px solid #2c2c2c; border-radius: 8px;
    color: #f2f2f2; padding: 10px 12px; font-size: 14px; width: 100%;
  }
  input:focus, select:focus { outline: none; border-color: #555; }
  .full { grid-column: 1 / -1; }
  button {
    grid-column: 1 / -1; background: #f2f2f2; color: #000; border: 0;
    border-radius: 8px; padding: 12px; font-size: 14px; font-weight: 600; cursor: pointer;
  }
  button:hover { background: #fff; }
  #msg { grid-column: 1 / -1; font-size: 13px; min-height: 18px; }
  #msg.ok { color: #6ee7a0; } #msg.err { color: #f87171; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: 9px 10px; border-bottom: 1px solid #1d1d1d; }
  th { color: #8a8a8a; font-weight: 500; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  th.num { text-align: right; }
  .empty { color: #666; font-size: 13px; padding: 12px 0; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  #empTable, #sumTable, #auditTable { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  @media (max-width: 980px) { .grid2 { grid-template-columns: 1fr; gap: 8px; } }
  @media (max-width: 760px) { form { grid-template-columns: 1fr; } }
  @media (max-width: 560px) {
    body { padding: 16px 12px 48px; }
    h1 { font-size: 19px; }
    h2 { margin-top: 24px; }
    .sub { font-size: 12px; }
    .card { padding: 14px; border-radius: 10px; }
    label { font-size: 13px; gap: 7px; }
    input, select { font-size: 16px; padding: 12px; }
    button { padding: 14px; font-size: 15px; }
    #empTable table, #sumTable table, #auditTable table { min-width: 440px; }
    th, td { padding: 8px; }
  }
  @media (max-width: 380px) {
    #empTable table, #sumTable table, #auditTable table { min-width: 400px; }
    th, td { font-size: 12px; }
  }
</style>
</head>
<body>
<div class="wrap">
  <h1>Employee Database</h1>
  <p class="sub">Insert records into <code>employee_db</code> — triggers write the audit log and keep department headcounts in sync.</p>

  <div class="card">
    <form id="empForm">
      <label>First name<input name="first_name" required maxlength="50" placeholder="Alice" /></label>
      <label>Last name<input name="last_name" required maxlength="50" placeholder="Morgan" /></label>
      <label>Email<input name="email" type="email" required maxlength="120" placeholder="alice.morgan@fable.io" /></label>
      <label>Hire date<input name="hire_date" type="date" required /></label>
      <label>Job title<input name="job_title" required maxlength="80" placeholder="Frontend Engineer" /></label>
      <label>Salary (USD)<input name="salary" type="number" min="1" step="0.01" required placeholder="98000" /></label>
      <label>Department<select name="dept_id" id="deptSel" required></select></label>
      <label>Manager (optional)<select name="manager_id" id="mgrSel"></select></label>
      <div id="msg"></div>
      <button type="submit">Insert employee</button>
    </form>
  </div>

  <div class="grid2">
    <div>
      <h2>Employees</h2>
      <div class="card"><div id="empTable" class="empty">Loading…</div></div>
    </div>
    <div>
      <h2>Department summary (trigger-maintained)</h2>
      <div class="card"><div id="sumTable" class="empty">Loading…</div></div>
      <h2>Recent audit entries</h2>
      <div class="card"><div id="auditTable" class="empty">Loading…</div></div>
    </div>
  </div>
</div>
<script>
const fmtMoney = (v) => Number(v).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const escHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

async function getJson(url, opts) {
  const r = await fetch(url, opts);
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.ok === false) throw new Error(j.error || ('Request failed: ' + r.status));
  return j;
}

async function loadDepartments() {
  const { departments } = await getJson('/api/departments');
  document.getElementById('deptSel').innerHTML =
    '<option value="">Choose department…</option>' +
    departments.map((d) => '<option value="' + d.dept_id + '">' + escHtml(d.dept_name) + ' — ' + escHtml(d.location) + '</option>').join('');
}

async function loadEmployees() {
  const { employees } = await getJson('/api/employees');
  const el = document.getElementById('empTable');
  if (!employees.length) { el.className = 'empty'; el.textContent = 'No employees yet.'; return; }
  el.className = '';
  el.innerHTML = '<table><thead><tr><th>ID</th><th>Name</th><th>Title</th><th>Dept</th><th class="num">Salary</th></tr></thead><tbody>' +
    employees.map((e) => '<tr><td>' + e.emp_id + '</td><td>' + escHtml(e.full_name) + '</td><td>' + escHtml(e.job_title) +
      '</td><td>' + escHtml(e.dept_name) + '</td><td class="num">' + fmtMoney(e.salary) + '</td></tr>').join('') +
    '</tbody></table>';
}

async function loadManagers() {
  const { employees } = await getJson('/api/employees');
  document.getElementById('mgrSel').innerHTML =
    '<option value="">No manager</option>' +
    employees.filter((e) => e.is_active === '1')
      .map((e) => '<option value="' + e.emp_id + '">' + escHtml(e.full_name) + '</option>').join('');
}

async function loadSummary() {
  const { summary } = await getJson('/api/summary');
  const el = document.getElementById('sumTable');
  if (!summary.length) { el.className = 'empty'; el.textContent = 'No departments.'; return; }
  el.className = '';
  el.innerHTML = '<table><thead><tr><th>Dept</th><th class="num">Head</th><th class="num">Payroll</th></tr></thead><tbody>' +
    summary.map((s) => '<tr><td>' + escHtml(s.dept_name) + '</td><td class="num">' + s.headcount +
      '</td><td class="num">' + fmtMoney(s.total_salary) + '</td></tr>').join('') +
    '</tbody></table>';
}

async function loadAudit() {
  const { audit } = await getJson('/api/audit');
  const el = document.getElementById('auditTable');
  if (!audit.length) { el.className = 'empty'; el.textContent = 'No audit entries.'; return; }
  el.className = '';
  el.innerHTML = '<table><thead><tr><th>#</th><th>Emp</th><th>Action</th><th>When</th></tr></thead><tbody>' +
    audit.map((a) => '<tr><td>' + a.audit_id + '</td><td>' + a.emp_id + '</td><td>' + escHtml(a.action) +
      '</td><td>' + escHtml(a.changed_at) + '</td></tr>').join('') +
    '</tbody></table>';
}

function refreshAll() {
  return Promise.all([loadEmployees(), loadManagers(), loadSummary(), loadAudit()]).catch((e) => {
    const el = document.getElementById('empTable');
    el.className = 'empty'; el.textContent = 'Error: ' + e.message;
  });
}

document.getElementById('empForm').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const form = ev.target;
  const msg = document.getElementById('msg');
  const body = Object.fromEntries(new FormData(form).entries());
  msg.className = ''; msg.textContent = 'Inserting…';
  try {
    const r = await getJson('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    msg.className = 'ok';
    msg.textContent = 'Inserted employee #' + r.emp_id + '. ' + r.message;
    form.reset();
    await refreshAll();
  } catch (e) {
    msg.className = 'err';
    msg.textContent = e.message;
  }
});

refreshAll();
loadDepartments().catch((e) => {
  const el = document.getElementById('empTable');
  el.className = 'empty'; el.textContent = 'Error loading departments: ' + e.message;
});
</script>
</body>
</html>`;
