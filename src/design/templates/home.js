// Markup for the home page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh; letter-spacing: -0.005em;">

  <!-- ===== Top utility bar ===== -->
  <div style="background: #1F3A38; color: #F7F1E6; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; row-gap: 6px; padding: 8px 24px; font-family: var(--tz-mono); font-size: 11px; letter-spacing: 0.06em;">
    <div style="display: flex; gap: 16px; align-items: center;">
      <span style="color: #D97A3B;">KARIBU ·</span>
      <span>{{ cityLabel }}</span>
      <span class="tw-hide-sm" style="opacity: 0.45;">EAST AFRICA + DIASPORA</span>
    </div>
    <div style="display: flex; gap: 14px; align-items: center;">
      <button onClick="{{ cycleCurrency }}" style="background: none; border: 1px solid rgba(247,241,230,0.3); color: #F7F1E6; font-family: var(--tz-mono); font-size: 11px; padding: 3px 10px; cursor: pointer; letter-spacing: 0.06em;">{{ currency }} ▾</button>
      <button onClick="{{ toggleLang }}" style="background: none; border: 1px solid rgba(247,241,230,0.3); color: #F7F1E6; font-family: var(--tz-mono); font-size: 11px; padding: 3px 10px; cursor: pointer; letter-spacing: 0.06em;">{{ langLabel }}</button>
    </div>
  </div>

  <!-- ===== Header ===== -->
  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 18px 24px; border-bottom: 2px solid #1F3A38; background: #F7F1E6; position: sticky; top: 0; z-index: 40;">
    <div style="display: flex; align-items: center; gap: 36px;">
      <a href="/" class="tz-logo-link" aria-label="Twendezetu home"><img src="/brand/logo.png" alt="Twendezetu" width="1211" height="229" class="tz-logo tz-logo--md"></a>
      <nav class="tw-nav" style="display: flex; gap: 24px; font-size: 14px; font-weight: 500;">
        <a href="/" style="color: #14201F; text-decoration: none; border-bottom: 2px solid #D97A3B; padding-bottom: 2px;">Event guide</a>
        <a href="{{ featured.href }}" style="color: #6E6155; text-decoration: none;">Featured</a>
        <a href="/create-event" style="color: #6E6155; text-decoration: none;">Post an event or need</a>
        <a href="/providers" style="color: #6E6155; text-decoration: none;">Providers</a>
      </nav>
    </div>
    <div style="display: flex; gap: 10px; align-items: center;">
      <a href="{{ me.accountHref }}" style="font-size: 14px; font-weight: 600; color: #14201F; text-decoration: none; padding: 10px 16px;">{{ me.accountLabel }}</a>
      <a href="/create-event" style="font-family: var(--tz-mono); font-size: 13px; background: #1F3A38; color: #F7F1E6; text-decoration: none; padding: 12px 20px; box-shadow: 4px 4px 0 #D97A3B;">POST FREE →</a>
    </div>
  </header>

  <!-- ===== Hero: photo-filled display type ===== -->
  <section style="background: #FFFDF8; border-bottom: 2px solid #1F3A38;">
    <div style="max-width: 1320px; margin: 0 auto; padding: 48px 24px 0;">
      <div style="display: flex; justify-content: space-between; align-items: baseline; font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em;">
        <span>[Mwongozo wa matukio]</span>
        <span>gatherings you will not forget</span>
        <span>[2026]</span>
      </div>
      <h1 style="font-family: var(--tz-display); font-size: clamp(58px, 10.5vw, 158px); line-height: 0.98; margin: 22px 0 6px; text-transform: uppercase; letter-spacing: 0.005em; text-align: center; background-image: url('https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1600&q=80'); background-size: cover; background-position: center 30%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: tw-pan 14s ease-in-out infinite, tw-rise 900ms cubic-bezier(0.2,0.7,0.2,1) both;">EVENT PORTAL</h1>
      <div style="display: flex; justify-content: flex-end; padding: 0 8px 26px;">
        <sc-if value="{{ isEn }}" hint-placeholder-val="{{ true }}">
          <div style="font-size: 16px; color: #3A2F25; max-width: 340px; text-align: right;">Events, needs and providers that remain in the senses — <em style="font-family: var(--tz-serif);">popote ulipo.</em></div>
        </sc-if>
        <sc-if value="{{ isSw }}" hint-placeholder-val="{{ false }}">
          <div style="font-size: 16px; color: #3A2F25; max-width: 340px; text-align: right;">Matukio, mahitaji na watoa huduma yasiyosahaulika — <em style="font-family: var(--tz-serif);">popote ulipo.</em></div>
        </sc-if>
      </div>
    </div>
    <div style="position: relative; border-top: 2px solid #1F3A38;">
      <img src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1800&q=80" alt="Crowd gathered at dusk" style="width: 100%; height: 520px; object-fit: cover; display: block;">
      <a href="/create-event" class="tw-hero-cta" style="position: absolute; left: 28px; bottom: 28px; font-family: var(--tz-display); font-size: 16px; text-transform: uppercase; color: #1F3A38; text-decoration: none; background: #D97A3B; border: 2px solid #1F3A38; padding: 13px 26px; box-shadow: 4px 4px 0 #1F3A38;">Post an event or need →</a>
      <span class="tw-hide-sm" style="position: absolute; right: 28px; bottom: 28px; font-family: var(--tz-mono); font-size: 11px; color: rgba(247,241,230,0.85);">NAIROBI → NEW JERSEY · EST. 2026</span>
    </div>
  </section>

  <!-- ===== Mission statement ===== -->
  <section style="background: #FFFDF8; border-bottom: 2px solid #1F3A38; padding: 96px 24px;">
    <div style="max-width: 880px; margin: 0 auto; text-align: center;">
      <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em; margin-bottom: 28px;">[Dhamira — mission]</div>
      <sc-if value="{{ isEn }}" hint-placeholder-val="{{ true }}">
        <p style="font-size: clamp(24px, 3.2vw, 34px); line-height: 1.35; font-weight: 600; margin: 0; letter-spacing: -0.01em;">
          <span style="color: #8C7F6F;">We connect</span> the gathering <span style="color: #8C7F6F;">to</span> everything it needs — <span style="color: #8C7F6F;">so that</span> a cousin in Jersey <span style="color: #8C7F6F;">can arrange</span> a driver in Jinja <span style="color: #8C7F6F;">without sharing</span> a single phone number.
        </p>
      </sc-if>
      <sc-if value="{{ isSw }}" hint-placeholder-val="{{ false }}">
        <p style="font-size: clamp(24px, 3.2vw, 34px); line-height: 1.35; font-weight: 600; margin: 0; letter-spacing: -0.01em;">
          <span style="color: #8C7F6F;">Tunaunganisha</span> mkusanyiko <span style="color: #8C7F6F;">na</span> kila kitu unachohitaji — <span style="color: #8C7F6F;">ili</span> binamu aliye Jersey <span style="color: #8C7F6F;">aweze kupanga</span> dereva Jinja <span style="color: #8C7F6F;">bila kutoa</span> namba ya simu.
        </p>
      </sc-if>
    </div>
  </section>

  <!-- ===== Services rows ===== -->
  <section style="border-bottom: 2px solid #1F3A38; background: #FFFDF8;">
    <div style="max-width: 1320px; margin: 0 auto; padding: 56px 24px 40px;">
      <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em;">[Tunakusanya nini — what gathers here]</div>
    </div>
    <sc-for list="{{ services }}" as="sv" hint-placeholder-count="4">
      <a href="{{ sv.href }}" style="display: block; position: relative; border-top: 2px solid #1F3A38; text-decoration: none; overflow: hidden;">
        <img src="{{ sv.img }}" alt="{{ sv.title }}" style="width: 100%; height: 190px; object-fit: cover; display: block; filter: brightness(0.55) saturate(0.9);">
        <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: space-between; padding: 0 40px; gap: 24px;">
          <div>
            <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.14em; margin-bottom: 6px;">{{ sv.kicker }}</div>
            <div style="font-family: var(--tz-display); font-size: clamp(34px, 4.6vw, 62px); text-transform: uppercase; color: #F7F1E6; line-height: 0.95;">{{ sv.title }}</div>
          </div>
          <div class="tw-nav" style="max-width: 300px; font-size: 13.5px; line-height: 1.5; color: rgba(247,241,230,0.9); text-align: right;">{{ sv.desc }}</div>
        </div>
      </a>
    </sc-for>
  </section>

  <!-- ===== Work process ===== -->
  <section style="border-bottom: 2px solid #1F3A38; background: #F7F1E6; padding: 72px 24px;">
    <div style="max-width: 1100px; margin: 0 auto;">
      <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em; margin-bottom: 32px;">[Jinsi inavyofanya kazi — how it works]</div>
      <sc-for list="{{ process }}" as="p" hint-placeholder-count="5">
        <div class="tw-2col" style="display: grid; grid-template-columns: 90px 1fr 1fr; gap: 32px; align-items: baseline; padding: 26px 0; border-bottom: 1px solid #C9BFB1;">
          <span style="font-family: var(--tz-mono); font-size: 14px; color: #D97A3B;">({{ p.num }})</span>
          <div style="font-family: var(--tz-display); font-size: clamp(26px, 3.4vw, 40px); text-transform: uppercase; line-height: 1;">{{ p.title }}</div>
          <div style="font-size: 14.5px; line-height: 1.55; color: #3A2F25;">{{ p.desc }}</div>
        </div>
      </sc-for>
    </div>
  </section>

  <!-- ===== Dark stats band ===== -->
  <section style="background: #1F3A38; color: #F7F1E6; border-bottom: 2px solid #1F3A38; padding: 72px 24px;">
    <div class="tw-2col" style="max-width: 1320px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center;">
      <div style="display: grid; gap: 36px;">
        <div>
          <div style="font-family: var(--tz-display); font-size: clamp(48px, 6vw, 84px); line-height: 1;">820+ EVENTS</div>
          <div style="font-size: 14px; margin-top: 4px;">shared by <span style="color: #D97A3B;">the community</span></div>
        </div>
        <div>
          <div style="font-family: var(--tz-display); font-size: clamp(40px, 5vw, 68px); line-height: 1;">9 CITIES</div>
          <div style="font-size: 14px; margin-top: 4px;">East Africa <span style="color: #D97A3B;">+ diaspora</span></div>
        </div>
      </div>
      <div style="display: grid; gap: 36px;">
        <img src="https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=900&q=80" alt="Open-air festival crowd" style="width: 100%; height: 220px; object-fit: cover; display: block; border: 2px solid #F7F1E6;">
        <div>
          <div style="font-family: var(--tz-display); font-size: clamp(40px, 5vw, 68px); line-height: 1;">95%</div>
          <div style="font-size: 14px; margin-top: 4px;">of needs matched <span style="color: #D97A3B;">within 72 hours</span></div>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== Events: featured + category shelves ===== -->
  <section style="padding: 56px 24px; border-bottom: 2px solid #1F3A38;">
    <div style="max-width: 1320px; margin: 0 auto;">
      <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 8px;">
        <h2 style="font-family: var(--tz-display); font-size: clamp(36px, 4.5vw, 64px); text-transform: uppercase; margin: 0;">Discover<span style="color: #D97A3B;">.</span></h2>
        <span style="font-family: var(--tz-mono); font-size: 12px; color: #6E6155;">{{ eventCount }} events · grouped by kind</span>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 28px;">
        <sc-for list="{{ categories }}" as="cat" hint-placeholder-count="8">
          <button onClick="{{ cat.pick }}" style="background: {{ cat.bg }}; color: {{ cat.fg }}; border: 2px solid #1F3A38; font-family: var(--tz-display); font-size: 14px; text-transform: uppercase; padding: 8px 16px; cursor: pointer; letter-spacing: 0.02em;">{{ cat.label }}</button>
        </sc-for>
      </div>

      <sc-if value="{{ isAll }}" hint-placeholder-val="{{ true }}">
        <!-- Featured hero + Happening soon -->
        <div class="tw-2col" style="display: grid; grid-template-columns: 1.6fr 1fr; gap: 24px; margin-bottom: 48px; align-items: stretch;">
          <a href="{{ featured.href }}" style="position: relative; text-decoration: none; color: #F7F1E6; border: 2px solid #1F3A38; box-shadow: 6px 6px 0 #1F3A38; display: block; overflow: hidden; min-height: 380px;">
            <img src="{{ featured.img }}" alt="{{ featured.title }}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;">
            <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(20,32,31,0.05) 0%, rgba(20,32,31,0.55) 45%, rgba(20,32,31,0.92) 100%);"></div>
            <div style="position: relative; z-index: 2; display: flex; flex-direction: column; height: 100%; padding: 22px; box-sizing: border-box;">
              <div style="display: flex; gap: 8px;">
                <span style="background: #D97A3B; border: 2px solid #1F3A38; color: #14201F; font-family: var(--tz-mono); font-size: 11px; padding: 4px 10px;">{{ featured.badge }}</span>
                <span style="background: #F7F1E6; border: 2px solid #1F3A38; color: #14201F; font-family: var(--tz-mono); font-size: 11px; padding: 4px 10px;">{{ featured.date }}</span>
              </div>
              <div style="margin-top: auto;">
                <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">{{ featured.kicker }}</div>
                <div style="font-family: var(--tz-display); font-size: clamp(30px, 3.6vw, 46px); text-transform: uppercase; line-height: 0.98; margin: 8px 0 6px;">{{ featured.title }}</div>
                <div style="font-size: 14px; color: rgba(247,241,230,0.88); line-height: 1.5; max-width: 560px;">{{ featured.blurb }}</div>
                <div style="display: flex; gap: 16px; margin-top: 14px; font-family: var(--tz-mono); font-size: 12px; color: #F7F1E6; flex-wrap: wrap;">
                  <span>{{ featured.city }}</span><span style="color: #E8A472;">{{ featured.price }}</span><span>{{ featured.going }}</span>
                </div>
              </div>
            </div>
          </a>
          <div style="border: 2px solid #1F3A38; background: #FFFDF8; display: flex; flex-direction: column; min-height: 380px;">
            <div style="padding: 14px 16px; border-bottom: 2px solid #1F3A38; font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.1em; flex-shrink: 0;">HAPPENING SOON</div>
            <div style="overflow-y: auto; flex: 1;">
              <sc-for list="{{ explore }}" as="ex" hint-placeholder-count="6">
                <a href="{{ ex.href }}" style="display: grid; grid-template-columns: 76px 1fr; gap: 12px; align-items: center; text-decoration: none; color: #14201F; padding: 12px 16px; border-bottom: 1px solid #E3D9C6;">
                  <img src="{{ ex.img }}" alt="{{ ex.title }}" style="width: 76px; height: 60px; object-fit: cover; border: 2px solid #1F3A38; display: block;">
                  <div>
                    <div style="font-family: var(--tz-display); font-size: 16px; text-transform: uppercase; line-height: 1.05;">{{ ex.title }}</div>
                    <div style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155; margin-top: 3px;">{{ ex.date }} · {{ ex.city }}</div>
                  </div>
                </a>
              </sc-for>
            </div>
          </div>
        </div>

        <!-- Category shelves -->
        <sc-for list="{{ shelves }}" as="sh" hint-placeholder-count="6">
          <div style="margin-bottom: 40px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; border-top: 2px solid #1F3A38; padding-top: 12px; margin-bottom: 16px;">
              <button onClick="{{ sh.jump }}" style="background: none; border: 0; cursor: pointer; padding: 0; display: flex; align-items: baseline; gap: 10px; color: #14201F; text-align: left; flex-wrap: wrap;">
                <span style="font-family: var(--tz-display); font-size: clamp(22px, 2.4vw, 30px); text-transform: uppercase;">{{ sh.label }}</span>
                <span style="color: #D97A3B; font-family: var(--tz-display); font-size: 24px;">›</span>
                <span style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">{{ sh.count }}</span>
              </button>
              <div style="display: flex; gap: 6px; flex-shrink: 0;">
                <button onClick="{{ sh.prev }}" aria-label="Scroll left" style="width: 38px; height: 38px; border: 2px solid #1F3A38; background: #FFFDF8; cursor: pointer; font-size: 16px; color: #14201F;">‹</button>
                <button onClick="{{ sh.next }}" aria-label="Scroll right" style="width: 38px; height: 38px; border: 2px solid #1F3A38; background: #FFFDF8; cursor: pointer; font-size: 16px; color: #14201F;">›</button>
              </div>
            </div>
            <div id="{{ sh.scrollId }}" style="display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 8px;">
              <sc-for list="{{ sh.events }}" as="ev" hint-placeholder-count="8">
                <a href="{{ ev.href }}" style="scroll-snap-align: start; flex: 0 0 230px; text-decoration: none; color: #14201F; background: #FFFDF8; border: 2px solid #1F3A38; display: flex; flex-direction: column; transition: transform 120ms ease;" style-hover="transform: translate(-3px,-3px); box-shadow: 5px 5px 0 #D97A3B;">
                  <div style="position: relative;">
                    <img src="{{ ev.img }}" alt="{{ ev.title }}" style="width: 100%; aspect-ratio: 4/5; object-fit: cover; display: block; border-bottom: 2px solid #1F3A38;">
                    <span style="position: absolute; top: 10px; left: 10px; background: #F7F1E6; border: 2px solid #1F3A38; font-family: var(--tz-mono); font-size: 11px; padding: 4px 8px;">{{ ev.date }}</span>
                    <sc-if value="{{ ev.badge }}" hint-placeholder-val="{{ false }}">
                      <span style="position: absolute; top: 10px; right: 10px; background: #D97A3B; border: 2px solid #1F3A38; font-family: var(--tz-mono); font-size: 11px; padding: 4px 8px; color: #1F3A38;">{{ ev.badge }}</span>
                    </sc-if>
                  </div>
                  <div style="padding: 14px 14px 16px; display: flex; flex-direction: column; gap: 6px; flex: 1;">
                    <div style="font-family: var(--tz-display); font-size: 18px; text-transform: uppercase; line-height: 1.05;">{{ ev.title }}</div>
                    <div style="font-size: 13px; color: #6E6155;">{{ ev.city }}</div>
                    <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: center; font-family: var(--tz-mono); font-size: 12px;">
                      <span style="color: #A85A23;">{{ ev.price }}</span>
                      <span>{{ ev.going }} going</span>
                    </div>
                  </div>
                </a>
              </sc-for>
            </div>
          </div>
        </sc-for>
      </sc-if>

      <sc-if value="{{ isFiltered }}" hint-placeholder-val="{{ false }}">
        <div class="tw-4col" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
          <sc-for list="{{ events }}" as="ev" hint-placeholder-count="8">
            <a href="{{ ev.href }}" style="text-decoration: none; color: #14201F; background: #FFFDF8; border: 2px solid #1F3A38; display: flex; flex-direction: column; transition: transform 120ms ease;" style-hover="transform: translate(-3px,-3px); box-shadow: 5px 5px 0 #D97A3B;">
              <div style="position: relative;">
                <img src="{{ ev.img }}" alt="{{ ev.title }}" style="width: 100%; aspect-ratio: 4/5; object-fit: cover; display: block; border-bottom: 2px solid #1F3A38;">
                <span style="position: absolute; top: 10px; left: 10px; background: #F7F1E6; border: 2px solid #1F3A38; font-family: var(--tz-mono); font-size: 11px; padding: 4px 8px;">{{ ev.date }}</span>
                <sc-if value="{{ ev.badge }}" hint-placeholder-val="{{ false }}">
                  <span style="position: absolute; top: 10px; right: 10px; background: #D97A3B; border: 2px solid #1F3A38; font-family: var(--tz-mono); font-size: 11px; padding: 4px 8px; color: #1F3A38;">{{ ev.badge }}</span>
                </sc-if>
              </div>
              <div style="padding: 14px 14px 16px; display: flex; flex-direction: column; gap: 6px; flex: 1;">
                <div style="font-family: var(--tz-display); font-size: 19px; text-transform: uppercase; line-height: 1.05;">{{ ev.title }}</div>
                <div style="font-size: 13px; color: #6E6155;">{{ ev.city }}</div>
                <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: center; font-family: var(--tz-mono); font-size: 12px;">
                  <span style="color: #A85A23;">{{ ev.price }}</span>
                  <span>{{ ev.going }} going</span>
                </div>
              </div>
            </a>
          </sc-for>
        </div>
      </sc-if>
    </div>
  </section>

  <!-- ===== Needs board ===== -->
  <!-- ===== More from the guide (editorial list) ===== -->
  <section style="border-bottom: 2px solid #1F3A38; background: #FFFDF8; padding: 48px 24px;">
    <div style="max-width: 1100px; margin: 0 auto;">
      <div style="border-bottom: 2px solid #1F3A38; padding-bottom: 10px; font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.12em;">MORE FROM THE GUIDE</div>
      <sc-for list="{{ moreStories }}" as="ms" hint-placeholder-count="4">
        <a href="{{ ms.href }}" class="tw-story" style="display: grid; grid-template-columns: 110px 1fr 190px; gap: 28px; align-items: start; text-decoration: none; color: #14201F; padding: 26px 0; border-bottom: 1px solid #E3D9C6;">
          <span style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155; padding-top: 4px;">{{ ms.when }}</span>
          <div>
            <div style="font-family: var(--tz-display); font-size: 22px; text-transform: uppercase; line-height: 1.1;">{{ ms.title }}</div>
            <div style="font-size: 13.5px; color: #6E6155; line-height: 1.55; margin-top: 6px; max-width: 520px;">{{ ms.desc }}</div>
          </div>
          <img src="{{ ms.img }}" alt="{{ ms.title }}" style="width: 100%; aspect-ratio: 16/10; object-fit: cover; display: block; border: 2px solid #1F3A38;">
        </a>
      </sc-for>
    </div>
  </section>

  <section data-needs-board="true" style="border-bottom: 2px solid #1F3A38; background: #EFE7D6;">
    <div style="max-width: 1320px; margin: 0 auto; padding: 64px 24px;">
      <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em;">[Tangaza hitaji — post a need]</div>
      <div class="tw-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 16px;">
        <div>
          <h2 style="font-family: var(--tz-display); font-size: clamp(36px, 4.5vw, 60px); text-transform: uppercase; line-height: 0.98; margin: 0 0 20px;">Need a driver in Kampala? A DJ in Jinja? A tent in Jersey?</h2>
          <p style="font-size: 16px; line-height: 1.55; color: #3A2F25; max-width: 480px;">
            Post what you need — dates, city, budget. Providers respond through the platform. Your email and phone stay <strong>masked</strong> until <em style="font-family: var(--tz-serif);">you</em> choose to reveal them.
          </p>
          <a href="/create-event" style="display: inline-block; margin-top: 20px; font-family: var(--tz-display); font-size: 16px; text-transform: uppercase; background: #1F3A38; color: #F7F1E6; text-decoration: none; padding: 14px 26px; box-shadow: 5px 5px 0 #D97A3B;">Post a need — free →</a>
        </div>
        <div style="display: grid; gap: 14px;">
          <sc-for list="{{ needs }}" as="nd" hint-placeholder-count="3">
            <div style="background: #FFFDF8; border: 2px solid #1F3A38; padding: 18px 20px; display: grid; grid-template-columns: auto 1fr auto; gap: 16px; align-items: center;">
              <span style="font-family: var(--tz-display); font-size: 22px; color: #D97A3B;">{{ nd.num }}</span>
              <div>
                <div style="font-family: var(--tz-display); font-size: 17px; text-transform: uppercase;">{{ nd.title }}</div>
                <div style="font-family: var(--tz-mono); font-size: 12px; color: #6E6155; margin-top: 4px;">{{ nd.meta }}</div>
              </div>
              <span style="font-family: var(--tz-mono); font-size: 11.5px; background: #F6DCC0; border: 1px solid #A85A23; color: #7A3E0F; padding: 5px 10px;">{{ nd.offers }} offers</span>
            </div>
          </sc-for>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== Marquee ===== -->
  <div style="background: #D97A3B; border-bottom: 2px solid #1F3A38; overflow: hidden; padding: 10px 0;">
    <div style="display: flex; width: max-content; animation: tw-marquee 28s linear infinite; font-family: var(--tz-display); font-size: 18px; text-transform: uppercase; color: #1F3A38; gap: 32px; white-space: nowrap;">
      <span>Nairobi</span><span>✦</span><span>Kampala</span><span>✦</span><span>Dar es Salaam</span><span>✦</span><span>Kigali</span><span>✦</span><span>New Jersey</span><span>✦</span><span>New York</span><span>✦</span><span>Hii si ya kukosa</span><span>✦</span><span>Karibu nyote</span><span>✦</span>
      <span>Nairobi</span><span>✦</span><span>Kampala</span><span>✦</span><span>Dar es Salaam</span><span>✦</span><span>Kigali</span><span>✦</span><span>New Jersey</span><span>✦</span><span>New York</span><span>✦</span><span>Hii si ya kukosa</span><span>✦</span><span>Karibu nyote</span><span>✦</span>
    </div>
  </div>

  <!-- ===== Mega footer ===== -->
  <footer style="background: #1F3A38; color: #F7F1E6; padding: 56px 24px 0; overflow: hidden;">
    <div class="tw-4col" style="max-width: 1320px; margin: 0 auto; display: grid; grid-template-columns: 1.2fr 1fr 1fr 1fr; gap: 40px; padding-bottom: 48px;">
      <div>
        <div style="font-family: var(--tz-mono); font-size: 12px; color: #E8A472;">[Wasiliana nasi]</div>
        <p style="font-size: 14px; line-height: 1.6; color: rgba(247,241,230,0.75); max-width: 300px;">The community events portal for East Africa and the diaspora. Post free. Gather anywhere.</p>
        <a href="/create-event" style="font-family: var(--tz-display); font-size: 15px; text-transform: uppercase; color: #1F3A38; background: #D97A3B; text-decoration: none; padding: 12px 22px; display: inline-block;">Post an event →</a>
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px; font-size: 14px;">
        <span style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">EXPLORE</span>
        <a href="/" style="color: #F7F1E6; text-decoration: none;">Event guide</a>
        <a href="{{ featured.href }}" style="color: #F7F1E6; text-decoration: none;">Featured: {{ featured.title }}</a>
        <a href="/create-event" style="color: #F7F1E6; text-decoration: none;">Post a need</a>
        <a href="/providers" style="color: #F7F1E6; text-decoration: none;">Browse providers</a>
        <a href="/points-wallet" style="color: #F7F1E6; text-decoration: none;">Points wallet &amp; harambee pools</a>
        <a href="/mobile" style="color: #F7F1E6; text-decoration: none;">Twendezetu on mobile</a>
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px; font-size: 14px;">
        <span style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">ACCOUNTS</span>
        <sc-if value="{{ me.signedOut }}">
          <a href="/sign-in" style="color: #F7F1E6; text-decoration: none;">Sign in / register</a>
        </sc-if>
        <a href="/my-twende" style="color: #F7F1E6; text-decoration: none;">My Twende</a>
        <a href="/messages" style="color: #F7F1E6; text-decoration: none;">Messages (masked)</a>
        <a href="/provider-dashboard" style="color: #F7F1E6; text-decoration: none;">Provider dashboard</a>
        <sc-if value="{{ me.isStaff }}">
          <a href="/admin" style="color: #F7F1E6; text-decoration: none;">Admin console</a>
        </sc-if>
        <sc-if value="{{ me.isFinance }}">
          <a href="/finance" style="color: #F7F1E6; text-decoration: none;">Finance console</a>
        </sc-if>
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px; font-size: 14px;">
        <span style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">LOCALES</span>
        <span style="color: rgba(247,241,230,0.75);">KES · UGX · TZS · RWF · USD</span>
        <span style="color: rgba(247,241,230,0.75);">English · Kiswahili greetings</span>
      </div>
    </div>
    <div style="text-align: center; padding: 8px 0 4px;"><img src="/brand/logo-light.png" alt="Twendezetu" width="1211" height="229" loading="lazy" class="tz-logo tz-logo--hero"></div>
  </footer>
</div>
`;

export default template;
