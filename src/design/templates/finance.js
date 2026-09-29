// Markup for the finance page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #14201F; color: #F7F1E6; min-height: 100vh;">

  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 16px 24px; border-bottom: 2px solid #F7F1E6; background: #14201F; position: sticky; top: 0; z-index: 40;">
    <div style="display: flex; align-items: center; gap: 20px;">
      <a href="/" class="tz-logo-link" aria-label="Twendezetu home"><img src="/brand/logo-light.png" alt="Twendezetu" width="1211" height="229" class="tz-logo tz-logo--md"></a>
      <span style="font-family: var(--tz-mono); font-size: 12px; background: #7B8B6E; color: #14201F; padding: 5px 10px;">FINANCE CONSOLE</span>
    </div>
    <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; position: relative;">
      <sc-if value="{{ isAdmin }}" hint-placeholder-val="{{ true }}">
        <a href="/admin" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #F7F1E6; color: #F7F1E6; text-decoration: none; padding: 9px 14px;">⚙ ADMIN →</a>
      </sc-if>
      <a href="{{ exportHref }}" download style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #E9B4AC; background: #820101; color: #F7F1E6; text-decoration: none; padding: 9px 14px;">↓ EXPORT CSV</a>
      <button onClick="{{ toggleMenu }}" aria-expanded="{{ menuOpen }}" aria-label="Account menu" style="width: 38px; height: 38px; background: #7B8B6E; color: #14201F; border: 2px solid #F7F1E6; font-family: var(--tz-display); font-size: 15px; display: flex; align-items: center; justify-content: center; cursor: pointer;">{{ staffInitials }}</button>
      <sc-if value="{{ menuOpen }}" hint-placeholder-val="{{ false }}">
        <div style="position: absolute; top: 48px; right: 0; width: 290px; background: #1F3A38; border: 2px solid #F7F1E6; box-shadow: 6px 6px 0 rgba(0,0,0,0.4); z-index: 60;">
          <div style="padding: 14px 18px; border-bottom: 2px solid #F7F1E6;">
            <div style="font-weight: 700; font-size: 14.5px;">{{ staffName }}</div>
            <div style="font-family: var(--tz-mono); font-size: 10.5px; color: rgba(247,241,230,0.6); margin-top: 2px;">{{ staffMeta }}</div>
          </div>
          <a href="/settings?tab=security" style="display: block; text-decoration: none; color: #F7F1E6; border-bottom: 1px solid rgba(247,241,230,0.15); padding: 12px 18px; font-size: 14px;">⚙ &nbsp;Your security settings</a>
          <button onClick="{{ signOut }}" style="display: block; width: 100%; text-align: left; background: none; border: 0; color: #E9B4AC; padding: 12px 18px; font-family: var(--tz-sans); font-size: 14px; font-weight: 600; cursor: pointer;">→ &nbsp;Sign out</button>
        </div>
      </sc-if>
    </div>
  </header>

  <nav aria-label="Finance sections" style="display: flex; gap: 4px; align-items: center; padding: 10px 20px; border-bottom: 2px solid #F7F1E6; background: #1F3A38; overflow-x: auto; position: sticky; top: 76px; z-index: 30;">
    <a href="#revenue" style="font-family: var(--tz-mono); font-size: 12px; color: #F7F1E6; text-decoration: none; padding: 9px 14px; white-space: nowrap;">Revenue</a>
    <a href="#ledger" style="font-family: var(--tz-mono); font-size: 12px; color: #F7F1E6; text-decoration: none; padding: 9px 14px; white-space: nowrap;">Ledger</a>
    <a href="#escrow" style="font-family: var(--tz-mono); font-size: 12px; color: #F7F1E6; text-decoration: none; padding: 9px 14px; white-space: nowrap;">Escrow</a>
    <a href="#payouts" style="font-family: var(--tz-mono); font-size: 12px; color: #F7F1E6; text-decoration: none; padding: 9px 14px; white-space: nowrap;">Withdrawals</a>
    <a href="#pools" style="font-family: var(--tz-mono); font-size: 12px; color: #F7F1E6; text-decoration: none; padding: 9px 14px; white-space: nowrap;">Pool reviews</a>
    <a href="#memberships" style="font-family: var(--tz-mono); font-size: 12px; color: #F7F1E6; text-decoration: none; padding: 9px 14px; white-space: nowrap;">Memberships</a>
  </nav>

  <section style="max-width: 1320px; margin: 0 auto; padding: 36px 24px 80px;">
    <div id="revenue" style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 12px; scroll-margin-top: 150px;">
      <h1 style="font-family: var(--tz-display); font-size: clamp(32px, 4.5vw, 56px); text-transform: uppercase; margin: 0;">Revenue &amp; money movement<span style="color: #E9B4AC;">.</span></h1>
      <div style="display: flex; gap: 6px;">
        <sc-for list="{{ ranges }}" as="r" hint-placeholder-count="3">
          <button onClick="{{ r.go }}" style="font-family: var(--tz-mono); font-size: 11.5px; border: 2px solid #F7F1E6; background: {{ r.bg }}; color: {{ r.fg }}; padding: 8px 14px; cursor: pointer;">{{ r.label }}</button>
        </sc-for>
      </div>
    </div>

    <div class="tw-4col" style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 2px; border: 2px solid #F7F1E6; background: #F7F1E6; margin: 24px 0 32px;">
      <sc-for list="{{ kpis }}" as="k" hint-placeholder-count="4">
        <div style="background: {{ k.bg }}; color: {{ k.fg }}; padding: 20px 22px;">
          <div style="font-family: var(--tz-mono); font-size: 10.5px; letter-spacing: 0.08em; opacity: 0.75;">{{ k.label }}</div>
          <div style="font-family: var(--tz-display); font-size: 36px; line-height: 1; margin-top: 8px;">{{ k.big }}</div>
          <div style="font-size: 12px; margin-top: 5px; opacity: 0.8;">{{ k.sub }}</div>
        </div>
      </sc-for>
    </div>

    <div class="tw-2col" style="display: grid; grid-template-columns: 1.4fr 0.9fr; gap: 32px; align-items: start;">

      <div style="display: grid; gap: 32px; min-width: 0;">
        <div style="border: 2px solid #F7F1E6; background: #1F3A38; padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px;">
            <div style="font-family: var(--tz-display); font-size: 20px; text-transform: uppercase;">Revenue by stream</div>
            <span style="font-family: var(--tz-mono); font-size: 11px; color: rgba(247,241,230,0.6);">{{ rangeLabel }} · USD EQUIVALENT</span>
          </div>
          <sc-if value="{{ noStreams }}" hint-placeholder-val="{{ false }}">
            <div style="font-size: 13.5px; color: rgba(247,241,230,0.7); margin-top: 16px;">No fee revenue in this period.</div>
          </sc-if>
          <div style="display: grid; gap: 14px; margin-top: 20px;">
            <sc-for list="{{ streams }}" as="st" hint-placeholder-count="4">
              <div>
                <div style="display: flex; justify-content: space-between; gap: 10px; font-size: 13px; margin-bottom: 6px;">
                  <span>{{ st.label }}</span>
                  <span style="font-family: var(--tz-mono); color: #E9B4AC;">{{ st.amount }} · {{ st.pct }}</span>
                </div>
                <div style="height: 16px; border: 2px solid #F7F1E6; background: rgba(247,241,230,0.08);">
                  <div style="height: 100%; width: {{ st.pct }}; background: {{ st.color }};"></div>
                </div>
              </div>
            </sc-for>
          </div>
        </div>

        <div id="ledger" style="border: 2px solid #F7F1E6; scroll-margin-top: 150px;">
          <div style="display: flex; justify-content: space-between; align-items: center; background: #F7F1E6; color: #14201F; padding: 12px 18px; flex-wrap: wrap; gap: 8px;">
            <span style="font-family: var(--tz-display); font-size: 17px; text-transform: uppercase;">Transaction ledger</span>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <sc-for list="{{ ledgerFilters }}" as="f" hint-placeholder-count="7">
                <button onClick="{{ f.go }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 2px solid #14201F; background: {{ f.bg }}; color: {{ f.fg }}; padding: 6px 11px; cursor: pointer;">{{ f.label }}</button>
              </sc-for>
            </div>
          </div>
          <sc-if value="{{ noLedger }}" hint-placeholder-val="{{ false }}">
            <div style="background: #1F3A38; padding: 18px; font-size: 13.5px; color: rgba(247,241,230,0.7);">No entries of this kind in this period.</div>
          </sc-if>
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
                <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #E9B4AC;">fee {{ tx.fee }}</div>
              </div>
            </div>
          </sc-for>
        </div>
      </div>

      <aside style="display: grid; gap: 24px; min-width: 0;">

        <div id="escrow" style="border: 2px solid #F7F1E6; background: #1F3A38; padding: 22px; scroll-margin-top: 150px;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #E9B4AC; letter-spacing: 0.08em;">[Escrow — bookings held until jobs are confirmed]</div>
          <div style="font-family: var(--tz-display); font-size: 40px; line-height: 1; margin: 10px 0 4px;">{{ heldBookings }}</div>
          <div style="font-size: 12.5px; color: rgba(247,241,230,0.65); line-height: 1.5;">{{ heldNote }}</div>
          <sc-if value="{{ noEscrow }}" hint-placeholder-val="{{ false }}">
            <div style="font-size: 13px; color: rgba(247,241,230,0.7); margin-top: 14px;">No booking money is held.</div>
          </sc-if>
          <div style="display: grid; gap: 8px; margin-top: 16px;">
            <sc-for list="{{ escrow }}" as="e" hint-placeholder-count="3">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; border: 1px solid rgba(247,241,230,0.25); padding: 10px 12px;">
                <div style="min-width: 0;">
                  <div style="font-size: 12.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ e.label }}</div>
                  <div style="font-family: var(--tz-mono); font-size: 10px; color: rgba(247,241,230,0.5);">{{ e.meta }} · {{ e.until }}</div>
                </div>
                <sc-if value="{{ e.releasable }}" hint-placeholder-val="{{ false }}">
                  <button onClick="{{ e.release }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 2px solid #7B8B6E; background: #7B8B6E; color: #14201F; padding: 7px 11px; cursor: pointer; white-space: nowrap;">RELEASE {{ e.local }}</button>
                </sc-if>
                <sc-if value="{{ e.held }}" hint-placeholder-val="{{ true }}">
                  <span style="font-family: var(--tz-mono); font-size: 10.5px; color: #E9B4AC; white-space: nowrap;">{{ e.local }}</span>
                </sc-if>
              </div>
            </sc-for>
          </div>
        </div>

        <div id="payouts" style="border: 2px solid #F7F1E6; background: #1F3A38; padding: 22px; scroll-margin-top: 150px;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #E9B4AC; letter-spacing: 0.08em;">[Withdrawals — approve, send, record]</div>
          <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 10px; margin: 10px 0 4px;">
            <span style="font-family: var(--tz-display); font-size: 32px;">{{ payoutTotal }}</span>
            <span style="font-family: var(--tz-mono); font-size: 11px; color: rgba(247,241,230,0.6);">{{ payoutCount }} WAITING</span>
          </div>
          <div style="font-size: 12px; color: rgba(247,241,230,0.65); line-height: 1.5;">{{ payoutBreakdown }}. Sent by mobile money or bank transfer in each member's own currency.</div>
          <button onClick="{{ approveBatch }}" style="width: 100%; margin-top: 14px; font-family: var(--tz-display); font-size: 15px; text-transform: uppercase; background: {{ approveBg }}; color: #14201F; border: 0; padding: 13px; cursor: pointer;">{{ approveLabel }}</button>
          <sc-if value="{{ noQueue }}" hint-placeholder-val="{{ false }}">
            <div style="font-size: 13px; color: rgba(247,241,230,0.7); margin-top: 14px;">Nothing to send.</div>
          </sc-if>
          <div style="display: grid; gap: 8px; margin-top: 16px;">
            <sc-for list="{{ queue }}" as="q" hint-placeholder-count="3">
              <div style="border: 1px solid rgba(247,241,230,0.25); padding: 10px 12px;">
                <div style="display: flex; justify-content: space-between; gap: 10px;">
                  <div style="min-width: 0;">
                    <div style="font-size: 12.5px; font-weight: 600;">{{ q.net }} → {{ q.destination }}</div>
                    <div style="font-family: var(--tz-mono); font-size: 10px; color: rgba(247,241,230,0.5);">{{ q.reference }} · {{ q.who }} · ASKED {{ q.requested }}</div>
                  </div>
                  <span style="font-family: var(--tz-mono); font-size: 10px; color: {{ q.statusColor }}; white-space: nowrap;">{{ q.statusLabel }}</span>
                </div>
                <div style="display: flex; gap: 6px; margin-top: 8px;">
                  <sc-if value="{{ q.approved }}" hint-placeholder-val="{{ false }}">
                    <button onClick="{{ q.markSent }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 2px solid #7B8B6E; background: #7B8B6E; color: #14201F; padding: 6px 10px; cursor: pointer;">MARK SENT</button>
                  </sc-if>
                  <button onClick="{{ q.markFailed }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 1px solid #B8463A; background: none; color: #E9B4AC; padding: 6px 10px; cursor: pointer;">RETURN</button>
                </div>
              </div>
            </sc-for>
          </div>
        </div>

        <div id="pools" style="border: 2px solid #F7F1E6; background: #1F3A38; padding: 22px; scroll-margin-top: 150px;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #E9B4AC; letter-spacing: 0.08em;">[Pool releases to review]</div>
          <sc-if value="{{ hasPools }}" hint-placeholder-val="{{ false }}">
            <div style="display: grid; gap: 8px; margin-top: 12px;">
              <sc-for list="{{ pools }}" as="pl" hint-placeholder-count="1">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; border: 1px solid rgba(247,241,230,0.25); padding: 10px 12px;">
                  <div style="min-width: 0;">
                    <div style="font-size: 12.5px; font-weight: 600;">{{ pl.title }}</div>
                    <div style="font-family: var(--tz-mono); font-size: 10px; color: rgba(247,241,230,0.5);">{{ pl.creator }} · {{ pl.contributors }} CONTRIBUTORS · ASKED {{ pl.asked }}</div>
                  </div>
                  <button onClick="{{ pl.release }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 2px solid #7B8B6E; background: #7B8B6E; color: #14201F; padding: 7px 11px; cursor: pointer; white-space: nowrap;">RELEASE {{ pl.points }} PTS</button>
                </div>
              </sc-for>
            </div>
          </sc-if>
          <sc-if value="{{ noPools }}" hint-placeholder-val="{{ true }}">
            <div style="font-size: 13px; color: rgba(247,241,230,0.7); margin-top: 12px;">No pool is waiting for a review.</div>
          </sc-if>
        </div>

        <div style="border: 2px solid #F7F1E6; background: #1F3A38; padding: 22px;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #E9B4AC; letter-spacing: 0.08em;">[Volume by currency · {{ rangeLabel }}]</div>
          <sc-if value="{{ noCurrencies }}" hint-placeholder-val="{{ false }}">
            <div style="font-size: 13px; color: rgba(247,241,230,0.7); margin-top: 12px;">No volume in this period.</div>
          </sc-if>
          <div style="display: grid; gap: 10px; margin-top: 14px;">
            <sc-for list="{{ currencies }}" as="c" hint-placeholder-count="4">
              <div style="display: grid; grid-template-columns: 52px 1fr auto; gap: 12px; align-items: center;">
                <span style="font-family: var(--tz-mono); font-size: 11.5px; border: 1px solid rgba(247,241,230,0.4); text-align: center; padding: 4px 0;">{{ c.code }}</span>
                <div style="height: 10px; background: rgba(247,241,230,0.08); border: 1px solid rgba(247,241,230,0.25);">
                  <div style="height: 100%; width: {{ c.pct }}; background: #820101; color: #F7F1E6;"></div>
                </div>
                <span style="font-family: var(--tz-mono); font-size: 11.5px; color: rgba(247,241,230,0.75);">{{ c.usd }}</span>
              </div>
            </sc-for>
          </div>
          <div style="font-size: 11.5px; color: rgba(247,241,230,0.6); margin-top: 12px; line-height: 1.5;">Points liability: {{ pointsLiability }}</div>
        </div>

        <div id="memberships" style="border: 2px solid #F7F1E6; background: #1F3A38; padding: 22px; scroll-margin-top: 150px;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #E9B4AC; letter-spacing: 0.08em;">[Vendor memberships]</div>
          <div style="display: flex; gap: 24px; margin-top: 12px; flex-wrap: wrap;">
            <div><div style="font-family: var(--tz-display); font-size: 28px;">{{ activeMemberships }}</div><div style="font-size: 11.5px; color: rgba(247,241,230,0.6);">active</div></div>
            <div><div style="font-family: var(--tz-display); font-size: 28px; color: #E9B4AC;">{{ renewSoon }}</div><div style="font-size: 11.5px; color: rgba(247,241,230,0.6);">end within 30 days</div></div>
            <div><div style="font-family: var(--tz-display); font-size: 28px; color: #E9B4AC;">{{ lapsed }}</div><div style="font-size: 11.5px; color: rgba(247,241,230,0.6);">lapsed in the last 90 days</div></div>
          </div>
          <sc-if value="{{ canRemind }}" hint-placeholder-val="{{ true }}">
            <button onClick="{{ remind }}" style="width: 100%; margin-top: 14px; font-family: var(--tz-mono); font-size: 11.5px; border: 2px solid rgba(247,241,230,0.5); background: none; color: #F7F1E6; padding: 11px; cursor: pointer;">{{ remindLabel }}</button>
          </sc-if>
        </div>
      </aside>
    </div>
  </section>

</div>
`;

export default template;
