(function(){
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- intro curtain: home page, first visit of a session ---- */
  try{ if(document.getElementById("curtain")) sessionStorage.setItem("sw-seen","1"); }catch(e){}

  /* ---- reveal ---- */
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold:.16, rootMargin:"0px 0px -8% 0px" });
  function observe(root){
    root.querySelectorAll("[data-rv], .mask, [data-pillars], .curve").forEach(function(el){
      if(!el.classList.contains("in")) io.observe(el);
    });
  }

  /* ---- parallax ---- */
  var px = [], ticking = false;
  function collectParallax(){ px = Array.prototype.slice.call(document.querySelectorAll('.view.on [data-parallax]')); }
  function onScroll(){
    if(reduce || ticking) return; ticking = true;
    requestAnimationFrame(function(){
      var vh = window.innerHeight;
      px.forEach(function(el){
        var r = el.getBoundingClientRect(), f = parseFloat(el.dataset.parallax) || .1;
        var mid = r.top + r.height/2 - vh/2;
        el.style.transform = "translate3d(0," + (-mid * f).toFixed(1) + "px,0)";
      });
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive:true });

  /* ---- page setup ---- */
  observe(document); collectParallax(); onScroll();

  /* ---- transitions between real pages ---- */
  var wipe = document.getElementById("wipe");
  var root = document.documentElement;
  function endArrive(){ wipe.classList.remove("uncover"); root.classList.remove("arriving"); }
  if(root.classList.contains("arriving")){
    if(reduce){ endArrive(); }
    else{
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ wipe.classList.add("uncover"); }); });
      wipe.addEventListener("animationend", endArrive, { once:true });
    }
  }
  window.addEventListener("pageshow", function(e){
    if(e.persisted){ wipe.classList.remove("cover","uncover"); root.classList.remove("arriving"); }
  });
  document.addEventListener("click", function(e){
    if(e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest("a[href]");
    if(!a || a.target || a.hasAttribute("download")) return;
    var u; try{ u = new URL(a.href, location.href); }catch(x){ return; }
    if(u.origin !== location.origin) return;
    if(u.pathname === location.pathname){
      if(!u.hash){ e.preventDefault(); window.scrollTo({ top:0, behavior: reduce ? "auto" : "smooth" }); }
      return;
    }
    if(reduce) return;
    e.preventDefault();
    try{ sessionStorage.setItem("sw-nav","1"); }catch(x){}
    document.body.classList.remove("menu-open");
    wipe.classList.remove("uncover"); wipe.classList.add("cover");
    setTimeout(function(){ location.href = u.href; }, 480);
  });

  /* ---- prefetch the page a visitor is about to open ---- */
  var seen = {};
  function prefetch(e){
    var a = e.target.closest && e.target.closest("a[href]"); if(!a) return;
    var u; try{ u = new URL(a.href, location.href); }catch(x){ return; }
    if(u.origin !== location.origin || u.pathname === location.pathname || seen[u.pathname]) return;
    seen[u.pathname] = 1;
    var l = document.createElement("link"); l.rel = "prefetch"; l.href = u.pathname; document.head.appendChild(l);
  }
  document.addEventListener("mouseover", prefetch, { passive:true });
  document.addEventListener("touchstart", prefetch, { passive:true });

  /* ---- sideways rails: progress line + start position ---- */
  document.querySelectorAll("[data-rail]").forEach(function(r){
    var ui = document.createElement("div"); ui.className = "rail-ui"; ui.setAttribute("aria-hidden","true");
    var bar = document.createElement("i"); ui.appendChild(bar);
    r.parentNode.insertBefore(ui, r.nextSibling);
    function upd(){
      var max = r.scrollWidth - r.clientWidth;
      if(max <= 2){ ui.style.display = "none"; r.removeAttribute("tabindex"); return; }
      ui.style.display = ""; r.setAttribute("tabindex","0");
      var w = Math.max(r.clientWidth / r.scrollWidth, .14) * 100;
      bar.style.width = w + "%";
      bar.style.left = (r.scrollLeft / max * (100 - w)) + "%";
    }
    r.addEventListener("scroll", upd, { passive:true });
    window.addEventListener("resize", upd);
    window.addEventListener("load", function(){
      if(r.classList.contains("curve") && r.scrollWidth > r.clientWidth + 2) r.scrollLeft = (r.scrollWidth - r.clientWidth) * .3;
      upd();
    });
    upd();
  });

  /* ---- menu ---- */
  var burger = document.querySelector(".burger");
  burger.addEventListener("click", function(){
    var open = document.body.classList.toggle("menu-open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  /* ---- chip groups (generic single select) ---- */
  function chipGroup(el, onPick){
    el.addEventListener("click", function(e){
      var b = e.target.closest(".chip"); if(!b) return;
      el.querySelectorAll(".chip").forEach(function(c){ c.setAttribute("aria-pressed","false"); });
      b.setAttribute("aria-pressed","true");
      if(onPick) onPick(b);
    });
  }

  /* ---- residential calculator ---- */
  var bill = document.getElementById("bill");
  if(bill){
    var state = { bill:320, orient:1, usage:.4, batt:1 };
    var nums = {};
    ["mSize","mPanels","mBatt","mGen","mCover"].forEach(function(id){ nums[id] = { el:document.getElementById(id), cur:0 }; });

    function animateTo(id, target, dec){
      var o = nums[id], start = o.cur, t0 = performance.now(), dur = reduce ? 0 : 520;
      function frame(t){
        var k = dur ? Math.min(1,(t-t0)/dur) : 1;
        var e = 1 - Math.pow(1-k,3);
        var v = start + (target-start)*e;
        o.el.textContent = dec ? v.toFixed(dec) : Math.round(v).toLocaleString("en-NZ");
        if(k<1) requestAnimationFrame(frame); else o.cur = target;
      }
      requestAnimationFrame(frame);
    }
    function compute(){
      var annualCost = state.bill * 12;
      var energyCost = Math.max(annualCost - 1.9*365, annualCost*0.5);
      var useKwh = energyCost / 0.32;
      // size so generation lands near annual use, capped sensibly
      var yield_ = 1350 * state.orient;
      var size = Math.min(Math.max(useKwh / yield_ * 0.95, 3), 20);
      size = Math.round(size*10)/10;
      var gen = Math.round(size * yield_);
      var panels = Math.round(size*1000/440);
      var battKwh = state.batt ? Math.min(Math.max(Math.round(useKwh/365 * 0.45), 5), 30) : 0;
      var direct = Math.min(useKwh*state.usage, gen);
      var stored = state.batt ? Math.min(Math.max(gen - direct,0), battKwh*365*0.9*0.9) : 0;
      var cover = Math.min(Math.round((direct + stored)/useKwh*100), 95);
      animateTo("mSize", size, 1);
      animateTo("mPanels", panels);
      animateTo("mBatt", battKwh);
      animateTo("mGen", gen);
      animateTo("mCover", cover);
    }
    bill.addEventListener("input", function(){
      state.bill = +bill.value;
      document.getElementById("billv").textContent = "$" + state.bill;
      compute();
    });
    chipGroup(document.getElementById("orient"), function(b){ state.orient = +b.dataset.v; compute(); });
    chipGroup(document.getElementById("usage"),  function(b){ state.usage  = +b.dataset.v; compute(); });
    chipGroup(document.getElementById("batt"),   function(b){ state.batt   = +b.dataset.v; compute(); });
    compute();
  }

  /* ---- commercial battery toggle ---- */
  var bt = document.getElementById("battToggle");
  if(bt){
    bt.addEventListener("click", function(){
      var on = bt.getAttribute("aria-pressed") !== "true";
      bt.setAttribute("aria-pressed", on ? "true" : "false");
      bt.textContent = on ? "Battery on" : "Add battery";
      document.getElementById("curve").classList.toggle("batt", on);
      document.getElementById("curveNote").textContent = on
        ? "With storage, generation that would have been exported at midday is held and released into the late afternoon, when many sites are still drawing load."
        : "The shaded area is generation your building uses as it is produced. For most commercial sites this is the largest part of the case, before export is counted.";
    });
  }

  /* ---- accordion ---- */
  document.querySelectorAll(".acc-btn").forEach(function(btn){
    var item = btn.parentElement, panel = item.querySelector(".acc-panel");
    btn.setAttribute("aria-expanded","false");
    btn.addEventListener("click", function(){
      var open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      panel.style.maxHeight = open ? panel.scrollHeight + "px" : "0px";
    });
  });

  /* ---- proposal builder ---- */
  var prop = document.getElementById("v-proposal");
  if(prop){
    var data = {};
    var labels = { type:"Property", interest:"Interest", address:"Address", roof:"Roof", bill:"Monthly bill", when:"Busiest", name:"Contact" };
    function setRow(key, val){
      var row = prop.querySelector('[data-row="'+key+'"]');
      if(!row) return;
      row.classList.toggle("empty", !val);
      row.querySelector("dd").textContent = val || "Not yet";
    }
    prop.querySelectorAll("[data-single]").forEach(function(g){
      chipGroup(g, function(b){ data[g.dataset.single] = b.dataset.v; setRow(g.dataset.single, b.dataset.v); });
    });
    prop.querySelectorAll("[data-f]").forEach(function(input){
      input.addEventListener("input", function(){
        data[input.dataset.f] = input.value.trim();
        if(input.dataset.f === "address") setRow("address", input.value.trim());
        if(input.dataset.f === "name") setRow("name", input.value.trim());
      });
    });

    var step = 1;
    function showStep(n){
      step = n;
      prop.querySelectorAll(".pstep").forEach(function(s){ s.classList.toggle("on", +s.dataset.step === n); });
      prop.querySelectorAll(".prog i").forEach(function(i, idx){ i.classList.toggle("done", idx < n); });
      var top = prop.querySelector(".prop").getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: top, behavior: reduce ? "auto" : "smooth" });
    }
    function fail(s, msg){ s.querySelector("[data-err]").textContent = msg; }
    function clearErr(s){ s.querySelector("[data-err]").textContent = ""; }

    prop.querySelectorAll("[data-next]").forEach(function(btn){
      btn.addEventListener("click", function(){
        var s = btn.closest(".pstep"), n = +s.dataset.step;
        clearErr(s);
        if(n===1 && (!data.type || !data.interest)) return fail(s,"Pick a property type and what you are interested in to continue.");
        if(n===2 && !data.address) return fail(s,"Add the property address so we can look at the roof first.");
        if(n===3 && (!data.bill || !data.when)) return fail(s,"Choose a bill range and when the property is busiest.");
        showStep(n+1);
      });
    });
    prop.querySelectorAll("[data-back]").forEach(function(btn){
      btn.addEventListener("click", function(){ showStep(+btn.closest(".pstep").dataset.step - 1); });
    });
    var send = prop.querySelector("[data-send]");
    send.addEventListener("click", function(){
      var s = send.closest(".pstep"); clearErr(s);
      if(!data.name) return fail(s,"Add your name so we know who we are replying to.");
      if(!data.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) return fail(s,"Add an email address we can reply to.");
      var lines = ["Property brief — Solward",""];
      ["type","interest","address","roof","bill","when"].forEach(function(k){
        if(data[k]) lines.push(labels[k] + ": " + data[k]);
      });
      if(data.notes) lines.push("", "Notes: " + data.notes);
      lines.push("", "Name: " + data.name, "Email: " + data.email);
      if(data.phone) lines.push("Phone: " + data.phone);
      var href = "mailto:hello@solward.co.nz?subject=" + encodeURIComponent("Property brief — " + (data.address || data.name))
        + "&body=" + encodeURIComponent(lines.join("\n"));
      window.location.href = href;
      showStep(5);
    });
    prop.querySelector("[data-restart]").addEventListener("click", function(){
      data = {};
      prop.querySelectorAll(".chip").forEach(function(c){ c.setAttribute("aria-pressed","false"); });
      prop.querySelectorAll("[data-f]").forEach(function(i){ i.value = ""; });
      Object.keys(labels).forEach(function(k){ setRow(k, ""); });
      showStep(1);
    });
  }
})();
