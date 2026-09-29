// Markup for the splitPay page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh;">

  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 18px 24px; border-bottom: 2px solid #1F3A38; background: #F7F1E6; position: sticky; top: 0; z-index: 40;">
    <div style="display: flex; align-items: center; gap: 20px;">
      <a href="/" class="tz-logo-link" aria-label="Twendezetu home"><img src="/brand/logo.png" alt="Twendezetu" width="1211" height="229" class="tz-logo tz-logo--md"></a>
      <span style="font-family: var(--tz-mono); font-size: 12px; background: #1F3A38; color: #F7F1E6; padding: 5px 10px;">GROUP SPLIT-PAY</span>
    </div>
    <a href="{{ me.accountHref }}" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; color: #14201F; text-decoration: none; padding: 10px 16px;">{{ me.accountLabel }}</a>
  </header>

  <!-- Your splits -->
  <sc-if value="{{ listing }}" hint-placeholder-val="{{ false }}">
    <section style="max-width: 760px; margin: 0 auto; padding: 40px 24px 80px;">
      <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em;">[Lipa pamoja]</div>
      <h1 style="font-family: var(--tz-display); font-size: clamp(30px, 4.5vw, 48px); text-transform: uppercase; line-height: 0.95; margin: 8px 0 18px;">Your group splits<span style="color: #D97A3B;">.</span></h1>
      <sc-if value="{{ noSplits }}" hint-placeholder-val="{{ false }}">
        <div style="border: 2px dashed #A85A23; background: #FFFDF8; padding: 20px 22px; font-size: 14px; color: #3A2F25; line-height: 1.6;">No splits yet. At checkout on any ticketed event, turn on <strong>Buying for a group</strong>, name your guests and choose <strong>Split-pay link</strong>: seats are held and everyone pays their own share.</div>
      </sc-if>
      <div style="display: grid; gap: 10px;">
        <sc-for list="{{ splits }}" as="sp" hint-placeholder-count="2">
          <a href="{{ sp.href }}" style="display: flex; justify-content: space-between; gap: 12px; border: 2px solid #1F3A38; background: #FFFDF8; color: #14201F; text-decoration: none; padding: 14px 18px;">
            <span style="font-family: var(--tz-display); font-size: 16px; text-transform: uppercase;">{{ sp.title }}</span>
            <span style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">{{ sp.progress }}</span>
          </a>
        </sc-for>
      </div>
    </section>
  </sc-if>

  <!-- One split -->
  <sc-if value="{{ viewing }}" hint-placeholder-val="{{ true }}">
  <div class="tw-2col" style="max-width: 1140px; margin: 0 auto; padding: 32px 24px 80px; display: grid; grid-template-columns: 1.4fr 0.85fr; gap: 44px; align-items: start;">

    <section>
      <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em;">[Lipa pamoja — one group, split the bill]</div>
      <h1 style="font-family: var(--tz-display); font-size: clamp(30px, 4.5vw, 52px); text-transform: uppercase; line-height: 0.95; margin: 8px 0 6px;">{{ title }}<span style="color: #D97A3B;">.</span></h1>
      <p style="font-size: 14px; color: #6E6155; line-height: 1.55; max-width: 560px; margin: 0 0 22px;">{{ intro }} {{ holdNote }} <a href="{{ eventHref }}" style="color: #A85A23;">Event details</a></p>

      <sc-if value="{{ closed }}" hint-placeholder-val="{{ false }}">
        <div role="status" style="border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 14px 18px; margin-bottom: 16px; font-size: 13.5px; line-height: 1.5;">{{ statusNote }}</div>
      </sc-if>

      <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 18px 20px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 10px; font-family: var(--tz-mono); font-size: 12px; margin-bottom: 8px;">
          <span style="color: #A85A23;">{{ progressLabel }}</span>
          <span style="color: #6E6155;">{{ countdown }}</span>
        </div>
        <div style="height: 18px; border: 2px solid #1F3A38; background: #EFE7D6;"><div style="height: 100%; width: {{ pct }}; background: #D97A3B; transition: width 300ms;"></div></div>
      </div>

      <div style="display: grid; gap: 10px;">
        <sc-for list="{{ guests }}" as="g" hint-placeholder-count="5">
          <div style="border: 2px solid #1F3A38; background: {{ g.bg }};">
            <div style="padding: 14px 18px; display: grid; grid-template-columns: 40px 1fr auto; gap: 14px; align-items: center;">
              <span style="width: 34px; height: 34px; border: 2px solid #1F3A38; background: {{ g.avBg }}; color: {{ g.avFg }}; font-family: var(--tz-display); font-size: 15px; display: flex; align-items: center; justify-content: center;">{{ g.init }}</span>
              <div style="min-width: 0;">
                <div style="font-weight: 700; font-size: 14.5px;">{{ g.name }}</div>
                <div style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">{{ g.meta }}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-family: var(--tz-display); font-size: 17px; color: #A85A23;">{{ g.share }}</div>
                <sc-if value="{{ g.paid }}" hint-placeholder-val="{{ false }}">
                  <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #3E5234; margin-top: 4px;">✓ PAID</div>
                </sc-if>
                <div style="display: flex; gap: 6px; justify-content: flex-end; margin-top: 4px; flex-wrap: wrap;">
                  <sc-if value="{{ g.canRemind }}" hint-placeholder-val="{{ false }}">
                    <button onClick="{{ g.remind }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 5px 10px; cursor: pointer;">{{ g.remindLabel }}</button>
                  </sc-if>
                  <sc-if value="{{ g.showPay }}" hint-placeholder-val="{{ false }}">
                    <button onClick="{{ g.pick }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 2px solid #1F3A38; background: #D97A3B; color: #14201F; padding: 5px 10px; cursor: pointer;">{{ g.payLabel }}</button>
                  </sc-if>
                </div>
              </div>
            </div>
            <sc-if value="{{ g.choosing }}" hint-placeholder-val="{{ false }}">
              <div style="border-top: 2px solid #1F3A38; background: #F7F1E6; padding: 14px 18px; display: grid; gap: 10px;">
                <sc-if value="{{ g.needsEmail }}" hint-placeholder-val="{{ false }}">
                  <input type="email" value="{{ g.email }}" onChange="{{ g.setEmail }}" autocomplete="email" aria-label="Your email for the QR ticket" placeholder="Your email, for the QR ticket" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 11px 13px; font-family: var(--tz-sans); font-size: 14px; outline: none;">
                </sc-if>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <sc-if value="{{ g.canPoints }}" hint-placeholder-val="{{ true }}">
                    <button onClick="{{ g.payPoints }}" style="font-family: var(--tz-display); font-size: 14px; text-transform: uppercase; background: #1F3A38; color: #F7F1E6; border: 2px solid #1F3A38; padding: 11px 18px; cursor: pointer;">Pay with points</button>
                  </sc-if>
                  <button onClick="{{ g.payCard }}" style="font-family: var(--tz-display); font-size: 14px; text-transform: uppercase; background: #D97A3B; color: #14201F; border: 2px solid #1F3A38; padding: 11px 18px; cursor: pointer;">Pay by card</button>
                  <button onClick="{{ g.cancelPay }}" style="font-family: var(--tz-mono); font-size: 11px; background: none; border: 0; color: #6E6155; cursor: pointer; text-decoration: underline;">Cancel</button>
                </div>
              </div>
            </sc-if>
          </div>
        </sc-for>
      </div>

      <div style="display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap;">
        <sc-if value="{{ isOpen }}" hint-placeholder-val="{{ true }}">
          <button onClick="{{ copyLink }}" style="font-family: var(--tz-display); font-size: 14px; text-transform: uppercase; background: #1F3A38; color: #F7F1E6; border: 2px solid #1F3A38; padding: 12px 22px; cursor: pointer;">{{ copyLabel }}</button>
        </sc-if>
        <sc-if value="{{ hasMyShare }}" hint-placeholder-val="{{ false }}">
          <button onClick="{{ payMine }}" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #D97A3B; color: #14201F; padding: 12px 18px; cursor: pointer;">PAY MY SHARE NOW</button>
        </sc-if>
        <sc-if value="{{ canCover }}" hint-placeholder-val="{{ false }}">
          <button onClick="{{ coverAll }}" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 12px 18px; cursor: pointer;">{{ coverLabel }}</button>
        </sc-if>
      </div>
    </section>

    <aside class="tw-sticky" style="position: sticky; top: 100px; display: grid; gap: 16px;">
      <div style="border: 2px solid #1F3A38; background: #FFFDF8; box-shadow: 6px 6px 0 #1F3A38; padding: 20px 22px;">
        <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; letter-spacing: 0.08em;">[The split link]</div>
        <div style="display: flex; border: 2px solid #1F3A38; margin-top: 10px;">
          <input value="{{ link }}" readonly aria-label="Split link" style="flex: 1; min-width: 0; border: 0; background: #EFE7D6; font-family: var(--tz-mono); font-size: 12px; padding: 10px 12px; outline: none;">
          <button onClick="{{ copyLink }}" style="border: 0; border-left: 2px solid #1F3A38; background: #D97A3B; font-family: var(--tz-mono); font-size: 11px; padding: 0 14px; cursor: pointer;">{{ copyShort }}</button>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 10px;">
          <a href="{{ waHref }}" target="_blank" rel="noopener" style="flex: 1; text-align: center; font-family: var(--tz-mono); font-size: 11px; border: 2px solid #1F3A38; background: #F7F1E6; color: #14201F; text-decoration: none; padding: 10px;">WHATSAPP</a>
          <a href="{{ smsHref }}" style="flex: 1; text-align: center; font-family: var(--tz-mono); font-size: 11px; border: 2px solid #1F3A38; background: #F7F1E6; color: #14201F; text-decoration: none; padding: 10px;">SMS</a>
        </div>
        <div style="font-size: 12px; color: #6E6155; margin-top: 10px; line-height: 1.5;">Anyone with the link can pay a seat by card, no account needed. Members can also pay with points.</div>
      </div>
      <div style="border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 18px 20px;">
        <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">[If the group falls short]</div>
        <div style="font-size: 13px; line-height: 1.55; margin-top: 8px; color: rgba(247,241,230,0.85);">When the hold ends, everyone who paid keeps their ticket, unpaid seats go back on sale (the waitlist hears first), and nobody is charged for a seat they did not pay. The person who started the split can cover the rest with points at any time.</div>
      </div>
    </aside>
  </div>
  </sc-if>

</div>
`;

export default template;
