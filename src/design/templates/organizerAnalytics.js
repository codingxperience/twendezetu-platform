// Markup for the organizerAnalytics page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh;">

  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 18px 24px; border-bottom: 2px solid #1F3A38; background: #F7F1E6; position: sticky; top: 0; z-index: 40;">
    <div style="display: flex; align-items: center; gap: 20px;">
      <a href="/my-twende" class="tz-logo-link" aria-label="Twendezetu home"><img src="/brand/logo.png" alt="Twendezetu" width="1211" height="229" class="tz-logo tz-logo--md"></a>
      <span style="font-family: var(--tz-mono); font-size: 12px; background: #1F3A38; color: #F7F1E6; padding: 5px 10px;">ORGANIZER ANALYTICS</span>
    </div>
    <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
      <sc-if value="{{ hasEvent }}" hint-placeholder-val="{{ true }}">
        <select value="{{ eventSlug }}" onChange="{{ pickEvent }}" aria-label="Event" style="max-width: 280px; border: 2px solid #1F3A38; background: #FFFDF8; padding: 8px 12px; font-family: var(--tz-mono); font-size: 12px; outline: none;"><sc-for list="{{ events }}" as="ev"><option value="{{ ev.slug }}">{{ ev.label }}</option></sc-for></select>
      </sc-if>
      <a href="/organizer-payouts" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; color: #14201F; text-decoration: none; padding: 9px 14px;">◍ PAYOUTS</a>
      <sc-if value="{{ hasDoor }}" hint-placeholder-val="{{ true }}"><a href="{{ checkinHref }}" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #D97A3B; color: #14201F; text-decoration: none; padding: 9px 14px;">▣ DOOR CHECK-IN</a></sc-if>
    </div>
  </header>

  <!-- No events yet -->
  <sc-if value="{{ noEvents }}" hint-placeholder-val="{{ false }}">
    <section style="max-width: 640px; margin: 0 auto; padding: 80px 24px; text-align: center;">
      <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em;">[Takwimu]</div>
      <h1 style="font-family: var(--tz-display); font-size: clamp(30px, 5vw, 48px); text-transform: uppercase; line-height: 0.95; margin: 10px 0 12px;">Nothing to measure yet<span style="color: #D97A3B;">.</span></h1>
      <p style="font-size: 14.5px; color: #6E6155; line-height: 1.6; margin: 0 0 24px;">Post an event and this page fills in as people view it, share it, RSVP and buy tickets.</p>
      <a href="/create-event" style="display: inline-block; font-family: var(--tz-display); font-size: 16px; text-transform: uppercase; background: #D97A3B; color: #14201F; border: 2px solid #1F3A38; padding: 14px 26px; text-decoration: none; box-shadow: 4px 4px 0 #1F3A38;">Post an event →</a>
    </section>
  </sc-if>

  <sc-if value="{{ hasEvent }}" hint-placeholder-val="{{ true }}">
  <section style="max-width: 1200px; margin: 0 auto; padding: 32px 24px 80px;">
    <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em;">[Takwimu — {{ eventMeta }} · refreshes every 30 seconds]</div>
    <div style="display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; margin: 8px 0 24px;">
      <h1 style="font-family: var(--tz-display); font-size: clamp(30px, 4.5vw, 52px); text-transform: uppercase; line-height: 0.95; margin: 0;">{{ title }}<span style="color: #D97A3B;">.</span></h1>
      <div style="display: flex; gap: 14px; font-family: var(--tz-mono); font-size: 12px;">
        <a href="{{ eventHref }}" style="color: #14201F;">View page ↗</a>
        <a href="{{ editHref }}" style="color: #14201F;">Edit event</a>
      </div>
    </div>

    <!-- KPI tiles -->
    <div class="tw-4col" style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 2px; border: 2px solid #1F3A38; background: #1F3A38; margin-bottom: 28px;">
      <sc-for list="{{ kpis }}" as="k" hint-placeholder-count="4">
        <div style="background: {{ k.bg }}; color: {{ k.fg }}; padding: 20px 22px; min-width: 0;">
          <div style="font-family: var(--tz-mono); font-size: 10.5px; letter-spacing: 0.06em; opacity: 0.75;">{{ k.label }}</div>
          <div style="font-family: var(--tz-display); font-size: clamp(28px, 3.4vw, 40px); line-height: 1; margin-top: 8px; overflow-wrap: anywhere;">{{ k.value }}</div>
          <div style="font-size: 12px; margin-top: 4px; opacity: 0.8;">{{ k.sub }}</div>
        </div>
      </sc-for>
    </div>

    <div class="tw-3col" style="display: grid; grid-template-columns: 1.3fr 0.9fr; gap: 24px; align-items: start;">
      <!-- Funnel -->
      <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 22px 24px;">
        <div style="font-family: var(--tz-display); font-size: 20px; text-transform: uppercase; margin-bottom: 4px;">From view to guest</div>
        <div style="font-size: 12.5px; color: #6E6155; margin-bottom: 18px;">Each step as a share of everyone who viewed the event.</div>
        <div style="display: grid; gap: 10px;">
          <sc-for list="{{ funnel }}" as="f" hint-placeholder-count="4">
            <div>
              <div style="display: flex; justify-content: space-between; gap: 10px; font-family: var(--tz-mono); font-size: 12px; margin-bottom: 5px;">
                <span>{{ f.label }}</span>
                <span style="color: #A85A23;">{{ f.value }} · {{ f.pct }}</span>
              </div>
              <div style="height: 26px; border: 2px solid #1F3A38; background: #EFE7D6;"><div style="height: 100%; width: {{ f.pct }}; background: {{ f.color }};"></div></div>
            </div>
          </sc-for>
        </div>
        <div style="font-size: 12.5px; color: #3A2F25; margin-top: 16px; line-height: 1.55; border-left: 3px solid #D97A3B; padding-left: 12px;">{{ funnelNote }}</div>
      </div>

      <!-- Sources and referrers -->
      <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 22px 24px;">
        <div style="font-family: var(--tz-display); font-size: 20px; text-transform: uppercase; margin-bottom: 4px;">Where they came from</div>
        <div style="font-size: 12.5px; color: #6E6155; margin-bottom: 18px;">Views by the link or app they opened it from.</div>
        <sc-if value="{{ noSources }}" hint-placeholder-val="{{ false }}">
          <div style="font-size: 13px; color: #6E6155; line-height: 1.55;">No views yet. Share the event link and sources appear here.</div>
        </sc-if>
        <div style="display: grid; gap: 12px;">
          <sc-for list="{{ sources }}" as="s" hint-placeholder-count="4">
            <div style="display: grid; grid-template-columns: 96px 1fr 44px; gap: 10px; align-items: center;" title="{{ s.views }} views">
              <span style="font-family: var(--tz-mono); font-size: 11.5px;">{{ s.label }}</span>
              <div style="height: 12px; border: 1px solid #1F3A38; background: #EFE7D6;"><div style="height: 100%; width: {{ s.pct }}; background: #D97A3B;"></div></div>
              <span style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155; text-align: right;">{{ s.pct }}</span>
            </div>
          </sc-for>
        </div>
        <div style="border-top: 1px dashed #C9BFB1; margin-top: 16px; padding-top: 14px;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23;">MEMBERS WHO BROUGHT GUESTS</div>
          <sc-if value="{{ hasReferrers }}" hint-placeholder-val="{{ true }}">
            <div style="display: grid; gap: 6px; margin-top: 8px; font-size: 13px;">
              <sc-for list="{{ referrers }}" as="r" hint-placeholder-count="3">
                <div style="display: flex; justify-content: space-between; gap: 10px;"><span>{{ r.name }}</span><span style="font-family: var(--tz-mono); font-size: 12px; color: #6E6155;">{{ r.brought }}</span></div>
              </sc-for>
            </div>
          </sc-if>
          <sc-if value="{{ noReferrers }}" hint-placeholder-val="{{ false }}">
            <div style="font-size: 12.5px; color: #6E6155; margin-top: 8px; line-height: 1.5;">When a member shares their personal link and a guest comes through it, they are credited here.</div>
          </sc-if>
        </div>
      </div>
    </div>

    <!-- Sales and tiers: ticketed events only -->
    <sc-if value="{{ isPaid }}" hint-placeholder-val="{{ true }}">
    <div class="tw-3col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; align-items: start;">
      <div style="border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 22px 24px;">
        <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">[Mapato — ticket sales, last 8 days]</div>
        <div style="font-family: var(--tz-display); font-size: 44px; line-height: 1; margin: 10px 0 2px;">{{ weekSales }}</div>
        <div style="font-size: 12.5px; color: rgba(247,241,230,0.75); line-height: 1.5;">{{ salesTerms }}</div>
        <div style="display: flex; align-items: flex-end; gap: 6px; height: 70px; margin-top: 18px;">
          <sc-for list="{{ salesBars }}" as="b" hint-placeholder-count="8">
            <div title="{{ b.title }}" style="flex: 1; background: {{ b.color }}; height: {{ b.h }};"></div>
          </sc-for>
        </div>
        <div style="display: flex; gap: 6px; margin-top: 6px;">
          <sc-for list="{{ salesBars }}" as="b" hint-placeholder-count="8"><span style="flex: 1; text-align: center; font-family: var(--tz-mono); font-size: 10px; color: rgba(247,241,230,0.55);">{{ b.label }}</span></sc-for>
        </div>
        <div style="font-family: var(--tz-mono); font-size: 10.5px; color: rgba(247,241,230,0.55); margin-top: 8px;">{{ salesPeak }}</div>
      </div>

      <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 22px 24px;">
        <div style="font-family: var(--tz-display); font-size: 20px; text-transform: uppercase; margin-bottom: 14px;">Sales by tier</div>
        <div style="display: grid; gap: 12px;">
          <sc-for list="{{ tiers }}" as="t" hint-placeholder-count="3">
            <div>
              <div style="display: flex; justify-content: space-between; gap: 10px; font-size: 13.5px; margin-bottom: 5px;">
                <span style="font-weight: 600;">{{ t.name }}</span>
                <span style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23;">{{ t.sold }}/{{ t.cap }} · {{ t.rev }}</span>
              </div>
              <div style="height: 14px; border: 1px solid #1F3A38; background: #EFE7D6;"><div style="height: 100%; width: {{ t.pct }}; background: {{ t.color }};"></div></div>
            </div>
          </sc-for>
        </div>
        <sc-if value="{{ tierNote }}" hint-placeholder-val="{{ true }}">
          <div style="border: 1px dashed #A85A23; background: #FBEED8; padding: 12px 14px; margin-top: 16px; font-size: 12.5px; color: #7A3E0F; line-height: 1.5;">⚡ {{ tierNote }}</div>
        </sc-if>
      </div>
    </div>
    </sc-if>
  </section>
  </sc-if>
</div>
`;

export default template;
