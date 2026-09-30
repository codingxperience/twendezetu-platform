// Markup for the home page: events first, vendors second. Sections come from
// the page logic as one ordered list, so the signed-in tabs can reorder them.
// Bindings are resolved by src/design/render.js.

import { SITE_FOOTER, SITE_HEADER, SITE_RAIL, SITE_TABBAR, eventCard, liveCard, sectionHead, svg, vendorCard } from './shell';

const template = `
<div class="tz-page">
  ${SITE_HEADER}
  <div class="tz-layout">
    ${SITE_RAIL}
    <main class="tz-main">

      <sc-if value="{{ signedOut }}">
        <section class="tz-hero">
          <div class="tz-hero__words">
            <div class="tz-kicker">{{ hero.kicker }}</div>
            <h1>{{ hero.a }}<br>{{ hero.b }} <span class="tz-words"><sc-for list="{{ hero.words }}" as="w"><span style="animation-delay: {{ w.delay }};">{{ w.word }}</span></sc-for></span></h1>
            <p>{{ hero.sub }}</p>
            <div class="tz-hero__chips"><sc-for list="{{ hero.chips }}" as="c"><a href="{{ c.href }}" class="tz-outline-pill">{{ c.label }}</a></sc-for></div>
          </div>
          <div class="tz-hero__act">
            <a href="/sign-in?mode=register" class="tz-hero__cta"><span>{{ hero.cta }}</span>${svg('arrow', 22)}</a>
            <a href="/create-event" class="tz-hero__alt">{{ hero.alt }}</a>
          </div>
        </section>
      </sc-if>

      <sc-if value="{{ signedIn }}">
        <div class="tz-hello">
          <span class="tz-hello__mark"><img src="/brand/mark.png" alt="" width="179" height="209"></span>
          <h1>{{ greeting }}</h1>
        </div>
        <div class="tz-tabs" role="group" aria-label="Show">
          <sc-for list="{{ tabs }}" as="t"><button type="button" aria-pressed="{{ t.pressed }}" onClick="{{ t.pick }}">{{ t.label }}</button></sc-for>
        </div>
      </sc-if>

      <sc-for list="{{ sections }}" as="s">
        <section class="tz-shelf" id="{{ s.key }}" aria-label="{{ s.title }}">
          ${sectionHead('s')}

          <sc-if value="{{ s.isLive }}">
            <div class="tz-row tz-row--wide" id="{{ s.scrollId }}">
              <sc-for list="{{ s.live }}" as="e">${liveCard('e')}</sc-for>
            </div>
          </sc-if>

          <sc-if value="{{ s.isEvents }}">
            <div class="tz-row" id="{{ s.scrollId }}">
              <sc-for list="{{ s.events }}" as="e">${eventCard('e')}</sc-for>
            </div>
          </sc-if>

          <sc-if value="{{ s.isVendors }}">
            <div class="tz-row" id="{{ s.scrollId }}">
              <sc-for list="{{ s.vendors }}" as="v">${vendorCard('v')}</sc-for>
            </div>
          </sc-if>

          <sc-if value="{{ s.isFollow }}">
            <div class="tz-follow">
              <sc-for list="{{ s.organizers }}" as="o">
                <div class="tz-follow__item">
                  <a href="{{ o.href }}" class="tz-follow__face" style="background: {{ o.bg }}; color: {{ o.fg }};" aria-hidden="true" tabindex="-1">{{ o.initials }}</a>
                  <div class="tz-follow__text">
                    <a href="{{ o.href }}" class="tz-follow__name"><span>{{ o.name }}</span><sc-if value="{{ o.verified }}"><svg class="tz-tick" width="14" height="14" viewBox="0 0 24 24" aria-label="Verified" role="img"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="m7.5 12.5 3 3 6-6.5" fill="none" stroke="#F7F1E6" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></sc-if></a>
                    <div class="tz-follow__sub">{{ o.followersLabel }}</div>
                    <div class="tz-follow__up">{{ o.upcomingLabel }}</div>
                  </div>
                  <button type="button" class="tz-follow__btn" aria-pressed="{{ o.pressed }}" onClick="{{ o.toggle }}">{{ o.buttonLabel }}</button>
                </div>
              </sc-for>
            </div>
          </sc-if>

          <sc-if value="{{ s.isFaces }}">
            <div class="tz-faces">
              <sc-for list="{{ s.faces }}" as="f">
                <a href="{{ f.href }}" class="tz-face">
                  <span class="tz-face__img" style="background: {{ f.bg }}; color: {{ f.fg }};"><sc-if value="{{ f.img }}"><img src="{{ f.img }}" alt="" loading="lazy"></sc-if><sc-if value="{{ f.noImg }}">{{ f.initials }}</sc-if></span>
                  <span class="tz-face__name">{{ f.name }}</span>
                </a>
              </sc-for>
            </div>
          </sc-if>

          <sc-if value="{{ s.isList }}">
            <div class="tz-list">
              <sc-for list="{{ s.items }}" as="i">
                <a href="{{ i.href }}" class="tz-list__item">
                  <sc-if value="{{ i.img }}"><img src="{{ i.img }}" alt="" loading="lazy"></sc-if>
                  <sc-if value="{{ i.badge }}"><span class="tz-list__count">{{ i.badge }}</span></sc-if>
                  <div style="min-width: 0;">
                    <div class="tz-list__by"><span class="tz-list__status" data-live="{{ i.live }}">{{ i.status }}</span><span>{{ i.when }}</span></div>
                    <div class="tz-list__title">{{ i.title }}</div>
                  </div>
                </a>
              </sc-for>
            </div>
          </sc-if>

          <sc-if value="{{ s.isEmpty }}">
            <div class="tz-empty">{{ s.emptyText }} <a href="{{ s.emptyHref }}">{{ s.emptyLink }}</a></div>
          </sc-if>
        </section>
      </sc-for>

    </main>
  </div>
  ${SITE_FOOTER}

  <sc-if value="{{ nextUp }}">
    <div class="tz-nextbar" role="region" aria-label="{{ nextUp.label }}">
      <sc-if value="{{ nextUp.hasTicket }}"><button type="button" class="tz-nextbar__qr" aria-label="{{ nextUp.qrLabel }}" title="{{ nextUp.qrLabel }}" onClick="{{ nextUp.openTicket }}">${svg('qr', 20)}</button></sc-if>
      <a href="{{ nextUp.href }}" class="tz-nextbar__img"><img src="{{ nextUp.img }}" alt=""></a>
      <div class="tz-nextbar__text">
        <div class="tz-nextbar__label">{{ nextUp.label }}</div>
        <a href="{{ nextUp.href }}" class="tz-nextbar__title">{{ nextUp.title }}</a>
        <div class="tz-nextbar__sub">{{ nextUp.sub }}</div>
      </div>
      <sc-if value="{{ nextUp.liveLabel }}"><span class="tz-nextbar__live tz-hide-sm"><span class="tz-pulse"></span>{{ nextUp.liveLabel }}</span></sc-if>
      <div class="tz-nextbar__acts tz-hide-sm">
        <a href="{{ nextUp.mapsHref }}" target="_blank" rel="noopener" aria-label="{{ nextUp.mapsLabel }}" title="{{ nextUp.mapsLabel }}">${svg('pin', 21)}</a>
        <a href="{{ nextUp.calendarHref }}" aria-label="{{ nextUp.calendarLabel }}" title="{{ nextUp.calendarLabel }}">${svg('calendar', 21)}</a>
        <button type="button" aria-label="{{ nextUp.shareLabel }}" title="{{ nextUp.shareLabel }}" onClick="{{ nextUp.share }}">${svg('share', 21)}</button>
      </div>
      <a href="/my-twende?tab=upcoming" class="tz-nextbar__mine" aria-label="{{ nextUp.myEventsLabel }}" title="{{ nextUp.myEventsLabel }}">${svg('list', 22)}</a>
    </div>
  </sc-if>

  <sc-if value="{{ ticketOpen }}">
    <div class="tz-sheet">
      <button type="button" class="tz-sheet__backdrop" aria-label="{{ ticket.closeLabel }}" onClick="{{ closeTicket }}"></button>
      <div class="tz-sheet__card" role="dialog" aria-modal="true" aria-label="{{ ticket.code }}">
        <div class="tz-kicker">{{ ticket.code }}</div>
        <div class="tz-sheet__title">{{ ticket.title }}</div>
        <div class="tz-sheet__meta">{{ ticket.when }}<br>{{ ticket.where }}</div>
        <img src="{{ ticket.qrSrc }}" alt="Ticket QR code" width="220" height="220" class="tz-sheet__qr">
        <div class="tz-sheet__acts">
          <a href="{{ ticket.qrSrc }}" download="{{ ticket.downloadName }}" class="tz-button tz-button--dark">{{ ticket.downloadLabel }}</a>
          <button type="button" class="tz-button tz-button--outline" onClick="{{ closeTicket }}">{{ ticket.closeLabel }}</button>
        </div>
      </div>
    </div>
  </sc-if>

  ${SITE_TABBAR}
</div>
`;

export default template;
