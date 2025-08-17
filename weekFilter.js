(function(){
  // compute Monday for a given date (YYYY-MM-DD). Monday is first day of week.
  function weekStart(dateStr) {
    var d = dateStr ? new Date(dateStr) : new Date();
    var day = d.getDay();
    var diff = d.getDate() - day + (day === 0 ? -6 : 1);
    var mon = new Date(d.setDate(diff));
    var iso = new Date(mon.getTime() - mon.getTimezoneOffset() * 60000).toISOString().slice(0,10);
    return iso;
  }
  function weekEnd(mondayStr) {
    var d = new Date(mondayStr);
    d.setDate(d.getDate() + 6);
    var iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,10);
    return iso;
  }
  function loadWeekStart() {
    try {
      return localStorage.getItem('urban_ps_week_start') || null;
    } catch(e) { return null; }
  }
  function saveWeekStart(s) {
    try {
      localStorage.setItem('urban_ps_week_start', s);
    } catch(e) {}
  }
  function initWeeklyFilter() {
    var today = new Date();
    var todayIso = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0,10);
    var curMon = weekStart(todayIso);
    var saved = loadWeekStart();
    if(!saved || saved !== curMon){
      saveWeekStart(curMon);
      state.weekStart = curMon;
      state.filter = 'WEEK';
      if(saved){
        setTimeout(function(){
          if(typeof themedAlert === 'function'){
            themedAlert('Filter Satu Minggu telah di-reset untuk minggu baru.', { title: 'Info' });
          }
        }, 100);
      }
    } else {
      state.weekStart = saved;
      if(!state.filter || state.filter === 'ALL'){
        state.filter = 'WEEK';
      }
    }
  }
  if(typeof buildMonthFilter === 'function'){
    var origBuildMonthFilter = buildMonthFilter;
    buildMonthFilter = function(){
      origBuildMonthFilter();
      var sel = document.getElementById('monthFilter');
      if(sel && !sel.querySelector('option[value=\"WEEK\"]')){
        var opt = document.createElement('option');
        opt.value = 'WEEK';
        opt.textContent = 'Satu Minggu';
        if(sel.options.length > 0){
          sel.insertBefore(opt, sel.options[1]);
        } else {
          sel.appendChild(opt);
        }
      }
      if(state.filter === 'WEEK'){
        sel.value = 'WEEK';
      }
    };
  }
  (function(){
    var origFiltered = window.filtered;
    window.filtered = function(){
      if(state.filter === 'WEEK'){
        var start = state.weekStart || weekStart();
        var end = weekEnd(start);
        return state.entries.filter(function(e){
          var d = e.date || '';
          return d >= start && d <= end;
        });
      }
      if(typeof origFiltered === 'function'){
        return origFiltered.apply(this, arguments);
      }
      return state.entries.slice();
    };
  })();
  initWeeklyFilter();
})();
