// Markup for the myTwende page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh;">

  <!-- Header -->
  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 18px 24px; border-bottom: 2px solid #1F3A38; background: #F7F1E6; position: sticky; top: 0; z-index: 40;">
    <div style="display: flex; align-items: center; gap: 24px;">
      <a href="/" class="tz-logo-link" aria-label="Twendezetu home"><img src="/brand/logo.png" alt="Twendezetu" width="1211" height="229" class="tz-logo tz-logo--md"></a>
      <span style="font-family: var(--tz-mono); font-size: 12px; background: #820101; border: 2px solid #1F3A38; color: #F7F1E6; padding: 4px 10px;">MY TWENDE</span>
    </div>
    <div style="display: flex; align-items: center; gap: 12px; position: relative;">
      <a href="/create-event" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; color: #14201F; text-decoration: none; padding: 10px 16px;">+ POST</a>
      <button onClick="{{ toggleBell }}" aria-label="Notifications" style="position: relative; background: none; border: 2px solid #1F3A38; padding: 9px 12px; cursor: pointer; font-family: var(--tz-mono); font-size: 13px;">▲<sc-if value="{{ bellBadge }}" hint-placeholder-val="{{ true }}"><span style="position: absolute; top: -7px; right: -7px; background: #820101; border: 2px solid #1F3A38; font-family: var(--tz-mono); font-size: 10px; padding: 1px 5px; color: #F7F1E6;">{{ me.unread }}</span></sc-if></button>
      <button onClick="{{ toggleProfile }}" style="width: 40px; height: 40px; background: #1F3A38; color: #F7F1E6; border: 2px solid #1F3A38; font-family: var(--tz-display); font-size: 17px; display: flex; align-items: center; justify-content: center; cursor: pointer; white-space: nowrap;" aria-label="Your account">{{ me.initials }}</button>

      <!-- Profile dropdown -->
      <sc-if value="{{ profileOpen }}" hint-placeholder-val="{{ false }}">
        <div style="position: absolute; top: 52px; right: 0; width: 280px; background: #FFFDF8; border: 2px solid #1F3A38; box-shadow: 6px 6px 0 #1F3A38; z-index: 60;">
          <div style="padding: 16px 18px; border-bottom: 2px solid #1F3A38; display: flex; gap: 12px; align-items: center;">
            <div style="width: 44px; height: 44px; background: #1F3A38; color: #F7F1E6; font-family: var(--tz-display); font-size: 18px; display: flex; align-items: center; justify-content: center;">{{ me.initials }}</div>
            <div>
              <div style="font-weight: 700; font-size: 14.5px;">{{ me.name }}</div>
              <div style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">{{ roleLine }}</div>
            </div>
          </div>
          <a href="/settings" style="display: block; text-decoration: none; color: #14201F; border-bottom: 1px solid #E3D9C6; padding: 13px 18px; font-size: 14px;">✎ &nbsp;Edit profile &amp; settings</a>
          <a href="/points-wallet" style="display: block; text-decoration: none; color: #14201F; border-bottom: 1px solid #E3D9C6; padding: 13px 18px; font-size: 14px;">◍ &nbsp;Points wallet</a>
          <a href="/settings?tab=notifications" style="display: block; text-decoration: none; color: #14201F; border-bottom: 1px solid #E3D9C6; padding: 13px 18px; font-size: 14px;">▲ &nbsp;Notification settings</a>
          <sc-if value="{{ me.isProvider }}">
            <a href="/provider-dashboard" style="display: block; text-decoration: none; color: #14201F; border-bottom: 1px solid #E3D9C6; padding: 13px 18px; font-size: 14px;">◆ &nbsp;Vendor dashboard</a>
          </sc-if>
          <sc-if value="{{ me.isStaff }}">
            <a href="/admin" style="display: block; text-decoration: none; color: #14201F; border-bottom: 1px solid #E3D9C6; padding: 13px 18px; font-size: 14px;">⚑ &nbsp;Trust &amp; safety desk</a>
          </sc-if>
          <sc-if value="{{ me.isFinance }}">
            <a href="/finance" style="display: block; text-decoration: none; color: #14201F; border-bottom: 1px solid #E3D9C6; padding: 13px 18px; font-size: 14px;">≡ &nbsp;Finance desk</a>
          </sc-if>
          <button onClick="{{ signOut }}" style="display: block; width: 100%; text-align: left; background: none; border: 0; cursor: pointer; font-family: inherit; color: #B8463A; padding: 13px 18px; font-size: 14px; font-weight: 600;">→ &nbsp;Sign out</button>
        </div>
      </sc-if>

      <!-- Notifications dropdown -->
      <sc-if value="{{ bellOpen }}" hint-placeholder-val="{{ false }}">
        <div style="position: absolute; top: 52px; right: 0; width: 340px; background: #FFFDF8; border: 2px solid #1F3A38; box-shadow: 6px 6px 0 #1F3A38; z-index: 60;">
          <div style="padding: 12px 16px; border-bottom: 2px solid #1F3A38; font-family: var(--tz-display); font-size: 15px; text-transform: uppercase;">Notifications</div>
          <sc-for list="{{ notices }}" as="n" hint-placeholder-count="2">
            <a href="{{ n.href }}" style="display: block; text-decoration: none; color: #14201F; padding: 12px 16px; border-bottom: 1px solid #E3D9C6; background: {{ n.bg }};">
              <div style="font-size: 13px; font-weight: 600; line-height: 1.45;">{{ n.body }}</div>
              <div style="font-size: 12.5px; color: #3A2F25; line-height: 1.45; margin-top: 2px;">{{ n.detail }}</div>
              <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #820101; margin-top: 3px;">{{ n.time }}</div>
            </a>
          </sc-for>
          <sc-if value="{{ noNotices }}">
            <div style="padding: 16px; font-size: 13px; color: #6E6155;">Nothing new. Offers, reminders and money notices land here.</div>
          </sc-if>
          <a href="/messages" style="display: block; padding: 11px 16px; font-family: var(--tz-mono); font-size: 12px; color: #820101; text-decoration: underline;">OPEN MESSAGES →</a>
        </div>
      </sc-if>
    </div>
  </header>

  <!-- Portal nav -->
  <nav style="display: flex; gap: 4px; align-items: center; padding: 10px 20px; border-bottom: 2px solid #1F3A38; background: #FFFDF8; overflow-x: auto;">
    <a href="/" style="display: flex; align-items: center; gap: 8px; text-decoration: none; color: #3A2F25; font-family: var(--tz-mono); font-size: 12px; padding: 9px 14px; white-space: nowrap;">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 10.5 12 3l9 7.5"></path><path d="M5 9.5V21h14V9.5"></path></svg>
      HOME
    </a>
    <a href="/my-twende" style="display: flex; align-items: center; gap: 8px; text-decoration: none; color: #14201F; background: #1F3A38; font-family: var(--tz-mono); font-size: 12px; padding: 9px 14px; white-space: nowrap; color: #F7F1E6;">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c0-4 3.5-6.5 8-6.5s8 2.5 8 6.5"></path></svg>
      MY TWENDE
    </a>
    <a href="/create-event" style="display: flex; align-items: center; gap: 8px; text-decoration: none; color: #3A2F25; font-family: var(--tz-mono); font-size: 12px; padding: 9px 14px; white-space: nowrap;">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"></circle><path d="M12 8v8M8 12h8"></path></svg>
      POST
    </a>
    <a href="/messages" style="display: flex; align-items: center; gap: 8px; text-decoration: none; color: #3A2F25; font-family: var(--tz-mono); font-size: 12px; padding: 9px 14px; white-space: nowrap;">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z"></path></svg>
      MESSAGES
    </a>
    <a href="/points-wallet" style="display: flex; align-items: center; gap: 8px; text-decoration: none; color: #3A2F25; font-family: var(--tz-mono); font-size: 12px; padding: 9px 14px; white-space: nowrap;">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="6" width="18" height="13" rx="2"></rect><path d="M16 12.5h5M3 10h18"></path></svg>
      WALLET
    </a>
    <a href="/settings" style="display: flex; align-items: center; gap: 8px; text-decoration: none; color: #3A2F25; font-family: var(--tz-mono); font-size: 12px; padding: 9px 14px; white-space: nowrap;">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="3.2"></circle><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1"></path></svg>
      SETTINGS
    </a>
  </nav>

  <div style="max-width: 1320px; margin: 0 auto; padding: 40px 24px 80px;">
    <div style="font-family: var(--tz-mono); font-size: 12px; color: #820101; letter-spacing: 0.08em;">[Ukurasa wako — your space]</div>
    <h1 style="font-family: var(--tz-display); font-size: clamp(40px, 5.5vw, 72px); text-transform: uppercase; line-height: 0.95; margin: 10px 0 8px;">Karibu, {{ me.firstName }}<span style="color: #820101;">.</span></h1>
    <p style="font-size: 15px; color: #6E6155; margin: 0 0 28px;">{{ summary }}</p>

    <!-- Tabs -->
    <!-- Single pill row — wallet & messages live in the portal nav above, not here -->
    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px;">
      <sc-for list="{{ tabs }}" as="t" hint-placeholder-count="5">
        <button onClick="{{ t.go }}" style="font-family: var(--tz-display); font-size: 14px; text-transform: uppercase; padding: 10px 20px; border: 2px solid #1F3A38; border-radius: 999px; cursor: pointer; background: {{ t.bg }}; color: {{ t.fg }};">{{ t.label }}</button>
      </sc-for>
    </div>

    <!-- TAB: for you -->
    <sc-if value="{{ showForYou }}" hint-placeholder-val="{{ true }}">
      <div>
        <!-- Featured for you + happening soon -->
        <div class="tw-2col" style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; margin-bottom: 28px; align-items: stretch;">
          <sc-if value="{{ fyFeatured }}">
          <a href="{{ fyFeatured.href }}" style="position: relative; text-decoration: none; color: #F7F1E6; border: 2px solid #1F3A38; box-shadow: 6px 6px 0 #1F3A38; overflow: hidden; display: block; min-height: 300px;">
            <img src="{{ fyFeatured.img }}" alt="{{ fyFeatured.title }}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;">
            <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(20,32,31,0.05) 0%, rgba(20,32,31,0.5) 45%, rgba(20,32,31,0.92) 100%);"></div>
            <div style="position: relative; z-index: 2; display: flex; flex-direction: column; height: 100%; padding: 20px; box-sizing: border-box;">
              <span style="align-self: flex-start; background: #820101; border: 2px solid #1F3A38; color: #F7F1E6; font-family: var(--tz-mono); font-size: 11px; padding: 4px 10px;">{{ fyFeatured.date }}</span>
              <div style="margin-top: auto;">
                <div style="font-family: var(--tz-mono); font-size: 11px; color: #820101;">{{ fyFeatured.by }}</div>
                <div style="font-family: var(--tz-display); font-size: clamp(26px, 3vw, 38px); text-transform: uppercase; line-height: 1; margin: 6px 0;">{{ fyFeatured.title }}</div>
                <div style="font-size: 13px; color: rgba(247,241,230,0.88); line-height: 1.45; max-width: 460px;">{{ fyFeatured.blurb }}</div>
                <div style="font-family: var(--tz-mono); font-size: 11px; color: #F7F1E6; margin-top: 10px;">{{ fyFeatured.city }}</div>
              </div>
            </div>
          </a>
          </sc-if>
          <div style="border: 2px solid #1F3A38; background: #FFFDF8; display: flex; flex-direction: column; min-height: 300px;">
            <div style="padding: 12px 14px; border-bottom: 2px solid #1F3A38; font-family: var(--tz-mono); font-size: 11px; color: #820101; letter-spacing: 0.1em; flex-shrink: 0;">HAPPENING SOON FOR YOU</div>
            <div style="overflow-y: auto; flex: 1;">
              <sc-for list="{{ fyExplore }}" as="ex" hint-placeholder-count="3">
                <a href="{{ ex.href }}" style="display: grid; grid-template-columns: 68px 1fr; gap: 10px; align-items: center; text-decoration: none; color: #14201F; padding: 10px 14px; border-bottom: 1px solid #E3D9C6;">
                  <img src="{{ ex.img }}" alt="{{ ex.title }}" style="width: 68px; height: 54px; object-fit: cover; border: 2px solid #1F3A38; display: block;">
                  <div>
                    <div style="font-family: var(--tz-display); font-size: 15px; text-transform: uppercase; line-height: 1.05;">{{ ex.title }}</div>
                    <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #6E6155; margin-top: 3px;">{{ ex.date }} · {{ ex.by }}</div>
                  </div>
                </a>
              </sc-for>
            </div>
          </div>
        </div>

        <!-- Top organizers row -->
        <div style="font-family: var(--tz-mono); font-size: 12px; color: #820101; letter-spacing: 0.08em; margin-bottom: 12px;">[Organizers you follow]</div>
        <sc-if value="{{ noOrganizers }}">
          <p style="font-size: 13.5px; color: #6E6155; margin: 0; max-width: 620px; line-height: 1.55;">You don't follow any organizers yet. Follow one from any of their event pages and their new events show up here first.</p>
        </sc-if>
        <div style="display: flex; gap: 18px; overflow-x: auto; padding-bottom: 8px;">
          <sc-for list="{{ fyOrganizers }}" as="og" hint-placeholder-count="6">
            <div style="text-align: center; flex: 0 0 auto;" title="{{ og.name }}">
              <div style="width: 64px; height: 64px; border-radius: 999px; border: 2px solid #1F3A38; background: {{ og.bg }}; color: {{ og.fg }}; font-family: var(--tz-display); font-size: 22px; display: flex; align-items: center; justify-content: center;">{{ og.init }}</div>
              <div style="font-family: var(--tz-mono); font-size: 10px; color: #6E6155; margin-top: 6px; max-width: 72px;">{{ og.name }}</div>
            </div>
          </sc-for>
        </div>

        <!-- From organizers you follow -->
        <sc-if value="{{ hasFollowedEvents }}">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin: 28px 0 12px;">
          <h2 style="font-family: var(--tz-display); font-size: 24px; text-transform: uppercase; margin: 0;">From organizers you follow<span style="color: #820101;">.</span></h2>
          <div style="display: flex; gap: 6px; flex-shrink: 0;">
            <button onClick="{{ fyPrev }}" aria-label="Scroll left" style="width: 34px; height: 34px; border: 2px solid #1F3A38; background: #FFFDF8; cursor: pointer; font-size: 15px; color: #14201F;">‹</button>
            <button onClick="{{ fyNext }}" aria-label="Scroll right" style="width: 34px; height: 34px; border: 2px solid #1F3A38; background: #FFFDF8; cursor: pointer; font-size: 15px; color: #14201F;">›</button>
          </div>
        </div>
        <div id="{{ fyShelfId }}" style="display: flex; gap: 14px; overflow-x: auto; padding-bottom: 8px;">
          <sc-for list="{{ fyEvents }}" as="fe" hint-placeholder-count="4">
            <a href="{{ fe.href }}" style="flex: 0 0 230px; text-decoration: none; color: #14201F; border: 2px solid #1F3A38; background: #FFFDF8; display: block;">
              <img src="{{ fe.img }}" alt="{{ fe.title }}" style="width: 100%; height: 130px; object-fit: cover; display: block; border-bottom: 2px solid #1F3A38;">
              <div style="padding: 10px 12px;">
                <div style="font-family: var(--tz-mono); font-size: 10px; color: #820101;">{{ fe.date }}</div>
                <div style="font-family: var(--tz-display); font-size: 15px; text-transform: uppercase; line-height: 1.05; margin-top: 3px;">{{ fe.title }}</div>
                <div style="font-size: 11.5px; color: #6E6155; margin-top: 2px;">{{ fe.by }}</div>
              </div>
            </a>
          </sc-for>
        </div>
        </sc-if>

        <!-- Closing soon needs -->
        <sc-if value="{{ hasNeeds }}">
        <h2 style="font-family: var(--tz-display); font-size: 24px; text-transform: uppercase; margin: 28px 0 12px;">Hot right now — needs near you<span style="color: #820101;">.</span></h2>
        <div style="display: grid; gap: 10px; max-width: 760px;">
          <sc-for list="{{ fyNeeds }}" as="fn" hint-placeholder-count="2">
            <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 14px 16px; display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: center;">
              <div>
                <div style="font-family: var(--tz-display); font-size: 16px; text-transform: uppercase;">{{ fn.title }}</div>
                <div style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155; margin-top: 3px;">{{ fn.meta }}</div>
              </div>
              <span style="font-family: var(--tz-mono); font-size: 10.5px; background: #F6E6E2; border: 1px solid #820101; color: #5C0000; padding: 5px 9px;">{{ fn.chip }}</span>
            </div>
          </sc-for>
        </div>
        </sc-if>

        <!-- People to follow -->
        <sc-if value="{{ hasFollowCards }}">
        <h2 style="font-family: var(--tz-display); font-size: 24px; text-transform: uppercase; margin: 28px 0 12px;">Vendors to follow<span style="color: #820101;">.</span></h2>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; max-width: 900px;">
          <sc-for list="{{ fyFollow }}" as="ff" hint-placeholder-count="4">
            <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 12px 16px; display: flex; gap: 12px; align-items: center;">
              <div style="width: 40px; height: 40px; border-radius: 999px; border: 2px solid #1F3A38; background: {{ ff.bg }}; color: {{ ff.fg }}; font-family: var(--tz-display); font-size: 15px; display: flex; align-items: center; justify-content: center;">{{ ff.init }}</div>
              <div>
                <a href="{{ ff.href }}" style="font-weight: 700; font-size: 13.5px; color: #14201F; text-decoration: none;">{{ ff.name }}</a>
                <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #6E6155;">{{ ff.meta }}</div>
              </div>
              <button onClick="{{ ff.toggle }}" aria-pressed="{{ ff.following }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 2px solid #1F3A38; background: {{ ff.btnBg }}; color: {{ ff.btnFg }}; padding: 7px 12px; cursor: pointer;">{{ ff.btnLabel }}</button>
            </div>
          </sc-for>
        </div>
        </sc-if>
      </div>
    </sc-if>

    <!-- TAB: upcoming -->
    <sc-if value="{{ showUpcoming }}" hint-placeholder-val="{{ true }}">
      <div class="tw-2col" style="display: grid; grid-template-columns: 1.5fr 0.9fr; gap: 40px; align-items: start;">
        <div style="display: grid; gap: 16px;">
          <sc-if value="{{ noUpcoming }}">
            <div style="border: 2px dashed #1F3A38; background: #FFFDF8; padding: 28px 24px;">
              <div style="font-family: var(--tz-display); font-size: 22px; text-transform: uppercase;">Nothing on the calendar yet</div>
              <p style="font-size: 14px; color: #6E6155; line-height: 1.55; margin: 8px 0 16px; max-width: 520px;">RSVP to an event or buy a ticket and it lands here with your reminders, your ticket and a link to share.</p>
              <a href="/" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #820101; color: #F7F1E6; padding: 10px 16px; text-decoration: none;">BROWSE EVENTS →</a>
            </div>
          </sc-if>
          <sc-for list="{{ upcoming }}" as="ev" hint-placeholder-count="2">
            <div style="border: 2px solid #1F3A38; background: #FFFDF8;">
              <div style="display: grid; grid-template-columns: 130px 1fr;">
                <img src="{{ ev.img }}" alt="{{ ev.title }}" style="width: 100%; height: 100%; object-fit: cover; border-right: 2px solid #1F3A38;">
                <div style="padding: 18px 20px;">
                  <div style="display: flex; justify-content: space-between; align-items: start; gap: 12px;">
                    <div>
                      <div style="font-family: var(--tz-mono); font-size: 11px; color: #820101;">{{ ev.date }}</div>
                      <div style="font-family: var(--tz-display); font-size: 20px; text-transform: uppercase; margin-top: 4px;">{{ ev.title }}</div>
                      <div style="font-size: 13px; color: #6E6155; margin-top: 2px;">{{ ev.city }}</div>
                    </div>
                    <span style="font-family: var(--tz-mono); font-size: 11px; background: {{ ev.badgeBg }}; border: 2px solid #1F3A38; padding: 4px 8px; white-space: nowrap;">{{ ev.badge }}</span>
                  </div>
                  <div style="display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap;">
                    <a href="{{ ev.href }}" style="font-family: var(--tz-mono); font-size: 11.5px; border: 2px solid #1F3A38; background: #F7F1E6; color: #14201F; padding: 8px 12px; text-decoration: none;">VIEW</a>
                    <sc-if value="{{ ev.hasTickets }}">
                      <button onClick="{{ ev.toggleQr }}" aria-expanded="{{ ev.qrOpen }}" style="font-family: var(--tz-mono); font-size: 11.5px; border: 2px solid #1F3A38; background: {{ ev.qrBg }}; color: {{ ev.qrFg }}; padding: 8px 12px; cursor: pointer;">{{ ev.qrLabel }}</button>
                    </sc-if>
                    <button onClick="{{ ev.refer }}" aria-expanded="{{ ev.referOpen }}" style="font-family: var(--tz-mono); font-size: 11.5px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 8px 12px; cursor: pointer;">⧉ REFER A FRIEND</button>
                    <button onClick="{{ ev.toggleCal }}" style="font-family: var(--tz-mono); font-size: 11.5px; border: 2px solid #1F3A38; background: {{ ev.calBg }}; color: {{ ev.calFg }}; padding: 8px 12px; cursor: pointer;">{{ ev.calLabel }}</button>
                    <sc-if value="{{ ev.hasTickets }}">
                      <a href="{{ ev.disputeHref }}" style="font-family: var(--tz-mono); font-size: 11.5px; border: 2px solid #B8463A; color: #B8463A; background: #F7F1E6; padding: 8px 12px; text-decoration: none;">REFUND / DISPUTE</a>
                    </sc-if>
                    <sc-if value="{{ ev.owned }}" hint-placeholder-val="{{ false }}">
                      <a href="{{ ev.analyticsHref }}" style="font-family: var(--tz-mono); font-size: 11.5px; border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 8px 12px; text-decoration: none;">📊 ANALYTICS</a>
                    </sc-if>
                  </div>
                  <sc-if value="{{ ev.qrOpen }}" hint-placeholder-val="{{ false }}">
                    <div style="margin-top: 12px; border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 16px; display: grid; gap: 14px;">
                      <sc-for list="{{ ev.tickets }}" as="tk">
                        <div style="display: flex; gap: 18px; align-items: center; flex-wrap: wrap;">
                          <img src="{{ tk.qr }}" alt="QR code for ticket {{ tk.code }}" width="132" height="132" style="width: 132px; height: 132px; background: #F7F1E6; padding: 6px; flex-shrink: 0; opacity: {{ tk.opacity }};">
                          <div style="min-width: 160px;">
                            <div style="font-family: var(--tz-display); font-size: 18px; text-transform: uppercase;">{{ tk.heading }}</div>
                            <div style="font-family: var(--tz-mono); font-size: 12px; color: #E9B4AC; margin-top: 4px;">{{ tk.code }} · {{ tk.tier }}</div>
                            <div style="font-size: 12.5px; color: rgba(247,241,230,0.85); margin-top: 2px;">{{ tk.holder }}</div>
                          </div>
                        </div>
                      </sc-for>
                      <div style="font-size: 12px; color: rgba(247,241,230,0.75); line-height: 1.5;">Each code lets one person in, once. The scanner marks it used, so a forwarded copy won't get a second person through the gate. The code is signed, so the door can check it without signal.</div>
                    </div>
                  </sc-if>
                  <sc-if value="{{ ev.referOpen }}" hint-placeholder-val="{{ false }}">
                    <div style="margin-top: 12px; border: 1px dashed #820101; background: #FBEED8; padding: 12px 14px;">
                      <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #5C0000; margin-bottom: 8px;">[Share this event — your referral is tracked]</div>
                      <div style="display: flex; border: 2px solid #1F3A38;">
                        <input value="{{ ev.link }}" readOnly aria-label="Your share link" style="flex: 1; min-width: 0; border: 0; background: #FFFDF8; font-family: var(--tz-mono); font-size: 11.5px; padding: 9px 11px; outline: none;">
                        <button onClick="{{ ev.copy }}" style="border: 0; border-left: 2px solid #1F3A38; background: #820101; font-family: var(--tz-mono); font-size: 11px; padding: 0 12px; cursor: pointer; color: #F7F1E6;">COPY</button>
                      </div>
                      <div style="display: flex; gap: 6px; margin-top: 8px;">
                        <button onClick="{{ ev.shareWa }}" style="flex: 1; font-family: var(--tz-mono); font-size: 10.5px; border: 2px solid #1F3A38; background: #FFFDF8; padding: 8px; cursor: pointer;">WHATSAPP</button>
                        <button onClick="{{ ev.shareFb }}" style="flex: 1; font-family: var(--tz-mono); font-size: 10.5px; border: 2px solid #1F3A38; background: #FFFDF8; padding: 8px; cursor: pointer;">FACEBOOK</button>
                        <button onClick="{{ ev.shareEm }}" style="flex: 1; font-family: var(--tz-mono); font-size: 10.5px; border: 2px solid #1F3A38; background: #FFFDF8; padding: 8px; cursor: pointer;">EMAIL</button>
                      </div>
                    </div>
                  </sc-if>
                  <div style="margin-top: 12px; border-top: 1px dashed #C9BFB1; padding-top: 10px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                      <span style="font-size: 12.5px; color: #6E6155;">Reminders: <strong style="color: #14201F;">{{ ev.reminders }}</strong></span>
                      <button onClick="{{ ev.toggleEdit }}" aria-expanded="{{ ev.editOpen }}" style="background: none; border: 0; font-family: var(--tz-mono); font-size: 11.5px; color: #820101; cursor: pointer; text-decoration: underline;">{{ ev.editLabel }}</button>
                    </div>
                    <sc-if value="{{ ev.editOpen }}" hint-placeholder-val="{{ false }}">
                      <div style="display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap;">
                        <sc-for list="{{ ev.reminderOpts }}" as="ro" hint-placeholder-count="4">
                          <button onClick="{{ ro.pick }}" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #1F3A38; background: {{ ro.bg }}; color: {{ ro.fg }}; padding: 7px 11px; cursor: pointer;">{{ ro.label }}</button>
                        </sc-for>
                      </div>
                    </sc-if>
                  </div>
                </div>
              </div>
            </div>
          </sc-for>

          <!-- Waitlists -->
          <sc-for list="{{ waitlist }}" as="wl">
            <div style="border: 2px solid #1F3A38; background: #FBEED8; padding: 18px 22px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap;">
                <div style="font-family: var(--tz-display); font-size: 18px; text-transform: uppercase; color: #5C0000;">Waitlist: {{ wl.title }}</div>
                <span style="font-family: var(--tz-mono); font-size: 11px; background: #820101; color: #F7F1E6; border: 1px solid #1F3A38; padding: 4px 9px;">{{ wl.status }}</span>
              </div>
              <div style="font-family: var(--tz-mono); font-size: 11.5px; color: #5C0000; margin-top: 6px;">JOINED {{ wl.since }}</div>
              <div style="font-size: 13px; color: #3A2F25; line-height: 1.5; margin-top: 8px;">{{ wl.note }}</div>
              <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
                <a href="{{ wl.checkoutHref }}" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #1F3A38; background: {{ wl.ctaBg }}; color: {{ wl.ctaFg }}; padding: 7px 11px; text-decoration: none;">{{ wl.ctaLabel }}</a>
                <button onClick="{{ wl.leave }}" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #B8463A; color: #B8463A; background: none; padding: 7px 11px; cursor: pointer;">LEAVE WAITLIST</button>
              </div>
            </div>
          </sc-for>

          <!-- Your live needs and the offers on them -->
          <sc-for list="{{ activeNeeds }}" as="nd">
            <div style="border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 22px 24px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px;">
                <div style="font-family: var(--tz-display); font-size: 20px; text-transform: uppercase;">Your need: {{ nd.title }}</div>
                <span style="font-family: var(--tz-mono); font-size: 11px; background: #820101; color: #F7F1E6; padding: 4px 9px; white-space: nowrap;">{{ nd.offersLabel }}</span>
              </div>
              <div style="font-family: var(--tz-mono); font-size: 12px; color: rgba(247,241,230,0.7); margin-top: 6px;">{{ nd.meta }}</div>
              <div style="display: grid; gap: 10px; margin-top: 16px;">
                <sc-for list="{{ nd.offers }}" as="of">
                  <div style="background: #F7F1E6; color: #14201F; border: 2px solid #F7F1E6; padding: 14px 16px; opacity: {{ of.opacity }};">
                    <div style="display: grid; grid-template-columns: 1fr auto; gap: 14px; align-items: center;">
                      <div style="min-width: 0;">
                        <div style="font-weight: 700; font-size: 14px;"><a href="{{ of.providerHref }}" style="color: #14201F; text-decoration: none;">{{ of.name }}</a> <span style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">· ★ {{ of.rating }} · {{ of.jobs }} jobs</span></div>
                        <div style="font-size: 13px; color: #3A2F25; margin-top: 3px;">{{ of.note }}</div>
                      </div>
                      <div style="text-align: right;">
                        <div style="font-family: var(--tz-display); font-size: 18px; color: #820101;">{{ of.price }}</div>
                        <div style="display: flex; gap: 6px; margin-top: 6px; justify-content: flex-end;">
                          <sc-if value="{{ of.canAccept }}">
                            <button onClick="{{ of.accept }}" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #1F3A38; background: #820101; color: #F7F1E6; padding: 6px 10px; cursor: pointer;">ACCEPT</button>
                          </sc-if>
                          <a href="{{ of.threadHref }}" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #1F3A38; background: #FFFDF8; color: #14201F; padding: 6px 10px; text-decoration: none;">CHAT</a>
                        </div>
                      </div>
                    </div>
                    <sc-if value="{{ of.accepted }}" hint-placeholder-val="{{ false }}">
                      <div style="margin-top: 10px; border-top: 1px dashed #820101; padding-top: 10px; font-size: 12.5px; line-height: 1.5; color: #3A2F25;">
                        ✓ Accepted. Booking <strong>{{ of.bookingRef }}</strong>. {{ of.bookingNote }}
                        <div style="display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;">
                          <sc-if value="{{ of.needsPayment }}">
                            <button onClick="{{ of.pay }}" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 7px 12px; cursor: pointer;">PAY {{ of.price }} INTO ESCROW</button>
                          </sc-if>
                          <a href="{{ of.threadHref }}" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #1F3A38; background: #FFFDF8; color: #14201F; padding: 7px 12px; text-decoration: none;">CONTINUE IN MESSAGES →</a>
                        </div>
                      </div>
                    </sc-if>
                  </div>
                </sc-for>
              </div>
            </div>
          </sc-for>
        </div>

        <!-- Right rail -->
        <aside style="display: grid; gap: 18px;">
          <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 22px; box-shadow: 6px 6px 0 #820101;">
            <div style="font-family: var(--tz-mono); font-size: 11px; color: #820101; letter-spacing: 0.08em;">[Alika marafiki — referrals]</div>
            <div style="font-family: var(--tz-display); font-size: 24px; text-transform: uppercase; margin: 8px 0;">{{ referralHeadline }}</div>
            <div style="display: flex; border: 2px solid #1F3A38;">
              <input value="{{ referralLink }}" readOnly aria-label="Your invite link" style="flex: 1; min-width: 0; border: 0; background: #EFE7D6; font-family: var(--tz-mono); font-size: 12px; padding: 10px 12px; outline: none;">
              <button onClick="{{ copyRef }}" style="border: 0; border-left: 2px solid #1F3A38; background: #820101; font-family: var(--tz-mono); font-size: 11px; padding: 0 14px; cursor: pointer; color: #F7F1E6;">{{ copyLabel }}</button>
            </div>
            <a href="/referral-rewards" style="display: block; text-align: center; margin-top: 10px; font-family: var(--tz-mono); font-size: 11.5px; border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 10px; text-decoration: none;">{{ referralCta }}</a>
          </div>
          <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 22px;">
            <div style="font-family: var(--tz-mono); font-size: 11px; color: #820101; letter-spacing: 0.08em;">[Pointi — wallet]</div>
            <div style="display: flex; align-items: baseline; gap: 10px; margin-top: 8px;">
              <span style="font-family: var(--tz-display); font-size: 40px;">{{ walletPoints }}</span>
              <span style="font-family: var(--tz-mono); font-size: 12px; color: #6E6155;">PTS · {{ walletValue }}</span>
            </div>
            <a href="/points-wallet" style="display: block; text-align: center; margin-top: 12px; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 10px; text-decoration: none;">OPEN WALLET →</a>
          </div>
          <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 22px;">
            <div style="font-family: var(--tz-mono); font-size: 11px; color: #820101; letter-spacing: 0.08em;">[Arifa — notifications]</div>
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
        </aside>
      </div>
    </sc-if>

    <!-- TAB: my posts -->
    <sc-if value="{{ showPosts }}" hint-placeholder-val="{{ false }}">
      <div style="max-width: 960px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 10px; margin-bottom: 6px;">
          <h2 style="font-family: var(--tz-display); font-size: 28px; text-transform: uppercase; margin: 0;">Your posts<span style="color: #820101;">.</span></h2>
          <a href="/create-event" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; color: #14201F; text-decoration: none; padding: 9px 14px;">+ NEW POST</a>
        </div>
        <p style="font-size: 13.5px; color: #6E6155; line-height: 1.55; margin: 0 0 20px; max-width: 720px;">Every post you publish lives here <strong>and</strong> on the public boards: events appear in the <a href="/" style="color: #820101;">events page</a>, needs on the needs board — and matched vendors in that city are notified instantly. Each post moves through a pipeline: <span style="font-family: var(--tz-mono); font-size: 11.5px;">DRAFT → LIVE → OFFERS → ACCEPTED → DONE</span>.</p>
        <sc-if value="{{ noPosts }}">
          <div style="border: 2px dashed #1F3A38; background: #FFFDF8; padding: 24px; font-size: 14px; color: #6E6155; line-height: 1.55;">You haven't posted anything yet. Post an event, or post a need — tents, a DJ, a caterer — and vendors nearby send you offers.</div>
        </sc-if>
        <div style="display: grid; gap: 14px;">
          <sc-for list="{{ myPosts }}" as="p" hint-placeholder-count="3">
            <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 18px 20px;">
              <div style="display: flex; justify-content: space-between; gap: 14px; align-items: start; flex-wrap: wrap;">
                <div style="min-width: 0;">
                  <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                    <span style="font-family: var(--tz-mono); font-size: 10px; border: 1px solid #1F3A38; padding: 3px 7px;">{{ p.kind }}</span>
                    <sc-if value="{{ p.href }}"><a href="{{ p.href }}" style="font-family: var(--tz-display); font-size: 18px; text-transform: uppercase; color: #14201F; text-decoration: none;">{{ p.title }}</a></sc-if><sc-if value="{{ p.noHref }}"><span style="font-family: var(--tz-display); font-size: 18px; text-transform: uppercase;">{{ p.title }}</span></sc-if>
                  </div>
                  <div style="font-family: var(--tz-mono); font-size: 11.5px; color: #6E6155; margin-top: 5px;">{{ p.meta }}</div>
                </div>
                <span style="font-family: var(--tz-mono); font-size: 10.5px; background: {{ p.stageBg }}; color: {{ p.stageFg }}; border: 2px solid #1F3A38; padding: 5px 10px; white-space: nowrap;">{{ p.stage }}</span>
              </div>
              <!-- Pipeline -->
              <div style="display: flex; gap: 4px; margin-top: 14px;">
                <sc-for list="{{ p.pipeline }}" as="st" hint-placeholder-count="5">
                  <div style="flex: 1; text-align: center;">
                    <div style="height: 8px; background: {{ st.bg }}; border: 1px solid #1F3A38;"></div>
                    <div style="font-family: var(--tz-mono); font-size: 9px; color: {{ st.fg }}; margin-top: 4px;">{{ st.label }}</div>
                  </div>
                </sc-for>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: 12px; flex-wrap: wrap;">
                <span style="font-family: var(--tz-mono); font-size: 11px; color: #820101;">{{ p.stats }}</span>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                  <sc-if value="{{ p.editable }}">
                    <a href="{{ p.editHref }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 2px solid #1F3A38; background: #F7F1E6; color: #14201F; padding: 7px 11px; text-decoration: none;">EDIT</a>
                  </sc-if>
                  <sc-if value="{{ p.pausable }}">
                    <button onClick="{{ p.pause }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 2px solid #1F3A38; background: {{ p.pauseBg }}; color: {{ p.pauseFg }}; padding: 7px 11px; cursor: pointer;">{{ p.pauseLabel }}</button>
                  </sc-if>
                  <sc-if value="{{ p.canPublish }}">
                    <button onClick="{{ p.publish }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 2px solid #1F3A38; background: #820101; padding: 7px 11px; cursor: pointer; color: #F7F1E6;">PUBLISH</button>
                  </sc-if>
                  <sc-if value="{{ p.shareable }}">
                    <button onClick="{{ p.share }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 7px 11px; cursor: pointer;">{{ p.shareLabel }}</button>
                  </sc-if>
                  <sc-if value="{{ p.hasOffers }}" hint-placeholder-val="{{ false }}">
                    <a href="{{ p.offersHref }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 2px solid #1F3A38; background: #820101; color: #F7F1E6; padding: 7px 11px; text-decoration: none;">VIEW OFFERS ({{ p.offers }})</a>
                  </sc-if>
                  <sc-if value="{{ p.hasAnalytics }}">
                    <a href="{{ p.analyticsHref }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 7px 11px; text-decoration: none;">ANALYTICS</a>
                  </sc-if>
                  <sc-if value="{{ p.closable }}">
                    <button onClick="{{ p.close }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 2px solid #B8463A; color: #B8463A; background: none; padding: 7px 11px; cursor: pointer;">{{ p.closeLabel }}</button>
                  </sc-if>
                </div>
              </div>
            </div>
          </sc-for>
        </div>
      </div>
    </sc-if>

    <!-- TAB: saved -->
    <sc-if value="{{ showSaved }}" hint-placeholder-val="{{ false }}">
      <sc-if value="{{ noSaved }}">
        <div style="border: 2px dashed #1F3A38; background: #FFFDF8; padding: 24px; font-size: 14px; color: #6E6155; max-width: 640px; line-height: 1.55;">Nothing saved yet. Tap ♡ on any event to keep it here for later.</div>
      </sc-if>
      <div class="tw-4col" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
        <sc-for list="{{ saved }}" as="ev" hint-placeholder-count="4">
          <a href="{{ ev.href }}" style="text-decoration: none; color: #14201F; background: #FFFDF8; border: 2px solid #1F3A38; display: block;" style-hover="transform: translate(-3px,-3px); box-shadow: 5px 5px 0 #820101;">
            <img src="{{ ev.img }}" alt="{{ ev.title }}" style="width: 100%; aspect-ratio: 4/3; object-fit: cover; display: block; border-bottom: 2px solid #1F3A38;">
            <div style="padding: 12px 14px;">
              <div style="font-family: var(--tz-mono); font-size: 11px; color: #820101;">{{ ev.date }}</div>
              <div style="font-family: var(--tz-display); font-size: 17px; text-transform: uppercase; margin-top: 3px;">{{ ev.title }}</div>
              <div style="font-size: 12.5px; color: #6E6155;">{{ ev.city }} · {{ ev.action }}</div>
            </div>
          </a>
        </sc-for>
      </div>
    </sc-if>

    <!-- TAB: calendar -->
    <sc-if value="{{ showCalendar }}" hint-placeholder-val="{{ false }}">
      <div style="max-width: 900px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <button onClick="{{ prevMonth }}" style="border: 2px solid #1F3A38; background: #FFFDF8; font-family: var(--tz-mono); font-size: 14px; padding: 8px 14px; cursor: pointer;">←</button>
            <h2 style="font-family: var(--tz-display); font-size: 28px; text-transform: uppercase; margin: 0; min-width: 250px; text-align: center;">{{ monthName }}<span style="color: #820101;">.</span></h2>
            <button onClick="{{ nextMonth }}" style="border: 2px solid #1F3A38; background: #FFFDF8; font-family: var(--tz-mono); font-size: 14px; padding: 8px 14px; cursor: pointer;">→</button>
          </div>
          <span style="font-family: var(--tz-mono); font-size: 12px; color: #6E6155;">{{ calendarNote }}</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); border: 2px solid #1F3A38; border-bottom: 0; background: #1F3A38; color: #F7F1E6; font-family: var(--tz-mono); font-size: 10.5px; text-align: center;">
          <span style="padding: 7px 0;">MON</span><span style="padding: 7px 0;">TUE</span><span style="padding: 7px 0;">WED</span><span style="padding: 7px 0;">THU</span><span style="padding: 7px 0;">FRI</span><span style="padding: 7px 0;">SAT</span><span style="padding: 7px 0;">SUN</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; border: 2px solid #1F3A38; background: #1F3A38;">
          <sc-for list="{{ monthDays }}" as="d" hint-placeholder-count="28">
            <button onClick="{{ d.pick }}" aria-label="{{ d.aria }}" style="background: {{ d.bg }}; color: {{ d.fg }}; min-height: 76px; padding: 8px 10px; border: 0; cursor: pointer; text-align: left; font-family: var(--tz-sans); outline: {{ d.outline }};">
              <div style="font-family: var(--tz-mono); font-size: 11px;">{{ d.num }}</div>
              <sc-if value="{{ d.label }}" hint-placeholder-val="{{ false }}">
                <div style="font-size: 10.5px; font-weight: 700; line-height: 1.3; margin-top: 6px;">{{ d.label }}</div>
              </sc-if>
            </button>
          </sc-for>
        </div>
        <sc-if value="{{ selectedEvent }}" hint-placeholder-val="{{ false }}">
          <div style="margin-top: 14px; border: 2px solid #1F3A38; background: #FFFDF8; box-shadow: 5px 5px 0 #820101; padding: 18px 22px; display: flex; justify-content: space-between; align-items: center; gap: 14px; flex-wrap: wrap;">
            <div>
              <div style="font-family: var(--tz-mono); font-size: 11px; color: #820101;">{{ selDate }}</div>
              <div style="font-family: var(--tz-display); font-size: 20px; text-transform: uppercase; margin-top: 3px;">{{ selTitle }}</div>
              <div style="font-size: 13px; color: #6E6155; margin-top: 2px;">{{ selMeta }}</div>
            </div>
            <div style="display: flex; gap: 8px;">
              <a href="{{ selHref }}" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #820101; color: #F7F1E6; padding: 10px 16px; text-decoration: none;">OPEN →</a>
              <button onClick="{{ clearSel }}" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 10px 14px; cursor: pointer;">✕</button>
            </div>
          </div>
        </sc-if>
        <div style="display: flex; gap: 18px; margin-top: 12px; font-family: var(--tz-mono); font-size: 11.5px; color: #6E6155; flex-wrap: wrap;">
          <span><span style="display: inline-block; width: 10px; height: 10px; background: #820101; border: 1px solid #1F3A38; color: #F7F1E6;"></span> RSVP'd / booked</span>
          <span><span style="display: inline-block; width: 10px; height: 10px; background: #1F3A38;"></span> Your posts & deadlines</span>
          <span>Tap a marked day for details · reminders follow each RSVP's own plan</span>
        </div>
      </div>
    </sc-if>
  </div>


  <!-- Footer strip -->
  <footer style="border-top: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 20px 24px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; font-family: var(--tz-mono); font-size: 12px;">
    <span>TWENDEZETU · MY TWENDE</span>
    <a href="/" style="color: #E9B4AC;">← BACK TO EVENTS</a>
  </footer>
</div>
`;

export default template;
