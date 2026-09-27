// Markup for the referralRewards page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh;">

  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 18px 24px; border-bottom: 2px solid #1F3A38; background: #F7F1E6; position: sticky; top: 0; z-index: 40;">
    <div style="display: flex; align-items: center; gap: 20px;">
      <a href="/my-twende" style="text-decoration: none; color: #14201F; font-family: var(--tz-display); font-size: 24px; text-transform: uppercase; line-height: 0.9;">TWENDE<span style="color: #D97A3B;">ZETU</span></a>
      <span style="font-family: var(--tz-mono); font-size: 12px; background: #D97A3B; color: #14201F; border: 2px solid #1F3A38; padding: 4px 10px;">REFERRAL REWARDS</span>
    </div>
    <a href="/my-twende" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; color: #14201F; text-decoration: none; padding: 10px 16px;">← MY TWENDE</a>
  </header>

  <div style="max-width: 1120px; margin: 0 auto; padding: 32px 24px 80px;">
    <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em;">[Alika, pata zawadi — invite &amp; earn]</div>
    <h1 style="font-family: var(--tz-display); font-size: clamp(32px, 5vw, 60px); text-transform: uppercase; line-height: 0.94; margin: 8px 0 6px;">Share Twende<span style="color: #D97A3B;">.</span> Earn points<span style="color: #D97A3B;">.</span></h1>
    <p style="font-size: 15px; color: #3A2F25; line-height: 1.55; max-width: 580px; margin: 0 0 26px;">Every friend who joins from your link and does something real earns you Twende Points — spendable on tickets, providers, or sent to family. No cap.</p>

    <div class="tw-2col" style="display: grid; grid-template-columns: 0.95fr 1.25fr; gap: 24px; align-items: start;">
      <!-- Earnings + link -->
      <div style="display: grid; gap: 16px;">
        <div style="border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 24px; box-shadow: 6px 6px 0 #D97A3B;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">[Earned so far]</div>
          <div style="font-family: var(--tz-display); font-size: 52px; line-height: 1; margin: 10px 0 2px;">1,150 <span style="font-size: 20px; color: #D97A3B;">PTS</span></div>
          <div style="font-family: var(--tz-mono); font-size: 12px; color: rgba(247,241,230,0.7);">≈ $11.50 · from 7 friends</div>
          <div style="display: flex; border: 2px solid #F7F1E6; margin-top: 16px;">
            <input value="twende.to/r/amina" readOnly style="flex: 1; min-width: 0; border: 0; background: rgba(247,241,230,0.1); color: #F7F1E6; font-family: var(--tz-mono); font-size: 12px; padding: 10px 12px; outline: none;">
            <button onClick="{{ copyLink }}" style="border: 0; border-left: 2px solid #F7F1E6; background: #D97A3B; color: #14201F; font-family: var(--tz-mono); font-size: 11px; padding: 0 14px; cursor: pointer;">{{ copyLabel }}</button>
          </div>
          <div style="display: flex; gap: 8px; margin-top: 10px;">
            <button style="flex: 1; font-family: var(--tz-mono); font-size: 11px; border: 2px solid #F7F1E6; background: none; color: #F7F1E6; padding: 10px; cursor: pointer;">WHATSAPP</button>
            <button style="flex: 1; font-family: var(--tz-mono); font-size: 11px; border: 2px solid #F7F1E6; background: none; color: #F7F1E6; padding: 10px; cursor: pointer;">FACEBOOK</button>
            <button style="flex: 1; font-family: var(--tz-mono); font-size: 11px; border: 2px solid #F7F1E6; background: none; color: #F7F1E6; padding: 10px; cursor: pointer;">SMS</button>
          </div>
        </div>

        <!-- How you earn -->
        <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 20px 22px;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; letter-spacing: 0.08em;">[How you earn]</div>
          <div style="display: grid; gap: 12px; margin-top: 12px;">
            <sc-for list="{{ rules }}" as="r" hint-placeholder-count="4">
              <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 12px; align-items: center;">
                <span style="font-size: 17px;">{{ r.icon }}</span>
                <span style="font-size: 13.5px; line-height: 1.4;">{{ r.label }}</span>
                <span style="font-family: var(--tz-display); font-size: 16px; color: #A85A23; white-space: nowrap;">{{ r.pts }}</span>
              </div>
            </sc-for>
          </div>
          <div style="font-size: 11.5px; color: #6E6155; margin-top: 12px; line-height: 1.5;">Points are anti-fraud checked — self-referrals and dormant sign-ups don't count.</div>
        </div>
      </div>

      <!-- Tiers + invited friends -->
      <div>
        <!-- Milestone tiers -->
        <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 20px 22px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
            <span style="font-family: var(--tz-display); font-size: 19px; text-transform: uppercase;">Milestones</span>
            <span style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23;">7 / 10 to CONNECTOR</span>
          </div>
          <div style="height: 14px; border: 2px solid #1F3A38; background: #EFE7D6; margin-bottom: 16px;"><div style="height: 100%; width: 70%; background: #D97A3B;"></div></div>
          <div class="tw-3col" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
            <sc-for list="{{ tiers }}" as="t" hint-placeholder-count="3">
              <div style="border: 2px solid #1F3A38; background: {{ t.bg }}; color: {{ t.fg }}; padding: 14px; text-align: center;">
                <div style="font-family: var(--tz-display); font-size: 15px; text-transform: uppercase;">{{ t.name }}</div>
                <div style="font-family: var(--tz-mono); font-size: 10.5px; margin: 4px 0; opacity: 0.85;">{{ t.need }}</div>
                <div style="font-size: 12px; opacity: 0.9;">{{ t.perk }}</div>
                <div style="font-family: var(--tz-mono); font-size: 10px; margin-top: 6px; color: {{ t.badgeColor }};">{{ t.badge }}</div>
              </div>
            </sc-for>
          </div>
        </div>

        <!-- Invited friends -->
        <div style="border: 2px solid #1F3A38; background: #FFFDF8;">
          <div style="padding: 14px 20px; border-bottom: 2px solid #1F3A38; font-family: var(--tz-display); font-size: 19px; text-transform: uppercase;">Your invites</div>
          <sc-for list="{{ friends }}" as="f" hint-placeholder-count="5">
            <div style="display: grid; grid-template-columns: 36px 1fr auto; gap: 12px; align-items: center; padding: 13px 20px; border-bottom: 1px solid #E3D9C6;">
              <span style="width: 34px; height: 34px; border: 2px solid #1F3A38; background: {{ f.avBg }}; color: {{ f.avFg }}; font-family: var(--tz-display); font-size: 14px; display: flex; align-items: center; justify-content: center;">{{ f.init }}</span>
              <div>
                <div style="font-weight: 700; font-size: 13.5px;">{{ f.name }}</div>
                <div style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">{{ f.action }}</div>
              </div>
              <span style="font-family: var(--tz-display); font-size: 15px; color: {{ f.color }};">{{ f.pts }}</span>
            </div>
          </sc-for>
          <div style="padding: 12px 20px; font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">3 more invited, not yet active — no points until they do something real.</div>
        </div>
      </div>
    </div>
  </div>

</div>
`;

export default template;
