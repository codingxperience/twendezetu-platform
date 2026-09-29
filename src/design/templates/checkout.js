// Markup for the checkout page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh;">

  <!-- Header -->
  <header style="display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; border-bottom: 2px solid #1F3A38; background: #F7F1E6; position: sticky; top: 0; z-index: 40;">
    <a href="/" class="tz-logo-link" aria-label="Twendezetu home"><img src="/brand/logo.png" alt="Twendezetu" width="1211" height="229" class="tz-logo tz-logo--md"></a>
    <div style="font-family: var(--tz-mono); font-size: 12px; color: #6E6155;">SECURE CHECKOUT · FEES ONLY WHEN MONEY MOVES</div>
    <a href="{{ exitHref }}" style="font-size: 14px; font-weight: 600; color: #14201F; text-decoration: none;">Exit ✕</a>
  </header>

  <div style="max-width: 1200px; margin: 0 auto; padding: 40px 24px 80px;">
    <div style="font-family: var(--tz-mono); font-size: 12px; color: #820101; letter-spacing: 0.08em;">[Tiketi — get tickets]</div>
    <h1 style="font-family: var(--tz-display); font-size: clamp(38px, 5.5vw, 68px); text-transform: uppercase; line-height: 0.95; margin: 10px 0 6px;">{{ eventTitle }}<span style="color: #820101;">.</span></h1>
    <div style="display: flex; gap: 10px; flex-wrap: wrap; font-family: var(--tz-mono); font-size: 12.5px; margin-bottom: 36px;">
      <span style="background: #1F3A38; color: #F7F1E6; padding: 6px 12px;">{{ dateLine }}</span>
      <span style="border: 2px solid #1F3A38; padding: 4px 12px;">{{ venue }}</span>
      <sc-if value="{{ testMode }}">
        <span style="border: 2px solid #820101; color: #820101; padding: 4px 12px;">TEST MODE — NO CARD IS CHARGED</span>
      </sc-if>
    </div>

    <div class="tw-2col" style="display: grid; grid-template-columns: 1.5fr 0.9fr; gap: 48px; align-items: start;">

      <!-- Tiers -->
      <div>
        <div style="border-top: 2px solid #1F3A38;">
          <sc-for list="{{ tiers }}" as="t" hint-placeholder-count="3">
            <div style="display: grid; grid-template-columns: 1fr auto auto; gap: 24px; align-items: center; padding: 22px 4px; border-bottom: 2px solid #1F3A38; opacity: {{ t.opacity }};">
              <div>
                <div style="display: flex; gap: 10px; align-items: center;">
                  <span style="font-family: var(--tz-display); font-size: 22px; text-transform: uppercase;">{{ t.name }}</span>
                  <sc-if value="{{ t.tag }}" hint-placeholder-val="{{ false }}">
                    <span style="background: #820101; border: 1px solid #1F3A38; font-family: var(--tz-mono); font-size: 10px; padding: 3px 8px; color: #F7F1E6;">{{ t.tag }}</span>
                  </sc-if>
                </div>
                <div style="font-size: 13px; color: #6E6155; margin-top: 4px;">{{ t.desc }}</div>
              </div>
              <div style="text-align: right;">
                <sc-if value="{{ t.was }}" hint-placeholder-val="{{ false }}">
                  <div style="font-family: var(--tz-mono); font-size: 12px; color: #8C7F6F; text-decoration: line-through;">{{ t.was }}</div>
                </sc-if>
                <div style="font-family: var(--tz-display); font-size: 22px; color: #820101;">{{ t.price }}</div>
                <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #6E6155;">incl. tax + fee</div>
              </div>
              <sc-if value="{{ t.soldOut }}" hint-placeholder-val="{{ false }}">
                <button onClick="{{ t.waitlist }}" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #1F3A38; background: {{ t.wlBg }}; color: {{ t.wlFg }}; padding: 9px 12px; cursor: pointer; white-space: nowrap;">{{ t.wlLabel }}</button>
              </sc-if>
              <sc-if value="{{ t.available }}" hint-placeholder-val="{{ true }}">
                <div style="display: flex; align-items: center; border: 2px solid #1F3A38; background: #FFFDF8;">
                  <button onClick="{{ t.minus }}" style="width: 38px; height: 40px; border: 0; background: none; font-size: 17px; cursor: pointer; color: #14201F;">−</button>
                  <span style="width: 34px; text-align: center; font-family: var(--tz-display); font-size: 17px;">{{ t.qty }}</span>
                  <button onClick="{{ t.plus }}" style="width: 38px; height: 40px; border: 0; background: none; font-size: 17px; cursor: pointer; color: #14201F;">+</button>
                </div>
              </sc-if>
            </div>
          </sc-for>
        </div>
        <div style="margin-top: 16px; border: 1px dashed #820101; background: #FBEED8; padding: 14px 16px; font-size: 13px; line-height: 1.55; color: #5C0000;">
          {{ incentive }}
        </div>

        <!-- Group buying -->
        <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 16px 18px; margin-top: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
            <div>
              <div style="font-family: var(--tz-display); font-size: 17px; text-transform: uppercase;">Buying for a group?</div>
              <div style="font-size: 12.5px; color: #6E6155; margin-top: 2px;">Name each guest so everyone gets their own QR — or split the bill by link.</div>
            </div>
            <button onClick="{{ toggleGroup }}" style="width: 50px; height: 26px; border: 2px solid #1F3A38; background: {{ groupBg }}; cursor: pointer; position: relative; padding: 0; flex-shrink: 0;"><span style="position: absolute; top: 2px; left: {{ groupKnob }}; width: 18px; height: 18px; background: #1F3A38; transition: left 120ms;"></span></button>
          </div>
          <sc-if value="{{ groupOpen }}" hint-placeholder-val="{{ false }}">
            <div style="margin-top: 14px; display: grid; gap: 8px;">
              <sc-for list="{{ guestRows }}" as="g" hint-placeholder-count="2">
                <div style="display: grid; grid-template-columns: 22px 1fr; gap: 10px; align-items: center;">
                  <span style="font-family: var(--tz-mono); font-size: 12px; color: #820101;">{{ g.n }}</span>
                  <input value="{{ g.name }}" onChange="{{ g.set }}" placeholder="{{ g.ph }}" style="border: 2px solid #1F3A38; background: #F7F1E6; padding: 10px 12px; font-family: var(--tz-sans); font-size: 13.5px; outline: none;">
                </div>
              </sc-for>
              <div style="display: flex; gap: 8px; margin-top: 4px; flex-wrap: wrap;">
                <button onClick="{{ splitPay }}" style="font-family: var(--tz-mono); font-size: 11.5px; border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 10px 14px; cursor: pointer;">⬡ SPLIT-PAY LINK</button>
                <a href="/split-pay" style="font-family: var(--tz-mono); font-size: 11.5px; border: 2px solid #1F3A38; background: #F7F1E6; color: #14201F; padding: 10px 14px; text-decoration: none;">MY SPLITS →</a>
                <span style="align-self: center; font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">{{ guestCount }} guests · one QR each</span>
              </div>
            </div>
          </sc-if>
        </div>

        <!-- Pay method -->
        <div style="font-family: var(--tz-mono); font-size: 12px; color: #820101; letter-spacing: 0.08em; margin: 32px 0 12px;">[Njia ya malipo — how will you pay?]</div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;" class="tw-3col">
          <sc-for list="{{ methods }}" as="m" hint-placeholder-count="3">
            <button onClick="{{ m.pick }}" style="text-align: left; border: 2px solid #1F3A38; background: {{ m.bg }}; color: {{ m.fg }}; padding: 16px 18px; cursor: pointer; box-shadow: {{ m.shadow }};">
              <div style="font-family: var(--tz-display); font-size: 16px; text-transform: uppercase;">{{ m.title }}</div>
              <div style="font-size: 12px; opacity: 0.8; margin-top: 4px; line-height: 1.4;">{{ m.desc }}</div>
            </button>
          </sc-for>
        </div>
      </div>

      <!-- Order summary -->
      <aside class="tw-sticky" style="position: sticky; top: 100px;">
        <div style="border: 2px solid #1F3A38; background: #FFFDF8; box-shadow: 6px 6px 0 #1F3A38;">
          <div style="padding: 18px 22px; border-bottom: 2px solid #1F3A38; display: flex; justify-content: space-between; align-items: baseline;">
            <span style="font-family: var(--tz-display); font-size: 20px; text-transform: uppercase;">Order</span>
            <button onClick="{{ cycleCurrency }}" style="background: none; border: 1px solid #1F3A38; font-family: var(--tz-mono); font-size: 11px; padding: 4px 10px; cursor: pointer;">{{ currency }} ▾</button>
          </div>
          <div style="padding: 18px 22px; display: grid; gap: 10px; font-size: 14px;">
            <sc-for list="{{ lines }}" as="ln" hint-placeholder-count="2">
              <div style="display: flex; justify-content: space-between;">
                <span>{{ ln.label }}</span>
                <span style="font-family: var(--tz-mono);">{{ ln.amount }}</span>
              </div>
            </sc-for>
            <div style="display: flex; justify-content: space-between; color: #6E6155; font-size: 13px;">
              <span>Platform fee ({{ feePct }})</span>
              <span style="font-family: var(--tz-mono);">{{ feeAmount }}</span>
            </div>
            <sc-if value="{{ promoApplied }}" hint-placeholder-val="{{ false }}">
              <div style="display: flex; justify-content: space-between; color: #4a7c4a; font-size: 13px;">
                <span>Promo NANE20 (new user)</span>
                <span style="font-family: var(--tz-mono);">−{{ promoAmount }}</span>
              </div>
            </sc-if>
            <div style="border-top: 2px solid #1F3A38; padding-top: 12px; display: flex; justify-content: space-between; align-items: baseline;">
              <span style="font-family: var(--tz-display); font-size: 18px; text-transform: uppercase;">Total</span>
              <div style="text-align: right;">
                <div style="font-family: var(--tz-display); font-size: 26px;">{{ total }}</div>
                <div style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">≈ {{ totalAlt }}</div>
              </div>
            </div>
          </div>
          <div style="padding: 0 22px 18px;">
            <div style="display: flex; border: 2px solid #1F3A38; margin-bottom: 12px;">
              <input placeholder="Promo code" value="{{ promoValue }}" onChange="{{ promoInput }}" style="flex: 1; min-width: 0; border: 0; background: #EFE7D6; font-family: var(--tz-mono); font-size: 12px; padding: 11px 12px; outline: none;">
              <button onClick="{{ applyPromo }}" style="border: 0; border-left: 2px solid #1F3A38; background: #820101; font-family: var(--tz-mono); font-size: 11px; padding: 0 14px; cursor: pointer; color: #F7F1E6;">APPLY</button>
            </div>
            <sc-if value="{{ notPaid }}" hint-placeholder-val="{{ true }}">
              <div style="border: 1px dashed #820101; background: #FBEED8; padding: 10px 12px; font-size: 12px; line-height: 1.5; color: #5C0000; margin-bottom: 12px;">{{ guestNote }}</div>
              <div style="display: grid; gap: 8px; margin-bottom: 12px;">
                <div style="font-family: var(--tz-mono); font-size: 11px; color: #820101; letter-spacing: 0.08em;">[Tickets go to this email]</div>
                <input placeholder="Your name" value="{{ buyerName }}" onChange="{{ setBuyerName }}" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 12px 14px; font-family: var(--tz-sans); font-size: 14px; outline: none;">
                <input placeholder="Email for tickets + receipt" value="{{ buyerEmail }}" onChange="{{ setBuyerEmail }}" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 12px 14px; font-family: var(--tz-sans); font-size: 14px; outline: none;">
              </div>
              <button onClick="{{ pay }}" aria-busy="{{ paying }}" style="width: 100%; font-family: var(--tz-display); font-size: 17px; text-transform: uppercase; background: #1F3A38; color: #F7F1E6; border: 2px solid #1F3A38; padding: 15px; cursor: pointer; box-shadow: 4px 4px 0 #E9B4AC;">{{ payLabel }}</button>
              <div style="font-size: 11.5px; color: #6E6155; margin-top: 8px; line-height: 1.45;">{{ buyerHint }} <sc-if value="{{ me.signedOut }}"><a href="{{ signInHref }}" style="color: #820101;">Sign in</a> to pay with points.</sc-if></div>
              <sc-if value="{{ payError }}" hint-placeholder-val="{{ false }}">
                <div style="font-size: 12px; color: #B8463A; margin-top: 8px;">{{ payError }}</div>
              </sc-if>
            </sc-if>
            <sc-if value="{{ paid }}" hint-placeholder-val="{{ false }}">
              <div style="border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 18px 20px;">
                <div style="font-family: var(--tz-display); font-size: 20px; text-transform: uppercase;">{{ paidTitle }}</div>
                <div style="font-family: var(--tz-mono); font-size: 11.5px; color: #E9B4AC; margin-top: 6px;">{{ ticketLine }}</div>
                <div style="font-size: 12px; color: rgba(247,241,230,0.8); line-height: 1.55;">{{ paidNote }}</div>
                <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-top: 12px;">
                  <sc-for list="{{ paidTickets }}" as="tk">
                    <figure style="margin: 0; text-align: center;">
                      <img src="{{ tk.qr }}" alt="QR code for ticket {{ tk.code }}" width="120" height="120" style="width: 120px; height: 120px; background: #F7F1E6; padding: 5px; display: block;">
                      <figcaption style="font-family: var(--tz-mono); font-size: 10.5px; color: #F7F1E6; margin-top: 5px;">{{ tk.code }}<br><span style="color: rgba(247,241,230,0.7);">{{ tk.holderName }}</span></figcaption>
                    </figure>
                  </sc-for>
                </div>
                <sc-if value="{{ me.signedIn }}">
                  <a href="/my-twende?tab=upcoming" style="display: inline-block; margin-top: 12px; font-family: var(--tz-mono); font-size: 11.5px; background: #820101; color: #F7F1E6; padding: 8px 14px; text-decoration: none;">VIEW IN MY TWENDE →</a>
                </sc-if>
                <sc-if value="{{ me.signedOut }}">
                  <div style="font-size: 12px; color: #E9B4AC; line-height: 1.5; margin-top: 12px;">Bookmark this page: its link opens your tickets. The same link is in your email — keep it private.</div>
                </sc-if>
              </div>
            </sc-if>
            <div style="font-size: 12px; color: #6E6155; margin-top: 10px; line-height: 1.5;">{{ afterNote }}</div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</div>
`;

export default template;
