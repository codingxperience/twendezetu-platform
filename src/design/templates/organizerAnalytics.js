// Markup for the organizerAnalytics page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh;">

  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 18px 24px; border-bottom: 2px solid #1F3A38; background: #F7F1E6; position: sticky; top: 0; z-index: 40;">
    <div style="display: flex; align-items: center; gap: 20px;">
      <a href="/my-twende" style="text-decoration: none; color: #14201F; font-family: var(--tz-display); font-size: 24px; text-transform: uppercase; line-height: 0.9;">TWENDE<span style="color: #D97A3B;">ZETU</span></a>
      <span style="font-family: var(--tz-mono); font-size: 12px; background: #1F3A38; color: #F7F1E6; padding: 5px 10px;">ORGANIZER ANALYTICS</span>
    </div>
    <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
      <select style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 8px 12px; font-family: var(--tz-mono); font-size: 12px; outline: none;">
        <option>NYTC Nyama Choma Festival</option><option>Diaspora Connect Mixer</option><option>Sunday Family Picnic</option>
      </select>
      <a href="/organizer-payouts" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; color: #14201F; text-decoration: none; padding: 9px 14px;">◍ PAYOUTS</a>
      <a href="/checkin" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #D97A3B; color: #14201F; text-decoration: none; padding: 9px 14px;">▣ DOOR CHECK-IN</a>
    </div>
  </header>

  <div style="max-width: 1200px; margin: 0 auto; padding: 32px 24px 80px;">
    <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em;">[Takwimu — event performance · updated live]</div>
    <h1 style="font-family: var(--tz-display); font-size: clamp(30px, 4.5vw, 52px); text-transform: uppercase; line-height: 0.95; margin: 8px 0 24px;">Nyama Choma Festival<span style="color: #D97A3B;">.</span></h1>

    <!-- KPI tiles -->
    <div class="tw-4col" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; border: 2px solid #1F3A38; background: #1F3A38; margin-bottom: 28px;">
      <sc-for list="{{ kpis }}" as="k" hint-placeholder-count="4">
        <div style="background: {{ k.bg }}; color: {{ k.fg }}; padding: 20px 22px;">
          <div style="font-family: var(--tz-mono); font-size: 10.5px; letter-spacing: 0.06em; opacity: 0.75;">{{ k.label }}</div>
          <div style="font-family: var(--tz-display); font-size: 40px; line-height: 1; margin-top: 8px;">{{ k.value }}</div>
          <div style="font-size: 12px; margin-top: 4px; opacity: 0.8;">{{ k.sub }}</div>
        </div>
      </sc-for>
    </div>

    <div class="tw-3col" style="display: grid; grid-template-columns: 1.3fr 0.9fr; gap: 24px; align-items: start;">
      <!-- Conversion funnel -->
      <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 22px 24px;">
        <div style="font-family: var(--tz-display); font-size: 20px; text-transform: uppercase; margin-bottom: 4px;">Conversion funnel</div>
        <div style="font-size: 12.5px; color: #6E6155; margin-bottom: 18px;">How viewers become guests at the gate.</div>
        <div style="display: grid; gap: 10px;">
          <sc-for list="{{ funnel }}" as="f" hint-placeholder-count="5">
            <div>
              <div style="display: flex; justify-content: space-between; font-family: var(--tz-mono); font-size: 12px; margin-bottom: 5px;">
                <span>{{ f.label }}</span>
                <span style="color: #A85A23;">{{ f.value }} · {{ f.pct }}</span>
              </div>
              <div style="height: 26px; border: 2px solid #1F3A38; background: #EFE7D6;"><div style="height: 100%; width: {{ f.pct }}; background: {{ f.color }};"></div></div>
            </div>
          </sc-for>
        </div>
        <div style="font-size: 12px; color: #6E6155; margin-top: 16px; line-height: 1.5;">Biggest drop-off is <strong>view → RSVP</strong>. Try a stronger cover image or an early-bird nudge — organizers who add tiers see +18% RSVPs.</div>
      </div>

      <!-- Referral sources -->
      <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 22px 24px;">
        <div style="font-family: var(--tz-display); font-size: 20px; text-transform: uppercase; margin-bottom: 4px;">Where they came from</div>
        <div style="font-size: 12.5px; color: #6E6155; margin-bottom: 18px;">Shares are working — WhatsApp leads.</div>
        <div style="display: grid; gap: 12px;">
          <sc-for list="{{ sources }}" as="s" hint-placeholder-count="5">
            <div style="display: grid; grid-template-columns: 90px 1fr 40px; gap: 10px; align-items: center;">
              <span style="font-family: var(--tz-mono); font-size: 11.5px;">{{ s.label }}</span>
              <div style="height: 12px; border: 1px solid #1F3A38; background: #EFE7D6;"><div style="height: 100%; width: {{ s.pct }}; background: #D97A3B;"></div></div>
              <span style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155; text-align: right;">{{ s.pct }}</span>
            </div>
          </sc-for>
        </div>
        <div style="border-top: 1px dashed #C9BFB1; margin-top: 16px; padding-top: 14px;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23;">TOP REFERRERS</div>
          <div style="display: grid; gap: 6px; margin-top: 8px; font-size: 13px;">
            <div style="display: flex; justify-content: space-between;"><span>Amina M.</span><span style="font-family: var(--tz-mono); color: #6E6155;">31 clicks · 12 RSVP</span></div>
            <div style="display: flex; justify-content: space-between;"><span>Joel M.</span><span style="font-family: var(--tz-mono); color: #6E6155;">24 clicks · 9 RSVP</span></div>
            <div style="display: flex; justify-content: space-between;"><span>NYTC page</span><span style="font-family: var(--tz-mono); color: #6E6155;">88 clicks · 41 RSVP</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Revenue + tiers -->
    <div class="tw-3col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; align-items: start;">
      <div style="border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 22px 24px;">
        <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">[Mapato — revenue held in escrow]</div>
        <div style="font-family: var(--tz-display); font-size: 44px; line-height: 1; margin: 10px 0 2px;">$3,180</div>
        <div style="font-size: 12.5px; color: rgba(247,241,230,0.7);">from 168 paid tickets · payout after the event, minus 5% ($159) fee</div>
        <div style="display: flex; align-items: flex-end; gap: 6px; height: 70px; margin-top: 18px;">
          <sc-for list="{{ revBars }}" as="b" hint-placeholder-count="8">
            <div style="flex: 1; background: {{ b.color }}; height: {{ b.h }};"></div>
          </sc-for>
        </div>
        <div style="font-family: var(--tz-mono); font-size: 10.5px; color: rgba(247,241,230,0.55); margin-top: 8px;">DAILY SALES · LAST 8 DAYS · EARLY-BIRD SPIKE ON DAY 6</div>
      </div>

      <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 22px 24px;">
        <div style="font-family: var(--tz-display); font-size: 20px; text-transform: uppercase; margin-bottom: 14px;">Sales by tier</div>
        <div style="display: grid; gap: 12px;">
          <sc-for list="{{ tiers }}" as="t" hint-placeholder-count="3">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 13.5px; margin-bottom: 5px;">
                <span style="font-weight: 600;">{{ t.name }}</span>
                <span style="font-family: var(--tz-mono); color: #A85A23;">{{ t.sold }}/{{ t.cap }} · {{ t.rev }}</span>
              </div>
              <div style="height: 14px; border: 1px solid #1F3A38; background: #EFE7D6;"><div style="height: 100%; width: {{ t.pct }}; background: {{ t.color }};"></div></div>
            </div>
          </sc-for>
        </div>
        <div style="border: 1px dashed #A85A23; background: #FBEED8; padding: 12px 14px; margin-top: 16px; font-size: 12.5px; color: #7A3E0F; line-height: 1.5;">
          ⚡ <strong>VIP is 92% sold.</strong> Consider a waitlist or a small price bump on the last 8 seats.
        </div>
      </div>
    </div>
  </div>
</div>
`;

export default template;
