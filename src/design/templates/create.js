// Markup for the create page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh;">

  <!-- Header -->
  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 18px 24px; border-bottom: 2px solid #1F3A38; background: #F7F1E6; position: sticky; top: 0; z-index: 40;">
    <a href="/" style="text-decoration: none; color: #14201F; font-family: var(--tz-display); font-size: 26px; text-transform: uppercase; line-height: 0.9;">TWENDE<br><span style="color: #D97A3B;">ZETU</span></a>
    <div class="tw-hide-sm" style="font-family: var(--tz-mono); font-size: 12px; color: #6E6155;">POSTING IS FREE · YOUR CONTACTS STAY MASKED</div>
    <a href="/" style="font-size: 14px; font-weight: 600; color: #14201F; text-decoration: none;">Exit ✕</a>
  </header>

  <div class="tw-main" style="max-width: 1100px; margin: 0 auto; padding: 40px 24px 80px; display: grid; grid-template-columns: 240px 1fr; gap: 48px; align-items: start;">

    <!-- Stepper rail -->
    <aside class="tw-sticky" style="position: sticky; top: 96px;">
      <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em; margin-bottom: 16px;">[Hatua — steps]</div>
      <sc-for list="{{ steps }}" as="s" hint-placeholder-count="4">
        <button onClick="{{ s.go }}" style="display: grid; grid-template-columns: 34px 1fr; gap: 12px; align-items: center; width: 100%; text-align: left; background: none; border: 0; padding: 10px 0; cursor: pointer;">
          <span style="width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; font-family: var(--tz-display); font-size: 15px; border: 2px solid #1F3A38; background: {{ s.bg }}; color: {{ s.fg }};">{{ s.num }}</span>
          <span style="font-size: 14px; font-weight: {{ s.weight }}; color: {{ s.labelColor }};">{{ s.label }}</span>
        </button>
      </sc-for>
      <div style="margin-top: 24px; border: 1px dashed #A85A23; background: #FBEED8; padding: 14px; font-size: 12.5px; line-height: 1.5; color: #7A3E0F;">
        <strong>Why masked?</strong> Providers respond in-platform. Your email &amp; phone are never shown until you choose to reveal them.
      </div>
    </aside>

    <!-- Step content -->
    <main>
      <!-- STEP 1 -->
      <sc-if value="{{ isStep1 }}" hint-placeholder-val="{{ true }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(36px, 5vw, 56px); text-transform: uppercase; line-height: 0.95; margin: 0 0 8px;">What are you posting<span style="color: #D97A3B;">?</span></h1>
          <p style="font-size: 15px; color: #6E6155; margin: 0 0 28px;">Both are free. Both get a shareable link. Both can be found by providers.</p>
          <div class="tw-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px;">
            <button onClick="{{ pickEvent }}" style="text-align: left; background: {{ eventCardBg }}; color: {{ eventCardFg }}; border: 2px solid #1F3A38; padding: 28px; cursor: pointer; box-shadow: {{ eventCardShadow }};">
              <div style="font-family: var(--tz-mono); font-size: 12px; opacity: 0.7;">(01)</div>
              <div style="font-family: var(--tz-display); font-size: 28px; text-transform: uppercase; margin: 28px 0 10px;">An event</div>
              <div style="font-size: 14px; line-height: 1.55; opacity: 0.85;">A festival, cookout, harusi, fundraiser, or show. Free RSVP or ticket tiers with early-bird pricing.</div>
            </button>
            <button onClick="{{ pickNeed }}" style="text-align: left; background: {{ needCardBg }}; color: {{ needCardFg }}; border: 2px solid #1F3A38; padding: 28px; cursor: pointer; box-shadow: {{ needCardShadow }};">
              <div style="font-family: var(--tz-mono); font-size: 12px; opacity: 0.7;">(02)</div>
              <div style="font-family: var(--tz-display); font-size: 28px; text-transform: uppercase; margin: 28px 0 10px;">A need</div>
              <div style="font-size: 14px; line-height: 1.55; opacity: 0.85;">"Driver needed Kampala → Jinja." "DJ for a cookout." Providers offer; you compare and accept.</div>
            </button>
          </div>
          <button onClick="{{ next }}" style="margin-top: 28px; font-family: var(--tz-display); font-size: 16px; text-transform: uppercase; background: #D97A3B; color: #1F3A38; border: 2px solid #1F3A38; padding: 14px 32px; cursor: pointer; box-shadow: 4px 4px 0 #1F3A38;">Continue →</button>
        </div>
      </sc-if>

      <!-- STEP 2 -->
      <sc-if value="{{ isStep2 }}" hint-placeholder-val="{{ false }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(36px, 5vw, 56px); text-transform: uppercase; line-height: 0.95; margin: 0 0 8px;">The details<span style="color: #D97A3B;">.</span></h1>
          <p style="font-size: 15px; color: #6E6155; margin: 0 0 28px;">Shown pre-filled with a real example — a need posted from the diaspora.</p>
          <div style="display: grid; gap: 18px; max-width: 640px;">
            <label style="display: grid; gap: 6px;">
              <span style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23;">TITLE *</span>
              <input value="Driver + 4x4 needed, Kampala → Jinja" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 14px 16px; font-family: var(--tz-sans); font-size: 15px; outline: none;">
            </label>
            <div class="tw-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px;">
              <label style="display: grid; gap: 6px;">
                <span style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23;">CITY / AREA *</span>
                <input value="Kampala, Uganda" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 14px 16px; font-family: var(--tz-sans); font-size: 15px; outline: none;">
              </label>
              <label style="display: grid; gap: 6px;">
                <span style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23;">CATEGORY *</span>
                <select style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 14px 16px; font-family: var(--tz-sans); font-size: 15px; outline: none;">
                  <option>Transport & drivers</option><option>DJs & music</option><option>Catering & chefs</option><option>Tents & equipment</option><option>Photography</option>
                </select>
              </label>
            </div>
            <div class="tw-3col" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px;">
              <label style="display: grid; gap: 6px;">
                <span style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23;">FROM *</span>
                <input type="date" value="2026-09-12" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 13px 16px; font-family: var(--tz-sans); font-size: 14px; outline: none;">
              </label>
              <label style="display: grid; gap: 6px;">
                <span style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23;">TO</span>
                <input type="date" value="2026-09-14" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 13px 16px; font-family: var(--tz-sans); font-size: 14px; outline: none;">
              </label>
              <label style="display: grid; gap: 6px;">
                <span style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23;">BUDGET (OPTIONAL)</span>
                <input value="UGX 400,000 / day" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 13px 16px; font-family: var(--tz-sans); font-size: 14px; outline: none;">
              </label>
            </div>
            <div style="font-size: 12px; color: #6E6155; line-height: 1.5; margin-top: -8px;">🕐 Times are <strong>venue-local</strong> (Africa/Kampala, EAT). Viewers abroad automatically also see it in their own time zone — e.g. 6:00 AM EDT for New York.</div>

            <!-- Ticketing (events only) -->
            <sc-if value="{{ isEventKind }}" hint-placeholder-val="{{ false }}">
              <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 20px 22px;">
                <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em; margin-bottom: 12px;">[Tiketi — how do people get in?]</div>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                  <button onClick="{{ pickFree }}" style="flex: 1; min-width: 160px; text-align: left; border: 2px solid #1F3A38; background: {{ freeBg }}; color: {{ freeFg }}; padding: 14px 16px; cursor: pointer;">
                    <div style="font-family: var(--tz-display); font-size: 17px; text-transform: uppercase;">Free RSVP</div>
                    <div style="font-size: 12px; opacity: 0.8; margin-top: 3px;">No charge, ever. Guests RSVP and get reminders.</div>
                  </button>
                  <button onClick="{{ pickPaid }}" style="flex: 1; min-width: 160px; text-align: left; border: 2px solid #1F3A38; background: {{ paidBg }}; color: {{ paidFg }}; padding: 14px 16px; cursor: pointer;">
                    <div style="font-family: var(--tz-display); font-size: 17px; text-transform: uppercase;">Sell tickets</div>
                    <div style="font-size: 12px; opacity: 0.8; margin-top: 3px;">Tiers + early-bird. 5% fee only when tickets sell.</div>
                  </button>
                </div>
                <sc-if value="{{ isPaid }}" hint-placeholder-val="{{ false }}">
                  <div style="margin-top: 14px; display: grid; gap: 10px;">
                    <sc-for list="{{ tierRows }}" as="tr" hint-placeholder-count="2">
                      <div style="display: grid; grid-template-columns: 1.4fr 1fr 1fr auto; gap: 10px; align-items: center;">
                        <input value="{{ tr.name }}" style="border: 2px solid #1F3A38; background: #F7F1E6; padding: 11px 13px; font-family: var(--tz-sans); font-size: 13.5px; outline: none;">
                        <input value="{{ tr.price }}" style="border: 2px solid #1F3A38; background: #F7F1E6; padding: 11px 13px; font-family: var(--tz-mono); font-size: 13px; outline: none;">
                        <input value="{{ tr.qty }}" style="border: 2px solid #1F3A38; background: #F7F1E6; padding: 11px 13px; font-family: var(--tz-mono); font-size: 13px; outline: none;">
                        <button onClick="{{ tr.remove }}" style="border: 2px solid #B8463A; color: #B8463A; background: none; font-family: var(--tz-mono); font-size: 11px; padding: 10px 12px; cursor: pointer;">✕</button>
                      </div>
                    </sc-for>
                    <button onClick="{{ addTier }}" style="border: 2px dashed #A85A23; background: #FBEED8; color: #7A3E0F; font-family: var(--tz-mono); font-size: 12px; padding: 11px; cursor: pointer;">+ ADD TIER (E.G. EARLY BIRD −20%, VIP)</button>
                    <div style="font-size: 12px; color: #6E6155; line-height: 1.5;">Early-bird tiers auto-close on the date you set. Payouts land in your wallet after the event, minus the 5% fee. Buyers pay online or reserve &amp; pay at the door.</div>
                  </div>
                </sc-if>
              </div>
            </sc-if>
            <label style="display: grid; gap: 6px;">
              <span style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23;">DESCRIBE IT</span>
              <textarea rows="4" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 14px 16px; font-family: var(--tz-sans); font-size: 15px; outline: none; resize: vertical;">Visiting from the US to surprise family. Need a reliable driver with a 4x4 that can handle village roads. Two days, fuel included in offer please.</textarea>
            </label>
          </div>
          <div style="display: flex; gap: 12px; margin-top: 28px;">
            <button onClick="{{ back }}" style="font-family: var(--tz-mono); font-size: 13px; background: none; border: 2px solid #1F3A38; padding: 14px 22px; cursor: pointer;">← BACK</button>
            <button onClick="{{ next }}" style="font-family: var(--tz-display); font-size: 16px; text-transform: uppercase; background: #D97A3B; color: #1F3A38; border: 2px solid #1F3A38; padding: 14px 32px; cursor: pointer; box-shadow: 4px 4px 0 #1F3A38;">Continue →</button>
          </div>
        </div>
      </sc-if>

      <!-- STEP 3 -->
      <sc-if value="{{ isStep3 }}" hint-placeholder-val="{{ false }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(36px, 5vw, 56px); text-transform: uppercase; line-height: 0.95; margin: 0 0 8px;">Privacy &amp; alerts<span style="color: #D97A3B;">.</span></h1>
          <p style="font-size: 15px; color: #6E6155; margin: 0 0 28px;">You control who sees what, and how often we nudge you.</p>
          <div style="display: grid; gap: 14px; max-width: 640px;">
            <sc-for list="{{ privacyRows }}" as="row" hint-placeholder-count="4">
              <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 18px 20px; display: grid; grid-template-columns: 1fr auto; gap: 18px; align-items: center;">
                <div>
                  <div style="font-weight: 700; font-size: 15px;">{{ row.title }}</div>
                  <div style="font-size: 13px; color: #6E6155; margin-top: 3px; line-height: 1.5;">{{ row.desc }}</div>
                </div>
                <button onClick="{{ row.toggle }}" style="width: 58px; height: 30px; border: 2px solid #1F3A38; background: {{ row.bg }}; cursor: pointer; position: relative; padding: 0;">
                  <span style="position: absolute; top: 2px; left: {{ row.knobLeft }}; width: 22px; height: 22px; background: #1F3A38; transition: left 120ms ease;"></span>
                </button>
              </div>
            </sc-for>
          </div>
          <div style="display: flex; gap: 12px; margin-top: 28px;">
            <button onClick="{{ back }}" style="font-family: var(--tz-mono); font-size: 13px; background: none; border: 2px solid #1F3A38; padding: 14px 22px; cursor: pointer;">← BACK</button>
            <button onClick="{{ next }}" style="font-family: var(--tz-display); font-size: 16px; text-transform: uppercase; background: #D97A3B; color: #1F3A38; border: 2px solid #1F3A38; padding: 14px 32px; cursor: pointer; box-shadow: 4px 4px 0 #1F3A38;">Publish →</button>
          </div>
        </div>
      </sc-if>

      <!-- STEP 4 -->
      <sc-if value="{{ isStep4 }}" hint-placeholder-val="{{ false }}">
        <div>
          <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23;">[Imechapishwa — published]</div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(40px, 6vw, 68px); text-transform: uppercase; line-height: 0.95; margin: 8px 0;">Live<span style="color: #D97A3B;">.</span> Sasa share it<span style="color: #D97A3B;">.</span></h1>
          <p style="font-size: 15px; color: #3A2F25; max-width: 560px; line-height: 1.55;">Your post is on the needs board. It was also <strong>added to your calendar</strong> with reminders, and <strong>6 providers</strong> in Kampala matching "Transport &amp; drivers" have been notified.</p>
          <div style="border: 2px solid #1F3A38; background: #FFFDF8; box-shadow: 6px 6px 0 #D97A3B; padding: 24px; max-width: 560px; margin-top: 24px;">
            <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23;">[Your shareable link]</div>
            <div style="display: flex; border: 2px solid #1F3A38; margin-top: 10px;">
              <input value="twende.to/n/driver-kla-jinja" readOnly style="flex: 1; border: 0; background: #EFE7D6; font-family: var(--tz-mono); font-size: 13px; padding: 12px 14px; outline: none;">
              <button onClick="{{ copyLink }}" style="border: 0; border-left: 2px solid #1F3A38; background: #D97A3B; font-family: var(--tz-mono); font-size: 12px; padding: 0 16px; cursor: pointer;">{{ copyLabel }}</button>
            </div>
            <div style="display: flex; gap: 8px; margin-top: 10px;">
              <button style="flex: 1; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 11px; cursor: pointer;">WHATSAPP</button>
              <button style="flex: 1; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 11px; cursor: pointer;">FACEBOOK</button>
              <button style="flex: 1; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 11px; cursor: pointer;">X</button>
              <button style="flex: 1; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 11px; cursor: pointer;">EMAIL</button>
            </div>
            <div style="font-size: 12.5px; color: #6E6155; margin-top: 12px; line-height: 1.5;">Anyone who opens the link sees the post — your email and phone stay hidden. Offers arrive in your <a href="/my-twende" style="color: #A85A23;">My Twende inbox</a>.</div>
          </div>
          <div style="display: flex; gap: 12px; margin-top: 28px;">
            <a href="/my-twende?tab=posts" style="font-family: var(--tz-display); font-size: 16px; text-transform: uppercase; background: #1F3A38; color: #F7F1E6; border: 2px solid #1F3A38; padding: 14px 32px; text-decoration: none; box-shadow: 4px 4px 0 #D97A3B;">Go to My Twende →</a>
            <button onClick="{{ restart }}" style="font-family: var(--tz-mono); font-size: 13px; background: none; border: 2px solid #1F3A38; padding: 14px 22px; cursor: pointer;">POST ANOTHER</button>
          </div>
        </div>
      </sc-if>
    </main>
  </div>
</div>
`;

export default template;
