// Markup for the organizerPayouts page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh;">

  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 18px 24px; border-bottom: 2px solid #1F3A38; background: #F7F1E6; position: sticky; top: 0; z-index: 40;">
    <div style="display: flex; align-items: center; gap: 20px;">
      <a href="/my-twende" style="text-decoration: none; color: #14201F; font-family: var(--tz-display); font-size: 24px; text-transform: uppercase; line-height: 0.9;">TWENDE<span style="color: #D97A3B;">ZETU</span></a>
      <span style="font-family: var(--tz-mono); font-size: 12px; background: #1F3A38; color: #F7F1E6; padding: 5px 10px;">ORGANIZER PAYOUTS</span>
    </div>
    <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
      <a href="/organizer-analytics" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; color: #14201F; text-decoration: none; padding: 9px 14px;">📊 ANALYTICS</a>
      <a href="/checkin" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #D97A3B; color: #14201F; text-decoration: none; padding: 9px 14px;">▣ CHECK-IN</a>
    </div>
  </header>

  <div style="max-width: 1160px; margin: 0 auto; padding: 32px 24px 80px;">
    <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em;">[Malipo — how the money reaches you]</div>
    <h1 style="font-family: var(--tz-display); font-size: clamp(30px, 4.5vw, 52px); text-transform: uppercase; line-height: 0.95; margin: 8px 0 24px;">Payouts<span style="color: #D97A3B;">.</span></h1>

    <!-- Money flow strip -->
    <div class="tw-4col" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; border: 2px solid #1F3A38; background: #1F3A38; margin-bottom: 12px;">
      <sc-for list="{{ flow }}" as="f" hint-placeholder-count="4">
        <div style="background: {{ f.bg }}; color: {{ f.fg }}; padding: 18px 20px;">
          <div style="font-family: var(--tz-mono); font-size: 10.5px; opacity: 0.7;">{{ f.step }}</div>
          <div style="font-family: var(--tz-display); font-size: 22px; text-transform: uppercase; line-height: 1; margin: 8px 0 4px;">{{ f.label }}</div>
          <div style="font-size: 12px; opacity: 0.8; line-height: 1.4;">{{ f.desc }}</div>
        </div>
      </sc-for>
    </div>
    <div style="font-size: 12.5px; color: #6E6155; margin-bottom: 28px;">Buyers pay → Twendezetu holds funds in escrow → after the event you're paid out, minus the 5% platform fee. Refunds and disputes come out of escrow <em>before</em> release, so you're never clawed back after payout.</div>

    <div class="tw-2col" style="display: grid; grid-template-columns: 0.9fr 1.3fr; gap: 24px; align-items: start;">
      <!-- Balance card -->
      <div style="display: grid; gap: 16px;">
        <div style="border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 24px; box-shadow: 6px 6px 0 #D97A3B;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">[Available to withdraw]</div>
          <div style="font-family: var(--tz-display); font-size: 52px; line-height: 1; margin: 10px 0 2px;">$1,842</div>
          <div style="font-family: var(--tz-mono); font-size: 12px; color: rgba(247,241,230,0.7);">from “Diaspora Connect Mixer” · cleared 22 Aug</div>
          <button onClick="{{ withdraw }}" style="width: 100%; margin-top: 16px; font-family: var(--tz-display); font-size: 16px; text-transform: uppercase; background: #D97A3B; color: #14201F; border: 0; padding: 14px; cursor: pointer;">{{ withdrawLabel }}</button>
          <div style="font-family: var(--tz-mono); font-size: 10.5px; color: rgba(247,241,230,0.6); margin-top: 10px; text-align: center;">TO: MTN MoMo ••7214 · 1–2 hrs</div>
        </div>

        <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 20px 22px;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; letter-spacing: 0.08em;">[Held in escrow]</div>
          <div style="font-family: var(--tz-display); font-size: 34px; margin: 8px 0 2px;">$3,021</div>
          <div style="font-size: 12.5px; color: #6E6155; line-height: 1.5;">Nyama Choma ($3,180 − $159 fee) releases <strong>2 days after</strong> the event, once check-in confirms it happened.</div>
          <div style="height: 8px; border: 1px solid #1F3A38; background: #EFE7D6; margin-top: 12px;"><div style="height: 100%; width: 70%; background: #7B8B6E;"></div></div>
          <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #6E6155; margin-top: 6px;">EVENT IN 3 DAYS · AUTO-RELEASE 10 AUG</div>
        </div>

        <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 20px 22px;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; letter-spacing: 0.08em;">[Payout method]</div>
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-top: 10px;">
            <div style="display: flex; gap: 12px; align-items: center;">
              <span style="width: 40px; height: 28px; border: 2px solid #1F3A38; background: #FFCC00; font-family: var(--tz-mono); font-size: 9px; display: flex; align-items: center; justify-content: center;">MTN</span>
              <div style="font-size: 13.5px;">MoMo ••7214<br><span style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">default · instant</span></div>
            </div>
            <a href="/settings" style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; text-decoration: underline;">CHANGE</a>
          </div>
        </div>
      </div>

      <!-- Payout history + schedule -->
      <div>
        <!-- Auto-release schedule (incl. waitlist) -->
        <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 20px 22px; margin-bottom: 16px;">
          <div style="font-family: var(--tz-display); font-size: 19px; text-transform: uppercase; margin-bottom: 4px;">Auto-release schedule</div>
          <div style="font-size: 12.5px; color: #6E6155; margin-bottom: 14px;">Escrow releases on its own — no invoicing, no chasing.</div>
          <div style="display: grid; gap: 10px;">
            <sc-for list="{{ schedule }}" as="s" hint-placeholder-count="3">
              <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 12px; align-items: center; border: 1px solid #E3D9C6; background: #F7F1E6; padding: 12px 14px;">
                <span style="width: 26px; height: 26px; border: 2px solid #1F3A38; background: {{ s.mBg }}; color: {{ s.mFg }}; font-family: var(--tz-mono); font-size: 11px; display: flex; align-items: center; justify-content: center;">{{ s.mark }}</span>
                <div>
                  <div style="font-weight: 700; font-size: 13.5px;">{{ s.title }}</div>
                  <div style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">{{ s.when }}</div>
                </div>
                <span style="font-family: var(--tz-display); font-size: 16px; color: #A85A23;">{{ s.amount }}</span>
              </div>
            </sc-for>
          </div>
        </div>

        <!-- History -->
        <div style="border: 2px solid #1F3A38; background: #FFFDF8;">
          <div style="padding: 14px 20px; border-bottom: 2px solid #1F3A38; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-family: var(--tz-display); font-size: 19px; text-transform: uppercase;">Payout history</span>
            <button onClick="{{ statement }}" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 7px 12px; cursor: pointer;">↓ STATEMENT</button>
          </div>
          <sc-for list="{{ history }}" as="h" hint-placeholder-count="4">
            <div style="display: grid; grid-template-columns: 1fr auto auto; gap: 14px; align-items: center; padding: 13px 20px; border-bottom: 1px solid #E3D9C6;">
              <div>
                <div style="font-weight: 600; font-size: 13.5px;">{{ h.event }}</div>
                <div style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">{{ h.meta }}</div>
              </div>
              <span style="font-family: var(--tz-mono); font-size: 10.5px; background: {{ h.chipBg }}; color: {{ h.chipFg }}; border: 1px solid #1F3A38; padding: 4px 8px; white-space: nowrap;">{{ h.status }}</span>
              <span style="font-family: var(--tz-display); font-size: 17px;">{{ h.amount }}</span>
            </div>
          </sc-for>
        </div>
      </div>
    </div>
  </div>

</div>
`;

export default template;
