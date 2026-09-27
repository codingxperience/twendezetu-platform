// A small template engine for the design pages. Templates are HTML with
// {{ expression }} bindings and two structural tags:
//
//   <sc-for list="{{ items }}" as="item">…</sc-for>
//   <sc-if value="{{ condition }}">…</sc-if>
//
// Event bindings (onClick, onChange, onKeyDown, onSubmit) become
// data-*-action-id attributes that the view resolves to handlers. Every
// interpolated value is HTML-escaped; URLs in href/src are restricted to
// safe schemes.

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Links may be relative, http(s), mailto or tel. Anything else — javascript:,
// data:, vbscript: — becomes "#".
export function safeUrl(value) {
  const url = String(value ?? '').trim();
  if (!url) return '#';
  if (/^(https?:|mailto:|tel:)/i.test(url)) return url;
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return '#';
  return url;
}

function readAttribute(attrs, name) {
  return attrs.match(new RegExp(`${name}="([^"]*)"`))?.[1] ?? '';
}

function expressionFromTemplate(value) {
  return value.match(/\{\{\s*([^}]+?)\s*\}\}/)?.[1]?.trim() ?? value.trim();
}

function resolve(expr, scope) {
  const key = expr.trim();
  if (key === 'true') return true;
  if (key === 'false') return false;
  if (key === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(key)) return Number(key);
  return key.split('.').reduce((value, part) => (value == null ? undefined : value[part]), scope);
}

function addClass(tag, className) {
  if (/\sclass="/.test(tag)) return tag.replace(/\sclass="([^"]*)"/, ` class="$1 ${className}"`);
  return tag.replace(/>$/, ` class="${className}">`);
}

function imageSlot(match) {
  const style = readAttribute(match, 'style');
  const placeholder = readAttribute(match, 'placeholder') || 'Image';
  const src = readAttribute(match, 'src');
  const credit = readAttribute(match, 'credit');
  if (src) {
    const caption = credit ? `<figcaption>${escapeHtml(credit)}</figcaption>` : '';
    return `<figure class="tw-image-slot tw-image-slot--photo" style="${style}"><img src="${escapeHtml(safeUrl(src))}" alt="${escapeHtml(placeholder)}" loading="lazy">${caption}</figure>`;
  }
  return `<div class="tw-image-slot" style="${style}"><span>${escapeHtml(placeholder)}</span></div>`;
}

function deviceFrame(match, inner, renderInner) {
  const dark = readAttribute(match, 'dark').includes('true');
  return `<div class="tw-ios-device${dark ? ' tw-ios-device--dark' : ''}"><div class="tw-ios-device__speaker"></div><div class="tw-ios-device__screen">${renderInner(inner)}</div></div>`;
}

// Replaces balanced <tag …>…</tag> blocks, innermost-safe.
function replaceBlock(segment, tagName, render) {
  const open = new RegExp(`<${tagName}\\s+([^>]*)>`, 'i');
  let output = '';
  let cursor = 0;
  while (cursor < segment.length) {
    const rest = segment.slice(cursor);
    const found = open.exec(rest);
    if (!found) {
      output += rest;
      break;
    }
    const openStart = cursor + found.index;
    const openEnd = openStart + found[0].length;
    const tokens = new RegExp(`<${tagName}\\s+[^>]*>|</${tagName}>`, 'gi');
    tokens.lastIndex = openEnd;
    let depth = 1;
    let closeStart = -1;
    let closeEnd = -1;
    output += segment.slice(cursor, openStart);
    for (let token = tokens.exec(segment); token; token = tokens.exec(segment)) {
      depth += token[0].startsWith('</') ? -1 : 1;
      if (depth === 0) {
        closeStart = token.index;
        closeEnd = tokens.lastIndex;
        break;
      }
    }
    if (closeStart === -1) {
      output += segment.slice(openStart);
      break;
    }
    output += render(found[1], segment.slice(openEnd, closeStart));
    cursor = closeEnd;
  }
  return output;
}

const EVENT_ATTRIBUTES = [
  ['onClick', 'data-action-id'],
  ['onChange', 'data-change-action-id'],
  ['onKeyDown', 'data-key-action-id'],
  ['onSubmit', 'data-submit-action-id'],
];

export function renderTemplate(template, values) {
  const hoverRules = [];
  let hoverCount = 0;
  const actions = new Map();
  const register = (action) => {
    const id = String(actions.size);
    actions.set(id, action);
    return id;
  };

  function renderSegment(segment, scope) {
    let html = segment;

    html = replaceBlock(html, 'sc-for', (attrs, inner) => {
      const list = resolve(expressionFromTemplate(readAttribute(attrs, 'list')), scope) ?? [];
      const as = readAttribute(attrs, 'as');
      if (!Array.isArray(list) || !as) return '';
      return list.map((item, index) => renderSegment(inner, { ...scope, [as]: item, [`${as}Index`]: index })).join('');
    });

    html = replaceBlock(html, 'sc-if', (attrs, inner) => (resolve(expressionFromTemplate(readAttribute(attrs, 'value')), scope) ? renderSegment(inner, scope) : ''));

    html = html.replace(/<x-import\b[^>]*component-from-global-scope="image-slot"[^>]*><\/x-import>/g, imageSlot);
    html = html.replace(/<x-import\b[^>]*component-from-global-scope="IOSDevice"[^>]*>([\s\S]*?)<\/x-import>/g, (match, inner) =>
      deviceFrame(match, inner, (next) => renderSegment(next, scope)),
    );

    html = html.replace(/<([a-z][\w-]*)([^>]*?)\sstyle-hover="([^"]*)"([^>]*)>/gi, (_match, tagName, before, hoverCss, after) => {
      const className = `tw-hover-${hoverCount++}`;
      hoverRules.push(`.${className}:hover { ${hoverCss} }`);
      return addClass(`<${tagName}${before}${after}>`, className);
    });

    for (const [attribute, dataAttribute] of EVENT_ATTRIBUTES) {
      html = html.replace(new RegExp(`\\s${attribute}="\\{\\{\\s*([^}]+?)\\s*\\}\\}"`, 'g'), (_match, expr) => {
        const action = resolve(expr, scope);
        if (typeof action === 'function') return ` ${dataAttribute}="${register(action)}"`;
        if (process.env.NODE_ENV !== 'production') console.warn(`Template action "${expr}" (${attribute}) is not a function.`);
        return '';
      });
    }

    html = html.replace(/\s(href|src)="\{\{\s*([^}]+?)\s*\}\}"/g, (_match, attribute, expr) => ` ${attribute}="${escapeHtml(safeUrl(resolve(expr, scope)))}"`);

    html = html.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_match, expr) => {
      const value = resolve(expr, scope);
      return typeof value === 'function' ? '' : escapeHtml(value);
    });

    return html;
  }

  const body = renderSegment(template, values);
  return { html: `<style>${hoverRules.join('\n')}</style>${body}`, actions };
}
