// Markup for the finance page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #14201F; color: #F7F1E6; min-height: 100vh;">

  <!-- Top bar -->
  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 16px 24px; border-bottom: 2px solid #F7F1E6; background: #14201F; position: sticky; top: 0; z-index: 40;">
    <div style="display: flex; align-items: center; gap: 20px;">
      <a href="/" style="text-decoration: none; color: #F7F1E6; font-family: var(--tz-display); font-size: 24px; text-transform: uppercase; line-height: 0.9;">TWENDE<br><span style="color: #D97A3B;">ZETU</span></a>
      <span style="font-family: var(--tz-mono); font-size: 12px; background: #7B8B6E; color: #14201F; padding: 5px 10px;">FINANCE CONSOLE</span>
    </div>
    <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
      <a href="/admin" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #F7F1E6; color: #F7F1E6; text-decoration: none; padding: 9px 14px;">⚙ ADMIN →</a>
      <button onClick="{{ exportCsv }}" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #D97A3B; background: #D97A3B; color: #14201F; padding: 9px 14px; cursor: pointer;">↓ EXPORT CSV</button>
      <button onClick="{{ toggleFinMenu }}" style="width: 38px; height: 38px; background: #7B8B6E; color: #14201F; border: 2px solid #F7F1E6; font-family: var(--tz-display); font-size: 15px; display: flex; align-items: center; justify-content: center; cursor: pointer;">NK</button>
      <sc-if value="{{ finMenuOpen }}" hint-placeholder-val="{{ false }}">
        <div style="position: absolute; top: 62px; right: 24px; width: 280px; background: #1F3A38; border: 2px solid #F7F1E6; box-shadow: 6px 6px 0 rgba(0,0,0,0.4); z-index: 60;">
          <div style="padding: 14px 18px; border-bottom: 2px solid #F7F1E6;">
            <div style="font-weight: 700; font-size: 14.5px;">Neema K.</div>
            <div style="font-family: var(--tz-mono); font-size: 10.5px; color: rgba(247,241,230,0.6); margin-top: 2px;">FINANCE LEAD · 2FA ON · DUAL-APPROVAL RIGHTS</div>
          </div>
          <button onClick="{{ finSettings }}" style="display: block; width: 100%; text-align: left; background: none; border: 0; border-bottom: 1px solid rgba(247,241,230,0.15); padding: 12px 18px; font-family: var(--tz-sans); font-size: 14px; color: #F7F1E6; cursor: pointer;">⚙ &nbsp;Finance settings &amp; approval limits</button>
          <a href="/admin" style="display: block; text-decoration: none; color: #F7F1E6; border-bottom: 1px solid rgba(247,241,230,0.15); padding: 12px 18px; font-size: 14px;">▣ &nbsp;Admin console</a>
          <a href="/sign-in" style="display: block; text-decoration: none; color: #E8A472; padding: 12px 18px; font-size: 14px; font-weight: 600;">→ &nbsp;Sign out</a>
        </div>
      </sc-if>
    </div>
  </header>

  <!-- Finance nav -->
  <nav style="display: flex; gap: 4px; align-items: center; padding: 10px 20px; border-bottom: 2px solid #F7F1E6; background: #1F3A38; overflow-x: auto; position: sticky; top: 76px; z-index: 30;">
    <sc-for list="{{ finNav }}" as="n" hint-placeholder-count="5">
      <button onClick="{{ n.go }}" style="display: flex; align-items: center; gap: 8px; background: {{ n.bg }}; color: {{ n.fg }}; border: 0; font-family: var(--tz-mono); font-size: 12px; padding: 9px 14px; white-space: nowrap; cursor: pointer;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="{{ n.iconPath }}"></path></svg>
        <span>{{ n.label }}</span>
      </button>
    </sc-for>
  </nav>

  <div style="max-width: 1320px; margin: 0 auto; padding: 36px 24px 80px;">
    <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 12px;">
      <h1 style="font-family: var(--tz-display); font-size: clamp(32px, 4.5vw, 56px); text-transform: uppercase; margin: 0;">Revenue &amp; money movement<span style="color: #D97A3B;">.</span></h1>
      <div style="display: flex; gap: 6px;">
        <sc-for list="{{ ranges }}" as="r" hint-placeholder-count="3">
          <button onClick="{{ r.pick }}" style="font-family: var(--tz-mono); font-size: 11.5px; border: 2px solid #F7F1E6; background: {{ r.bg }}; color: {{ r.fg }}; padding: 8px 14px; cursor: pointer;">{{ r.label }}</button>
        </sc-for>
      </div>
    </div>

    <!-- Revenue KPIs -->
    <div class="tw-4col" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; border: 2px solid #F7F1E6; background: #F7F1E6; margin: 24px 0 32px;">
      <sc-for list="{{ kpis }}" as="k" hint-placeholder-count="4">
        <div style="background: {{ k.bg }}; color: {{ k.fg }}; padding: 20px 22px;">
          <div style="font-family: var(--tz-mono); font-size: 10.5px; letter-spacing: 0.08em; opacity: 0.75;">{{ k.label }}</div>
          <div style="font-family: var(--tz-display); font-size: 36px; line-height: 1; margin-top: 8px;">{{ k.big }}</div>
          <div style="font-size: 12px; margin-top: 5px; opacity: 0.8;">{{ k.sub }}</div>
        </div>
      </sc-for>
    </div>

    <div class="tw-2col" style="display: grid; grid-template-columns: 1.4fr 0.9fr; gap: 32px; align-items: start;">

      <!-- Left column -->
      <div style="display: grid; gap: 32px;">

        <!-- Revenue mix chart -->
        <div style="border: 2px solid #F7F1E6; background: #1F3A38; padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px;">
            <div style="font-family: var(--tz-display); font-size: 20px; text-transform: uppercase;">Revenue by stream</div>
            <span style="font-family: var(--tz-mono); font-size: 11px; color: rgba(247,241,230,0.6);">{{ rangeLabel }} · USD EQUIVALENT</span>
          </div>
          <div style="display: grid; gap: 14px; margin-top: 20px;">
            <sc-for list="{{ streams }}" as="st" hint-placeholder-count="4">
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
                  <span>{{ st.label }}</span>
                  <span style="font-family: var(--tz-mono); color: #E8A472;">{{ st.amount }} · {{ st.pct }}</span>
                </div>
                <div style="height: 16px; border: 2px solid #F7F1E6; background: rgba(247,241,230,0.08);">
                  <div style="height: 100%; width: {{ st.pct }}; background: {{ st.color }}; transition: width 300ms ease;"></div>
                </div>
              </div>
            </sc-for>
          </div>
        </div>

        <!-- Transactions ledger -->
        <div style="border: 2px solid #F7F1E6;">
          <div style="display: flex; justify-content: space-between; align-items: center; background: #F7F1E6; color: #14201F; padding: 12px 18px; flex-wrap: wrap; gap: 8px;">
            <span style="font-family: var(--tz-display); font-size: 17px; text-transform: uppercase;">Transaction ledger</span>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <sc-for list="{{ ledgerFilters }}" as="f" hint-placeholder-count="4">
                <button onClick="{{ f.pick }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 2px solid #14201F; background: {{ f.bg }}; color: {{ f.fg }}; padding: 6px 11px; cursor: pointer;">{{ f.label }}</button>
              </sc-for>
            </div>
          </div>
          <sc-for list="{{ ledger }}" as="tx" hint-placeholder-count="6">
            <div style="display: grid; grid-template-columns: auto 1fr auto auto; gap: 14px; align-items: center; background: #1F3A38; border-top: 1px solid rgba(247,241,230,0.15); padding: 13px 18px;">
              <span style="width: 30px; height: 30px; border: 2px solid #F7F1E6; background: {{ tx.iconBg }}; color: #14201F; font-family: var(--tz-mono); font-size: 12px; display: flex; align-items: center; justify-content: center;">{{ tx.icon }}</span>
              <div style="min-width: 0;">
                <div style="font-size: 13.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ tx.title }}</div>
                <div style="font-family: var(--tz-mono); font-size: 10.5px; color: rgba(247,241,230,0.55); margin-top: 2px;">{{ tx.meta }}</div>
              </div>
              <span style="font-family: var(--tz-mono); font-size: 10.5px; color: {{ tx.statusColor }};">{{ tx.status }}</span>
              <div style="text-align: right;">
                <div style="font-family: var(--tz-display); font-size: 15px;">{{ tx.gross }}</div>
                <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #E8A472;">fee {{ tx.fee }}</div>
              </div>
            </div>
          </sc-for>
        </div>
      </div>

      <!-- Right column -->
      <aside style="display: grid; gap: 24px;">

        <!-- Escrow -->
        <div style="border: 2px solid #F7F1E6; background: #1F3A38; padding: 22px;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">[Escrow — held until jobs confirm]</div>
          <div style="font-family: var(--tz-display); font-size: 40px; line-height: 1; margin: 10px 0 4px;">$41,230</div>
          <div style="font-size: 12.5px; color: rgba(247,241,230,0.65);">across 118 bookings · auto-releases on confirmation</div>
          <div style="display: grid; gap: 8px; margin-top: 16px;">
            <sc-for list="{{ escrow }}" as="e" hint-placeholder-count="3">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; border: 1px solid rgba(247,241,230,0.25); padding: 10px 12px;">
                <div style="min-width: 0;">
                  <div style="font-size: 12.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ e.label }}</div>
                  <div style="font-family: var(--tz-mono); font-size: 10px; color: rgba(247,241,230,0.5);">{{ e.meta }}</div>
                </div>
                <sc-if value="{{ e.releasable }}" hint-placeholder-val="{{ false }}">
                  <button onClick="{{ e.release }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 2px solid #7B8B6E; background: #7B8B6E; color: #14201F; padding: 7px 11px; cursor: pointer; white-space: nowrap;">RELEASE {{ e.amount }}</button>
                </sc-if>
                <sc-if value="{{ e.held }}" hint-placeholder-val="{{ true }}">
                  <span style="font-family: var(--tz-mono); font-size: 10.5px; color: #E8A472; white-space: nowrap;">{{ e.amount }} · {{ e.until }}</span>
                </sc-if>
              </div>
            </sc-for>
          </div>
        </div>

        <!-- Payout batch -->
        <div style="border: 2px solid #F7F1E6; background: #1F3A38; padding: 22px;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">[Provider payouts — weekly batch]</div>
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin: 10px 0 4px;">
            <span style="font-family: var(--tz-display); font-size: 32px;">{{ payoutTotal }}</span>
            <span style="font-family: var(--tz-mono); font-size: 11px; color: rgba(247,241,230,0.6);">{{ payoutCount }} PROVIDERS</span>
          </div>
          <div style="font-size: 12px; color: rgba(247,241,230,0.65); line-height: 1.5;">Bank transfer · M-Pesa · MTN MoMo · Airtel. FX at mid-market + 0.5%.</div>
          <button onClick="{{ approvePayout }}" style="width: 100%; margin-top: 14px; font-family: var(--tz-display); font-size: 15px; text-transform: uppercase; background: {{ payoutBg }}; color: #14201F; border: 0; padding: 13px; cursor: pointer;">{{ payoutLabel }}</button>
          <div style="font-family: var(--tz-mono); font-size: 10.5px; color: rgba(247,241,230,0.5); margin-top: 8px;">Requires finance role · dual-approval over $50K</div>
        </div>

        <!-- Currency exposure -->
        <div style="border: 2px solid #F7F1E6; background: #1F3A38; padding: 22px;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">[Balances by currency]</div>
          <div style="display: grid; gap: 10px; margin-top: 14px;">
            <sc-for list="{{ currencies }}" as="c" hint-placeholder-count="5">
              <div style="display: grid; grid-template-columns: 52px 1fr auto; gap: 12px; align-items: center;">
                <span style="font-family: var(--tz-mono); font-size: 11.5px; border: 1px solid rgba(247,241,230,0.4); text-align: center; padding: 4px 0;">{{ c.code }}</span>
                <div style="height: 10px; background: rgba(247,241,230,0.08); border: 1px solid rgba(247,241,230,0.25);">
                  <div style="height: 100%; width: {{ c.pct }}; background: #D97A3B;"></div>
                </div>
                <span style="font-family: var(--tz-mono); font-size: 11.5px; color: rgba(247,241,230,0.75);">{{ c.usd }}</span>
              </div>
            </sc-for>
          </div>
          <div style="font-size: 11.5px; color: rgba(247,241,230,0.5); margin-top: 12px; line-height: 1.5;">Points liability: $128,400 (12.84M pts outstanding). Value held with licensed partners in each corridor.</div>
        </div>

        <!-- Subscriptions -->
        <div style="border: 2px solid #F7F1E6; background: #1F3A38; padding: 22px;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">[Provider memberships]</div>
          <div style="display: flex; gap: 20px; margin-top: 12px; flex-wrap: wrap;">
            <div><div style="font-family: var(--tz-display); font-size: 28px;">1,146</div><div style="font-size: 11.5px; color: rgba(247,241,230,0.6);">active</div></div>
            <div><div style="font-family: var(--tz-display); font-size: 28px; color: #D97A3B;">89</div><div style="font-size: 11.5px; color: rgba(247,241,230,0.6);">renew ≤ 30d</div></div>
            <div><div style="font-family: var(--tz-display); font-size: 28px; color: #E8A472;">4.1%</div><div style="font-size: 11.5px; color: rgba(247,241,230,0.6);">churn (12mo)</div></div>
          </div>
          <button onClick="{{ dunning }}" style="width: 100%; margin-top: 14px; font-family: var(--tz-mono); font-size: 11.5px; border: 2px solid rgba(247,241,230,0.5); background: none; color: #F7F1E6; padding: 11px; cursor: pointer;">SEND RENEWAL REMINDERS (89) →</button>
        </div>
      </aside>
    </div>
  </div>

</div>
`;

export default template;
