'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { claudePageTemplates } from '@/design/claude-page-templates';
import { createClaudePageValues, getInitialClaudePageState } from '@/design/claude-page-state';

const ROUTES = {
  'Twendezetu Home.dc.html': '/',
  'Event Nyama Choma.dc.html': '/events/nyama-choma-festival-2026',
  'Create Event.dc.html': '/create-event',
  'Checkout.dc.html': '/checkout',
  'Sign In.dc.html': '/sign-in',
  'Provider Listing.dc.html': '/providers/kato-4x4',
  'Provider Dashboard.dc.html': '/provider-dashboard',
  'Provider Verification.dc.html': '/provider-verification',
  'Provider Wallet.dc.html': '/provider-wallet',
  'Points Wallet.dc.html': '/points-wallet',
  'My Twende.dc.html': '/my-twende',
  'Messages.dc.html': '/messages',
  'Settings.dc.html': '/settings',
  'Admin.dc.html': '/admin',
  'Finance.dc.html': '/finance',
  'Mobile.dc.html': '/mobile',
  'Checkin.dc.html': '/checkin',
  'Disputes.dc.html': '/disputes',
  'Organizer Analytics.dc.html': '/organizer-analytics',
  'Organizer Payouts.dc.html': '/organizer-payouts',
  'Referral Rewards.dc.html': '/referral-rewards',
  'Split Pay.dc.html': '/split-pay',
};

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function readAttribute(attrs, name) {
  return attrs.match(new RegExp(`${name}="([^"]*)"`))?.[1] ?? '';
}

const UPLOAD_IMAGE_FALLBACK_SRC = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=85';

function normalizeImageSrc(src) {
  if (/^uploads\//i.test(src)) {
    return UPLOAD_IMAGE_FALLBACK_SRC;
  }

  return src;
}

function expressionFromTemplate(value) {
  return value.match(/\{\{\s*([^}]+?)\s*\}\}/)?.[1]?.trim() ?? value.trim();
}

function resolveExpression(expr, scope) {
  const key = expr.trim();
  if (key === 'true') return true;
  if (key === 'false') return false;
  if (key === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(key)) return Number(key);

  return key.split('.').reduce((value, part) => {
    if (value == null) return undefined;
    return value[part];
  }, scope);
}

function mapHref(href) {
  const match = href.match(/^([^?#]+\.dc\.html)([?#].*)?$/);
  if (!match) return ROUTES[href] ?? href;

  return ROUTES[match[1]] ? `${ROUTES[match[1]]}${match[2] ?? ''}` : href;
}

function addClassToTag(tag, className) {
  if (/\sclass="/.test(tag)) {
    return tag.replace(/\sclass="([^"]*)"/, ` class="$1 ${className}"`);
  }

  return tag.replace(/>$/, ` class="${className}">`);
}

function createImageSlot(match) {
  const style = readAttribute(match, 'style');
  const placeholder = readAttribute(match, 'placeholder') || 'Image placeholder';
  const src = readAttribute(match, 'src');
  const credit = readAttribute(match, 'credit');

  if (src) {
    const image = `<img src="${escapeHtml(normalizeImageSrc(src))}" alt="${escapeHtml(placeholder)}">`;
    const caption = credit ? `<figcaption>${escapeHtml(credit)}</figcaption>` : '';
    return `<figure class="tw-image-slot tw-image-slot--photo" style="${style}">${image}${caption}</figure>`;
  }

  return `<div class="tw-image-slot" style="${style}"><span>${escapeHtml(placeholder)}</span></div>`;
}

function createIosFrame(match, inner, renderInner) {
  const dark = readAttribute(match, 'dark').includes('true');
  const themeClass = dark ? ' tw-ios-device--dark' : '';
  return `<div class="tw-ios-device${themeClass}"><div class="tw-ios-device__speaker"></div><div class="tw-ios-device__screen">${renderInner(inner)}</div></div>`;
}

function replaceCustomTag(segment, tagName, renderTag) {
  const openPattern = new RegExp(`<${tagName}\\s+([^>]*)>`, 'i');
  let output = '';
  let cursor = 0;

  while (cursor < segment.length) {
    const rest = segment.slice(cursor);
    const open = openPattern.exec(rest);

    if (!open) {
      output += rest;
      break;
    }

    const openStart = cursor + open.index;
    const openEnd = openStart + open[0].length;
    const tokenPattern = new RegExp(`<${tagName}\\s+[^>]*>|</${tagName}>`, 'gi');
    let depth = 1;
    let closeStart = -1;
    let closeEnd = -1;

    tokenPattern.lastIndex = openEnd;
    output += segment.slice(cursor, openStart);

    let token = tokenPattern.exec(segment);
    while (token) {
      if (token[0].toLowerCase().startsWith(`</${tagName}`)) {
        depth -= 1;
      } else {
        depth += 1;
      }

      if (depth === 0) {
        closeStart = token.index;
        closeEnd = tokenPattern.lastIndex;
        break;
      }

      token = tokenPattern.exec(segment);
    }

    if (closeStart === -1) {
      output += segment.slice(openStart);
      break;
    }

    output += renderTag(open[1], segment.slice(openEnd, closeStart));
    cursor = closeEnd;
  }

  return output;
}

function renderTemplate(template, values, registerAction) {
  const hoverRules = [];
  let hoverCount = 0;

  function renderSegment(segment, scope) {
    let html = segment;

    html = replaceCustomTag(html, 'sc-for', (attrs, inner) => {
      const list = resolveExpression(expressionFromTemplate(readAttribute(attrs, 'list')), scope) ?? [];
      const as = readAttribute(attrs, 'as');
      if (!Array.isArray(list) || !as) return '';

      return list
        .map((item, index) => renderSegment(inner, { ...scope, [as]: item, [`${as}Index`]: index }))
        .join('');
    });

    html = replaceCustomTag(html, 'sc-if', (attrs, inner) => {
      const value = resolveExpression(expressionFromTemplate(readAttribute(attrs, 'value')), scope);
      return value ? renderSegment(inner, scope) : '';
    });

    html = html.replace(/<x-import\b[^>]*component-from-global-scope="image-slot"[^>]*><\/x-import>/g, createImageSlot);

    html = html.replace(
      /<x-import\b[^>]*component-from-global-scope="IOSDevice"[^>]*>([\s\S]*?)<\/x-import>/g,
      (match, inner) => createIosFrame(match, inner, (next) => renderSegment(next, scope)),
    );

    html = html.replace(/<([a-z][\w-]*)([^>]*?)\sstyle-hover="([^"]*)"([^>]*)>/gi, (_match, tagName, before, hoverCss, after) => {
      const className = `tw-hover-${hoverCount++}`;
      hoverRules.push(`.${className}:hover { ${hoverCss} }`);
      return addClassToTag(`<${tagName}${before}${after}>`, className);
    });

    html = html.replace(/\sonClick="\{\{\s*([^}]+?)\s*\}\}"/g, (_match, expr) => {
      const action = resolveExpression(expr, scope);
      if (typeof action !== 'function') return '';
      return ` data-action-id="${registerAction(action)}"`;
    });

    html = html.replace(/\sonChange="\{\{\s*([^}]+?)\s*\}\}"/g, (_match, expr) => {
      const action = resolveExpression(expr, scope);
      if (typeof action !== 'function') return '';
      return ` data-change-action-id="${registerAction(action)}"`;
    });

    html = html.replace(/\sonKeyDown="\{\{\s*([^}]+?)\s*\}\}"/g, (_match, expr) => {
      const action = resolveExpression(expr, scope);
      if (typeof action !== 'function') return '';
      return ` data-key-action-id="${registerAction(action)}"`;
    });

    html = html.replace(/\shref="\{\{\s*([^}]+?)\s*\}\}"/g, (_match, expr) => {
      const href = resolveExpression(expr, scope);
      return ` href="${escapeHtml(mapHref(String(href ?? '#')))}"`;
    });

    html = html.replace(/\shref="([^"]+\.dc\.html(?:[?#][^"]*)?)"/g, (_match, href) => ` href="${mapHref(href)}"`);

    html = html.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_match, expr) => {
      const value = resolveExpression(expr, scope);
      if (typeof value === 'function') return '';
      return escapeHtml(value);
    });

    html = html.replace(/\ssrc="([^"]+)"/g, (_match, src) => ` src="${escapeHtml(normalizeImageSrc(src))}"`);

    return html;
  }

  const body = renderSegment(template, values);
  return `<style>${hoverRules.join('\n')}</style>${body}`;
}

export function ClaudeDesignPage({ page, initialState = {} }) {
  const initialStateKey = JSON.stringify(initialState);
  const initialPageState = useMemo(
    () => ({ ...getInitialClaudePageState(page), ...JSON.parse(initialStateKey || '{}') }),
    [page, initialStateKey],
  );
  const [pageState, setPageState] = useState(() => initialPageState);
  const actionsRef = useRef(new Map());
  const template = claudePageTemplates[page];

  useEffect(() => {
    setPageState(initialPageState);
  }, [initialPageState]);

  const rendered = useMemo(() => {
    const actions = new Map();
    const values = createClaudePageValues(page, pageState, setPageState);
    const html = renderTemplate(template ?? '', values, (action) => {
      const id = String(actions.size);
      actions.set(id, action);
      return id;
    });
    return { actions, html };
  }, [page, pageState, template]);

  actionsRef.current = rendered.actions;

  function runAction(event, attribute) {
    const target = event.target.closest(`[${attribute}]`);
    if (!target) return;

    const action = actionsRef.current.get(target.getAttribute(attribute));
    if (typeof action !== 'function') return;

    event.preventDefault();
    action(event);
  }

  return (
    <main
      id="main"
      className="claude-design"
      onClick={(event) => runAction(event, 'data-action-id')}
      onChange={(event) => runAction(event, 'data-change-action-id')}
      onKeyDown={(event) => runAction(event, 'data-key-action-id')}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: rendered.html }}
    />
  );
}
