// Markup for the providerWallet page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh;">

  <!-- Header -->
  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 18px 24px; border-bottom: 2px solid #1F3A38; background: #F7F1E6; position: sticky; top: 0; z-index: 40;">
    <div style="display: flex; align-items: center; gap: 24px;">
      <a href="/" style="text-decoration: none; color: #14201F; font-family: var(--tz-display); font-size: 26px; text-transform: uppercase; line-height: 0.9;">TWENDE<br><span style="color: #D97A3B;">ZETU</span></a>
      <span style="font-family: var(--tz-mono); font-size: 12px; background: #1F3A38; color: #F7F1E6; padding: 5px 10px;">BUSINESS WALLET · KATO 4X4</span>
    </div>
    <a href="/provider-dashboard" style="font-family: var(--tz-mono); font-size: 13px; background: #1F3A38; color: #F7F1E6; text-decoration: none; padding: 12px 20px; box-shadow: 4px 4px 0 #D97A3B;">← DASHBOARD</a>
  </header>

  <div style="max-width: 1200px; margin: 0 auto; padding: 40px 24px 80px;">
    <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em;">[Mapato ya biashara — business money]</div>
    <h1 style="font-family: var(--tz-display); font-size: clamp(38px, 5vw, 64px); text-transform: uppercase; line-height: 0.95; margin: 10px 0 6px;">Earnings, escrow, payouts<span style="color: #D97A3B;">.</span></h1>
    <p style="font-size: 15px; color: #3A2F25; max-width: 680px; line-height: 1.55; margin: 0 0 12px;">This is your <strong>business ledger</strong> — money earned from jobs, held in escrow, and withdrawn to your bank or mobile money. It is separate from a personal <a href="/points-wallet" style="color: #A85A23;">Points wallet</a> (spending money), so your books stay clean and fees are only ever charged on business income.</p>

    <div class="tw-2col" style="display: grid; grid-template-columns: 0.95fr 1.25fr; gap: 40px; align-items: start; margin-top: 28px;">

      <!-- Left: balances + withdraw -->
      <div style="display: grid; gap: 18px;">
        <div style="border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 28px; box-shadow: 6px 6px 0 #D97A3B;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">[Available to withdraw]</div>
          <div style="font-family: var(--tz-display); font-size: 52px; line-height: 1; margin: 12px 0 4px;">{{ availFmt }}</div>
          <div style="font-family: var(--tz-mono); font-size: 12px; color: rgba(247,241,230,0.7);">≈ {{ availUsd }} · fees already deducted</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 18px; font-family: var(--tz-mono); font-size: 11.5px;">
            <div style="border: 1px solid rgba(247,241,230,0.3); padding: 10px 12px;"><div style="color: #E8A472;">IN ESCROW</div><div style="font-family: var(--tz-display); font-size: 20px; margin-top: 4px;">UGX 940K</div><div style="color: rgba(247,241,230,0.5); margin-top: 2px;">3 jobs · releases on confirm</div></div>
            <div style="border: 1px solid rgba(247,241,230,0.3); padding: 10px 12px;"><div style="color: #E8A472;">THIS MONTH</div><div style="font-family: var(--tz-display); font-size: 20px; margin-top: 4px;">UGX 1.1M</div><div style="color: rgba(247,241,230,0.5); margin-top: 2px;">6 jobs · +22% vs jun</div></div>
          </div>
          <div style="display: flex; gap: 10px; margin-top: 18px;">
            <button onClick="{{ toggleWithdraw }}" style="flex: 1; font-family: var(--tz-display); font-size: 15px; text-transform: uppercase; background: #D97A3B; color: #1F3A38; border: 0; padding: 13px; cursor: pointer;">Withdraw</button>
            <button onClick="{{ toPoints }}" style="flex: 1; font-family: var(--tz-display); font-size: 15px; text-transform: uppercase; background: none; color: #F7F1E6; border: 2px solid rgba(247,241,230,0.5); padding: 11px; cursor: pointer;">→ To points</button>
          </div>

          <!-- Withdraw flow with confirmation -->
          <sc-if value="{{ withdrawOpen }}" hint-placeholder-val="{{ false }}">
            <div style="margin-top: 18px; border-top: 1px solid rgba(247,241,230,0.25); padding-top: 16px; display: grid; gap: 10px;">
              <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">[Toa pesa — withdraw]</div>
              <div style="display: flex; gap: 10px;">
                <input type="number" value="{{ wAmount }}" onChange="{{ setWAmount }}" style="flex: 1; min-width: 0; border: 2px solid rgba(247,241,230,0.4); background: rgba(247,241,230,0.08); color: #F7F1E6; padding: 12px 14px; font-family: var(--tz-mono); font-size: 14px; outline: none;">
                <span style="align-self: center; font-family: var(--tz-mono); font-size: 12px; color: rgba(247,241,230,0.6);">UGX ('000)</span>
              </div>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <sc-for list="{{ destinations }}" as="d" hint-placeholder-count="3">
                  <button onClick="{{ d.pick }}" style="flex: 1; min-width: 120px; font-family: var(--tz-mono); font-size: 11px; border: 2px solid {{ d.border }}; background: {{ d.bg }}; color: #F7F1E6; padding: 10px 8px; cursor: pointer; line-height: 1.5;">{{ d.label }}</button>
                </sc-for>
              </div>
              <button onClick="{{ reviewWithdraw }}" style="font-family: var(--tz-display); font-size: 14px; text-transform: uppercase; background: #D97A3B; color: #1F3A38; border: 0; padding: 12px; cursor: pointer;">Review withdrawal →</button>
            </div>
          </sc-if>

          <!-- Confirmation step -->
          <sc-if value="{{ confirmOpen }}" hint-placeholder-val="{{ false }}">
            <div style="margin-top: 18px; border: 2px solid #D97A3B; background: rgba(217,122,59,0.12); padding: 16px; display: grid; gap: 8px;">
              <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">[Thibitisha — confirm withdrawal]</div>
              <div style="font-size: 14px; line-height: 1.6;">{{ confirmSummary }}</div>
              <div style="font-family: var(--tz-mono); font-size: 11px; color: rgba(247,241,230,0.6);">Fee UGX 2,500 · arrives within 24h · 2FA code will be required</div>
              <div style="display: flex; gap: 8px;">
                <button onClick="{{ confirmWithdraw }}" style="flex: 1; font-family: var(--tz-display); font-size: 14px; text-transform: uppercase; background: #D97A3B; color: #1F3A38; border: 0; padding: 12px; cursor: pointer;">Confirm →</button>
                <button onClick="{{ cancelWithdraw }}" style="font-family: var(--tz-mono); font-size: 11px; background: none; color: #F7F1E6; border: 1px solid rgba(247,241,230,0.5); padding: 12px 16px; cursor: pointer;">CANCEL</button>
              </div>
            </div>
          </sc-if>
        </div>

        <!-- Fee explainer -->
        <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 20px 22px;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; letter-spacing: 0.08em;">[How you're charged]</div>
          <div style="display: grid; gap: 8px; margin-top: 12px; font-size: 13.5px; line-height: 1.5;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #E3D9C6; padding-bottom: 8px;"><span>Booking through platform</span><strong style="color: #A85A23;">7% of job value</strong></div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #E3D9C6; padding-bottom: 8px;"><span>Annual membership</span><strong style="color: #A85A23;">UGX 20,000 / yr</strong></div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #E3D9C6; padding-bottom: 8px;"><span>Withdrawal</span><strong style="color: #A85A23;">UGX 2,500 flat</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Jobs arranged off-platform</span><strong style="color: #6E6155;">not protected, no fee</strong></div>
          </div>
        </div>
      </div>

      <!-- Right: contained activity ledger -->
      <div style="border: 2px solid #1F3A38; background: #FFFDF8; display: flex; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; border-bottom: 2px solid #1F3A38; flex-wrap: wrap; gap: 8px;">
          <span style="font-family: var(--tz-display); font-size: 17px; text-transform: uppercase;">Business activity</span>
          <div style="display: flex; gap: 6px;">
            <sc-for list="{{ filters }}" as="f" hint-placeholder-count="4">
              <button onClick="{{ f.pick }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 2px solid #1F3A38; background: {{ f.bg }}; color: {{ f.fg }}; padding: 6px 10px; cursor: pointer;">{{ f.label }}</button>
            </sc-for>
          </div>
        </div>
        <div style="max-height: 480px; overflow-y: auto;">
          <sc-for list="{{ activity }}" as="a" hint-placeholder-count="6">
            <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 14px; align-items: center; padding: 13px 20px; border-bottom: 1px solid #E3D9C6;">
              <span style="width: 30px; height: 30px; border: 2px solid #1F3A38; background: {{ a.iconBg }}; color: #14201F; font-family: var(--tz-mono); font-size: 12px; display: flex; align-items: center; justify-content: center;">{{ a.icon }}</span>
              <div style="min-width: 0;">
                <div style="font-size: 13.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ a.title }}</div>
                <div style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155; margin-top: 2px;">{{ a.meta }}</div>
              </div>
              <span style="font-family: var(--tz-display); font-size: 16px; color: {{ a.color }};">{{ a.amount }}</span>
            </div>
          </sc-for>
        </div>
        <div style="padding: 12px 20px; border-top: 2px solid #1F3A38; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">SHOWING {{ shownCount }} · SCROLL FOR MORE</span>
          <button onClick="{{ exportStmt }}" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 8px 12px; cursor: pointer;">↓ STATEMENT (PDF/CSV)</button>
        </div>
      </div>
    </div>
  </div>


  <footer style="border-top: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 20px 24px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; font-family: var(--tz-mono); font-size: 12px;">
    <span>TWENDEZETU · BUSINESS WALLET — SEPARATE FROM PERSONAL POINTS</span>
    <a href="/provider-dashboard" style="color: #E8A472;">← BACK TO DASHBOARD</a>
  </footer>
</div>
`;

export default template;
