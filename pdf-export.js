// ==============================
// DOWNLOAD PDF
// ==============================

function downloadPDF(tab) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const now = new Date().toLocaleString('id-ID');
    let y = 20;

    const addHeader = (title) => {
        doc.setFillColor(26, 110, 245);
        doc.rect(0, 0, 210, 14, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Kalkulator Fumigasi, Spraying dan Fogging', 14, 9);
        doc.text(now, 196, 9, { align: 'right' });

        doc.setTextColor(26, 110, 245);
        doc.setFontSize(16);
        doc.text(title, 14, y);
        y += 8;
        doc.line(14, y, 196, y);
        y += 8;
    };

    const addRow = (label, value, highlight = false) => {
        if (y > 270) { doc.addPage(); y = 20; }
        if (highlight) {
            doc.setFillColor(232, 240, 254);
            doc.rect(14, y - 5, 182, 9, 'F');
        }
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(8);
        doc.text(label, 16, y);

        doc.setTextColor(26, 32, 44);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(String(value), 196, y, { align: 'right' });

        y += 10;
    };

    const addSection = (title) => {
        if (y > 265) { doc.addPage(); y = 20; }
        y += 2;
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y - 5, 182, 8, 'F');
        doc.setTextColor(26, 110, 245);
        doc.setFontSize(9);
        doc.text(title.toUpperCase(), 16, y);
        y += 8;
    };

    const addSungkupHeader = (title) => {
        if (y > 265) { doc.addPage(); y = 20; }
        y += 2;
        doc.setFillColor(26, 110, 245);
        doc.rect(14, y - 5, 182, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text(title.toUpperCase(), 16, y);
        y += 8;
    };

    const getSelected = (id) => {
        const el = document.getElementById(id);
        return el ? el.options[el.selectedIndex].text : '—';
    };

    const getValue = (id) => {
        const el = document.getElementById(id);
        return el && el.value ? el.value : '—';
    };

    const getNamaInsektisida = (prefix) => {
        const el = document.getElementById(prefix + '-insektisida');
        if (!el) return '—';
        if (el.value === 'custom') {
            const custom = document.getElementById(prefix + '-insektisida-custom-nama');
            return custom ? (custom.value || 'Custom') : 'Custom';
        }
        return el.options[el.selectedIndex].text;
    };

    const getNamaFumigan = () => {
        const el = document.getElementById('f-fumigan');
        if (!el) return '—';
        if (el.value === 'custom') {
            const custom = document.getElementById('f-fumigan-custom-nama');
            return custom ? (custom.value || 'Custom') : 'Custom';
        }
        return el.options[el.selectedIndex].text.trim();
    };

    // ==============================
    // FUMIGASI
    // ==============================
    if (tab === 'fumigasi') {
        const hasil = document.getElementById('hasil-fumigasi');
        if (!hasil.classList.contains('visible')) {
            alert('Harap hitung dulu sebelum download PDF.');
            return;
        }

        addHeader('Hasil Perhitungan Fumigasi');

        addSection('Lokasi');
        addRow('Kanwil',        getValue('f-kanwil'));
        addRow('Kantor Cabang', getValue('f-kancab'));
        addRow('Kompleks Gudang',        getValue('f-gudang'));
        addRow('Unit Gudang',   getValue('f-unit-gudang'));

        addSection('Informasi Umum');
        addRow('Jenis Fumigan', getNamaFumigan());
        addRow('Dosis', getValue('f-dosis') + ' tablet/ton');

        const cards = document.querySelectorAll('#f-sungkup-list section[data-sungkup]');
        cards.forEach((card, idx) => {
            const kode = card.querySelector('.f-kode-sungkup').value || `S-0${idx+1}`;
            const komoEl = card.querySelector('.f-commodity');
            const komoditi = komoEl.options[komoEl.selectedIndex].text;
            const hasilDiv = hasil.querySelectorAll('#f-hasil-list .result-grid')[idx];

            addSungkupHeader(`${kode} — ${komoditi}`);

            if (hasilDiv) {
                const items = hasilDiv.querySelectorAll('.result-item');
                items.forEach(item => {
                    const label       = item.querySelector('.result-label')?.textContent || '';
                    const value       = item.querySelector('.result-value')?.textContent || '';
                    const isHighlight = item.classList.contains('highlight');
                    addRow(label, value, isHighlight);
                });
            }
        });

        const totalBox = document.getElementById('f-total-gabungan');
        if (totalBox && totalBox.style.display !== 'none') {
            addSection('Total Gabungan Semua Sungkup');
            addRow('Total Kuantum',         document.getElementById('f-res-total-qty').textContent);
            addRow('Total Broken Space',    document.getElementById('f-res-total-broken').textContent);
            addRow('Total Keseluruhan',     document.getElementById('f-res-total-ton').textContent);
            addRow('Total Fumigan Dibutuhkan', document.getElementById('f-res-total-tablet').textContent, true);
        }

        doc.save('hasil-fumigasi.pdf');
    }

    // ==============================
    // FUMIGASI SF
    // ==============================
    else if (tab === 'fumigasi-sf') {
        const hasil = document.getElementById('hasil-fumigasi-sf');
        if (!hasil.classList.contains('visible')) {
            alert('Harap hitung dulu sebelum download PDF.');
            return;
        }
        function getNamaObatSF() {
            const select = document.getElementById('sf-obat');

            if (select.value === 'custom') {
                const nama = document.getElementById('sf-obat-custom-nama').value;
                return nama || 'Custom';
            }

            return select.options[select.selectedIndex].text;
        }

        addHeader('Hasil Perhitungan Fumigasi SF');

        addSection('Lokasi');
        addRow('Kanwil',        getValue('sf-kanwil'));
        addRow('Kantor Cabang', getValue('sf-kancab'));
        addRow('Kompleks Gudang',        getValue('sf-gudang'));
        addRow('Unit Gudang',   getValue('sf-unit-gudang'));

        addSection('Informasi');
        addRow('Komoditi',       getSelected('sf-commodity'));
        addRow('Jenis Obat',     getSelected('sf-obat'));
        addRow('Kuantum Tonase', document.getElementById('sf-resTumpukanM3').textContent);
        addRow('Volume Total Sungkup', document.getElementById('sf-resBroken').textContent);
        addRow('Dosis Obat',     document.getElementById('sf-resDosis').textContent);

        addSection('Hasil');
        addRow('Total Obat Dibutuhkan', document.getElementById('sf-resTotal').textContent, true);

        doc.save('hasil-fumigasi-sf.pdf');
    }

    // ==============================
    // SPRAYING
    // ==============================
     else if (tab === 'spraying') {
        const hasil = document.getElementById('hasil-spraying');
        if (!hasil.classList.contains('visible')) {
            alert('Harap hitung dulu sebelum download PDF.');
            return;
        }

        addHeader('Hasil Perhitungan Spraying');

        addSection('Lokasi');
        addRow('Kanwil',        getValue('s-kanwil'));
        addRow('Kantor Cabang', getValue('s-kancab'));
        addRow('Kompleks Gudang',        getValue('s-gudang'));
        addRow('Unit Gudang',   getValue('s-unit-gudang'));

        addSection('Informasi');
        addRow('Komoditi',          getSelected('s-commodity'));
        addRow('Jenis Insektisida', getNamaInsektisida('s'));
        addRow('Dosis',             getValue('s-dosis') + ' ml/m²');

        addSection('Rincian Area');
        addRow('Dinding Memanjang',       document.getElementById('s-resDindingP').textContent);
        addRow('Dinding Melebar',         document.getElementById('s-resDindingL').textContent);
        addRow('Atap & Lantai',           document.getElementById('s-resAtap').textContent);
        addRow('Teras',                   document.getElementById('s-resTeras').textContent);
        addRow('Permukaan Stapel',        document.getElementById('s-resStapel').textContent);
        addRow('Lantai Tidak Dispraying', document.getElementById('s-resLantai').textContent.replace('−', '-'));

        addSection('Hasil');
        addRow('Total Sasaran',              document.getElementById('s-resTotal').textContent, true);
        addRow('Total Pestisida Dibutuhkan', document.getElementById('s-resPestisida').textContent, true);

        addSection('Kebutuhan Larutan');
        addRow('Kebutuhan Insektisida', document.getElementById('s-resInsektisida').textContent);
        addRow('Air Pelarut',           document.getElementById('s-resAir').textContent);
        addRow('Total Larutan',         document.getElementById('s-resLarutan').textContent);

        doc.save('hasil-spraying.pdf');

    // ==============================
    // FOGGING
    // ==============================
    } else if (tab === 'fogging') {
        const hasil = document.getElementById('hasil-fogging');
        if (!hasil.classList.contains('visible')) {
            alert('Harap hitung dulu sebelum download PDF.');
            return;
        }

        addHeader('Hasil Perhitungan Fogging');

        addSection('Lokasi');
        addRow('Kanwil',        getValue('fg-kanwil'));
        addRow('Kantor Cabang', getValue('fg-kancab'));
        addRow('Kompleks Gudang',        getValue('fg-gudang'));
        addRow('Unit Gudang',   getValue('fg-unit-gudang'));

        addSection('Informasi');
        addRow('Komoditi',          getSelected('fg-commodity'));
        addRow('Jenis Insektisida', getNamaInsektisida('fg'));
        addRow('Dosis',             getValue('fg-dosis') + ' ml/m²');

        addSection('Rincian Area');
        addRow('Lantai Gudang', document.getElementById('fg-resLantai').textContent);
        addRow('Teras Gudang',  document.getElementById('fg-resTeras').textContent);

        addSection('Hasil');
        addRow('Total Luas Sasaran',           document.getElementById('fg-resTotal').textContent, true);
        addRow('Total Insektisida Dibutuhkan', document.getElementById('fg-resPestisida').textContent, true);

        addSection('Kebutuhan Larutan');
        addRow('Kebutuhan Insektisida', document.getElementById('fg-resInsektisida').textContent);
        addRow('Air Pelarut',           document.getElementById('fg-resAir').textContent);
        addRow('Total Larutan',         document.getElementById('fg-resLarutan').textContent);

        doc.save('hasil-fogging.pdf');
    }
}

