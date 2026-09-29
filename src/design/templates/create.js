// Markup for the create page. Bindings are resolved by src/design/render.js.

const field = 'border: 2px solid #1F3A38; background: #FFFDF8; padding: 14px 16px; font-family: var(--tz-sans); font-size: 15px; outline: none; width: 100%; box-sizing: border-box;';
const label = 'font-family: var(--tz-mono); font-size: 12px; color: #820101;';
const hint = 'font-size: 12px; color: #6E6155; line-height: 1.5;';

const template = `
<div style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh;">

  <!-- Header -->
  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 18px 24px; border-bottom: 2px solid #1F3A38; background: #F7F1E6; position: sticky; top: 0; z-index: 40;">
    <a href="/" class="tz-logo-link" aria-label="Twendezetu home"><img src="/brand/logo.png" alt="Twendezetu" width="1211" height="229" class="tz-logo tz-logo--md"></a>
    <div class="tw-hide-sm" style="font-family: var(--tz-mono); font-size: 12px; color: #6E6155;">{{ headerNote }}</div>
    <a href="{{ exitHref }}" style="font-size: 14px; font-weight: 600; color: #14201F; text-decoration: none;">Exit ✕</a>
  </header>

  <div class="tw-main" style="max-width: 1100px; margin: 0 auto; padding: 40px 24px 80px; display: grid; grid-template-columns: 240px 1fr; gap: 48px; align-items: start;">

    <!-- Stepper rail -->
    <aside class="tw-sticky" style="position: sticky; top: 96px;">
      <div style="font-family: var(--tz-mono); font-size: 12px; color: #820101; letter-spacing: 0.08em; margin-bottom: 16px;">[Hatua — steps]</div>
      <nav aria-label="Steps">
      <sc-for list="{{ steps }}" as="s">
        <button onClick="{{ s.go }}" aria-current="{{ s.current }}" style="display: grid; grid-template-columns: 34px 1fr; gap: 12px; align-items: center; width: 100%; text-align: left; background: none; border: 0; padding: 10px 0; cursor: {{ s.cursor }}; font-family: inherit;">
          <span style="width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; font-family: var(--tz-display); font-size: 15px; border: 2px solid #1F3A38; background: {{ s.bg }}; color: {{ s.fg }};">{{ s.num }}</span>
          <span style="font-size: 14px; font-weight: {{ s.weight }}; color: {{ s.labelColor }};">{{ s.label }}</span>
        </button>
      </sc-for>
      </nav>
      <div style="margin-top: 24px; border: 1px dashed #820101; background: #FBEED8; padding: 14px; font-size: 12.5px; line-height: 1.5; color: #5C0000;">
        <strong>Why masked?</strong> Vendors answer in-platform. Your email and phone are never shown unless you choose to share them when you accept an offer.
      </div>
    </aside>

    <!-- Step content -->
    <section>
      <!-- STEP 1: kind -->
      <sc-if value="{{ isStep1 }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(36px, 5vw, 56px); text-transform: uppercase; line-height: 0.95; margin: 0 0 8px;">What are you posting<span style="color: #820101;">?</span></h1>
          <p style="font-size: 15px; color: #6E6155; margin: 0 0 28px;">Both are free to post. Fees apply only when money moves.</p>
          <div class="tw-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px;">
            <button onClick="{{ pickEvent }}" aria-pressed="{{ isEventKind }}" style="text-align: left; background: {{ eventCardBg }}; color: {{ eventCardFg }}; border: 2px solid #1F3A38; padding: 28px; cursor: pointer; box-shadow: {{ eventCardShadow }}; font-family: inherit;">
              <div style="font-family: var(--tz-mono); font-size: 12px; opacity: 0.7;">(01)</div>
              <div style="font-family: var(--tz-display); font-size: 28px; text-transform: uppercase; margin: 28px 0 10px;">An event</div>
              <div style="font-size: 14px; line-height: 1.55; opacity: 0.85;">A festival, cookout, harusi, fundraiser or show. Free RSVP or ticket tiers. It goes live on Twendezetu with a link to share.</div>
            </button>
            <button onClick="{{ pickNeed }}" aria-pressed="{{ isNeedKind }}" style="text-align: left; background: {{ needCardBg }}; color: {{ needCardFg }}; border: 2px solid #1F3A38; padding: 28px; cursor: pointer; box-shadow: {{ needCardShadow }}; font-family: inherit;">
              <div style="font-family: var(--tz-mono); font-size: 12px; opacity: 0.7;">(02)</div>
              <div style="font-family: var(--tz-display); font-size: 28px; text-transform: uppercase; margin: 28px 0 10px;">A need</div>
              <div style="font-size: 14px; line-height: 1.55; opacity: 0.85;">"Driver needed Kampala → Jinja." "DJ for a cookout." Matching vendors are told, send offers, and you compare and accept.</div>
            </button>
          </div>
          <button onClick="{{ next }}" style="margin-top: 28px; font-family: var(--tz-display); font-size: 16px; text-transform: uppercase; background: #820101; color: #F7F1E6; border: 2px solid #1F3A38; padding: 14px 32px; cursor: pointer; box-shadow: 4px 4px 0 #1F3A38;">Continue →</button>
        </div>
      </sc-if>

      <!-- STEP 2: details -->
      <sc-if value="{{ isStep2 }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(36px, 5vw, 56px); text-transform: uppercase; line-height: 0.95; margin: 0 0 8px;">{{ detailsTitle }}<span style="color: #820101;">.</span></h1>
          <p style="font-size: 15px; color: #6E6155; margin: 0 0 28px;">{{ detailsIntro }}</p>
          <div style="display: grid; gap: 18px; max-width: 640px;">
            <label style="display: grid; gap: 6px;">
              <span style="${label}">TITLE *</span>
              <input value="{{ form.title }}" onChange="{{ set.title }}" maxlength="120" placeholder="{{ titlePlaceholder }}" style="${field}">
            </label>

            <sc-if value="{{ isEventKind }}">
              <label style="display: grid; gap: 6px;">
                <span style="${label}">ONE-LINE SUMMARY * <span style="color: #6E6155;">— shown on the event card</span></span>
                <input value="{{ form.blurb }}" onChange="{{ set.blurb }}" maxlength="240" placeholder="e.g. A diaspora dancefloor — afrobeat, amapiano and gengetone till late." style="${field}">
              </label>
            </sc-if>

            <div class="tw-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px;">
              <label style="display: grid; gap: 6px;">
                <span style="${label}">CATEGORY *</span>
                <select value="{{ form.category }}" onChange="{{ set.category }}" style="${field}">
                  <sc-for list="{{ categories }}" as="c"><option value="{{ c.code }}">{{ c.label }}</option></sc-for>
                </select>
              </label>
              <label style="display: grid; gap: 6px;">
                <span style="${label}">COUNTRY *</span>
                <select value="{{ form.country }}" onChange="{{ set.country }}" aria-disabled="{{ countryLocked }}" style="${field}">
                  <sc-for list="{{ countries }}" as="c"><option value="{{ c.code }}">{{ c.name }}</option></sc-for>
                </select>
              </label>
            </div>
            <sc-if value="{{ countryLocked }}"><div style="${hint} margin-top: -10px;">Country and currency are fixed once posted.</div></sc-if>

            <div class="tw-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px;">
              <sc-if value="{{ isEventKind }}">
                <label style="display: grid; gap: 6px;">
                  <span style="${label}">VENUE *</span>
                  <input value="{{ form.venue }}" onChange="{{ set.venue }}" maxlength="200" placeholder="e.g. Liberty State Park, Picnic Area B" style="${field}">
                </label>
              </sc-if>
              <label style="display: grid; gap: 6px;">
                <span style="${label}">CITY / AREA *</span>
                <input value="{{ form.city }}" onChange="{{ set.city }}" maxlength="80" placeholder="e.g. Kampala" style="${field}">
              </label>
            </div>

            <!-- When -->
            <sc-if value="{{ isEventKind }}">
              <div class="tw-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px;">
                <label style="display: grid; gap: 6px;">
                  <span style="${label}">STARTS *</span>
                  <input type="datetime-local" value="{{ form.startsAt }}" onChange="{{ set.startsAt }}" style="${field} padding: 13px 16px; font-size: 14px;">
                </label>
                <label style="display: grid; gap: 6px;">
                  <span style="${label}">ENDS</span>
                  <input type="datetime-local" value="{{ form.endsAt }}" onChange="{{ set.endsAt }}" style="${field} padding: 13px 16px; font-size: 14px;">
                </label>
              </div>
            </sc-if>
            <sc-if value="{{ isNeedKind }}">
              <div class="tw-3col" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px;">
                <label style="display: grid; gap: 6px;">
                  <span style="${label}">FROM</span>
                  <input type="date" value="{{ form.startsOn }}" onChange="{{ set.startsOn }}" style="${field} padding: 13px 16px; font-size: 14px;">
                </label>
                <label style="display: grid; gap: 6px;">
                  <span style="${label}">TO</span>
                  <input type="date" value="{{ form.endsOn }}" onChange="{{ set.endsOn }}" style="${field} padding: 13px 16px; font-size: 14px;">
                </label>
                <label style="display: grid; gap: 6px;">
                  <span style="${label}">BUDGET ({{ currency }})</span>
                  <input value="{{ form.budget }}" onChange="{{ set.budget }}" inputmode="decimal" placeholder="{{ budgetPlaceholder }}" style="${field} padding: 13px 16px; font-size: 14px;">
                </label>
              </div>
              <label style="display: grid; gap: 6px; max-width: 300px;">
                <span style="${label}">OFFERS CLOSE ON</span>
                <input type="date" value="{{ form.closesAt }}" onChange="{{ set.closesAt }}" style="${field} padding: 13px 16px; font-size: 14px;">
              </label>
            </sc-if>
            <div style="${hint} margin-top: -8px;">{{ timeHint }}</div>

            <!-- Cover (events) -->
            <sc-if value="{{ isEventKind }}">
              <div style="display: grid; gap: 6px;">
                <span style="${label}">COVER PHOTO *</span>
                <div style="display: flex; gap: 14px; align-items: center; flex-wrap: wrap;">
                  <sc-if value="{{ hasCover }}">
                    <img src="{{ form.coverUrl }}" alt="Cover preview" style="width: 160px; height: 100px; object-fit: cover; border: 2px solid #1F3A38; display: block;">
                  </sc-if>
                  <label style="border: 2px dashed #820101; background: #FBEED8; color: #5C0000; font-family: var(--tz-mono); font-size: 12px; padding: 14px 18px; cursor: pointer;">
                    {{ coverLabel }}
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange="{{ uploadCover }}" aria-label="Upload a cover photo" style="position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none;">
                  </label>
                </div>
                <div style="${hint}">JPG, PNG or WebP up to 4 MB. Landscape works best; location data is removed from photos.</div>
              </div>
            </sc-if>

            <!-- Ticketing (events) -->
            <sc-if value="{{ isEventKind }}">
              <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 20px 22px;">
                <div style="font-family: var(--tz-mono); font-size: 12px; color: #820101; letter-spacing: 0.08em; margin-bottom: 12px;">[Tiketi — how do people get in?]</div>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                  <button onClick="{{ pickFree }}" aria-pressed="{{ form.isFree }}" style="flex: 1; min-width: 160px; text-align: left; border: 2px solid #1F3A38; background: {{ freeBg }}; color: {{ freeFg }}; padding: 14px 16px; cursor: pointer; font-family: inherit;">
                    <div style="font-family: var(--tz-display); font-size: 17px; text-transform: uppercase;">Free RSVP</div>
                    <div style="font-size: 12px; opacity: 0.8; margin-top: 3px;">No charge, ever. Guests RSVP and get reminders.</div>
                  </button>
                  <button onClick="{{ pickPaid }}" aria-pressed="{{ isPaid }}" style="flex: 1; min-width: 160px; text-align: left; border: 2px solid #1F3A38; background: {{ paidBg }}; color: {{ paidFg }}; padding: 14px 16px; cursor: pointer; font-family: inherit;">
                    <div style="font-family: var(--tz-display); font-size: 17px; text-transform: uppercase;">Sell tickets</div>
                    <div style="font-size: 12px; opacity: 0.8; margin-top: 3px;">Up to 8 tiers. Buyers pay a {{ feePercent }} service fee; you keep your price.</div>
                  </button>
                </div>
                <sc-if value="{{ kindLocked }}"><div style="${hint} margin-top: 10px;">{{ kindLockedNote }}</div></sc-if>
                <sc-if value="{{ isPaid }}">
                  <div style="margin-top: 14px; display: grid; gap: 10px;">
                    <div class="tw-hide-sm" style="display: grid; grid-template-columns: 1.4fr 1fr 1fr auto; gap: 10px; font-family: var(--tz-mono); font-size: 10.5px; color: #6E6155;">
                      <span>TIER NAME</span><span>PRICE ({{ currency }})</span><span>HOW MANY (BLANK = NO LIMIT)</span><span></span>
                    </div>
                    <sc-for list="{{ tierRows }}" as="tr">
                      <div style="display: grid; grid-template-columns: 1.4fr 1fr 1fr auto; gap: 10px; align-items: center;">
                        <input value="{{ tr.name }}" onChange="{{ tr.setName }}" maxlength="60" aria-label="Tier name" placeholder="e.g. General" style="border: 2px solid #1F3A38; background: #F7F1E6; padding: 11px 13px; font-family: var(--tz-sans); font-size: 13.5px; outline: none; min-width: 0;">
                        <input value="{{ tr.price }}" onChange="{{ tr.setPrice }}" inputmode="decimal" aria-label="Price" placeholder="{{ pricePlaceholder }}" style="border: 2px solid #1F3A38; background: #F7F1E6; padding: 11px 13px; font-family: var(--tz-mono); font-size: 13px; outline: none; min-width: 0;">
                        <input value="{{ tr.qty }}" onChange="{{ tr.setQty }}" inputmode="numeric" aria-label="Quantity" placeholder="{{ tr.qtyPlaceholder }}" style="border: 2px solid #1F3A38; background: #F7F1E6; padding: 11px 13px; font-family: var(--tz-mono); font-size: 13px; outline: none; min-width: 0;">
                        <button onClick="{{ tr.remove }}" aria-label="Remove tier" style="border: 2px solid #B8463A; color: #B8463A; background: none; font-family: var(--tz-mono); font-size: 11px; padding: 10px 12px; cursor: pointer;">✕</button>
                      </div>
                      <sc-if value="{{ tr.soldNote }}"><div style="${hint} margin-top: -4px;">{{ tr.soldNote }}</div></sc-if>
                    </sc-for>
                    <sc-if value="{{ canAddTier }}">
                      <button onClick="{{ addTier }}" style="border: 2px dashed #820101; background: #FBEED8; color: #5C0000; font-family: var(--tz-mono); font-size: 12px; padding: 11px; cursor: pointer;">+ ADD A TIER (E.G. EARLY BIRD, VIP)</button>
                    </sc-if>
                    <div style="${hint}">Ticket money is held in escrow and released to you {{ releaseHours }} hours after the event. Buyers can also reserve and pay at the door.</div>
                  </div>
                </sc-if>
                <sc-if value="{{ form.isFree }}">
                  <label style="display: grid; gap: 6px; margin-top: 14px; max-width: 260px;">
                    <span style="${label}">CAPACITY (BLANK = NO LIMIT)</span>
                    <input value="{{ form.capacity }}" onChange="{{ set.capacity }}" inputmode="numeric" placeholder="e.g. 300" style="${field} padding: 11px 13px; font-size: 14px;">
                  </label>
                </sc-if>
              </div>
            </sc-if>

            <label style="display: grid; gap: 6px;">
              <span style="${label}">DESCRIBE IT *</span>
              <textarea rows="5" value="{{ form.description }}" onChange="{{ set.description }}" maxlength="{{ descriptionMax }}" placeholder="{{ descriptionPlaceholder }}" style="${field} resize: vertical;"></textarea>
            </label>

            <sc-if value="{{ showOrganizer }}">
              <label style="display: grid; gap: 6px;">
                <span style="${label}">HOSTED BY</span>
                <input value="{{ form.organizerName }}" onChange="{{ set.organizerName }}" maxlength="80" style="${field}">
                <span style="${hint}">Your name, or your group's (e.g. "Uongozi · NYTC"). People can follow the host.</span>
              </label>
            </sc-if>
          </div>
          <sc-if value="{{ formError }}">
            <div role="alert" style="margin-top: 18px; max-width: 640px; border: 2px solid #B8463A; background: #FBEED8; color: #5C0000; padding: 12px 16px; font-size: 13.5px;">{{ formError }}</div>
          </sc-if>
          <div style="display: flex; gap: 12px; margin-top: 28px;">
            <sc-if value="{{ canGoBack }}">
              <button onClick="{{ back }}" style="font-family: var(--tz-mono); font-size: 13px; background: none; border: 2px solid #1F3A38; padding: 14px 22px; cursor: pointer;">← BACK</button>
            </sc-if>
            <button onClick="{{ next }}" style="font-family: var(--tz-display); font-size: 16px; text-transform: uppercase; background: #820101; color: #F7F1E6; border: 2px solid #1F3A38; padding: 14px 32px; cursor: pointer; box-shadow: 4px 4px 0 #1F3A38;">Continue →</button>
          </div>
        </div>
      </sc-if>

      <!-- STEP 3: privacy & alerts -->
      <sc-if value="{{ isStep3 }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(36px, 5vw, 56px); text-transform: uppercase; line-height: 0.95; margin: 0 0 8px;">Privacy &amp; alerts<span style="color: #820101;">.</span></h1>
          <p style="font-size: 15px; color: #6E6155; margin: 0 0 28px;">You control who sees what, and how often we nudge you.</p>
          <div style="display: grid; gap: 14px; max-width: 640px;">
            <sc-for list="{{ privacyRows }}" as="row">
              <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 18px 20px; display: grid; grid-template-columns: 1fr auto; gap: 18px; align-items: center;">
                <div>
                  <div style="font-weight: 700; font-size: 15px;">{{ row.title }}</div>
                  <div style="font-size: 13px; color: #6E6155; margin-top: 3px; line-height: 1.5;">{{ row.desc }}</div>
                </div>
                <button onClick="{{ row.toggle }}" role="switch" aria-checked="{{ row.on }}" aria-label="{{ row.title }}" style="width: 58px; height: 30px; border: 2px solid #1F3A38; background: {{ row.bg }}; cursor: pointer; position: relative; padding: 0;">
                  <span style="position: absolute; top: 2px; left: {{ row.knobLeft }}; width: 22px; height: 22px; background: #1F3A38; transition: left 120ms ease;"></span>
                </button>
              </div>
            </sc-for>
          </div>
          <sc-if value="{{ formError }}">
            <div role="alert" style="margin-top: 18px; max-width: 640px; border: 2px solid #B8463A; background: #FBEED8; color: #5C0000; padding: 12px 16px; font-size: 13.5px;">{{ formError }}</div>
          </sc-if>
          <div style="display: flex; gap: 12px; margin-top: 28px; flex-wrap: wrap;">
            <button onClick="{{ back }}" style="font-family: var(--tz-mono); font-size: 13px; background: none; border: 2px solid #1F3A38; padding: 14px 22px; cursor: pointer;">← BACK</button>
            <button onClick="{{ submit }}" aria-busy="{{ saving }}" style="font-family: var(--tz-display); font-size: 16px; text-transform: uppercase; background: #820101; color: #F7F1E6; border: 2px solid #1F3A38; padding: 14px 32px; cursor: pointer; box-shadow: 4px 4px 0 #1F3A38;">{{ submitLabel }}</button>
          </div>
        </div>
      </sc-if>

      <!-- STEP 4: done -->
      <sc-if value="{{ isStep4 }}">
        <div>
          <div style="font-family: var(--tz-mono); font-size: 12px; color: #820101;">{{ doneKicker }}</div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(40px, 6vw, 68px); text-transform: uppercase; line-height: 0.95; margin: 8px 0;">{{ doneTitle }}<span style="color: #820101;">.</span></h1>
          <p style="font-size: 15px; color: #3A2F25; max-width: 560px; line-height: 1.55;">{{ doneText }}</p>
          <sc-if value="{{ hasShare }}">
            <div style="border: 2px solid #1F3A38; background: #FFFDF8; box-shadow: 6px 6px 0 #820101; padding: 24px; max-width: 560px; margin-top: 24px;">
              <div style="font-family: var(--tz-mono); font-size: 11px; color: #820101;">[Your shareable link]</div>
              <div style="display: flex; border: 2px solid #1F3A38; margin-top: 10px;">
                <input value="{{ shareUrl }}" readOnly aria-label="Shareable link" style="flex: 1; min-width: 0; border: 0; background: #EFE7D6; font-family: var(--tz-mono); font-size: 13px; padding: 12px 14px; outline: none;">
                <button onClick="{{ copyLink }}" style="border: 0; border-left: 2px solid #1F3A38; background: #820101; font-family: var(--tz-mono); font-size: 12px; padding: 0 16px; cursor: pointer; color: #F7F1E6;">{{ copyLabel }}</button>
              </div>
              <div style="display: flex; gap: 8px; margin-top: 10px;">
                <a href="{{ waHref }}" target="_blank" rel="noopener" style="flex: 1; text-align: center; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #F7F1E6; color: #14201F; padding: 11px; text-decoration: none;">WHATSAPP</a>
                <a href="{{ fbHref }}" target="_blank" rel="noopener" style="flex: 1; text-align: center; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #F7F1E6; color: #14201F; padding: 11px; text-decoration: none;">FACEBOOK</a>
                <a href="{{ xHref }}" target="_blank" rel="noopener" style="flex: 1; text-align: center; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #F7F1E6; color: #14201F; padding: 11px; text-decoration: none;">X</a>
                <a href="{{ emHref }}" style="flex: 1; text-align: center; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #F7F1E6; color: #14201F; padding: 11px; text-decoration: none;">EMAIL</a>
              </div>
              <div style="font-size: 12.5px; color: #6E6155; margin-top: 12px; line-height: 1.5;">Anyone who opens the link sees the event. Your email and phone stay hidden, and questions reach you in <a href="/messages" style="color: #820101;">Messages</a>.</div>
            </div>
          </sc-if>
          <div style="display: flex; gap: 12px; margin-top: 28px; flex-wrap: wrap;">
            <a href="{{ doneHref }}" style="font-family: var(--tz-display); font-size: 16px; text-transform: uppercase; background: #1F3A38; color: #F7F1E6; border: 2px solid #1F3A38; padding: 14px 32px; text-decoration: none; box-shadow: 4px 4px 0 #E9B4AC;">{{ doneCta }}</a>
            <a href="/my-twende?tab=posts" style="font-family: var(--tz-mono); font-size: 13px; color: #14201F; border: 2px solid #1F3A38; padding: 14px 22px; text-decoration: none;">MY POSTS</a>
            <sc-if value="{{ canPostAnother }}">
              <button onClick="{{ restart }}" style="font-family: var(--tz-mono); font-size: 13px; background: none; border: 2px solid #1F3A38; padding: 14px 22px; cursor: pointer;">POST ANOTHER</button>
            </sc-if>
          </div>
        </div>
      </sc-if>
    </section>
  </div>
</div>
`;

export default template;
