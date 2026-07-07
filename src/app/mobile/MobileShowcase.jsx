import Link from 'next/link';
import styles from './mobile-showcase.module.css';

const navItems = [
  { key: 'guide', label: 'GUIDE', mark: '01' },
  { key: 'post', label: 'POST', mark: '+' },
  { key: 'wallet', label: 'WALLET', mark: '$' },
  { key: 'my', label: 'MY', mark: 'AM' },
];

const screens = [
  {
    id: 'home-feed',
    number: '(01)',
    label: 'HOME FEED',
    headline: 'Find the plan before the group chat wakes up.',
    theme: 'light',
    active: 'guide',
    render: <HomeFeedScreen />,
  },
  {
    id: 'event-detail',
    number: '(02)',
    label: 'EVENT DETAIL + RSVP',
    headline: 'RSVP, share, and keep the day locked in.',
    theme: 'light',
    active: 'post',
    render: <EventDetailScreen />,
  },
  {
    id: 'notifications',
    number: '(03)',
    label: 'NOTIFICATIONS',
    headline: 'Every alert has a purpose. Nothing hangs around.',
    theme: 'dark',
    active: 'my',
    render: <NotificationsScreen />,
  },
];

function Wordmark({ dark = false }) {
  return (
    <div className={`${styles.wordmark} ${dark ? styles.wordmarkDark : ''}`}>
      TWENDE
      <br />
      <span>ZETU</span>
    </div>
  );
}

function PhoneTopBar({ dark = false }) {
  return (
    <div className={`${styles.phoneTopBar} ${dark ? styles.phoneTopBarDark : ''}`}>
      <Wordmark dark={dark} />
      <div className={styles.phoneTopActions}>
        <span>NJ/NY</span>
        <span>AM</span>
      </div>
    </div>
  );
}

function PhoneStatusBar({ dark = false }) {
  return (
    <div className={`${styles.phoneStatusBar} ${dark ? styles.phoneStatusBarDark : ''}`}>
      <span>9:41</span>
      <div className={styles.statusItems} aria-hidden="true">
        <span>5G</span>
        <i className={styles.signalBars}>
          <b />
          <b />
          <b />
          <b />
        </i>
        <i className={styles.wifiIcon} />
        <i className={styles.batteryIcon}>
          <b />
        </i>
      </div>
    </div>
  );
}

function BottomNav({ active, dark = false }) {
  return (
    <nav className={`${styles.bottomNav} ${dark ? styles.bottomNavDark : ''}`} aria-label="Mobile app navigation">
      {navItems.map((item) => (
        <span key={item.key} className={active === item.key ? styles.bottomNavActive : ''}>
          <strong>{item.mark}</strong>
          {item.label}
        </span>
      ))}
    </nav>
  );
}

function PhoneShell({ active, children, theme = 'light' }) {
  const dark = theme === 'dark';

  return (
    <div className={styles.phone} data-phone-frame>
      <div className={styles.phoneSpeaker} />
      <div className={`${styles.phoneScreen} ${dark ? styles.phoneScreenDark : ''}`}>
        <div className={styles.screenStack}>
          <PhoneStatusBar dark={dark} />
          <PhoneTopBar dark={dark} />
          <div className={styles.phoneContent}>{children}</div>
          <BottomNav active={active} dark={dark} />
        </div>
      </div>
    </div>
  );
}

function ScreenCard({ screen, status = false }) {
  return (
    <article
      className={`${styles.screenCard} ${status ? styles.statusCard : ''}`}
      data-status-card={screen.id}
      aria-label={`${screen.number} ${screen.label}`}
    >
      {status ? (
        <div className={styles.securityPattern} aria-hidden="true">
          {Array.from({ length: 10 }, (_, index) => (
            <span key={index}>FRED OKORIO / TWENDEZETU ORIGINAL / TZ-FOK-2026</span>
          ))}
        </div>
      ) : null}

      <PhoneShell theme={screen.theme} active={screen.active}>
        {screen.render}
      </PhoneShell>

      <div className={styles.caption}>
        <div className={styles.captionKicker}>
          {screen.number} {screen.label}
        </div>
        <p>{screen.headline}</p>
      </div>

      <div className={styles.signature} aria-label="Designed by Fred Okorio">
        <span>@</span>Fred Okorio
      </div>

      {status ? (
        <div className={styles.securitySeal} aria-label="Original concept protected mark">
          <span>Original concept</span>
          <strong>Fred Okorio</strong>
          <em>TZ-FOK-2026</em>
        </div>
      ) : null}
    </article>
  );
}

function HomeFeedScreen() {
  return (
    <div className={styles.homeScreen}>
      <div className={styles.displayTitle}>EVENT GUIDE</div>

      <div className={styles.searchBox}>
        <span>Tafuta events, needs...</span>
        <strong>GO</strong>
      </div>

      <div className={styles.filterRow}>
        <span className={styles.filterActive}>All</span>
        <span>Nyama choma</span>
        <span>Music</span>
        <span>Needs</span>
      </div>

      <div className={styles.eventGrid}>
        <article className={styles.miniEvent}>
          <div className={styles.imageWrap}>
            <img src="https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&q=80" alt="Nyama choma grill" />
            <span>FEATURED</span>
          </div>
          <div>
            <small>SAT - 8 AUG</small>
            <strong>NYTC Nyama Choma</strong>
            <p>Jersey City - FREE</p>
          </div>
        </article>

        <article className={styles.miniEvent}>
          <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80" alt="DJ lights" />
          <div>
            <small>FRI - 14 AUG</small>
            <strong>Afrogroove Night</strong>
            <p>Brooklyn - from $20</p>
          </div>
        </article>
      </div>

      <div className={styles.needStrip}>
        <div>
          <strong>Driver + 4x4 needed</strong>
          <span>KLA {'->'} JINJA - 12-14 SEP</span>
        </div>
        <b>6 OFFERS</b>
      </div>
    </div>
  );
}

function EventDetailScreen() {
  return (
    <div className={styles.eventScreen}>
      <div className={styles.heroPhoto}>
        <img src="https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=900&q=80" alt="Nyama choma grill close-up" />
        <span className={styles.heroBack}>BACK</span>
        <span className={styles.heroShare}>SHARE</span>
      </div>

      <div className={styles.eventBody}>
        <small>[Tukio kuu] - sponsored by Nala</small>
        <h2>
          NYTC Nyama Choma <span>Festival</span>
        </h2>
        <div className={styles.metaPills}>
          <span>SAT - 8 AUG - 2 PM</span>
          <span>LINCOLN PARK, NJ</span>
          <span>FREE</span>
        </div>
        <p>
          Ayawi ayawi, sasa yamekua. Family, friends, grill masters, games kila rika, and live burudani on the
          Communipaw side.
        </p>
        <div className={styles.rsvpPanel}>
          <div>
            <strong>FREE</strong>
            <span>214 attending - 38 shares</span>
          </div>
          <button>RSVP</button>
        </div>
        <div className={styles.reminderNote}>RSVP adds reminders 7d - 1d - 2h before. Mute per event anytime.</div>
        <div className={styles.actionRow}>
          <button>CALENDAR</button>
          <button>WHATSAPP</button>
          <button>ORGANIZER</button>
        </div>
      </div>
    </div>
  );
}

function NotificationsScreen() {
  return (
    <div className={styles.notificationsScreen}>
      <div className={styles.notificationsTitle}>
        <div>
          <small>[Arifa - yours to control]</small>
          <h2>Notifications.</h2>
        </div>
        <span>SETTINGS</span>
      </div>

      <div className={styles.noticeList}>
        <article>
          <div>
            <small>OFFER - NEEDS BOARD</small>
            <small>12 MIN</small>
          </div>
          <p>
            <strong>Mama T Events</strong> offered <strong>$490</strong> on 3 canopy tents + chairs.
          </p>
          <footer>
            <span>VIEW OFFER</span>
            <span>MUTE THREAD</span>
          </footer>
        </article>

        <article>
          <div>
            <small>REMINDER</small>
            <small>1 HR</small>
          </div>
          <p>
            <strong>Nyama Choma Festival</strong> is in 7 days. Saa nane, Lincoln Park.
          </p>
        </article>

        <article>
          <div>
            <small>COMMENT</small>
            <small>3 HR</small>
          </div>
          <p>
            <strong>Joel M.</strong> commented on your post: Nakuja na washikaji watano.
          </p>
        </article>

        <article className={styles.digestCard}>
          <p>Weekly digest mode bundles non-urgent alerts into one Friday summary.</p>
          <span aria-hidden="true">
            <i />
          </span>
        </article>
      </div>
    </div>
  );
}

export function MobileShowcase() {
  return (
    <main className={styles.page}>
      <section className={styles.intro}>
        <div>
          <div className={styles.eyebrow}>[Simu - Twendezetu on mobile]</div>
          <h1>
            The portal in your pocket<span>.</span>
          </h1>
        </div>
        <Link href="/">BACK TO DESKTOP GUIDE</Link>
      </section>

      <section className={styles.showcaseGrid} aria-label="Twendezetu mobile screen previews">
        {screens.map((screen) => (
          <ScreenCard key={screen.id} screen={screen} />
        ))}
      </section>
    </main>
  );
}

export function MobileStatusAssets({ screenId } = {}) {
  const selectedScreens = screenId ? screens.filter((screen) => screen.id === screenId) : screens;

  return (
    <main
      className={`${styles.statusPage} ${screenId ? styles.statusPageSingle : ''}`}
      aria-label="High resolution WhatsApp status exports"
    >
      {selectedScreens.map((screen) => (
        <ScreenCard key={screen.id} screen={screen} status />
      ))}
    </main>
  );
}

export const mobileScreenIds = screens.map((screen) => screen.id);
