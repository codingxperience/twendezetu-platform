// Markup for the wallet page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh;">

  <!-- Header -->
  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 18px 24px; border-bottom: 2px solid #1F3A38; background: #F7F1E6; position: sticky; top: 0; z-index: 40;">
    <div style="display: flex; align-items: center; gap: 24px;">
      <a href="/" class="tz-logo-link" aria-label="Twendezetu home"><img src="/brand/logo.png" alt="Twendezetu" width="1211" height="229" class="tz-logo tz-logo--md"></a>
      <span style="font-family: var(--tz-mono); font-size: 12px; background: #D97A3B; border: 2px solid #1F3A38; color: #1F3A38; padding: 4px 10px;">POINTS WALLET</span>
    </div>
    <a href="/my-twende" style="font-family: var(--tz-mono); font-size: 13px; background: #1F3A38; color: #F7F1E6; text-decoration: none; padding: 12px 20px; box-shadow: 4px 4px 0 #D97A3B;">MY TWENDE →</a>
  </header>

  <div class="tw-pad" style="max-width: 1200px; margin: 0 auto; padding: 40px 24px 80px;">
    <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em;">[Pointi — one value, every border]</div>
    <h1 style="font-family: var(--tz-display); font-size: clamp(40px, 5.5vw, 72px); text-transform: uppercase; line-height: 0.95; margin: 10px 0 6px;">Money moves like family<span style="color: #D97A3B;">.</span></h1>
    <p style="font-size: 15px; color: #3A2F25; max-width: 620px; line-height: 1.55; margin: 0 0 36px;">Top up in dollars, spend in shillings. Points pay for tickets, providers, fuel for the convoy — or pool together for one goal, <em style="font-family: var(--tz-serif);">harambee</em> style. 100 points = $1, everywhere. This is your <strong>personal wallet</strong> — providers keep business income in a separate <a href="/provider-wallet" style="color: #A85A23;">business wallet</a>.</p>

    <div class="tw-2col" style="display: grid; grid-template-columns: 0.9fr 1.3fr; gap: 40px; align-items: start;">

      <!-- Left: balance + actions -->
      <div style="display: grid; gap: 18px;">
        <div style="border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 28px; box-shadow: 6px 6px 0 #D97A3B;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">[Salio — balance]</div>
          <div style="font-family: var(--tz-display); font-size: 58px; line-height: 1; margin: 12px 0 4px;">{{ balanceFmt }} <span style="font-size: 22px; color: #D97A3B;">PTS</span></div>
          <div style="font-family: var(--tz-mono); font-size: 12px; color: rgba(247,241,230,0.7);">{{ equivalents }}</div>
          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button onClick="{{ toggleTopUp }}" aria-expanded="{{ topUpOpen }}" style="flex: 1; font-family: var(--tz-display); font-size: 15px; text-transform: uppercase; background: {{ topUpBg }}; color: #1F3A38; border: 0; padding: 13px; cursor: pointer;">Top up</button>
            <button onClick="{{ toggleSend }}" aria-expanded="{{ sendOpen }}" style="flex: 1; font-family: var(--tz-display); font-size: 15px; text-transform: uppercase; background: {{ sendBg }}; color: #F7F1E6; border: 2px solid rgba(247,241,230,0.5); padding: 11px; cursor: pointer;">Send</button>
            <button onClick="{{ toggleCashOut }}" aria-expanded="{{ cashOpen }}" style="flex: 1; font-family: var(--tz-display); font-size: 15px; text-transform: uppercase; background: {{ cashBg }}; color: #F7F1E6; border: 2px solid rgba(247,241,230,0.5); padding: 11px; cursor: pointer;">Cash out</button>
          </div>

          <!-- Top-up panel -->
          <sc-if value="{{ topUpOpen }}" hint-placeholder-val="{{ false }}">
            <div style="margin-top: 18px; border-top: 1px solid rgba(247,241,230,0.25); padding-top: 16px;">
              <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em; margin-bottom: 10px;">[Ongeza — top up by card]</div>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <sc-for list="{{ topUpOpts }}" as="o" hint-placeholder-count="4">
                  <button onClick="{{ o.buy }}" style="flex: 1; min-width: 90px; font-family: var(--tz-mono); font-size: 12px; border: 2px solid rgba(247,241,230,0.4); background: rgba(247,241,230,0.08); color: #F7F1E6; padding: 12px 8px; cursor: pointer; line-height: 1.5;">{{ o.label }}<br><span style="color: #D97A3B;">{{ o.pts }}</span></button>
                </sc-for>
              </div>
              <sc-if value="{{ topUpPending }}" hint-placeholder-val="{{ false }}">
                <div style="margin-top: 12px; border: 2px solid #D97A3B; background: rgba(217,122,59,0.12); padding: 14px; display: grid; gap: 8px;">
                  <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">[Thibitisha — confirm top-up]</div>
                  <div style="font-size: 13.5px; line-height: 1.55;">{{ topUpSummary }}</div>
                  <div style="display: flex; gap: 8px;">
                    <button onClick="{{ confirmTopUp }}" style="flex: 1; font-family: var(--tz-display); font-size: 13px; text-transform: uppercase; background: #D97A3B; color: #1F3A38; border: 0; padding: 11px; cursor: pointer;">Confirm payment →</button>
                    <button onClick="{{ cancelTopUp }}" style="font-family: var(--tz-mono); font-size: 11px; background: none; color: #F7F1E6; border: 1px solid rgba(247,241,230,0.5); padding: 11px 14px; cursor: pointer;">CANCEL</button>
                  </div>
                </div>
              </sc-if>
              <div style="font-size: 11.5px; color: rgba(247,241,230,0.6); margin-top: 10px; line-height: 1.5;">{{ topUpNote }}</div>
            </div>
          </sc-if>

          <!-- Cash-out panel -->
          <sc-if value="{{ cashOpen }}" hint-placeholder-val="{{ false }}">
            <div style="margin-top: 18px; border-top: 1px solid rgba(247,241,230,0.25); padding-top: 16px; display: grid; gap: 10px;">
              <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">[Toa pesa — withdraw to mobile money or bank]</div>
              <sc-if value="{{ noMethods }}">
                <div style="font-size: 13px; line-height: 1.55;">Add an M-Pesa, MTN MoMo, Airtel Money or bank account first. <a href="/settings?tab=payments" style="color: #E8A472;">Add one in settings →</a></div>
              </sc-if>
              <sc-if value="{{ hasMethods }}">
              <div style="display: flex; gap: 10px;">
                <input type="number" inputmode="numeric" min="1" aria-label="Points to cash out" value="{{ cashAmount }}" onChange="{{ setCashAmount }}" style="flex: 1; min-width: 0; border: 2px solid rgba(247,241,230,0.4); background: rgba(247,241,230,0.08); color: #F7F1E6; padding: 12px 14px; font-family: var(--tz-mono); font-size: 14px; outline: none;">
                <span style="align-self: center; font-family: var(--tz-mono); font-size: 12px; color: rgba(247,241,230,0.6);">PTS</span>
              </div>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <sc-for list="{{ cashDests }}" as="cd" hint-placeholder-count="2">
                  <button onClick="{{ cd.pick }}" aria-pressed="{{ cd.selected }}" style="flex: 1; min-width: 120px; font-family: var(--tz-mono); font-size: 11px; border: 2px solid {{ cd.border }}; background: {{ cd.bg }}; color: #F7F1E6; padding: 10px 8px; cursor: pointer;">{{ cd.label }}</button>
                </sc-for>
              </div>
              <button onClick="{{ confirmCashOut }}" style="font-family: var(--tz-display); font-size: 14px; text-transform: uppercase; background: #D97A3B; color: #1F3A38; border: 0; padding: 12px; cursor: pointer;">{{ cashConfirmLabel }}</button>
              <div style="font-size: 12px; color: rgba(247,241,230,0.65); line-height: 1.5;">{{ cashNote }}</div>
              </sc-if>
            </div>
          </sc-if>

          <!-- Send panel -->
          <sc-if value="{{ sendOpen }}" hint-placeholder-val="{{ false }}">
            <div style="margin-top: 18px; border-top: 1px solid rgba(247,241,230,0.25); padding-top: 16px; display: grid; gap: 10px;">
              <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">[Tuma pointi — send points]</div>
              <input placeholder="To: @handle or email" aria-label="Send to" autocomplete="off" value="{{ recipient }}" onChange="{{ setRecipient }}" style="border: 2px solid rgba(247,241,230,0.4); background: rgba(247,241,230,0.08); color: #F7F1E6; padding: 12px 14px; font-family: var(--tz-sans); font-size: 14px; outline: none;">
              <input placeholder="Note e.g. 'kwa mafuta ya safari'" aria-label="Note" maxlength="140" value="{{ sendNoteVal }}" onChange="{{ setSendNote }}" style="border: 2px solid rgba(247,241,230,0.4); background: rgba(247,241,230,0.08); color: #F7F1E6; padding: 12px 14px; font-family: var(--tz-sans); font-size: 14px; outline: none;">
              <div style="display: flex; gap: 10px;">
                <input type="number" inputmode="numeric" min="1" aria-label="Points to send" value="{{ amount }}" onChange="{{ setAmount }}" style="flex: 1; min-width: 0; border: 2px solid rgba(247,241,230,0.4); background: rgba(247,241,230,0.08); color: #F7F1E6; padding: 12px 14px; font-family: var(--tz-mono); font-size: 14px; outline: none;">
                <button onClick="{{ confirmSend }}" style="font-family: var(--tz-display); font-size: 14px; text-transform: uppercase; background: #D97A3B; color: #1F3A38; border: 0; padding: 0 22px; cursor: pointer;">Send →</button>
              </div>
              <div style="font-size: 12px; color: rgba(247,241,230,0.65); line-height: 1.5;">{{ sendNote }}</div>
            </div>
          </sc-if>
        </div>

        <!-- Cash-outs on their way -->
        <sc-if value="{{ hasPending }}">
          <div style="border: 2px solid #1F3A38; background: #FBEED8;">
            <div style="padding: 12px 20px; border-bottom: 2px solid #1F3A38; font-family: var(--tz-mono); font-size: 11px; color: #7A3E0F; letter-spacing: 0.08em;">[CASH-OUTS ON THEIR WAY]</div>
            <sc-for list="{{ pendingCashOuts }}" as="po">
              <div style="display: flex; justify-content: space-between; gap: 12px; padding: 12px 20px; border-bottom: 1px solid #E8D5B5; font-size: 13px;">
                <span><strong>{{ po.pointsLabel }}</strong> to {{ po.to }}<br><span style="font-family: var(--tz-mono); font-size: 10.5px; color: #7A3E0F;">{{ po.reference }} · {{ po.since }}</span></span>
                <span style="font-family: var(--tz-mono); font-size: 10.5px; color: #7A3E0F; text-align: right;">{{ po.status }}</span>
              </div>
            </sc-for>
          </div>
        </sc-if>

        <!-- Recent activity -->
        <div style="border: 2px solid #1F3A38; background: #FFFDF8;">
          <div style="padding: 14px 20px; border-bottom: 2px solid #1F3A38; font-family: var(--tz-display); font-size: 17px; text-transform: uppercase;">Recent activity</div>
          <div style="max-height: 420px; overflow-y: auto;">
          <sc-if value="{{ noActivity }}">
            <div style="padding: 20px; font-size: 13.5px; color: #6E6155; line-height: 1.55;">No movements yet. Top up, receive points from family, or earn them by inviting friends.</div>
          </sc-if>
          <sc-for list="{{ activity }}" as="a" hint-placeholder-count="4">
            <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 14px; align-items: center; padding: 13px 20px; border-bottom: 1px solid #E3D9C6;">
              <span style="width: 30px; height: 30px; border: 2px solid #1F3A38; background: {{ a.iconBg }}; color: {{ a.iconFg }}; font-family: var(--tz-mono); font-size: 13px; display: flex; align-items: center; justify-content: center;">{{ a.icon }}</span>
              <div>
                <div style="font-size: 13.5px; font-weight: 600;">{{ a.title }}</div>
                <div style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155; margin-top: 2px;">{{ a.meta }}</div>
              </div>
              <span style="font-family: var(--tz-display); font-size: 16px; color: {{ a.color }};">{{ a.amount }}</span>
            </div>
          </sc-for>
          </div>
          <div style="padding: 11px 20px; border-top: 2px solid #1F3A38; display: flex; justify-content: space-between; align-items: center;">
            <sc-if value="{{ hasMore }}"><button onClick="{{ loadMore }}" aria-busy="{{ loadingMore }}" style="font-family: var(--tz-mono); font-size: 11px; border: 0; background: none; color: #A85A23; text-decoration: underline; cursor: pointer; padding: 0;">LOAD EARLIER</button></sc-if>
            <sc-if value="{{ noMore }}"><span style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">{{ activityCount }}</span></sc-if>
            <a href="/api/wallet/statement" download style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #1F3A38; background: #F7F1E6; color: #14201F; padding: 7px 11px; text-decoration: none;">↓ FULL STATEMENT (CSV)</a>
          </div>
        </div>
      </div>

      <!-- Right: harambee pools -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
          <h2 style="font-family: var(--tz-display); font-size: 28px; text-transform: uppercase; margin: 0;">Harambee pools<span style="color: #D97A3B;">.</span></h2>
          <button onClick="{{ toggleNewPool }}" aria-expanded="{{ newPoolOpen }}" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: {{ newPoolBg }}; color: {{ newPoolFg }}; padding: 9px 14px; cursor: pointer;">+ START A POOL</button>
        </div>

        <!-- New pool form -->
        <sc-if value="{{ newPoolOpen }}" hint-placeholder-val="{{ false }}">
          <div style="border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 20px 22px; margin-bottom: 16px;">
            <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em; margin-bottom: 10px;">[Anzisha mchango — start a pool]</div>
            <div style="display: grid; gap: 10px;">
              <input placeholder="What is it for? e.g. 'Sound system for the harambee'" aria-label="Pool name" maxlength="80" value="{{ poolName }}" onChange="{{ setPoolName }}" style="border: 2px solid rgba(247,241,230,0.4); background: rgba(247,241,230,0.08); color: #F7F1E6; padding: 12px 14px; font-family: var(--tz-sans); font-size: 14px; outline: none;">
              <div style="display: flex; gap: 10px;">
                <input type="number" inputmode="numeric" min="100" placeholder="Goal in points (10,000 = $100)" aria-label="Goal in points" value="{{ poolGoal }}" onChange="{{ setPoolGoal }}" style="flex: 1; min-width: 0; border: 2px solid rgba(247,241,230,0.4); background: rgba(247,241,230,0.08); color: #F7F1E6; padding: 12px 14px; font-family: var(--tz-mono); font-size: 14px; outline: none;">
                <button onClick="{{ createPool }}" style="font-family: var(--tz-display); font-size: 14px; text-transform: uppercase; background: #D97A3B; color: #1F3A38; border: 0; padding: 0 22px; cursor: pointer;">Create →</button>
              </div>
              <div style="font-size: 12px; color: rgba(247,241,230,0.65); line-height: 1.5;">You get a share link. Members anywhere can chip in points, and you release the pot to your wallet when you are ready.</div>
            </div>
          </div>
        </sc-if>

        <div style="display: grid; gap: 16px;">
          <sc-if value="{{ noPools }}">
            <div style="border: 2px dashed #1F3A38; background: #FFFDF8; padding: 22px 24px; font-size: 14px; color: #6E6155; line-height: 1.55;">No pools yet. Start one for the tents, the DJ or the convoy fuel, and share the link with the family group.</div>
          </sc-if>
          <sc-for list="{{ pools }}" as="p" hint-placeholder-count="3">
            <div id="{{ p.anchor }}" style="border: 2px solid {{ p.border }}; background: #FFFDF8; padding: 22px 24px; box-shadow: {{ p.shadow }};">
              <div style="display: flex; justify-content: space-between; gap: 16px; align-items: baseline; flex-wrap: wrap;">
                <div>
                  <div style="font-family: var(--tz-display); font-size: 20px; text-transform: uppercase;">{{ p.title }}</div>
                  <div style="font-family: var(--tz-mono); font-size: 11.5px; color: #6E6155; margin-top: 4px;">{{ p.meta }}</div>
                </div>
                <span style="font-family: var(--tz-mono); font-size: 11px; background: {{ p.statusBg }}; border: 1px solid #1F3A38; padding: 4px 9px; white-space: nowrap;">{{ p.status }}</span>
              </div>
              <div style="margin-top: 16px;">
                <div style="display: flex; justify-content: space-between; font-family: var(--tz-mono); font-size: 12px; margin-bottom: 6px;">
                  <span style="color: #A85A23;">{{ p.raised }} raised</span>
                  <span style="color: #6E6155;">goal {{ p.goal }}</span>
                </div>
                <div style="height: 14px; border: 2px solid #1F3A38; background: #EFE7D6;">
                  <div style="height: 100%; width: {{ p.pct }}; background: {{ p.barColor }}; transition: width 300ms ease;"></div>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px; gap: 12px; flex-wrap: wrap;">
                <div style="display: flex; align-items: center;">
                  <sc-for list="{{ p.contributors }}" as="c" hint-placeholder-count="4">
                    <span style="width: 30px; height: 30px; border: 2px solid #F7F1E6; background: {{ c.bg }}; color: {{ c.fg }}; font-family: var(--tz-display); font-size: 12px; display: inline-flex; align-items: center; justify-content: center; margin-left: -8px;">{{ c.init }}</span>
                  </sc-for>
                  <span style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155; margin-left: 10px;">{{ p.countLabel }}</span>
                </div>
                <div style="display: flex; gap: 8px;">
                  <sc-if value="{{ p.releasable }}">
                    <button onClick="{{ p.release }}" style="font-family: var(--tz-display); font-size: 13px; text-transform: uppercase; background: #1F3A38; color: #F7F1E6; border: 2px solid #1F3A38; padding: 9px 16px; cursor: pointer;">Release to my wallet</button>
                  </sc-if>
                  <sc-if value="{{ p.canChip }}">
                  <button onClick="{{ p.chipIn }}" aria-expanded="{{ p.chipOpen }}" style="font-family: var(--tz-display); font-size: 13px; text-transform: uppercase; background: {{ p.chipBg }}; color: {{ p.chipFg }}; border: 2px solid #1F3A38; padding: 9px 16px; cursor: pointer;">{{ p.chipLabel }}</button>
                  </sc-if>
                  <button onClick="{{ p.share }}" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 9px 12px; cursor: pointer;">{{ p.shareLabel }}</button>
                </div>
              </div>
              <sc-if value="{{ p.chipOpen }}" hint-placeholder-val="{{ false }}">
                <div style="margin-top: 12px; border-top: 1px dashed #C9BFB1; padding-top: 12px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                  <span style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23;">CHIP IN:</span>
                  <sc-for list="{{ p.chipAmts }}" as="ca" hint-placeholder-count="3">
                    <button onClick="{{ ca.give }}" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #FFFDF8; padding: 8px 14px; cursor: pointer;">{{ ca.label }}</button>
                  </sc-for>
                  <span style="font-size: 11.5px; color: #6E6155;">from your balance ({{ balanceFmtSmall }} pts)</span>
                </div>
              </sc-if>
            </div>
          </sc-for>
        </div>

        <div style="margin-top: 18px; border: 1px dashed #A85A23; background: #FBEED8; padding: 16px 18px; font-size: 13px; line-height: 1.55; color: #7A3E0F;">
          <strong>How pools work:</strong> anyone with a Twendezetu account can chip in points from any country — topping up by card first if they need to. Every contribution is recorded, and only the person who started the pool can release it. {{ poolReviewNote }}
        </div>
      </div>
    </div>
  </div>


  <!-- Footer strip -->
  <footer style="border-top: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 20px 24px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; font-family: var(--tz-mono); font-size: 12px;">
    <span>TWENDEZETU · 1 POINT = 1 US CENT · EVERY MOVEMENT IS RECORDED IN A DOUBLE-ENTRY LEDGER</span>
    <a href="/" style="color: #E8A472;">← BACK TO THE GUIDE</a>
  </footer>
</div>
`;

export default template;
