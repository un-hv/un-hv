// ==UserScript==
// @name         Percentage Ranges
// @namespace    https://github.com/un-hv
// @version      1.1.9
// @author       un-hv community
// @description  Stats to %
// @copyright    2026, un-hv
// @icon         https://e-hentai.org/favicon.ico
// @homepage     https://github.com/un-hv/un-hv
// @supportURL   https://forums.e-hentai.org/index.php?showtopic=290597
// @downloadURL  https://cdn.jsdelivr.net/gh/un-hv/un-hv@release/percentage-ranges.user.js
// @updateURL    https://cdn.jsdelivr.net/gh/un-hv/un-hv@release/percentage-ranges.user.js
// @match        *://hentaiverse.org/isekai/*
// @match        *://alt.hentaiverse.org/isekai/*
// @match        https://forums.e-hentai.org/*
// @connect      hentaiverse.org
// @connect      alt.hentaiverse.org
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
  'use strict';

  const d=new Set;const importCSS = async e=>{d.has(e)||(d.add(e),(t=>{typeof GM_addStyle=="function"?GM_addStyle(t):(document.head||document.documentElement).appendChild(document.createElement("style")).append(t);})(e));};

  const CONFIGS = {
    key_toggle: 'f',
    key_pin: 'q',
    key_forge: 'w',
    key_delete: 'delete',
    key_link: 'l'
  };

  const QUALITY_CONFIG = {
    Peerless: {
      range: [ 200, 200 ],
      cap: 50
    },
    Legendary: {
      range: [ 170, 200 ],
      cap: 40
    },
    Magnificent: {
      range: [ 150, 180 ],
      cap: 30
    },
    Exquisite: {
      range: [ 120, 160 ],
      cap: 20
    },
    Superior: {
      range: [ 90, 130 ],
      cap: 20
    },
    Average: {
      range: [ 60, 100 ],
      cap: 20
    },
    Fair: {
      range: [ 30, 70 ],
      cap: 20
    },
    Crude: {
      range: [ 0, 40 ],
      cap: 20
    }
  };

  const forumsCss = '.hv-tip{position:fixed;width:420px;font-size:8pt;font-family:verdana;text-align:center;color:#5c0d11;background-color:#e3e0d1;padding:4px 0;border:1px solid #5c0d11}.hv-tip p{margin:0}.hv-tip .showequip>div{margin:3px auto 0;padding:1px}.hv-tip .showequip>div:first-child,.hv-tip .eq span,.hv-tip .eqt,.hv-tip .eqr,.hv-tip .eqc{font-weight:700}.hv-tip .showequip>div:first-child{border-bottom:1px solid #a47c78;font-size:10pt;padding:2px 0 4px}.hv-tip .eq>div{margin:1px auto;padding:1px;text-align:center;min-height:17px}.hv-tip .eqt,.hv-tip .eqr{font-size:110%}.hv-tip .ex,.hv-tip .ep{display:grid;gap:2px 5px;justify-items:center}.hv-tip .ex{grid-template-columns:repeat(2,1fr);border-top:1px solid #a47c78;text-align:right!important}.hv-tip .ex>div{width:165px;height:18px}.hv-tip .ex>div>div:nth-child(1){float:left;width:99px;padding:2px;white-space:nowrap}.hv-tip .ex>div>div:nth-child(2){float:left;width:45px;padding:2px 0 2px 2px}.hv-tip .ex>div>div:nth-child(3){float:left;width:6px;padding:2px}.hv-tip .ep>div{width:115px;height:18px}.hv-tip .ep>div:first-child{font-weight:700;margin:4px auto 0!important;width:320px!important;grid-column:1 / -1}.hv-tip .ep>div>div:nth-child(1){float:left;width:60px;padding:2px;text-align:right;white-space:nowrap}.hv-tip .ep>div>div:nth-child(2){float:left;width:45px;padding:2px 0 2px 2px;text-align:left}.hv-tip .ep1{grid-template-columns:repeat(1,1fr)}.hv-tip .ep2{grid-template-columns:repeat(2,1fr)}.hv-tip .ep3{grid-template-columns:repeat(3,1fr)}.hv-tip a:link,.hv-tip a:visited,.hv-tip a:active{color:#5c0d11}.hv-err{padding:10px;color:#ff2323;font-weight:700}.hv-pin-box{display:flex;flex-direction:column;border:1px solid #5c0d11;box-shadow:0 4px 10px #0006;z-index:10001;padding:0}.hv-pin-header{background-color:#5c0d11;color:#edebdf;padding:3px 6px;cursor:move;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;font-size:10px;font-weight:700;user-select:none}.hv-pin-close:hover{color:#f66}.hv-pin-body{padding:4px 0;overflow:auto;max-height:80vh}';

  importCSS(forumsCss);

  const forumsPersistentCss = '.hv-tip-persistent #showequip>div:first-child{font-weight:700;font-size:120%;border-bottom:1px solid #a47c78}.hv-tip-persistent .eq>div:nth-child(1),.hv-tip-persistent .eq>div:nth-child(2),.hv-tip-persistent #equip_extended>div:last-child>div{font-size:110%;font-weight:700}.hv-tip-persistent .ex,.hv-tip .ep{padding-top:3px!important;margin:2px auto 0!important;display:flex;justify-content:center;flex-flow:row wrap}.hv-tip-persistent #equip_extended>div:last-child{margin:7px auto 2px;text-align:center}.hv-tip-persistent #eu>span,.hv-tip-persistent .es>div:first-child>span{color:red}.hv-tip-persistent #ep>span{color:#00f}';

  importCSS(forumsPersistentCss);

  const $ = (container, selector) => container.querySelector(selector);

  const $$ = selector => document.querySelectorAll(selector);

  function el(tag, props = {}, children = []) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'style' && typeof v === 'object') {
        Object.assign(e.style, v);
      } else if (k === 'dataset' && typeof v === 'object') {
        Object.assign(e.dataset, v);
      } else if (k.startsWith('on') && typeof v === 'function') {
        e[k.toLowerCase()] = v;
      } else if (k in e) {
        e[k] = v;
      } else if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
        e.setAttribute(k, String(v));
      }
    }
    if (children.length > 0) {
      const fragment = document.createDocumentFragment();
      for (const c of children) {
        if (c != null && typeof c !== 'boolean') {
          fragment.append(typeof c === 'object' ? c : String(c));
        }
      }
      e.append(fragment);
    }
    return e;
  }

  function createBtn(config) {
    var _a;
    return el('button', {
      type: 'button',
      class: config.class,
      style: `margin-left: 5px;\n              cursor: pointer !important;\n              transition: color 0.2s;\n              border: none;\n              background: transparent;\n              ${(_a = config.style) != null ? _a : ''}`,
      onclick: config.onclick
    }, [ config.text ]);
  }

  const equipMap = /* @__PURE__ */ new WeakMap;

  const globalState = {
    showPercent: GM_getValue('showPercent', true),
    showMaxForge: false,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  };

  const UI_BUTTONS = {
    get PERCENT() {
      return createBtn({
        text: '%',
        onclick: togglePercent,
        style: 'font-weight: bold;'
      });
    },
    get FORGE() {
      return createBtn({
        text: '🔨',
        onclick: toggleForge
      });
    }
  };

  function togglePercent() {
    if (globalState.showMaxForge) globalState.showMaxForge = false;
    globalState.showPercent = !globalState.showPercent;
    GM_setValue('showPercent', globalState.showPercent);
    globalThis.dispatchEvent(new CustomEvent('hv-state-change'));
  }

  function toggleForge() {
    globalState.showMaxForge = !globalState.showMaxForge;
    if (globalState.showMaxForge) globalState.showPercent = false;
    globalThis.dispatchEvent(new CustomEvent('hv-state-change'));
  }

  globalThis.addEventListener('hv-toggle-percent', () => {
    togglePercent();
  });

  globalThis.addEventListener('hv-toggle-forge', () => {
    toggleForge();
  });

  const REGEX_VAL = /^(\d+(?:\.\d+)?)(?:\s+(\S.*))?$/;

  const REGEX_BASE = /Base:\s*([+-]?[\d.]+)/i;

  const REGEX_TIER = /Tier\s+(\d+)\s*\/\s*(\d+)\s*\/\s*(\d+)/i;

  const REGEX_DAMAGE = /^(?:Magic|Attack|Void|Crushing|Piercing|Slashing) Damage/;

  function parseEquip(container) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    if ($(container, '.hv-lpr-avg')) return;
    const eq = $(container, '.eq');
    const eqt = $(container, '.eqt');
    if (!eq || !eqt) return;
    const title = (_a = container.firstElementChild) == null ? void 0 : _a.textContent.trim();
    if (!title) return;
    const found = Object.entries(QUALITY_CONFIG).find(([key]) => title.startsWith(key));
    if (!found) return;
    const [quality, {range: range, cap: cap}] = found;
    const stats = [];
    const rows = [ ...eq.querySelectorAll('.ex > div, .ep > div'), ...Array.from(eq.querySelectorAll('[title^="Base: "]')).filter(el2 => !el2.closest('.ex, .ep')) ];
    for (const row of rows) {
      const span = row.querySelector('span');
      if (!span) continue;
      const match = REGEX_VAL.exec(span.textContent.trim());
      if (!match) continue;
      const [_, valStr, typeText] = match;
      if (!valStr) continue;
      const name = typeText != null ? typeText : (_b = row.firstElementChild) == null ? void 0 : _b.textContent.trim();
      if (!name) continue;
      const baseMatch = (_c = row.getAttribute('title')) == null ? void 0 : _c.match(REGEX_BASE);
      const prefixNode = span.previousSibling;
      const suffixNode = (_e = (_d = span.parentNode) == null ? void 0 : _d.nextSibling) != null ? _e : null;
      stats.push({
        title: name,
        val: Number.parseFloat(valStr),
        valStr: valStr,
        base: baseMatch ? Number.parseFloat(baseMatch[1]) : null,
        rate: REGEX_DAMAGE.test(name) ? 2 : 1,
        prefix: (prefixNode == null ? void 0 : prefixNode.nodeType) === 3 ? prefixNode.textContent : '',
        suffix: (_f = suffixNode == null ? void 0 : suffixNode.textContent) != null ? _f : null,
        typeText: typeText != null ? typeText : null,
        _el: span,
        _preNode: prefixNode,
        _sufNode: suffixNode
      });
    }
    const avg = el('div', {
      class: 'hv-lpr-avg',
      style: container.closest('#popup_box') ? 'position: absolute; bottom: 4px; left: 0; right: 0; text-align :center;' : void 0
    });
    container.append(avg);
    const tierMatch = REGEX_TIER.exec(eqt.textContent);
    const equip = {
      title: title,
      quality: quality,
      range: range,
      stats: stats,
      _eq: eq,
      _avg: avg,
      ...tierMatch ? {
        type: 'Soulbound',
        tier_up: +tierMatch[1],
        tier_iw: +tierMatch[2],
        tier_max: +tierMatch[3],
        forge_max: +tierMatch[3] * 2,
        _eqt: eqt
      } : {
        type: 'Tradeable',
        level: +((_h = (_g = /Level (\d+)/i.exec(eqt.textContent)) == null ? void 0 : _g[1]) != null ? _h : 0),
        forge_max: cap
      }
    };
    equipMap.set(container, equip);
    const excludePatterns = [ '?s=Character&ss=eq', '?s=Battle&ss=iw', '?s=Bazaar&ss=am&screen=modify&' ];
    const showCompare = /^(?:\/isekai)?\/equip/.test(location.pathname) || ((_i = document.getElementById('equipinfo')) == null ? void 0 : _i.contains(container)) && location.search !== '' && excludePatterns.every(pattern => !location.search.includes(pattern));
    let compareQuality = null;
    if (showCompare) {
      const initQuality = quality;
      if (initQuality !== quality) {
        compareQuality = initQuality;
      }
      const select = el('select', {
        id: 'hv-quality-compare',
        onchange: () => {
          renderEquip(container, select.value);
        }
      }, Object.keys(QUALITY_CONFIG).map(k => el('option', {
        value: k,
        selected: k === initQuality
      }, [ k ])));
      container.append(el('div', {
        style: 'padding: 6px; border-top: 1px solid #A47C78;'
      }, [ el('b', {}, [ 'Compare: ' ]), select, ...globalState.isMobile ? [ UI_BUTTONS.PERCENT, UI_BUTTONS.FORGE ] : [] ]));
    }
    renderEquip(container, compareQuality);
  }

  const charmExclusiveBonus = /* @__PURE__ */ new Set([ 'HP Bonus', 'MP Bonus', 'Counter-parry' ]);

  function renderEquip(container, compareQuality = null) {
    const equip = equipMap.get(container);
    if (!equip) return;
    const {showPercent: showPercent, showMaxForge: showMaxForge} = globalState;
    if (equip.type === 'Soulbound') {
      const {tier_up: up, tier_iw: iw, tier_max: max2} = equip;
      if (showMaxForge && (max2 - up > 0 || max2 - iw > 0)) {
        const diffX = max2 - up > 0 ? `${up}<span class="hv-txt-green">+${max2 - up}</span>` : max2;
        const diffY = max2 - iw > 0 ? `${iw}<span class="hv-txt-green">+${max2 - iw}</span>` : max2;
        equip._eqt.innerHTML = `Tier ${diffX} / ${diffY} / ${max2}`;
      } else {
        equip._eqt.textContent = `Tier ${up} / ${iw} / ${max2}`;
      }
    }
    let totalPercent = 0;
    let statCount = 0;
    const [min, max] = compareQuality ? QUALITY_CONFIG[compareQuality].range : equip.range;
    const forge_current = equip.type === 'Soulbound' ? equip.tier_up + equip.tier_iw : 0;
    const getColor = (percent, max2 = 70, min2 = 30) => percent >= max2 ? 'hv-txt-green' : percent <= min2 ? 'hv-txt-red' : 'hv-txt-mid';
    for (const stat of equip.stats) {
      const el2 = stat._el;
      el2.classList.remove('hv-txt-red', 'hv-txt-green', 'hv-txt-mid');
      let percent = null;
      if (stat.base !== null) {
        const span = max - min || 30;
        percent = Number.parseFloat(((stat.base - (max - span)) / span * 100).toFixed(1));
        totalPercent += percent;
        statCount++;
      }
      const isForgeMode = showMaxForge && equip.forge_max > forge_current && !charmExclusiveBonus.has(stat.title);
      const isPercentMode = showPercent && !isForgeMode && percent !== null;
      const hideSurrounding = isForgeMode || isPercentMode;
      if (stat._preNode) {
        stat._preNode.textContent = hideSurrounding ? '' : stat.prefix;
      }
      if (stat._sufNode && !stat.typeText) {
        stat._sufNode.textContent = hideSurrounding ? '' : stat.suffix;
      }
      const typeText = stat.typeText ? ` ${stat.typeText}` : '';
      if (isForgeMode) {
        const maxVal = stat.val * (1 + equip.forge_max * stat.rate / 100) / (1 + forge_current * stat.rate / 100);
        const gainText = Math.round((maxVal - stat.val) * 100) / 100;
        el2.innerHTML = `${stat.valStr}<span class="hv-txt-green">+${gainText}</span>${typeText}`;
      } else if (isPercentMode && percent !== null) {
        el2.textContent = `${percent}%${typeText}`;
        el2.classList.add(getColor(percent));
      } else {
        el2.textContent = `${stat.valStr}${typeText}`;
      }
    }
    if (statCount > 0) {
      const avg = Number.parseFloat((totalPercent / statCount).toFixed(1));
      const mode = showMaxForge ? 'Max Forged' : showPercent ? 'Percentage' : 'Value';
      equip._avg.innerHTML = `<div class="${getColor(avg, 60, 40)}">Avg: ${avg}%</div><div style="font-size: 10px;" title="Hotkeys: f, w">Mode: ${mode}</div>`;
    } else {
      equip._avg.textContent = '';
    }
  }

  const hvCss = '.hv-lpr-avg{padding:2px;font-size:12px;font-weight:700}.hv-txt-red{color:#f03939}.hv-txt-green{color:#0ab844}.hv-txt-mid{color:#1d3271}';

  importCSS(hvCss);

  const REGEX_TARGET = /^https?:\/\/(alt\.)?hentaiverse\.org\/((isekai\/)?equip|r\/)/;

  function isValidKey$1(e) {
    if (e.repeat || e.ctrlKey || e.altKey || e.metaKey) return false;
    const target = e.target;
    if (!target) return false;
    const tag = target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return false;
    return true;
  }

  let popup = null;

  function renderAll() {
    if ((popup == null ? void 0 : popup.style.visibility) === 'visible') {
      renderEquip(popup);
    }
    for (const el2 of $$('.showequip')) {
      const select = el2.querySelector('select');
      renderEquip(el2, select ? select.value : null);
    }
  }

  function initHv() {
    const observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        if (m.type === 'childList') {
          for (const node of Array.from(m.addedNodes)) {
            if (!(node instanceof HTMLElement)) continue;
            if (!node.classList.contains('showequip')) continue;
            parseEquip(node);
          }
        } else if (m.type === 'attributes' && m.attributeName === 'style') {
          const target = m.target;
          if (!(target instanceof HTMLElement)) continue;
          if (target.style.visibility === 'visible') {
            parseEquip(target);
          }
        }
      }
    });
    popup = document.getElementById('popup_box');
    if (popup) observer.observe(popup, {
      attributes: true
    });
    const equipInfo = document.getElementById('equipinfo');
    if (equipInfo) observer.observe(equipInfo, {
      childList: true
    });
    for (const el2 of $$('.showequip')) {
      parseEquip(el2);
    }
    globalThis.addEventListener('hv-state-change', () => {
      renderAll();
    });
    document.addEventListener('keydown', e => {
      if (!isValidKey$1(e)) return;
      const key = e.key.toLowerCase();
      switch (key) {
       case CONFIGS.key_toggle:
        e.preventDefault();
        globalThis.dispatchEvent(new CustomEvent('hv-toggle-percent'));
        break;

       case CONFIGS.key_forge:
        e.preventDefault();
        globalThis.dispatchEvent(new CustomEvent('hv-toggle-forge'));
        break;

       case CONFIGS.key_link:
        if (!REGEX_TARGET.test(location.href)) return;
        {
          const first = $$('.showequip')[0];
          if (!first) return;
          const equip = equipMap.get(first);
          if (!equip) return;
          globalThis.prompt('Forum Link:', `[url=${location.href}]${equip.title}[/url]`);
        }
        break;
      }
    }, true);
  }

  const CACHE_PREFIX = 'HvPerc_';

  const getCache = url => sessionStorage.getItem(CACHE_PREFIX + url);

  const setCache = (url, data) => {
    const save = () => {
      sessionStorage.setItem(CACHE_PREFIX + url, data);
    };
    try {
      save();
    } catch (e) {
      console.warn('SessionStorage is full, cache failed');
      for (const k of Object.keys(sessionStorage)) {
        if (k.startsWith(CACHE_PREFIX)) {
          sessionStorage.removeItem(k);
        }
      }
      console.info('Cleared cache, retrying...');
      try {
        save();
      } catch (err) {
        console.error('Retry failed', err);
      }
    }
  };

  let curLink = null;

  const fetchData = url => GM_xmlhttpRequest({
    method: 'GET',
    url: url.replace(/^http:/, 'https:'),
    headers: {
      Origin: 'https://hentaiverse.org'
    },
    onload: res => {
      var _a;
      try {
        const doc = (new DOMParser).parseFromString(res.responseText, 'text/html');
        (_a = doc.querySelector('div[style*="border-top"] p')) == null ? void 0 : _a.remove();
        const content = doc.querySelector('.showequip, #showequip');
        if (!content) {
          renderTooltip({
            err: doc.body.textContent || ''
          }, url);
          return;
        }
        const titleDiv = content.firstElementChild;
        if (titleDiv && !titleDiv.querySelector('a')) {
          const link = el('a', {
            href: url,
            target: '_blank',
            style: 'color: inherit; text-decoration: none; cursor: pointer'
          }, []);
          link.append(...titleDiv.childNodes);
          titleDiv.replaceChildren(link);
        }
        setCache(url, content.outerHTML);
        if ((curLink == null ? void 0 : curLink.href) === url) {
          renderTooltip({
            html: content.outerHTML
          }, url);
        }
      } catch (err) {
        console.error('Failed to parse tooltip response', err);
        renderTooltip({
          err: 'Parse Error'
        }, url);
      }
    },
    onerror: () => {
      renderTooltip({
        err: 'Network Error'
      }, url);
    }
  });

  let tip = null;

  let hoverTimer = null;

  let hideTimer = null;

  let isTouch = false;

  const clearHoverTimer = () => {
    if (hoverTimer) {
      globalThis.clearTimeout(hoverTimer);
      hoverTimer = null;
    }
  };

  const cleanHideTimer = () => {
    if (hideTimer) {
      globalThis.clearTimeout(hideTimer);
      hideTimer = null;
    }
  };

  const hideTip = () => {
    if (tip) tip.style.display = 'none';
  };

  const renderTooltip = (data, _url = '') => {
    if (!tip) {
      tip = el('div', {
        style: 'display: none; z-index: 10000;',
        class: _url.includes('/isekai/') ? 'hv-tip' : 'hv-tip hv-tip-persistent',
        onmouseenter: () => {
          cleanHideTimer();
        },
        onmouseleave: () => {
          hideTimer = globalThis.setTimeout(() => {
            curLink = null;
            hideTip();
          }, 200);
        }
      });
      document.body.append(tip);
    }
    if ('err' in data) {
      tip.innerHTML = `<div class="hv-err">${data.err}</div>`;
    } else {
      tip.innerHTML = data.html;
      const eq = tip.firstElementChild;
      if (!eq) return;
      if (_url.includes('/isekai/')) {
        parseEquip(eq);
        if (globalState.isMobile) {
          const pinBtn = el('button', {
            type: 'button',
            style: 'margin-left: 5px; cursor: pointer !important; border: none; background: transparent;',
            onclick: () => {
              actionPinWindow();
            }
          }, [ '📌' ]);
          eq.append(UI_BUTTONS.PERCENT, UI_BUTTONS.FORGE, pinBtn);
        }
      }
    }
    if (!curLink) return;
    tip.style.display = 'block';
    const rect = curLink.getBoundingClientRect();
    const tRect = tip.getBoundingClientRect();
    let top;
    let left;
    if (isTouch) {
      top = rect.top - tRect.height - 20;
      left = (globalThis.innerWidth - tRect.width) / 2;
    } else {
      top = rect.top + 10;
      left = rect.right + 10;
    }
    if (left + tRect.width > globalThis.innerWidth) {
      left = rect.left - tRect.width - 10;
      if (left < 0) {
        left = 5;
      }
    }
    if (top + tRect.height > globalThis.innerHeight) {
      top = top < 0 ? rect.bottom + 10 : globalThis.innerHeight - tRect.height - 10;
    }
    tip.style.top = `${Math.max(5, top)}px`;
    tip.style.left = `${Math.max(5, left)}px`;
  };

  let zIndex = 10002;

  function isValidKey(e) {
    if (e.repeat || e.ctrlKey || e.altKey || e.metaKey) return false;
    const target = e.target;
    if (!target) return false;
    const tag = target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return false;
    return true;
  }

  function actionPinWindow() {
    var _a;
    if (!tip || tip.style.display === 'none' || !curLink) return;
    const url = curLink.href;
    if (document.querySelector(`.hv-pin-box[data-url="${url}"]`)) return;
    hideTip();
    const pinWin = el('div', {
      class: `hv-pin-box hv-tip${url.includes('/isekai/') ? '' : ' hv-tip-persistent'}`,
      dataset: {
        url: url
      },
      style: `position:fixed;\n            top: ${tip.style.top}; left: ${tip.style.left};\n            z-index:${++zIndex};`,
      onmousedown: () => {
        pinWin.style.zIndex = String(++zIndex);
      },
      ontouchstart: () => {
        pinWin.style.zIndex = String(++zIndex);
      }
    });
    const closeBtn = el('span', {
      class: 'hv-pin-close',
      style: 'cursor: pointer; font-family: monospace;',
      onclick: () => {
        pinWin.remove();
      },
      onpointerdown: e => {
        e.stopPropagation();
      }
    }, [ '[X]' ]);
    const header = el('div', {
      class: 'hv-pin-header',
      style: 'touch-action: none; user-select: none;',
      onpointerdown: e => {
        if (e.button !== 0 || !e.isPrimary) return;
        e.preventDefault();
        const target = e.currentTarget;
        target.setPointerCapture(e.pointerId);
        const startX = e.clientX;
        const startY = e.clientY;
        const {left: left, top: top} = pinWin.getBoundingClientRect();
        const onMove = ev => {
          pinWin.style.left = `${left + (ev.clientX - startX)}px`;
          pinWin.style.top = `${top + (ev.clientY - startY)}px`;
        };
        const onUp = ev => {
          target.removeEventListener('pointermove', onMove);
          target.removeEventListener('pointerup', onUp);
          target.releasePointerCapture(ev.pointerId);
        };
        target.addEventListener('pointermove', onMove);
        target.addEventListener('pointerup', onUp);
      }
    }, [ el('span', {}, [ 'Pinned' ]), closeBtn ]);
    const content = el('div', {
      class: 'hv-pin-body',
      innerHTML: (_a = getCache(url)) != null ? _a : tip.innerHTML
    }, []);
    const eq = content.firstElementChild;
    if (!eq) return;
    parseEquip(eq);
    if (globalState.isMobile) {
      content.append(UI_BUTTONS.PERCENT, UI_BUTTONS.FORGE);
    }
    pinWin.append(header, content);
    document.body.append(pinWin);
  }

  function initForums() {
    document.addEventListener('mouseover', e => {
      if (isTouch) return;
      const target = e.target;
      const link = target.closest('a');
      if (!link) return;
      if (link.closest('.hv-tip') || link.closest('.hv-pin-box') || link.closest('.hv-tip-persistent')) {
        return;
      }
      const url = link.href.replace(/^http:/, 'https:');
      if (!REGEX_TARGET.test(url)) return;
      cleanHideTimer();
      clearHoverTimer();
      hideTip();
      curLink = link;
      const cached = getCache(url);
      if (cached) {
        renderTooltip({
          html: cached
        }, url);
      } else {
        hoverTimer = globalThis.setTimeout(() => {
          fetchData(url);
        }, 200);
      }
    });
    document.addEventListener('mouseout', e => {
      if (!curLink || isTouch) return;
      const related = e.relatedTarget;
      if (related && (curLink.contains(related) || (tip == null ? void 0 : tip.contains(related)))) return;
      const link = e.target.closest('a');
      if (link === curLink) {
        clearHoverTimer();
        hideTimer = globalThis.setTimeout(() => {
          curLink = null;
          hideTip();
        }, 200);
      }
    });
    document.addEventListener('touchstart', e => {
      isTouch = true;
      const target = e.target;
      if (tip && tip.style.display !== 'none' && !tip.contains(target)) {
        hideTip();
      }
      const link = target.closest('a');
      if (!link) return;
      const url = link.href.replace(/^http:/, 'https:');
      if (!REGEX_TARGET.test(url)) return;
      curLink = link;
      if (hoverTimer) globalThis.clearTimeout(hoverTimer);
      hoverTimer = globalThis.setTimeout(() => {
        const cached = getCache(url);
        if (cached) {
          renderTooltip({
            html: cached
          }, url);
        } else {
          fetchData(url);
        }
      }, 500);
    }, {
      passive: true
    });
    document.addEventListener('touchend', clearHoverTimer);
    document.addEventListener('touchmove', clearHoverTimer);
    document.addEventListener('contextmenu', e => {
      if (isTouch) {
        const target = e.target;
        const link = target.closest('a');
        if (link && REGEX_TARGET.test(link.href.replace(/^http:/, 'https:'))) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    });
    document.addEventListener('keydown', e => {
      if (!isValidKey(e)) return;
      const key = e.key.toLowerCase();
      if (key === CONFIGS.key_pin) {
        actionPinWindow();
      } else if (key === CONFIGS.key_delete) {
        for (const w of $$('.hv-pin-box:hover')) {
          w.remove();
        }
      }
    });
  }

  initHv();

  if (!location.hostname.includes('hentaiverse.org')) {
    initForums();
  }

})();