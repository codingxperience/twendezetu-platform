// Markup for the provider page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh;">

  <!-- Header -->
  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 18px 24px; border-bottom: 2px solid #1F3A38; background: #F7F1E6; position: sticky; top: 0; z-index: 40;">
    <div style="display: flex; align-items: center; gap: 36px;">
      <a href="/" class="tz-logo-link" aria-label="Twendezetu home"><img src="/brand/logo.png" alt="Twendezetu" width="1211" height="229" class="tz-logo tz-logo--md"></a>
      <nav class="tw-nav" style="display: flex; gap: 24px; font-size: 14px; font-weight: 500;">
        <a href="/events" style="color: #6E6155; text-decoration: none;">Events</a>
        <a href="/vendors" style="color: #6E6155; text-decoration: none;">Directory</a>
        <a href="/create-event" style="color: #6E6155; text-decoration: none;">Post an event or need</a>
        <a href="/provider-dashboard" style="color: #6E6155; text-decoration: none;">For vendors</a>
      </nav>
    </div>
    <a href="{{ accountHref }}" style="font-family: var(--tz-mono); font-size: 13px; background: #1F3A38; color: #F7F1E6; text-decoration: none; padding: 12px 20px; box-shadow: 4px 4px 0 #E9B4AC;">{{ accountLabel }}</a>
  </header>

  <!-- Public-listing orientation -->
  <div style="background: #EFE7D6; border-bottom: 2px solid #1F3A38; padding: 9px 24px;">
    <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; font-family: var(--tz-mono); font-size: 11.5px; color: #6E6155;">
      <span>{{ orientation }}</span>
      <a href="/provider-dashboard" style="color: #820101; text-decoration: none; white-space: nowrap;">{{ orientationLink }}</a>
    </div>
  </div>

  <!-- Breadcrumb -->
  <div style="max-width: 1200px; margin: 0 auto; padding: 20px 24px 0; font-family: var(--tz-mono); font-size: 12px; color: #6E6155;">
    <a href="/vendors" style="color: #820101;">← Vendors</a> · <a href="{{ categoryHref }}" style="color: #6E6155;">{{ category }}</a> · {{ place }}
  </div>

  <!-- Title -->
  <section style="max-width: 1200px; margin: 0 auto; padding: 16px 24px 32px;">
    <div style="display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; flex-wrap: wrap;">
      <div>
        <h1 style="font-family: var(--tz-display); font-size: clamp(44px, 7vw, 92px); text-transform: uppercase; line-height: 0.92; margin: 0; max-width: 900px;">{{ name }}<span style="color: #820101;">.</span></h1>
        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 18px; font-family: var(--tz-mono); font-size: 12.5px; align-items: center;">
          <span style="background: #1F3A38; color: #F7F1E6; padding: 7px 13px;">{{ ratingChip }}</span>
          <span style="border: 2px solid #1F3A38; padding: 5px 13px;">{{ areasLabel }}</span>
          <span style="border: 2px solid #1F3A38; padding: 5px 13px;">{{ memberChip }}</span>
          <sc-if value="{{ response }}"><span style="background: #820101; border: 2px solid #1F3A38; color: #F7F1E6; padding: 5px 13px;">{{ response }}</span></sc-if>
          <sc-if value="{{ canFollow }}"><button onClick="{{ toggleFollow }}" aria-pressed="{{ following }}" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: {{ followBg }}; color: {{ followFg }}; padding: 6px 13px; cursor: pointer;">{{ followLabel }}</button></sc-if>
        </div>
      </div>
      <div style="font-family: var(--tz-mono); font-size: 12px; color: #6E6155; text-align: right; line-height: 1.6; max-width: 360px;">{{ headline }}</div>
    </div>
  </section>

  <!-- Gallery carousel -->
  <section style="border-top: 2px solid #1F3A38; border-bottom: 2px solid #1F3A38; background: #14201F; position: relative;">
    <img src="{{ galleryImg }}" alt="{{ galleryAlt }}" style="width: 100%; height: 400px; object-fit: cover; display: block;">
    <sc-if value="{{ galleryMany }}">
    <button onClick="{{ galleryPrev }}" aria-label="Previous photo" style="position: absolute; left: 18px; top: 50%; transform: translateY(-50%); width: 46px; height: 46px; border: 2px solid #1F3A38; background: #F7F1E6; font-family: var(--tz-mono); font-size: 17px; cursor: pointer; box-shadow: 3px 3px 0 #1F3A38;">←</button>
    <button onClick="{{ galleryNext }}" aria-label="Next photo" style="position: absolute; right: 18px; top: 50%; transform: translateY(-50%); width: 46px; height: 46px; border: 2px solid #1F3A38; background: #F7F1E6; font-family: var(--tz-mono); font-size: 17px; cursor: pointer; box-shadow: 3px 3px 0 #1F3A38;">→</button>
    <div style="position: absolute; left: 0; right: 0; bottom: 14px; display: flex; justify-content: center; gap: 8px;">
      <sc-for list="{{ galleryDots }}" as="g" hint-placeholder-count="4">
        <button onClick="{{ g.go }}" aria-label="{{ g.label }}" style="width: 12px; height: 12px; border: 2px solid #F7F1E6; background: {{ g.bg }}; cursor: pointer; padding: 0;"></button>
      </sc-for>
    </div>
    <span style="position: absolute; top: 14px; right: 18px; font-family: var(--tz-mono); font-size: 11px; background: rgba(20,32,31,0.7); color: #F7F1E6; padding: 5px 10px;">{{ galleryCount }}</span>
    </sc-if>
  </section>

  <!-- Body -->
  <section class="tw-2col" style="max-width: 1200px; margin: 0 auto; padding: 48px 24px; display: grid; grid-template-columns: 1.4fr 0.85fr; gap: 56px; align-items: start;">

    <!-- Left -->
    <div>
      <div style="font-family: var(--tz-mono); font-size: 12px; color: #820101; letter-spacing: 0.08em;">[Kuhusu — about]</div>
      <p style="font-size: 17px; line-height: 1.6; margin: 12px 0 0; white-space: pre-line;">{{ description }}</p>

      <!-- Services -->
      <div style="font-family: var(--tz-mono); font-size: 12px; color: #820101; letter-spacing: 0.08em; margin-top: 36px;">[Huduma — services &amp; guide rates]</div>
      <div style="border: 2px solid #1F3A38; margin-top: 12px;">
        <sc-for list="{{ services }}" as="sv" hint-placeholder-count="4">
          <div style="display: grid; grid-template-columns: 40px 1fr auto; gap: 16px; padding: 16px 18px; border-bottom: 1px solid #E3D9C6; align-items: center; background: #FFFDF8;">
            <span style="font-family: var(--tz-mono); font-size: 13px; color: #820101;">({{ sv.num }})</span>
            <div>
              <div style="font-family: var(--tz-display); font-size: 17px; text-transform: uppercase;">{{ sv.title }}</div>
              <div style="font-size: 13px; color: #6E6155; margin-top: 2px;">{{ sv.desc }}</div>
            </div>
            <span style="font-family: var(--tz-display); font-size: 16px; color: #820101; white-space: nowrap;">{{ sv.rate }}</span>
          </div>
        </sc-for>
      </div>
      <div style="font-size: 12px; color: #6E6155; margin-top: 8px;">{{ feeNote }}</div>

      <!-- Reviews -->
      <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-top: 36px; flex-wrap: wrap;">
        <span style="font-family: var(--tz-mono); font-size: 12px; color: #820101; letter-spacing: 0.08em;">[Maoni — reviews]</span>
        <sc-if value="{{ canReview }}"><button onClick="{{ toggleWrite }}" aria-expanded="{{ writeOpen }}" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: {{ writeBg }}; color: {{ writeFg }}; padding: 9px 14px; cursor: pointer;">{{ writeLabel }}</button></sc-if>
      </div>

      <!-- Rating summary + breakdown -->
      <div class="tw-2col" style="display: grid; grid-template-columns: 200px 1fr; gap: 24px; border: 2px solid #1F3A38; background: #FFFDF8; padding: 20px 22px; margin-top: 12px; align-items: center;">
        <div style="text-align: center; border-right: 2px solid #E3D9C6;">
          <div style="font-family: var(--tz-display); font-size: 52px; line-height: 1;">{{ avgRating }}</div>
          <div style="font-family: var(--tz-mono); font-size: 13px; color: #820101;" aria-hidden="true">{{ avgStars }}</div>
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155; margin-top: 4px;">{{ reviewCountLabel }}</div>
        </div>
        <div style="display: grid; gap: 6px;">
          <sc-for list="{{ breakdown }}" as="b" hint-placeholder-count="5">
            <div style="display: grid; grid-template-columns: 30px 1fr 34px; gap: 10px; align-items: center;">
              <span style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">{{ b.stars }}★</span>
              <div style="height: 10px; border: 1px solid #1F3A38; background: #EFE7D6;"><div style="height: 100%; width: {{ b.pct }}; background: #820101; color: #F7F1E6;"></div></div>
              <span style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155; text-align: right;">{{ b.count }}</span>
            </div>
          </sc-for>
        </div>
      </div>

      <!-- Write review form (gated) -->
      <sc-if value="{{ writeOpen }}" hint-placeholder-val="{{ false }}">
        <div style="border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 20px 22px; margin-top: 12px;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #E9B4AC; letter-spacing: 0.08em;">[Andika maoni — {{ reviewBecause }}]</div>
          <div style="display: flex; gap: 6px; margin: 14px 0;">
            <sc-for list="{{ starPicker }}" as="st" hint-placeholder-count="5">
              <button onClick="{{ st.pick }}" aria-label="{{ st.label }}" style="background: none; border: 0; cursor: pointer; font-size: 30px; line-height: 1; color: {{ st.color }};">★</button>
            </sc-for>
          </div>
          <sc-if value="{{ manyJobs }}">
          <select value="{{ jobId }}" onChange="{{ setJob }}" aria-label="Which job" style="border: 2px solid rgba(247,241,230,0.4); background: #14201F; color: #F7F1E6; padding: 11px 14px; font-family: var(--tz-sans); font-size: 13.5px; outline: none; width: 100%; box-sizing: border-box; margin-bottom: 10px;">
            <sc-for list="{{ reviewJobs }}" as="j"><option value="{{ j.id }}">{{ j.label }}</option></sc-for>
          </select>
          </sc-if>
          <textarea rows="3" value="{{ draft }}" onChange="{{ setDraft }}" maxlength="1200" aria-label="Your review" placeholder="How was it? Be specific — future customers rely on you." style="width: 100%; box-sizing: border-box; border: 2px solid rgba(247,241,230,0.4); background: rgba(247,241,230,0.06); color: #F7F1E6; padding: 12px 14px; font-family: var(--tz-sans); font-size: 14px; outline: none; resize: vertical;"></textarea>
          <div style="display: flex; gap: 8px; margin-top: 12px;">
            <button onClick="{{ submitReview }}" aria-busy="{{ postingReview }}" style="font-family: var(--tz-display); font-size: 14px; text-transform: uppercase; background: #820101; color: #F7F1E6; border: 0; padding: 11px 22px; cursor: pointer;">Post review</button>
            <button onClick="{{ toggleWrite }}" style="font-family: var(--tz-mono); font-size: 11.5px; border: 1px solid rgba(247,241,230,0.5); background: none; color: #F7F1E6; padding: 11px 16px; cursor: pointer;">CANCEL</button>
          </div>
          <sc-if value="{{ reviewError }}" hint-placeholder-val="{{ false }}">
            <div style="font-size: 12px; color: #E9B4AC; margin-top: 8px;">{{ reviewError }}</div>
          </sc-if>
        </div>
      </sc-if>

      <div style="display: grid; gap: 12px; margin-top: 12px;">
        <sc-if value="{{ noReviews }}"><div style="border: 2px dashed #1F3A38; padding: 16px 18px; font-size: 13.5px; color: #6E6155;">No reviews yet. Reviews on Twendezetu only come from completed bookings.</div></sc-if>
        <sc-for list="{{ reviews }}" as="rv" hint-placeholder-count="3">
          <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 18px 20px;">
            <div style="display: flex; justify-content: space-between; gap: 12px; font-family: var(--tz-mono); font-size: 11.5px;">
              <span style="color: #820101;">{{ rv.stars }} · {{ rv.job }}</span>
              <span style="color: #6E6155;">{{ rv.when }}</span>
            </div>
            <p style="font-size: 14.5px; line-height: 1.55; margin: 10px 0 6px;">{{ rv.body }}</p>
            <div style="font-size: 12.5px; color: #6E6155;">— {{ rv.who }}</div>
            <sc-if value="{{ rv.reply }}" hint-placeholder-val="{{ false }}">
              <div style="border-left: 3px solid #820101; background: #EFE7D6; padding: 10px 14px; margin-top: 12px;">
                <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #820101;">↳ {{ nameUpper }} REPLIED</div>
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
        <div style="font-family: var(--tz-mono); font-size: 11px; color: #820101; letter-spacing: 0.08em;">[Omba huduma — request]</div>
        <div style="font-family: var(--tz-display); font-size: 24px; text-transform: uppercase; margin: 8px 0 4px;">Ask {{ name }} for a quote</div>
        <p style="font-size: 13px; color: #6E6155; line-height: 1.5; margin: 0 0 14px;">Your contacts stay masked. {{ name }} sees the job, not your phone number or email.</p>
        <sc-if value="{{ reqDone }}">
          <div role="status" style="border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 14px 16px;">
            <div style="font-family: var(--tz-display); font-size: 16px; text-transform: uppercase;">✓ Request sent</div>
            <div style="font-size: 12.5px; color: rgba(247,241,230,0.82); line-height: 1.5; margin-top: 6px;">{{ reqDoneNote }}</div>
          </div>
        </sc-if>
        <sc-if value="{{ reqNotDone }}">
        <div style="display: grid; gap: 10px;">
          <input type="date" value="{{ reqDate }}" onChange="{{ setReqDate }}" aria-label="When" style="border: 2px solid #1F3A38; background: #F7F1E6; padding: 12px 14px; font-family: var(--tz-sans); font-size: 14px; outline: none;">
          <textarea rows="3" value="{{ reqMsg }}" onChange="{{ setReqMsg }}" maxlength="2000" aria-label="What you need" placeholder="{{ reqPlaceholder }}" style="border: 2px solid #1F3A38; background: #F7F1E6; padding: 12px 14px; font-family: var(--tz-sans); font-size: 14px; outline: none; resize: vertical;"></textarea>
          <sc-if value="{{ me.signedOut }}">
            <input value="{{ reqName }}" onChange="{{ setReqName }}" autocomplete="name" aria-label="Your name" placeholder="Your name" style="border: 2px solid #1F3A38; background: #F7F1E6; padding: 12px 14px; font-family: var(--tz-sans); font-size: 14px; outline: none;">
            <input type="email" value="{{ reqEmail }}" onChange="{{ setReqEmail }}" autocomplete="email" aria-label="Your email" placeholder="Email — replies come here, kept hidden" style="border: 2px solid #1F3A38; background: #F7F1E6; padding: 12px 14px; font-family: var(--tz-sans); font-size: 14px; outline: none;">
          </sc-if>
          <sc-if value="{{ reqError }}"><div role="alert" style="font-size: 12.5px; color: #B8463A;">{{ reqError }}</div></sc-if>
          <button onClick="{{ sendReq }}" aria-busy="{{ sendingReq }}" style="font-family: var(--tz-display); font-size: 16px; text-transform: uppercase; background: #820101; color: #F7F1E6; border: 2px solid #1F3A38; padding: 14px; text-align: center; cursor: pointer; box-shadow: 4px 4px 0 #1F3A38;">Send request →</button>
          <a href="/create-event?kind=need" style="font-family: var(--tz-mono); font-size: 11.5px; color: #820101; text-align: center;">or post a need and compare offers from several vendors</a>
        </div>
        </sc-if>
        <sc-if value="{{ me.signedIn }}">
          <button onClick="{{ toggleAsk }}" aria-expanded="{{ askOpen }}" style="width: 100%; margin-top: 10px; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: {{ askBg }}; padding: 11px; cursor: pointer;">✉ ASK A QUESTION FIRST</button>
          <sc-if value="{{ askOpen }}">
            <div style="display: grid; gap: 8px; border-top: 1px dashed #C9BFB1; padding-top: 12px; margin-top: 10px;">
              <textarea rows="3" value="{{ question }}" onChange="{{ setQuestion }}" maxlength="1000" aria-label="Your question" placeholder="{{ askPlaceholder }}" style="border: 2px solid #1F3A38; background: #F7F1E6; padding: 11px 13px; font-family: var(--tz-sans); font-size: 13.5px; outline: none; resize: vertical;"></textarea>
              <button onClick="{{ sendAsk }}" style="font-family: var(--tz-mono); font-size: 12px; background: #1F3A38; color: #F7F1E6; border: 2px solid #1F3A38; padding: 11px; cursor: pointer;">SEND — MASKED THREAD OPENS →</button>
            </div>
          </sc-if>
        </sc-if>
      </div>

      <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 20px 22px;">
        <div style="font-family: var(--tz-mono); font-size: 11px; color: #820101; letter-spacing: 0.08em;">[Share this vendor]</div>
        <div style="display: flex; border: 2px solid #1F3A38; margin-top: 10px;">
          <input value="{{ shareUrl }}" readOnly aria-label="Link to this vendor" style="flex: 1; min-width: 0; border: 0; background: #EFE7D6; font-family: var(--tz-mono); font-size: 12px; padding: 10px 12px; outline: none;">
          <button onClick="{{ copyLink }}" style="border: 0; border-left: 2px solid #1F3A38; background: #820101; font-family: var(--tz-mono); font-size: 11px; padding: 0 14px; cursor: pointer; color: #F7F1E6;">{{ copyLabel }}</button>
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
        <div style="font-family: var(--tz-mono); font-size: 11px; color: #E9B4AC; letter-spacing: 0.08em;">{{ trustTitle }}</div>
        <div style="font-size: 13.5px; line-height: 1.55; margin-top: 8px; color: rgba(247,241,230,0.85);">{{ trustText }}</div>
      </div>
    </aside>
  </section>

  <!-- More providers carousel -->
  <section style="border-top: 2px solid #1F3A38; background: #EFE7D6; padding: 48px 0 56px;">
    <div style="max-width: 1200px; margin: 0 auto; padding: 0 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
        <div>
          <div style="font-family: var(--tz-mono); font-size: 12px; color: #820101; letter-spacing: 0.08em;">[Watoa huduma wengine — more vendors]</div>
          <h2 style="font-family: var(--tz-display); font-size: 32px; text-transform: uppercase; margin: 6px 0 0;"><a href="{{ categoryHref }}" style="color: inherit; text-decoration: none;">More {{ category }}<span style="color: #820101;">.</span></a></h2>
        </div>
        <div style="display: flex; gap: 8px;">
          <button onClick="{{ dirPrev }}" aria-label="Previous vendors" style="width: 46px; height: 46px; border: 2px solid #1F3A38; background: #FFFDF8; font-family: var(--tz-mono); font-size: 17px; cursor: pointer; box-shadow: 3px 3px 0 #1F3A38;">←</button>
          <button onClick="{{ dirNext }}" aria-label="More vendors" style="width: 46px; height: 46px; border: 2px solid #1F3A38; background: #FFFDF8; font-family: var(--tz-mono); font-size: 17px; cursor: pointer; box-shadow: 3px 3px 0 #1F3A38;">→</button>
        </div>
      </div>
      <div style="overflow: hidden;">
        <div style="display: flex; gap: 18px; transform: translateX({{ dirOffset }}); transition: transform 300ms ease;">
          <sc-for list="{{ directory }}" as="pv" hint-placeholder-count="0">
            <a href="{{ pv.href }}" style="flex: 0 0 300px; border: 2px solid #1F3A38; background: #FFFDF8; text-decoration: none; color: #14201F; display: block;" style-hover="box-shadow: 5px 5px 0 #820101;">
              <div style="position: relative;">
                <img src="{{ pv.img }}" alt="" loading="lazy" style="width: 100%; height: 160px; object-fit: cover; display: block; border-bottom: 2px solid #1F3A38; background: #EFE7D6;">
                <span style="position: absolute; top: 10px; left: 10px; background: #F7F1E6; border: 2px solid #1F3A38; font-family: var(--tz-mono); font-size: 10px; padding: 3px 8px;">{{ pv.cat }}</span>
              </div>
              <div style="padding: 14px 16px;">
                <div style="font-family: var(--tz-display); font-size: 18px; text-transform: uppercase;">{{ pv.name }}</div>
                <div style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155; margin-top: 4px;">★ {{ pv.rating }} · {{ pv.jobs }} JOBS · {{ pv.city }}</div>
                <div style="font-size: 13px; color: #3A2F25; line-height: 1.5; margin-top: 8px;">{{ pv.desc }}</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
                  <span style="font-family: var(--tz-display); font-size: 15px; color: #820101;">{{ pv.rate }}</span>
                  <span style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #1F3A38; background: #820101; padding: 8px 14px; color: #F7F1E6;">VIEW →</span>
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
      <span style="color: rgba(247,241,230,0.75);">VENDORS: LIST YOUR SERVICE — 12-MONTH MEMBERSHIP</span>
      <a href="/provider-dashboard" style="color: #E9B4AC;">List your service →</a>
    </div>
    <div aria-hidden="true" style="font-family: var(--tz-display); font-size: clamp(56px, 11vw, 180px); text-transform: uppercase; line-height: 0.78; text-align: center; transform: translateY(12%); white-space: nowrap;">{{ footerName }}</div>
  </footer>
</div>
`;

export default template;
