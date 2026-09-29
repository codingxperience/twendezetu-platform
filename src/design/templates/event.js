// Markup for the event page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh;">

  <!-- Header -->
  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 18px 24px; border-bottom: 2px solid #1F3A38; background: #F7F1E6; position: sticky; top: 0; z-index: 40;">
    <div style="display: flex; align-items: center; gap: 36px;">
      <a href="/" class="tz-logo-link" aria-label="Twendezetu home"><img src="/brand/logo.png" alt="Twendezetu" width="1211" height="229" class="tz-logo tz-logo--md"></a>
      <nav class="tw-nav" style="display: flex; gap: 24px; font-size: 14px; font-weight: 500;">
        <a href="/events" style="color: #6E6155; text-decoration: none;">Events</a>
        <a href="/events/nyama-choma-festival-2026" style="color: #14201F; text-decoration: none; border-bottom: 2px solid #D97A3B; padding-bottom: 2px;">Featured</a>
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

  <!-- Breadcrumb -->
  <div style="max-width: 1200px; margin: 0 auto; padding: 20px 24px 0; font-family: var(--tz-mono); font-size: 12px; color: #6E6155;">
    <a href="/" style="color: #A85A23;">← Back to guide</a> · Community · Free · All ages
  </div>

  <!-- Title block -->
  <section style="max-width: 1200px; margin: 0 auto; padding: 20px 24px 32px;">
    <h1 style="font-family: var(--tz-display); font-size: clamp(48px, 8vw, 110px); text-transform: uppercase; line-height: 0.92; margin: 0;">
      NYTC Nyama Choma<br>Festival <span style="color: #D97A3B;">Nanenane 2026</span>
    </h1>
    <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 20px; font-family: var(--tz-mono); font-size: 13px;">
      <span style="background: #1F3A38; color: #F7F1E6; padding: 8px 14px;">SAT · 8 AUG 2026 · 2:00 PM EDT (SAA NANE)</span>
      <span style="border: 2px solid #1F3A38; color: #A85A23; padding: 6px 14px;">= 9:00 PM EAT · NAIROBI/DAR · YOUR TIME AUTO-DETECTED</span>
      <span style="border: 2px solid #1F3A38; padding: 6px 14px;">LINCOLN PARK · COMMUNIPAW AVE SIDE</span>
      <span style="border: 2px solid #1F3A38; padding: 6px 14px;">JERSEY CITY, NJ 07304</span>
      <span style="background: #D97A3B; border: 2px solid #1F3A38; color: #1F3A38; padding: 6px 14px;">FREE ENTRY</span>
    </div>
  </section>

  <!-- Hero: real flyer from the client -->
  <section class="tw-2col" style="border-top: 2px solid #1F3A38; border-bottom: 2px solid #1F3A38; display: grid; grid-template-columns: 1.1fr 0.9fr; background: #14201F;">
    <img src="/assets/events/nytc-nanenane-2026-flyer.jpeg" alt="Official NYTC Nyama Choma Nanenane 2026 flyer" style="width: 100%; height: 460px; object-fit: contain; display: block; background: #14201F;">
    <img src="https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=1000&q=80" alt="Nyama choma grilling" style="width: 100%; height: 460px; object-fit: cover; display: block; border-left: 2px solid #1F3A38;">
  </section>

  <!-- Body: 2-col -->
  <section class="tw-2col" style="max-width: 1200px; margin: 0 auto; padding: 48px 24px; display: grid; grid-template-columns: 1.4fr 0.85fr; gap: 56px; align-items: start;">

    <!-- Left column -->
    <div>
      <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em;">[Kuhusu tukio — about]</div>
      <p style="font-size: 18px; line-height: 1.6; margin: 14px 0 0;">
        <em style="font-family: var(--tz-serif);">Ayawi ayawi, sasa yamekua!</em> The leadership of the Tanzanian Community of NY, NJ, CT &amp; PA (NYTC) welcomes all wanajumuiya to the Nyama Choma Festival. A gathering of ndugu, marafiki, familia, washikaji na majirani — coming together as one NYTC family.
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #3A2F25;">
        Expect uchomaji wa nyama (the grill masters at work), live entertainment, games for every age — michezo ya kila rika — connection, and community services on site. The park has many areas; look for NYTC on the <strong>Communipaw Ave</strong> side.
      </p>

      <!-- What's happening grid -->
      <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em; margin-top: 40px;">[Ratiba — program]</div>
      <div style="border: 2px solid #1F3A38; margin-top: 14px;">
        <sc-for list="{{ schedule }}" as="row" hint-placeholder-count="5">
          <div style="display: grid; grid-template-columns: 130px 1fr auto; gap: 18px; padding: 16px 18px; border-bottom: 1px solid #E3D9C6; align-items: baseline; background: #FFFDF8;">
            <span style="font-family: var(--tz-display); font-size: 17px; color: #A85A23;">{{ row.time }}</span>
            <div>
              <div style="font-family: var(--tz-display); font-size: 17px; text-transform: uppercase;">{{ row.title }}</div>
              <div style="font-size: 13.5px; color: #6E6155; margin-top: 2px;">{{ row.desc }}</div>
            </div>
            <span style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">{{ row.tag }}</span>
          </div>
        </sc-for>
      </div>

      <!-- Sponsor: NALA -->
      <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em; margin-top: 40px;">[Mdhamini — event sponsor]</div>
      <div style="border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 28px; margin-top: 14px; display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: center;">
        <div>
          <div style="font-family: var(--tz-display); font-size: 32px; text-transform: uppercase;">NALA <span style="color: #D97A3B;">— tuma pesa nyumbani</span></div>
          <p style="font-size: 14.5px; line-height: 1.55; color: rgba(247,241,230,0.8); margin: 10px 0 14px; max-width: 480px;">Download NALA, send money home with amazing rates and 24/7 support. New users: send $50+ with promo code <strong style="color:#E8A472;">NANE20</strong> and get <strong style="color:#E8A472;">$20</strong>.</p>
          <div style="display: flex; gap: 10px; font-family: var(--tz-mono); font-size: 12px;">
            <span style="border: 1px solid rgba(247,241,230,0.35); padding: 6px 12px;">① AMAZING RATES</span>
            <span style="border: 1px solid rgba(247,241,230,0.35); padding: 6px 12px;">② 24/7 SUPPORT</span>
            <span style="background: #D97A3B; color: #1F3A38; padding: 7px 12px; border: 1px solid #D97A3B;">PROMO: NANE20</span>
          </div>
        </div>
        <div style="font-family: var(--tz-display); font-size: 64px; color: #D97A3B; transform: rotate(-4deg);">$20</div>
      </div>

      <!-- Donations -->
      <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em; margin-top: 40px;">[Michango — support the festival]</div>
      <div class="tw-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 14px;">
        <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 22px;">
          <div style="font-family: var(--tz-display); font-size: 20px; text-transform: uppercase;">Zelle a donation</div>
          <p style="font-size: 13.5px; color: #3A2F25; line-height: 1.5; margin: 8px 0 12px;">Donations from wanajumuiya and wadau make the festival shine.</p>
          <div style="font-family: var(--tz-mono); font-size: 12.5px; background: #EFE7D6; border: 1px dashed #A85A23; padding: 10px 12px;">$Zelle → info@nytanzaniancommunity.org</div>
        </div>
        <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 22px;">
          <div style="font-family: var(--tz-display); font-size: 20px; text-transform: uppercase;">Pool points from anywhere</div>
          <p style="font-size: 13.5px; color: #3A2F25; line-height: 1.5; margin: 8px 0 12px;">Family abroad? Contribute Twende Points toward tents, fuel, or the grill — from any country, any currency.</p>
          <a href="/points-wallet" style="display: inline-block; font-family: var(--tz-mono); font-size: 12px; background: #1F3A38; color: #F7F1E6; border: 0; padding: 10px 16px; cursor: pointer; text-decoration: none;">CONTRIBUTE POINTS →</a>
        </div>
      </div>

      <!-- Real photos drop-zone -->
      <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em; margin-top: 40px;">[Picha — drop real NYTC photos here]</div>
      <div class="tw-3col" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 14px;">
        <figure style="margin: 0;">
          <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=700&q=80" alt="Nyama choma skewers on the grill" style="width: 100%; height: 180px; object-fit: cover; display: block; border: 2px solid #1F3A38;">
          <figcaption style="font-family: var(--tz-mono); font-size: 10.5px; color: #6E6155; margin-top: 6px;">UCHOMAJI WA NYAMA — THE GRILL MASTERS</figcaption>
        </figure>
        <figure style="margin: 0;">
          <img src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=700&q=80" alt="Festival crowd celebrating" style="width: 100%; height: 180px; object-fit: cover; display: block; border: 2px solid #1F3A38;">
          <figcaption style="font-family: var(--tz-mono); font-size: 10.5px; color: #6E6155;  margin-top: 6px;">BURUDANI — MUSIC &amp; CELEBRATION</figcaption>
        </figure>
        <figure style="margin: 0;">
          <img src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=700&q=80" alt="Community gathered together at dusk" style="width: 100%; height: 180px; object-fit: cover; display: block; border: 2px solid #1F3A38;">
          <figcaption style="font-family: var(--tz-mono); font-size: 10.5px; color: #6E6155; margin-top: 6px;">NYTC FAMILIA — CONNECTION</figcaption>
        </figure>
      </div>

      <!-- Vendors call -->
      <div style="border: 2px solid #1F3A38; background: #D97A3B; padding: 24px 26px; margin-top: 40px; display: flex; justify-content: space-between; align-items: center; gap: 20px;">
        <div>
          <div style="font-family: var(--tz-display); font-size: 24px; text-transform: uppercase; color: #1F3A38;">Vendors, sponsors &amp; donors — karibuni!</div>
          <div style="font-size: 14px; color: #1F3A38; margin-top: 6px;">Companies and organizations are welcome to help make the Nyama Choma shine. Apply through the platform — organizer contacts stay masked.</div>
        </div>
        <a href="/create-event" style="font-family: var(--tz-display); font-size: 15px; text-transform: uppercase; background: #1F3A38; color: #F7F1E6; text-decoration: none; padding: 14px 22px; white-space: nowrap;">Apply →</a>
      </div>
    </div>

    <!-- Right column: sticky action card -->
    <aside class="tw-sticky" style="position: sticky; top: 100px; display: grid; gap: 16px;">
      <div style="border: 2px solid #1F3A38; background: #FFFDF8; box-shadow: 6px 6px 0 #1F3A38;">
        <div style="padding: 20px 22px; border-bottom: 2px solid #1F3A38;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; letter-spacing: 0.08em;">[RSVP — free entry]</div>
          <div style="display: flex; align-items: baseline; gap: 10px; margin-top: 8px;">
            <span style="font-family: var(--tz-display); font-size: 40px;">FREE</span>
            <span style="font-size: 13px; color: #6E6155;">· {{ going }} attending</span>
          </div>
          <sc-if value="{{ closedNote }}">
            <div style="margin-top: 14px; border: 2px solid #1F3A38; background: #EFE7D6; padding: 14px 16px; font-size: 13.5px; line-height: 1.5;">{{ closedNote }}</div>
          </sc-if>
          <sc-if value="{{ canRsvp }}">
          <sc-if value="{{ notRsvped }}">
          <button onClick="{{ toggleRsvp }}" style="width: 100%; margin-top: 14px; font-family: var(--tz-display); font-size: 17px; text-transform: uppercase; background: {{ rsvpBg }}; color: {{ rsvpFg }}; border: 2px solid #1F3A38; padding: 14px; cursor: pointer; box-shadow: 4px 4px 0 #D97A3B;">{{ rsvpLabel }}</button>

          <!-- Guest RSVP form: no account needed -->
          <sc-if value="{{ rsvpForm }}" hint-placeholder-val="{{ false }}">
            <div style="margin-top: 12px; border: 2px solid #1F3A38; background: #EFE7D6; padding: 16px;">
              <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; letter-spacing: 0.08em;">[RSVP as guest — no account needed]</div>
              <div style="display: grid; gap: 8px; margin-top: 10px;">
                <input placeholder="Your name" value="{{ gName }}" onChange="{{ setGName }}" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 12px 14px; font-family: var(--tz-sans); font-size: 14px; outline: none;">
                <input placeholder="Email (for your calendar invite + reminders)" value="{{ gEmail }}" onChange="{{ setGEmail }}" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 12px 14px; font-family: var(--tz-sans); font-size: 14px; outline: none;">
                <div style="display: flex; gap: 6px;">
                  <sc-for list="{{ partyOpts }}" as="po" hint-placeholder-count="4">
                    <button onClick="{{ po.pick }}" style="flex: 1; font-family: var(--tz-mono); font-size: 11px; border: 2px solid #1F3A38; background: {{ po.bg }}; color: {{ po.fg }}; padding: 8px 4px; cursor: pointer;">{{ po.label }}</button>
                  </sc-for>
                </div>
                <button onClick="{{ confirmRsvp }}" style="font-family: var(--tz-display); font-size: 15px; text-transform: uppercase; background: #1F3A38; color: #F7F1E6; border: 2px solid #1F3A38; padding: 12px; cursor: pointer;">Confirm RSVP →</button>
                <sc-if value="{{ gError }}" hint-placeholder-val="{{ false }}">
                  <div style="font-size: 12px; color: #B8463A;">{{ gError }}</div>
                </sc-if>
                <div style="font-size: 11.5px; color: #6E6155; line-height: 1.5;">Your email is only used for the invite and reminders — never shown to anyone, never spam. <a href="{{ signInHref }}" style="color: #A85A23;">Have an account? Sign in</a></div>
              </div>
            </div>
          </sc-if>
          </sc-if>
          </sc-if>

          <!-- Guest RSVP confirmed -->
          <sc-if value="{{ rsvped }}" hint-placeholder-val="{{ false }}">
            <div style="margin-top: 12px; border: 1px dashed #A85A23; background: #FBEED8; padding: 12px 14px; font-size: 13px; line-height: 1.55;">
              ✓ <strong>Karibu, {{ gNameShown }}!</strong> You're on the list ({{ gPartyShown }}). {{ rsvpNote }}
              <div style="display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap;">
                <a href="{{ afterRsvpHref }}" style="font-family: var(--tz-mono); font-size: 11px; background: #D97A3B; border: 1px solid #1F3A38; color: #14201F; padding: 6px 10px; text-decoration: none;">{{ afterRsvpLabel }}</a>
                <sc-if value="{{ canCancelRsvp }}">
                  <button onClick="{{ withdrawRsvp }}" style="font-family: var(--tz-mono); font-size: 11px; background: none; border: 1px solid #A85A23; color: #7A3E0F; padding: 6px 10px; cursor: pointer;">CAN'T MAKE IT ANYMORE</button>
                </sc-if>
              </div>
            </div>
          </sc-if>
        </div>
        <div style="padding: 18px 22px; display: grid; gap: 10px;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; letter-spacing: 0.08em;">[Add to calendar]</div>
          <div style="display: flex; gap: 8px;">
            <a href="{{ googleCalHref }}" target="_blank" rel="noopener" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 10px; cursor: pointer; color: #14201F; text-decoration: none;">
              <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.75 3.27-8.1z"></path><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"></path><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"></path><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path></svg>
              GOOGLE
            </a>
            <a href="{{ calendarHref }}" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 10px; cursor: pointer; color: #14201F; text-decoration: none;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#14201F"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"></path></svg>
              APPLE
            </a>
            <a href="{{ calendarHref }}" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 10px; cursor: pointer; color: #14201F; text-decoration: none;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#14201F" stroke-width="2"><rect x="4" y="5" width="16" height="16" rx="2"></rect><path d="M8 3v4M16 3v4M4 11h16"></path></svg>
              .ICS
            </a>
          </div>
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; letter-spacing: 0.08em; margin-top: 8px;">[Refer a friend — share the link]</div>
          <div style="display: flex; border: 2px solid #1F3A38;">
            <input value="{{ shareUrl }}" readOnly style="flex: 1; border: 0; background: #EFE7D6; font-family: var(--tz-mono); font-size: 12px; padding: 10px 12px; outline: none; color: #3A2F25;">
            <button onClick="{{ copyLink }}" style="border: 0; border-left: 2px solid #1F3A38; background: #D97A3B; font-family: var(--tz-mono); font-size: 12px; padding: 0 14px; cursor: pointer;">{{ copyLabel }}</button>
          </div>
          <div style="display: flex; gap: 8px;">
            <a href="{{ waHref }}" onClick="{{ shareWa }}" target="_blank" rel="noopener" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 10px; cursor: pointer; color: #14201F; text-decoration: none;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366"><path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.96L2 22l5.18-1.5A9.9 9.9 0 1 0 12.04 2zm5.44 14.13c-.24.68-1.4 1.3-1.96 1.38-.5.08-1.14.11-1.84-.12-.42-.13-.97-.31-1.67-.61-2.94-1.27-4.86-4.23-5-4.43-.15-.2-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.46.27-.3.59-.37.78-.37h.56c.18 0 .43-.07.66.5.24.59.83 2.03.9 2.18.08.15.13.32.03.51-.1.2-.15.32-.3.5-.14.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.3.75 1.24 1.62 2 1.11.99 2.05 1.3 2.34 1.45.29.14.46.12.63-.08.17-.2.73-.85.92-1.14.2-.3.4-.24.66-.14.27.1 1.71.8 2 .95.3.15.49.22.56.34.07.13.07.71-.15 1.38z"></path></svg>
              WHATSAPP
            </a>
            <a href="{{ fbHref }}" onClick="{{ shareFb }}" target="_blank" rel="noopener" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 10px; cursor: pointer; color: #14201F; text-decoration: none;">
              <svg width="15" height="15" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#1877F2"></circle><path fill="#fff" d="M15.9 15.21l.44-2.89h-2.78v-1.88c0-.79.39-1.56 1.63-1.56h1.26V6.42s-1.14-.2-2.24-.2c-2.28 0-3.77 1.39-3.77 3.9v2.2H7.9v2.89h2.54V22a10.1 10.1 0 0 0 3.12 0v-6.79h2.34z"></path></svg>
              FACEBOOK
            </a>
            <a href="{{ emHref }}" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 10px; cursor: pointer; color: #14201F; text-decoration: none;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#14201F" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M3 7l9 6 9-6"></path></svg>
              EMAIL
            </a>
          </div>
          <div style="font-size: 12px; color: #6E6155; line-height: 1.5;">Anyone with the link can view and RSVP — no account needed. You’ll see your referral count in <a href="/my-twende" style="color: #A85A23;">My Twende</a>.</div>
        </div>
      </div>

      <!-- Organizer (masked) -->
      <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 20px 22px;">
        <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; letter-spacing: 0.08em;">[Mratibu — organizer]</div>
        <div style="display: flex; gap: 14px; align-items: center; margin-top: 12px;">
          <div style="width: 48px; height: 48px; background: #1F3A38; color: #F7F1E6; font-family: var(--tz-display); font-size: 20px; display: flex; align-items: center; justify-content: center;">{{ organizerInitials }}</div>
          <div>
            <div style="font-weight: 700; font-size: 15px;">{{ organizer }}</div>
            <div style="font-size: 12.5px; color: #6E6155;">Chair, planning committee: Josephat M.</div>
          </div>
        </div>
        <a href="/messages" onClick="{{ messageOrganizer }}" style="display: block; text-align: center; width: 100%; box-sizing: border-box; margin-top: 14px; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 11px; cursor: pointer; color: #14201F; text-decoration: none;">✉ MESSAGE VIA PLATFORM</a>
        <div style="font-size: 11.5px; color: #6E6155; margin-top: 8px; line-height: 1.5;">Phone &amp; email are masked. The organizer can choose to reveal contacts after you connect.</div>
      </div>

      <!-- Location -->
      <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 20px 22px;">
        <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; letter-spacing: 0.08em;">[Mahali — location]</div>
        <div style="font-family: var(--tz-display); font-size: 18px; text-transform: uppercase; margin-top: 10px;">Lincoln Park</div>
        <div style="font-size: 13.5px; color: #3A2F25; line-height: 1.5;">1 Country Road 605, Jersey City, NJ 07304<br>NYTC side: <strong>Communipaw Ave</strong></div>
        <a href="https://www.google.com/maps/search/?api=1&query=Lincoln+Park+1+Country+Road+605+Jersey+City+NJ+07304" target="_blank" style="margin-top: 12px; height: 120px; text-decoration: none; background: repeating-linear-gradient(45deg, #1F3A38, #1F3A38 12px, #26454238 12px, #264542 24px); background-color: #1F3A38; border: 2px solid #1F3A38; display: flex; align-items: center; justify-content: center;">
          <span style="font-family: var(--tz-mono); font-size: 12px; color: #F7F1E6; border: 1.5px solid #F7F1E6; padding: 8px 14px; background: rgba(20,32,31,0.5);">OPEN IN GOOGLE MAPS ↗</span>
        </a>
      </div>
    </aside>
  </section>

  <!-- Similar events -->
  <section style="border-top: 2px solid #1F3A38; background: #EFE7D6; padding: 48px 24px;">
    <div style="max-width: 1200px; margin: 0 auto;">
      <h2 style="font-family: var(--tz-display); font-size: 36px; text-transform: uppercase; margin: 0 0 24px;">More from the community<span style="color: #D97A3B;">.</span></h2>
      <div class="tw-3col" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
        <sc-for list="{{ similar }}" as="ev" hint-placeholder-count="3">
          <a href="{{ ev.href }}" style="text-decoration: none; color: #14201F; background: #FFFDF8; border: 2px solid #1F3A38; display: block;">
            <img src="{{ ev.img }}" alt="{{ ev.title }}" style="width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block; border-bottom: 2px solid #1F3A38;">
            <div style="padding: 14px 16px;">
              <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23;">{{ ev.date }}</div>
              <div style="font-family: var(--tz-display); font-size: 18px; text-transform: uppercase; margin-top: 4px;">{{ ev.title }}</div>
              <div style="font-size: 13px; color: #6E6155; margin-top: 2px;">{{ ev.city }}</div>
            </div>
          </a>
        </sc-for>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer style="background: #1F3A38; color: #F7F1E6; padding: 40px 24px 0; overflow: hidden; border-top: 2px solid #1F3A38;">
    <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; padding-bottom: 32px; font-size: 14px;">
      <span style="color: rgba(247,241,230,0.75);">IMETOLEWA NA UONGOZI-NYTC · JULY 3, 2026</span>
      <a href="/" style="color: #F7F1E6;">← Back to events</a>
    </div>
    <div style="font-family: var(--tz-display); font-size: clamp(64px, 12vw, 200px); text-transform: uppercase; line-height: 0.78; text-align: center; transform: translateY(12%);">HII SI YA KUKOSA</div>
  </footer>
</div>
`;

export default template;
