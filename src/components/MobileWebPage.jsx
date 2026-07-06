'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createClaudePageValues, getInitialClaudePageState } from '@/design/claude-page-state';

const ROUTES = {
  'Twendezetu Home.dc.html': '/',
  'Event Nyama Choma.dc.html': '/events/nyama-choma-festival-2026',
  'Create Event.dc.html': '/create-event',
  'Checkout.dc.html': '/checkout',
  'Sign In.dc.html': '/sign-in',
  'Provider Listing.dc.html': '/providers/kato-4x4',
  'Provider Dashboard.dc.html': '/provider-dashboard',
  'Points Wallet.dc.html': '/points-wallet',
  'My Twende.dc.html': '/my-twende',
  'Messages.dc.html': '/messages',
  'Mobile.dc.html': '/mobile',
};

const STATE_KEY = {
  home: 'home',
  event: 'event',
  create: 'create',
  checkout: 'checkout',
  signin: 'signin',
  myTwende: 'myTwende',
  messages: 'messages',
  wallet: 'wallet',
  provider: 'provider',
  providerDashboard: 'providerDashboard',
};

function routeFor(href) {
  return ROUTES[href] ?? href ?? '#';
}

function useMobilePageValues(page) {
  const stateKey = STATE_KEY[page] ?? 'home';
  const [pageState, setPageState] = useState(() => getInitialClaudePageState(stateKey));

  useEffect(() => {
    setPageState(getInitialClaudePageState(stateKey));
  }, [stateKey]);

  return useMemo(
    () => createClaudePageValues(stateKey, pageState, setPageState),
    [pageState, stateKey],
  );
}

function BrandMark({ compact = false }) {
  return (
    <Link href="/" className={compact ? 'tw-mobile-brand tw-mobile-brand--compact' : 'tw-mobile-brand'}>
      TWENDE
      <br />
      <span>ZETU</span>
    </Link>
  );
}

function MobileTopBar({ eyebrow, action, actionHref = '/' }) {
  return (
    <header className="tw-mobile-topbar">
      <BrandMark compact />
      <div className="tw-mobile-topbar__meta">
        <span>{eyebrow}</span>
      </div>
      <Link href={actionHref} className="tw-mobile-chip tw-mobile-chip--dark">
        {action}
      </Link>
    </header>
  );
}

function BottomNav({ active }) {
  const items = [
    { id: 'guide', href: '/', mark: '01', label: 'Guide' },
    { id: 'post', href: '/create-event', mark: '+', label: 'Post' },
    { id: 'wallet', href: '/points-wallet', mark: 'PTS', label: 'Wallet' },
    { id: 'twende', href: '/my-twende', mark: 'ME', label: 'My Twende' },
  ];

  return (
    <nav className="tw-mobile-bottom" aria-label="Mobile navigation">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={item.id === active ? 'tw-mobile-bottom__item is-active' : 'tw-mobile-bottom__item'}
        >
          <span>{item.mark}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function MobileShell({ active = 'guide', dark = false, children }) {
  return (
    <main className={dark ? 'tw-mobile-web tw-mobile-web--dark' : 'tw-mobile-web'}>
      {children}
      <BottomNav active={active} />
    </main>
  );
}

function EventMiniCard({ event }) {
  return (
    <Link href={routeFor(event.href)} className="tw-mobile-event-card">
      <div className="tw-mobile-event-card__media">
        <img src={event.img} alt={event.title} />
        {event.badge ? <span>{event.badge}</span> : null}
      </div>
      <div className="tw-mobile-event-card__body">
        <small>{event.date}</small>
        <strong>{event.title}</strong>
        <p>{event.city}</p>
        <em>{event.price}</em>
      </div>
    </Link>
  );
}

function MobileHome() {
  const values = useMobilePageValues('home');
  const featured = values.events.slice(0, 4);

  return (
    <MobileShell active="guide">
      <section className="tw-mobile-home-hero">
        <div className="tw-mobile-home-hero__head">
          <BrandMark />
          <button type="button" onClick={values.cycleCurrency} className="tw-mobile-chip tw-mobile-chip--dark">
            {values.currency}
          </button>
        </div>
        <p className="tw-mobile-kicker">NJ/NY event guide</p>
        <h1>Event guide</h1>
        <div className="tw-mobile-search">
          <input placeholder="Search events, needs, providers..." aria-label="Search Twendezetu" />
          <button type="button">Go</button>
        </div>
        <div className="tw-mobile-chip-row" aria-label="Categories">
          {values.categories.slice(0, 6).map((category) => (
            <button key={category.label} type="button" className="tw-mobile-chip">
              {category.label.replace(/\s*\(.+\)/, '')}
            </button>
          ))}
        </div>
      </section>

      <section className="tw-mobile-section">
        <div className="tw-mobile-section__head">
          <h2>This month</h2>
          <Link href="/events/nyama-choma-festival-2026">Featured</Link>
        </div>
        <div className="tw-mobile-event-grid">
          {featured.map((event) => (
            <EventMiniCard key={event.title} event={event} />
          ))}
        </div>
      </section>

      <section className="tw-mobile-section tw-mobile-section--tight">
        <div className="tw-mobile-section__head">
          <h2>Needs board</h2>
          <Link href="/create-event">Post</Link>
        </div>
        <div className="tw-mobile-stack">
          {values.needs.map((need) => (
            <Link href="/create-event" key={need.title} className="tw-mobile-need-card">
              <span>{need.num}</span>
              <div>
                <strong>{need.title}</strong>
                <p>{need.meta}</p>
              </div>
              <em>{need.offers} offers</em>
            </Link>
          ))}
        </div>
      </section>
    </MobileShell>
  );
}

function MobileEvent() {
  const values = useMobilePageValues('event');

  return (
    <MobileShell active="guide">
      <article className="tw-mobile-event-detail">
        <div className="tw-mobile-event-hero">
          <img
            src="https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=900&q=80"
            alt="Nyama choma grill"
          />
          <Link href="/" className="tw-mobile-floating-chip tw-mobile-floating-chip--left">
            Back
          </Link>
          <button type="button" onClick={values.copyLink} className="tw-mobile-floating-chip">
            {values.copied ? 'Copied' : 'Share'}
          </button>
        </div>
        <div className="tw-mobile-event-detail__body">
          <p className="tw-mobile-kicker">Featured event - sponsored by NALA</p>
          <h1>NYTC Nyama Choma Festival Nanenane</h1>
          <div className="tw-mobile-chip-row">
            <span className="tw-mobile-chip tw-mobile-chip--dark">Sat 8 Aug</span>
            <span className="tw-mobile-chip">Lincoln Park</span>
            <span className="tw-mobile-chip tw-mobile-chip--accent">Free</span>
          </div>
          <p>
            Ndugu, marafiki, familia: the NYTC family gathers for grill masters, games for every age,
            live burudani, and a full community afternoon on the Communipaw side.
          </p>
          <div className="tw-mobile-price-card">
            <div>
              <strong>Free</strong>
              <span>214 attending - 38 shares</span>
            </div>
            <button type="button" onClick={values.toggleRsvp}>
              {values.rsvped ? 'You are going' : 'RSVP'}
            </button>
          </div>
          <div className="tw-mobile-note">
            RSVP adds the event to My Twende with reminders 7 days, 1 day, and 2 hours before.
          </div>
          <div className="tw-mobile-actions-grid">
            <Link href="/my-twende">Calendar</Link>
            <button type="button" onClick={values.copyLink}>
              WhatsApp
            </button>
            <Link href="/messages">Organizer</Link>
          </div>
        </div>
      </article>
    </MobileShell>
  );
}

function MobileCreate() {
  const values = useMobilePageValues('create');

  return (
    <MobileShell active="post">
      <MobileTopBar eyebrow="Post event or need" action="Close" actionHref="/" />
      <section className="tw-mobile-form-page">
        <p className="tw-mobile-kicker">Free to post</p>
        <h1>What are you gathering?</h1>
        <div className="tw-mobile-choice-grid">
          <button type="button" onClick={values.pickEvent} className={values.eventCardBg === '#1F3A38' ? 'is-selected' : ''}>
            <strong>Event</strong>
            <span>Tickets, RSVP, calendar reminders.</span>
          </button>
          <button type="button" onClick={values.pickNeed} className={values.needCardBg === '#1F3A38' ? 'is-selected' : ''}>
            <strong>Need</strong>
            <span>Drivers, DJs, tents, catering, and offers.</span>
          </button>
        </div>
        <label className="tw-mobile-field">
          Title
          <input defaultValue={values.kind === 'event' ? 'NYTC Nyama Choma Festival' : 'Driver + 4x4 needed'} />
        </label>
        <label className="tw-mobile-field">
          City and date
          <input defaultValue={values.kind === 'event' ? 'Jersey City - 8 Aug' : 'Kampala to Jinja - 12 to 14 Sep'} />
        </label>
        <label className="tw-mobile-field">
          Details
          <textarea
            rows={5}
            defaultValue="Add the important details people need before they RSVP or send an offer. Contacts stay masked by default."
          />
        </label>
        <div className="tw-mobile-stack">
          {values.privacyRows.map((row) => (
            <button key={row.title} type="button" onClick={row.toggle} className="tw-mobile-toggle-row">
              <span>
                <strong>{row.title}</strong>
                <small>{row.desc}</small>
              </span>
              <em style={{ background: row.bg }}>
                <i style={{ left: row.knobLeft }} />
              </em>
            </button>
          ))}
        </div>
        <button type="button" onClick={values.copyLink} className="tw-mobile-primary">
          Publish and copy link
        </button>
      </section>
    </MobileShell>
  );
}

function MobileCheckout() {
  const values = useMobilePageValues('checkout');

  return (
    <MobileShell active="guide">
      <MobileTopBar eyebrow="Secure checkout" action={values.currency} actionHref="/points-wallet" />
      <section className="tw-mobile-form-page">
        <p className="tw-mobile-kicker">Afrogroove Night</p>
        <h1>Choose tickets</h1>
        <div className="tw-mobile-stack">
          {values.tiers.slice(0, 3).map((tier) => (
            <div key={tier.name} className="tw-mobile-ticket-tier">
              <div>
                <strong>{tier.name}</strong>
                <p>{tier.desc}</p>
                <span>{tier.price}</span>
              </div>
              <div className="tw-mobile-stepper">
                <button type="button" onClick={tier.minus} aria-label={`Remove ${tier.name}`}>
                  -
                </button>
                <em>{tier.qty}</em>
                <button type="button" onClick={tier.plus} aria-label={`Add ${tier.name}`}>
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
        <h2 className="tw-mobile-subhead">Payment</h2>
        <div className="tw-mobile-stack">
          {values.methods.map((method) => (
            <button key={method.title} type="button" onClick={method.pick} className="tw-mobile-method">
              <strong>{method.title}</strong>
              <span>{method.desc}</span>
            </button>
          ))}
        </div>
        <div className="tw-mobile-order-card">
          {values.lines.map((line) => (
            <div key={line.label}>
              <span>{line.label}</span>
              <strong>{line.amount}</strong>
            </div>
          ))}
          <div>
            <span>Service fee</span>
            <strong>{values.feeAmount}</strong>
          </div>
          <footer>
            <span>Total</span>
            <strong>{values.total}</strong>
          </footer>
        </div>
        <button type="button" className="tw-mobile-primary">
          {values.payLabel.replace('→', '->')}
        </button>
      </section>
    </MobileShell>
  );
}

function MobileSignin() {
  const values = useMobilePageValues('signin');

  return (
    <MobileShell active="twende">
      <section className="tw-mobile-auth">
        <BrandMark />
        <p className="tw-mobile-kicker">Karibu Twendezetu</p>
        <h1>{values.isRegister ? 'Create your account' : 'Sign in'}</h1>
        <div className="tw-mobile-segment">
          <button type="button" onClick={values.setRegister} className={values.isRegister ? 'is-selected' : ''}>
            Register
          </button>
          <button type="button" onClick={values.setSignIn} className={!values.isRegister ? 'is-selected' : ''}>
            Sign in
          </button>
        </div>
        {values.isRegister ? (
          <div className="tw-mobile-stack">
            {values.roleCards.map((role) => (
              <button key={role.title} type="button" onClick={role.pick} className="tw-mobile-role-card">
                <strong>{role.title}</strong>
                <span>{role.desc}</span>
                <em>{role.tag}</em>
              </button>
            ))}
          </div>
        ) : null}
        <label className="tw-mobile-field">
          Email
          <input type="email" placeholder="you@example.com" />
        </label>
        <label className="tw-mobile-field">
          Password
          <input type="password" placeholder="Password" />
        </label>
        <Link href={routeFor(values.ctaHref)} className="tw-mobile-primary tw-mobile-primary--link">
          {values.ctaLabel.replace('→', '->')}
        </Link>
      </section>
    </MobileShell>
  );
}

function MobileMyTwende() {
  const values = useMobilePageValues('myTwende');

  return (
    <MobileShell active="twende">
      <MobileTopBar eyebrow="My Twende" action="Share" actionHref="/messages" />
      <section className="tw-mobile-section">
        <p className="tw-mobile-kicker">Saved, RSVP, reminders</p>
        <h1 className="tw-mobile-page-title">Your plan</h1>
        <div className="tw-mobile-tab-row">
          {values.tabs.map((tab) => (
            <button key={tab.label} type="button" onClick={tab.go}>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="tw-mobile-stack">
          {values.showInbox
            ? values.inbox.map((item) => (
                <Link href="/messages" key={item.from} className="tw-mobile-inbox-card">
                  <strong>{item.from}</strong>
                  <span>{item.body}</span>
                  <em>{item.time}</em>
                </Link>
              ))
            : values.upcoming.map((event) => (
                <Link href={routeFor(event.href)} key={event.title} className="tw-mobile-wide-event">
                  <img src={event.img} alt={event.title} />
                  <span>
                    <strong>{event.title}</strong>
                    <small>{event.date}</small>
                    <em>{event.reminders}</em>
                  </span>
                </Link>
              ))}
        </div>
      </section>
    </MobileShell>
  );
}

function MobileMessages() {
  const values = useMobilePageValues('messages');

  return (
    <MobileShell active="twende">
      <MobileTopBar eyebrow="Masked messages" action="My" actionHref="/my-twende" />
      <section className="tw-mobile-section">
        <h1 className="tw-mobile-page-title">Messages</h1>
        <div className="tw-mobile-stack">
          {values.threads.map((thread) => (
            <button key={thread.name} type="button" onClick={thread.open} className="tw-mobile-thread-card">
              <strong>{thread.name}</strong>
              <span>{thread.re}</span>
              <p>{thread.preview}</p>
              <em>{thread.time}</em>
            </button>
          ))}
        </div>
        <div className="tw-mobile-offer-card">
          <small>Formal offer #OF-2214</small>
          <strong>2 days - 4x4 + driver</strong>
          <p>Fuel included, Kampala pickup, village roads OK, flight tracking free.</p>
          <button type="button" onClick={values.acceptOffer}>
            {values.accepted ? 'Accepted - contacts revealed' : 'Accept - UGX 760K'}
          </button>
        </div>
      </section>
    </MobileShell>
  );
}

function MobileWallet() {
  const values = useMobilePageValues('wallet');

  return (
    <MobileShell active="wallet">
      <MobileTopBar eyebrow="Points wallet" action="My" actionHref="/my-twende" />
      <section className="tw-mobile-wallet-hero">
        <p className="tw-mobile-kicker">One value, every border</p>
        <h1>1,250 PTS</h1>
        <span>About $12.50 - KES 1,610 - UGX 46,500</span>
        <div>
          <button type="button">Top up</button>
          <button type="button">Send</button>
        </div>
      </section>
      <section className="tw-mobile-section">
        <div className="tw-mobile-section__head">
          <h2>Activity</h2>
          <Link href="/checkout">Spend</Link>
        </div>
        <div className="tw-mobile-stack">
          {values.activity.map((activity) => (
            <div key={activity.title} className="tw-mobile-activity-row">
              <span>
                <strong>{activity.title}</strong>
                <small>{activity.meta}</small>
              </span>
              <em>{activity.amount}</em>
            </div>
          ))}
        </div>
      </section>
    </MobileShell>
  );
}

function MobileProvider() {
  return (
    <MobileShell active="guide">
      <MobileTopBar eyebrow="Verified provider" action="Book" actionHref="/checkout" />
      <section className="tw-mobile-provider-hero">
        <img src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=900&q=80" alt="4x4 vehicle" />
        <div>
          <p className="tw-mobile-kicker">Kampala - Jinja - Entebbe</p>
          <h1>Kato 4x4 & Tours</h1>
          <span>4.9 rating - 218 jobs - verified</span>
        </div>
      </section>
      <section className="tw-mobile-section">
        <div className="tw-mobile-stack">
          {['Airport pickup', 'Village road 4x4', 'Event convoy', 'Jinja day trip'].map((service) => (
            <Link href="/messages" key={service} className="tw-mobile-service-row">
              <strong>{service}</strong>
              <span>Ask for quote</span>
            </Link>
          ))}
        </div>
      </section>
    </MobileShell>
  );
}

function MobileProviderDashboard() {
  return (
    <MobileShell active="twende" dark>
      <MobileTopBar eyebrow="Provider portal" action="Leads" actionHref="/messages" />
      <section className="tw-mobile-section">
        <h1 className="tw-mobile-page-title">Dashibodi</h1>
        <div className="tw-mobile-metric-grid">
          <div>
            <strong>12</strong>
            <span>New leads</span>
          </div>
          <div>
            <strong>UGX 2.4M</strong>
            <span>Pipeline</span>
          </div>
        </div>
        <div className="tw-mobile-stack">
          {['Driver + 4x4 - Kampala to Jinja', 'Wedding convoy - 3 cars', 'Airport pickup - family of four'].map((lead) => (
            <Link href="/messages" key={lead} className="tw-mobile-dark-card">
              <strong>{lead}</strong>
              <span>Send offer</span>
            </Link>
          ))}
        </div>
      </section>
    </MobileShell>
  );
}

function MobileNotifications() {
  return (
    <MobileShell active="twende" dark>
      <section className="tw-mobile-section">
        <div className="tw-mobile-section__head">
          <h1 className="tw-mobile-page-title">Arifa</h1>
          <Link href="/my-twende">Settings</Link>
        </div>
        <p className="tw-mobile-kicker">Notifications you control</p>
        <div className="tw-mobile-stack">
          <Link href="/messages" className="tw-mobile-alert-card">
            <small>Offer - needs board</small>
            <strong>Mama T Events offered $490 on 3 canopy tents + chairs.</strong>
            <span>View offer</span>
          </Link>
          <Link href="/events/nyama-choma-festival-2026" className="tw-mobile-alert-card">
            <small>Reminder</small>
            <strong>Nyama Choma Festival is in 7 days. Lincoln Park, Communipaw side.</strong>
            <span>Open event</span>
          </Link>
          <div className="tw-mobile-digest-card">
            Weekly digest mode bundles non-urgent alerts into one Friday summary.
          </div>
        </div>
      </section>
    </MobileShell>
  );
}

export function MobileWebPage({ page }) {
  switch (page) {
    case 'event':
      return <MobileEvent />;
    case 'create':
      return <MobileCreate />;
    case 'checkout':
      return <MobileCheckout />;
    case 'signin':
      return <MobileSignin />;
    case 'myTwende':
      return <MobileMyTwende />;
    case 'messages':
      return <MobileMessages />;
    case 'wallet':
      return <MobileWallet />;
    case 'provider':
      return <MobileProvider />;
    case 'providerDashboard':
      return <MobileProviderDashboard />;
    case 'notifications':
      return <MobileNotifications />;
    case 'home':
    default:
      return <MobileHome />;
  }
}
