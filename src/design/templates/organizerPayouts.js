// Markup for the organizerPayouts page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh;">

  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 18px 24px; border-bottom: 2px solid #1F3A38; background: #F7F1E6; position: sticky; top: 0; z-index: 40;">
    <div style="display: flex; align-items: center; gap: 20px;">
      <a href="/my-twende" style="text-decoration: none; color: #14201F; font-family: var(--tz-display); font-size: 24px; text-transform: uppercase; line-height: 0.9;">TWENDE<span style="color: #D97A3B;">ZETU</span></a>
      <span style="font-family: var(--tz-mono); font-size: 12px; background: #1F3A38; color: #F7F1E6; padding: 5px 10px;">ORGANIZER PAYOUTS</span>
    </div>
    <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
      <a href="/organizer-analytics" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; color: #14201F; text-decoration: none; padding: 9px 14px;">▤ ANALYTICS</a>
      <a href="/checkin" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #D97A3B; color: #14201F; text-decoration: none; padding: 9px 14px;">▣ CHECK-IN</a>
    </div>
  </header>

  <section style="max-width: 1160px; margin: 0 auto; padding: 32px 24px 80px;">
    <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em;">[Malipo — how ticket money reaches you]</div>
    <div style="display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; margin: 8px 0 24px;">
      <h1 style="font-family: var(--tz-display); font-size: clamp(30px, 4.5vw, 52px); text-transform: uppercase; line-height: 0.95; margin: 0;">Payouts<span style="color: #D97A3B;">.</span></h1>
      <sc-if value="{{ hasTabs }}" hint-placeholder-val="{{ false }}">
        <nav aria-label="Currency" style="display: flex; gap: 6px; flex-wrap: wrap;">
          <sc-for list="{{ currencyTabs }}" as="ct" hint-placeholder-count="2">
            <a href="{{ ct.href }}" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: {{ ct.bg }}; color: {{ ct.fg }}; text-decoration: none; padding: 7px 12px;">{{ ct.code }}</a>
          </sc-for>
        </nav>
      </sc-if>
    </div>

    <!-- How the money moves -->
    <div class="tw-4col" style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 2px; border: 2px solid #1F3A38; background: #1F3A38; margin-bottom: 12px;">
      <sc-for list="{{ flow }}" as="f" hint-placeholder-count="4">
        <div style="background: {{ f.bg }}; color: {{ f.fg }}; padding: 18px 20px;">
          <div style="font-family: var(--tz-mono); font-size: 10.5px; opacity: 0.7;">{{ f.step }}</div>
          <div style="font-family: var(--tz-display); font-size: 22px; text-transform: uppercase; line-height: 1; margin: 8px 0 4px;">{{ f.label }}</div>
          <div style="font-size: 12px; opacity: 0.85; line-height: 1.4;">{{ f.desc }}</div>
        </div>
      </sc-for>
    </div>
    <div style="font-size: 12.5px; color: #6E6155; line-height: 1.55; margin-bottom: 28px; max-width: 820px;">An open case keeps its event's money in escrow until it closes. A refund after release comes out of your balance, so keep enough there if a late case is likely.</div>

    <div class="tw-2col" style="display: grid; grid-template-columns: 0.9fr 1.3fr; gap: 24px; align-items: start;">
      <div style="display: grid; gap: 16px;">
        <!-- Available -->
        <div style="border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 24px; box-shadow: 6px 6px 0 #D97A3B;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">[Available to withdraw]</div>
          <div style="font-family: var(--tz-display); font-size: clamp(38px, 5vw, 52px); line-height: 1; margin: 10px 0 4px; overflow-wrap: anywhere;">{{ availableLabel }}</div>
          <div style="font-family: var(--tz-mono); font-size: 12px; color: rgba(247,241,230,0.7);">{{ lastRelease }}</div>

          <sc-if value="{{ canWithdraw }}" hint-placeholder-val="{{ true }}">
            <button onClick="{{ toggleWithdraw }}" aria-expanded="{{ withdrawOpen }}" style="width: 100%; margin-top: 16px; font-family: var(--tz-display); font-size: 16px; text-transform: uppercase; background: #D97A3B; color: #14201F; border: 0; padding: 14px; cursor: pointer;">{{ withdrawLabel }}</button>
          </sc-if>
          <sc-if value="{{ noWithdraw }}" hint-placeholder-val="{{ false }}">
            <div style="margin-top: 16px; border: 1px dashed rgba(247,241,230,0.4); padding: 12px 14px; font-size: 12.5px; color: rgba(247,241,230,0.8);">{{ noWithdrawNote }}</div>
          </sc-if>

          <sc-if value="{{ withdrawOpen }}" hint-placeholder-val="{{ false }}">
            <div style="margin-top: 16px; display: grid; gap: 12px;">
              <label style="display: grid; gap: 6px;">
                <span style="font-family: var(--tz-mono); font-size: 10.5px; color: #E8A472;">AMOUNT ({{ currency }})</span>
                <div style="display: flex; gap: 6px;">
                  <input value="{{ amount }}" onChange="{{ setAmount }}" inputmode="decimal" autocomplete="off" aria-label="Amount to withdraw" placeholder="0" style="flex: 1; min-width: 0; border: 2px solid #F7F1E6; background: transparent; color: #F7F1E6; padding: 11px 12px; font-family: var(--tz-display); font-size: 20px; outline: none;">
                  <button onClick="{{ fillAll }}" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #F7F1E6; background: none; color: #F7F1E6; padding: 0 12px; cursor: pointer;">ALL</button>
                </div>
                <span style="font-family: var(--tz-mono); font-size: 10.5px; color: rgba(247,241,230,0.65);">{{ netNote }}</span>
              </label>
              <sc-if value="{{ hasMethods }}" hint-placeholder-val="{{ true }}">
                <div role="radiogroup" aria-label="Send to" style="display: grid; gap: 6px;">
                  <sc-for list="{{ methods }}" as="m" hint-placeholder-count="2">
                    <button onClick="{{ m.pick }}" role="radio" aria-checked="{{ m.on }}" style="display: flex; justify-content: space-between; gap: 10px; text-align: left; border: 2px solid {{ m.border }}; background: {{ m.bg }}; color: #F7F1E6; padding: 10px 12px; font-size: 13px; cursor: pointer;">{{ m.label }}<span style="font-family: var(--tz-mono); font-size: 10px; color: #E8A472;">{{ m.tag }}</span></button>
                  </sc-for>
                </div>
              </sc-if>
              <sc-if value="{{ noMethods }}" hint-placeholder-val="{{ false }}">
                <div style="font-size: 12.5px; color: rgba(247,241,230,0.85);">Add a mobile money or bank account first. <a href="/settings?tab=payments" style="color: #E8A472;">Payout methods →</a></div>
              </sc-if>
              <button onClick="{{ withdraw }}" style="font-family: var(--tz-display); font-size: 15px; text-transform: uppercase; background: #F7F1E6; color: #14201F; border: 0; padding: 13px; cursor: pointer;">{{ sendLabel }}</button>
            </div>
          </sc-if>
        </div>

        <!-- Held -->
        <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 20px 22px;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; letter-spacing: 0.08em;">[Held in escrow]</div>
          <div style="font-family: var(--tz-display); font-size: 34px; margin: 8px 0 2px;">{{ heldLabel }}</div>
          <div style="font-size: 12.5px; color: #6E6155; line-height: 1.5;">{{ heldNote }}</div>
        </div>

        <!-- Payout methods -->
        <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 20px 22px;">
          <div style="display: flex; justify-content: space-between; gap: 10px; align-items: center;">
            <span style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; letter-spacing: 0.08em;">[Payout methods]</span>
            <a href="/settings?tab=payments" style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23;">MANAGE</a>
          </div>
          <sc-if value="{{ hasMethods }}" hint-placeholder-val="{{ true }}">
            <div style="display: grid; gap: 8px; margin-top: 10px;">
              <sc-for list="{{ methods }}" as="pm" hint-placeholder-count="1">
                <div style="display: flex; justify-content: space-between; gap: 10px; font-size: 13.5px;">{{ pm.label }}<span style="font-family: var(--tz-mono); font-size: 10.5px; color: #6E6155;">{{ pm.tag }}</span></div>
              </sc-for>
            </div>
          </sc-if>
          <sc-if value="{{ noMethods }}" hint-placeholder-val="{{ false }}">
            <div style="font-size: 13px; color: #6E6155; margin-top: 10px; line-height: 1.5;">None yet. Add M-Pesa, MTN MoMo, Airtel Money or a bank account to withdraw.</div>
          </sc-if>
        </div>
      </div>

      <div>
        <!-- Release schedule -->
        <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 20px 22px; margin-bottom: 16px;">
          <div style="font-family: var(--tz-display); font-size: 19px; text-transform: uppercase; margin-bottom: 4px;">Release schedule</div>
          <div style="font-size: 12.5px; color: #6E6155; margin-bottom: 14px;">Escrow releases on its own after each event. Nothing to invoice, nothing to chase.</div>
          <sc-if value="{{ noSchedule }}" hint-placeholder-val="{{ false }}">
            <div style="font-size: 13px; color: #6E6155; border: 1px dashed #C9BFB1; padding: 14px;">No ticket money is waiting for release.</div>
          </sc-if>
          <div style="display: grid; gap: 10px;">
            <sc-for list="{{ schedule }}" as="s" hint-placeholder-count="3">
              <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 12px; align-items: center; border: 1px solid #E3D9C6; background: #F7F1E6; padding: 12px 14px;">
                <span style="width: 26px; height: 26px; border: 2px solid #1F3A38; background: {{ s.mBg }}; color: {{ s.mFg }}; font-family: var(--tz-mono); font-size: 11px; display: flex; align-items: center; justify-content: center;">{{ s.mark }}</span>
                <div style="min-width: 0;">
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
          <div style="padding: 14px 20px; border-bottom: 2px solid #1F3A38; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
            <span style="font-family: var(--tz-display); font-size: 19px; text-transform: uppercase;">Releases &amp; withdrawals</span>
            <a href="{{ statementHref }}" download style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #1F3A38; background: #F7F1E6; color: #14201F; text-decoration: none; padding: 7px 12px;">↓ STATEMENT (CSV)</a>
          </div>
          <sc-if value="{{ noHistory }}" hint-placeholder-val="{{ false }}">
            <div style="padding: 18px 20px; font-size: 13px; color: #6E6155;">Nothing yet. Releases and withdrawals appear here as they happen.</div>
          </sc-if>
          <sc-for list="{{ history }}" as="h" hint-placeholder-count="4">
            <div style="display: grid; grid-template-columns: 1fr auto auto; gap: 14px; align-items: center; padding: 13px 20px; border-bottom: 1px solid #E3D9C6;">
              <div style="min-width: 0;">
                <div style="font-weight: 600; font-size: 13.5px;">{{ h.title }}</div>
                <div style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">{{ h.meta }}</div>
              </div>
              <span style="font-family: var(--tz-mono); font-size: 10.5px; background: {{ h.chipBg }}; color: {{ h.chipFg }}; border: 1px solid #1F3A38; padding: 4px 8px; white-space: nowrap;">{{ h.status }}</span>
              <span style="font-family: var(--tz-display); font-size: 17px; color: {{ h.amountColor }};">{{ h.amount }}</span>
            </div>
          </sc-for>
        </div>
      </div>
    </div>
  </section>

</div>
`;

export default template;
