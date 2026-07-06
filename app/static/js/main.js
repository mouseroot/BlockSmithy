(function () {
  'use strict';

  let currentCanvasId = null;
  let blocks = [];
  let saveTimer = null;

  const blockList = document.getElementById('block-list');
  const canvasName = document.getElementById('canvas-name');
  const canvasSelect = document.getElementById('canvas-select');
  const saveIndicator = document.getElementById('save-indicator');

  const newSnippetBtn = document.getElementById('new-snippet-btn');
  const snippetModal = document.getElementById('snippet-modal');
  const snippetModalTitle = document.getElementById('snippet-modal-title');
  const snippetModalContent = document.getElementById('snippet-modal-content');
  const snippetModalSave = document.getElementById('snippet-modal-save');
  const snippetModalCancel = document.getElementById('snippet-modal-cancel');

  const blockModal = document.getElementById('block-modal');
  const blockModalContent = document.getElementById('block-modal-content');
  const blockModalSave = document.getElementById('block-modal-save');
  const blockModalCancel = document.getElementById('block-modal-cancel');
  const blockModalDelete = document.getElementById('block-modal-delete');

  const copyBtn = document.getElementById('copy-btn');
  const exportTxtBtn = document.getElementById('export-txt-btn');
  const exportMdBtn = document.getElementById('export-md-btn');
  const newCanvasBtn = document.getElementById('new-canvas-btn');
  const deleteCanvasBtn = document.getElementById('delete-canvas-btn');

  let editingBlockIndex = null;

  Sortable.create(blockList, {
    animation: 150,
    handle: '.block-drag-handle',
    onEnd: function () {
      rebuildBlocksFromDOM();
      markDirty();
    }
  });

  function rebuildBlocksFromDOM() {
    const items = blockList.querySelectorAll('.prompt-block');
    blocks = [];
    items.forEach(function (el) {
      blocks.push({ content: el.dataset.content || '' });
    });
  }

  function renderBlocks() {
    if (blocks.length === 0) {
      blockList.innerHTML = '<div class="text-center text-gray-400 py-12 text-sm">Drag snippets here or click <strong>+ New</strong> to add a block.</div>';
      return;
    }
    blockList.innerHTML = blocks.map(function (b, i) {
      return '<div class="prompt-block bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer" data-content="' + escapeHtml(b.content) + '" data-index="' + i + '">' +
        '<div class="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-lg">' +
        '<span class="block-drag-handle cursor-grab text-gray-400 hover:text-gray-600">⠿</span>' +
        '<span class="text-xs font-mono text-gray-400">#' + (i + 1) + '</span>' +
        '<span class="text-xs text-gray-300 mx-1">|</span>' +
        '<span class="text-xs text-gray-500 truncate flex-1">' + (b.content ? b.content.substring(0, 60) : '<em class="text-gray-300">empty block</em>') + '</span>' +
        '<button class="block-edit-btn text-indigo-500 hover:text-indigo-700 text-xs font-medium">Edit</button>' +
        '</div>' +
        '<div class="px-3 py-2 text-sm text-gray-700 whitespace-pre-wrap">' + escapeHtml(b.content) + '</div>' +
        '</div>';
    }).join('');

    blockList.querySelectorAll('.prompt-block').forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (e.target.closest('.block-edit-btn') || e.target.closest('.block-drag-handle')) return;
        var idx = parseInt(el.dataset.index);
        editBlock(idx);
      });
    });
    blockList.querySelectorAll('.block-edit-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var idx = parseInt(btn.closest('.prompt-block').dataset.index);
        editBlock(idx);
      });
    });
  }

  function editBlock(index) {
    editingBlockIndex = index;
    blockModalContent.value = blocks[index].content;
    blockModal.classList.remove('hidden');
    blockModalContent.focus();
  }

  blockModalSave.addEventListener('click', function () {
    if (editingBlockIndex !== null) {
      blocks[editingBlockIndex].content = blockModalContent.value;
      renderBlocks();
      markDirty();
    }
    blockModal.classList.add('hidden');
    editingBlockIndex = null;
  });

  blockModalCancel.addEventListener('click', function () {
    blockModal.classList.add('hidden');
    editingBlockIndex = null;
  });

  blockModalDelete.addEventListener('click', function () {
    if (editingBlockIndex !== null) {
      blocks.splice(editingBlockIndex, 1);
      renderBlocks();
      markDirty();
    }
    blockModal.classList.add('hidden');
    editingBlockIndex = null;
  });

  blockModal.addEventListener('click', function (e) {
    if (e.target === blockModal) {
      blockModal.classList.add('hidden');
      editingBlockIndex = null;
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      blockModal.classList.add('hidden');
      snippetModal.classList.add('hidden');
    }
  });

  function addBlock(content) {
    blocks.push({ content: content });
    renderBlocks();
    markDirty();
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function getCombinedText() {
    return blocks.map(function (b) { return b.content; }).join('\n\n');
  }

  copyBtn.addEventListener('click', function () {
    var text = getCombinedText();
    navigator.clipboard.writeText(text).then(function () {
      var orig = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(function () { copyBtn.textContent = orig; }, 1500);
    });
  });

  exportTxtBtn.addEventListener('click', function () {
    downloadFile(getCombinedText(), 'prompt.txt', 'text/plain');
  });

  exportMdBtn.addEventListener('click', function () {
    downloadFile(getCombinedText(), 'prompt.md', 'text/markdown');
  });

  function downloadFile(content, filename, mimeType) {
    var blob = new Blob([content], { type: mimeType });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  newSnippetBtn.addEventListener('click', function () {
    snippetModalTitle.value = '';
    snippetModalContent.value = '';
    snippetModal.classList.remove('hidden');
    snippetModalTitle.focus();
  });

  snippetModalCancel.addEventListener('click', function () {
    snippetModal.classList.add('hidden');
  });

  snippetModal.addEventListener('click', function (e) {
    if (e.target === snippetModal) {
      snippetModal.classList.add('hidden');
    }
  });

  snippetModalSave.addEventListener('click', function () {
    var title = snippetModalTitle.value.trim() || 'Untitled';
    var content = snippetModalContent.value;
    if (!content) return;
    fetch('/api/snippets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title, content: content })
    }).then(function (r) { return r.json(); }).then(function (data) {
      var card = document.createElement('div');
      card.className = 'snippet-card bg-gray-50 rounded-lg p-3 cursor-grab border border-gray-200 hover:border-indigo-300 transition';
      card.dataset.id = data.id;
      card.dataset.title = data.title;
      card.dataset.content = data.content;
      card.innerHTML = '<div class="font-medium text-sm text-gray-800 truncate">' + escapeHtml(data.title) + '</div>' +
        '<div class="text-xs text-gray-500 truncate mt-0.5">' + escapeHtml(data.content.substring(0, 80)) + '</div>';
      document.getElementById('snippet-list').appendChild(card);
      card.addEventListener('dblclick', function () {
        addBlock(card.dataset.content);
      });
      snippetModal.classList.add('hidden');
    });
  });

  document.querySelectorAll('.snippet-card').forEach(function (card) {
    card.addEventListener('dblclick', function () {
      addBlock(card.dataset.content);
    });
    card.addEventListener('dragstart', function (e) {
      e.dataTransfer.setData('text/plain', card.dataset.content);
    });
  });

  blockList.addEventListener('dragover', function (e) {
    e.preventDefault();
  });

  blockList.addEventListener('drop', function (e) {
    e.preventDefault();
    var content = e.dataTransfer.getData('text/plain');
    if (content) {
      addBlock(content);
    }
  });

  function markDirty() {
    saveIndicator.textContent = 'unsaved';
    saveIndicator.classList.add('text-amber-500');
    saveIndicator.classList.remove('text-gray-400');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveCanvas, 800);
  }

  function saveCanvas() {
    if (!currentCanvasId) {
      createNewCanvas();
      return;
    }
    rebuildBlocksFromDOM();
    var name = canvasName.value.trim() || 'Untitled Canvas';
    fetch('/api/canvases/' + currentCanvasId, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, blocks: blocks })
    }).then(function () {
      saveIndicator.textContent = 'saved';
      saveIndicator.classList.remove('text-amber-500');
      saveIndicator.classList.add('text-gray-400');
    });
  }

  function createNewCanvas() {
    var name = canvasName.value.trim() || 'Untitled Canvas';
    fetch('/api/canvases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, blocks: blocks })
    }).then(function (r) { return r.json(); }).then(function (data) {
      currentCanvasId = data.id;
      var opt = document.createElement('option');
      opt.value = data.id;
      opt.textContent = name;
      canvasSelect.appendChild(opt);
      canvasSelect.value = data.id;
      saveIndicator.textContent = 'saved';
      saveIndicator.classList.remove('text-amber-500');
      saveIndicator.classList.add('text-gray-400');
    });
  }

  newCanvasBtn.addEventListener('click', function () {
    currentCanvasId = null;
    blocks = [];
    canvasName.value = 'Untitled Canvas';
    renderBlocks();
    saveIndicator.textContent = 'new';
    saveIndicator.classList.remove('text-amber-500');
    saveIndicator.classList.add('text-gray-400');
  });

  deleteCanvasBtn.addEventListener('click', function () {
    if (!currentCanvasId) return;
    if (!confirm('Delete this canvas?')) return;
    fetch('/api/canvases/' + currentCanvasId, { method: 'DELETE' }).then(function () {
      var opt = canvasSelect.querySelector('option[value="' + currentCanvasId + '"]');
      if (opt) opt.remove();
      currentCanvasId = null;
      blocks = [];
      canvasName.value = 'Untitled Canvas';
      renderBlocks();
      saveIndicator.textContent = 'deleted';
    });
  });

  canvasSelect.addEventListener('change', function () {
    var id = canvasSelect.value;
    if (!id) return;
    fetch('/api/canvases').then(function (r) { return r.json(); }).then(function (canvases) {
      var canvas = canvases.find(function (c) { return c.id === id; });
      if (!canvas) return;
      currentCanvasId = canvas.id;
      canvasName.value = canvas.name;
      blocks = canvas.blocks || [];
      renderBlocks();
      saveIndicator.textContent = 'loaded';
      saveIndicator.classList.remove('text-amber-500');
      saveIndicator.classList.add('text-gray-400');
    });
  });

  canvasName.addEventListener('change', function () {
    markDirty();
  });
})();
