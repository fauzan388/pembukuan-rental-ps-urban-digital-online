
// === Themed Popup Helpers ===
(function(){
  function $(sel){ return document.querySelector(sel); }
  function openModal(modalId, opts){
    return new Promise(function(resolve){
      var modal = document.getElementById(modalId);
      var backdrop = document.getElementById('popupBackdrop');
      var bodyEl = modal.querySelector('.modal-body');
      var titleEl = modal.querySelector('.modal-title');
      var okBtn = modal.querySelector('[data-ok]');
      var cancelBtn = modal.querySelector('[data-cancel]');
      var closeBtn = modal.querySelector('[data-close]');

      titleEl.textContent = (opts && opts.title) || titleEl.textContent || '';
      bodyEl.textContent = (opts && opts.message) || '';

      function show(){
        backdrop.hidden = false;
        modal.hidden = false;
        // small async to allow CSS transitions
        requestAnimationFrame(function(){
          backdrop.classList.add('is-visible');
          modal.classList.add('is-visible');
          (okBtn || closeBtn).focus();
        });
      }
      function hide(val){
        backdrop.classList.remove('is-visible');
        modal.classList.remove('is-visible');
        setTimeout(function(){
          backdrop.hidden = true;
          modal.hidden = true;
          cleanup();
          resolve(val);
        }, 200);
      }
      function onKey(e){
        if(e.key === 'Escape'){ hide(modalId === 'themedConfirm' ? false : true); }
      }
      function onBackdrop(e){
        if(e.target === backdrop){ hide(modalId === 'themedConfirm' ? false : true); }
      }
      function cleanup(){
        document.removeEventListener('keydown', onKey);
        backdrop.removeEventListener('click', onBackdrop);
        if(okBtn) okBtn.onclick = null;
        if(cancelBtn) cancelBtn.onclick = null;
        if(closeBtn) closeBtn.onclick = null;
      }

      if(okBtn){ okBtn.textContent = (opts && opts.okText) || 'OK'; okBtn.onclick = function(){ hide(true); }; }
      if(cancelBtn){ cancelBtn.textContent = (opts && opts.cancelText) || 'Batal'; cancelBtn.onclick = function(){ hide(false); }; }
      if(closeBtn){ closeBtn.onclick = function(){ hide(modalId === 'themedConfirm' ? false : true); }; }

      document.addEventListener('keydown', onKey);
      backdrop.addEventListener('click', onBackdrop);

      show();
    });
  }

  window.themedConfirm = function(message, options){
    return openModal('themedConfirm', { message: message, title:(options&&options.title)||'Konfirmasi', okText:(options&&options.okText), cancelText:(options&&options.cancelText) });
  };
  window.themedAlert = function(message, options){
    return openModal('themedAlert', { message: message, title:(options&&options.title)||'Info', okText:(options&&options.okText) });
  };
})();
// === /Themed Popup Helpers ===



  // === Themed Password Prompt (matches existing modal/backdrop) ===
  window.themedPromptPassword = function(options){
    return new Promise(function(resolve){
      var modal = document.getElementById('themedPassword');
      var backdrop = document.getElementById('popupBackdrop');
      if(!modal || !backdrop){ return resolve(null); }

      var titleEl = modal.querySelector('.modal-title');
      var input   = modal.querySelector('#pwdInput');
      var okBtn   = modal.querySelector('[data-ok]');
      var cancel  = modal.querySelector('[data-cancel]');
      var close   = modal.querySelector('[data-close]');

      titleEl.textContent = (options && options.title) || 'Verifikasi';
      if(input){
        input.placeholder = (options && options.placeholder) || 'Password admin';
        input.value = '';
      }

      function show(){
        backdrop.hidden = false; modal.hidden = false;
        requestAnimationFrame(function(){
          backdrop.classList.add('is-visible');
          modal.classList.add('is-visible');
          setTimeout(function(){ try{ input && input.focus(); }catch(_){} }, 30);
        });
      }
      function hide(val){
        backdrop.classList.remove('is-visible');
        modal.classList.remove('is-visible');
        setTimeout(function(){
          backdrop.hidden = true; modal.hidden = true;
          cleanup(); resolve(val);
        }, 200);
      }
      function onKey(e){
        if(e.key === 'Escape') hide(null);
        if(e.key === 'Enter')  hide(String((input && input.value) || ''));
      }
      function onBackdrop(e){ if(e.target === backdrop) hide(null); }
      function cleanup(){
        document.removeEventListener('keydown', onKey);
        backdrop.removeEventListener('click', onBackdrop);
        if(okBtn) okBtn.onclick = null;
        if(cancel) cancel.onclick = null;
        if(close) close.onclick = null;
      }

      if(okBtn)   okBtn.onclick   = function(){ hide(String((input && input.value) || '')); };
      if(cancel)  cancel.onclick  = function(){ hide(null); };
      if(close)   close.onclick   = function(){ hide(null); };
      document.addEventListener('keydown', onKey);
      backdrop.addEventListener('click', onBackdrop);
      show();
    });
  };



(function(){
  function onReady(fn){
    if(document.readyState==='complete' || document.readyState==='interactive'){ setTimeout(fn,0); }
    else document.addEventListener('DOMContentLoaded', fn);
  }

  onReady(function(){

// ===== Pengaturan Jajanan (Integrated inside onReady) =====
(function(){
  var JAJ_PRICE_DEFAULT = {
    "Kopi Panas Original":3000,"Teh Panas":3000,"Es Teh":3000,"Kopi Kapal Api":3000,
    "GoodDay Capuchino Panas":4000,"GoodDay Capuchino Dingin":5000,
    "Luwak White Cofee Panas":4000,"Luwak White Cofee Dingin":5000,
    "Torabika Moka Panas":4000,"Torabika Moka Dingin":5000,
    "Marimas":2000,"Nutrisari":3000,
    "Mie Pakai Telor (Free Nasi)":10000,"Mie Tanpa Telor (Free Nasi)":7000,"Pop Mie (Free Nasi)":8000
  };
  function loadJajananSettings(){
    try {
      var saved = JSON.parse(localStorage.getItem('urban_ps_jajanan_settings')||'{}');
      return Object.assign({}, JAJ_PRICE_DEFAULT, saved);
    } catch(e){
      return Object.assign({}, JAJ_PRICE_DEFAULT);
    }
  }
  function saveJajananSettings(newData){
    localStorage.setItem('urban_ps_jajanan_settings', JSON.stringify(newData));
  }
  function showJajananSettingsModal(){
    var modal = document.getElementById('jajananSettingsModal');
    var backdrop = document.getElementById('popupBackdrop');
    var tbody = document.querySelector('#jajananSettingsTable tbody');
    tbody.innerHTML = '';
    var data = loadJajananSettings();
    Object.keys(data).forEach(function(name){
      var tr = document.createElement('tr');
      tr.innerHTML = '<td style="padding:4px"><input type="text" class="input" value="'+name+'"></td>'+
                     '<td style="padding:4px"><input type="number" class="input mono" value="'+data[name]+'"></td>'+
                     '<td style="padding:4px;text-align:center"><button class="btn warn remove-item" type="button">Hapus</button></td>';
      tbody.appendChild(tr);
    });
    backdrop.hidden = false;
    modal.hidden = false;
    requestAnimationFrame(function(){
      backdrop.classList.add('is-visible');
      modal.classList.add('is-visible');
    });
    function onBackdropClick(e){ if(e.target === backdrop) hideModal(); }
    backdrop.addEventListener('click', onBackdropClick, { once: true });
  }
  function hideModal(){
    var modal = document.getElementById('jajananSettingsModal');
    var backdrop = document.getElementById('popupBackdrop');
    backdrop.classList.remove('is-visible');
    modal.classList.remove('is-visible');
    setTimeout(function(){
      backdrop.hidden = true;
      modal.hidden = true;
    },200);
  }
  var __jajBtn = document.getElementById('jajananSettingsBtn');
  if(__jajBtn){ __jajBtn.addEventListener('click', showJajananSettingsModal); }
  window.showJajananSettingsModal = showJajananSettingsModal;
  document.querySelector('#jajananSettingsModal [data-close]').addEventListener('click', hideModal);
  document.querySelector('#jajananSettingsModal [data-cancel]').addEventListener('click', hideModal);
  document.getElementById('addJajananItemBtn').addEventListener('click', function(){
    var tbody = document.querySelector('#jajananSettingsTable tbody');
    var tr = document.createElement('tr');
    tr.innerHTML = '<td style="padding:4px"><input type="text" class="input" placeholder="Nama Jajanan"></td>'+
                   '<td style="padding:4px"><input type="number" class="input mono" placeholder="Harga"></td>'+
                   '<td style="padding:4px;text-align:center"><button class="btn warn remove-item" type="button">Hapus</button></td>';
    tbody.appendChild(tr);
  });
  document.querySelector('#jajananSettingsTable').addEventListener('click', function(e){
    if(e.target.classList.contains('remove-item')){
      e.target.closest('tr').remove();
    }
  });
  document.getElementById('saveJajananSettingsBtn').addEventListener('click', function(){
    var tbody = document.querySelector('#jajananSettingsTable tbody');
    var newData = {};
    tbody.querySelectorAll('tr').forEach(function(tr){
      var name = tr.querySelector('td:nth-child(1) input').value.trim();
      var price = parseInt(tr.querySelector('td:nth-child(2) input').value)||0;
      if(name) newData[name] = price;
    });
    saveJajananSettings(newData);
    hideModal();
    buildJajanan3x10();
  });
  // Override buildJajanan3x10 to use saved settings
  var originalBuildJajanan3x10 = buildJajanan3x10;
  buildJajanan3x10 = function(){
    JAJ_PRICE = loadJajananSettings();
    var tb = document.querySelector('#jajananTable3x10 tbody'); tb.innerHTML='';
    var items = Object.keys(JAJ_PRICE);
    for(var i=0;i<5;i++){
      var tr=document.createElement('tr');
      tr.innerHTML = '<td>'+(i+1)+'</td>' +
        '<td><select class="select mini j3-jenis"><option value="">-</option>'+items.map(x=>'<option>'+x+'</option>').join('')+'</select></td>' +
        '<td><div style="display:grid;grid-template-columns:1fr 1fr;gap: var(--space-1)">' +
            '<input type="number" min="0" step="1" placeholder="0" class="input mono mini j3-qty"/>' +
            '<input type="time" class="input mini j3-jam"/></div></td>' +
        '<td><input type="number" min="0" step="100" placeholder="0" readonly class="input mono mini j3-harga"/></td>';
      tb.appendChild(tr);
    }
    document.querySelectorAll('#jajananTable3x10 tbody tr').forEach(function(tr){
      var sel=tr.querySelector('.j3-jenis'), qty=tr.querySelector('.j3-qty'), harga=tr.querySelector('.j3-harga');
      function recalc(){ var unit=JAJ_PRICE[sel.value]||0; var q=parseInt(qty.value)||0; harga.value=unit*q; sumJajanan3x10(); }
      sel.addEventListener('change', recalc); qty.addEventListener('input', recalc);
    });
  };
})();
    // ===== Helpers
    function $(sel){ return document.querySelector(sel); }
    function $all(sel){ return Array.prototype.slice.call(document.querySelectorAll(sel)); }
    function ID(){ return Math.random().toString(36).slice(2,9); }
    function cleanNum(v){ var n=parseInt(v,10); if(isNaN(n)||!isFinite(n)||n<0) n=0; return n; }
    function monthKey(d){ return (d||'').slice(0,7); }
    function todayStr(){ var o=(new Date()).getTimezoneOffset(); var d=new Date(Date.now()-o*60000); return d.toISOString().slice(0,10); }
    function fmtIDR(n){ try { return (n||0).toLocaleString('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}); } catch(e){ return 'Rp '+String(n||0).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.'); } }


    function setRangeControlsEnabled(isRange){
      var ids = ['dateFrom','dateTo','rangeApply','rangeClear'];
      ids.forEach(function(id){
        var el = document.getElementById(id);
        if(!el) return;
        el.disabled = !isRange;
        el.style.opacity = isRange ? '1' : '0.5';
      });
      if(!isRange){
        var from = document.getElementById('dateFrom');
        var to   = document.getElementById('dateTo');
        if(from) from.value = '';
        if(to)   to.value = '';
        if(window.state) window.state.range = null;
      }
    }
    // ===== Theme Toggle (persist)
    var THEME_KEY = 'urban_ps_theme';
    function applyTheme(t){
      document.documentElement.setAttribute('data-theme', t==='light' ? 'light' : null);
      var btn = $('#themeBtn');
      if(btn){ btn.textContent = (t==='light') ? '☀️ Terang' : '🌙 Gelap'; }
    }
    function getTheme(){ try{ return localStorage.getItem(THEME_KEY)||'dark'; }catch(e){ return 'dark'; } }
    function setTheme(t){ try{ localStorage.setItem(THEME_KEY,t); }catch(e){} applyTheme(t); }
    $('#themeBtn').addEventListener('click', function(){
      var cur = getTheme();
      setTheme(cur==='light' ? 'dark' : 'light');
    });
    applyTheme(getTheme());

    // ===== State & Persistence
    var state = { entries:[], filter:'ALL', range:null, editingId:null };
    function save(){ try{ localStorage.setItem('urban_ps_pembukuan', JSON.stringify(state.entries)); }catch(e){} }
    function load(){ try{ state.entries = JSON.parse(localStorage.getItem('urban_ps_pembukuan')||'[]'); }catch(e){ state.entries=[]; } }

    // ===== Build Month Filter
    function prettyMonth(ym){ var p=ym.split('-'); var d=new Date(+p[0],+p[1]-1,1); try{ return d.toLocaleDateString('id-ID',{month:'long',year:'numeric'}); }catch(e){ return ym; } }
    function buildMonthFilter(){
      var sel=$('#monthFilter'); var map={}, months=[];
      for(var i=0;i<state.entries.length;i++){ 
        var mk=monthKey(state.entries[i].date); 
        if(mk && !map[mk]){ map[mk]=1; months.push(mk); } 
      }
      months.sort(); sel.innerHTML='';
      var optAll=document.createElement('option'); 
      optAll.value='ALL'; 
      optAll.textContent='Semua Bulan'; 
      sel.appendChild(optAll);

      for(var j=0;j<months.length;j++){ 
        var o=document.createElement('option'); 
        o.value=months[j]; 
        o.textContent=prettyMonth(months[j]); 
        sel.appendChild(o); 
      }

      // Append Rentang option at the bottom
      var optRange=document.createElement('option'); 
      optRange.value='RENTANG'; 
      optRange.textContent='Rentang'; 
      sel.appendChild(optRange);

      sel.value=state.filter;
      // Append Rentang option
    }

    function filtered(){
      var list;
      if (state.filter === 'ALL') {
        list = state.entries.slice();
      } else if (state.filter === 'RENTANG') {
        // If no range selected, return empty list immediately
        if (!state.range || (!state.range.from && !state.range.to)) {
          return [];
        }
        list = state.entries.slice();
      } else {
        list = state.entries.filter(function(e){ return monthKey(e.date) === state.filter; });
      }

      if (state.filter === 'RENTANG' && state.range && (state.range.from || state.range.to)) {
        var from = state.range.from || '0000-01-01';
        var to   = state.range.to   || '9999-12-31';
        list = list.filter(function(e){
          var d = e.date || '';
          return d && d >= from && d <= to;
        });
      }

      return list;
    }
    function calcSums(list){
      var s={harian:0,jajanan:0,jasa:0,sewa:0,total:0};
      list.forEach(function(e){ s.harian+=cleanNum(e.harian); s.jajanan+=cleanNum(e.jajanan); s.jasa+=cleanNum(e.jasa); s.sewa+=cleanNum(e.sewa); });
      s.total=s.harian+s.jajanan+s.jasa+s.sewa; return s;
    }

    // ===== Grand Total live
    window.sumGrandLive = function(){
      var g = cleanNum($('#harian').value)+cleanNum($('#jajanan').value)+cleanNum($('#jasa').value)+cleanNum($('#sewa').value);
      $('#grandTotal').textContent = fmtIDR(g); updateRecap();
    };


    function getDayName(dateStr){
      if(!dateStr) return "-";
      try {
        var opts = { weekday: 'long' };
        return new Date(dateStr).toLocaleDateString('id-ID', opts);
      } catch(e){ return "-"; }
    }

    function updateRecap(){
      var fmt = fmtIDR;
      var h = cleanNum($('#harian').value);
      var j = cleanNum($('#jajanan').value);
      var ja = cleanNum($('#jasa').value);
      var s = cleanNum($('#sewa').value);
      var _h=$('#recapHarian'), _j=$('#recapJajanan'), _ja=$('#recapJasa'), _s=$('#recapSewa');
      if(_h) _h.textContent = fmt(h);
      if(_j) _j.textContent = fmt(j);
      if(_ja) _ja.textContent = fmt(ja);
      if(_s) _s.textContent = fmt(s);
    }

function scrollToTopMobile() {
  try {
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
  } catch(e) {}
  var header = document.querySelector('.header');
  if (header && header.scrollIntoView) {
    try { header.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch(e) {}
  }
  var root = document.scrollingElement || document.documentElement || document.body;
  if (root && root.scrollTo) {
    try { root.scrollTo(0, 0); } catch(e) {}
    requestAnimationFrame(function(){
      setTimeout(function(){
        try { root.scrollTo({ top: 0, behavior: 'smooth' }); } catch(e) { try { root.scrollTop = 0; } catch(_) {} }
      }, 80);
    });
  } else {
    try { document.documentElement.scrollTop = 0; document.body.scrollTop = 0; } catch(e) {}
  }
}


    // ====== Tables builders & sum
    // RINCIAN HARIAN
    var rincianBody = $('#rincianTable tbody');
    var RENTAL_RATE = { PS3:{hour:5000,half:3000}, PS4:{hour:7000,half:4000} };
    function hitungHarga(ps,jumlah){
      if(!ps) return 0; var r=RENTAL_RATE[ps]; if(!r) return 0;
      var n=parseFloat(jumlah); if(isNaN(n)||!isFinite(n)||n<=0) return 0;
      var whole=Math.floor(n); var rem=Math.round((n-whole)*10)/10; var total=whole*r.hour;
      if(Math.abs(rem-0.5)<0.001) total+=r.half; else if(rem>0) total+=Math.round(rem*r.hour);
      return total;
    }
    function buildRincianRows(){
      rincianBody.innerHTML='';
      for(var i=1;i<=10;i++){
        var tr=document.createElement('tr');
        tr.innerHTML = '<td>'+i+'</td>' +
          '<td><select class="select mini r-jenis"><option value="">-</option><option>PS3</option><option>PS4</option></select></td>' +
          '<td><input type="time" class="input mini r-jam"/></td>' +
          '<td><input type="number" min="0" step="0.5" placeholder="0" class="input mono mini r-jumlah"/></td>' +
          '<td><input type="number" min="0" step="100" placeholder="0" class="input mono mini rincian-harga r-harga"/></td>';
        rincianBody.appendChild(tr);
      }
      wireRincianEvents();
    }
    function sumRincian(){
      var sum=0; $all('.rincian-harga').forEach(function(inp){ sum+=cleanNum(inp.value); });
      $('#rincianTotal').textContent=fmtIDR(sum); $('#harian').value=sum; if(window.sumGrandLive) window.sumGrandLive(); updateRecap(); updateRecap();
    }
    function wireRincianEvents(){
      $all('#rincianTable tbody tr').forEach(function(tr){
        var sel = tr.querySelector('.r-jenis'); var j = tr.querySelector('.r-jumlah'); var h = tr.querySelector('.r-harga');
        function recalc(){ var harga=hitungHarga(sel.value,j.value); h.value=harga?String(harga):''; sumRincian(); }
        sel.addEventListener('change', recalc); j.addEventListener('input', recalc);
      });
      $all('.r-harga').forEach(function(inp){ inp.addEventListener('input', sumRincian); });
    }
    $('#rincianClear').addEventListener('click', function(){ $all('#rincianTable input').forEach(function(i){ i.value=''; }); sumRincian(); });

    // JAJANAN 3x10 (5 rows)
    var JAJ_PRICE = {
      "Kopi Panas Original":3000,"Teh Panas":3000,"Es Teh":3000,"Kopi Kapal Api":3000,
      "GoodDay Capuchino Panas":4000,"GoodDay Capuchino Dingin":5000,
      "Luwak White Cofee Panas":4000,"Luwak White Cofee Dingin":5000,
      "Torabika Moka Panas":4000,"Torabika Moka Dingin":5000,
      "Marimas":2000,"Nutrisari":3000,
      "Mie Pakai Telor (Free Nasi)":10000,"Mie Tanpa Telor (Free Nasi)":7000,"Pop Mie (Free Nasi)":8000
    };
    function buildJajanan3x10(){
      var tb = $('#jajananTable3x10 tbody'); tb.innerHTML='';
      var items=Object.keys(JAJ_PRICE);
      for(var i=0;i<5;i++){
        var tr=document.createElement('tr');
        tr.innerHTML = '<td>'+(i+1)+'</td>' +
          '<td><select class="select mini j3-jenis"><option value="">-</option>'+items.map(x=>'<option>'+x+'</option>').join('')+'</select></td>' +
          '<td><div style="display:grid;grid-template-columns:1fr 1fr;gap: var(--space-1)">' +
              '<input type="number" min="0" step="1" placeholder="0" class="input mono mini j3-qty"/>' +
              '<input type="time" class="input mini j3-jam"/></div></td>' +
          '<td><input type="number" min="0" step="100" placeholder="0" readonly class="input mono mini j3-harga"/></td>';
        tb.appendChild(tr);
      }
      $all('#jajananTable3x10 tbody tr').forEach(function(tr){
        var sel=tr.querySelector('.j3-jenis'), qty=tr.querySelector('.j3-qty'), harga=tr.querySelector('.j3-harga');
        function recalc(){ var unit=JAJ_PRICE[sel.value]||0; var q=cleanNum(qty.value); harga.value=unit*q; sumJajanan3x10(); }
        sel.addEventListener('change', recalc); qty.addEventListener('input', recalc);
      });
    }
    function sumJajanan3x10(){
      var tot=0; $all('.j3-harga').forEach(function(i){ tot+=cleanNum(i.value); });
      $('#jajananTotal3x10').textContent=fmtIDR(tot); $('#jajanan').value=tot; if(window.sumGrandLive) window.sumGrandLive(); updateRecap(); updateRecap();
    }
    document.addEventListener('click', function(e){ if(e.target && e.target.id==='jajanan3x10Clear'){ $all('#jajananTable3x10 input, #jajananTable3x10 select').forEach(function(i){ i.value=''; }); sumJajanan3x10(); } });

    // JASA 2x5
    var JASA_TYPES=["Isi Game","Stik & Aksesoris","Upgrade HEN","Aksesoris"];
    function buildJasa2x5(){
      var tb=$('#jasaTable2x5 tbody'); tb.innerHTML='';
      for(var i=0;i<5;i++){
        var tr=document.createElement('tr');
        tr.innerHTML = '<td>'+ (i+1) +'</td>' +
          '<td><select class="select mini jasa-type"><option value="">-</option>'+JASA_TYPES.map(x=>'<option>'+x+'</option>').join('')+'</select></td>' +
          '<td><input type="text" class="input mini jasa-note" placeholder="keterangan (opsional)"/></td>' +
          '<td><input type="number" min="0" step="100" placeholder="0" class="input mono mini jasa-price"/></td>';
        tb.appendChild(tr);
      }
      $all('.jasa-price').forEach(function(inp){ inp.addEventListener('input', sumJasa2x5); });
    }
    function sumJasa2x5(){
      var tot=0; $all('.jasa-price').forEach(function(i){ tot+=cleanNum(i.value); });
      $('#jasaTotal2x5').textContent=fmtIDR(tot); $('#jasa').value=tot; if(window.sumGrandLive) window.sumGrandLive(); updateRecap(); updateRecap();
    }
    document.addEventListener('click', function(e){ if(e.target && e.target.id==='jasa2x5Clear'){ $all('#jasaTable2x5 input, #jasaTable2x5 select').forEach(function(i){ i.value=''; }); sumJasa2x5(); } });

    // SEWA 3x10 (5 rows)
    var SEWA_TYPES=["PS3","PS4","PS3 + TV","PS4 + TV","PS3 Portable","PS4 Portable","Hanya TV"];
    var SEWA_RATES={ "PS3":{h12:40000,h24:70000},"PS4":{h12:80000,h24:140000},"PS3 + TV":{h12:60000,h24:100000},"PS4 + TV":{h12:100000,h24:170000},"PS3 Portable":{h12:60000,h24:100000},"PS4 Portable":{h12:100000,h24:170000},"Hanya TV":{h12:30000,h24:50000} };
    function hoursFromDurasiSelect(selVal, manualVal){
      var mv=parseFloat(manualVal); if(!isNaN(mv) && isFinite(mv) && mv>0) return mv;
      switch(selVal){ case '12JAM':return 12; case '1HARI':return 24; case '2HARI':return 48; case '3HARI':return 72; default:return 0; }
    }
    function calcSewaPrice(type,hours){
      var r=SEWA_RATES[type]; if(!r||!hours||hours<=0) return 0;
      if(hours<=12) return r.h12; if(hours<=24) return r.h24; var days=Math.ceil(hours/24); return days*r.h24;
    }
    function buildSewa3x10(){
      var tb=$('#sewaTable3x10 tbody'); tb.innerHTML='';
      for(var i=0;i<5;i++){
        var tr=document.createElement('tr');
        tr.innerHTML = '<td>'+(i+1)+'</td>' +
          '<td><select class="select mini sewa-jenis"><option value="">-</option>'+SEWA_TYPES.map(x=>'<option>'+x+'</option>').join('')+'</select></td>' +
          '<td><div style="display:grid;grid-template-columns:1fr 1fr;gap: var(--space-1)">' +
              '<select class="select mini sewa-durasi"><option value="">-</option><option value="12JAM">12 JAM</option><option value="1HARI">1 HARI</option><option value="2HARI">2 HARI</option><option value="3HARI">3 HARI</option></select>' +
              '<input type="text" placeholder="Isi Sendiri" class="input mini sewa-manual"/></div></td>' +
          '<td><input type="text" placeholder="note (optional)" class="input mini sewa-lama-note"/></td><td><input type="number" min="0" step="1000" placeholder="0" class="input mono mini sewa-harga"/></td>';
        tb.appendChild(tr);
      }
      $all('#sewaTable3x10 tbody tr').forEach(function(tr){
        var selJ=tr.querySelector('.sewa-jenis'); var selD=tr.querySelector('.sewa-durasi'); var inM=tr.querySelector('.sewa-manual'); var inH=tr.querySelector('.sewa-harga');
        function recalc(){
  var manualVal = (inM.value || '').trim();
  if(manualVal){
    // User filled 'Isi Sendiri', skip auto calculation entirely
    return;
  }
  var jam = hoursFromDurasiSelect(selD.value, '');
  var price = calcSewaPrice(selJ.value, jam);
  if(price>0){ inH.value = price; }
  else { inH.value=''; }
  sumSewa3x10();
}
        selJ.addEventListener('change', recalc); selD.addEventListener('change', recalc); inM.addEventListener('input', recalc); inH.addEventListener('input', sumSewa3x10);
      });
    }
    function sumSewa3x10(){
      var tot=0; $all('.sewa-harga').forEach(function(i){ tot+=cleanNum(i.value); });
      $('#sewaTotal3x10').textContent=fmtIDR(tot); $('#sewa').value=tot; if(window.sumGrandLive) window.sumGrandLive(); updateRecap(); updateRecap();
    }
    document.addEventListener('click', function(e){ if(e.target && e.target.id==='sewa3x10Clear'){ $all('#sewaTable3x10 input, #sewaTable3x10 select').forEach(function(i){ i.value=''; }); sumSewa3x10(); } });

    // ===== Serialize details
    function collectDetails(){
      var rincian = $all('#rincianTable tbody tr').map(function(tr){
        return {
          jenis: tr.querySelector('.r-jenis').value || '',
          jam: tr.querySelector('.r-jam').value || '',
          jumlah: tr.querySelector('.r-jumlah').value || '',
          harga: cleanNum(tr.querySelector('.r-harga').value)
        };
      });
      var jajanan = $all('#jajananTable3x10 tbody tr').map(function(tr){
        return {
          jenis: tr.querySelector('.j3-jenis').value || '',
          qty: cleanNum(tr.querySelector('.j3-qty').value),
          jam: tr.querySelector('.j3-jam').value || '',
          harga: cleanNum(tr.querySelector('.j3-harga').value)
        };
      });
      var jasa = $all('#jasaTable2x5 tbody tr').map(function(tr){
        return {
          tipe: tr.querySelector('.jasa-type').value || '',
          ket: (tr.querySelector('.jasa-note') && tr.querySelector('.jasa-note').value) || '',
          harga: cleanNum(tr.querySelector('.jasa-price').value)
        };
      });
      var sewa = $all('#sewaTable3x10 tbody tr').map(function(tr){
  return {
    jenis: tr.querySelector('.sewa-jenis').value || '',
    durasi: tr.querySelector('.sewa-durasi').value || '',
    manualJam: tr.querySelector('.sewa-manual').value || '',
    lamaNote: (tr.querySelector('.sewa-lama-note') && tr.querySelector('.sewa-lama-note').value) || '',
    harga: cleanNum(tr.querySelector('.sewa-harga').value)
  };
});
      return { rincian:rincian, jajanan3x10:jajanan, jasa2x5:jasa, sewa3x10:sewa };
    }


    // ===== Validation helpers
    function detailsIsEmpty(det){
      det = det || collectDetails();
      function anyIn(arr, keys){
        if(!arr) return false;
        for(var i=0;i<arr.length;i++){
          var o = arr[i] || {};
          for(var k=0;k<keys.length;k++){
            var v = o[keys[k]];
            if(typeof v === 'number' && v > 0) return true;
            if(typeof v === 'string' && String(v).trim() !== '') return true;
          }
        }
        return false;
      }
      // If any detail field has content/value, not empty
      if(anyIn(det.rincian, ['jenis','jam','jumlah','harga'])) return false;
      if(anyIn(det.jajanan3x10, ['jenis','qty','jam','harga'])) return false;
      if(anyIn(det.jasa2x5, ['tipe','ket','harga'])) return false;
      if(anyIn(det.sewa3x10, ['jenis','durasi','manualJam','lamaNote','harga'])) return false;
      return true;
    }
    function formIsTrulyEmpty(){
      var h = cleanNum($('#harian').value);
      var j = cleanNum($('#jajanan').value);
      var ja = cleanNum($('#jasa').value);
      var s = cleanNum($('#sewa').value);
      var cat = ($('#catatan').value||'').trim();
      // Consider "empty" if all numeric incomes are zero AND no detail inputs filled.
      // Catatan alone does not count as data.
      var det = collectDetails();
      return (h + j + ja + s === 0) && detailsIsEmpty(det);
    }

    // ===== Apply details
    function applyDetails(det){
      det = det || {};
      $all('#rincianTable tbody tr').forEach(function(tr,idx){
        var d = (det.rincian && det.rincian[idx]) || {};
        tr.querySelector('.r-jenis').value = d.jenis || '';
        tr.querySelector('.r-jam').value = d.jam || '';
        tr.querySelector('.r-jumlah').value = d.jumlah || '';
        tr.querySelector('.r-harga').value = d.harga || '';
      });
      sumRincian();
      $all('#jajananTable3x10 tbody tr').forEach(function(tr,idx){
        var d = (det.jajanan3x10 && det.jajanan3x10[idx]) || {};
        tr.querySelector('.j3-jenis').value = d.jenis || '';
        tr.querySelector('.j3-qty').value = d.qty || '';
        tr.querySelector('.j3-jam').value = d.jam || '';
        tr.querySelector('.j3-harga').value = d.harga || '';
      });
      sumJajanan3x10();
      $all('#jasaTable2x5 tbody tr').forEach(function(tr,idx){
        var d = (det.jasa2x5 && det.jasa2x5[idx]) || {};
        tr.querySelector('.jasa-type').value = d.tipe || '';
        var note = tr.querySelector('.jasa-note'); if(note) note.value = d.ket || '';
        tr.querySelector('.jasa-price').value = d.harga || '';
      });
      sumJasa2x5();
      $all('#sewaTable3x10 tbody tr').forEach(function(tr,idx){
  var d = (det.sewa3x10 && det.sewa3x10[idx]) || {};
  tr.querySelector('.sewa-jenis').value = d.jenis || '';
  tr.querySelector('.sewa-durasi').value = d.durasi || '';
  tr.querySelector('.sewa-manual').value = d.manualJam || '';
  var note = d.lamaNote || '';
  var noteEl = tr.querySelector('.sewa-lama-note'); if(noteEl) noteEl.value = note;
  tr.querySelector('.sewa-harga').value = d.harga || '';
});
sumSewa3x10();
      if(window.sumGrandLive) window.sumGrandLive(); updateRecap();
      try{ drawDailyGraph(); }catch(e){ /* ignore */ }
    }

    // ===== Inline editable cells
    function editableMoneyCell(value, onCommit){
      var span=document.createElement('span');
      span.textContent=fmtIDR(cleanNum(value));
      span.style.cursor='pointer'; span.title='Klik untuk ubah';
      span.addEventListener('click', function(){
        var input=document.createElement('input');
        input.type='number'; input.className='input mono'; input.style.padding='6px 8px'; input.value=cleanNum(value);
        span.parentNode.replaceChild(input, span);
        input.focus();
        var commit=function(){ onCommit(cleanNum(input.value)); };
        input.addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); commit(); }});
        input.addEventListener('blur', commit);
      });
      return span;
    }
    function editableTextCell(value, onCommit){
      var span=document.createElement('span'); span.textContent=value||''; span.style.cursor='pointer'; span.title='Klik untuk ubah';
      span.addEventListener('click', function(){
        var input=document.createElement('textarea'); input.className='input'; input.rows=2; input.value=value||'';
        span.parentNode.replaceChild(input, span); input.focus();
        var commit=function(){ onCommit(String(input.value||'')); };
        input.addEventListener('keydown', function(e){ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); commit(); }});
        input.addEventListener('blur', commit);
      });
      return span;
    }
    function editableDateCell(value, onCommit){
      var span=document.createElement('span'); span.textContent=value||todayStr(); span.style.cursor='pointer'; span.title='Klik untuk ubah';
      span.addEventListener('click', function(){
        var input=document.createElement('input'); input.type='date'; input.className='input'; input.value=value||todayStr();
        span.parentNode.replaceChild(input, span); input.focus();
        var commit=function(){ onCommit(input.value||todayStr()); };
        input.addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); commit(); }});
        input.addEventListener('blur', commit);
      });
      return span;
    }

    // ===== Render main table
    function render(){
      buildMonthFilter();
      var list=filtered().sort(function(a,b){ return (a.date>b.date?1:-1); });
      var tbody=$('#table tbody'); tbody.innerHTML='';
      list.forEach(function(e){
        var tr=document.createElement('tr');
        var tds=[
          (function(){ var td=document.createElement('td'); td.textContent = e.date; return td; })(),
          (function(){ var td=document.createElement('td'); td.textContent=getDayName(e.date); return td; })(),
          (function(){ var td=document.createElement('td'); td.className='mono right'; td.textContent = fmtIDR(e.harian); return td; })(),
          (function(){ var td=document.createElement('td'); td.className='mono right'; td.textContent = fmtIDR(e.jajanan); return td; })(),
          (function(){ var td=document.createElement('td'); td.className='mono right'; td.textContent = fmtIDR(e.jasa); return td; })(),
          (function(){ var td=document.createElement('td'); td.className='mono right'; td.textContent = fmtIDR(e.sewa); return td; })(),
          (function(){ var td=document.createElement('td'); td.className='mono right'; var tot=cleanNum(e.harian)+cleanNum(e.jajanan)+cleanNum(e.jasa)+cleanNum(e.sewa); td.textContent=fmtIDR(tot); return td; })(),
          (function(){ var td=document.createElement('td'); td.textContent = e.catatan || ''; return td; })(),
          (function(){
            var td=document.createElement('td'); td.className='right';
            var edit=document.createElement('button'); edit.className='btn'; edit.textContent='Edit'; edit.title='Load rincian ke form atas';
            edit.onclick=function(){
              // Load this entry into the form + detail tables
              state.editingId = e.id;
              $('#addBtn').textContent = 'Simpan Perubahan'; document.getElementById('cancelEditBtn').style.display='inline-block';
              $('#date').value = e.date || todayStr();
              $('#harian').value = cleanNum(e.harian);
              $('#jajanan').value = cleanNum(e.jajanan);
              $('#jasa').value = cleanNum(e.jasa);
              $('#sewa').value = cleanNum(e.sewa);
              $('#catatan').value = e.catatan || '';
              $('#absenPagi').value = e.absenPagi || '';
              $('#absenSiang').value = e.absenSiang || '';
              $('#rukoBuka').value = e.rukoBuka || '';
              $('#rukoTutup').value = e.rukoTutup || '';
              applyDetails(e.details || null);

    // Update field Hari setelah tanggal di-set
    if (typeof updateDayField === "function") {
        updateDayField();
    }
var actionsRow = document.getElementById('formActions');
if(actionsRow) actionsRow.classList.add('editing');
if(window.sumGrandLive) window.sumGrandLive(); updateRecap();
scrollToTopMobile();
              };
            td.appendChild(edit);
            var sp=document.createElement('span'); sp.style.display='inline-block'; sp.style.width='6px'; td.appendChild(sp);
            var del=document.createElement('button'); del.className='btn warn'; del.textContent='Hapus'; del.title='Hapus baris ini';
            del.onclick = async function(){ if(await themedConfirm('Hapus baris ini?')){ state.entries = state.entries.filter(function(it){ return it!==e; }); save(); render(); } };
            td.appendChild(del); return td;
          })()
        ];
        tds.forEach(function(td){ tr.appendChild(td); }); tbody.appendChild(tr);
      });
      var sums=calcSums(list);
      $('#sumHarian').textContent=fmtIDR(sums.harian);
      $('#sumJajanan').textContent=fmtIDR(sums.jajanan);
      $('#sumJasa').textContent=fmtIDR(sums.jasa);
      $('#sumSewa').textContent=fmtIDR(sums.sewa);
      $('#sumTotal').textContent=fmtIDR(sums.total);

      var monthList = [];
    var monthSum;
if (state.filter === 'RENTANG' && state.range && (state.range.from || state.range.to)) {
    var from = state.range.from || '0000-01-01';
    var to   = state.range.to   || '9999-12-31';
    var rangeList = state.entries.filter(function(e){
        var d = e.date || '';
        return d && d >= from && d <= to;
    });
    monthSum = calcSums(rangeList).total;
} else {
    var monthPick = (state.filter==='ALL') ? monthKey(todayStr()) : state.filter;
    var monthList = state.entries.filter(function(x){ return monthKey(x.date)===monthPick; });
    monthSum = calcSums(monthList).total;
} var allSum=calcSums(state.entries).total;
      var _mt=$('#monthTotal'); if(_mt) _mt.textContent=fmtIDR(monthSum); var _at=$('#allTotal'); if(_at) _at.textContent=fmtIDR(allSum);
      // Fill new footer cells inside History
      var sm=document.getElementById('sumMonth'); if(sm) sm.textContent = fmtIDR(monthSum);
      var sa=document.getElementById('sumAll'); if(sa) sa.textContent = fmtIDR(allSum);

// === Custom Footer Logic ===
(function(){
    var smEl = document.getElementById('sumMonth');
    var saRow = null;
    document.querySelectorAll('#table tfoot tr').forEach(function(tr){
        if(tr.textContent.trim().toLowerCase().includes('total semua')){
            saRow = tr;
        }
    });
    // Reset visibility
    if(saRow) saRow.style.display = '';
    if(smEl){
        var labelCell = smEl.closest('tr').querySelector('td[colspan="6"]');
        if(labelCell) labelCell.textContent = 'Total Bulan Ini';
    }

    if(state.filter === 'RENTANG'){
        if(state.range && (state.range.from || state.range.to)){
            var from = state.range.from || '0000-01-01';
            var to   = state.range.to   || '9999-12-31';
            var rangeList = state.entries.filter(function(e){
                var d = e.date || '';
                return d && d >= from && d <= to;
            });
            var rangeSum = calcSums(rangeList).total;
            if(smEl) smEl.textContent = fmtIDR(rangeSum);
        }
        if(smEl){
            var labelCell = smEl.closest('tr').querySelector('td[colspan="6"]');
            if(labelCell) labelCell.textContent = 'Total Rentang';
        }
        if(saRow) saRow.style.display = 'none';
    } else if(state.filter !== 'ALL'){
        // Filter bulan: sembunyikan Total Semua
        if(saRow) saRow.style.display = 'none';
    }
})();

      var totalLabelEl = document.querySelector('#table tfoot tr.total-row td[colspan="5"]');
      if (totalLabelEl) {
        totalLabelEl.textContent = (state.filter === 'RENTANG') ? 'Total rentang' : 'Total bulan ini';
      }

      // Per-column month sums
      var monthCols = calcSums(monthList);
      var allCols = calcSums(state.entries);
      var mapIds = {
        'sumHarianMonth': monthCols.harian,
        'sumJajananMonth': monthCols.jajanan,
        'sumJasaMonth': monthCols.jasa,
        'sumSewaMonth': monthCols.sewa,
        'sumHarianAll': allCols.harian,
        'sumJajananAll': allCols.jajanan,
        'sumJasaAll': allCols.jasa,
        'sumSewaAll': allCols.sewa
      };
      Object.keys(mapIds).forEach(function(id){
        var el = document.getElementById(id);
        if(el){ el.textContent = fmtIDR(mapIds[id]); }
      });

      var sm=document.getElementById('sumMonth'); if(sm) sm.textContent = fmtIDR(monthSum);
      var sa=document.getElementById('sumAll'); if(sa) sa.textContent = fmtIDR(allSum);

// === Custom Footer Logic ===
(function(){
    var smEl = document.getElementById('sumMonth');
    var saRow = null;
    document.querySelectorAll('#table tfoot tr').forEach(function(tr){
        if(tr.textContent.trim().toLowerCase().includes('total semua')){
            saRow = tr;
        }
    });
    // Reset visibility
    if(saRow) saRow.style.display = '';
    if(smEl){
        var labelCell = smEl.closest('tr').querySelector('td[colspan="6"]');
        if(labelCell) labelCell.textContent = 'Total Bulan Ini';
    }

    if(state.filter === 'RENTANG'){
        if(state.range && (state.range.from || state.range.to)){
            var from = state.range.from || '0000-01-01';
            var to   = state.range.to   || '9999-12-31';
            var rangeList = state.entries.filter(function(e){
                var d = e.date || '';
                return d && d >= from && d <= to;
            });
            var rangeSum = calcSums(rangeList).total;
            if(smEl) smEl.textContent = fmtIDR(rangeSum);
        }
        if(smEl){
            var labelCell = smEl.closest('tr').querySelector('td[colspan="6"]');
            if(labelCell) labelCell.textContent = 'Total Rentang';
        }
        if(saRow) saRow.style.display = 'none';
    } else if(state.filter !== 'ALL'){
        // Filter bulan: sembunyikan Total Semua
        if(saRow) saRow.style.display = 'none';
    }
})();

      var totalLabelEl = document.querySelector('#table tfoot tr.total-row td[colspan="5"]');
      if (totalLabelEl) {
        totalLabelEl.textContent = (state.filter === 'RENTANG') ? 'Total rentang' : 'Total bulan ini';
      }

      if(window.sumGrandLive) window.sumGrandLive(); updateRecap();
      try{ drawDailyGraph(); }catch(e){ /* ignore */ }
    }

    // ===== Add or Update entry from form
    function entryFromForm(){
      return {
        id: state.editingId || ID(),
        date: $('#date').value || todayStr(),
        harian: cleanNum($('#harian').value),
        jajanan: cleanNum($('#jajanan').value),
        jasa: cleanNum($('#jasa').value),
        sewa: cleanNum($('#sewa').value),
        catatan: ($('#catatan').value||'').trim(),
        absenPagi: $('#absenPagi').value || '',
        absenSiang: $('#absenSiang').value || '',
        rukoBuka: $('#rukoBuka').value || '',
        rukoTutup: $('#rukoTutup').value || '',
        details: collectDetails()
      };
    }
    async function addOrUpdateEntry(){
      // Guard: don't save empty forms
      if(formIsTrulyEmpty()){
        await themedAlert('Form masih kosong. Isi setidaknya satu nilai atau rincian sebelum menyimpan.');
        return;
      }
      var newEntry = entryFromForm();
      if(state.editingId){
        var idx = state.entries.findIndex(function(x){ return x.id===state.editingId; });
        if(idx>=0) state.entries[idx] = newEntry;
state.editingId = null;
$('#addBtn').textContent = '+ Tambah Pencatatan';
document.getElementById('cancelEditBtn').style.display='none';
var actionsRow = document.getElementById('formActions');
if(actionsRow) actionsRow.classList.remove('editing');
      }else{
        state.entries.push(newEntry);
      }
      save(); clearForm(); render();
    }

    function clearForm(){
      ['harian','jajanan','jasa','sewa','catatan'].forEach(function(id){ var el=$('#'+id); if(el) el.value=''; });
            $all('#rincianTable .r-jenis').forEach(function(sel){ sel.value = ''; });
      $('#date').value=todayStr();
      ['absenPagi','absenSiang','rukoBuka','rukoTutup'].forEach(function(id){var el=document.getElementById(id); if(el) el.value='';});
      $all('#rincianTable input, #jajananTable3x10 input, #jajananTable3x10 select, #jasaTable2x5 input, #jasaTable2x5 select, #sewaTable3x10 input, #sewaTable3x10 select').forEach(function(i){ i.value=''; });
      $('#rincianTotal').textContent=fmtIDR(0); $('#jajananTotal3x10').textContent=fmtIDR(0); $('#jasaTotal2x5').textContent=fmtIDR(0); $('#sewaTotal3x10').textContent=fmtIDR(0);
      if(window.sumGrandLive) window.sumGrandLive(); updateRecap();
      try{ drawDailyGraph(); }catch(e){ /* ignore */ }
    }

    // ===== CSV (aggregates only)
    window.exportCSV = function(){
      var header=['tanggal','harian','jajanan','jasa_aksesoris','sewa_ps','total','catatan'];
      var rows=state.entries.map(function(e){
        var tot=cleanNum(e.harian)+cleanNum(e.jajanan)+cleanNum(e.jasa)+cleanNum(e.sewa);
        var cat=String(e.catatan||'').split('"').join("''");
        return [e.date,cleanNum(e.harian),cleanNum(e.jajanan),cleanNum(e.jasa),cleanNum(e.sewa),tot,cat].join(',');
      });
      var csv=[header.join(','),rows.join('\\n')].join('\\n');
      var blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
      var url=URL.createObjectURL(blob); var a=document.createElement('a'); a.href=url; a.download='pembukuan_rental_ps_'+Date.now()+'.csv'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(url); },1500);
    }
    function importCSV(file){
      var reader=new FileReader();
      reader.onload=async function(ev){
        var text=ev.target.result||''; var lines=text.split(/\\r?\\n/); if(lines.length<2){ await themedAlert('CSV kosong atau tidak valid.'); return; }
        for(var i=1;i<lines.length;i++){
          var line=lines[i]; if(!line) continue; var p=line.split(',');
          var obj={ id:ID(), date:(p[0]||'').trim(), harian:cleanNum(p[1]), jajanan:cleanNum(p[2]), jasa:cleanNum(p[3]), sewa:cleanNum(p[4]), catatan:(p[6]||'').trim(), details:null };
          if(obj.date){ state.entries.push(obj); }
        }
        save(); render();
      };
      reader.readAsText(file);
    }

    // ===== Screenshot (full page)
    function takeFullScreenshot(){
      var btn=$('#screenshotBtn'); var prev=btn?btn.style.visibility:''; if(btn) btn.style.visibility='hidden';
      var w=Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
      var h=Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      window.scrollTo(0,0);
      html2canvas(document.body,{useCORS:true,backgroundColor:getComputedStyle(document.body).backgroundColor,windowWidth:w,windowHeight:h,scale:2}).then(function(canvas){
        var dataURL=canvas.toDataURL('image/png'); var a=document.createElement('a');
        var now=new Date(); var pad=function(n){return (n<10?'0':'')+n;}
        a.href=dataURL; a.download='screenshot_urban_ps_'+now.getFullYear()+'-'+pad(now.getMonth()+1)+'-'+pad(now.getDate())+'_'+pad(now.getHours())+pad(now.getMinutes())+pad(now.getSeconds())+'.png';
        document.body.appendChild(a); a.click(); a.remove(); if(btn) btn.style.visibility=prev;
      }).catch(async function(err){ if(btn) btn.style.visibility=prev; await themedAlert('Gagal screenshot: '+err.message); });
    }

    // ===== Events

// ===== Events (basic confirm, no animations, no custom modal)
document.getElementById('addBtn').addEventListener('click', async function(){
  try {
    if (typeof formIsTrulyEmpty === 'function' && formIsTrulyEmpty()) {
      await themedAlert('Form masih kosong. Isi setidaknya satu nilai atau rincian sebelum menyimpan.');
      return;
    }
    var ok = await themedConfirm('Apakah pembukuan sudah di-screenshot?\nJika tekan OK data akan disimpan.');
    if (ok) addOrUpdateEntry();
  } catch (err) {
    await themedAlert('Gagal menyimpan: ' + err.message);
  }
});

        ['harian','jajanan','jasa','sewa'].forEach(function(id){ $('#'+id).addEventListener('input', function(){ if(window.sumGrandLive) window.sumGrandLive(); updateRecap(); }); });
    ['harian','jajanan','jasa','sewa','catatan'].forEach(function(id){ $('#'+id).addEventListener('keydown', function(e){ if(e.key==='Enter'){ addOrUpdateEntry(); }}); });
    $('#monthFilter').addEventListener('change', function(e){
      state.filter=e.target.value;
      setRangeControlsEnabled(state.filter==='RENTANG');
      render();
    setRangeControlsEnabled(state.filter==='RENTANG');
    });
    
    
    $('#clearBtn').addEventListener('click', async function(){
  // Password + confirm flow (theme-matched modal)
  const ADMIN_PASSWORD = '707426';
  var pwd = await themedPromptPassword({
    title: 'Verifikasi Hapus Data',
    placeholder: 'Password admin'
  });
  if (pwd === null) return; // closed/cancelled
  if (pwd !== ADMIN_PASSWORD){
    await themedAlert('Password salah. Aksi dibatalkan.');
    return;
  }
  if (await themedConfirm('Hapus SEMUA data?')){
    state.entries = [];
    save();
    render();
    setRangeControlsEnabled(state.filter==='RENTANG');
    await themedAlert('Semua data dihapus.');
  }
});
    
document.addEventListener('click', function(e){
    if(e.target && e.target.id === 'exportReportBtn'){
        exportReportPDF();
    }
});


// Ubah label tombol
document.getElementById('exportReportBtn').textContent = "📝 Download Laporan";

document.getElementById('exportReportBtn').addEventListener('click', function(){
    exportReportPDF();
});


async function exportReportPDF(){
    try {
        const { jsPDF } = window.jspdf;
        var w = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
        var h = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
        window.scrollTo(0,0);

        const canvas = await html2canvas(document.body, {
            useCORS: true,
            backgroundColor: getComputedStyle(document.body).backgroundColor,
            windowWidth: w,
            windowHeight: h,
            scale: 1.2
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.85);
        const pdf = new jsPDF('p', 'pt', [canvas.width * 0.75, canvas.height * 0.75]);
        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width * 0.75, canvas.height * 0.75);

        // Ambil dari field input form
        const tanggalInput = document.getElementById('date').value;
        const hariInput = document.getElementById('day').value || '';

        let fileName;
        if (tanggalInput) {
            fileName = `pembukuan_URBAN_LPG_${tanggalInput}_${hariInput}.pdf`;
        } else {
            const today = new Date();
            const tanggal = today.toISOString().slice(0,10);
            const hari = today.toLocaleDateString('id-ID', { weekday: 'long' });
            fileName = `pembukuan_URBAN_LPG_${tanggal}_${hari}.pdf`;
        }

        const pdfBlob = pdf.output('blob');
        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

        // ==== Jika Web Share API tersedia → langsung share ====
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({
                title: "Laporan Pembukuan",
                text: "Berikut laporan pembukuan dalam format PDF.",
                files: [file]
            }).catch(err => {
                console.warn("Share dibatalkan/gagal:", err);
            });
            return;
        }

        // ==== Kalau tidak ada Web Share API → fallback download ====
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);

    } catch(err){
        await themedAlert('Gagal download laporan: ' + err.message);
    }
}




    
    
    

// === Settings Modal Logic ===
(function(){
  var backdrop = document.getElementById('popupBackdrop');
  var settingsModal = document.getElementById('settingsModal');

  function showSettingsModal(){
    backdrop.hidden = false;
    settingsModal.hidden = false;
    requestAnimationFrame(function(){
      backdrop.classList.add('is-visible');
      settingsModal.classList.add('is-visible');
    });
  }
  function hideSettingsModal(){
    backdrop.classList.remove('is-visible');
    settingsModal.classList.remove('is-visible');
    setTimeout(function(){
      backdrop.hidden = true;
      settingsModal.hidden = true;
    }, 200);
  }

  document.getElementById('settingsBtn').addEventListener('click', function(){
    showSettingsModal();

    // Setup theme toggle button each time settings modal is opened
    var themeBtnInSettings = document.getElementById('themeToggleInSettings');
    if(themeBtnInSettings){
      function updateThemeBtnText(){
        var currentTheme = getTheme();
        themeBtnInSettings.textContent = (currentTheme === 'light') ? '☀️ Terang' : '🌙 Gelap';
      }
      updateThemeBtnText();
      themeBtnInSettings.onclick = function(){
        var cur = getTheme();
        setTheme(cur === 'light' ? 'dark' : 'light');
        updateThemeBtnText();
      };
    }
  });

  // Close buttons inside modal
  settingsModal.querySelectorAll('[data-close]').forEach(function(btn){
    btn.addEventListener('click', hideSettingsModal);
  });

  // Navigate to Item Jajanan settings
  document.getElementById('openJajananSettings').addEventListener('click', function(){
    hideSettingsModal();
    setTimeout(function(){
      if (typeof showJajananSettingsModal === 'function') {
        showJajananSettingsModal();
      } else {
        console.error('showJajananSettingsModal function not found.');
      }
    }, 220); // wait for animation
  });
})();


// Range filter events (custom date range)
    ;(function(){
      var _from = document.getElementById('dateFrom');
      var _to = document.getElementById('dateTo');
      var _apply = document.getElementById('rangeApply');
      var _clear = document.getElementById('rangeClear');
      if(_apply){ _apply.addEventListener('click', function(){
        var f = _from && _from.value ? _from.value : '';
        var t = _to && _to.value ? _to.value : '';
        state.range = (f || t) ? {from:f, to:t} : null;
        render();
    setRangeControlsEnabled(state.filter==='RENTANG');
        try { drawDailyGraph(); } catch(e) {}
      }); }
      if(_clear){ _clear.addEventListener('click', function(){
        if(_from) _from.value='';
        if(_to) _to.value='';
        state.range = null;
        render();
    setRangeControlsEnabled(state.filter==='RENTANG');
        try { drawDailyGraph(); } catch(e) {}
      }); }
    })();


    // Cancel Edit button
    (function(){
      var cbtn = document.getElementById('cancelEditBtn');
      if(cbtn){
        cbtn.addEventListener('click', function(){
  try{
    clearForm();
    state.editingId = null;
    $('#addBtn').textContent = '+ Tambah Pencatatan';
    cbtn.style.display = 'none';
    var actionsRow = document.getElementById('formActions');
    if(actionsRow) actionsRow.classList.remove('editing');
          }catch(err){
            console.error('Cancel error:', err);
          }
        });
      }
    })();
// === Add Row simple helpers ===
    function renumberAll(tbody){
      var rows = tbody.querySelectorAll('tr');
      rows.forEach(function(tr,i){
        var first = tr.querySelector('td:first-child');
        if(first) first.textContent = (i+1);
      });
    }

    function addRowRincian(){
      var tb = document.querySelector('#rincianTable tbody');
      var tr = document.createElement('tr');
      tr.innerHTML = '<td></td>' +
        '<td><select class="select mini r-jenis"><option value="">-</option><option>PS3</option><option>PS4</option></select></td>' +
        '<td><input type="time" class="input mini r-jam"/></td>' +
        '<td><input type="number" min="0" step="0.5" placeholder="0" class="input mono mini r-jumlah"/></td>' +
        '<td><input type="number" min="0" step="100" placeholder="0" class="input mono mini rincian-harga r-harga"/></td>';
      tb.appendChild(tr);
      // wire pricing calc like initial
      (function(){
        var sel=tr.querySelector('.r-jenis'); var j=tr.querySelector('.r-jumlah'); var h=tr.querySelector('.r-harga');
        function rec(){ var RENTAL_RATE={ PS3:{hour:5000,half:3000}, PS4:{hour:7000,half:4000} }; var ps=sel.value; var r=RENTAL_RATE[ps]; var n=parseFloat(j.value); var price=0; if(r && !isNaN(n) && n>0){ var whole=Math.floor(n); var rem=Math.round((n-whole)*10)/10; price=whole*r.hour; if(Math.abs(rem-0.5)<0.001) price+=r.half; else if(rem>0) price+=Math.round(rem*r.hour);} h.value=price?String(price):''; sumRincian(); }
        sel.addEventListener('change', rec); j.addEventListener('input', rec); h.addEventListener('input', sumRincian);
      })();
      renumberAll(tb);
    }

    function addRowJajanan3x10(){
      var tb = document.querySelector('#jajananTable3x10 tbody');
      var items = Object.keys(JAJ_PRICE||{});
      var tr = document.createElement('tr');
      tr.innerHTML = '<td></td>' +
        '<td><select class="select mini j3-jenis"><option value="">-</option>'+items.map(function(x){return '<option>'+x+'</option>';}).join('')+'</select></td>' +
        '<td><div style="display:grid;grid-template-columns:1fr 1fr;gap: var(--space-1)">' +
            '<input type="number" min="0" step="1" placeholder="0" class="input mono mini j3-qty"/>' +
            '<input type="time" class="input mini j3-jam"/></div></td>' +
        '<td><input type="number" min="0" step="100" placeholder="0" readonly class="input mono mini j3-harga"/></td>';
      tb.appendChild(tr);
      // wire price calc
      (function(){
        var sel=tr.querySelector('.j3-jenis'), qty=tr.querySelector('.j3-qty'), harga=tr.querySelector('.j3-harga');
        function recalc(){ var unit=JAJ_PRICE[sel.value]||0; var q=cleanNum(qty.value); harga.value=unit*q; sumJajanan3x10(); }
        sel.addEventListener('change', recalc); qty.addEventListener('input', recalc);
      })();
      renumberAll(tb);
    }

    function addRowJasa2x5(){
      var tb = document.querySelector('#jasaTable2x5 tbody');
      var tr = document.createElement('tr');
      tr.innerHTML = '<td></td>' +
        '<td><select class="select mini jasa-type"><option value="">-</option>'+JASA_TYPES.map(function(x){return '<option>'+x+'</option>';}).join('')+'</select></td>' +
        '<td><input type="text" class="input mini jasa-note" placeholder="keterangan (opsional)"/></td>' +
        '<td><input type="number" min="0" step="100" placeholder="0" class="input mono mini jasa-price"/></td>';
      tb.appendChild(tr);
      tr.querySelector('.jasa-price').addEventListener('input', sumJasa2x5);
      renumberAll(tb);
    }

    function addRowSewa3x10(){
      var tb = document.querySelector('#sewaTable3x10 tbody');
      var tr = document.createElement('tr');
      tr.innerHTML = '<td></td>' +
        '<td><select class="select mini sewa-jenis"><option value="">-</option>'+SEWA_TYPES.map(function(x){return '<option>'+x+'</option>';}).join('')+'</select></td>' +
        '<td><div style="display:grid;grid-template-columns:1fr 1fr;gap: var(--space-1)">' +
            '<select class="select mini sewa-durasi"><option value="">-</option><option value="12JAM">12 JAM</option><option value="1HARI">1 HARI</option><option value="2HARI">2 HARI</option><option value="3HARI">3 HARI</option></select>' +
            '<input type="text" placeholder="Isi Sendiri" class="input mini sewa-manual"/></div></td>' +
        '<td><input type="text" placeholder="note (optional)" class="input mini sewa-lama-note"/></td><td><input type="number" min="0" step="1000" placeholder="0" class="input mono mini sewa-harga"/></td>';
      tb.appendChild(tr);
      (function(){
        var selJ=tr.querySelector('.sewa-jenis'); var selD=tr.querySelector('.sewa-durasi'); var inM=tr.querySelector('.sewa-manual'); var inH=tr.querySelector('.sewa-harga');
        function recalc(){
  var manualVal = (inM.value || '').trim();
  if(manualVal){
    // User filled 'Isi Sendiri', skip auto calculation entirely
    return;
  }
  var jam = hoursFromDurasiSelect(selD.value, '');
  var price = calcSewaPrice(selJ.value, jam);
  if(price>0){ inH.value = price; }
  else { inH.value=''; }
  sumSewa3x10();
}
        selJ.addEventListener('change', recalc); selD.addEventListener('change', recalc); inM.addEventListener('input', recalc); inH.addEventListener('input', sumSewa3x10);
      })();
      renumberAll(tb);
    }

    // Bind buttons
    (function(){
      var b1 = document.getElementById('rincianAddRow'); if(b1) b1.addEventListener('click', addRowRincian);
      var b2 = document.getElementById('jajanan3x10AddRow'); if(b2) b2.addEventListener('click', addRowJajanan3x10);
      var b3 = document.getElementById('jasa2x5AddRow'); if(b3) b3.addEventListener('click', addRowJasa2x5);
      var b4 = document.getElementById('sewa3x10AddRow'); if(b4) b4.addEventListener('click', addRowSewa3x10);
    })();

    

    // === Remove Row helpers ===
    async function removeRow(tbodySelector) {
      var tb = document.querySelector(tbodySelector + ' tbody');
      if (!tb || tb.rows.length === 0) return;

      var lastRow = tb.rows[tb.rows.length - 1];
      var hasData = false;
      lastRow.querySelectorAll('input, select').forEach(function(el) {
        if (el.value && String(el.value).trim() !== '') hasData = true;
      });

      if (!hasData || await themedConfirm('Baris ini berisi data. Yakin ingin menghapusnya?')) {
        tb.deleteRow(tb.rows.length - 1);
        renumberAll(tb);
        if (tbodySelector.indexOf('rincianTable') !== -1) sumRincian();
        if (tbodySelector.indexOf('jajananTable3x10') !== -1) sumJajanan3x10();
        if (tbodySelector.indexOf('jasaTable2x5') !== -1) sumJasa2x5();
        if (tbodySelector.indexOf('sewaTable3x10') !== -1) sumSewa3x10();
      }
    }

    // Add "Remove Row" buttons beside each "Add Row" button
    (function(){
      function addRemoveBtn(afterId, handler){
        var addBtn = document.getElementById(afterId);
        if(!addBtn) return;
        var btn = document.createElement('button');
        btn.className = 'btn warn';
        btn.textContent = '- Hapus Baris';
        btn.type = 'button';
        btn.style.marginLeft = '6px';
        btn.addEventListener('click', handler);
        if (addBtn.after) addBtn.after(btn);
        else addBtn.parentNode.insertBefore(btn, addBtn.nextSibling);
      }

      addRemoveBtn('rincianAddRow', async function(){ await removeRow('#rincianTable'); });
      addRemoveBtn('jajanan3x10AddRow', async function(){ await removeRow('#jajananTable3x10'); });
      addRemoveBtn('jasa2x5AddRow', async function(){ await removeRow('#jasaTable2x5'); });
      addRemoveBtn('sewa3x10AddRow', async function(){ await removeRow('#sewaTable3x10'); });
    })();

// ===== Init
    $('#year').textContent=(new Date()).getFullYear();
          $all('#rincianTable .r-jenis').forEach(function(sel){ sel.value = ''; });
      $('#date').value=todayStr();
    load();
    // Build tables
    (function initTables(){
      // Rincian
      (function(){ var rincianBody = $('#rincianTable tbody'); rincianBody.innerHTML=''; for(var i=1;i<=10;i++){ var tr=document.createElement('tr'); tr.innerHTML = '<td>'+i+'</td><td><select class="select mini r-jenis"><option value="">-</option><option>PS3</option><option>PS4</option></select></td><td><input type="time" class="input mini r-jam"/></td><td><input type="number" min="0" step="0.5" placeholder="0" class="input mono mini r-jumlah"/></td><td><input type="number" min="0" step="100" placeholder="0" class="input mono mini rincian-harga r-harga"/></td>'; $('#rincianTable tbody').appendChild(tr);} })();
      // wire
      (function(){ $all('#rincianTable tbody tr').forEach(function(tr){ var sel=tr.querySelector('.r-jenis'); var j=tr.querySelector('.r-jumlah'); var h=tr.querySelector('.r-harga'); function rec(){ var RENTAL_RATE={ PS3:{hour:5000,half:3000}, PS4:{hour:7000,half:4000} }; var ps=sel.value; var r=RENTAL_RATE[ps]; var n=parseFloat(j.value); var price=0; if(r && !isNaN(n) && n>0){ var whole=Math.floor(n); var rem=Math.round((n-whole)*10)/10; price=whole*r.hour; if(Math.abs(rem-0.5)<0.001) price+=r.half; else if(rem>0) price+=Math.round(rem*r.hour);} h.value=price?String(price):''; sumRincian(); } sel.addEventListener('change', rec); j.addEventListener('input', rec); }); $all('.r-harga').forEach(function(inp){ inp.addEventListener('input', sumRincian); }); })();
      // Jajanan
      buildJajanan3x10();
      // Jasa
      buildJasa2x5();
      // Sewa
      buildSewa3x10();
    })();

    sumRincian(); sumJajanan3x10(); sumJasa2x5(); sumSewa3x10();
    render();
    setRangeControlsEnabled(state.filter==='RENTANG');
updateRecap();
var actionsRow=document.getElementById('formActions');
if(actionsRow) actionsRow.classList.remove('editing');
if(window.sumGrandLive) window.sumGrandLive();
updateRecap();

    // ===== Daily Graph (per-month line chart) =====
    var graphCtx = null, graphCanvas = null, graphTooltip = null;
    function colorForValue(v){
      if(v > 200000) return '#2ecc71'; // green
      if(v > 150000) return '#2980b9'; // blue
      if(v > 100000) return '#f1c40f'; // yellow
      return '#e74c3c';                // red
    }
    function ensureTooltip(){
      if(graphTooltip) return graphTooltip;
      var div = document.createElement('div');
      div.className = 'graph-tooltip';
      div.style.position = 'absolute';
      div.style.display = 'none';
      document.body.appendChild(div);
      graphTooltip = div;
      return div;
    }
    
function getMonthlySeries(){
  // RENTANG mode → build directly from range
  if (state.filter === 'RENTANG' && state.range && (state.range.from || state.range.to)) {
    var from = state.range.from || '0000-01-01';
    var to   = state.range.to   || '9999-12-31';
    var list = state.entries.filter(function(e){
      var d = e.date || '';
      return d && d >= from && d <= to;
    });

    // Map date → total
    var map = {};
    list.forEach(function(e){
      var tot = cleanNum(e.harian)+cleanNum(e.jajanan)+cleanNum(e.jasa)+cleanNum(e.sewa);
      map[e.date] = (map[e.date]||0) + tot;
    });

    // Generate all days from 'from' to 'to'
    var data = [];
    var start = new Date(from);
    var end = new Date(to);
    for (var dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
      var iso = new Date(dt.getTime() - dt.getTimezoneOffset()*60000).toISOString().slice(0,10);
      data.push({date: iso, value: map[iso]||0});
    }
    return { month: from + ' s/d ' + to, rows: data };
  }

  // fallback to monthly behaviour
  var monthPick = (state.filter==='ALL') ? (new Date().toISOString().slice(0,7)) : state.filter;
  var list = state.entries.filter(function(x){ return (x.date||'').slice(0,7) === monthPick; });
  var map = {};
  list.forEach(function(e){
    var tot = cleanNum(e.harian)+cleanNum(e.jajanan)+cleanNum(e.jasa)+cleanNum(e.sewa);
    map[e.date] = (map[e.date]||0) + tot;
  });
  var p = monthPick.split('-');
  var y = +p[0], m = (+p[1])-1;
  var last = new Date(y, m+1, 0);
  var data = [];
  for(var d=1; d<=last.getDate(); d++){
    var dt = new Date(y, m, d);
    var iso = new Date(dt.getTime()-dt.getTimezoneOffset()*60000).toISOString().slice(0,10);
    data.push({date: iso, value: map[iso]||0});
  }
  return { month: monthPick, rows: data };
}


function drawDailyGraph(){
  graphCanvas = document.getElementById('dailyGraph');
  if(!graphCanvas) return;
  var rect = graphCanvas.getBoundingClientRect();
  var dpr = window.devicePixelRatio || 1;
  var cssW = graphCanvas.clientWidth || rect.width || 800;
  var cssH = graphCanvas.clientHeight || 260;
  graphCanvas.width = Math.round(cssW * dpr);
  graphCanvas.height = Math.round(cssH * dpr);
  graphCanvas.style.width = cssW + 'px';
  graphCanvas.style.height = cssH + 'px';
  graphCtx = graphCanvas.getContext('2d');
  graphCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  var data = [];
  var caption = document.getElementById('graphCaption');

  if (state.filter === 'RENTANG' && state.range && (state.range.from || state.range.to)) {
    var from = state.range.from || '0000-01-01';
    var to   = state.range.to   || '9999-12-31';
    var list = state.entries.filter(function(e){
      var d = e.date || '';
      return d && d >= from && d <= to;
    });
    var map = {};
    list.forEach(function(e){
      var tot = cleanNum(e.harian)+cleanNum(e.jajanan)+cleanNum(e.jasa)+cleanNum(e.sewa);
      map[e.date] = (map[e.date]||0) + tot;
    });
    var start = new Date(from);
    var end = new Date(to);
    for (var dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
      var iso = new Date(dt.getTime() - dt.getTimezoneOffset()*60000).toISOString().slice(0,10);
      data.push({date: iso, value: map[iso]||0});
    }
    if(caption) caption.textContent = 'Periode: ' + from + ' s/d ' + to + ' • ' + data.length + ' hari';
  } else {
    // Month mode
    var monthPick = (state.filter==='ALL') ? (new Date().toISOString().slice(0,7)) : state.filter;
    var list = state.entries.filter(function(x){ return (x.date||'').slice(0,7) === monthPick; });
    var map = {};
    list.forEach(function(e){
      var tot = cleanNum(e.harian)+cleanNum(e.jajanan)+cleanNum(e.jasa)+cleanNum(e.sewa);
      map[e.date] = (map[e.date]||0) + tot;
    });
    var p = monthPick.split('-');
    var y = +p[0], m = (+p[1])-1;
    var last = new Date(y, m+1, 0);
    for(var d=1; d<=last.getDate(); d++){
      var dt = new Date(y, m, d);
      var iso = new Date(dt.getTime()-dt.getTimezoneOffset()*60000).toISOString().slice(0,10);
      data.push({date: iso, value: map[iso]||0});
    }
    if(caption){
      try {
        var d = new Date(monthPick+'-01');
        caption.textContent = 'Periode: ' + d.toLocaleDateString('id-ID',{month:'long',year:'numeric'}) + ' • ' + data.length + ' hari';
      }catch(e){ caption.textContent = 'Periode: ' + monthPick; }
    }
  }

  var maxV = 0;
  data.forEach(function(r){ if(r.value>maxV) maxV=r.value; });
  var padL = 48, padR = 12, padT = 16, padB = 42;
  var W = (graphCanvas.clientWidth||cssW), H = (graphCanvas.clientHeight||cssH);
  var plotW = Math.max(10, W - padL - padR);
  var plotH = Math.max(10, H - padT - padB);
  function xAt(i){ return padL + (plotW * (i/(Math.max(1,data.length-1)))) }
  function yAt(v){ return padT + plotH - (maxV>0 ? (v/maxV)*plotH : 0); }

  graphCtx.clearRect(0,0,W,H);
  graphCtx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--ring') || '#334';
  graphCtx.lineWidth = 1;
  graphCtx.beginPath();
  graphCtx.moveTo(padL, padT);
  graphCtx.lineTo(padL, padT+plotH);
  graphCtx.lineTo(padL+plotW, padT+plotH);
  graphCtx.stroke();

  graphCtx.font = '12px Segoe UI, Roboto, Arial, sans-serif';
  graphCtx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--muted') || '#889';
  var steps = 4;
  for(var s=0; s<=steps; s++){
    var val = Math.round((maxV * s)/steps);
    var y = yAt(val);
    graphCtx.beginPath();
    graphCtx.moveTo(padL, y);
    graphCtx.lineTo(padL+plotW, y);
    graphCtx.globalAlpha = 0.2;
    graphCtx.stroke();
    graphCtx.globalAlpha = 1;
    graphCtx.fillText((val||0).toLocaleString('id-ID'), 6, y+4);
  }

  for(var i=0;i<data.length;i++){
    var dlab = data[i].date.slice(-2);
    if(i===0 || i===data.length-1 || i%Math.ceil(data.length/6)===0){
      var x = xAt(i);
      graphCtx.fillText(dlab, x-6, padT+plotH+16);
    }
  }

  for (var i=1; i<data.length; i++){
    var prev = data[i-1];
    var curr = data[i];
    var x1 = xAt(i-1), y1 = yAt(prev.value);
    var x2 = xAt(i), y2 = yAt(curr.value);
    graphCtx.strokeStyle = colorForValue(curr.value);
    graphCtx.lineWidth = 2;
    graphCtx.beginPath();
    graphCtx.moveTo(x1, y1);
    graphCtx.lineTo(x2, y2);
    graphCtx.stroke();
  }

  graphCtx.textAlign = 'center';
  graphCtx.textBaseline = 'bottom';
  data.forEach(function(r, i){
    var x = xAt(i), y = yAt(r.value);
    var c = colorForValue(r.value);
    graphCtx.beginPath();
    graphCtx.arc(x, y, 4, 0, Math.PI*2);
    graphCtx.fillStyle = c;
    graphCtx.fill();
  });
}

    function saveGraphAsImage(){
      var cvs = document.getElementById('dailyGraph');
      if(!cvs) return;
      var a=document.createElement('a');
      a.href = cvs.toDataURL('image/png');
      var mp = (state.filter==='ALL') ? (new Date().toISOString().slice(0,7)) : state.filter;
      a.download = 'grafik_total_harian_'+mp+'.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    function focusGraph(dateStr){
      var card = document.getElementById('graphCard');
      if(card){ card.classList.remove('pulse'); void card.offsetWidth; card.classList.add('pulse'); }
      if(card){ card.scrollIntoView({behavior:'smooth', block:'end'}); }
      // Optionally, we could highlight the exact point on next draw by storing target date.
      window.__graphFocusDate = dateStr || null;
    }


    // === Wire graph save + resize + theme change
    (function(){
      var sgb = document.getElementById('saveGraphBtn');
      if(sgb){ sgb.addEventListener('click', saveGraphAsImage); }
      window.addEventListener('resize', function(){ try{ drawDailyGraph(); }catch(e){} });
      var tbtn = document.getElementById('themeBtn');
      if(tbtn){
        tbtn.addEventListener('click', function(){ setTimeout(function(){ try{ drawDailyGraph(); }catch(e){} }, 50); }, { once:false });
      }
    })();

  });
})();






// === Backup & Restore Data Sub-menu ===
document.addEventListener("click", function(e){
    if(e.target && e.target.id === "openBackupRestoreSettings"){
        var backdrop = document.getElementById('popupBackdrop');
        var modal = document.getElementById('backupRestoreSettingsModal');
        backdrop.hidden = false;
        modal.hidden = false;
        requestAnimationFrame(function(){
            backdrop.classList.add('is-visible');
            modal.classList.add('is-visible');
        });
    }
});


// === Global delegation for closing Backup & Restore Data modal (returns to Settings modal) ===
document.addEventListener("click", function(e){
    if(e.target && e.target.hasAttribute("data-close")){
        var backupModal = e.target.closest("#backupRestoreSettingsModal");
        var backdrop = document.getElementById("popupBackdrop");
        var settingsModal = document.getElementById("settingsModal");
        if(backupModal){
            backupModal.classList.remove("is-visible");
            setTimeout(function(){
                backupModal.hidden = true;
                if(settingsModal){
                    settingsModal.hidden = false;
                    requestAnimationFrame(function(){
                        backdrop.classList.add('is-visible');
                        settingsModal.classList.add('is-visible');
                    });
                } else {
                    backdrop.hidden = true;
                }
            }, 200);
        }
    }
});


// === Settings Modal Tab Switch ===
document.addEventListener("click", function(e){
    if(e.target && e.target.hasAttribute("data-settings-tab")){
        var target = e.target.getAttribute("data-settings-tab");
        document.querySelectorAll("#settingsContentArea .settings-tab").forEach(function(tab){
            tab.hidden = (tab.getAttribute("data-tab") !== target);
        });
    }
});




// === Open Rincian Table Sub-Modals without hiding main backdrop ===
document.addEventListener("click", function(e){
    function openSubModal(id){
        var modal = document.getElementById(id);
        if(modal){
            modal.hidden = false;
            requestAnimationFrame(function(){
                modal.classList.add('is-visible');
            });
        }
    }
    if(e.target && e.target.id === "openJenisPSHarianSettings"){
        openSubModal("jenisPSHarianSettingsModal");
    }
    if(e.target && e.target.id === "openJasaAksesorisSettings"){
        openSubModal("jasaAksesorisSettingsModal");
    }
    if(e.target && e.target.id === "openJenisPSSewaSettings"){
        openSubModal("jenisPSSewaSettingsModal");
    }
});

// === Close only sub-modals, keep main backdrop active ===
document.addEventListener("click", function(e){
    if(e.target && e.target.hasAttribute("data-close")){
        var modal = e.target.closest(".modal");
        if(modal && modal.id !== "settingsModal"){ // avoid closing settings main modal here
            modal.classList.remove("is-visible");
            setTimeout(function(){
                modal.hidden = true;
            }, 200);
        }
    }
});


// === Toggle active state on sidebar buttons ===
document.querySelectorAll('.settings-sidebar .btn').forEach(function(btn){
    btn.addEventListener('click', function(){
        document.querySelectorAll('.settings-sidebar .btn').forEach(function(b){
            b.classList.remove('active');
        });
        btn.classList.add('active');
    });
});


// === Integrate active state with tab switching ===
document.addEventListener("click", function(e){
    if(e.target && e.target.hasAttribute("data-settings-tab")){
        // Remove active class from all sidebar buttons
        document.querySelectorAll('.settings-sidebar .btn').forEach(function(b){
            b.classList.remove('active');
        });
        // Add active class to clicked button
        e.target.classList.add('active');
    }
});

// === Export Data Sub-menu ===
document.addEventListener("click", function(e){
    if(e.target && e.target.id === "openExportDataSettings"){
        var backdrop = document.getElementById('popupBackdrop');
        var modal = document.getElementById('exportDataSettingsModal');
        backdrop.hidden = false;
        modal.hidden = false;
        requestAnimationFrame(function(){
            backdrop.classList.add('is-visible');
            modal.classList.add('is-visible');
        });
    }
    if(e.target && e.target.id === "exportCSVBtn"){
        try { exportCSV(); } catch(err){ themedAlert("Gagal ekspor CSV: " + err.message); }
    }
    if(e.target && e.target.id === "importCSVBtn"){
        var fileInput = document.getElementById('fileInput');
        if(fileInput) fileInput.click();
    }
});




// === Global delegation for closing Backup & Restore Data modal (returns to Settings modal) ===
document.addEventListener("click", function(e){
    if(e.target && e.target.hasAttribute("data-close")){
        var backupModal = e.target.closest("#backupRestoreSettingsModal");
        var backdrop = document.getElementById("popupBackdrop");
        var settingsModal = document.getElementById("settingsModal");
        if(backupModal){
            backupModal.classList.remove("is-visible");
            setTimeout(function(){
                backupModal.hidden = true;
                if(settingsModal){
                    settingsModal.hidden = false;
                    requestAnimationFrame(function(){
                        backdrop.classList.add('is-visible');
                        settingsModal.classList.add('is-visible');
                    });
                } else {
                    backdrop.hidden = true;
                }
            }, 200);
        }
    }
});








// === Event delegation for Backup & Restore ===
document.addEventListener("click", function(e){
    if(e.target && e.target.id === "backupDataBtn"){
        try {
            let allData = {};
            for(let i = 0; i < localStorage.length; i++){
                let key = localStorage.key(i);
                allData[key] = localStorage.getItem(key);
            }
            let blob = new Blob([JSON.stringify(allData, null, 2)], {type: "application/json"});
            let url = URL.createObjectURL(blob);
            let a = document.createElement("a");
            a.href = url;
            let now = new Date();
            let pad = function(n){return (n<10?'0':'')+n;};
            a.download = "urban_ps_backup_" + now.getFullYear() + "-" + pad(now.getMonth()+1) + "-" + pad(now.getDate()) + ".json";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch(err){
            themedAlert("Gagal backup: " + err.message);
        }
    }

    if(e.target && e.target.id === "restoreDataBtn"){
        var inputEl = document.getElementById("restoreFileInput");
        if(inputEl) inputEl.click();
    }
});

document.addEventListener("change", function(e){
    if(e.target && e.target.id === "restoreFileInput"){
        let file = e.target.files[0];
        if(!file) return;
        let reader = new FileReader();
        reader.onload = function(evt){
            try {
                let data = JSON.parse(evt.target.result);
                for(let key in data){
                    localStorage.setItem(key, data[key]);
                }
                themedAlert("Data berhasil direstore. Halaman akan dimuat ulang.", {title: "Restore Berhasil"}).then(function(){
                    location.reload();
                });
            } catch(err){
                themedAlert("Gagal restore: " + err.message);
            }
        };
        reader.readAsText(file);
    }
});


// === Global delegation for closing Export Data modal (returns to Settings modal) ===
document.addEventListener("click", function(e){
    if(e.target && e.target.hasAttribute("data-close")){
        var exportModal = e.target.closest("#exportDataSettingsModal");
        var backdrop = document.getElementById("popupBackdrop");
        var settingsModal = document.getElementById("settingsModal");
        if(exportModal){
            exportModal.classList.remove("is-visible");
            setTimeout(function(){
                exportModal.hidden = true;
                if(settingsModal){
                    settingsModal.hidden = false;
                    requestAnimationFrame(function(){
                        backdrop.classList.add('is-visible');
                        settingsModal.classList.add('is-visible');
                    });
                }
            }, 200);
        }
    }
});


// === Focus Trap for Modals ===
function trapFocus(modal) {
  const focusableEls = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (!focusableEls.length) return;
  const firstEl = focusableEls[0];
  const lastEl = focusableEls[focusableEls.length - 1];
  modal.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else { // Tab
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
  });
}
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('transitionend', () => {
    if (!modal.hidden) trapFocus(modal);
  });
});




(function(){
  function updateDayField(){
    var dateInput = document.getElementById('date');
    var dayInput = document.getElementById('day');
    if(!dateInput || !dayInput) return;
    if(!dateInput.value){
      dayInput.value = '';
      return;
    }
    try{
      var opts = { weekday: 'long' };
      var d = new Date(dateInput.value);
      dayInput.value = d.toLocaleDateString('id-ID', opts);
    }catch(e){
      dayInput.value = '';
    }
  }
  var dateInput = document.getElementById('date');
  if(dateInput){
    dateInput.addEventListener('input', updateDayField);
    dateInput.addEventListener('change', updateDayField);
    // Init on load after slight delay to catch programmatic changes
    setTimeout(updateDayField, 50);
    // Expose globally so other code can trigger it
    window.updateDayField = updateDayField;
  }
})();
