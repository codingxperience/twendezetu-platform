// Markup for the provider page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh;">

  <!-- Header -->
  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 18px 24px; border-bottom: 2px solid #1F3A38; background: #F7F1E6; position: sticky; top: 0; z-index: 40;">
    <div style="display: flex; align-items: center; gap: 36px;">
      <a href="/" style="text-decoration: none; color: #14201F; font-family: var(--tz-display); font-size: 26px; text-transform: uppercase; line-height: 0.9;">TWENDE<br><span style="color: #D97A3B;">ZETU</span></a>
      <nav class="tw-nav" style="display: flex; gap: 24px; font-size: 14px; font-weight: 500;">
        <a href="/" style="color: #6E6155; text-decoration: none;">Event guide</a>
        <a href="/create-event" style="color: #6E6155; text-decoration: none;">Post an event or need</a>
        <a href="/provider-dashboard" style="color: #6E6155; text-decoration: none;">For providers</a>
      </nav>
    </div>
    <a href="/sign-in" style="font-family: var(--tz-mono); font-size: 13px; background: #1F3A38; color: #F7F1E6; text-decoration: none; padding: 12px 20px; box-shadow: 4px 4px 0 #D97A3B;">SIGN IN →</a>
  </header>

  <!-- Public-listing orientation -->
  <div style="background: #EFE7D6; border-bottom: 2px solid #1F3A38; padding: 9px 24px;">
    <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; font-family: var(--tz-mono); font-size: 11.5px; color: #6E6155;">
      <span>▣ PUBLIC LISTING — this is exactly what customers see. Anyone can view or request a quote without an account.</span>
      <a href="/provider-dashboard" style="color: #A85A23; text-decoration: none; white-space: nowrap;">Provider? Manage yours in the dashboard →</a>
    </div>
  </div>

  <!-- Breadcrumb -->
  <div style="max-width: 1200px; margin: 0 auto; padding: 20px 24px 0; font-family: var(--tz-mono); font-size: 12px; color: #6E6155;">
    <a href="/" style="color: #A85A23;">← Providers</a> · Transport &amp; drivers · Kampala, Uganda
  </div>

  <!-- Title -->
  <section style="max-width: 1200px; margin: 0 auto; padding: 16px 24px 32px;">
    <div style="display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; flex-wrap: wrap;">
      <div>
        <h1 style="font-family: var(--tz-display); font-size: clamp(44px, 7vw, 92px); text-transform: uppercase; line-height: 0.92; margin: 0;">Kato 4x4<br>&amp; Tours<span style="color: #D97A3B;">.</span></h1>
        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 18px; font-family: var(--tz-mono); font-size: 12.5px;">
          <span style="background: #1F3A38; color: #F7F1E6; padding: 7px 13px;">★ 4.9 · 61 JOBS</span>
          <span style="border: 2px solid #1F3A38; padding: 5px 13px;">KAMPALA + UP-COUNTRY</span>
          <span style="border: 2px solid #1F3A38; padding: 5px 13px;">MEMBER SINCE 2026 ✓</span>
          <span style="background: #D97A3B; border: 2px solid #1F3A38; color: #1F3A38; padding: 5px 13px;">RESPONDS IN ~2 HRS</span>
        </div>
      </div>
      <div style="font-family: var(--tz-mono); font-size: 12px; color: #6E6155; text-align: right; line-height: 1.6;">4x4 hire · airport runs · wedding convoys<br>village-road specialist · flight tracking</div>
    </div>
  </section>

  <!-- Gallery carousel -->
  <section style="border-top: 2px solid #1F3A38; border-bottom: 2px solid #1F3A38; background: #14201F; position: relative;">
    <sc-if value="{{ galleryIs0 }}" hint-placeholder-val="{{ true }}">
      <img src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1400&q=80" alt="Land Cruiser on the open road" style="width: 100%; height: 400px; object-fit: cover; display: block;">
    </sc-if>
    <sc-if value="{{ galleryIs1 }}" hint-placeholder-val="{{ false }}">
      <img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1400&q=80" alt="Driver at the wheel" style="width: 100%; height: 400px; object-fit: cover; display: block;">
    </sc-if>
    <sc-if value="{{ galleryIs2 }}" hint-placeholder-val="{{ false }}">
      <img src="https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1400&q=80" alt="Vehicle detail" style="width: 100%; height: 400px; object-fit: cover; display: block;">
    </sc-if>
    <sc-if value="{{ galleryIs3 }}" hint-placeholder-val="{{ false }}">
      <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1400&q=80" alt="Up-country route" style="width: 100%; height: 400px; object-fit: cover; display: block;">
    </sc-if>
    <button onClick="{{ galleryPrev }}" style="position: absolute; left: 18px; top: 50%; transform: translateY(-50%); width: 46px; height: 46px; border: 2px solid #1F3A38; background: #F7F1E6; font-family: var(--tz-mono); font-size: 17px; cursor: pointer; box-shadow: 3px 3px 0 #1F3A38;">←</button>
    <button onClick="{{ galleryNext }}" style="position: absolute; right: 18px; top: 50%; transform: translateY(-50%); width: 46px; height: 46px; border: 2px solid #1F3A38; background: #F7F1E6; font-family: var(--tz-mono); font-size: 17px; cursor: pointer; box-shadow: 3px 3px 0 #1F3A38;">→</button>
    <div style="position: absolute; left: 0; right: 0; bottom: 14px; display: flex; justify-content: center; gap: 8px;">
      <sc-for list="{{ galleryDots }}" as="g" hint-placeholder-count="4">
        <button onClick="{{ g.go }}" style="width: 12px; height: 12px; border: 2px solid #F7F1E6; background: {{ g.bg }}; cursor: pointer; padding: 0;"></button>
      </sc-for>
    </div>
    <span style="position: absolute; top: 14px; right: 18px; font-family: var(--tz-mono); font-size: 11px; background: rgba(20,32,31,0.7); color: #F7F1E6; padding: 5px 10px;">{{ galleryCount }}</span>
  </section>

  <!-- Body -->
  <section class="tw-2col" style="max-width: 1200px; margin: 0 auto; padding: 48px 24px; display: grid; grid-template-columns: 1.4fr 0.85fr; gap: 56px; align-items: start;">

    <!-- Left -->
    <div>
      <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em;">[Kuhusu — about]</div>
      <p style="font-size: 17px; line-height: 1.6; margin: 12px 0 0;">
        <em style="font-family: var(--tz-serif);">"The roads to the village don't scare us."</em> Ten years driving Kampala, Jinja, Mbale and everywhere the tarmac ends. Clean Land Cruiser and Hilux fleet, patient drivers, flight tracking for late arrivals, and honest quotes — fuel spelled out, no surprises.
      </p>

      <!-- Services -->
      <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em; margin-top: 36px;">[Huduma — services &amp; guide rates]</div>
      <div style="border: 2px solid #1F3A38; margin-top: 12px;">
        <sc-for list="{{ services }}" as="sv" hint-placeholder-count="4">
          <div style="display: grid; grid-template-columns: 40px 1fr auto; gap: 16px; padding: 16px 18px; border-bottom: 1px solid #E3D9C6; align-items: center; background: #FFFDF8;">
            <span style="font-family: var(--tz-mono); font-size: 13px; color: #D97A3B;">({{ sv.num }})</span>
            <div>
              <div style="font-family: var(--tz-display); font-size: 17px; text-transform: uppercase;">{{ sv.title }}</div>
              <div style="font-size: 13px; color: #6E6155; margin-top: 2px;">{{ sv.desc }}</div>
            </div>
            <span style="font-family: var(--tz-display); font-size: 16px; color: #A85A23; white-space: nowrap;">{{ sv.rate }}</span>
          </div>
        </sc-for>
      </div>
      <div style="font-size: 12px; color: #6E6155; margin-top: 8px;">Guide rates — final quotes come as offers on your posted need. 5–7% platform fee applies only when money moves through Twendezetu.</div>

      <!-- Reviews -->
      <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-top: 36px; flex-wrap: wrap;">
        <span style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em;">[Maoni — reviews]</span>
        <button onClick="{{ toggleWrite }}" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: {{ writeBg }}; color: {{ writeFg }}; padding: 9px 14px; cursor: pointer;">{{ writeLabel }}</button>
      </div>

      <!-- Rating summary + breakdown -->
      <div class="tw-2col" style="display: grid; grid-template-columns: 200px 1fr; gap: 24px; border: 2px solid #1F3A38; background: #FFFDF8; padding: 20px 22px; margin-top: 12px; align-items: center;">
        <div style="text-align: center; border-right: 2px solid #E3D9C6;">
          <div style="font-family: var(--tz-display); font-size: 52px; line-height: 1;">{{ avgRating }}</div>
          <div style="font-family: var(--tz-mono); font-size: 13px; color: #A85A23;">★★★★★</div>
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155; margin-top: 4px;">{{ reviewCount }} reviews</div>
        </div>
        <div style="display: grid; gap: 6px;">
          <sc-for list="{{ breakdown }}" as="b" hint-placeholder-count="5">
            <div style="display: grid; grid-template-columns: 30px 1fr 34px; gap: 10px; align-items: center;">
              <span style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">{{ b.stars }}★</span>
              <div style="height: 10px; border: 1px solid #1F3A38; background: #EFE7D6;"><div style="height: 100%; width: {{ b.pct }}; background: #D97A3B;"></div></div>
              <span style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155; text-align: right;">{{ b.count }}</span>
            </div>
          </sc-for>
        </div>
      </div>

      <!-- Write review form (gated) -->
      <sc-if value="{{ writeOpen }}" hint-placeholder-val="{{ false }}">
        <div style="border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 20px 22px; margin-top: 12px;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">[Andika maoni — you can review because booking #BK-5521 is marked complete]</div>
          <div style="display: flex; gap: 6px; margin: 14px 0;">
            <sc-for list="{{ starPicker }}" as="st" hint-placeholder-count="5">
              <button onClick="{{ st.pick }}" style="background: none; border: 0; cursor: pointer; font-size: 30px; line-height: 1; color: {{ st.color }};">★</button>
            </sc-for>
          </div>
          <select onChange="{{ setJob }}" style="border: 2px solid rgba(247,241,230,0.4); background: #14201F; color: #F7F1E6; padding: 11px 14px; font-family: var(--tz-sans); font-size: 13.5px; outline: none; width: 100%; box-sizing: border-box; margin-bottom: 10px;">
            <option>Which job? — Up-country, 2 days (Sep)</option><option>Airport pickup (Sep)</option><option>Wedding convoy (Oct)</option>
          </select>
          <textarea rows="3" value="{{ draft }}" onChange="{{ setDraft }}" placeholder="How was it? Be specific — future customers rely on you." style="width: 100%; box-sizing: border-box; border: 2px solid rgba(247,241,230,0.4); background: rgba(247,241,230,0.06); color: #F7F1E6; padding: 12px 14px; font-family: var(--tz-sans); font-size: 14px; outline: none; resize: vertical;"></textarea>
          <div style="display: flex; gap: 8px; margin-top: 12px;">
            <button onClick="{{ submitReview }}" style="font-family: var(--tz-display); font-size: 14px; text-transform: uppercase; background: #D97A3B; color: #14201F; border: 0; padding: 11px 22px; cursor: pointer;">Post review</button>
            <button onClick="{{ toggleWrite }}" style="font-family: var(--tz-mono); font-size: 11.5px; border: 1px solid rgba(247,241,230,0.5); background: none; color: #F7F1E6; padding: 11px 16px; cursor: pointer;">CANCEL</button>
          </div>
          <sc-if value="{{ reviewError }}" hint-placeholder-val="{{ false }}">
            <div style="font-size: 12px; color: #E8A472; margin-top: 8px;">{{ reviewError }}</div>
          </sc-if>
        </div>
      </sc-if>

      <div style="display: grid; gap: 12px; margin-top: 12px;">
        <sc-for list="{{ reviews }}" as="rv" hint-placeholder-count="3">
          <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 18px 20px;">
            <div style="display: flex; justify-content: space-between; gap: 12px; font-family: var(--tz-mono); font-size: 11.5px;">
              <span style="color: #A85A23;">{{ rv.stars }} · {{ rv.job }}</span>
              <span style="color: #6E6155;">{{ rv.when }}</span>
            </div>
            <p style="font-size: 14.5px; line-height: 1.55; margin: 10px 0 6px;">{{ rv.body }}</p>
            <div style="font-size: 12.5px; color: #6E6155;">— {{ rv.who }}</div>
            <sc-if value="{{ rv.reply }}" hint-placeholder-val="{{ false }}">
              <div style="border-left: 3px solid #D97A3B; background: #EFE7D6; padding: 10px 14px; margin-top: 12px;">
                <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #A85A23;">↳ KATO 4X4 REPLIED</div>
                <div style="font-size: 13px; color: #3A2F25; line-height: 1.5; margin-top: 4px;">{{ rv.reply }}</div>
              </div>
            </sc-if>
          </div>
        </sc-for>
      </div>
    </div>

    <!-- Right: request card -->
    <aside class="tw-sticky" style="position: sticky; top: 100px; display: grid; gap: 16px;">
      <div style="border: 2px solid #1F3A38; background: #FFFDF8; box-shadow: 6px 6px 0 #1F3A38; padding: 22px;">
        <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; letter-spacing: 0.08em;">[Omba huduma — request]</div>
        <div style="font-family: var(--tz-display); font-size: 24px; text-transform: uppercase; margin: 8px 0 4px;">Book Kato for your dates</div>
        <p style="font-size: 13px; color: #6E6155; line-height: 1.5; margin: 0 0 14px;">Your contacts stay masked. Kato sees the job, not your phone number — until you accept.</p>
        <div style="display: grid; gap: 10px;">
          <input type="date" value="2026-09-12" style="border: 2px solid #1F3A38; background: #F7F1E6; padding: 12px 14px; font-family: var(--tz-sans); font-size: 14px; outline: none;">
          <input placeholder="Where to? e.g. Kampala → Jinja" style="border: 2px solid #1F3A38; background: #F7F1E6; padding: 12px 14px; font-family: var(--tz-sans); font-size: 14px; outline: none;">
          <a href="/create-event" style="font-family: var(--tz-display); font-size: 16px; text-transform: uppercase; background: #D97A3B; color: #1F3A38; border: 2px solid #1F3A38; padding: 14px; text-align: center; text-decoration: none; box-shadow: 4px 4px 0 #1F3A38;">Request via platform →</a>
          <button onClick="{{ toggleAsk }}" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: {{ askBg }}; padding: 11px; cursor: pointer;">✉ ASK A QUESTION FIRST</button>
          <sc-if value="{{ askOpen }}" hint-placeholder-val="{{ false }}">
            <div style="display: grid; gap: 8px; border-top: 1px dashed #C9BFB1; padding-top: 12px;">
              <textarea rows="3" value="{{ question }}" onChange="{{ setQuestion }}" placeholder="e.g. Can the Land Cruiser handle the road past Mbale after rain?" style="border: 2px solid #1F3A38; background: #F7F1E6; padding: 11px 13px; font-family: var(--tz-sans); font-size: 13.5px; outline: none; resize: vertical;"></textarea>
              <button onClick="{{ sendAsk }}" style="font-family: var(--tz-mono); font-size: 12px; background: #1F3A38; color: #F7F1E6; border: 2px solid #1F3A38; padding: 11px; cursor: pointer;">SEND — MASKED THREAD OPENS →</button>
            </div>
          </sc-if>
        </div>
      </div>

      <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 20px 22px;">
        <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; letter-spacing: 0.08em;">[Share this provider]</div>
        <div style="display: flex; border: 2px solid #1F3A38; margin-top: 10px;">
          <input value="twende.to/p/kato-4x4" readOnly style="flex: 1; min-width: 0; border: 0; background: #EFE7D6; font-family: var(--tz-mono); font-size: 12px; padding: 10px 12px; outline: none;">
          <button onClick="{{ copyLink }}" style="border: 0; border-left: 2px solid #1F3A38; background: #D97A3B; font-family: var(--tz-mono); font-size: 11px; padding: 0 14px; cursor: pointer;">{{ copyLabel }}</button>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 10px;">
          <button onClick="{{ shareWa }}" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px; font-family: var(--tz-mono); font-size: 11.5px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 10px; cursor: pointer;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WHATSAPP
          </button>
          <button onClick="{{ shareFb }}" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px; font-family: var(--tz-mono); font-size: 11.5px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 10px; cursor: pointer;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            FACEBOOK
          </button>
          <button onClick="{{ shareX }}" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px; font-family: var(--tz-mono); font-size: 11.5px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 10px; cursor: pointer;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#14201F"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            X
          </button>
        </div>
      </div>

      <div style="border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 20px 22px;">
        <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">[Verified member]</div>
        <div style="font-size: 13.5px; line-height: 1.55; margin-top: 8px; color: rgba(247,241,230,0.85);">Active 12-month membership · ID verified · payments protected when booked through the platform.</div>
      </div>
    </aside>
  </section>

  <!-- More providers carousel -->
  <section style="border-top: 2px solid #1F3A38; background: #EFE7D6; padding: 48px 0 56px;">
    <div style="max-width: 1200px; margin: 0 auto; padding: 0 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
        <div>
          <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em;">[Watoa huduma wengine — more providers]</div>
          <h2 style="font-family: var(--tz-display); font-size: 32px; text-transform: uppercase; margin: 6px 0 0;">Browse the directory<span style="color: #D97A3B;">.</span></h2>
        </div>
        <div style="display: flex; gap: 8px;">
          <button onClick="{{ dirPrev }}" style="width: 46px; height: 46px; border: 2px solid #1F3A38; background: #FFFDF8; font-family: var(--tz-mono); font-size: 17px; cursor: pointer; box-shadow: 3px 3px 0 #1F3A38;">←</button>
          <button onClick="{{ dirNext }}" style="width: 46px; height: 46px; border: 2px solid #1F3A38; background: #FFFDF8; font-family: var(--tz-mono); font-size: 17px; cursor: pointer; box-shadow: 3px 3px 0 #1F3A38;">→</button>
        </div>
      </div>
      <div style="overflow: hidden;">
        <div style="display: flex; gap: 18px; transform: translateX({{ dirOffset }}); transition: transform 300ms ease;">
          <sc-for list="{{ directory }}" as="pv" hint-placeholder-count="0">
            <a href="{{ pv.href }}" style="flex: 0 0 300px; border: 2px solid #1F3A38; background: #FFFDF8; text-decoration: none; color: #14201F; display: block;" style-hover="box-shadow: 5px 5px 0 #D97A3B;">
              <div style="position: relative;">
                <div role="img" aria-label="{{ pv.name }}" style="background-image: url('{{ pv.img }}'); background-size: cover; background-position: center; width: 100%; height: 160px; border-bottom: 2px solid #1F3A38; background-color: #EFE7D6;"></div>
                <span style="position: absolute; top: 10px; left: 10px; background: #F7F1E6; border: 2px solid #1F3A38; font-family: var(--tz-mono); font-size: 10px; padding: 3px 8px;">{{ pv.cat }}</span>
              </div>
              <div style="padding: 14px 16px;">
                <div style="font-family: var(--tz-display); font-size: 18px; text-transform: uppercase;">{{ pv.name }}</div>
                <div style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155; margin-top: 4px;">★ {{ pv.rating }} · {{ pv.jobs }} JOBS · {{ pv.city }}</div>
                <div style="font-size: 13px; color: #3A2F25; line-height: 1.5; margin-top: 8px;">{{ pv.desc }}</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
                  <span style="font-family: var(--tz-display); font-size: 15px; color: #A85A23;">{{ pv.rate }}</span>
                  <span style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #1F3A38; background: #D97A3B; padding: 8px 14px;">VIEW →</span>
                </div>
              </div>
            </a>
          </sc-for>
        </div>
      </div>
    </div>
  </section>


  <!-- Footer -->
  <footer style="background: #1F3A38; color: #F7F1E6; padding: 32px 24px 0; overflow: hidden; border-top: 2px solid #1F3A38;">
    <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; padding-bottom: 24px; font-size: 14px; flex-wrap: wrap; gap: 12px;">
      <span style="color: rgba(247,241,230,0.75);">PROVIDERS: LIST YOUR SERVICE — 12-MONTH MEMBERSHIP</span>
      <a href="/sign-in" style="color: #E8A472;">Join as a provider →</a>
    </div>
    <div style="font-family: var(--tz-display); font-size: clamp(56px, 11vw, 180px); text-transform: uppercase; line-height: 0.78; text-align: center; transform: translateY(12%);">KATO 4X4</div>
  </footer>
</div>
`;

export default template;
