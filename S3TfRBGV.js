const $ = (id) => document.getElementById(id);
const drop = $('drop'), fileInput = $('file'), preview = $('preview'), goBtn = $('go');

function markStep(name, state) { // state: idle | doing | done
  const el = document.querySelector(`.step[data-step="${name}"]`);
  if (!el) return;
  el.classList.remove('done', 'doing');
  if (state) el.classList.add(state);
}
function logPush(line) {
  const log = $('log');
  log.textContent += (log.textContent ? '\n' : '') + line;
  log.scrollTop = log.scrollHeight;
}

drop.addEventListener('click', () => fileInput.click());
drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
drop.addEventListener('dragleave', () => drop.classList.remove('over'));
drop.addEventListener('drop', (e) => {
  e.preventDefault(); drop.classList.remove('over');
  if (e.dataTransfer.files && e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', () => { if (fileInput.files[0]) setFile(fileInput.files[0]); });

let chosenFile = null;
function setFile(f) {
  if (!f.type.startsWith('image/')) { alert('请选择图片文件'); return; }
  chosenFile = f;
  const url = URL.createObjectURL(f);
  preview.style.display = 'flex';
  preview.innerHTML = '';
  const img = document.createElement('img'); img.src = url;
  const meta = document.createElement('div'); meta.className = 'meta';
  meta.textContent = `${f.name} · ${f.type} · ${fmtSize(f.size)}`;
  preview.appendChild(img); preview.appendChild(meta);
  goBtn.disabled = false;
}
function fmtSize(n) { return n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(1) + ' KB' : (n / 1048576).toFixed(2) + ' MB'; }

function dl(url, fname) {
  const a = document.createElement('a');
  a.href = url; a.download = fname; a.target = '_blank'; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove();
}

goBtn.addEventListener('click', async () => {
  if (!chosenFile) return;
  goBtn.disabled = true;
  ['auth', 'up', 'commit'].forEach((s) => markStep(s, 'idle'));
  $('result').innerHTML = '';
  $('log').textContent = '';

  const base = $('baseUrl').value.trim().replace(/\/$/, '');
  const formId = $('formId').value.trim();
  const ossHost = $('ossHost').value.trim().replace(/\/$/, '');

  const cookie = $('cookie').value.trim();
  const reqHeaders = { 'X-Requested-With': 'XMLHttpRequest' };
  if (cookie) reqHeaders['Cookie'] = cookie; // 同源下生效；跨域直连时浏览器会拦自定义 Cookie 头

  async function doStep(name, url, init) {
    markStep(name, 'doing');
    const t0 = performance.now();
    const bodyPreview = init.body instanceof FormData ? `FormData[${[...init.body.keys()].join(',')}]` :
      (typeof init.body === 'string' ? init.body.slice(0, 400) : String(init.body));
    try {
      const res = await fetch(url, { ...init, headers: { ...reqHeaders, ...(init.headers || {}) } });
      const text = await res.text();
      let parsed; try { parsed = JSON.parse(text); } catch (e) { parsed = text; }
      const ms = Math.round(performance.now() - t0);
      logPush(`[${name}] ${init.method || 'GET'} ${res.url || url}\n  -> ${res.status} (${ms}ms)\n  req: ${bodyPreview}\n  res: ${text.slice(0, 600)}\n`);
      markStep(name, 'done');
      return parsed;
    } catch (e) {
      markStep(name, 'idle');
      $('result').innerHTML = `<div class="err">${name} 请求失败（多半是 CORS / 未登录）：${e}</div>`;
      throw e;
    }
  }

  try {
    // ① applyauthorize
    const authz = await doStep('auth',
      `${base}/tea/api/external/sdk/attach/upload/image/applyauthorize`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId, externalUserId: '', formTenantId: '',
          attachInfoModelList: [{ acl: 1, contentType: chosenFile.type, originName: chosenFile.name, size: chosenFile.size }] }) });
    if (authz.code !== 0) throw new Error('applyauthorize: ' + authz.message);
    const info = authz.result.autorizationAttachInfos[0];
    const attachId = info.attachId, objectKey = info.data.objectKey;

    // ② 直传对象存储
    const fd = new FormData();
    fd.append('file', chosenFile, chosenFile.name);
    const up = await doStep('up',
      `${base}/tea/api/external/sdk/attach/uploadimage?objectKey=${encodeURIComponent(objectKey)}&partSeq=1&totalPartNum=1`,
      { method: 'POST', body: fd });
    if (up.code !== 0) throw new Error('uploadimage: ' + up.message);

    // ③ commit
    const commit = await doStep('commit',
      `${base}/tea/api/external/sdk/attach/upload/commit`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId, attachIds: [attachId], externalUserId: '', formTenantId: '' }) });
    if (commit.code !== 0) throw new Error('commit: ' + commit.message);

    const directUrl = `${ossHost}/${objectKey}`;
    const fname = chosenFile.name.replace(/[\\/:*?"<>|]/g, '_');
    $('result').innerHTML =
      `<div class="ok">✅ 上传成功 · attachId=${attachId}</div>
       <div class="link">直链：<a href="${directUrl}" target="_blank">${directUrl}</a>
       <div class="note">
         <button class="secondary" style="padding:2px 8px;margin-top:6px;font-size:12px" onclick="navigator.clipboard.writeText('${directUrl}')">复制</button>
         <button class="secondary" style="padding:2px 8px;margin-top:6px;margin-left:6px;font-size:12px" onclick="window.open('${directUrl}','_blank')">在新窗口打开</button>
         <button class="secondary" style="padding:2px 8px;margin-top:6px;margin-left:6px;font-size:12px" onclick="dl('${directUrl}','${fname}')">下载图片</button>
       </div></div>`;
  } catch (e) {
    if (!$('result').innerHTML) $('result').innerHTML = `<div class="err">失败：${e.message || e}</div>`;
  } finally {
    goBtn.disabled = false;
  }
});