// ==============================
// DATA & KONSTANTA
// ==============================

const stowageFactor = {
    beras:   0.7,
    gabah:   0.5,
    jagung:  1.61,
    kedelai: 1.61,
    custom:  null
};

const dosisFumigan = {
    phostek:         2,
    deliciagastoxin: 2,
    quickphos:       2,
    shenphos:        2,
    fumiphos:        2,
    custom:          null
};

// ==============================
// HELPER FORMAT
// ==============================

const fmt = (val, desimal = 2) =>
    val.toLocaleString('id-ID', { minimumFractionDigits: desimal, maximumFractionDigits: desimal });

const fmtMl = (val) =>
    fmt(val, 1) + ' ml (' + fmt(val / 1000, 1) + ' liter)';

const fmtFog = (val) =>
    fmt(val) + ' ml (' + fmt(val / 1000) + ' liter)';

// ==============================
// TAB SWITCH
// ==============================

function switchTab(tab) {
    document.getElementById('tab-fumigasi').style.display    = tab === 'fumigasi'    ? 'block' : 'none';
    document.getElementById('tab-spraying').style.display    = tab === 'spraying'    ? 'block' : 'none';
    document.getElementById('tab-fogging').style.display     = tab === 'fogging'     ? 'block' : 'none';
    document.getElementById('tab-fumigasi-sf').style.display = tab === 'fumigasi-sf' ? 'block' : 'none';
    document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

// ==============================
// FUMIGASI - SUNGKUP FUNCTIONS
// ==============================

let sungkupCount = 1;

function onKomoditasChangeSungkup(selectEl) {
    const card    = selectEl.closest('section[data-sungkup]');
    const stowage = card.querySelector('.f-stowage');
    const factor  = stowageFactor[selectEl.value];
    if (factor !== null) {
        stowage.value    = factor;
        stowage.readOnly = true;
    } else {
        stowage.value    = '';
        stowage.readOnly = false;
    }
    onBrokenM3ChangeSungkup(card.querySelector('.f-broken-m3'));
}

function onBrokenM3ChangeSungkup(inputEl) {
    const card    = inputEl.closest('section[data-sungkup]');
    const m3      = parseFloat(card.querySelector('.f-broken-m3').value) || 0;
    const stowage = parseFloat(card.querySelector('.f-stowage').value) || 0;
    card.querySelector('.f-broken-ton').value = (stowage > 0 ? m3 * stowage : 0).toFixed(2);
}

function setModeQtySungkup(btn, mode) {
    const card = btn.closest('section[data-sungkup]');
    card.querySelector('.f-mode-qty-value').value = mode;
    const btnTotal  = card.querySelector('.btn-mode-total');
    const btnStapel = card.querySelector('.btn-mode-stapel');
    if (mode === 'total') {
        btnTotal.style.background  = '#1a6ef5';
        btnTotal.style.color       = '#fff';
        btnTotal.style.boxShadow   = '0 2px 8px rgba(26,110,245,0.3)';
        btnStapel.style.background = 'transparent';
        btnStapel.style.color      = '#64748b';
        btnStapel.style.boxShadow  = 'none';
    } else {
        btnStapel.style.background = '#1a6ef5';
        btnStapel.style.color      = '#fff';
        btnStapel.style.boxShadow  = '0 2px 8px rgba(26,110,245,0.3)';
        btnTotal.style.background  = 'transparent';
        btnTotal.style.color       = '#64748b';
        btnTotal.style.boxShadow   = 'none';
    }
    card.querySelector('.f-mode-total').style.display  = mode === 'total'  ? 'block' : 'none';
    card.querySelector('.f-mode-stapel').style.display = mode === 'stapel' ? 'block' : 'none';
}

function tambahStapelSungkup(btn) {
    const card  = btn.closest('section[data-sungkup]');
    const list  = card.querySelector('.f-stapel-list');
    const count = list.querySelectorAll('.stapel-row').length + 1;
    const div   = document.createElement('div');
    div.className          = 'stapel-row form-grid';
    div.style.marginBottom = '10px';
    div.innerHTML = `
        <div class="field" style="grid-column:span 1;">
            <label>Stapel ${count} (ton)</label>
            <div style="display:flex; gap:8px;">
                <input type="number" class="f-stapel-input" min="0" step="0.01"
                    placeholder="0.00" oninput="hitungTotalStapelSungkup(this)" style="flex:1;">
                <button type="button" onclick="hapusStapelSungkup(this)"
                    style="padding:8px 12px; background:#fee2e2; color:#e53e3e;
                    border:1.5px solid #fca5a5; border-radius:8px; cursor:pointer;
                    font-weight:700; font-size:13px;">✕</button>
            </div>
        </div>`;
    list.appendChild(div);
    hitungTotalStapelSungkup(div.querySelector('.f-stapel-input'));
}

function hapusStapelSungkup(btn) {
    const card = btn.closest('section[data-sungkup]');
    btn.closest('.stapel-row').remove();
    card.querySelectorAll('.stapel-row').forEach((row, i) => {
        row.querySelector('label').textContent = `Stapel ${i + 1} (ton)`;
    });
    const firstInput = card.querySelector('.f-stapel-input');
    if (firstInput) hitungTotalStapelSungkup(firstInput);
}

function hitungTotalStapelSungkup(inputEl) {
    const card   = inputEl.closest('section[data-sungkup]');
    const inputs = card.querySelectorAll('.f-stapel-input');
    let total = 0;
    inputs.forEach(inp => total += parseFloat(inp.value) || 0);
    card.querySelector('.f-total-stapel').textContent =
        total.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ton';
}

function getQtySungkup(card) {
    const mode = card.querySelector('.f-mode-qty-value').value;
    if (mode === 'total') {
        return parseFloat(card.querySelector('.f-qty').value) || 0;
    } else {
        let total = 0;
        card.querySelectorAll('.f-stapel-input').forEach(inp => {
            total += parseFloat(inp.value) || 0;
        });
        return total;
    }
}

function tambahSungkup() {
    sungkupCount++;
    const list = document.getElementById('f-sungkup-list');
    const sec  = document.createElement('section');
    sec.className       = 'card';
    sec.dataset.sungkup = sungkupCount;
    sec.innerHTML = `
        <div class="card-label">
            <span>Sungkup ${sungkupCount}</span>
            <button type="button" onclick="hapusSungkup(this)"
                style="background:#fee2e2; color:#e53e3e; border:1.5px solid #fca5a5;
                border-radius:6px; padding:4px 10px; cursor:pointer; font-weight:700; font-size:12px;">
                ✕ Hapus
            </button>
        </div>
        <div class="form-grid" style="margin-bottom:14px;">
            <div class="field">
                <label>Jenis Komoditi</label>
                <select class="f-commodity" onchange="onKomoditasChangeSungkup(this)">
                    <option value="beras">Beras</option>
                    <option value="gabah">Gabah</option>
                    <option value="jagung">Jagung</option>
                    <option value="kedelai">Kedelai</option>
                    <option value="custom">Lainnya (manual)</option>
                </select>
            </div>
            <div class="field">
                <label>Kode Sungkup</label>
                <input type="text" class="f-kode-sungkup" placeholder="Contoh: S-0${sungkupCount}">
            </div>
        </div>
        <div class="form-grid" style="margin-bottom:14px;">
            <div class="field">
                <label>Mode Input Kuantum</label>
                <div style="display:flex; gap:0; margin-top:6px; background:#f0f4f8; border-radius:8px; padding:4px;">
                    <button type="button" class="btn-mode-total"
                        onclick="setModeQtySungkup(this, 'total')"
                        style="flex:1; padding:9px 16px; border:none; border-radius:6px;
                        background:#1a6ef5; color:#fff; font-family:Arial,sans-serif;
                        font-size:13px; font-weight:700; cursor:pointer; transition:all 0.2s;">
                        Total
                    </button>
                    <button type="button" class="btn-mode-stapel"
                        onclick="setModeQtySungkup(this, 'stapel')"
                        style="flex:1; padding:9px 16px; border:none; border-radius:6px;
                        background:transparent; color:#64748b; font-family:Arial,sans-serif;
                        font-size:13px; font-weight:700; cursor:pointer; transition:all 0.2s;">
                        Per Stapel
                    </button>
                </div>
                <input type="hidden" class="f-mode-qty-value" value="total">
            </div>
        </div>
        <div class="f-mode-total">
            <div class="form-grid" style="margin-bottom:14px;">
                <div class="field">
                    <label>Kuantum Total (ton)</label>
                    <input type="number" class="f-qty" min="0" step="0.01" placeholder="0.00">
                </div>
            </div>
        </div>
        <div class="f-mode-stapel" style="display:none;">
            <div class="f-stapel-list" style="margin-bottom:8px;">
                <div class="stapel-row form-grid" style="margin-bottom:10px;">
                    <div class="field">
                        <label>Stapel 1 (ton)</label>
                        <input type="number" class="f-stapel-input" min="0" step="0.01"
                            placeholder="0.00" oninput="hitungTotalStapelSungkup(this)">
                    </div>
                </div>
            </div>
            <button type="button" onclick="tambahStapelSungkup(this)"
                style="background:var(--primary-light); color:var(--primary);
                border:1.5px dashed var(--primary); border-radius:8px; padding:8px 16px;
                font-family:Arial,sans-serif; font-size:13px; font-weight:700;
                cursor:pointer; width:100%; margin-bottom:12px;">
                + Tambah Stapel
            </button>
            <div style="padding:10px 14px; background:#f0f4f8; border-radius:8px;
                border-left:3px solid #1a6ef5; display:flex; justify-content:space-between;
                align-items:center; margin-bottom:14px;">
                <span style="font-size:12px; font-weight:600; color:#64748b;">Total Kuantum</span>
                <span class="f-total-stapel" style="font-size:16px; font-weight:800; color:#1a6ef5;">0,00 ton</span>
            </div>
        </div>
        <div class="form-grid">
            <div class="field">
                <label>Broken Space (m³)</label>
                <input type="number" class="f-broken-m3" min="0" step="0.01"
                    placeholder="0.00" oninput="onBrokenM3ChangeSungkup(this)">
            </div>
            <div class="field">
                <label>Stowage Factor (m³/ton)</label>
                <input type="number" class="f-stowage" value="0.7" readonly>
            </div>
            <div class="field">
                <label>Broken Space (ton)</label>
                <input type="number" class="f-broken-ton" placeholder="0.00" readonly>
            </div>
        </div>`;
    list.appendChild(sec);
}

function hapusSungkup(btn) {
    const card = btn.closest('section[data-sungkup]');
    if (document.querySelectorAll('#f-sungkup-list section').length > 1) {
        card.remove();
        document.querySelectorAll('#f-sungkup-list section').forEach((s, i) => {
            s.dataset.sungkup = i + 1;
            s.querySelector('.card-label span').textContent = `Sungkup ${i + 1}`;
        });
        sungkupCount = document.querySelectorAll('#f-sungkup-list section').length;
    } else {
        alert('Minimal harus ada 1 sungkup.');
    }
}

// ==============================
// FUMIGASI - EVENT HANDLERS
// ==============================

function onKomoditasChange() {
    const el = document.querySelector('.f-commodity');
    if (el) onKomoditasChangeSungkup(el);
}

function onBrokenM3Change() {
    const el = document.querySelector('.f-broken-m3');
    if (el) onBrokenM3ChangeSungkup(el);
}

function onFumiganChange() {
    const fumigan     = document.getElementById('f-fumigan').value;
    const dosisInput  = document.getElementById('f-dosis');
    const dosis       = dosisFumigan[fumigan];
    const customField = document.getElementById('f-fumigan-custom-field');

    if (fumigan === 'custom') {
        dosisInput.value    = '';
        dosisInput.readOnly = false;
        dosisInput.focus();
        customField.style.display = 'block';
    } else {
        dosisInput.value    = dosis;
        dosisInput.readOnly = true;
        customField.style.display = 'none';
        document.getElementById('f-fumigan-custom-nama').value = '';
    }
}

// ==============================
// FUMIGASI - KALKULASI
// ==============================

function hitungFumigasi() {
    const dosis       = parseFloat(document.getElementById('f-dosis').value) || 0;
    const fumiganEl   = document.getElementById('f-fumigan');
    const fumiganNama = fumiganEl.value === 'custom'
        ? (document.getElementById('f-fumigan-custom-nama').value || 'Custom')
        : fumiganEl.options[fumiganEl.selectedIndex].text.trim();
    const cards     = document.querySelectorAll('#f-sungkup-list section[data-sungkup]');
    const hasilList = document.getElementById('f-hasil-list');

    // lokasi
    const kanwil    = document.getElementById('f-kanwil').value || '—';
    const kancab    = document.getElementById('f-kancab').value || '—';
    const gudang    = document.getElementById('f-gudang').value || '—';
    const unitGudang = document.getElementById('f-unit-gudang').value || '—';

    document.getElementById('f-lokasi-info').innerHTML = `
        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:4px;">
            <span class="info-tag">${kanwil}</span>
            <span class="info-sep">·</span>
            <span class="info-tag">${kancab}</span>
            <span class="info-sep">·</span>
            <span class="info-tag">${gudang}</span>
            <span class="info-sep">·</span>
            <span class="info-tag">${unitGudang}</span>
        </div>`;

    hasilList.innerHTML = '';
    let infoHTML = '';
    let totalQtyAll = 0, totalBrokenAll = 0, totalTabletAll = 0;

    cards.forEach((card, idx) => {
        const kode      = card.querySelector('.f-kode-sungkup').value || `S-0${idx+1}`;
        const komoEl    = card.querySelector('.f-commodity');
        const komoditi  = komoEl.options[komoEl.selectedIndex].text;
        const qty       = getQtySungkup(card);
        const brokenTon = parseFloat(card.querySelector('.f-broken-ton').value) || 0;
        const totalTon  = qty + brokenTon;
        const tablet    = totalTon * dosis;
        const bulat     = Math.ceil(tablet);

        totalQtyAll    += qty;
        totalBrokenAll += brokenTon;
        totalTabletAll += bulat;

        infoHTML += `<span class="info-tag">${kode}</span><span class="info-sep">·</span>`;

        hasilList.innerHTML += `
            <div style="margin-bottom:16px;">
                <div style="font-size:11px; font-weight:700; letter-spacing:0.1em;
                    text-transform:uppercase; color:#1a6ef5; margin-bottom:10px; margin-top:8px;">
                    ${kode} — ${komoditi}
                </div>
                <div class="result-grid">
                    <div class="result-item">
                        <div class="result-label">Kuantum Tumpukan</div>
                        <div class="result-value">${fmt(qty)} ton</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Broken Space</div>
                        <div class="result-value">${fmt(brokenTon)} ton</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Total (ton)</div>
                        <div class="result-value">${fmt(totalTon)} ton</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Dosis Fumigan</div>
                        <div class="result-value">${dosis} tablet/ton</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Total Fumigan (tablet)</div>
                        <div class="result-value">${fmt(tablet)} tablet</div>
                    </div>
                    <div class="result-item highlight">
                        <div class="result-label">Total Fumigan Dibutuhkan</div>
                        <div class="result-value">${bulat.toLocaleString('id-ID')} tablet</div>
                    </div>
                </div>
            </div>
            ${idx < cards.length - 1 ? '<hr style="border:none; border-top:1px solid #e2e8f0; margin:8px 0;">' : ''}`;
    });

    document.getElementById('f-resultInfo').innerHTML =
        infoHTML + `<span class="info-tag">${fumiganNama}</span>`;

    // total gabungan
    const totalAll = totalQtyAll + totalBrokenAll;
    const gabungan = document.getElementById('f-total-gabungan');
    if (cards.length > 1) {
        gabungan.style.display = 'block';
        document.getElementById('f-res-total-qty').textContent     = fmt(totalQtyAll) + ' ton';
        document.getElementById('f-res-total-broken').textContent  = fmt(totalBrokenAll) + ' ton';
        document.getElementById('f-res-total-ton').textContent     = fmt(totalAll) + ' ton';
        document.getElementById('f-res-total-tablet').textContent  = totalTabletAll.toLocaleString('id-ID') + ' tablet';
    } else {
        gabungan.style.display = 'none';
    }

    tampilkanHasil('hasil-fumigasi');
    document.getElementById('btn-dl-fumigasi').style.display = 'flex';
}

// ==============================
// FUMIGASI - RESET
// ==============================

function resetFumigasi() {
    document.getElementById('f-sungkup-list').innerHTML = `
        <section class="card" data-sungkup="1">
            <div class="card-label">
                <span>Sungkup 1</span>
            </div>
            <div class="form-grid" style="margin-bottom:14px;">
                <div class="field">
                    <label>Jenis Komoditi</label>
                    <select class="f-commodity" onchange="onKomoditasChangeSungkup(this)">
                        <option value="beras">Beras</option>
                        <option value="gabah">Gabah</option>
                        <option value="jagung">Jagung</option>
                        <option value="kedelai">Kedelai</option>
                        <option value="custom">Lainnya (manual)</option>
                    </select>
                </div>
                <div class="field">
                    <label>Kode Sungkup</label>
                    <input type="text" class="f-kode-sungkup" placeholder="Contoh: S-01">
                </div>
            </div>
            <div class="form-grid" style="margin-bottom:14px;">
                <div class="field">
                    <label>Mode Input Kuantum</label>
                    <div style="display:flex; gap:0; margin-top:6px; background:#f0f4f8; border-radius:8px; padding:4px;">
                        <button type="button" class="btn-mode-total"
                            onclick="setModeQtySungkup(this, 'total')"
                            style="flex:1; padding:9px 16px; border:none; border-radius:6px;
                            background:#1a6ef5; color:#fff; font-family:Arial,sans-serif;
                            font-size:13px; font-weight:700; cursor:pointer; transition:all 0.2s;">
                            Total
                        </button>
                        <button type="button" class="btn-mode-stapel"
                            onclick="setModeQtySungkup(this, 'stapel')"
                            style="flex:1; padding:9px 16px; border:none; border-radius:6px;
                            background:transparent; color:#64748b; font-family:Arial,sans-serif;
                            font-size:13px; font-weight:700; cursor:pointer; transition:all 0.2s;">
                            Per Stapel
                        </button>
                    </div>
                    <input type="hidden" class="f-mode-qty-value" value="total">
                </div>
            </div>
            <div class="f-mode-total">
                <div class="form-grid" style="margin-bottom:14px;">
                    <div class="field">
                        <label>Kuantum Total (ton)</label>
                        <input type="number" class="f-qty" min="0" step="0.01" placeholder="0.00">
                    </div>
                </div>
            </div>
            <div class="f-mode-stapel" style="display:none;">
                <div class="f-stapel-list" style="margin-bottom:8px;">
                    <div class="stapel-row form-grid" style="margin-bottom:10px;">
                        <div class="field">
                            <label>Stapel 1 (ton)</label>
                            <input type="number" class="f-stapel-input" min="0" step="0.01"
                                placeholder="0.00" oninput="hitungTotalStapelSungkup(this)">
                        </div>
                    </div>
                </div>
                <button type="button" onclick="tambahStapelSungkup(this)"
                    style="background:var(--primary-light); color:var(--primary);
                    border:1.5px dashed var(--primary); border-radius:8px; padding:8px 16px;
                    font-family:Arial,sans-serif; font-size:13px; font-weight:700;
                    cursor:pointer; width:100%; margin-bottom:12px;">
                    + Tambah Stapel
                </button>
                <div style="padding:10px 14px; background:#f0f4f8; border-radius:8px;
                    border-left:3px solid #1a6ef5; display:flex; justify-content:space-between;
                    align-items:center; margin-bottom:14px;">
                    <span style="font-size:12px; font-weight:600; color:#64748b;">Total Kuantum</span>
                    <span class="f-total-stapel" style="font-size:16px; font-weight:800; color:#1a6ef5;">0,00 ton</span>
                </div>
            </div>
            <div class="form-grid">
                <div class="field">
                    <label>Broken Space (m³)</label>
                    <input type="number" class="f-broken-m3" min="0" step="0.01"
                        placeholder="0.00" oninput="onBrokenM3ChangeSungkup(this)">
                </div>
                <div class="field">
                    <label>Stowage Factor (m³/ton)</label>
                    <input type="number" class="f-stowage" value="0.7" readonly>
                </div>
                <div class="field">
                    <label>Broken Space (ton)</label>
                    <input type="number" class="f-broken-ton" placeholder="0.00" readonly>
                </div>
            </div>
        </section>`;
    sungkupCount = 1;
    document.getElementById('f-fumigan').value = 'phostek';
    document.getElementById('f-fumigan-custom-field').style.display = 'none';
    document.getElementById('f-fumigan-custom-nama').value = '';
    onFumiganChange();
    document.getElementById('f-hasil-list').innerHTML = '';
    document.getElementById('hasil-fumigasi').classList.remove('visible');
    document.getElementById('btn-dl-fumigasi').style.display = 'none';
}

// ==============================
// INSEKTISIDA CUSTOM
// ==============================

function onInsektisidaChange(prefix) {
    const select      = document.getElementById(prefix + '-insektisida');
    const dosisInput  = document.getElementById(prefix + '-dosis');
    const customField = document.getElementById(prefix + '-insektisida-custom-field');

    if (select.value === 'custom') {
        dosisInput.value    = '';
        dosisInput.readOnly = false;
        dosisInput.focus();
        customField.style.display = 'block';
    } else {
        if (prefix === 's')  dosisInput.value = '0.25';
        if (prefix === 'fg') dosisInput.value = '0.025';
        dosisInput.readOnly = true;
        customField.style.display = 'none';
        document.getElementById(prefix + '-insektisida-custom-nama').value = '';
    }
}

// ==============================
// SPRAYING - KALKULASI
// ==============================

function kalkulasiSpraying(p, l, t, teras, sisiPanjang, sisiLebar, stapel) {
    const dindingPanjang     = 2 * 2 * (p * t);
    const dindingLebar       = 2 * 2 * (l * t);
    const atap               = 2 * (p * l);
    const terasArea          = sisiPanjang * (p * teras) + sisiLebar * (l * teras);
    const stapelArea         = (stapel * 174) / 150;
    const subtotal           = dindingPanjang + dindingLebar + atap + terasArea + stapelArea;
    const lantaiTidak        = (stapel * 1) / 3.1;
    const total              = subtotal - lantaiTidak;
    const tambahanLingkungan = total * 0.1;
    const totalLingkungan    = total * 1.1;

    return { dindingPanjang, dindingLebar, atap, terasArea, stapelArea, subtotal, lantaiTidak, total, tambahanLingkungan, totalLingkungan };
}

function updateSpraying(r, p, l, t, teras, sisiPanjang, sisiLebar, stapel) {
    document.getElementById('r-dinding-panjang-rumus').textContent = `2 × 2 × (${p} × ${t})`;
    document.getElementById('r-dinding-lebar-rumus').textContent   = `2 × 2 × (${l} × ${t})`;
    document.getElementById('r-atap-rumus').textContent            = `2 × (${p} × ${l})`;
    document.getElementById('r-teras-rumus').textContent           = `${sisiPanjang}×(${p}×${teras}) + ${sisiLebar}×(${l}×${teras})`;
    document.getElementById('r-stapel-rumus').textContent          = `${stapel} × 174 ÷ 150`;
    document.getElementById('r-lantai-rumus').textContent          = `${stapel} × 1 ÷ 3.1`;

    document.getElementById('r-dinding-panjang').textContent = fmt(r.dindingPanjang) + ' m²';
    document.getElementById('r-dinding-lebar').textContent   = fmt(r.dindingLebar) + ' m²';
    document.getElementById('r-atap').textContent            = fmt(r.atap) + ' m²';
    document.getElementById('r-teras').textContent           = fmt(r.terasArea) + ' m²';
    document.getElementById('r-stapel').textContent          = fmt(r.stapelArea) + ' m²';
    document.getElementById('r-subtotal').textContent        = fmt(r.subtotal) + ' m²';
    document.getElementById('r-lantai').textContent          = '− ' + fmt(r.lantaiTidak) + ' m²';
    document.getElementById('r-total').textContent           = fmt(r.total) + ' m²';
}

function hitungSpraying() {
    const p           = parseFloat(document.getElementById('s-panjang').value) || 0;
    const l           = parseFloat(document.getElementById('s-lebar').value) || 0;
    const t           = parseFloat(document.getElementById('s-tinggi').value) || 0;
    const teras       = parseFloat(document.getElementById('s-teras').value) || 0;
    const sisiPanjang = parseFloat(document.getElementById('s-sisi-panjang').value) || 0;
    const sisiLebar   = parseFloat(document.getElementById('s-sisi-lebar').value) || 0;
    const stapel      = parseFloat(document.getElementById('s-stapel').value) || 0;
    const dosis       = parseFloat(document.getElementById('s-dosis').value) || 0;
    const lingkungan  = document.getElementById('s-lingkungan').checked;
    const komoditiEl  = document.getElementById('s-commodity');
    const komoditi    = komoditiEl.options[komoditiEl.selectedIndex].text;
    const insektisidaEl = document.getElementById('s-insektisida');
    const insektisida   = insektisidaEl.value === 'custom'
        ? (document.getElementById('s-insektisida-custom-nama').value || 'Custom')
        : insektisidaEl.options[insektisidaEl.selectedIndex].text;

    const r         = kalkulasiSpraying(p, l, t, teras, sisiPanjang, sisiLebar, stapel);
    const luasFinalRaw = lingkungan ? r.totalLingkungan : r.total;
    const luasFinal = pembulatanCustom(luasFinalRaw);
    const totalMl   = luasFinal * dosis;

    updateSpraying(r, p, l, t, teras, sisiPanjang, sisiLebar, stapel);

    const rowLingkungan = document.getElementById('r-row-lingkungan');
    const rowFinal      = document.getElementById('r-row-final');
    if (lingkungan) {
        rowLingkungan.style.display = '';
        rowFinal.style.display      = '';
        document.getElementById('r-lingkungan').textContent  = '+ ' + fmt(r.tambahanLingkungan) + ' m²';
        document.getElementById('r-total-final').textContent = fmt(r.totalLingkungan) + ' m²';
    } else {
        rowLingkungan.style.display = 'none';
        rowFinal.style.display      = 'none';
    }

    document.getElementById('s-resultInfo').innerHTML =
        `<span class="info-tag">${komoditi}</span>
         <span class="info-sep">·</span>
         <span class="info-tag">${insektisida}</span>
         <span class="info-sep">·</span>
         <span class="info-tag">${dosis} ml/m²</span>
         ${lingkungan ? '<span class="info-sep">·</span><span class="info-tag" style="background:#e6f9f3;color:#00a878;border-color:#b2f0e0;">+10% Lingkungan</span>' : ''}`;

    document.getElementById('s-resDindingP').textContent    = fmt(r.dindingPanjang) + ' m²';
    document.getElementById('s-resDindingL').textContent    = fmt(r.dindingLebar) + ' m²';
    document.getElementById('s-resAtap').textContent        = fmt(r.atap) + ' m²';
    document.getElementById('s-resTeras').textContent       = fmt(r.terasArea) + ' m²';
    document.getElementById('s-resStapel').textContent      = fmt(r.stapelArea) + ' m²';
    document.getElementById('s-resLantai').textContent      = '− ' + fmt(r.lantaiTidak) + ' m²';
    document.getElementById('s-resTotal').textContent       = fmt(luasFinal) + ' m²';
    document.getElementById('s-resPestisida').textContent   = fmtMl(totalMl);
    document.getElementById('s-resInsektisida').textContent = fmtMl(0.25 * luasFinal);
    document.getElementById('s-resAir').textContent         = fmtMl(29.75 * luasFinal);
    document.getElementById('s-resLarutan').textContent     = fmtMl(30 * luasFinal);

    const sKanwil = document.getElementById('s-kanwil').value || '—';
    const sKancab = document.getElementById('s-kancab').value || '—';
    const sGudang = document.getElementById('s-gudang').value || '—';
    const sUnit   = document.getElementById('s-unit-gudang').value || '—';
    document.getElementById('s-lokasi-info').innerHTML = `
        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:4px;">
            <span class="info-tag">${sKanwil}</span>
            <span class="info-sep">·</span>
            <span class="info-tag">${sKancab}</span>
            <span class="info-sep">·</span>
            <span class="info-tag">${sGudang}</span>
            <span class="info-sep">·</span>
            <span class="info-tag">${sUnit}</span>
        </div>`;

    tampilkanHasil('hasil-spraying');
    document.getElementById('btn-dl-spraying').style.display = 'flex';
}

// ==============================
// FOGGING - KALKULASI
// ==============================

function hitungFogging() {
    const p           = parseFloat(document.getElementById('fg-panjang').value) || 0;
    const l           = parseFloat(document.getElementById('fg-lebar').value) || 0;
    const teras       = parseFloat(document.getElementById('fg-teras').value) || 0;
    const sisiPanjang = parseFloat(document.getElementById('fg-sisi-panjang').value) || 0;
    const sisiLebar   = parseFloat(document.getElementById('fg-sisi-lebar').value) || 0;
    const dosis       = parseFloat(document.getElementById('fg-dosis').value) || 0;
    const komoditiEl  = document.getElementById('fg-commodity');
    const komoditi    = komoditiEl.options[komoditiEl.selectedIndex].text;
    const insektisidaEl = document.getElementById('fg-insektisida');
    const insektisida   = insektisidaEl.value === 'custom'
        ? (document.getElementById('fg-insektisida-custom-nama').value || 'Custom')
        : insektisidaEl.options[insektisidaEl.selectedIndex].text;

    const lantai    = p * l;
    const terasArea = sisiPanjang * (p * teras) + sisiLebar * (l * teras);
    const totalRaw = lantai + terasArea;
    const total = pembulatanCustom(totalRaw);
    const totalMl   = total * dosis;

    document.getElementById('fg-r-lantai-rumus').textContent = `${p} × ${l}`;
    document.getElementById('fg-r-teras-rumus').textContent  = `${sisiPanjang}×(${p}×${teras}) + ${sisiLebar}×(${l}×${teras})`;
    document.getElementById('fg-r-lantai').textContent       = fmt(lantai) + ' m²';
    document.getElementById('fg-r-teras').textContent        = fmt(terasArea) + ' m²';
    document.getElementById('fg-r-total').textContent        = fmt(total) + ' m²';

    document.getElementById('fg-resultInfo').innerHTML =
        `<span class="info-tag">${komoditi}</span>
         <span class="info-sep">·</span>
         <span class="info-tag">${insektisida}</span>
         <span class="info-sep">·</span>
         <span class="info-tag">${dosis} ml/m²</span>`;

    document.getElementById('fg-resLantai').textContent      = fmt(lantai) + ' m²';
    document.getElementById('fg-resTeras').textContent       = fmt(terasArea) + ' m²';
    document.getElementById('fg-resTotal').textContent       = fmt(total) + ' m²';
    document.getElementById('fg-resPestisida').textContent   = fmtFog(totalMl);
    document.getElementById('fg-resInsektisida').textContent = fmtFog(totalMl);
    document.getElementById('fg-resAir').textContent         = fmtFog(total - totalMl);
    document.getElementById('fg-resLarutan').textContent     = fmtFog(total * 1);

    const fgKanwil = document.getElementById('fg-kanwil').value || '—';
    const fgKancab = document.getElementById('fg-kancab').value || '—';
    const fgGudang = document.getElementById('fg-gudang').value || '—';
    const fgUnit   = document.getElementById('fg-unit-gudang').value || '—';
    document.getElementById('fg-lokasi-info').innerHTML = `
        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:4px;">
            <span class="info-tag">${fgKanwil}</span>
            <span class="info-sep">·</span>
            <span class="info-tag">${fgKancab}</span>
            <span class="info-sep">·</span>
            <span class="info-tag">${fgGudang}</span>
            <span class="info-sep">·</span>
            <span class="info-tag">${fgUnit}</span>
        </div>`;

    tampilkanHasil('hasil-fogging');
    document.getElementById('btn-dl-fogging').style.display = 'flex';
}

// ==============================
// FUMIGASI SF - KALKULASI
// ==============================

function onKomoditasSFChange() {
    const komoditas = document.getElementById('sf-commodity').value;
    const input     = document.getElementById('sf-stowage');
    const factor    = stowageFactor[komoditas];
    if (factor !== null) {
        input.value    = factor;
        input.readOnly = true;
    } else {
        input.value    = '';
        input.readOnly = false;
        input.focus();
    }
}

function onObatSFChange() {
    const obat  = document.getElementById('sf-obat').value;
    const input = document.getElementById('sf-dosis');
    if (obat === 'indofum') {
        input.value    = 18;
        input.readOnly = true;
    } else {
        input.value    = '';
        input.readOnly = false;
        input.focus();
    }
}

function hitungFumigaziSF() {
    const qty      = parseFloat(document.getElementById('sf-qty').value) || 0;
    const brokenM3 = parseFloat(document.getElementById('sf-broken-m3').value) || 0;
    const dosis    = parseFloat(document.getElementById('sf-dosis').value) || 0;
    const komoEl   = document.getElementById('sf-commodity');
    const komoditi = komoEl.options[komoEl.selectedIndex].text;
    const obatEl   = document.getElementById('sf-obat');
    const obat     = obatEl.options[obatEl.selectedIndex].text;

    const totalObatG  = brokenM3 * dosis;
    const totalObatKg = totalObatG / 1000;
    const bulatG      = Math.ceil(totalObatG  * 10) / 10;
    const bulatKg     = Math.ceil(totalObatKg * 10) / 10;

    document.getElementById('sf-resultInfo').innerHTML =
        `<span class="info-tag">${komoditi}</span>
         <span class="info-sep">·</span>
         <span class="info-tag">${fmt(qty)} ton</span>
         <span class="info-sep">·</span>
         <span class="info-tag">${obat}</span>`;

    document.getElementById('sf-resTumpukanM3').textContent = fmt(qty) + ' ton';
    document.getElementById('sf-resBroken').textContent     = fmt(brokenM3) + ' m³';
    document.getElementById('sf-resTotalM3').textContent    = fmt(brokenM3) + ' m³ (volume sungkup)';
    document.getElementById('sf-resDosis').textContent      = dosis + ' g/m³';
    document.getElementById('sf-resTotal').textContent      =
        fmt(bulatG, 1) + ' g (' + fmt(bulatKg, 1) + ' kg)';

    const sfKanwil = document.getElementById('sf-kanwil').value || '—';
    const sfKancab = document.getElementById('sf-kancab').value || '—';
    const sfGudang = document.getElementById('sf-gudang').value || '—';
    const sfUnit   = document.getElementById('sf-unit-gudang').value || '—';
    document.getElementById('sf-lokasi-info').innerHTML = `
        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:4px;">
            <span class="info-tag">${sfKanwil}</span>
            <span class="info-sep">·</span>
            <span class="info-tag">${sfKancab}</span>
            <span class="info-sep">·</span>
            <span class="info-tag">${sfGudang}</span>
            <span class="info-sep">·</span>
            <span class="info-tag">${sfUnit}</span>
        </div>`;

    tampilkanHasil('hasil-fumigasi-sf');
    document.getElementById('btn-dl-fumigasi-sf').style.display = 'flex';
}

function pembulatanCustom(angka) {
    const desimal = angka - Math.floor(angka);
    if (desimal >= 0.5) {
        return Math.ceil(angka);
    } else {
        return Math.floor(angka);
    }
}

// ==============================
// HELPER
// ==============================

function tampilkanHasil(id) {
    const el = document.getElementById(id);
    el.classList.add('visible');
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetForm(tab) {
    if (tab === 'fumigasi')
        ['f-kanwil','f-kancab','f-gudang','f-unit-gudang'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('f-total-gabungan').style.display = 'none';
    {
        resetFumigasi();
    }
    
    if (tab === 'spraying') {
        ['s-panjang','s-lebar','s-tinggi','s-teras','s-sisi-panjang',
         's-sisi-lebar','s-stapel'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('s-commodity').value    = 'beras';
        document.getElementById('s-insektisida').value  = 'alfastore';
        document.getElementById('s-lingkungan').checked = false;
        document.getElementById('s-insektisida-custom-field').style.display = 'none';
        document.getElementById('s-insektisida-custom-nama').value = '';
        document.getElementById('s-dosis').value    = '0.25';
        document.getElementById('s-dosis').readOnly = true;
        document.getElementById('r-row-lingkungan').style.display = 'none';
        document.getElementById('r-row-final').style.display      = 'none';
        ['r-dinding-panjang','r-dinding-lebar','r-atap','r-teras','r-stapel',
         'r-subtotal','r-lantai','r-total','r-dinding-panjang-rumus',
         'r-dinding-lebar-rumus','r-atap-rumus','r-teras-rumus',
         'r-stapel-rumus','r-lantai-rumus'].forEach(id => document.getElementById(id).textContent = '—');
        document.getElementById('hasil-spraying').classList.remove('visible');
        document.getElementById('btn-dl-spraying').style.display = 'none';
        ['s-kanwil','s-kancab','s-gudang','s-unit-gudang'].forEach(id => document.getElementById(id).value = '');
    }
    if (tab === 'fogging') {
        ['fg-panjang','fg-lebar','fg-tinggi','fg-teras',
         'fg-sisi-panjang','fg-sisi-lebar'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('fg-commodity').value   = 'beras';
        document.getElementById('fg-insektisida').value = 'alfastore';
        document.getElementById('fg-insektisida-custom-field').style.display = 'none';
        document.getElementById('fg-insektisida-custom-nama').value = '';
        document.getElementById('fg-dosis').value    = '0.025';
        document.getElementById('fg-dosis').readOnly = true;
        ['fg-r-lantai','fg-r-teras','fg-r-total',
         'fg-r-lantai-rumus','fg-r-teras-rumus'].forEach(id => document.getElementById(id).textContent = '—');
        document.getElementById('hasil-fogging').classList.remove('visible');
        document.getElementById('btn-dl-fogging').style.display = 'none';
        ['fg-kanwil','fg-kancab','fg-gudang','fg-unit-gudang'].forEach(id => document.getElementById(id).value = '');
    }
    if (tab === 'fumigasi-sf') {
        document.getElementById('sf-qty').value       = '';
        document.getElementById('sf-broken-m3').value = '';
        document.getElementById('sf-commodity').value = 'beras';
        document.getElementById('sf-obat').value      = 'indofum';
        onKomoditasSFChange();
        onObatSFChange();
        document.getElementById('hasil-fumigasi-sf').classList.remove('visible');
        document.getElementById('btn-dl-fumigasi-sf').style.display = 'none';
        ['sf-kanwil','sf-kancab','sf-gudang','sf-unit-gudang'].forEach(id => document.getElementById(id).value = '');
    }
}

// ==============================
// INISIALISASI
// ==============================

document.getElementById('s-lingkungan-label').addEventListener('click', function() {
    const cb    = document.getElementById('s-lingkungan');
    const box   = document.getElementById('s-lingkungan-box');
    const check = document.getElementById('s-lingkungan-check');
    const label = document.getElementById('s-lingkungan-label');

    cb.checked = !cb.checked;

    if (cb.checked) {
        box.style.background    = '#1a6ef5';
        box.style.borderColor   = '#1a6ef5';
        check.style.display     = 'block';
        label.style.borderColor = '#1a6ef5';
        label.style.background  = '#e8f0fe';
    } else {
        box.style.background    = '#fff';
        box.style.borderColor   = '#e2e8f0';
        check.style.display     = 'none';
        label.style.borderColor = '#e2e8f0';
        label.style.background  = '#f8fafc';
    }
});

onKomoditasChange();
onFumiganChange();
onObatSFChange();
onKomoditasSFChange();