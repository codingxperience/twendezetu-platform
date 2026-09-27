'use client';

// Renders one design page: template + page logic + server data.
//
// The first paint is server-rendered HTML. After that, every state change
// re-renders the template to a string and patches the live DOM in place
// (src/design/morph.js), so fields keep their focus while people type.
// Clicks, typing and key presses are delegated from the page root to the
// handlers the template bound with onClick / onChange / onKeyDown.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { renderTemplate } from './render';
import { hydrateFormValues, morphChildren } from './morph';
import { api } from './api';

// When two-step verification is on, money moves need a texted code. This
// sends one and asks for it; returns the code or null if dismissed.
async function stepUpCode(ask, error) {
  const sent = await api.post('/api/account/step-up');
  return ask({
    title: 'Confirm with your code',
    body: `${error?.message || 'Two-step verification is on.'} We texted a 6-digit code to ${sent.phoneHint}.`,
    placeholder: '123456',
    inputMode: 'numeric',
    autoComplete: 'one-time-code',
    maxLength: 6,
    confirmLabel: 'Confirm',
  });
}

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function DesignView({ template, logic, data, view, params, viewer }) {
  const router = useRouter();
  const [state, setState] = useState(() => ({ ...structuredClone(logic.initialState || {}), ...(logic.stateFrom?.(data, params) || {}), data }));
  const stateRef = useRef(state);
  stateRef.current = state;
  const rootRef = useRef(null);
  const actionsRef = useRef(new Map());
  const toastTimer = useRef(null);
  const dialogResolve = useRef(null);
  const [dialog, setDialog] = useState(null);
  const [dialogValue, setDialogValue] = useState('');

  // Asks for one value (a texted code, a password, a reason) in an in-page
  // dialog. Resolves with the value, or null when dismissed.
  const ask = useCallback((options) => new Promise((resolve) => {
    dialogResolve.current = resolve;
    setDialogValue(options.initial || '');
    setDialog(options);
  }), []);

  const closeDialog = useCallback((value) => {
    dialogResolve.current?.(value);
    dialogResolve.current = null;
    setDialog(null);
  }, []);

  // A fresh server render (navigation, router.refresh) brings new data.
  useEffect(() => {
    setState((current) => (current.data === data ? current : { ...current, data }));
  }, [data]);

  const toast = useCallback((message, kind = 'ok', ms = 3600) => {
    window.clearTimeout(toastTimer.current);
    setState((current) => ({ ...current, toast: message, toastKind: kind }));
    toastTimer.current = window.setTimeout(() => setState((current) => ({ ...current, toast: null })), ms);
  }, []);

  // Always reloads what the page shows now: timers set up in onMount keep
  // the first reload they were given, and a client navigation can change
  // the params since. A response that lands after such a change is dropped.
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const reload = useCallback(async () => {
    if (!view) return;
    const queryOf = (values) => new URLSearchParams(Object.entries(values || {}).filter(([, value]) => value != null && value !== '')).toString();
    const query = queryOf(paramsRef.current);
    const fresh = await api.get(`/api/views/${view}${query ? `?${query}` : ''}`);
    if (queryOf(paramsRef.current) !== query) return;
    setState((current) => ({ ...current, data: fresh }));
  }, [view]);

  // Runs an async action with a busy flag, error toasts and sign-in redirects.
  const run = useCallback(
    async (key, task, { success, reloadAfter = true } = {}) => {
      if (stateRef.current.busy?.[key]) return undefined;
      setState((current) => ({ ...current, busy: { ...current.busy, [key]: true } }));
      try {
        const result = await task();
        if (result?.redirectUrl) {
          window.location.assign(result.redirectUrl);
          return result;
        }
        if (reloadAfter) await reload();
        if (success) toast(typeof success === 'function' ? success(result) : success);
        return result;
      } catch (error) {
        if (error.status === 401) {
          window.location.assign(`/sign-in?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
          return undefined;
        }
        toast(error.message, 'err', 5200);
        return undefined;
      } finally {
        setState((current) => ({ ...current, busy: { ...current.busy, [key]: false } }));
      }
    },
    [reload, toast],
  );

  const ctx = useMemo(
    () => ({ api, run, reload, toast, ask, stepUp: (error) => stepUpCode(ask, error), router, viewer, params: params || {}, navigate: (href) => router.push(href) }),
    [run, reload, toast, ask, router, viewer, params],
  );

  const rendered = useMemo(() => {
    const values = logic.values(state, setState, ctx);
    return renderTemplate(template, values);
  }, [logic, state, ctx, template]);
  actionsRef.current = rendered.actions;

  // React 19 compares dangerouslySetInnerHTML by object identity, so the
  // object must be the same on every render or React would overwrite the
  // patched DOM with the first paint.
  const [initialMarkup] = useState(() => ({ __html: rendered.html }));
  const initialHtml = initialMarkup.__html;
  const mounted = useRef(false);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!mounted.current) {
      mounted.current = true;
      hydrateFormValues(root);
      if (rendered.html === initialHtml) return;
    }
    const next = document.createElement('template');
    next.innerHTML = rendered.html;
    morphChildren(root, next.content);
    hydrateFormValues(root);
  }, [rendered.html, initialHtml]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const dispatch = (attribute, prevent) => (event) => {
      const target = event.target.closest?.(`[${attribute}]`);
      if (!target || !root.contains(target)) return;
      const action = actionsRef.current.get(target.getAttribute(attribute));
      if (typeof action !== 'function') return;
      if (prevent) event.preventDefault();
      action(event);
    };
    const onClick = dispatch('data-action-id', true);
    const onInput = dispatch('data-change-action-id', false);
    const onKey = dispatch('data-key-action-id', false);
    const onSubmit = dispatch('data-submit-action-id', true);
    root.addEventListener('click', onClick);
    root.addEventListener('input', onInput);
    root.addEventListener('change', onInput);
    root.addEventListener('keydown', onKey);
    root.addEventListener('submit', onSubmit);
    // onMount may return a cleanup (timers, listeners) run when the page unmounts.
    const cleanup = logic.onMount?.(ctx, setState, root);
    return () => {
      if (typeof cleanup === 'function') cleanup();
      root.removeEventListener('click', onClick);
      root.removeEventListener('input', onInput);
      root.removeEventListener('change', onInput);
      root.removeEventListener('keydown', onKey);
      root.removeEventListener('submit', onSubmit);
    };
    // Listeners are attached once; handlers are read from actionsRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <main id="main" ref={rootRef} className="claude-design" suppressHydrationWarning dangerouslySetInnerHTML={initialMarkup} />
      {dialog ? (
        <div className="tw-dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && closeDialog(null)}>
          <form
            className="tw-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tw-dialog-title"
            onSubmit={(event) => {
              event.preventDefault();
              if (dialog.input !== false && !dialogValue.trim()) return;
              closeDialog(dialog.input === false ? true : dialogValue.trim());
            }}
            onKeyDown={(event) => event.key === 'Escape' && closeDialog(null)}
          >
            <h2 id="tw-dialog-title">{dialog.title}</h2>
            {dialog.body ? <p>{dialog.body}</p> : null}
            {dialog.input !== false ? (
              <input
                autoFocus
                type={dialog.type || 'text'}
                inputMode={dialog.inputMode}
                autoComplete={dialog.autoComplete || 'off'}
                placeholder={dialog.placeholder}
                maxLength={dialog.maxLength}
                value={dialogValue}
                onChange={(event) => setDialogValue(event.target.value)}
              />
            ) : null}
            <div className="tw-dialog-actions">
              <button type="button" onClick={() => closeDialog(null)}>
                Cancel
              </button>
              <button type="submit" autoFocus={dialog.input === false} className={dialog.danger ? 'tw-danger' : undefined}>
                {dialog.confirmLabel || 'Continue'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
      <div className="tw-toast-region" role="status" aria-live="polite">
        {state.toast ? (
          <div className={`tw-toast${state.toastKind === 'err' ? ' tw-toast--error' : ''}`}>
            <span>{state.toast}</span>
            <button type="button" aria-label="Dismiss" onClick={() => setState((current) => ({ ...current, toast: null }))}>
              ×
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
