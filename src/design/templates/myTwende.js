// Markup for My Twende, inside the shared frame (header, rail, phone tab
// bar). Five tabs: Upcoming, Notifications, My posts, Saved and Calendar.
// Bindings are resolved by src/design/render.js; dialogs and toasts come
// from src/design/DesignView.jsx.

import { SITE_FOOTER, SITE_HEADER, SITE_RAIL, SITE_TABBAR, svg } from './shell';

const dateBox = (v) => `<div class="tz-datebox"><span>{{ ${v}.dow }}</span><strong>{{ ${v}.day }}</strong><span>{{ ${v}.mon }}</span></div>`;

const template = `
<div class="tz-page">
  ${SITE_HEADER}
  <div class="tz-layout">
    ${SITE_RAIL}
    <main class="tz-main">

      <div class="tz-kicker">{{ t.kicker }}</div>
      <h1 class="tz-my__title">My Twende</h1>
      <p class="tz-my__sub">{{ t.sub }}</p>

      <div class="tz-tabs tz-my__tabs" role="group" aria-label="{{ t.show }}">
        <sc-for list="{{ tabs }}" as="tb"><button type="button" aria-pressed="{{ tb.pressed }}" onClick="{{ tb.go }}"><span>{{ tb.label }}</span><sc-if value="{{ tb.count }}"><span class="tz-count">{{ tb.count }}</span></sc-if></button></sc-for>
      </div>

      <!-- UPCOMING -->
      <sc-if value="{{ isUpcoming }}">
        <div class="tz-my__cols">
          <div class="tz-my__stack">
            <sc-for list="{{ upcoming }}" as="ev">
              <article class="tz-card">
                <div class="tz-trow">
                  <a href="{{ ev.href }}" class="tz-trow__img"><img src="{{ ev.img }}" alt="" loading="lazy"></a>
                  <div class="tz-trow__body">
                    <div class="tz-trow__head">
                      ${dateBox('ev')}
                      <div class="tz-trow__text">
                        <a href="{{ ev.href }}" class="tz-trow__title">{{ ev.title }}</a>
                        <div class="tz-trow__meta">{{ ev.when }} · {{ ev.place }}</div>
                        <div class="tz-trow__meta">{{ ev.by }}</div>
                      </div>
                      <span class="tz-status" style="background: {{ ev.statusBg }}; color: {{ ev.statusFg }};">{{ ev.statusLabel }}</span>
                    </div>
                    <div class="tz-acts">
                      <sc-if value="{{ ev.hasTickets }}"><button type="button" class="tz-btn tz-btn--maroon" onClick="{{ ev.openTicket }}">${svg('qr', 16)}{{ ev.qrLabel }}</button></sc-if>
                      <sc-if value="{{ ev.noTickets }}"><a href="{{ ev.ticketsHref }}" class="tz-btn tz-btn--maroon">{{ ev.getLabel }}</a></sc-if>
                      <button type="button" class="tz-btn" aria-pressed="{{ ev.calPressed }}" onClick="{{ ev.toggleCal }}">${svg('calendar', 16)}{{ ev.calLabel }}</button>
                      <button type="button" class="tz-btn" aria-expanded="{{ ev.referOpen }}" onClick="{{ ev.toggleRefer }}">${svg('share', 16)}{{ t.invite }}</button>
                    </div>
                    <sc-if value="{{ ev.referOpen }}">
                      <div class="tz-refer">
                        <div class="tz-kicker">{{ t.referNote }}</div>
                        <div class="tz-copyrow">
                          <input value="{{ ev.link }}" readonly aria-label="{{ t.referLink }}">
                          <button type="button" class="tz-btn tz-btn--forest" onClick="{{ ev.copy }}">{{ ev.copyLabel }}</button>
                        </div>
                        <div class="tz-chips">
                          <a href="{{ ev.waHref }}" target="_blank" rel="noopener" class="tz-chip">WhatsApp</a>
                          <a href="{{ ev.fbHref }}" target="_blank" rel="noopener" class="tz-chip">Facebook</a>
                          <a href="{{ ev.emHref }}" class="tz-chip">Email</a>
                        </div>
                      </div>
                    </sc-if>
                    <div class="tz-trow__foot">
                      <span class="tz-trow__rem">{{ t.reminders }} <strong>{{ ev.reminders }}</strong><button type="button" class="tz-linkbtn" onClick="{{ ev.toggleEdit }}">{{ ev.editLabel }}</button></span>
                      <a href="{{ ev.disputeHref }}" class="tz-trow__dispute">{{ t.dispute }}</a>
                    </div>
                    <sc-if value="{{ ev.editOpen }}">
                      <div class="tz-chips" role="group" aria-label="{{ t.reminders }}">
                        <sc-for list="{{ ev.reminderOpts }}" as="ro"><button type="button" class="tz-chip" aria-pressed="{{ ro.pressed }}" onClick="{{ ro.pick }}">{{ ro.label }}</button></sc-for>
                      </div>
                    </sc-if>
                  </div>
                </div>
              </article>
            </sc-for>

            <sc-for list="{{ waitlist }}" as="wl">
              <article class="tz-card tz-card--pad">
                <div class="tz-kicker">{{ t.waitlist }} · {{ wl.status }}</div>
                <div class="tz-card__title">{{ wl.title }}</div>
                <div class="tz-trow__meta">{{ wl.since }}</div>
                <p class="tz-card__note">{{ wl.note }}</p>
                <div class="tz-acts">
                  <a href="{{ wl.checkoutHref }}" class="{{ wl.ctaClass }}">{{ wl.ctaLabel }}</a>
                  <button type="button" class="tz-linkbtn" onClick="{{ wl.leave }}">{{ t.leaveWaitlist }}</button>
                </div>
              </article>
            </sc-for>

            <sc-if value="{{ noUpcoming }}">
              <div class="tz-empty">{{ t.noUpcoming }} <a href="/events">{{ t.browseEvents }}</a></div>
            </sc-if>
          </div>

          <aside class="tz-my__stack">
            <div class="tz-card tz-card--pad">
              <div class="tz-kicker">{{ t.wallet }}</div>
              <div class="tz-wallet"><span class="tz-wallet__pts">{{ walletPoints }}</span><span class="tz-trow__meta">{{ walletValue }}</span></div>
              <a href="/points-wallet" class="tz-btn tz-btn--forest tz-btn--wide">{{ t.openWallet }}</a>
            </div>
            <div class="tz-card tz-card--pad">
              <div class="tz-kicker">{{ t.inviteFriends }}</div>
              <div class="tz-card__title">{{ referralHeadline }}</div>
              <div class="tz-trow__meta">{{ referralRule }}</div>
              <div class="tz-copyrow">
                <input value="{{ referralLink }}" readonly aria-label="{{ t.inviteLink }}">
                <button type="button" class="tz-btn tz-btn--maroon" onClick="{{ copyRef }}">{{ copyRefLabel }}</button>
              </div>
              <a href="/referral-rewards" class="tz-underlink">{{ referralCta }}</a>
            </div>
          </aside>
        </div>
      </sc-if>

      <!-- NOTIFICATIONS -->
      <sc-if value="{{ isNotifications }}">
        <div class="tz-my__narrow">
          <div class="tz-my__bar">
            <button type="button" class="tz-btn" onClick="{{ markAllRead }}">{{ t.markAll }}</button>
            <span class="tz-trow__meta">{{ unreadNote }}</span>
          </div>
          <div class="tz-card tz-notes">
            <sc-for list="{{ notices }}" as="n">
              <a href="{{ n.href }}" class="tz-note" data-unread="{{ n.unread }}" onClick="{{ n.open }}">
                <span class="tz-note__dot"></span>
                <span class="tz-note__icon" style="background: {{ n.bg }};">{{ n.icon }}</span>
                <span class="tz-note__text"><span class="tz-note__title">{{ n.title }}</span><sc-if value="{{ n.detail }}"><span class="tz-note__detail">{{ n.detail }}</span></sc-if><span class="tz-note__time">{{ n.time }}</span></span>
              </a>
            </sc-for>
            <sc-if value="{{ noNotices }}"><div class="tz-note tz-note--empty">{{ t.noNotices }}</div></sc-if>
          </div>
          <div class="tz-card tz-card--pad tz-prefs">
            <div class="tz-kicker">{{ t.emailAlerts }}</div>
            <sc-for list="{{ prefs }}" as="pf">
              <div class="tz-pref"><span>{{ pf.label }}</span><button type="button" class="tz-switch" role="switch" aria-checked="{{ pf.checked }}" aria-label="{{ pf.label }}" onClick="{{ pf.toggle }}"><span></span></button></div>
            </sc-for>
            <a href="/settings?tab=notifications" class="tz-underlink">{{ t.allSettings }}</a>
          </div>
        </div>
      </sc-if>

      <!-- MY POSTS -->
      <sc-if value="{{ isPosts }}">
        <div class="tz-my__wide">
          <div class="tz-my__bar">
            <p class="tz-my__intro">{{ t.postsIntro }}</p>
            <a href="/create-event" class="tz-btn">${svg('plus', 15)}{{ t.newPost }}</a>
          </div>
          <div class="tz-my__stack">
            <sc-for list="{{ posts }}" as="p">
              <article class="tz-card tz-card--pad">
                <div class="tz-post__head">
                  <div style="min-width: 0;">
                    <div class="tz-post__line"><span class="tz-kind">{{ p.kindLabel }}</span><sc-if value="{{ p.href }}"><a href="{{ p.href }}" class="tz-card__title">{{ p.title }}</a></sc-if><sc-if value="{{ p.noHref }}"><span class="tz-card__title">{{ p.title }}</span></sc-if></div>
                    <div class="tz-trow__meta">{{ p.meta }}</div>
                  </div>
                  <span class="tz-status" style="background: {{ p.stageBg }}; color: {{ p.stageFg }};">{{ p.stageLabel }}</span>
                </div>
                <div class="tz-pipe">
                  <sc-for list="{{ p.pipeline }}" as="st"><div><div class="tz-pipe__bar" style="background: {{ st.bg }};"></div><div class="tz-pipe__label" style="color: {{ st.fg }};">{{ st.label }}</div></div></sc-for>
                </div>
                <div class="tz-post__foot">
                  <span class="tz-trow__meta">{{ p.stats }}</span>
                  <div class="tz-acts">
                    <sc-if value="{{ p.hasOffers }}"><button type="button" class="tz-btn tz-btn--maroon tz-btn--sm" aria-expanded="{{ p.offersOpen }}" onClick="{{ p.toggleOffers }}">{{ p.offersLabel }}</button></sc-if>
                    <sc-if value="{{ p.canPublish }}"><button type="button" class="tz-btn tz-btn--maroon tz-btn--sm" onClick="{{ p.publish }}">{{ t.publish }}</button></sc-if>
                    <sc-if value="{{ p.hasAnalytics }}"><a href="{{ p.analyticsHref }}" class="tz-btn tz-btn--forest tz-btn--sm">{{ t.analytics }}</a></sc-if>
                    <sc-if value="{{ p.editable }}"><a href="{{ p.editHref }}" class="tz-btn tz-btn--sm">{{ t.edit }}</a></sc-if>
                    <sc-if value="{{ p.pausable }}"><button type="button" class="tz-btn tz-btn--sm" aria-pressed="{{ p.pausedPressed }}" onClick="{{ p.pause }}">{{ p.pauseLabel }}</button></sc-if>
                    <sc-if value="{{ p.shareable }}"><button type="button" class="tz-btn tz-btn--sm" onClick="{{ p.share }}">{{ p.shareLabel }}</button></sc-if>
                    <sc-if value="{{ p.closable }}"><button type="button" class="tz-linkbtn" onClick="{{ p.close }}">{{ p.closeLabel }}</button></sc-if>
                  </div>
                </div>
                <sc-if value="{{ p.offersOpen }}">
                  <div class="tz-offers">
                    <sc-for list="{{ p.offerList }}" as="of">
                      <div class="tz-offer" style="opacity: {{ of.opacity }};">
                        <div class="tz-offer__row">
                          <div class="tz-offer__text">
                            <div class="tz-offer__name"><a href="{{ of.providerHref }}">{{ of.name }}</a> <span>· ★ {{ of.rating }} · {{ of.jobsLabel }}</span></div>
                            <div class="tz-offer__note">{{ of.note }}</div>
                          </div>
                          <span class="tz-offer__price">{{ of.price }}</span>
                          <div class="tz-acts">
                            <sc-if value="{{ of.needsPayment }}"><button type="button" class="tz-btn tz-btn--maroon tz-btn--sm" onClick="{{ of.pay }}">{{ t.payEscrow }}</button></sc-if>
                            <sc-if value="{{ of.canAccept }}"><button type="button" class="tz-btn tz-btn--maroon tz-btn--sm" onClick="{{ of.accept }}">{{ t.accept }}</button></sc-if>
                            <sc-if value="{{ of.accepted }}"><span class="tz-status" style="background: #1F3A38; color: #F7F1E6;">{{ t.accepted }}</span></sc-if>
                            <a href="{{ of.threadHref }}" class="tz-btn tz-btn--sm">{{ t.chat }}</a>
                          </div>
                        </div>
                        <sc-if value="{{ of.bookingNote }}"><div class="tz-offer__booking">{{ of.bookingNote }}</div></sc-if>
                      </div>
                    </sc-for>
                    <a href="{{ p.offersHref }}" class="tz-underlink">{{ p.allOffersLabel }}</a>
                  </div>
                </sc-if>
              </article>
            </sc-for>
            <sc-if value="{{ noPosts }}">
              <div class="tz-empty">{{ t.noPosts }} <a href="/create-event">{{ t.postFirst }}</a></div>
            </sc-if>
          </div>
        </div>
      </sc-if>

      <!-- SAVED -->
      <sc-if value="{{ isSaved }}">
        <div class="tz-grid">
          <sc-for list="{{ saved }}" as="ev">
            <div class="tz-ecard">
              <div class="tz-ecard__art">
                <a href="{{ ev.href }}" class="tz-ecard__img" tabindex="-1" aria-hidden="true"><img src="{{ ev.img }}" alt="" loading="lazy"></a>
                <span class="tz-ecard__price">{{ ev.price }}</span>
                <button type="button" class="tz-round tz-unsave" aria-label="{{ t.unsave }}" aria-pressed="true" onClick="{{ ev.unsave }}">${svg('heart', 16)}</button>
              </div>
              <div class="tz-ecard__body">
                ${dateBox('ev')}
                <div class="tz-ecard__text">
                  <a href="{{ ev.href }}" class="tz-ecard__title">{{ ev.title }}</a>
                  <div class="tz-ecard__by"><span>{{ ev.city }}</span></div>
                </div>
              </div>
            </div>
          </sc-for>
        </div>
        <sc-if value="{{ noSaved }}">
          <div class="tz-empty">{{ t.noSaved }} <a href="/events">{{ t.browseEvents }}</a></div>
        </sc-if>
      </sc-if>

      <!-- CALENDAR -->
      <sc-if value="{{ isCalendar }}">
        <div class="tz-my__cal">
          <div class="tz-my__bar">
            <div class="tz-cal__nav">
              <button type="button" class="tz-cal__arrow" aria-label="{{ t.prevMonth }}" onClick="{{ prevMonth }}">${svg('left', 20)}</button>
              <h2 class="tz-cal__month">{{ monthName }}</h2>
              <button type="button" class="tz-cal__arrow" aria-label="{{ t.nextMonth }}" onClick="{{ nextMonth }}">${svg('right', 20)}</button>
            </div>
            <span class="tz-trow__meta">{{ t.calNote }}</span>
          </div>
          <div class="tz-cal">
            <sc-for list="{{ weekdays }}" as="w"><span class="tz-cal__dow">{{ w }}</span></sc-for>
            <sc-for list="{{ monthDays }}" as="d">
              <button type="button" class="tz-cal__day" style="background: {{ d.bg }}; color: {{ d.fg }}; box-shadow: {{ d.ring }};" aria-label="{{ d.aria }}" onClick="{{ d.pick }}"><span class="tz-cal__num">{{ d.num }}</span><sc-if value="{{ d.label }}"><span class="tz-cal__label">{{ d.label }}</span></sc-if></button>
            </sc-for>
          </div>
          <sc-if value="{{ hasSel }}">
            <div class="tz-card tz-card--pad tz-cal__sel">
              <div>
                <div class="tz-kicker">{{ selDate }}</div>
                <div class="tz-card__title">{{ selTitle }}</div>
                <div class="tz-trow__meta">{{ selMeta }}</div>
              </div>
              <div class="tz-acts">
                <a href="{{ selHref }}" class="tz-btn tz-btn--maroon">{{ t.open }}</a>
                <button type="button" class="tz-btn" onClick="{{ clearSel }}">{{ t.close }}</button>
              </div>
            </div>
          </sc-if>
          <div class="tz-cal__legend">
            <span><i style="background: #820101;"></i>{{ t.legendEvents }}</span>
            <span><i style="background: #1F3A38;"></i>{{ t.legendPosts }}</span>
            <span>{{ t.legendReminders }}</span>
          </div>
        </div>
      </sc-if>

    </main>
  </div>
  ${SITE_FOOTER}

  <sc-if value="{{ ticketOpen }}">
    <div class="tz-sheet">
      <button type="button" class="tz-sheet__backdrop" aria-label="{{ t.close }}" onClick="{{ closeTicket }}"></button>
      <div class="tz-sheet__card" role="dialog" aria-modal="true" aria-label="{{ ticket.code }}">
        <div class="tz-kicker">{{ ticket.code }}</div>
        <div class="tz-sheet__title">{{ ticket.title }}</div>
        <div class="tz-sheet__meta">{{ ticket.when }}<br>{{ ticket.venue }}</div>
        <div class="tz-sheet__head" data-used="{{ ticket.used }}">{{ ticket.heading }} · {{ ticket.holder }}</div>
        <img src="{{ ticket.qrSrc }}" alt="Ticket QR code" width="220" height="220" class="tz-sheet__qr" style="opacity: {{ ticket.opacity }};">
        <sc-if value="{{ ticket.many }}">
          <div class="tz-sheet__pager">
            <button type="button" class="tz-cal__arrow" aria-label="{{ t.prevTicket }}" onClick="{{ ticket.prev }}">${svg('left', 16)}</button>
            <span>{{ ticket.pos }}</span>
            <button type="button" class="tz-cal__arrow" aria-label="{{ t.nextTicket }}" onClick="{{ ticket.next }}">${svg('right', 16)}</button>
          </div>
        </sc-if>
        <div class="tz-sheet__meta">{{ t.scanOnce }}</div>
        <div class="tz-sheet__acts">
          <a href="{{ ticket.qrSrc }}" download="{{ ticket.downloadName }}" class="tz-button tz-button--dark">{{ t.downloadQr }}</a>
          <button type="button" class="tz-button tz-button--outline" onClick="{{ closeTicket }}">{{ t.close }}</button>
        </div>
      </div>
    </div>
  </sc-if>

  ${SITE_TABBAR}
</div>
`;

export default template;
