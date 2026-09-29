// Markup for the eventDetail page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh;">

  <!-- Header -->
  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 18px 24px; border-bottom: 2px solid #1F3A38; background: #F7F1E6; position: sticky; top: 0; z-index: 40;">
    <div style="display: flex; align-items: center; gap: 36px;">
      <a href="/" class="tz-logo-link" aria-label="Twendezetu home"><img src="/brand/logo.png" alt="Twendezetu" width="1211" height="229" class="tz-logo tz-logo--md"></a>
      <nav class="tw-nav" style="display: flex; gap: 24px; font-size: 14px; font-weight: 500;">
        <a href="/events" style="color: #6E6155; text-decoration: none;">Events</a>
        <a href="/create-event" style="color: #6E6155; text-decoration: none;">Post an event or need</a>
        <a href="/provider-dashboard" style="color: #6E6155; text-decoration: none;">For vendors</a>
      </nav>
    </div>
    <div style="display: flex; gap: 10px; align-items: center;">
      <sc-if value="{{ me.signedOut }}">
        <a href="{{ signInHref }}" style="font-size: 14px; font-weight: 600; color: #14201F; text-decoration: none; padding: 10px 16px;">Sign in</a>
      </sc-if>
      <a href="/my-twende" style="font-family: var(--tz-mono); font-size: 13px; background: #1F3A38; color: #F7F1E6; text-decoration: none; padding: 12px 20px; box-shadow: 4px 4px 0 #D97A3B;">MY TWENDE →</a>
    </div>
  </header>

  <!-- Guest banner -->
  <div style="background: #1F3A38; color: #F7F1E6; font-family: var(--tz-mono); font-size: 12px; padding: 10px 24px; text-align: center; line-height: 1.5;">
    {{ bannerText }}
  </div>

  <div style="max-width: 1200px; margin: 0 auto; padding: 20px 24px 0; font-family: var(--tz-mono); font-size: 12px; color: #6E6155;">
    <a href="/" style="color: #A85A23;">← Back to guide</a> · {{ category }} · {{ price }}
  </div>

  <!-- Title block -->
  <section style="max-width: 1200px; margin: 0 auto; padding: 18px 24px 28px;">
    <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em;">[Tukio — event]</div>
    <h1 style="font-family: var(--tz-display); font-size: clamp(40px, 6.5vw, 92px); text-transform: uppercase; line-height: 0.92; margin: 8px 0 0;">{{ title }}<span style="color: #D97A3B;">.</span></h1>
    <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 18px; font-family: var(--tz-mono); font-size: 13px;">
      <span style="background: #1F3A38; color: #F7F1E6; padding: 8px 14px;">{{ dateLine }}</span>
      <span style="border: 2px solid #1F3A38; padding: 6px 14px;">{{ venue }}</span>
      <sc-if value="{{ badge }}" hint-placeholder-val="{{ false }}">
        <span style="background: #D97A3B; border: 2px solid #1F3A38; color: #1F3A38; padding: 6px 14px;">{{ badge }}</span>
      </sc-if>
    </div>
  </section>

  <!-- Hero + action card -->
  <section style="max-width: 1200px; margin: 0 auto; padding: 0 24px 40px;">
    <div class="tw-2col" style="display: grid; grid-template-columns: 1.5fr 0.9fr; gap: 40px; align-items: start;">
      <div>
        <img src="{{ img }}" alt="{{ title }}" style="width: 100%; aspect-ratio: 16/10; object-fit: cover; border: 2px solid #1F3A38; display: block; box-shadow: 6px 6px 0 #1F3A38;">
        <h2 style="font-family: var(--tz-display); font-size: 26px; text-transform: uppercase; margin: 32px 0 10px;">About this event<span style="color: #D97A3B;">.</span></h2>
        <p style="font-size: 16px; line-height: 1.6; color: #3A2F25; max-width: 640px; white-space: pre-line;">{{ description }}</p>
        <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 22px; max-width: 640px;">
          <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 14px 16px;">
            <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #6E6155;">WHEN</div>
            <div style="font-family: var(--tz-display); font-size: 17px; text-transform: uppercase; margin-top: 4px;">{{ dateLine }}</div>
          </div>
          <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 14px 16px;">
            <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #6E6155;">WHERE</div>
            <div style="font-family: var(--tz-display); font-size: 17px; text-transform: uppercase; margin-top: 4px;">{{ city }}</div>
          </div>
          <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 14px 16px;">
            <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #6E6155;">ORGANIZER</div>
            <div style="font-family: var(--tz-display); font-size: 17px; text-transform: uppercase; margin-top: 4px;">{{ organizer }}</div>
          </div>
          <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 14px 16px;">
            <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #6E6155;">GOING</div>
            <div style="font-family: var(--tz-display); font-size: 17px; text-transform: uppercase; margin-top: 4px;">{{ going }} people</div>
          </div>
        </div>
      </div>

      <!-- Action card -->
      <aside class="tw-sticky" style="position: sticky; top: 92px;">
        <div style="border: 2px solid #1F3A38; background: #FFFDF8; box-shadow: 6px 6px 0 #1F3A38;">
          <div style="padding: 18px 20px; border-bottom: 2px solid #1F3A38; display: flex; justify-content: space-between; align-items: baseline;">
            <span style="font-family: var(--tz-display); font-size: 20px; text-transform: uppercase;">{{ priceHead }}</span>
            <span style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">{{ category }}</span>
          </div>
          <div style="padding: 18px 20px; display: grid; gap: 12px;">
            <sc-if value="{{ closedNote }}">
              <div style="border: 2px solid #1F3A38; background: #EFE7D6; padding: 14px 16px; font-size: 13.5px; line-height: 1.5;">{{ closedNote }}</div>
            </sc-if>

            <sc-if value="{{ canBuy }}" hint-placeholder-val="{{ false }}">
              <a href="{{ ticketsHref }}" onClick="{{ goTickets }}" style="display: block; text-align: center; font-family: var(--tz-display); font-size: 17px; text-transform: uppercase; background: #1F3A38; color: #F7F1E6; text-decoration: none; padding: 14px; box-shadow: 4px 4px 0 #D97A3B;">Get tickets →</a>
              <div style="font-size: 12px; color: #6E6155; line-height: 1.5;">Buy as a guest with your card, or sign in to pay with Twende points. Your QR ticket arrives by email and in My Twende.</div>
            </sc-if>

            <sc-if value="{{ canRsvp }}" hint-placeholder-val="{{ true }}">
              <sc-if value="{{ rsvped }}" hint-placeholder-val="{{ false }}">
                <div style="border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 16px 18px;">
                  <div style="font-family: var(--tz-display); font-size: 18px; text-transform: uppercase;">✓ You're going, {{ gNameShown }}!</div>
                  <div style="font-size: 12.5px; color: rgba(247,241,230,0.82); line-height: 1.5; margin-top: 6px;">{{ rsvpNote }}</div>
                  <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
                    <a href="{{ afterRsvpHref }}" style="display: inline-block; font-family: var(--tz-mono); font-size: 11.5px; background: #D97A3B; color: #14201F; padding: 8px 14px; text-decoration: none;">{{ afterRsvpLabel }}</a>
                    <a href="{{ calendarHref }}" style="display: inline-block; font-family: var(--tz-mono); font-size: 11.5px; border: 1px solid rgba(247,241,230,0.5); color: #F7F1E6; padding: 8px 14px; text-decoration: none;">🗓 ADD TO CALENDAR</a>
                    <sc-if value="{{ canCancelRsvp }}">
                      <button onClick="{{ withdrawRsvp }}" style="font-family: var(--tz-mono); font-size: 11.5px; background: none; border: 1px solid rgba(247,241,230,0.5); color: #F7F1E6; padding: 8px 14px; cursor: pointer;">CAN'T MAKE IT</button>
                    </sc-if>
                  </div>
                </div>
              </sc-if>
              <sc-if value="{{ notRsvped }}" hint-placeholder-val="{{ true }}">
                <button onClick="{{ toggleRsvp }}" style="width: 100%; font-family: var(--tz-display); font-size: 17px; text-transform: uppercase; background: {{ rsvpBg }}; color: {{ rsvpFg }}; border: 2px solid #1F3A38; padding: 14px; cursor: pointer; box-shadow: 4px 4px 0 #D97A3B;">{{ rsvpLabel }}</button>
                <sc-if value="{{ rsvpForm }}" hint-placeholder-val="{{ false }}">
                  <div style="display: grid; gap: 8px;">
                    <input placeholder="Your name" value="{{ gName }}" onChange="{{ setGName }}" style="border: 2px solid #1F3A38; background: #F7F1E6; padding: 11px 13px; font-family: var(--tz-sans); font-size: 14px; outline: none;">
                    <input placeholder="Email for your invite + reminders" value="{{ gEmail }}" onChange="{{ setGEmail }}" style="border: 2px solid #1F3A38; background: #F7F1E6; padding: 11px 13px; font-family: var(--tz-sans); font-size: 14px; outline: none;">
                    <div style="display: flex; gap: 8px;">
                      <button onClick="{{ confirmRsvp }}" style="flex: 1; font-family: var(--tz-mono); font-size: 12px; background: #1F3A38; color: #F7F1E6; border: 2px solid #1F3A38; padding: 11px; cursor: pointer;">CONFIRM RSVP</button>
                      <button onClick="{{ cancelRsvp }}" style="font-family: var(--tz-mono); font-size: 12px; background: #F7F1E6; color: #14201F; border: 2px solid #1F3A38; padding: 11px 14px; cursor: pointer;">CANCEL</button>
                    </div>
                    <sc-if value="{{ gError }}" hint-placeholder-val="{{ false }}">
                      <div style="font-size: 12px; color: #B8463A;">{{ gError }}</div>
                    </sc-if>
                    <div style="font-size: 11.5px; color: #6E6155; line-height: 1.45;">{{ rsvpHint }}</div>
                  </div>
                </sc-if>
              </sc-if>
            </sc-if>

            <sc-if value="{{ isOwner }}">
              <div style="display: flex; gap: 6px;">
                <a href="{{ checkinHref }}" style="flex: 1; text-align: center; font-family: var(--tz-mono); font-size: 11px; border: 2px solid #1F3A38; background: #EFE7D6; color: #14201F; padding: 9px; text-decoration: none;">GATE CHECK-IN</a>
                <a href="{{ analyticsHref }}" style="flex: 1; text-align: center; font-family: var(--tz-mono); font-size: 11px; border: 2px solid #1F3A38; background: #EFE7D6; color: #14201F; padding: 9px; text-decoration: none;">ANALYTICS</a>
              </div>
            </sc-if>

            <!-- Share -->
            <div style="border-top: 2px solid #1F3A38; padding-top: 14px;">
              <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; letter-spacing: 0.08em; margin-bottom: 8px;">[Sambaza — share this event]</div>
              <div style="display: flex; border: 2px solid #1F3A38; margin-bottom: 8px;">
                <input value="{{ shareUrl }}" readOnly style="flex: 1; min-width: 0; border: 0; background: #EFE7D6; font-family: var(--tz-mono); font-size: 11.5px; padding: 10px 11px; outline: none;">
                <button onClick="{{ copyLink }}" style="border: 0; border-left: 2px solid #1F3A38; background: #D97A3B; font-family: var(--tz-mono); font-size: 11px; padding: 0 12px; cursor: pointer;">{{ copyLabel }}</button>
              </div>
              <div style="display: flex; gap: 6px;">
                <a href="{{ waHref }}" onClick="{{ shareWa }}" target="_blank" rel="noopener" aria-label="Share on WhatsApp" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; font-family: var(--tz-mono); font-size: 10.5px; border: 2px solid #1F3A38; background: #FFFDF8; color: #14201F; padding: 9px; text-decoration: none;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
                <a href="{{ fbHref }}" onClick="{{ shareFb }}" target="_blank" rel="noopener" aria-label="Share on Facebook" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; font-family: var(--tz-mono); font-size: 10.5px; border: 2px solid #1F3A38; background: #FFFDF8; color: #14201F; padding: 9px; text-decoration: none;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Facebook
                </a>
                <a href="{{ emHref }}" aria-label="Share by email" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; font-family: var(--tz-mono); font-size: 10.5px; border: 2px solid #1F3A38; background: #FFFDF8; color: #14201F; padding: 9px; text-decoration: none;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1F3A38" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m2 6 10 7 10-7"></path></svg>
                  Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </section>

  <!-- Similar events -->
  <section style="border-top: 2px solid #1F3A38; background: #EFE7D6; padding: 40px 24px;">
    <div style="max-width: 1200px; margin: 0 auto;">
      <div style="display: flex; align-items: baseline; gap: 10px; margin-bottom: 18px;">
        <h2 style="font-family: var(--tz-display); font-size: 28px; text-transform: uppercase; margin: 0;">More {{ category }}<span style="color: #D97A3B;">.</span></h2>
        <span style="color: #D97A3B; font-family: var(--tz-display); font-size: 22px;">›</span>
      </div>
      <div style="display: flex; gap: 16px; overflow-x: auto; padding-bottom: 8px;">
        <sc-for list="{{ similar }}" as="ev" hint-placeholder-count="6">
          <a href="{{ ev.href }}" style="flex: 0 0 230px; text-decoration: none; color: #14201F; background: #FFFDF8; border: 2px solid #1F3A38; display: flex; flex-direction: column;" style-hover="transform: translate(-3px,-3px); box-shadow: 5px 5px 0 #D97A3B;">
            <div style="position: relative;">
              <img src="{{ ev.img }}" alt="{{ ev.title }}" style="width: 100%; aspect-ratio: 4/5; object-fit: cover; display: block; border-bottom: 2px solid #1F3A38;">
              <span style="position: absolute; top: 10px; left: 10px; background: #F7F1E6; border: 2px solid #1F3A38; font-family: var(--tz-mono); font-size: 11px; padding: 4px 8px;">{{ ev.date }}</span>
            </div>
            <div style="padding: 14px; display: flex; flex-direction: column; gap: 6px; flex: 1;">
              <div style="font-family: var(--tz-display); font-size: 18px; text-transform: uppercase; line-height: 1.05;">{{ ev.title }}</div>
              <div style="font-size: 13px; color: #6E6155;">{{ ev.city }}</div>
              <div style="margin-top: auto; font-family: var(--tz-mono); font-size: 12px; color: #A85A23;">{{ ev.price }}</div>
            </div>
          </a>
        </sc-for>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer style="border-top: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 32px 24px;">
    <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px; align-items: center;">
      <a href="/" class="tz-logo-link" aria-label="Twendezetu home"><img src="/brand/logo-light.png" alt="Twendezetu" width="1211" height="229" class="tz-logo tz-logo--sm"></a>
      <div style="font-family: var(--tz-mono); font-size: 11px; color: rgba(247,241,230,0.7);">Gather anywhere · Fees only when money moves</div>
    </div>
  </footer>
</div>
`;

export default template;
