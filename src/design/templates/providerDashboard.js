// Markup for the providerDashboard page. Bindings are resolved by src/design/render.js.

// Styles shared by the listing editor's fields.
const F = 'border: 2px solid #1F3A38; background: #FFFDF8; padding: 12px 14px; font-family: var(--tz-sans); font-size: 14px; outline: none; width: 100%; box-sizing: border-box;';
const L = 'font-family: var(--tz-mono); font-size: 11.5px; color: #A85A23;';
const H = 'font-size: 12px; color: #6E6155; line-height: 1.5;';

const template = `
<div style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh;">

  <!-- Header: everything wraps on small screens, nothing disappears -->
  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 18px 24px; border-bottom: 2px solid #1F3A38; background: #F7F1E6; position: sticky; top: 0; z-index: 40;">
    <div style="display: flex; align-items: center; gap: 24px; flex-wrap: wrap;">
      <a href="/" class="tz-logo-link" aria-label="Twendezetu home"><img src="/brand/logo.png" alt="Twendezetu" width="1211" height="229" class="tz-logo tz-logo--md"></a>
      <span style="font-family: var(--tz-mono); font-size: 12px; background: #1F3A38; color: #F7F1E6; padding: 5px 10px;">VENDOR PORTAL</span>
    </div>
    <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap; position: relative;">
      <button onClick="{{ toggleBell }}" aria-label="Notifications" aria-expanded="{{ bellOpen }}" style="position: relative; background: none; border: 2px solid #1F3A38; padding: 9px 12px; cursor: pointer; font-family: var(--tz-mono); font-size: 13px;">▲<sc-if value="{{ hasUnread }}"><span style="position: absolute; top: -7px; right: -7px; background: #D97A3B; border: 2px solid #1F3A38; font-family: var(--tz-mono); font-size: 10px; padding: 1px 5px;">{{ unread }}</span></sc-if></button>
      <button onClick="{{ toggleProfile }}" aria-label="Your account" aria-expanded="{{ profileOpen }}" style="display: flex; align-items: center; gap: 10px; background: none; border: 0; cursor: pointer; padding: 0;">
        <span style="width: 40px; height: 40px; background: #D97A3B; border: 2px solid #1F3A38; font-family: var(--tz-display); font-size: 17px; display: flex; align-items: center; justify-content: center; white-space: nowrap;">{{ me.initials }}</span>
      </button>

      <!-- Profile dropdown -->
      <sc-if value="{{ profileOpen }}" hint-placeholder-val="{{ false }}">
        <div style="position: absolute; top: 52px; right: 0; width: 300px; background: #FFFDF8; border: 2px solid #1F3A38; box-shadow: 6px 6px 0 #1F3A38; z-index: 60;">
          <div style="padding: 16px 18px; border-bottom: 2px solid #1F3A38; display: flex; gap: 12px; align-items: center;">
            <div style="width: 44px; height: 44px; background: #D97A3B; border: 2px solid #1F3A38; font-family: var(--tz-display); font-size: 18px; display: flex; align-items: center; justify-content: center; white-space: nowrap;">{{ me.initials }}</div>
            <div>
              <div style="font-weight: 700; font-size: 14.5px;">{{ me.name }}</div>
              <div style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">{{ businessLine }}</div>
              <div style="font-family: var(--tz-mono); font-size: 10.5px; color: {{ statusColor }}; margin-top: 2px;">{{ statusLine }}</div>
            </div>
          </div>
          <button onClick="{{ editListing }}" style="display: block; width: 100%; text-align: left; background: none; border: 0; border-bottom: 1px solid #E3D9C6; cursor: pointer; font-family: inherit; color: #14201F; padding: 13px 18px; font-size: 14px;">✎ &nbsp;Edit your listing</button>
          <sc-if value="{{ hasListing }}"><a href="{{ listingHref }}" style="display: block; text-decoration: none; color: #14201F; border-bottom: 1px solid #E3D9C6; padding: 13px 18px; font-size: 14px;">▣ &nbsp;View public listing <span style="font-family: var(--tz-mono); font-size: 10px; color: #6E6155;">— see what customers see</span></a></sc-if>
          <a href="/provider-verification" style="display: block; text-decoration: none; color: #14201F; border-bottom: 1px solid #E3D9C6; padding: 13px 18px; font-size: 14px;">✓ &nbsp;Verification <span style="font-family: var(--tz-mono); font-size: 10px; color: #6E6155;">— {{ verificationLabel }}</span></a>
          <a href="/settings?tab=notifications" style="display: block; text-decoration: none; color: #14201F; border-bottom: 1px solid #E3D9C6; padding: 13px 18px; font-size: 14px;">▲ &nbsp;Notification settings</a>
          <a href="/provider-wallet" style="display: block; text-decoration: none; color: #14201F; border-bottom: 1px solid #E3D9C6; padding: 13px 18px; font-size: 14px;">◍ &nbsp;Business wallet &amp; billing</a>
          <a href="/my-twende" style="display: block; text-decoration: none; color: #14201F; border-bottom: 1px solid #E3D9C6; padding: 13px 18px; font-size: 14px;">◌ &nbsp;My Twende <span style="font-family: var(--tz-mono); font-size: 10px; color: #6E6155;">— your personal side</span></a>
          <button onClick="{{ signOut }}" style="display: block; width: 100%; text-align: left; background: none; border: 0; cursor: pointer; font-family: inherit; color: #B8463A; padding: 13px 18px; font-size: 14px; font-weight: 600;">→ &nbsp;Sign out</button>
        </div>
      </sc-if>

      <!-- Notifications drawer -->
      <sc-if value="{{ bellOpen }}" hint-placeholder-val="{{ false }}">
        <div style="position: absolute; top: 52px; right: 0; width: 360px; background: #FFFDF8; border: 2px solid #1F3A38; box-shadow: 6px 6px 0 #1F3A38; z-index: 60;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; border-bottom: 2px solid #1F3A38;">
            <span style="font-family: var(--tz-display); font-size: 17px; text-transform: uppercase;">Notifications</span>
            <button onClick="{{ toggleBell }}" style="background: none; border: 0; font-family: var(--tz-mono); font-size: 12px; color: #A85A23; cursor: pointer; text-decoration: underline;">CLOSE</button>
          </div>
          <sc-if value="{{ noNotifications }}"><div style="padding: 16px 18px; font-size: 13px; color: #6E6155;">Nothing yet. Leads, offers and money notices land here.</div></sc-if>
          <sc-for list="{{ notifications }}" as="n" hint-placeholder-count="3">
            <a href="{{ n.href }}" style="padding: 14px 18px; border-bottom: 1px solid #E3D9C6; display: grid; grid-template-columns: auto 1fr; gap: 12px; text-decoration: none; color: #14201F;">
              <span style="width: 28px; height: 28px; border: 2px solid #1F3A38; background: #F6DCC0; font-family: var(--tz-mono); font-size: 12px; display: flex; align-items: center; justify-content: center;">{{ n.icon }}</span>
              <div>
                <div style="font-size: 13.5px; line-height: 1.45;">{{ n.body }}</div>
                <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; margin-top: 3px;">{{ n.time }}</div>
              </div>
            </a>
          </sc-for>
        </div>
      </sc-if>
    </div>
  </header>

  <!-- Portal nav -->
  <nav style="display: flex; gap: 4px; align-items: center; padding: 10px 20px; border-bottom: 2px solid #1F3A38; background: #FFFDF8; overflow-x: auto;">
    <a href="/provider-dashboard" style="display: flex; align-items: center; gap: 8px; text-decoration: none; background: #1F3A38; color: #F7F1E6; font-family: var(--tz-mono); font-size: 12px; padding: 9px 14px; white-space: nowrap;">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="8" height="8"></rect><rect x="13" y="3" width="8" height="8"></rect><rect x="3" y="13" width="8" height="8"></rect><rect x="13" y="13" width="8" height="8"></rect></svg>
      DASHBOARD
    </a>
    <a href="{{ listingHref }}" style="display: flex; align-items: center; gap: 8px; text-decoration: none; color: #3A2F25; font-family: var(--tz-mono); font-size: 12px; padding: 9px 14px; white-space: nowrap;">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z"></path></svg>
      MY LISTING
    </a>
    <a href="/messages" style="display: flex; align-items: center; gap: 8px; text-decoration: none; color: #3A2F25; font-family: var(--tz-mono); font-size: 12px; padding: 9px 14px; white-space: nowrap;">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z"></path></svg>
      MESSAGES
    </a>
    <a href="/provider-wallet" style="display: flex; align-items: center; gap: 8px; text-decoration: none; color: #3A2F25; font-family: var(--tz-mono); font-size: 12px; padding: 9px 14px; white-space: nowrap;">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="6" width="18" height="13" rx="2"></rect><path d="M16 12.5h5M3 10h18"></path></svg>
      BUSINESS WALLET
    </a>
    <a href="/points-wallet" style="display: flex; align-items: center; gap: 8px; text-decoration: none; color: #3A2F25; font-family: var(--tz-mono); font-size: 12px; padding: 9px 14px; white-space: nowrap;">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="9" cy="12" r="6"></circle><circle cx="16" cy="12" r="6"></circle></svg>
      PERSONAL POINTS
    </a>
    <a href="/checkin" style="display: flex; align-items: center; gap: 8px; text-decoration: none; color: #3A2F25; font-family: var(--tz-mono); font-size: 12px; padding: 9px 14px; white-space: nowrap;">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><path d="M14 14h3v3M20 14v7M14 20h3"></path></svg>
      DOOR CHECK-IN
    </a>
    <a href="/settings" style="display: flex; align-items: center; gap: 8px; text-decoration: none; color: #3A2F25; font-family: var(--tz-mono); font-size: 12px; padding: 9px 14px; white-space: nowrap;">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="3.2"></circle><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1"></path></svg>
      SETTINGS
    </a>
  </nav>

  <div style="max-width: 1320px; margin: 0 auto; padding: 40px 24px 80px;">
    <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em;">[Dashibodi ya mtoa huduma]</div>
    <h1 style="font-family: var(--tz-display); font-size: clamp(40px, 5.5vw, 72px); text-transform: uppercase; line-height: 0.95; margin: 10px 0 32px;">Karibu, {{ me.firstName }}<span style="color: #D97A3B;">.</span> {{ headlineTail }}<span style="color: #D97A3B;">.</span></h1>

    <!-- Draft listing: waiting for its membership -->
    <sc-if value="{{ isDraft }}">
      <div style="border: 2px solid #1F3A38; background: #FBEED8; padding: 20px 22px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: center; gap: 18px; flex-wrap: wrap;">
        <div style="max-width: 620px;">
          <div style="font-family: var(--tz-display); font-size: 20px; text-transform: uppercase; color: #7A3E0F;">Your listing is saved but not live yet</div>
          <div style="font-size: 13.5px; color: #3A2F25; line-height: 1.55; margin-top: 6px;">It goes live, gets matched to needs and appears in the directory once the 12-month membership ({{ membership.price }}) is paid. You can keep editing it in the meantime.</div>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button onClick="{{ payCard }}" style="font-family: var(--tz-display); font-size: 14px; text-transform: uppercase; background: #1F3A38; color: #F7F1E6; border: 2px solid #1F3A38; padding: 12px 18px; cursor: pointer;">Pay by card</button>
          <button onClick="{{ payPoints }}" style="font-family: var(--tz-mono); font-size: 12px; background: #FFFDF8; border: 2px solid #1F3A38; padding: 12px 16px; cursor: pointer;">PAY WITH POINTS</button>
        </div>
      </div>
    </sc-if>

    <!-- Listing editor (also how a new provider starts) -->
    <sc-if value="{{ editorOpen }}">
      <section id="listing-editor" aria-label="Your listing" style="border: 2px solid #1F3A38; background: #FFFDF8; box-shadow: 6px 6px 0 #D97A3B; padding: 26px 28px; margin-bottom: 40px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap;">
          <h2 style="font-family: var(--tz-display); font-size: 28px; text-transform: uppercase; margin: 0;">{{ editorTitle }}<span style="color: #D97A3B;">.</span></h2>
          <sc-if value="{{ hasListing }}"><button onClick="{{ closeEditor }}" style="background: none; border: 0; font-family: var(--tz-mono); font-size: 12px; color: #A85A23; cursor: pointer; text-decoration: underline;">CLOSE</button></sc-if>
        </div>
        <p style="${H} margin: 6px 0 20px; max-width: 700px;">{{ editorIntro }}</p>
        <div class="tw-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <label style="display: grid; gap: 5px;"><span style="${L}">BUSINESS NAME *</span><input value="{{ lf.name }}" onChange="{{ ls.name }}" maxlength="80" style="${F}"></label>
          <label style="display: grid; gap: 5px;"><span style="${L}">CATEGORY *</span><select value="{{ lf.category }}" onChange="{{ ls.category }}" style="${F}"><sc-for list="{{ categories }}" as="c"><option value="{{ c.code }}">{{ c.label }}</option></sc-for></select></label>
          <label style="display: grid; gap: 5px;"><span style="${L}">COUNTRY *</span><select value="{{ lf.country }}" onChange="{{ ls.country }}" style="${F}"><sc-for list="{{ countries }}" as="c"><option value="{{ c.code }}">{{ c.name }}</option></sc-for></select></label>
          <label style="display: grid; gap: 5px;"><span style="${L}">HOME CITY *</span><input value="{{ lf.city }}" onChange="{{ ls.city }}" maxlength="80" placeholder="e.g. Kampala" style="${F}"></label>
        </div>
        <sc-if value="{{ countryLocked }}"><div style="${H} margin-top: 6px;">Country and currency are fixed once the listing exists, because your rates and earnings are kept in that currency.</div></sc-if>
        <label style="display: grid; gap: 5px; margin-top: 16px;"><span style="${L}">OTHER CITIES YOU SERVE <span style="color: #6E6155;">— comma separated; you are matched to needs there too</span></span><input value="{{ lf.serviceAreas }}" onChange="{{ ls.serviceAreas }}" placeholder="e.g. Jinja, Entebbe, Mbale" style="${F}"></label>
        <label style="display: grid; gap: 5px; margin-top: 16px;"><span style="${L}">ONE-LINE HEADLINE *</span><input value="{{ lf.headline }}" onChange="{{ ls.headline }}" maxlength="160" placeholder="e.g. Village-road specialist. Airport runs at any hour." style="${F}"></label>
        <label style="display: grid; gap: 5px; margin-top: 16px;"><span style="${L}">ABOUT YOUR BUSINESS *</span><textarea rows="5" value="{{ lf.description }}" onChange="{{ ls.description }}" maxlength="3000" placeholder="What you do, where, for whom, and what makes you good at it." style="${F} resize: vertical;"></textarea></label>
        <div class="tw-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
          <label style="display: grid; gap: 5px;"><span style="${L}">GUIDE RATE ({{ lf.currency }}) <span style="color: #6E6155;">— blank = priced per job</span></span><input value="{{ lf.rate }}" onChange="{{ ls.rate }}" inputmode="decimal" placeholder="e.g. 400,000" style="${F}"></label>
          <label style="display: grid; gap: 5px;"><span style="${L}">PER</span><select value="{{ lf.rateUnit }}" onChange="{{ ls.rateUnit }}" style="${F}"><sc-for list="{{ units }}" as="u"><option value="{{ u.value }}">{{ u.label }}</option></sc-for></select></label>
        </div>

        <div style="margin-top: 22px;">
          <span style="${L}">COVER PHOTO *</span>
          <div style="display: flex; gap: 14px; align-items: center; flex-wrap: wrap; margin-top: 6px;">
            <sc-if value="{{ lf.coverUrl }}"><img src="{{ lf.coverUrl }}" alt="Cover preview" style="width: 160px; height: 100px; object-fit: cover; border: 2px solid #1F3A38;"></sc-if>
            <label style="border: 2px dashed #A85A23; background: #FBEED8; color: #7A3E0F; font-family: var(--tz-mono); font-size: 12px; padding: 12px 16px; cursor: pointer;">{{ coverLabel }}<input type="file" accept="image/jpeg,image/png,image/webp" onChange="{{ uploadCover }}" aria-label="Upload a cover photo" style="position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none;"></label>
          </div>
        </div>

        <div style="margin-top: 22px;">
          <span style="${L}">GALLERY <span style="color: #6E6155;">— up to 8 photos; three or more give you the full listing page</span></span>
          <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 6px;">
            <sc-for list="{{ gallery }}" as="g">
              <div style="position: relative;"><img src="{{ g.url }}" alt="{{ g.alt }}" style="width: 110px; height: 80px; object-fit: cover; border: 2px solid #1F3A38; display: block;"><button onClick="{{ g.remove }}" aria-label="Remove photo" style="position: absolute; top: 4px; right: 4px; background: #FFFDF8; border: 2px solid #1F3A38; font-size: 11px; padding: 1px 6px; cursor: pointer;">✕</button></div>
            </sc-for>
            <sc-if value="{{ canAddPhoto }}"><label style="width: 110px; height: 80px; border: 2px dashed #A85A23; background: #FBEED8; color: #7A3E0F; font-family: var(--tz-mono); font-size: 11px; display: flex; align-items: center; justify-content: center; cursor: pointer; text-align: center;">＋ PHOTO<input type="file" accept="image/jpeg,image/png,image/webp" onChange="{{ addPhoto }}" aria-label="Add a gallery photo" style="position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none;"></label></sc-if>
          </div>
        </div>

        <div style="margin-top: 22px;">
          <span style="${L}">SERVICES &amp; GUIDE RATES</span>
          <div style="display: grid; gap: 10px; margin-top: 6px;">
            <sc-for list="{{ serviceRows }}" as="sv">
              <div class="tw-2col" style="display: grid; grid-template-columns: 1.2fr 1.6fr 0.8fr 0.8fr auto; gap: 8px; align-items: center;">
                <input value="{{ sv.title }}" onChange="{{ sv.setTitle }}" maxlength="80" aria-label="Service" placeholder="e.g. Airport transfers" style="${F} padding: 10px 12px; font-size: 13.5px;">
                <input value="{{ sv.description }}" onChange="{{ sv.setDescription }}" maxlength="300" aria-label="Details" placeholder="What's included" style="${F} padding: 10px 12px; font-size: 13.5px;">
                <input value="{{ sv.rate }}" onChange="{{ sv.setRate }}" inputmode="decimal" aria-label="Rate" placeholder="Rate" style="${F} padding: 10px 12px; font-size: 13.5px; font-family: var(--tz-mono);">
                <select value="{{ sv.rateUnit }}" onChange="{{ sv.setUnit }}" aria-label="Per" style="${F} padding: 10px 8px; font-size: 13px;"><sc-for list="{{ units }}" as="u"><option value="{{ u.value }}">{{ u.label }}</option></sc-for></select>
                <button onClick="{{ sv.remove }}" aria-label="Remove service" style="border: 2px solid #B8463A; color: #B8463A; background: none; font-family: var(--tz-mono); font-size: 11px; padding: 10px 12px; cursor: pointer;">✕</button>
              </div>
            </sc-for>
            <sc-if value="{{ canAddService }}"><button onClick="{{ addService }}" style="border: 2px dashed #A85A23; background: #FBEED8; color: #7A3E0F; font-family: var(--tz-mono); font-size: 12px; padding: 10px; cursor: pointer;">+ ADD A SERVICE</button></sc-if>
          </div>
        </div>

        <sc-if value="{{ listingError }}"><div role="alert" style="margin-top: 18px; border: 2px solid #B8463A; background: #FBEED8; color: #7A3E0F; padding: 12px 16px; font-size: 13.5px;">{{ listingError }}</div></sc-if>
        <div style="display: flex; gap: 10px; margin-top: 22px; flex-wrap: wrap; align-items: center;">
          <button onClick="{{ saveListing }}" aria-busy="{{ savingListing }}" style="font-family: var(--tz-display); font-size: 16px; text-transform: uppercase; background: #D97A3B; color: #1F3A38; border: 2px solid #1F3A38; padding: 14px 30px; cursor: pointer; box-shadow: 4px 4px 0 #1F3A38;">{{ saveLabel }}</button>
          <span style="${H}">{{ saveNote }}</span>
        </div>
      </section>
    </sc-if>

    <sc-if value="{{ hasListing }}">

    <!-- Stat tiles -->
    <div class="tw-4col" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; border: 2px solid #1F3A38; background: #1F3A38; margin-bottom: 40px;">
      <sc-for list="{{ tiles }}" as="t" hint-placeholder-count="4">
        <div style="background: {{ t.bg }}; color: {{ t.fg }}; padding: 22px 24px;">
          <div style="font-family: var(--tz-mono); font-size: 11px; letter-spacing: 0.08em; opacity: 0.75;">{{ t.label }}</div>
          <div style="font-family: var(--tz-display); font-size: 42px; line-height: 1; margin-top: 10px;">{{ t.big }}</div>
          <div style="font-size: 12.5px; margin-top: 6px; opacity: 0.75;">{{ t.sub }}</div>
        </div>
      </sc-for>
    </div>

    <div class="tw-2col" style="display: grid; grid-template-columns: 1.5fr 0.9fr; gap: 40px; align-items: start;">
      <!-- Leads -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">
          <h2 style="font-family: var(--tz-display); font-size: 28px; text-transform: uppercase; margin: 0;">Matched needs — respond to win<span style="color: #D97A3B;">.</span></h2>
          <span style="font-family: var(--tz-mono); font-size: 12px; color: #6E6155;">matched to: {{ matchedTo }}</span>
        </div>
        <div style="display: grid; gap: 14px;">
          <sc-if value="{{ noLeads }}">
            <div style="border: 2px dashed #1F3A38; background: #FFFDF8; padding: 20px 22px; font-size: 14px; color: #6E6155; line-height: 1.55;">{{ noLeadsText }}</div>
          </sc-if>
          <sc-for list="{{ leads }}" as="ld" hint-placeholder-count="3">
            <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 20px 22px;">
              <div style="display: flex; justify-content: space-between; gap: 16px; align-items: start; flex-wrap: wrap;">
                <div>
                  <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                    <span style="font-family: var(--tz-display); font-size: 19px; text-transform: uppercase;">{{ ld.title }}</span>
                    <sc-if value="{{ ld.hot }}" hint-placeholder-val="{{ false }}"><span style="background: #D97A3B; border: 1px solid #1F3A38; font-family: var(--tz-mono); font-size: 10px; padding: 3px 7px;">HOT</span></sc-if>
                  </div>
                  <div style="font-family: var(--tz-mono); font-size: 12px; color: #6E6155; margin-top: 5px;">{{ ld.meta }}</div>
                  <div style="font-size: 13.5px; color: #3A2F25; line-height: 1.5; margin-top: 8px; max-width: 520px;">{{ ld.body }}</div>
                </div>
                <div style="text-align: right; flex-shrink: 0;">
                  <div style="font-family: var(--tz-display); font-size: 20px; color: #A85A23;">{{ ld.budget }}</div>
                  <div style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">{{ ld.offersLabel }}</div>
                </div>
              </div>
              <sc-if value="{{ ld.hasMine }}">
                <div style="margin-top: 12px; border: 1px dashed #4a7c4a; background: #DCE8D9; padding: 10px 14px; font-size: 12.5px; color: #2c4a2c;">{{ ld.mineText }} <a href="{{ ld.mineHref }}" style="color: #A85A23;">Open the conversation →</a></div>
              </sc-if>
              <sc-if value="{{ ld.canOffer }}">
              <div style="display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap;">
                <button onClick="{{ ld.toggleOffer }}" aria-expanded="{{ ld.offerOpen }}" style="font-family: var(--tz-display); font-size: 14px; text-transform: uppercase; background: {{ ld.offerBtnBg }}; color: {{ ld.offerBtnFg }}; border: 2px solid #1F3A38; padding: 10px 20px; cursor: pointer;">{{ ld.offerBtnLabel }}</button>
                <button onClick="{{ ld.toggleAsk }}" aria-expanded="{{ ld.askOpen }}" style="font-family: var(--tz-mono); font-size: 12px; background: {{ ld.askBtnBg }}; border: 2px solid #1F3A38; padding: 10px 16px; cursor: pointer;">ASK A QUESTION</button>
                <span style="margin-left: auto; font-size: 12px; color: #6E6155; align-self: center;">Poster's contacts masked until acceptance.</span>
              </div>
              </sc-if>
              <!-- Offer composer -->
              <sc-if value="{{ ld.offerOpen }}" hint-placeholder-val="{{ false }}">
                <div style="margin-top: 14px; border-top: 1px dashed #C9BFB1; padding-top: 14px; display: grid; gap: 10px;">
                  <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; letter-spacing: 0.08em;">[Your formal offer — binding once accepted]</div>
                  <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <input value="{{ ld.offerPrice }}" onChange="{{ ld.setPrice }}" inputmode="decimal" aria-label="Your price" placeholder="{{ ld.pricePlaceholder }}" style="flex: 1; min-width: 140px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 12px 14px; font-family: var(--tz-mono); font-size: 13px; outline: none;">
                    <input value="{{ ld.offerNote }}" onChange="{{ ld.setNote }}" maxlength="600" aria-label="What's included" placeholder="What's included…" style="flex: 2; min-width: 200px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 12px 14px; font-family: var(--tz-sans); font-size: 13.5px; outline: none;">
                    <button onClick="{{ ld.submitOffer }}" style="font-family: var(--tz-display); font-size: 14px; text-transform: uppercase; background: #D97A3B; color: #1F3A38; border: 2px solid #1F3A38; padding: 10px 20px; cursor: pointer;">Submit →</button>
                  </div>
                </div>
              </sc-if>
              <!-- Question composer -->
              <sc-if value="{{ ld.askOpen }}" hint-placeholder-val="{{ false }}">
                <div style="margin-top: 14px; border-top: 1px dashed #C9BFB1; padding-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
                  <input value="{{ ld.question }}" onChange="{{ ld.setQuestion }}" maxlength="1000" aria-label="Your question" placeholder="Ask about dates, places, numbers…" style="flex: 1; min-width: 220px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 12px 14px; font-family: var(--tz-sans); font-size: 13.5px; outline: none;">
                  <button onClick="{{ ld.submitAsk }}" style="font-family: var(--tz-mono); font-size: 12px; background: #1F3A38; color: #F7F1E6; border: 2px solid #1F3A38; padding: 10px 18px; cursor: pointer;">SEND QUESTION →</button>
                </div>
              </sc-if>
              <sc-if value="{{ ld.sent }}" hint-placeholder-val="{{ false }}">
                <div style="margin-top: 12px; border: 1px dashed #4a7c4a; background: #DCE8D9; padding: 10px 14px; font-size: 12.5px; color: #2c4a2c;">{{ ld.sentMsg }} <a href="{{ ld.sentHref }}" style="color: #A85A23;">Open in Messages →</a></div>
              </sc-if>
            </div>
          </sc-for>
        </div>

        <!-- Direct requests -->
        <sc-if value="{{ hasRequests }}">
          <h2 style="font-family: var(--tz-display); font-size: 24px; text-transform: uppercase; margin: 36px 0 12px;">Asked for you by name<span style="color: #D97A3B;">.</span></h2>
          <div style="display: grid; gap: 10px;">
            <sc-for list="{{ requests }}" as="rq">
              <a href="{{ rq.href }}" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 14px 18px; text-decoration: none; color: #14201F; display: grid; grid-template-columns: 1fr auto; gap: 14px; align-items: center;">
                <div><div style="font-weight: 700; font-size: 14px;">{{ rq.name }} <span style="font-family: var(--tz-mono); font-size: 10.5px; color: #6E6155;">· {{ rq.when }}</span></div><div style="font-size: 13px; color: #3A2F25; margin-top: 3px; line-height: 1.45;">{{ rq.message }}</div></div>
                <span style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #1F3A38; background: #D97A3B; padding: 7px 12px; white-space: nowrap;">REPLY →</span>
              </a>
            </sc-for>
          </div>
        </sc-if>

        <!-- Bookings calendar with month nav -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin: 40px 0 16px; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <button onClick="{{ prevMonth }}" aria-label="Previous month" style="border: 2px solid #1F3A38; background: #FFFDF8; font-family: var(--tz-mono); font-size: 14px; padding: 8px 14px; cursor: pointer;">←</button>
            <h2 style="font-family: var(--tz-display); font-size: 28px; text-transform: uppercase; margin: 0; min-width: 240px; text-align: center;">{{ monthName }}<span style="color: #D97A3B;">.</span></h2>
            <button onClick="{{ nextMonth }}" aria-label="Next month" style="border: 2px solid #1F3A38; background: #FFFDF8; font-family: var(--tz-mono); font-size: 14px; padding: 8px 14px; cursor: pointer;">→</button>
          </div>
          <a href="/api/providers/me/calendar" download style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23;">↓ ADD BOOKINGS TO YOUR CALENDAR (.ICS)</a>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); border: 2px solid #1F3A38; border-bottom: 0; background: #1F3A38; color: #F7F1E6; font-family: var(--tz-mono); font-size: 10.5px; text-align: center;">
          <span style="padding: 7px 0;">MON</span><span style="padding: 7px 0;">TUE</span><span style="padding: 7px 0;">WED</span><span style="padding: 7px 0;">THU</span><span style="padding: 7px 0;">FRI</span><span style="padding: 7px 0;">SAT</span><span style="padding: 7px 0;">SUN</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; border: 2px solid #1F3A38; background: #1F3A38;">
          <sc-for list="{{ calendar }}" as="d" hint-placeholder-count="28">
            <button onClick="{{ d.pick }}" aria-label="{{ d.aria }}" style="background: {{ d.bg }}; color: {{ d.fg }}; min-height: 74px; padding: 8px 10px; border: 0; cursor: pointer; text-align: left; font-family: var(--tz-sans);">
              <div style="font-family: var(--tz-mono); font-size: 11px;">{{ d.num }}</div>
              <sc-if value="{{ d.label }}" hint-placeholder-val="{{ false }}">
                <div style="font-size: 10.5px; font-weight: 700; line-height: 1.3; margin-top: 6px;">{{ d.label }}</div>
              </sc-if>
            </button>
          </sc-for>
        </div>
        <sc-if value="{{ selectedBooking }}">
          <a href="{{ selectedHref }}" style="display: flex; justify-content: space-between; gap: 12px; margin-top: 12px; border: 2px solid #1F3A38; background: #FFFDF8; box-shadow: 5px 5px 0 #D97A3B; padding: 14px 18px; text-decoration: none; color: #14201F;">
            <span><strong>{{ selectedTitle }}</strong><br><span style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">{{ selectedMeta }}</span></span>
            <span style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; align-self: center;">OPEN →</span>
          </a>
        </sc-if>
        <div style="font-size: 12.5px; color: #6E6155; margin-top: 10px;">Orange: paid into escrow. Sand: accepted, waiting for payment. Tap a booked day for details; the calendar file keeps your phone in step.</div>
      </div>

      <!-- Right rail -->
      <aside style="display: grid; gap: 18px;">
        <!-- Membership -->
        <div style="border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 24px;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">[Uanachama — membership]</div>
          <div style="font-family: var(--tz-display); font-size: 26px; text-transform: uppercase; margin: 10px 0 4px;">{{ membershipStatus }}</div>
          <div style="font-size: 13px; color: rgba(247,241,230,0.75); line-height: 1.5;">12-month listing · {{ membership.price }} / yr. Profile, gallery and reviews stay live and matchable.</div>
          <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #E8A472; margin-top: 8px; line-height: 1.6;">{{ billingNote }}</div>
          <div style="height: 8px; background: rgba(247,241,230,0.2); margin: 14px 0;"><div style="height: 100%; width: {{ membershipPct }}; background: #D97A3B; transition: width 300ms ease;"></div></div>
          <button onClick="{{ renew }}" style="width: 100%; font-family: var(--tz-display); font-size: 14px; text-transform: uppercase; background: {{ renewBg }}; color: #1F3A38; border: 0; padding: 12px; cursor: pointer;">{{ renewLabel }}</button>
          <button onClick="{{ renewPoints }}" style="width: 100%; margin-top: 8px; font-family: var(--tz-mono); font-size: 11.5px; background: none; color: #F7F1E6; border: 1px solid rgba(247,241,230,0.5); padding: 10px; cursor: pointer;">OR PAY WITH POINTS</button>
        </div>

        <!-- Earnings (business ledger — separate from personal wallet) -->
        <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 24px;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; letter-spacing: 0.08em;">[Mapato — business earnings]</div>
          <div style="font-family: var(--tz-display); font-size: 34px; margin: 10px 0 2px;">{{ earningsTotal }}</div>
          <div style="font-size: 12.5px; color: #6E6155;">{{ earningsNote }}</div>
          <div style="display: flex; align-items: flex-end; gap: 6px; height: 64px; margin-top: 16px;">
            <sc-for list="{{ bars }}" as="b" hint-placeholder-count="8">
              <div title="{{ b.title }}" style="flex: 1; background: {{ b.color }}; height: {{ b.h }};"></div>
            </sc-for>
          </div>
          <div style="display: flex; gap: 8px; margin-top: 14px;">
            <a href="/provider-wallet" style="flex: 1; text-align: center; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 10px; text-decoration: none;">WITHDRAW →</a>
            <a href="/provider-wallet" style="flex: 1; text-align: center; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #F7F1E6; color: #14201F; padding: 10px; text-decoration: none;">FULL LEDGER</a>
          </div>
          <div style="font-size: 11.5px; color: #6E6155; margin-top: 10px; line-height: 1.5;">Business earnings are kept apart from your personal points wallet. Withdraw them to mobile money or a bank account from the business wallet.</div>
        </div>

        <!-- Notification prefs -->
        <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 24px;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; letter-spacing: 0.08em;">[Arifa — notification controls]</div>
          <div style="display: grid; gap: 12px; margin-top: 14px;">
            <sc-for list="{{ prefs }}" as="p" hint-placeholder-count="4">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                <span style="font-size: 13.5px;">{{ p.label }}</span>
                <button onClick="{{ p.toggle }}" role="switch" aria-checked="{{ p.on }}" aria-label="{{ p.label }}" style="width: 50px; height: 26px; border: 2px solid #1F3A38; background: {{ p.bg }}; cursor: pointer; position: relative; padding: 0; flex-shrink: 0;">
                  <span style="position: absolute; top: 2px; left: {{ p.knobLeft }}; width: 18px; height: 18px; background: #1F3A38; transition: left 120ms ease;"></span>
                </button>
              </div>
            </sc-for>
          </div>
        </div>

        <!-- Public listing -->
        <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 24px;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; letter-spacing: 0.08em;">[Your public listing]</div>
          <div style="display: flex; gap: 12px; align-items: center; margin-top: 12px;">
            <img src="{{ provider.coverUrl }}" alt="" style="width: 72px; height: 72px; object-fit: cover; border: 2px solid #1F3A38; background: #EFE7D6;">
            <div>
              <div style="font-weight: 700; font-size: 14.5px;">{{ provider.name }}</div>
              <div style="font-size: 12.5px; color: #6E6155;">{{ listingStats }}</div>
            </div>
          </div>
          <div style="display: flex; gap: 8px; margin-top: 14px;">
            <a href="{{ listingHref }}" style="flex: 1; text-align: center; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #F7F1E6; color: #14201F; padding: 10px; text-decoration: none;">VIEW ↗</a>
            <button onClick="{{ editListing }}" style="flex: 1; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 10px; cursor: pointer;">EDIT</button>
            <button onClick="{{ shareListing }}" style="flex: 1; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 10px; cursor: pointer;">{{ shareLabel }}</button>
          </div>
        </div>
      </aside>
    </div>
    </sc-if>
  </div>

</div>
`;

export default template;
