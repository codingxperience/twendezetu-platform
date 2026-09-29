// Markup for the events page. Bindings are resolved by src/design/render.js.

import { SITE_FOOTER, SITE_HEADER, SITE_RAIL, SITE_TABBAR, eventCard, vendorTile } from './shell';

const template = `
<div class="tz-page">
  ${SITE_HEADER}
  <div class="tz-layout">
    ${SITE_RAIL}
    <div class="tz-main">
      <div class="tz-browse-head">
        <h1>{{ heading }}<sc-if value="{{ organizerVerified }}"> <span class="tz-verified">Verified organizer</span></sc-if></h1>
        <p>{{ summary }}</p>
      </div>

      <div class="tz-filters">
        <div class="tz-filter" role="group" aria-label="When">
          <span class="tz-filter__label">When</span>
          <sc-for list="{{ whenPills }}" as="p"><a href="{{ p.href }}" class="tz-fpill" aria-current="{{ p.current }}">{{ p.label }}</a></sc-for>
        </div>
        <div class="tz-filter" role="group" aria-label="Category">
          <span class="tz-filter__label">What</span>
          <sc-for list="{{ categoryPills }}" as="p"><a href="{{ p.href }}" class="tz-fpill" aria-current="{{ p.current }}">{{ p.label }}</a></sc-for>
        </div>
        <div class="tz-filter">
          <span class="tz-filter__label">Where</span>
          <select class="tz-cityselect" aria-label="City" onChange="{{ pickCity }}" value="{{ city }}">
            <sc-for list="{{ cityOptions }}" as="o"><option value="{{ o.value }}">{{ o.label }}</option></sc-for>
          </select>
          <span class="tz-filter__gap"></span>
          <sc-for list="{{ pricePills }}" as="p"><a href="{{ p.href }}" class="tz-fpill" aria-current="{{ p.current }}">{{ p.label }}</a></sc-for>
        </div>
        <div class="tz-filter" role="group" aria-label="Sort">
          <span class="tz-filter__label">Sort</span>
          <sc-for list="{{ sortPills }}" as="p"><a href="{{ p.href }}" class="tz-fpill" aria-current="{{ p.current }}">{{ p.label }}</a></sc-for>
          <sc-if value="{{ filtered }}"><a href="{{ clearHref }}" class="tz-link tz-filter__clear">Clear filters</a></sc-if>
        </div>
      </div>

      <sc-if value="{{ hasVendors }}">
        <section class="tz-shelf" aria-label="Vendors">
          <div class="tz-shelf__head">
            <div><h2 class="tz-shelf__title">Vendors</h2><p class="tz-shelf__note">Matching your search</p></div>
            <div class="tz-arrows"><a href="{{ vendorsHref }}" class="tz-seeall">See all</a></div>
          </div>
          <div class="tz-people"><sc-for list="{{ vendors }}" as="v">${vendorTile('v')}</sc-for></div>
        </section>
      </sc-if>

      <sc-if value="{{ hasEvents }}">
        <div class="tz-grid"><sc-for list="{{ events }}" as="e">${eventCard('e')}</sc-for></div>
      </sc-if>
      <sc-if value="{{ noEvents }}">
        <div class="tz-empty">{{ emptyText }} <a href="/events">See all upcoming events</a> or <a href="/create-event">post an event</a>.</div>
      </sc-if>
      <sc-if value="{{ hasMore }}">
        <div style="text-align: center; margin-top: 32px;"><a href="{{ moreHref }}" class="tz-button tz-button--outline">Show more events</a></div>
      </sc-if>
    </div>
  </div>
  ${SITE_FOOTER}
  ${SITE_TABBAR}
</div>
`;

export default template;
