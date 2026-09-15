/*
  ============================================================
  RESEARCH MAP — RENDERING + EDITING ENGINE
  ============================================================
  Turns a list of nodes into an interactive, left-to-right research
  lineage tree: automatic layout, curved animated connectors,
  click-to-focus branches, a detail popover, zoom controls, and a
  built-in visual editor (add / edit / delete nodes & links).

  Data source:
    1. If the visitor has local edits saved (localStorage), those
       are used.
    2. Otherwise the built-in window.RESEARCH_MAP_DATA (see
       research-map.data.js) is used.

  Edits made through the UI (Edit Mode) are saved to localStorage
  on that browser only. Use the "Export" button to get an updated
  data array to paste into research-map.data.js and publish for
  everyone.
  ============================================================
*/
(function () {
  'use strict';

  var STORAGE_KEY = 'rm-research-map-data-v2';
  var DEFAULT_DATA = window.RESEARCH_MAP_DATA || [];

  // Layout constants (px). Keep NODE_W in sync with the inline
  // width set on .rm-node in renderNodes().
  var NODE_W = 216;
  var NODE_H = 78;
  var COL_GAP = 108;
  var ROW_H = 96;
  var PAD = 48;

  var TYPE_ICON = {
    root: 'fa-solid fa-atom',
    field: 'fa-solid fa-diagram-project',
    topic: 'fa-solid fa-layer-group',
    idea: 'fa-solid fa-lightbulb',
    paper: 'fa-solid fa-file-lines',
    repo: 'fa-brands fa-github',
    milestone: 'fa-solid fa-flag'
  };

  var TYPE_LABEL = {
    root: 'Root',
    field: 'Domain',
    topic: 'Topic',
    idea: 'Idea',
    paper: 'Paper',
    repo: 'Repo',
    milestone: 'Milestone'
  };

  // Types a person can pick when adding/editing a non-root node.
  var EDITABLE_TYPES = ['field', 'topic', 'idea', 'paper', 'repo', 'milestone'];

  function escapeHtml(s) {
    if (s === undefined || s === null) return '';
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function inferIcon(label) {
    var s = (label || '').toLowerCase();
    if (s.indexOf('pdf') !== -1) return 'far fa-file-pdf';
    if (s.indexOf('code') !== -1 || s.indexOf('github') !== -1 || s.indexOf('repo') !== -1) return 'fab fa-github';
    return 'fas fa-arrow-up-right-from-square';
  }

  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

  function slugify(s) {
    var out = String(s || 'node').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-+|-+$)/g, '');
    return out || 'node';
  }

  function uniqueId(base, data) {
    var existing = {};
    data.forEach(function (n) { existing[n.id] = true; });
    if (!existing[base]) return base;
    var i = 2, id = base + '-' + i;
    while (existing[id]) { i++; id = base + '-' + i; }
    return id;
  }

  function loadData() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e) { /* ignore */ }
    return clone(DEFAULT_DATA);
  }

  function persist(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }

  // -------- Tree building / layout (pure functions of `data`) --------

  function buildTree(data) {
    var map = {};
    var nodes = data.map(function (n) {
      var copy = {};
      for (var k in n) { if (Object.prototype.hasOwnProperty.call(n, k)) copy[k] = n[k]; }
      copy.children = [];
      return copy;
    });
    nodes.forEach(function (n) { map[n.id] = n; });

    var roots = [];
    nodes.forEach(function (n) {
      if (n.parent && map[n.parent]) map[n.parent].children.push(n);
      else roots.push(n);
    });

    function setDepth(n, d) {
      n.depth = d;
      n.children.forEach(function (c) { setDepth(c, d + 1); });
    }
    roots.forEach(function (r) { setDepth(r, 0); });

    var leafIndex = 0;
    function assignSlot(n) {
      if (!n.children.length) { n.slot = leafIndex; leafIndex += 1; return n.slot; }
      n.children.forEach(assignSlot);
      var first = n.children[0].slot;
      var last = n.children[n.children.length - 1].slot;
      n.slot = (first + last) / 2;
      return n.slot;
    }
    roots.forEach(assignSlot);

    var maxDepth = 0;
    nodes.forEach(function (n) { if (n.depth > maxDepth) maxDepth = n.depth; });

    return { nodes: nodes, map: map, roots: roots, maxDepth: maxDepth, leafCount: leafIndex || 1 };
  }

  function computeCoords(tree) {
    tree.nodes.forEach(function (n) {
      n.cx = PAD + n.depth * (NODE_W + COL_GAP) + NODE_W / 2;
      n.cy = PAD + n.slot * ROW_H + ROW_H / 2;
    });
    return {
      width: PAD * 2 + (tree.maxDepth + 1) * NODE_W + tree.maxDepth * COL_GAP,
      height: PAD * 2 + tree.leafCount * ROW_H
    };
  }

  function collectFamily(node, map) {
    var family = {};
    family[node.id] = true;
    var cur = node;
    while (cur.parent && map[cur.parent]) { family[cur.parent] = true; cur = map[cur.parent]; }
    (function walkDown(n) { n.children.forEach(function (c) { family[c.id] = true; walkDown(c); }); })(node);
    return family;
  }

  function collectDescendantIds(node) {
    var ids = {};
    (function walk(n) { n.children.forEach(function (c) { ids[c.id] = true; walk(c); }); })(node);
    return ids;
  }

  // -------- Main --------

  function init() {
    var wrap = document.getElementById('rm-wrap');
    if (!wrap) return;

    var scrollEl = document.getElementById('rm-scroll');
    var outer = document.getElementById('rm-canvas-outer');
    var canvas = document.getElementById('rm-canvas');
    var svg = document.getElementById('rm-edges');
    var nodesLayer = document.getElementById('rm-nodes');
    var popover = document.getElementById('rm-popover');
    var modalRoot = document.getElementById('rm-modal-root');
    if (!scrollEl || !outer || !canvas || !svg || !nodesLayer || !popover || !modalRoot) return;

    var data = loadData();
    var tree = null, size = { width: 0, height: 0 }, zoom = 1, focusedId = null, firstRender = true;

    // ---------------- render ----------------

    function applyZoom() {
      canvas.style.transform = 'scale(' + zoom + ')';
      outer.style.width = (size.width * zoom) + 'px';
      outer.style.height = (size.height * zoom) + 'px';
    }

    function renderEdges() {
      var defsHtml = [];
      var pathsHtml = [];
      tree.nodes.forEach(function (n) {
        if (!n.parent || !tree.map[n.parent]) return;
        var p = tree.map[n.parent];
        var x1 = p.cx + NODE_W / 2, y1 = p.cy;
        var x2 = n.cx - NODE_W / 2, y2 = n.cy;
        var dx = Math.max(30, (x2 - x1) * 0.5);
        var d = 'M ' + x1 + ' ' + y1 + ' C ' + (x1 + dx) + ' ' + y1 + ', ' + (x2 - dx) + ' ' + y2 + ', ' + x2 + ' ' + y2;
        var gid = 'rmg-' + n.id;
        defsHtml.push(
          '<linearGradient id="' + gid + '" gradientUnits="userSpaceOnUse" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' +
          '<stop offset="0%" style="stop-color: var(--rm-' + p.type + ')"></stop>' +
          '<stop offset="100%" style="stop-color: var(--rm-' + n.type + ')"></stop>' +
          '</linearGradient>'
        );
        pathsHtml.push('<path class="rm-edge" data-target="' + n.id + '" d="' + d + '" stroke="url(#' + gid + ')"></path>');
      });
      svg.innerHTML = '<defs>' + defsHtml.join('') + '</defs>' + pathsHtml.join('');
    }

    function renderNodes() {
      var editing = wrap.classList.contains('rm-editing');
      var nodesHtml = tree.nodes.map(function (n) {
        var icon = TYPE_ICON[n.type] || 'fa-solid fa-circle';
        var secondLine = n.venue
          ? '<span class="rm-node-venue">' + escapeHtml(n.venue) + '</span>'
          : (n.subtitle ? '<span class="rm-node-sub">' + escapeHtml(n.subtitle) + '</span>' : '');
        var tag = n.status === 'current' ? '<span class="program-tag rm-current-tag">Current</span>' : '';
        var actions = '';
        if (editing) {
          actions = '<span class="rm-node-actions" draggable="false">' +
            '<button type="button" class="rm-node-act" data-act="add" title="Add child node"><i class="fas fa-plus" aria-hidden="true"></i></button>' +
            '<button type="button" class="rm-node-act" data-act="edit" title="Edit"><i class="fas fa-pen" aria-hidden="true"></i></button>' +
            (n.type !== 'root' ? '<button type="button" class="rm-node-act rm-node-act-danger" data-act="delete" title="Delete"><i class="fas fa-trash" aria-hidden="true"></i></button>' : '') +
            '</span>';
        }
        var draggableAttr = (editing && n.type !== 'root') ? ' draggable="true"' : '';
        return (
          '<div class="rm-node" data-id="' + n.id + '" data-type="' + n.type + '" tabindex="0" role="button"' + draggableAttr + ' ' +
          'aria-label="' + escapeHtml(n.title) + '" ' +
          'style="left:' + (n.cx - NODE_W / 2) + 'px; top:' + (n.cy - NODE_H / 2) + 'px; width:' + NODE_W + 'px;">' +
          actions +
          '<span class="rm-node-icon"><i class="' + icon + '" aria-hidden="true"></i></span>' +
          '<span class="rm-node-body"><span class="rm-node-title">' + escapeHtml(n.title) + '</span>' + secondLine + '</span>' +
          tag +
          '</div>'
        );
      }).join('');
      nodesLayer.innerHTML = nodesHtml;
    }

    function render(opts) {
      opts = opts || {};
      tree = buildTree(data);
      size = computeCoords(tree);

      canvas.style.width = size.width + 'px';
      canvas.style.height = size.height + 'px';
      svg.setAttribute('width', size.width);
      svg.setAttribute('height', size.height);
      svg.setAttribute('viewBox', '0 0 ' + size.width + ' ' + size.height);

      applyZoom();
      renderEdges();
      renderNodes();

      focusedId = null;
      popover.classList.remove('rm-open');

      if ((firstRender || opts.recenter) && tree.roots.length) {
        var rootNode = tree.roots[0];
        var desiredTop = rootNode.cy * zoom - scrollEl.clientHeight / 2;
        var maxTop = Math.max(0, size.height * zoom - scrollEl.clientHeight);
        scrollEl.scrollTop = Math.max(0, Math.min(desiredTop, maxTop));
        scrollEl.scrollLeft = 0;
        firstRender = false;
      }

      if (opts.focusId && tree.map[opts.focusId]) {
        scrollNodeIntoView(tree.map[opts.focusId]);
      }
    }

    function scrollNodeIntoView(n) {
      var cx = n.cx * zoom, cy = n.cy * zoom;
      var targetLeft = cx - scrollEl.clientWidth / 2;
      var targetTop = cy - scrollEl.clientHeight / 2;
      scrollEl.scrollLeft = Math.max(0, Math.min(targetLeft, size.width * zoom - scrollEl.clientWidth));
      scrollEl.scrollTop = Math.max(0, Math.min(targetTop, size.height * zoom - scrollEl.clientHeight));
    }

    render();

    // ---------------- focus + popover ----------------

    function clearFocus() {
      focusedId = null;
      var els = nodesLayer.querySelectorAll('.rm-node');
      for (var i = 0; i < els.length; i++) els[i].classList.remove('rm-dim', 'rm-active');
      var edges = svg.querySelectorAll('.rm-edge');
      for (var j = 0; j < edges.length; j++) edges[j].classList.remove('rm-dim', 'rm-edge-highlight');
      popover.classList.remove('rm-open');
    }

    function openPopover(n) {
      var linksHtml = (n.links || []).map(function (l) {
        var icon = l.icon || inferIcon(l.label);
        return (
          '<a href="' + escapeHtml(l.url) + '" target="_blank" rel="noopener">' +
          '<i class="' + icon + '" aria-hidden="true"></i> ' + escapeHtml(l.label) + '</a>'
        );
      }).join('');

      var metaParts = [];
      if (n.venue) metaParts.push(n.venue);
      if (n.date) metaParts.push(n.date);

      popover.innerHTML =
        '<button type="button" class="rm-popover-close" aria-label="Close">&times;</button>' +
        '<div class="rm-popover-type" data-type="' + n.type + '">' + escapeHtml(TYPE_LABEL[n.type] || n.type) + '</div>' +
        '<h4>' + escapeHtml(n.title) + '</h4>' +
        (n.subtitle ? '<div class="rm-popover-sub">' + escapeHtml(n.subtitle) + '</div>' : '') +
        (metaParts.length ? '<div class="rm-popover-meta">' + metaParts.map(escapeHtml).join(' &middot; ') + '</div>' : '') +
        (n.desc ? '<p>' + escapeHtml(n.desc) + '</p>' : '') +
        (linksHtml ? '<div class="rm-popover-links">' + linksHtml + '</div>' : '');

      var popW = 260;
      var left = n.cx + NODE_W / 2 + 18;
      if (left + popW + 10 > size.width) left = n.cx - NODE_W / 2 - popW - 18;
      if (left < 0) left = Math.max(4, n.cx - popW / 2);
      var top = Math.max(6, n.cy - 70);

      popover.style.left = left + 'px';
      popover.style.top = top + 'px';
      popover.classList.add('rm-open');
    }

    function focusNode(n) {
      if (focusedId === n.id) { clearFocus(); return; }
      focusedId = n.id;
      var family = collectFamily(n, tree.map);

      var els = nodesLayer.querySelectorAll('.rm-node');
      for (var i = 0; i < els.length; i++) {
        var id = els[i].getAttribute('data-id');
        els[i].classList.toggle('rm-dim', !family[id]);
        els[i].classList.toggle('rm-active', id === n.id);
      }
      var edges = svg.querySelectorAll('.rm-edge');
      for (var j = 0; j < edges.length; j++) {
        var target = edges[j].getAttribute('data-target');
        edges[j].classList.toggle('rm-dim', !family[target]);
        edges[j].classList.toggle('rm-edge-highlight', !!family[target]);
      }
      openPopover(n);
    }

    nodesLayer.addEventListener('click', function (e) {
      var actBtn = e.target.closest ? e.target.closest('.rm-node-act') : null;
      var nodeEl = e.target.closest ? e.target.closest('.rm-node') : null;
      if (!nodeEl) return;
      var n = tree.map[nodeEl.getAttribute('data-id')];
      if (!n) return;

      if (actBtn) {
        e.stopPropagation();
        var act = actBtn.getAttribute('data-act');
        if (act === 'edit') openEditModal(n);
        else if (act === 'add') openAddModal(n.id);
        else if (act === 'delete') handleDelete(n);
        return;
      }
      focusNode(n);
    });

    nodesLayer.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var el = e.target.closest ? e.target.closest('.rm-node') : null;
      if (!el) return;
      e.preventDefault();
      var n = tree.map[el.getAttribute('data-id')];
      if (n) focusNode(n);
    });

    scrollEl.addEventListener('click', function (e) {
      if (e.target === scrollEl || e.target === outer || e.target === canvas || e.target === nodesLayer) clearFocus();
    });

    popover.addEventListener('click', function (e) {
      if (e.target.classList && e.target.classList.contains('rm-popover-close')) clearFocus();
    });

    // ---------------- drag & drop re-parenting (edit mode) ----------------

    var draggedId = null;
    var dropTargetEl = null;

    function clearDropIndicators() {
      var marked = nodesLayer.querySelectorAll('.rm-drop-child, .rm-drop-before, .rm-drop-after');
      for (var i = 0; i < marked.length; i++) {
        marked[i].classList.remove('rm-drop-child', 'rm-drop-before', 'rm-drop-after');
      }
    }

    function dropZoneFor(targetEl, clientY) {
      var targetId = targetEl.getAttribute('data-id');
      var targetNode = tree.map[targetId];
      if (!targetNode) return null;
      if (targetNode.type === 'root') return 'child';
      var rect = targetEl.getBoundingClientRect();
      var rel = rect.height ? (clientY - rect.top) / rect.height : 0.5;
      if (rel < 0.25) return 'before';
      if (rel > 0.75) return 'after';
      return 'child';
    }

    function isValidTarget(targetId) {
      if (!draggedId || !targetId) return false;
      if (targetId === draggedId) return false;
      var draggedNode = tree.map[draggedId];
      if (!draggedNode) return false;
      var descIds = collectDescendantIds(draggedNode);
      if (descIds[targetId]) return false; // can't drop into your own descendant
      return true;
    }

    nodesLayer.addEventListener('dragstart', function (e) {
      var el = e.target.closest ? e.target.closest('.rm-node[draggable="true"]') : null;
      if (!el) { e.preventDefault(); return; }
      draggedId = el.getAttribute('data-id');
      el.classList.add('rm-dragging');
      try {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', draggedId);
      } catch (err) { /* ignore */ }
    });

    nodesLayer.addEventListener('dragover', function (e) {
      if (!draggedId) return;
      var el = e.target.closest ? e.target.closest('.rm-node') : null;
      if (!el || !isValidTarget(el.getAttribute('data-id'))) {
        if (dropTargetEl) { clearDropIndicators(); dropTargetEl = null; }
        return;
      }
      e.preventDefault();
      try { e.dataTransfer.dropEffect = 'move'; } catch (err) { /* ignore */ }
      var zone = dropZoneFor(el, e.clientY);
      if (dropTargetEl !== el) { clearDropIndicators(); dropTargetEl = el; }
      else { el.classList.remove('rm-drop-child', 'rm-drop-before', 'rm-drop-after'); }
      el.classList.add('rm-drop-' + zone);
    });

    nodesLayer.addEventListener('dragleave', function (e) {
      var el = e.target.closest ? e.target.closest('.rm-node') : null;
      if (el && el === dropTargetEl && e.target === el) {
        // only clear if we're truly leaving this node (not entering a child of it)
        if (!el.contains(e.relatedTarget)) { clearDropIndicators(); dropTargetEl = null; }
      }
    });

    nodesLayer.addEventListener('drop', function (e) {
      var el = e.target.closest ? e.target.closest('.rm-node') : null;
      var draggedNodeId = draggedId;
      clearDropIndicators();
      dropTargetEl = null;
      if (!el || !draggedNodeId || !isValidTarget(el.getAttribute('data-id'))) return;
      e.preventDefault();
      var targetId = el.getAttribute('data-id');
      var zone = dropZoneFor(el, e.clientY);
      moveNode(draggedNodeId, targetId, zone);
    });

    nodesLayer.addEventListener('dragend', function () {
      var el = nodesLayer.querySelector('.rm-dragging');
      if (el) el.classList.remove('rm-dragging');
      clearDropIndicators();
      draggedId = null;
      dropTargetEl = null;
    });

    function moveNode(nodeId, targetId, zone) {
      var draggedIdx = -1;
      for (var i = 0; i < data.length; i++) { if (data[i].id === nodeId) { draggedIdx = i; break; } }
      if (draggedIdx === -1) return;
      var draggedObj = data[draggedIdx];
      data.splice(draggedIdx, 1);

      if (zone === 'child') {
        draggedObj.parent = targetId;
        data.push(draggedObj);
      } else {
        var targetIdx = -1;
        for (var j = 0; j < data.length; j++) { if (data[j].id === targetId) { targetIdx = j; break; } }
        if (targetIdx === -1) { data.splice(draggedIdx, 0, draggedObj); return; }
        var targetObj = data[targetIdx];
        draggedObj.parent = targetObj.parent;
        var insertAt = zone === 'before' ? targetIdx : targetIdx + 1;
        data.splice(insertAt, 0, draggedObj);
      }

      persist(data);
      render({ focusId: draggedObj.id });
    }

    // ---------------- zoom ----------------

    var zoomButtons = wrap.querySelectorAll('[data-rm-zoom]');
    for (var z = 0; z < zoomButtons.length; z++) {
      zoomButtons[z].addEventListener('click', function () {
        var action = this.getAttribute('data-rm-zoom');
        if (action === 'in') zoom = Math.min(1.4, Math.round((zoom + 0.1) * 10) / 10);
        else if (action === 'out') zoom = Math.max(0.5, Math.round((zoom - 0.1) * 10) / 10);
        else zoom = 1;
        clearFocus();
        applyZoom();
      });
    }

    // ---------------- edit mode ----------------

    var hintEl = document.getElementById('rm-hint');
    var HINT_VIEW = '<i class="fas fa-arrows-left-right" aria-hidden="true"></i> Scroll to explore &middot; click a node to trace its branch &middot; click <i class="fas fa-pen" aria-hidden="true"></i> to edit this map yourself';
    var HINT_EDIT = '<i class="fas fa-hand" aria-hidden="true"></i> Drag a card onto another to nest it as a child &middot; drop on its top/bottom edge to reorder &middot; use <i class="fas fa-plus" aria-hidden="true"></i>/<i class="fas fa-pen" aria-hidden="true"></i>/<i class="fas fa-trash" aria-hidden="true"></i> on each card';

    var editToggleBtn = wrap.querySelector('[data-rm-action="toggle-edit"]');
    if (editToggleBtn) {
      editToggleBtn.addEventListener('click', function () {
        wrap.classList.toggle('rm-editing');
        var isEditing = wrap.classList.contains('rm-editing');
        editToggleBtn.classList.toggle('rm-btn-active', isEditing);
        if (hintEl) hintEl.innerHTML = isEditing ? HINT_EDIT : HINT_VIEW;
        clearFocus();
        renderNodes();
      });
    }

    var addBtn = wrap.querySelector('[data-rm-action="add-node"]');
    if (addBtn) addBtn.addEventListener('click', function () { openAddModal('root'); });

    var exportBtn = wrap.querySelector('[data-rm-action="export"]');
    if (exportBtn) exportBtn.addEventListener('click', openExportModal);

    var importBtn = wrap.querySelector('[data-rm-action="import"]');
    if (importBtn) importBtn.addEventListener('click', openImportModal);

    var resetBtn = wrap.querySelector('[data-rm-action="reset"]');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (!confirm('Reset the research map to the built-in default? Your local edits will be lost.')) return;
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
        data = clone(DEFAULT_DATA);
        render({ recenter: true });
      });
    }

    // ---------------- modal: add / edit node ----------------

    function closeModal() {
      modalRoot.innerHTML = '';
      modalRoot.classList.remove('rm-modal-open');
    }

    function nodeOptionsHtml(excludeIds, selectedId) {
      var out = [];
      (function walk(n, depth) {
        if (!excludeIds[n.id]) {
          out.push(
            '<option value="' + n.id + '"' + (n.id === selectedId ? ' selected' : '') + '>' +
            new Array(depth + 1).join('\u2014\u2009') + escapeHtml(n.title) +
            '</option>'
          );
        }
        n.children.forEach(function (c) { walk(c, depth + 1); });
      })(tree.roots[0], 0);
      return out.join('');
    }

    function openAddModal(parentId) { renderNodeForm(null, parentId); }
    function openEditModal(n) { renderNodeForm(n, n.parent); }

    function wireModalChrome(overlayId, onCancel) {
      var overlay = document.getElementById(overlayId);
      overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
      var closeBtn = overlay.querySelector('.rm-modal-close');
      if (closeBtn) closeBtn.addEventListener('click', closeModal);
      var cancelBtn = overlay.querySelector('[data-rm-modal-cancel]');
      if (cancelBtn) cancelBtn.addEventListener('click', onCancel || closeModal);
    }

    function renderNodeForm(existing, defaultParentId) {
      var isRoot = !!(existing && existing.type === 'root');
      var isNew = !existing;
      var excludeIds = {};
      if (existing) {
        excludeIds[existing.id] = true;
        var descIds = collectDescendantIds(tree.map[existing.id]);
        for (var k in descIds) excludeIds[k] = true;
      }
      var linksArr = (existing && existing.links) ? existing.links.slice() : [];

      function linkRowHtml(l) {
        return '<div class="rm-link-row">' +
          '<input type="text" class="rm-link-label" placeholder="Label (e.g. PDF)" value="' + escapeHtml(l ? l.label : '') + '">' +
          '<input type="url" class="rm-link-url" placeholder="https://..." value="' + escapeHtml(l ? l.url : '') + '">' +
          '<button type="button" class="rm-link-remove" aria-label="Remove link"><i class="fas fa-xmark" aria-hidden="true"></i></button>' +
          '</div>';
      }

      var typeOptions = EDITABLE_TYPES.map(function (t) {
        return '<option value="' + t + '"' + (existing && existing.type === t ? ' selected' : '') + '>' + TYPE_LABEL[t] + '</option>';
      }).join('');

      var html = '' +
        '<div class="rm-modal-overlay" id="rm-modal-overlay">' +
        '<div class="rm-modal" role="dialog" aria-modal="true" aria-label="' + (isNew ? 'Add node' : 'Edit node') + '">' +
        '<div class="rm-modal-head"><h3>' + (isRoot ? 'Edit Root' : (isNew ? 'Add Node' : 'Edit Node')) + '</h3>' +
        '<button type="button" class="rm-modal-close" aria-label="Close"><i class="fas fa-xmark" aria-hidden="true"></i></button></div>' +
        '<div class="rm-modal-body">' +
        '<label class="rm-field"><span>Title *</span><input type="text" id="rm-f-title" value="' + escapeHtml(existing ? existing.title : '') + '"></label>' +
        (isRoot ? '' :
          '<div class="rm-field-row">' +
          '<label class="rm-field"><span>Type *</span><select id="rm-f-type">' + typeOptions + '</select></label>' +
          '<label class="rm-field"><span>Parent *</span><select id="rm-f-parent">' + nodeOptionsHtml(excludeIds, defaultParentId) + '</select></label>' +
          '</div>'
        ) +
        '<div class="rm-field-row">' +
        '<label class="rm-field"><span>Subtitle</span><input type="text" id="rm-f-subtitle" value="' + escapeHtml(existing ? existing.subtitle : '') + '"></label>' +
        (isRoot ? '' : '<label class="rm-field"><span>Venue</span><input type="text" id="rm-f-venue" value="' + escapeHtml(existing ? existing.venue : '') + '"></label>') +
        '</div>' +
        (isRoot ? '' :
          '<div class="rm-field-row">' +
          '<label class="rm-field"><span>Date</span><input type="text" id="rm-f-date" placeholder="e.g. 2026 or Sep 2024" value="' + escapeHtml(existing ? existing.date : '') + '"></label>' +
          '<label class="rm-field rm-field-checkbox"><input type="checkbox" id="rm-f-current"' + (existing && existing.status === 'current' ? ' checked' : '') + '> <span>Mark as Current</span></label>' +
          '</div>'
        ) +
        '<label class="rm-field"><span>Description</span><textarea id="rm-f-desc" rows="3">' + escapeHtml(existing ? existing.desc : '') + '</textarea></label>' +
        (isRoot ? '' :
          '<div class="rm-field">' +
          '<span>Links</span>' +
          '<div class="rm-link-rows" id="rm-link-rows">' + linksArr.map(linkRowHtml).join('') + '</div>' +
          '<button type="button" class="rm-btn-text" id="rm-add-link"><i class="fas fa-plus" aria-hidden="true"></i> Add link</button>' +
          '</div>'
        ) +
        '</div>' +
        '<div class="rm-modal-foot">' +
        (existing && !isRoot ? '<button type="button" class="rm-btn-danger" id="rm-f-delete"><i class="fas fa-trash" aria-hidden="true"></i> Delete</button>' : '<span></span>') +
        '<div class="rm-modal-foot-right">' +
        '<button type="button" class="rm-btn-ghost" data-rm-modal-cancel>Cancel</button>' +
        '<button type="button" class="rm-btn-primary" id="rm-f-save">Save</button>' +
        '</div></div>' +
        '</div></div>';

      modalRoot.innerHTML = html;
      modalRoot.classList.add('rm-modal-open');
      wireModalChrome('rm-modal-overlay');

      var linkRowsEl = document.getElementById('rm-link-rows');
      function attachLinkRemove() {
        if (!linkRowsEl) return;
        var btns = linkRowsEl.querySelectorAll('.rm-link-remove');
        for (var i = 0; i < btns.length; i++) {
          btns[i].onclick = function () {
            var row = this.closest('.rm-link-row');
            if (row) row.remove();
          };
        }
      }
      attachLinkRemove();

      var addLinkBtn = document.getElementById('rm-add-link');
      if (addLinkBtn) {
        addLinkBtn.addEventListener('click', function () {
          var wrapper = document.createElement('div');
          wrapper.innerHTML = linkRowHtml(null);
          linkRowsEl.appendChild(wrapper.firstChild);
          attachLinkRemove();
        });
      }

      var deleteBtn = document.getElementById('rm-f-delete');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', function () {
          closeModal();
          handleDelete(existing);
        });
      }

      document.getElementById('rm-f-save').addEventListener('click', function () {
        var title = document.getElementById('rm-f-title').value.trim();
        if (!title) { alert('Please enter a title.'); return; }

        if (isRoot) {
          var rootTarget = data.filter(function (d) { return d.id === existing.id; })[0];
          rootTarget.title = title;
          var rSub = document.getElementById('rm-f-subtitle').value.trim();
          var rDesc = document.getElementById('rm-f-desc').value.trim();
          if (rSub) rootTarget.subtitle = rSub; else delete rootTarget.subtitle;
          if (rDesc) rootTarget.desc = rDesc; else delete rootTarget.desc;
        } else {
          var type = document.getElementById('rm-f-type').value;
          var parent = document.getElementById('rm-f-parent').value;
          if (!parent) { alert('Please choose a parent.'); return; }
          var subtitle = document.getElementById('rm-f-subtitle').value.trim();
          var venue = document.getElementById('rm-f-venue').value.trim();
          var date = document.getElementById('rm-f-date').value.trim();
          var current = document.getElementById('rm-f-current').checked;
          var desc = document.getElementById('rm-f-desc').value.trim();
          var links = [];
          if (linkRowsEl) {
            var rows = linkRowsEl.querySelectorAll('.rm-link-row');
            for (var ri = 0; ri < rows.length; ri++) {
              var label = rows[ri].querySelector('.rm-link-label').value.trim();
              var url = rows[ri].querySelector('.rm-link-url').value.trim();
              if (label && url) links.push({ label: label, url: url });
            }
          }

          var target;
          if (existing) {
            target = data.filter(function (d) { return d.id === existing.id; })[0];
          } else {
            var id = uniqueId(slugify(type + '-' + title), data);
            target = { id: id };
            data.push(target);
          }
          target.type = type;
          target.parent = parent;
          target.title = title;
          if (subtitle) target.subtitle = subtitle; else delete target.subtitle;
          if (venue) target.venue = venue; else delete target.venue;
          if (date) target.date = date; else delete target.date;
          if (current) target.status = 'current'; else delete target.status;
          if (desc) target.desc = desc; else delete target.desc;
          if (links.length) target.links = links; else delete target.links;
        }

        persist(data);
        var focusId = existing ? existing.id : (target ? target.id : null);
        closeModal();
        render({ focusId: focusId });
      });
    }

    function handleDelete(n) {
      if (!n || n.type === 'root') return;
      var treeNode = tree.map[n.id];
      var descIds = treeNode ? collectDescendantIds(treeNode) : {};
      var count = Object.keys(descIds).length;
      var msg = count
        ? 'Delete "' + n.title + '" and its ' + count + ' descendant node(s)? This cannot be undone.'
        : 'Delete "' + n.title + '"? This cannot be undone.';
      if (!confirm(msg)) return;
      var removeIds = descIds;
      removeIds[n.id] = true;
      data = data.filter(function (item) { return !removeIds[item.id]; });
      persist(data);
      closeModal();
      render();
    }

    // ---------------- modal: export / import ----------------

    function openExportModal() {
      var jsonText = 'window.RESEARCH_MAP_DATA = ' + JSON.stringify(data, null, 2) + ';\n';
      var html = '' +
        '<div class="rm-modal-overlay" id="rm-modal-overlay">' +
        '<div class="rm-modal rm-modal-wide" role="dialog" aria-modal="true" aria-label="Export research map">' +
        '<div class="rm-modal-head"><h3>Export</h3><button type="button" class="rm-modal-close" aria-label="Close"><i class="fas fa-xmark" aria-hidden="true"></i></button></div>' +
        '<div class="rm-modal-body">' +
        '<p class="rm-modal-hint">Your edits are saved in this browser only. Copy the text below and paste it into <code>research-map.data.js</code> (replacing the array) to publish it for every visitor.</p>' +
        '<textarea id="rm-export-text" class="rm-code-area" rows="14" readonly>' + escapeHtml(jsonText) + '</textarea>' +
        '</div>' +
        '<div class="rm-modal-foot"><span></span><div class="rm-modal-foot-right">' +
        '<button type="button" class="rm-btn-ghost" data-rm-modal-cancel>Close</button>' +
        '<button type="button" class="rm-btn-primary" id="rm-copy-export"><i class="fas fa-copy" aria-hidden="true"></i> Copy</button>' +
        '</div></div></div></div>';
      modalRoot.innerHTML = html;
      modalRoot.classList.add('rm-modal-open');
      wireModalChrome('rm-modal-overlay');

      document.getElementById('rm-copy-export').addEventListener('click', function () {
        var ta = document.getElementById('rm-export-text');
        ta.select();
        var ok = false;
        try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(ta.value); ok = true; } } catch (e) { /* ignore */ }
        if (!ok) { try { ok = document.execCommand('copy'); } catch (e2) { /* ignore */ } }
        var btn = document.getElementById('rm-copy-export');
        btn.innerHTML = ok ? '<i class="fas fa-check" aria-hidden="true"></i> Copied' : '<i class="fas fa-copy" aria-hidden="true"></i> Copy';
      });
    }

    function openImportModal() {
      var html = '' +
        '<div class="rm-modal-overlay" id="rm-modal-overlay">' +
        '<div class="rm-modal rm-modal-wide" role="dialog" aria-modal="true" aria-label="Import research map">' +
        '<div class="rm-modal-head"><h3>Import</h3><button type="button" class="rm-modal-close" aria-label="Close"><i class="fas fa-xmark" aria-hidden="true"></i></button></div>' +
        '<div class="rm-modal-body">' +
        '<p class="rm-modal-hint">Paste a node array (as produced by Export) to replace the current map in this browser.</p>' +
        '<textarea id="rm-import-text" class="rm-code-area" rows="14" placeholder=\'[ { "id": "root", "parent": null, "type": "root", "title": "..." } ]\'></textarea>' +
        '<p class="rm-modal-error" id="rm-import-error"></p>' +
        '</div>' +
        '<div class="rm-modal-foot"><span></span><div class="rm-modal-foot-right">' +
        '<button type="button" class="rm-btn-ghost" data-rm-modal-cancel>Cancel</button>' +
        '<button type="button" class="rm-btn-primary" id="rm-import-apply">Load</button>' +
        '</div></div></div></div>';
      modalRoot.innerHTML = html;
      modalRoot.classList.add('rm-modal-open');
      wireModalChrome('rm-modal-overlay');

      document.getElementById('rm-import-apply').addEventListener('click', function () {
        var text = document.getElementById('rm-import-text').value;
        var match = text.match(/\[[\s\S]*\]/);
        var jsonStr = match ? match[0] : text;
        try {
          var parsed = JSON.parse(jsonStr);
          if (!Array.isArray(parsed) || !parsed.length) throw new Error('empty');
          data = parsed;
          persist(data);
          closeModal();
          render({ recenter: true });
        } catch (e) {
          document.getElementById('rm-import-error').textContent = 'Could not parse that as a node array. Please check the format.';
        }
      });
    }

    // ---------------- global keys ----------------

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (modalRoot.classList.contains('rm-modal-open')) { closeModal(); return; }
      clearFocus();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
