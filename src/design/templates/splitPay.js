// Markup for the splitPay page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh;">

  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 18px 24px; border-bottom: 2px solid #1F3A38; background: #F7F1E6; position: sticky; top: 0; z-index: 40;">
    <div style="display: flex; align-items: center; gap: 20px;">
      <a href="/checkout" style="text-decoration: none; color: #14201F; font-family: var(--tz-display); font-size: 24px; text-transform: uppercase; line-height: 0.9;">TWENDE<span style="color: #D97A3B;">ZETU</span></a>
      <span style="font-family: var(--tz-mono); font-size: 12px; background: #1F3A38; color: #F7F1E6; padding: 5px 10px;">GROUP SPLIT-PAY</span>
    </div>
    <a href="/checkout" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; color: #14201F; text-decoration: none; padding: 10px 16px;">← BACK TO TICKETS</a>
  </header>

  <div class="tw-2col" style="max-width: 1140px; margin: 0 auto; padding: 32px 24px 80px; display: grid; grid-template-columns: 1.4fr 0.85fr; gap: 44px; align-items: start;">

    <main>
      <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em;">[Lipa pamoja — one group, split the bill]</div>
      <h1 style="font-family: var(--tz-display); font-size: clamp(30px, 4.5vw, 52px); text-transform: uppercase; line-height: 0.95; margin: 8px 0 6px;">Afrogroove Night — 5 tickets<span style="color: #D97A3B;">.</span></h1>
      <p style="font-size: 14px; color: #6E6155; line-height: 1.55; max-width: 560px; margin: 0 0 22px;">You reserved 5 early-bird tickets. Everyone pays their own share by link — each person gets their own QR the moment they pay. Seats are <strong>held for 48 hours</strong>; unpaid shares release back automatically.</p>

      <!-- Progress -->
      <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 18px 20px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; font-family: var(--tz-mono); font-size: 12px; margin-bottom: 8px;">
          <span style="color: #A85A23;">{{ paidCount }} of 5 paid · {{ collected }} collected</span>
          <span style="color: #6E6155;">holds release in 47h 12m</span>
        </div>
        <div style="height: 18px; border: 2px solid #1F3A38; background: #EFE7D6;"><div style="height: 100%; width: {{ pct }}; background: #D97A3B; transition: width 300ms;"></div></div>
      </div>

      <!-- Guests -->
      <div style="display: grid; gap: 10px;">
        <sc-for list="{{ guests }}" as="g" hint-placeholder-count="5">
          <div style="border: 2px solid #1F3A38; background: {{ g.bg }}; padding: 14px 18px; display: grid; grid-template-columns: 40px 1fr auto; gap: 14px; align-items: center;">
            <span style="width: 34px; height: 34px; border: 2px solid #1F3A38; background: {{ g.avBg }}; color: {{ g.avFg }}; font-family: var(--tz-display); font-size: 15px; display: flex; align-items: center; justify-content: center;">{{ g.init }}</span>
            <div>
              <div style="font-weight: 700; font-size: 14.5px;">{{ g.name }}</div>
              <div style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">{{ g.meta }}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-family: var(--tz-display); font-size: 17px; color: #A85A23;">{{ g.share }}</div>
              <sc-if value="{{ g.unpaid }}" hint-placeholder-val="{{ false }}">
                <button onClick="{{ g.remind }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 5px 10px; cursor: pointer; margin-top: 4px;">{{ g.remindLabel }}</button>
              </sc-if>
              <sc-if value="{{ g.paid }}" hint-placeholder-val="{{ false }}">
                <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #4a7c4a; margin-top: 4px;">✓ PAID · QR SENT</div>
              </sc-if>
            </div>
          </div>
        </sc-for>
      </div>

      <div style="display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap;">
        <button onClick="{{ copyLink }}" style="font-family: var(--tz-display); font-size: 14px; text-transform: uppercase; background: #1F3A38; color: #F7F1E6; border: 2px solid #1F3A38; padding: 12px 22px; cursor: pointer;">{{ copyLabel }}</button>
        <button onClick="{{ payMine }}" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #D97A3B; color: #14201F; padding: 12px 18px; cursor: pointer;">PAY MY SHARE NOW</button>
        <button onClick="{{ coverAll }}" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 12px 18px; cursor: pointer;">COVER THE REMAINING {{ remaining }}</button>
      </div>
    </main>

    <aside class="tw-sticky" style="position: sticky; top: 100px; display: grid; gap: 16px;">
      <div style="border: 2px solid #1F3A38; background: #FFFDF8; box-shadow: 6px 6px 0 #1F3A38; padding: 20px 22px;">
        <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; letter-spacing: 0.08em;">[The split link]</div>
        <div style="display: flex; border: 2px solid #1F3A38; margin-top: 10px;">
          <input value="twende.to/split/afrogroove-x5" readOnly style="flex: 1; min-width: 0; border: 0; background: #EFE7D6; font-family: var(--tz-mono); font-size: 12px; padding: 10px 12px; outline: none;">
          <button onClick="{{ copyLink }}" style="border: 0; border-left: 2px solid #1F3A38; background: #D97A3B; font-family: var(--tz-mono); font-size: 11px; padding: 0 14px; cursor: pointer;">{{ copyShort }}</button>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 10px;">
          <button style="flex: 1; font-family: var(--tz-mono); font-size: 11px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 10px; cursor: pointer;">WHATSAPP</button>
          <button style="flex: 1; font-family: var(--tz-mono); font-size: 11px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 10px; cursor: pointer;">SMS</button>
        </div>
        <div style="font-size: 12px; color: #6E6155; margin-top: 10px; line-height: 1.5;">Anyone with the link claims a seat and pays their own way — no account needed.</div>
      </div>
      <div style="border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 18px 20px;">
        <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">[If the group falls short]</div>
        <div style="font-size: 13px; line-height: 1.55; margin-top: 8px; color: rgba(247,241,230,0.85);">At the 48h deadline: paid guests keep their tickets, unpaid seats release to the pool (or waitlist), and no one is charged for a seat they didn't claim. You can also cover the rest yourself anytime.</div>
      </div>
    </aside>
  </div>

</div>
`;

export default template;
