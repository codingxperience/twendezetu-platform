// Markup for the referralRewards page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh;">

  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 18px 24px; border-bottom: 2px solid #1F3A38; background: #F7F1E6; position: sticky; top: 0; z-index: 40;">
    <div style="display: flex; align-items: center; gap: 20px;">
      <a href="/my-twende" class="tz-logo-link" aria-label="Twendezetu home"><img src="/brand/logo.png" alt="Twendezetu" width="1211" height="229" class="tz-logo tz-logo--md"></a>
      <span style="font-family: var(--tz-mono); font-size: 12px; background: #820101; color: #F7F1E6; border: 2px solid #1F3A38; padding: 4px 10px;">REFERRAL REWARDS</span>
    </div>
    <a href="/my-twende" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; color: #14201F; text-decoration: none; padding: 10px 16px;">← MY TWENDE</a>
  </header>

  <section style="max-width: 1120px; margin: 0 auto; padding: 32px 24px 80px;">
    <div style="font-family: var(--tz-mono); font-size: 12px; color: #820101; letter-spacing: 0.08em;">[Alika, pata zawadi — invite &amp; earn]</div>
    <h1 style="font-family: var(--tz-display); font-size: clamp(32px, 5vw, 60px); text-transform: uppercase; line-height: 0.94; margin: 8px 0 6px;">Share Twende<span style="color: #820101;">.</span> Earn points<span style="color: #820101;">.</span></h1>
    <p style="font-size: 15px; color: #3A2F25; line-height: 1.55; max-width: 580px; margin: 0 0 26px;">Friends who join from your link earn you Twende Points as they get going: points you can spend on tickets and vendors, or send to family. There is no cap.</p>

    <div class="tw-2col" style="display: grid; grid-template-columns: 0.95fr 1.25fr; gap: 24px; align-items: start;">
      <div style="display: grid; gap: 16px;">
        <!-- Earned and the link -->
        <div style="border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 24px; box-shadow: 6px 6px 0 #E9B4AC;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #E9B4AC; letter-spacing: 0.08em;">[Earned so far]</div>
          <div style="font-family: var(--tz-display); font-size: 52px; line-height: 1; margin: 10px 0 2px;">{{ earned }} <span style="font-size: 20px; color: #E9B4AC;">PTS</span></div>
          <div style="font-family: var(--tz-mono); font-size: 12px; color: rgba(247,241,230,0.7);">{{ earnedNote }}</div>
          <div style="display: flex; border: 2px solid #F7F1E6; margin-top: 16px;">
            <input value="{{ link }}" readonly aria-label="Your invite link" style="flex: 1; min-width: 0; border: 0; background: rgba(247,241,230,0.1); color: #F7F1E6; font-family: var(--tz-mono); font-size: 12px; padding: 10px 12px; outline: none;">
            <button onClick="{{ copyLink }}" style="border: 0; border-left: 2px solid #F7F1E6; background: #820101; color: #F7F1E6; font-family: var(--tz-mono); font-size: 11px; padding: 0 14px; cursor: pointer; white-space: nowrap;">{{ copyLabel }}</button>
          </div>
          <div style="display: flex; gap: 8px; margin-top: 10px;">
            <a href="{{ waHref }}" target="_blank" rel="noopener" style="flex: 1; text-align: center; font-family: var(--tz-mono); font-size: 11px; border: 2px solid #F7F1E6; color: #F7F1E6; text-decoration: none; padding: 10px;">WHATSAPP</a>
            <a href="{{ fbHref }}" target="_blank" rel="noopener" style="flex: 1; text-align: center; font-family: var(--tz-mono); font-size: 11px; border: 2px solid #F7F1E6; color: #F7F1E6; text-decoration: none; padding: 10px;">FACEBOOK</a>
            <a href="{{ smsHref }}" style="flex: 1; text-align: center; font-family: var(--tz-mono); font-size: 11px; border: 2px solid #F7F1E6; color: #F7F1E6; text-decoration: none; padding: 10px;">SMS</a>
          </div>
        </div>

        <!-- How you earn -->
        <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 20px 22px;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #820101; letter-spacing: 0.08em;">[How you earn, per friend]</div>
          <div style="display: grid; gap: 12px; margin-top: 12px;">
            <sc-for list="{{ rules }}" as="r" hint-placeholder-count="4">
              <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 12px; align-items: center;">
                <span style="font-size: 17px;" aria-hidden="true">{{ r.icon }}</span>
                <span style="font-size: 13.5px; line-height: 1.4;">{{ r.label }}</span>
                <span style="font-family: var(--tz-display); font-size: 16px; color: #820101; white-space: nowrap;">{{ r.pts }}</span>
              </div>
            </sc-for>
          </div>
          <div style="font-size: 11.5px; color: #6E6155; margin-top: 12px; line-height: 1.5;">{{ multiplierNote }} Each step pays once per friend, starting when they verify a phone number (one account per number). Anything they did before that is paid then.</div>
        </div>
      </div>

      <div>
        <!-- Tiers -->
        <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 20px 22px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 10px; margin-bottom: 6px;">
            <span style="font-family: var(--tz-display); font-size: 19px; text-transform: uppercase;">Milestones</span>
            <span style="font-family: var(--tz-mono); font-size: 11px; color: #820101;">{{ milestoneLabel }}</span>
          </div>
          <div style="height: 14px; border: 2px solid #1F3A38; background: #EFE7D6; margin-bottom: 16px;"><div style="height: 100%; width: {{ progressWidth }}; background: #820101; color: #F7F1E6;"></div></div>
          <div class="tw-3col" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px;">
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

        <!-- Friends -->
        <div style="border: 2px solid #1F3A38; background: #FFFDF8;">
          <div style="padding: 14px 20px; border-bottom: 2px solid #1F3A38; font-family: var(--tz-display); font-size: 19px; text-transform: uppercase;">Your friends</div>
          <sc-if value="{{ noFriends }}" hint-placeholder-val="{{ false }}">
            <div style="padding: 18px 20px; font-size: 13.5px; color: #6E6155; line-height: 1.55;">No one yet. Your link works anywhere; a family WhatsApp group is a good place to start.</div>
          </sc-if>
          <sc-for list="{{ friends }}" as="f" hint-placeholder-count="5">
            <div style="display: grid; grid-template-columns: 36px 1fr auto; gap: 12px; align-items: center; padding: 13px 20px; border-bottom: 1px solid #E3D9C6;">
              <span style="width: 34px; height: 34px; border: 2px solid #1F3A38; background: {{ f.avBg }}; color: {{ f.avFg }}; font-family: var(--tz-display); font-size: 14px; display: flex; align-items: center; justify-content: center;">{{ f.init }}</span>
              <div style="min-width: 0;">
                <div style="font-weight: 700; font-size: 13.5px;">{{ f.name }}</div>
                <div style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">{{ f.action }}</div>
              </div>
              <span style="font-family: var(--tz-display); font-size: 15px; color: {{ f.color }};">{{ f.pts }}</span>
            </div>
          </sc-for>
          <sc-if value="{{ hasWaiting }}" hint-placeholder-val="{{ false }}">
            <div style="padding: 12px 20px; font-family: var(--tz-mono); font-size: 11px; color: #6E6155; line-height: 1.5;">{{ waitingNote }}</div>
          </sc-if>
        </div>
      </div>
    </div>
  </section>

</div>
`;

export default template;
