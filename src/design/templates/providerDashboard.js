// Markup for the providerDashboard page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh;">

  <!-- Header: everything wraps on small screens, nothing disappears -->
  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 18px 24px; border-bottom: 2px solid #1F3A38; background: #F7F1E6; position: sticky; top: 0; z-index: 40;">
    <div style="display: flex; align-items: center; gap: 24px; flex-wrap: wrap;">
      <a href="/" style="text-decoration: none; color: #14201F; font-family: var(--tz-display); font-size: 26px; text-transform: uppercase; line-height: 0.9;">TWENDE<br><span style="color: #D97A3B;">ZETU</span></a>
      <span style="font-family: var(--tz-mono); font-size: 12px; background: #1F3A38; color: #F7F1E6; padding: 5px 10px;">PROVIDER PORTAL</span>
    </div>
    <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap; position: relative;">
      <button onClick="{{ toggleBell }}" style="position: relative; background: none; border: 2px solid #1F3A38; padding: 9px 12px; cursor: pointer; font-family: var(--tz-mono); font-size: 13px;">▲<sc-if value="{{ hasUnread }}" hint-placeholder-val="{{ true }}"><span style="position: absolute; top: -7px; right: -7px; background: #D97A3B; border: 2px solid #1F3A38; font-family: var(--tz-mono); font-size: 10px; padding: 1px 5px;">3</span></sc-if></button>
      <button onClick="{{ toggleProfile }}" style="display: flex; align-items: center; gap: 10px; background: none; border: 0; cursor: pointer; padding: 0;">
        <span style="width: 40px; height: 40px; background: #D97A3B; border: 2px solid #1F3A38; font-family: var(--tz-display); font-size: 17px; display: flex; align-items: center; justify-content: center;">SK</span>
      </button>

      <!-- Profile dropdown -->
      <sc-if value="{{ profileOpen }}" hint-placeholder-val="{{ false }}">
        <div style="position: absolute; top: 52px; right: 0; width: 300px; background: #FFFDF8; border: 2px solid #1F3A38; box-shadow: 6px 6px 0 #1F3A38; z-index: 60;">
          <div style="padding: 16px 18px; border-bottom: 2px solid #1F3A38; display: flex; gap: 12px; align-items: center;">
            <div style="width: 44px; height: 44px; background: #D97A3B; border: 2px solid #1F3A38; font-family: var(--tz-display); font-size: 18px; display: flex; align-items: center; justify-content: center;">SK</div>
            <div>
              <div style="font-weight: 700; font-size: 14.5px;">Ssemakula Kato</div>
              <div style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">KATO 4X4 &amp; TOURS · KAMPALA</div>
              <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #4a7c4a; margin-top: 2px;">● MEMBERSHIP ACTIVE · VERIFIED ✓</div>
            </div>
          </div>
          <a href="/settings?role=provider" style="display: block; text-decoration: none; color: #14201F; border-bottom: 1px solid #E3D9C6; padding: 13px 18px; font-size: 14px;">✎ &nbsp;Edit business profile</a>
          <a href="/providers" style="display: block; text-decoration: none; color: #14201F; border-bottom: 1px solid #E3D9C6; padding: 13px 18px; font-size: 14px;">▣ &nbsp;View public listing <span style="font-family: var(--tz-mono); font-size: 10px; color: #6E6155;">— see what customers see</span></a>
          <a href="/provider-verification" style="display: block; text-decoration: none; color: #14201F; border-bottom: 1px solid #E3D9C6; padding: 13px 18px; font-size: 14px;">✓ &nbsp;Verification status <span style="font-family: var(--tz-mono); font-size: 10px; color: #4a7c4a;">— VERIFIED</span></a>
          <a href="/settings?role=provider" style="display: block; text-decoration: none; color: #14201F; border-bottom: 1px solid #E3D9C6; padding: 13px 18px; font-size: 14px;">▲ &nbsp;Notification settings</a>
          <a href="/provider-wallet" style="display: block; text-decoration: none; color: #14201F; border-bottom: 1px solid #E3D9C6; padding: 13px 18px; font-size: 14px;">◍ &nbsp;Business wallet &amp; billing</a>
          <a href="/sign-in" style="display: block; text-decoration: none; color: #B8463A; padding: 13px 18px; font-size: 14px; font-weight: 600;">→ &nbsp;Sign out</a>
        </div>
      </sc-if>

      <!-- Notifications drawer -->
      <sc-if value="{{ bellOpen }}" hint-placeholder-val="{{ false }}">
        <div style="position: absolute; top: 52px; right: 0; width: 360px; background: #FFFDF8; border: 2px solid #1F3A38; box-shadow: 6px 6px 0 #1F3A38; z-index: 60;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; border-bottom: 2px solid #1F3A38;">
            <span style="font-family: var(--tz-display); font-size: 17px; text-transform: uppercase;">Notifications</span>
            <button onClick="{{ toggleBell }}" style="background: none; border: 0; font-family: var(--tz-mono); font-size: 12px; color: #A85A23; cursor: pointer; text-decoration: underline;">CLOSE</button>
          </div>
          <sc-for list="{{ notifications }}" as="n" hint-placeholder-count="3">
            <div style="padding: 14px 18px; border-bottom: 1px solid #E3D9C6; display: grid; grid-template-columns: auto 1fr; gap: 12px;">
              <span style="width: 28px; height: 28px; border: 2px solid #1F3A38; background: #F6DCC0; font-family: var(--tz-mono); font-size: 12px; display: flex; align-items: center; justify-content: center;">{{ n.icon }}</span>
              <div>
                <div style="font-size: 13.5px; line-height: 1.45;">{{ n.body }}</div>
                <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; margin-top: 3px;">{{ n.time }}</div>
              </div>
            </div>
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
    <a href="/providers" style="display: flex; align-items: center; gap: 8px; text-decoration: none; color: #3A2F25; font-family: var(--tz-mono); font-size: 12px; padding: 9px 14px; white-space: nowrap;">
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
    <a href="/settings?role=provider" style="display: flex; align-items: center; gap: 8px; text-decoration: none; color: #3A2F25; font-family: var(--tz-mono); font-size: 12px; padding: 9px 14px; white-space: nowrap;">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="3.2"></circle><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1"></path></svg>
      SETTINGS
    </a>
  </nav>

  <div style="max-width: 1320px; margin: 0 auto; padding: 40px 24px 80px;">
    <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em;">[Dashibodi ya mtoa huduma]</div>
    <h1 style="font-family: var(--tz-display); font-size: clamp(40px, 5.5vw, 72px); text-transform: uppercase; line-height: 0.95; margin: 10px 0 32px;">Karibu, Kato<span style="color: #D97A3B;">.</span> 3 new leads<span style="color: #D97A3B;">.</span></h1>

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
          <span style="font-family: var(--tz-mono); font-size: 12px; color: #6E6155;">matched to: transport · kampala · jinja</span>
        </div>
        <div style="display: grid; gap: 14px;">
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
                  <div style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">{{ ld.offers }} offers so far</div>
                </div>
              </div>
              <div style="display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap;">
                <button onClick="{{ ld.toggleOffer }}" style="font-family: var(--tz-display); font-size: 14px; text-transform: uppercase; background: {{ ld.offerBtnBg }}; color: {{ ld.offerBtnFg }}; border: 2px solid #1F3A38; padding: 10px 20px; cursor: pointer;">{{ ld.offerBtnLabel }}</button>
                <button onClick="{{ ld.toggleAsk }}" style="font-family: var(--tz-mono); font-size: 12px; background: {{ ld.askBtnBg }}; border: 2px solid #1F3A38; padding: 10px 16px; cursor: pointer;">ASK A QUESTION</button>
                <span style="margin-left: auto; font-size: 12px; color: #6E6155; align-self: center;">Poster's contacts masked until acceptance.</span>
              </div>
              <!-- Offer composer -->
              <sc-if value="{{ ld.offerOpen }}" hint-placeholder-val="{{ false }}">
                <div style="margin-top: 14px; border-top: 1px dashed #C9BFB1; padding-top: 14px; display: grid; gap: 10px;">
                  <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; letter-spacing: 0.08em;">[Your formal offer — binding once accepted]</div>
                  <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <input value="{{ ld.offerPrice }}" onChange="{{ ld.setPrice }}" style="flex: 1; min-width: 140px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 12px 14px; font-family: var(--tz-mono); font-size: 13px; outline: none;">
                    <input value="{{ ld.offerNote }}" onChange="{{ ld.setNote }}" placeholder="What's included…" style="flex: 2; min-width: 200px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 12px 14px; font-family: var(--tz-sans); font-size: 13.5px; outline: none;">
                    <button onClick="{{ ld.submitOffer }}" style="font-family: var(--tz-display); font-size: 14px; text-transform: uppercase; background: #D97A3B; color: #1F3A38; border: 2px solid #1F3A38; padding: 10px 20px; cursor: pointer;">Submit →</button>
                  </div>
                </div>
              </sc-if>
              <!-- Question composer -->
              <sc-if value="{{ ld.askOpen }}" hint-placeholder-val="{{ false }}">
                <div style="margin-top: 14px; border-top: 1px dashed #C9BFB1; padding-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
                  <input value="{{ ld.question }}" onChange="{{ ld.setQuestion }}" placeholder="Ask about dates, roads, luggage…" style="flex: 1; min-width: 220px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 12px 14px; font-family: var(--tz-sans); font-size: 13.5px; outline: none;">
                  <button onClick="{{ ld.submitAsk }}" style="font-family: var(--tz-mono); font-size: 12px; background: #1F3A38; color: #F7F1E6; border: 2px solid #1F3A38; padding: 10px 18px; cursor: pointer;">SEND QUESTION →</button>
                </div>
              </sc-if>
              <sc-if value="{{ ld.sent }}" hint-placeholder-val="{{ false }}">
                <div style="margin-top: 12px; border: 1px dashed #4a7c4a; background: #DCE8D9; padding: 10px 14px; font-size: 12.5px; color: #2c4a2c;">{{ ld.sentMsg }} <a href="/messages" style="color: #A85A23;">Track in Messages →</a></div>
              </sc-if>
            </div>
          </sc-for>
        </div>

        <!-- Bookings calendar with month nav -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin: 40px 0 16px; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <button onClick="{{ prevMonth }}" style="border: 2px solid #1F3A38; background: #FFFDF8; font-family: var(--tz-mono); font-size: 14px; padding: 8px 14px; cursor: pointer;">←</button>
            <h2 style="font-family: var(--tz-display); font-size: 28px; text-transform: uppercase; margin: 0; min-width: 240px; text-align: center;">{{ monthName }}<span style="color: #D97A3B;">.</span></h2>
            <button onClick="{{ nextMonth }}" style="border: 2px solid #1F3A38; background: #FFFDF8; font-family: var(--tz-mono); font-size: 14px; padding: 8px 14px; cursor: pointer;">→</button>
          </div>
          <button onClick="{{ syncInfo }}" style="background: none; border: 0; font-family: var(--tz-mono); font-size: 12px; color: #A85A23; cursor: pointer; text-decoration: underline;">SYNCED: KATO@…GMAIL.COM ✓</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); border: 2px solid #1F3A38; border-bottom: 0; background: #1F3A38; color: #F7F1E6; font-family: var(--tz-mono); font-size: 10.5px; text-align: center;">
          <span style="padding: 7px 0;">MON</span><span style="padding: 7px 0;">TUE</span><span style="padding: 7px 0;">WED</span><span style="padding: 7px 0;">THU</span><span style="padding: 7px 0;">FRI</span><span style="padding: 7px 0;">SAT</span><span style="padding: 7px 0;">SUN</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; border: 2px solid #1F3A38; background: #1F3A38;">
          <sc-for list="{{ calendar }}" as="d" hint-placeholder-count="28">
            <button onClick="{{ d.pick }}" style="background: {{ d.bg }}; color: {{ d.fg }}; min-height: 74px; padding: 8px 10px; border: 0; cursor: pointer; text-align: left; font-family: var(--tz-sans);">
              <div style="font-family: var(--tz-mono); font-size: 11px;">{{ d.num }}</div>
              <sc-if value="{{ d.label }}" hint-placeholder-val="{{ false }}">
                <div style="font-size: 10.5px; font-weight: 700; line-height: 1.3; margin-top: 6px;">{{ d.label }}</div>
              </sc-if>
            </button>
          </sc-for>
        </div>
        <div style="font-size: 12.5px; color: #6E6155; margin-top: 10px;">Accepted jobs sync to Google/Apple calendar with reminders. Click a booked day for details.</div>
      </div>

      <!-- Right rail -->
      <aside style="display: grid; gap: 18px;">
        <!-- Membership -->
        <div style="border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 24px;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">[Uanachama — membership]</div>
          <div style="font-family: var(--tz-display); font-size: 26px; text-transform: uppercase; margin: 10px 0 4px;">{{ membershipStatus }}</div>
          <div style="font-size: 13px; color: rgba(247,241,230,0.75); line-height: 1.5;">12-month listing · UGX 20,000 / yr. Profile, gallery and reviews stay live and matchable.</div>
          <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #E8A472; margin-top: 8px; line-height: 1.6;">HOW BILLING WORKS: join free → first charged when you respond to your first lead → renewal auto-charges your default method (MTN MoMo ••7214) with a 14-day reminder first. Change in Settings → Payment methods.</div>
          <div style="height: 8px; background: rgba(247,241,230,0.2); margin: 14px 0;"><div style="height: 100%; width: {{ membershipPct }}; background: #D97A3B; transition: width 300ms ease;"></div></div>
          <button onClick="{{ renew }}" style="width: 100%; font-family: var(--tz-display); font-size: 14px; text-transform: uppercase; background: {{ renewBg }}; color: #1F3A38; border: 0; padding: 12px; cursor: pointer;">{{ renewLabel }}</button>
        </div>

        <!-- Earnings (business ledger — separate from personal wallet) -->
        <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 24px;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; letter-spacing: 0.08em;">[Mapato — business earnings]</div>
          <div style="font-family: var(--tz-display); font-size: 34px; margin: 10px 0 2px;">UGX 2.4M</div>
          <div style="font-size: 12.5px; color: #6E6155;">last 90 days · 5–7% platform fee only on paid bookings</div>
          <div style="display: flex; align-items: flex-end; gap: 6px; height: 64px; margin-top: 16px;">
            <sc-for list="{{ bars }}" as="b" hint-placeholder-count="8">
              <div style="flex: 1; background: {{ b.color }}; height: {{ b.h }};"></div>
            </sc-for>
          </div>
          <div style="display: flex; gap: 8px; margin-top: 14px;">
            <a href="/provider-wallet" style="flex: 1; text-align: center; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 10px; text-decoration: none;">WITHDRAW →</a>
            <a href="/provider-wallet" style="flex: 1; text-align: center; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #F7F1E6; color: #14201F; padding: 10px; text-decoration: none;">FULL LEDGER</a>
          </div>
          <div style="font-size: 11.5px; color: #6E6155; margin-top: 10px; line-height: 1.5;">Business earnings are a separate ledger from your personal points wallet — withdraw to bank/MoMo, or move to points to spend on the platform.</div>
        </div>

        <!-- Notification prefs -->
        <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 24px;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; letter-spacing: 0.08em;">[Arifa — notification controls]</div>
          <div style="display: grid; gap: 12px; margin-top: 14px;">
            <sc-for list="{{ prefs }}" as="p" hint-placeholder-count="4">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                <span style="font-size: 13.5px;">{{ p.label }}</span>
                <button onClick="{{ p.toggle }}" style="width: 50px; height: 26px; border: 2px solid #1F3A38; background: {{ p.bg }}; cursor: pointer; position: relative; padding: 0; flex-shrink: 0;">
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
            <img src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=300&q=80" alt="4x4 vehicle" style="width: 72px; height: 72px; object-fit: cover; border: 2px solid #1F3A38;">
            <div>
              <div style="font-weight: 700; font-size: 14.5px;">Kato 4x4 &amp; Tours</div>
              <div style="font-size: 12.5px; color: #6E6155;">★ 4.9 · 61 jobs · Kampala + up-country</div>
            </div>
          </div>
          <div style="display: flex; gap: 8px; margin-top: 14px;">
            <a href="/providers" style="flex: 1; text-align: center; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #F7F1E6; color: #14201F; padding: 10px; text-decoration: none;">VIEW ↗</a>
            <button onClick="{{ editListing }}" style="flex: 1; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 10px; cursor: pointer;">EDIT</button>
            <button onClick="{{ shareListing }}" style="flex: 1; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 10px; cursor: pointer;">⧉ SHARE</button>
          </div>
        </div>
      </aside>
    </div>
  </div>

</div>
`;

export default template;
