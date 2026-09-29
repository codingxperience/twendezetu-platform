// Markup for the home page: events first, vendors second. Sections come from
// the page logic as one ordered list, so the signed-in tabs can reorder them.
// Bindings are resolved by src/design/render.js.

import { SITE_FOOTER, SITE_HEADER, SITE_RAIL, SITE_TABBAR, eventCard, sectionHead, vendorTile } from './shell';

const template = `
<div class="tz-page">
  ${SITE_HEADER}
  <div class="tz-layout">
    ${SITE_RAIL}
    <div class="tz-main">

      <sc-if value="{{ signedOut }}">
        <section class="tz-hero">
          <div>
            <h1>Find what&rsquo;s on,<br><em>near you and back home.</em></h1>
            <p>Concerts, harambees, weddings, cookouts and church events across East Africa and the diaspora. RSVP or get tickets in a minute, and book the vendors who make them happen.</p>
          </div>
          <a href="/sign-in?mode=register" class="tz-button tz-button--solid tz-button--big">Join Twendezetu free &rarr;</a>
        </section>
      </sc-if>

      <sc-if value="{{ signedIn }}">
        <div class="tz-hello">
          <span class="tz-hello__mark"><img src="/brand/mark.png" alt="" width="179" height="209"></span>
          <h1>Home</h1>
        </div>
        <div class="tz-tabs" role="group" aria-label="Show">
          <sc-for list="{{ tabs }}" as="t"><button type="button" aria-pressed="{{ t.pressed }}" onClick="{{ t.pick }}">{{ t.label }}</button></sc-for>
        </div>
      </sc-if>

      <sc-for list="{{ sections }}" as="s">
        <section class="tz-shelf" aria-label="{{ s.title }}">
          ${sectionHead('s')}

          <sc-if value="{{ s.isEvents }}">
            <div class="tz-row" id="{{ s.scrollId }}">
              <sc-for list="{{ s.events }}" as="e">${eventCard('e')}</sc-for>
            </div>
          </sc-if>

          <sc-if value="{{ s.isVendors }}">
            <div class="tz-people">
              <sc-for list="{{ s.vendors }}" as="v">${vendorTile('v')}</sc-for>
            </div>
          </sc-if>

          <sc-if value="{{ s.isFaces }}">
            <div class="tz-faces">
              <sc-for list="{{ s.faces }}" as="f">
                <a href="{{ f.href }}" class="tz-face">
                  <span class="tz-face__img"><sc-if value="{{ f.img }}"><img src="{{ f.img }}" alt="" loading="lazy"></sc-if><sc-if value="{{ f.noImg }}">{{ f.initials }}</sc-if></span>
                  <span class="tz-face__name">{{ f.name }}</span>
                </a>
              </sc-for>
            </div>
          </sc-if>

          <sc-if value="{{ s.isList }}">
            <div class="tz-list">
              <sc-for list="{{ s.items }}" as="i">
                <a href="{{ i.href }}" class="tz-list__item">
                  <img src="{{ i.img }}" alt="" loading="lazy">
                  <div style="min-width: 0;">
                    <div class="tz-list__by">{{ i.organizer }}</div>
                    <div class="tz-list__title">{{ i.title }}</div>
                    <div class="tz-list__meta">{{ i.meta }}</div>
                  </div>
                </a>
              </sc-for>
            </div>
          </sc-if>

          <sc-if value="{{ s.isNeeds }}">
            <div class="tz-row" id="{{ s.scrollId }}">
              <sc-for list="{{ s.needs }}" as="n">
                <a href="{{ n.href }}" class="tz-need">
                  <span class="tz-pill tz-need__cat">{{ n.category }}</span>
                  <span class="tz-need__title">{{ n.title }}</span>
                  <span class="tz-need__meta">{{ n.meta }}</span>
                  <span class="tz-need__meta" style="margin-top: 0; color: #820101; font-weight: 600;">{{ n.offers }}</span>
                </a>
              </sc-for>
            </div>
          </sc-if>

          <sc-if value="{{ s.isEmpty }}">
            <div class="tz-empty">{{ s.emptyText }} <a href="{{ s.emptyHref }}">{{ s.emptyLink }}</a></div>
          </sc-if>
        </section>
      </sc-for>

    </div>
  </div>
  ${SITE_FOOTER}

  <sc-if value="{{ nextUp }}">
    <div class="tz-nextbar" role="region" aria-label="Your next event">
      <img src="{{ nextUp.img }}" alt="">
      <div class="tz-nextbar__text">
        <div class="tz-nextbar__label">{{ nextUp.label }}</div>
        <div class="tz-nextbar__title">{{ nextUp.title }} · {{ nextUp.meta }}</div>
      </div>
      <a href="{{ nextUp.href }}" class="tz-button tz-button--solid">{{ nextUp.cta }}</a>
    </div>
  </sc-if>

  ${SITE_TABBAR}
</div>
`;

export default template;
