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
    var lastCalc = null;
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
      lastCalc = { size:size, panels:panels, battKwh:battKwh, gen:gen, cover:cover };
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
    var handoff = document.querySelector(".readout a.btn");
    if(handoff) handoff.addEventListener("click", function(){
      var o = document.querySelector("#orient .chip[aria-pressed=true]");
      try{ sessionStorage.setItem("sw-calc", JSON.stringify({ bill:state.bill, usage:state.usage, batt:state.batt, orient:o ? o.textContent : "", calc:lastCalc })); }catch(e){}
    });
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

/* ---- finance repayment estimator ---- */
  var fAmt = document.getElementById("fAmt");
  if(fAmt){
    var fRate = document.getElementById("fRate"), fTerm = document.getElementById("fTerm");
    var fmt = function(n){ return "$" + Math.round(n).toLocaleString("en-NZ"); };
    var estimate = function(){
      var P = +fAmt.value, R = +fRate.value, Y = +fTerm.value, n = Y * 12, r = R / 100 / 12;
      var pay = r === 0 ? P / n : P * r / (1 - Math.pow(1 + r, -n)), total = pay * n;
      document.getElementById("fAmtV").textContent = fmt(P);
      document.getElementById("fRateV").textContent = (Math.round(R * 100) / 100) + "%";
      document.getElementById("fTermV").textContent = Y + (Y === 1 ? " year" : " years");
      document.getElementById("mPay").textContent = fmt(pay);
      document.getElementById("mTotal").textContent = fmt(total);
      document.getElementById("mInterest").textContent = fmt(total - P);
    };
    var clearPresets = function(){ document.querySelectorAll("#fpresets .chip").forEach(function(c){ c.setAttribute("aria-pressed","false"); }); };
    [fAmt, fRate, fTerm].forEach(function(el){ el.addEventListener("input", function(){ clearPresets(); estimate(); }); });
    document.querySelectorAll("#fpresets .chip").forEach(function(c){
      c.addEventListener("click", function(){
        clearPresets(); c.setAttribute("aria-pressed","true");
        fRate.value = c.dataset.r; fTerm.value = c.dataset.y; estimate();
      });
    });
    estimate();
  }

  /* ---- home package chooser ---- */
  var chBill = document.getElementById("chBill");
  if(chBill){
    var chEv = document.getElementById("chEv");
    var keys = ["small","medium","large"], names = ["Small","Medium","Large"], kws = ["4.4","7.0","10.1"];
    var recommend = function(){
      var b = +chBill.value, lvl = b <= 265 ? 0 : b <= 385 ? 1 : 2;
      if(chEv.getAttribute("aria-pressed") === "true") lvl = Math.min(lvl + 1, 2);
      document.getElementById("chBillV").textContent = "$" + b;
      document.getElementById("chName").textContent = names[lvl] + " package";
      document.getElementById("chKw").textContent = "about " + kws[lvl] + " kW";
      document.getElementById("chLink").href = "/proposal?package=home-" + keys[lvl];
      document.querySelectorAll("[data-pkg]").forEach(function(c){ c.classList.toggle("is-rec", c.dataset.pkg === keys[lvl]); });
    };
    chBill.addEventListener("input", recommend);
    chEv.addEventListener("click", function(){ chEv.setAttribute("aria-pressed", chEv.getAttribute("aria-pressed") === "true" ? "false" : "true"); recommend(); });
    recommend();
  }

  /* ---- article contents: highlight the section being read ---- */
  var tocLinks = document.querySelectorAll(".toc a");
  if(tocLinks.length && "IntersectionObserver" in window){
    var heads = Array.prototype.slice.call(document.querySelectorAll(".art-body h2[id]"));
    var spy = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){
          tocLinks.forEach(function(a){ a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); });
        }
      });
    }, { rootMargin:"-18% 0px -72% 0px" });
    heads.forEach(function(h){ spy.observe(h); });
  }

  
  /* ---- proposal builder ---- */
  var prop = document.getElementById("v-proposal");
  if(prop){
    var data = {};
    var labels = { type:"Property", interest:"Interest", address:"Address", roof:"Roof", bill:"Monthly bill", when:"Busiest", finance:"Finance", package:"Package", name:"Contact" };
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
    /* ---- submission ---- */
    var cfg = window.SOLWARD || {};
    var endpoint = String(cfg.formEndpoint || "").trim();
    if(/^[a-z0-9]{6,}$/i.test(endpoint)) endpoint = "https://formspree.io/f/" + endpoint;      // just the form ID
    else if(/^formspree\.io\//i.test(endpoint)) endpoint = "https://" + endpoint;            // missing https://
    var leadEmail = cfg.leadEmail || "hello@solward.co.nz";
    var pageLoadedAt = Date.now();
    var calcNote = "";
    var send = prop.querySelector("[data-send]");
    var mailBtn = prop.querySelector("[data-mail]");
    var footEl = prop.querySelector(".paper .foot");
    var footOrig = footEl ? footEl.textContent : "";
    var sending = false;

    function briefLines(){
      var lines = ["Free quote request — Solward", ""];
      ["type","interest","package","address","roof","bill","when","finance"].forEach(function(k){ if(data[k]) lines.push(labels[k] + ": " + data[k]); });
      if(data.notes) lines.push("", "Notes: " + data.notes);
      if(calcNote) lines.push("", calcNote);
      lines.push("", "Name: " + data.name, "Email: " + data.email);
      if(data.phone) lines.push("Phone: " + data.phone);
      return lines;
    }
    function openMail(){
      window.location.href = "mailto:" + leadEmail + "?subject=" + encodeURIComponent("Free quote request — " + (data.address || data.name))
        + "&body=" + encodeURIComponent(briefLines().join("\n"));
    }
    function payload(){
      return {
        _subject: "New Solward free quote request — " + (data.address || data.name),
        _replyto: data.email,
        name: data.name, email: data.email, phone: data.phone || "",
        property_type: data.type || "", interest: data.interest || "", address: data.address || "",
        roof: data.roof || "", monthly_bill: data.bill || "", busiest: data.when || "",
        notes: data.notes || "", package: data.package || "", finance: data.finance || "", system_shaper: calcNote,
        page: location.href, submitted_at: new Date().toISOString(),
        _gotcha: (document.getElementById("hp") || {}).value || ""
      };
    }
    function finish(){
      sending = false; send.disabled = false; send.textContent = "Send the brief";
      try{ sessionStorage.removeItem("sw-calc"); }catch(e){}
      var to = document.getElementById("sentTo"); if(to) to.textContent = data.email;
      if(footEl) footEl.textContent = "Sent. A brief is not a quote; scope and price follow the site visit.";
      if(typeof window.gtag === "function") window.gtag("event", "generate_lead");
      try{ if(typeof window.fbq === "function") window.fbq("track", "Lead"); }catch(e){}
      showStep(5);
    }

    send.addEventListener("click", function(){
      if(sending) return;
      var s = send.closest(".pstep"); clearErr(s); mailBtn.hidden = true;
      if(!data.name) return fail(s, "Add your name so we know who we are replying to.");
      if(!data.email || !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(data.email)) return fail(s, "Check the email address, it looks incomplete (for example, ending in .co.nz).");
      if(data.phone && data.phone.replace(/\D/g, "").length < 7) return fail(s, "That phone number looks short. Check it, or leave it blank.");
      if(!endpoint){ openMail(); showStep(5); return; }            // no form service connected yet
      var p = payload();
      if(p._gotcha || Date.now() - pageLoadedAt < 4000){ showStep(5); return; }   // bots: look successful, send nothing
      sending = true; send.disabled = true; send.textContent = "Sending…";
      var ctl = ("AbortController" in window) ? new AbortController() : null;
      var timer = setTimeout(function(){ if(ctl) ctl.abort(); }, 15000);
      fetch(endpoint, { method:"POST", headers:{ "Content-Type":"application/json", "Accept":"application/json" },
                        body: JSON.stringify(p), signal: ctl ? ctl.signal : undefined })
        .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ return { ok:r.ok, body:j }; }); })
        .then(function(res){
          clearTimeout(timer);
          if(!res.ok || (res.body && res.body.ok === false)){ var er = new Error("rejected"); er.detail = res.body && res.body.errors && res.body.errors[0] && res.body.errors[0].message; throw er; }
          finish();
        })
        .catch(function(e){
          clearTimeout(timer);
          sending = false; send.disabled = false; send.textContent = "Send the brief";
          fail(s, (e && e.detail ? "Formspree said: " + e.detail + ". " : "We could not send that just now. ") + "Please check your details and try again, or email it to us instead.");
          mailBtn.hidden = false;
        });
    });
    mailBtn.addEventListener("click", function(){ openMail(); });

    /* ---- hand-off from the system shaper on the Residential page ---- */
    try{
      var raw = sessionStorage.getItem("sw-calc");
      if(raw){
        var c = JSON.parse(raw), k = c.calc || {}, b = +c.bill;
        var pick = function(group, value){
          var el = prop.querySelector('[data-single="' + group + '"] .chip[data-v="' + value + '"]'); if(el) el.click();
        };
        pick("type", "Home");
        pick("interest", c.batt ? "Solar and battery" : "Solar only");
        pick("bill", b < 200 ? "Under $200" : b < 400 ? "$200 to $400" : b < 800 ? "$400 to $800" : "Over $800");
        if(c.usage <= .25) pick("when", "Evenings and weekends"); else if(c.usage >= .55) pick("when", "Daytime, weekdays");
        calcNote = "System shaper (indicative, not a quote): " + k.size + " kW, about " + k.panels + " panels, "
          + (k.battKwh ? k.battKwh + " kWh battery" : "no battery") + ", about " + Number(k.gen).toLocaleString("en-NZ")
          + " kWh a year, roof facing " + (c.orient || "not stated") + ", monthly bill about $" + b + ".";
        var note = prop.querySelector("[data-prefill]"); if(note) note.hidden = false;
      }
    }catch(e){}

    /* ---- hand-off from package and finance pages: /proposal?package=home-medium&finance=yes ---- */
    try{
      var qs = new URLSearchParams(location.search), pk = (qs.get("package") || "").toLowerCase().split("-");
      var pickQ = function(group, value){ var el = prop.querySelector('[data-single="' + group + '"] .chip[data-v="' + value + '"]'); if(el) el.click(); };
      if(pk.length === 2 && /^(home|commercial)$/.test(pk[0]) && /^(small|medium|large)$/.test(pk[1])){
        var nm = pk[1].charAt(0).toUpperCase() + pk[1].slice(1);
        data.package = (pk[0] === "home" ? "Home" : "Commercial") + " package: " + nm;
        setRow("package", data.package);
        pickQ("type", pk[0] === "home" ? "Home" : "Commercial building");
        var note2 = prop.querySelector("[data-prefill]");
        if(note2){ note2.textContent = "Pre-filled from the " + data.package + " you chose. Change anything that is not right."; note2.hidden = false; }
      }
      if(qs.get("finance") === "yes") pickQ("finance", "Yes, interested in finance");
    }catch(e){}

    prop.querySelector("[data-restart]").addEventListener("click", function(){
      data = {}; calcNote = "";
      prop.querySelectorAll(".chip").forEach(function(c){ c.setAttribute("aria-pressed", "false"); });
      prop.querySelectorAll("[data-f]").forEach(function(i){ i.value = ""; });
      Object.keys(labels).forEach(function(k){ setRow(k, ""); });
      var note = prop.querySelector("[data-prefill]"); if(note) note.hidden = true;
      mailBtn.hidden = true; if(footEl) footEl.textContent = footOrig;
      showStep(1);
    });
  }

  /* ---- contact form ---- */
  var cf = document.getElementById("contactForm");
  if(cf){
    var ccfg = window.SOLWARD || {}, cend = String(ccfg.formEndpoint || "").trim();
    if(/^[a-z0-9]{6,}$/i.test(cend)) cend = "https://formspree.io/f/" + cend;
    else if(/^formspree\.io\//i.test(cend)) cend = "https://" + cend;
    var cto = ccfg.leadEmail || "hello@solward.co.nz", cLoaded = Date.now(), cSending = false;
    var cv = function(k){ var el = cf.querySelector('[data-c="'+k+'"]'); return el ? el.value.trim() : ""; };
    var cErr = document.getElementById("cErr"), cSend = document.getElementById("cSend"), cMail = document.getElementById("cMail");
    var cMailOpen = function(){ window.location.href = "mailto:" + cto + "?subject=" + encodeURIComponent("Website message from " + cv("name")) + "&body=" + encodeURIComponent(cv("message") + "\n\n" + cv("name") + "\n" + cv("email") + (cv("phone") ? "\n" + cv("phone") : "")); };
    var cDone = function(){ cf.querySelectorAll(".ffield,.pnav,.fine,.err,.muted").forEach(function(e){ e.hidden = true; }); document.getElementById("cTo").textContent = cv("email"); document.getElementById("cThanks").hidden = false; };
    cSend.addEventListener("click", function(){
      if(cSending) return; cErr.textContent = ""; cMail.hidden = true;
      if(!cv("name")) { cErr.textContent = "Add your name so we know who we are replying to."; return; }
      if(!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(cv("email"))) { cErr.textContent = "Check the email address, it looks incomplete (for example, ending in .co.nz)."; return; }
      if(cv("message").length < 3) { cErr.textContent = "Add a short message so we know how to help."; return; }
      if(!cend){ cMailOpen(); cDone(); return; }
      var hp = (document.getElementById("chp") || {}).value || "";
      if(hp || Date.now() - cLoaded < 3000){ cDone(); return; }
      cSending = true; cSend.disabled = true; cSend.textContent = "Sending…";
      var ctl = ("AbortController" in window) ? new AbortController() : null, tm = setTimeout(function(){ if(ctl) ctl.abort(); }, 15000);
      fetch(cend, { method:"POST", headers:{ "Content-Type":"application/json", "Accept":"application/json" }, signal: ctl ? ctl.signal : undefined,
        body: JSON.stringify({ _subject:"New Solward website message — " + cv("name"), _replyto: cv("email"), name: cv("name"), email: cv("email"), phone: cv("phone"), message: cv("message"), page: location.href, submitted_at: new Date().toISOString() }) })
        .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ return { ok:r.ok, body:j }; }); })
        .then(function(res){ clearTimeout(tm); if(!res.ok || (res.body && res.body.ok === false)){ var er = new Error("rejected"); er.detail = res.body && res.body.errors && res.body.errors[0] && res.body.errors[0].message; throw er; } cSending = false; cSend.disabled = false; cSend.textContent = "Send message"; try{ if(typeof window.fbq === "function") window.fbq("track", "Lead"); }catch(e){} cDone(); })
        .catch(function(e){ clearTimeout(tm); cSending = false; cSend.disabled = false; cSend.textContent = "Send message";
          cErr.textContent = (e && e.detail ? "Formspree said: " + e.detail + ". " : "We could not send that just now. ") + "Please check your details and try again, or email us instead."; cMail.hidden = false; });
    });
    cMail.addEventListener("click", cMailOpen);
  }
})();
