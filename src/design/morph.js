// Patches a live DOM tree to match freshly rendered HTML, touching only what
// changed. Unlike replacing innerHTML, the element being typed into keeps its
// focus, caret and scroll position.

// Elements whose value has been initialised from a render. Kept outside the
// DOM so it never shows up as an attribute to diff.
const bound = new WeakSet();

function syncAttributes(from, to) {
  for (const { name } of [...from.attributes]) {
    if (!to.hasAttribute(name)) from.removeAttribute(name);
  }
  for (const { name, value } of [...to.attributes]) {
    if (from.getAttribute(name) !== value) from.setAttribute(name, value);
  }
}

// Form state lives in properties, not attributes. Unbound fields (no value
// in the template) are left entirely to the browser. The rendered "value" is
// applied only when it changed since the last render, so a field the person
// is typing in is never overwritten by its own echo, but a programmatic reset
// (clearing a message box after sending) still lands.
function syncFormState(from, to) {
  const tag = from.tagName;
  if (tag === 'INPUT') {
    const type = (to.getAttribute('type') || 'text').toLowerCase();
    if (type === 'checkbox' || type === 'radio') {
      from.checked = to.hasAttribute('checked');
    } else if (type !== 'file' && to.hasAttribute('value')) {
      const next = to.getAttribute('value') ?? '';
      const previous = from.getAttribute('value') ?? '';
      if (next !== previous || !bound.has(from)) {
        if (from.value !== next) from.value = next;
        bound.add(from);
      }
    }
  } else if (tag === 'TEXTAREA' && to.hasAttribute('value')) {
    const next = to.getAttribute('value');
    const previous = from.getAttribute('value') ?? '';
    if (next !== previous || !bound.has(from)) {
      if (from.value !== next) from.value = next;
      bound.add(from);
    }
  } else if (tag === 'SELECT' && to.hasAttribute('value')) {
    const next = to.getAttribute('value');
    if (from.value !== next) from.value = next;
  }
}

function sameKind(a, b) {
  return a.nodeType === b.nodeType && (a.nodeType !== 1 || a.tagName === b.tagName);
}

function morphNode(from, to) {
  if (from.nodeType === 3 || from.nodeType === 8) {
    if (from.nodeValue !== to.nodeValue) from.nodeValue = to.nodeValue;
    return;
  }
  const formState = from.tagName === 'INPUT' || from.tagName === 'TEXTAREA' || from.tagName === 'SELECT';
  if (formState) syncFormState(from, to);
  syncAttributes(from, to);
  if (from.tagName !== 'TEXTAREA') morphChildren(from, to);
}

export function morphChildren(from, to) {
  let current = from.firstChild;
  let incoming = to.firstChild;
  while (incoming) {
    const nextIncoming = incoming.nextSibling;
    if (!current) {
      from.appendChild(incoming);
    } else if (sameKind(current, incoming)) {
      morphNode(current, incoming);
      current = current.nextSibling;
    } else {
      const replaced = current;
      current = current.nextSibling;
      from.replaceChild(incoming, replaced);
    }
    incoming = nextIncoming;
  }
  while (current) {
    const next = current.nextSibling;
    from.removeChild(current);
    current = next;
  }
}

// Textareas written as <textarea value="…"></textarea> in templates get their
// text on first paint too.
export function hydrateTextareas(root) {
  for (const area of root.querySelectorAll('textarea[value]')) {
    if (!bound.has(area)) {
      area.value = area.getAttribute('value');
      bound.add(area);
    }
  }
}
