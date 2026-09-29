// Markup for the providerDetail page. Bindings are resolved by src/design/render.js.

import { SITE_HEADER, SITE_TABBAR } from './shell';

const template = `
<div class="tz-page" style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh;">

  <!-- Header -->
  ${SITE_HEADER}

  <!-- Guest banner -->
  <div style="background: #1F3A38; color: #F7F1E6; font-family: var(--tz-mono); font-size: 12px; padding: 10px 24px; text-align: center; line-height: 1.5;">
    No account needed to browse or request a quote — your phone and email stay <strong style="color: #E9B4AC;">masked</strong> until you choose to reveal them.
  </div>

  <div style="max-width: 1200px; margin: 0 auto; padding: 20px 24px 0; font-family: var(--tz-mono); font-size: 12px; color: #6E6155;">
    <a href="/vendors" style="color: #820101;">← Back to directory</a> · <a href="{{ categoryHref }}" style="color: #6E6155;">{{ category }}</a> · {{ place }}
  </div>

  <!-- Title -->
  <section style="max-width: 1200px; margin: 0 auto; padding: 16px 24px 24px;">
    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
      <h1 style="font-family: var(--tz-display); font-size: clamp(38px, 6vw, 80px); text-transform: uppercase; line-height: 0.92; margin: 0;">{{ name }}<span style="color: #820101;">.</span></h1>
      <sc-if value="{{ isVerified }}">
        <span style="font-family: var(--tz-mono); font-size: 11px; background: #1F3A38; color: #F7F1E6; padding: 6px 12px;">✓ ID VERIFIED</span>
      </sc-if>
      <sc-if value="{{ canFollow }}"><button onClick="{{ toggleFollow }}" aria-pressed="{{ following }}" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #1F3A38; background: {{ followBg }}; color: {{ followFg }}; padding: 6px 12px; cursor: pointer;">{{ followLabel }}</button></sc-if>
    </div>
    <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; font-family: var(--tz-mono); font-size: 13px;">
      <span style="background: #1F3A38; color: #F7F1E6; padding: 8px 14px;">{{ category }}</span>
      <span style="border: 2px solid #1F3A38; padding: 6px 14px;">{{ city }}</span>
      <span style="border: 2px solid #1F3A38; color: #820101; padding: 6px 14px;">{{ ratingChip }}</span>
      <sc-if value="{{ rate }}"><span style="background: #820101; border: 2px solid #1F3A38; color: #F7F1E6; padding: 6px 14px;">{{ rate }}</span></sc-if>
      <sc-if value="{{ response }}"><span style="border: 2px solid #1F3A38; padding: 6px 14px;">{{ response }}</span></sc-if>
    </div>
  </section>

  <!-- Hero + action card -->
  <section style="max-width: 1200px; margin: 0 auto; padding: 0 24px 40px;">
    <div class="tw-2col" style="display: grid; grid-template-columns: 1.5fr 0.9fr; gap: 40px; align-items: start;">
      <div>
        <img src="{{ img }}" alt="{{ name }}" style="width: 100%; aspect-ratio: 16/10; object-fit: cover; border: 2px solid #1F3A38; display: block; box-shadow: 6px 6px 0 #1F3A38;">
        <h2 style="font-family: var(--tz-display); font-size: 26px; text-transform: uppercase; margin: 32px 0 10px;">About<span style="color: #820101;">.</span></h2>
        <p style="font-size: 16px; line-height: 1.6; color: #3A2F25; max-width: 640px; white-space: pre-line;">{{ description }}</p>
        <sc-if value="{{ hasServices }}">
          <h2 style="font-family: var(--tz-display); font-size: 26px; text-transform: uppercase; margin: 30px 0 12px;">Services<span style="color: #820101;">.</span></h2>
          <div style="border: 2px solid #1F3A38; max-width: 640px;">
            <sc-for list="{{ services }}" as="sv">
              <div style="display: grid; grid-template-columns: 1fr auto; gap: 16px; padding: 14px 16px; border-bottom: 1px solid #E3D9C6; background: #FFFDF8; align-items: center;">
                <div><div style="font-weight: 700; font-size: 14.5px;">{{ sv.title }}</div><div style="font-size: 13px; color: #6E6155; margin-top: 2px;">{{ sv.desc }}</div></div>
                <span style="font-family: var(--tz-mono); font-size: 12.5px; color: #820101; white-space: nowrap;">{{ sv.rate }}</span>
              </div>
            </sc-for>
          </div>
        </sc-if>

        <!-- Reviews -->
        <h2 style="font-family: var(--tz-display); font-size: 26px; text-transform: uppercase; margin: 30px 0 12px;">Reviews<span style="color: #820101;">.</span></h2>
        <div style="display: grid; gap: 12px; max-width: 640px;">
          <sc-if value="{{ noReviews }}"><div style="border: 2px dashed #1F3A38; padding: 14px 16px; font-size: 13.5px; color: #6E6155;">No reviews yet. Reviews on Twendezetu only come from completed bookings.</div></sc-if>
          <sc-for list="{{ reviews }}" as="rv" hint-placeholder-count="3">
            <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 14px 16px;">
              <div style="display: flex; justify-content: space-between; gap: 10px; font-family: var(--tz-mono); font-size: 11px;">
                <span style="color: #820101;">{{ rv.stars }} · {{ rv.job }}</span>
                <span style="color: #6E6155;">{{ rv.who }}</span>
              </div>
              <div style="font-size: 14px; color: #3A2F25; line-height: 1.5; margin-top: 8px;">{{ rv.body }}</div>
            </div>
          </sc-for>
        </div>
      </div>

      <!-- Action card -->
      <aside class="tw-sticky" style="position: sticky; top: 92px;">
        <div style="border: 2px solid #1F3A38; background: #FFFDF8; box-shadow: 6px 6px 0 #1F3A38;">
          <div style="padding: 18px 20px; border-bottom: 2px solid #1F3A38;">
            <div style="font-family: var(--tz-display); font-size: 20px; text-transform: uppercase;">{{ rateOrAsk }}</div>
            <div style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155; margin-top: 2px;">{{ ratingChip }}</div>
          </div>
          <div style="padding: 18px 20px; display: grid; gap: 10px;">

            <!-- Request a quote (guest) -->
            <button onClick="{{ toggleReq }}" aria-expanded="{{ reqOpen }}" style="width: 100%; font-family: var(--tz-display); font-size: 16px; text-transform: uppercase; background: {{ reqBg }}; color: {{ reqFg }}; border: 2px solid #1F3A38; padding: 13px; cursor: pointer; box-shadow: 4px 4px 0 #820101;">{{ reqBtnLabel }}</button>
            <sc-if value="{{ reqOpen }}" hint-placeholder-val="{{ false }}">
              <sc-if value="{{ reqDone }}" hint-placeholder-val="{{ false }}">
                <div style="border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 14px 16px;">
                  <div style="font-family: var(--tz-display); font-size: 16px; text-transform: uppercase;">✓ Request sent</div>
                  <div style="font-size: 12.5px; color: rgba(247,241,230,0.82); line-height: 1.5; margin-top: 6px;">{{ reqDoneNote }}</div>
                </div>
              </sc-if>
              <sc-if value="{{ reqNotDone }}" hint-placeholder-val="{{ true }}">
                <div style="display: grid; gap: 8px;">
                  <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #820101;">[Request a service — masked, via platform]</div>
                  <sc-if value="{{ me.signedOut }}">
                  <input placeholder="Your name" autocomplete="name" aria-label="Your name" value="{{ reqName }}" onChange="{{ setReqName }}" style="border: 2px solid #1F3A38; background: #F7F1E6; padding: 10px 12px; font-family: var(--tz-sans); font-size: 13.5px; outline: none;">
                  <input type="email" placeholder="Email — replies come here, kept hidden" autocomplete="email" aria-label="Your email" value="{{ reqEmail }}" onChange="{{ setReqEmail }}" style="border: 2px solid #1F3A38; background: #F7F1E6; padding: 10px 12px; font-family: var(--tz-sans); font-size: 13.5px; outline: none;">
                  </sc-if>
                  <textarea rows="3" placeholder="What do you need? Dates, city, budget." aria-label="What you need" maxlength="2000" value="{{ reqMsg }}" onChange="{{ setReqMsg }}" style="border: 2px solid #1F3A38; background: #F7F1E6; padding: 10px 12px; font-family: var(--tz-sans); font-size: 13.5px; outline: none; resize: vertical;"></textarea>
                  <button onClick="{{ sendReq }}" aria-busy="{{ sendingReq }}" style="font-family: var(--tz-mono); font-size: 12px; background: #1F3A38; color: #F7F1E6; border: 2px solid #1F3A38; padding: 11px; cursor: pointer;">SEND REQUEST</button>
                  <sc-if value="{{ reqError }}" hint-placeholder-val="{{ false }}">
                    <div role="alert" style="font-size: 12px; color: #B8463A;">{{ reqError }}</div>
                  </sc-if>
                </div>
              </sc-if>
            </sc-if>

            <!-- Ask a question (guest) -->
            <sc-if value="{{ me.signedIn }}">
            <button onClick="{{ toggleAsk }}" aria-expanded="{{ askOpen }}" style="width: 100%; font-family: var(--tz-mono); font-size: 12px; background: {{ askBg }}; color: #14201F; border: 2px solid #1F3A38; padding: 11px; cursor: pointer;">✎ ASK A QUESTION</button>
            </sc-if>
            <sc-if value="{{ askOpen }}" hint-placeholder-val="{{ false }}">
              <div style="display: grid; gap: 8px;">
                <textarea rows="2" placeholder="Ask about availability, travel, pricing…" aria-label="Your question" maxlength="1000" value="{{ question }}" onChange="{{ setQuestion }}" style="border: 2px solid #1F3A38; background: #F7F1E6; padding: 10px 12px; font-family: var(--tz-sans); font-size: 13.5px; outline: none; resize: vertical;"></textarea>
                <button onClick="{{ sendAsk }}" style="font-family: var(--tz-mono); font-size: 12px; background: #820101; color: #F7F1E6; border: 2px solid #1F3A38; padding: 11px; cursor: pointer;">SEND QUESTION</button>
              </div>
            </sc-if>

            <!-- Share -->
            <div style="border-top: 2px solid #1F3A38; padding-top: 14px;">
              <div style="font-family: var(--tz-mono); font-size: 11px; color: #820101; letter-spacing: 0.08em; margin-bottom: 8px;">[Share this vendor]</div>
              <div style="display: flex; border: 2px solid #1F3A38; margin-bottom: 8px;">
                <input value="{{ shareUrl }}" readOnly aria-label="Link to this vendor" style="flex: 1; min-width: 0; border: 0; background: #EFE7D6; font-family: var(--tz-mono); font-size: 11.5px; padding: 10px 11px; outline: none;">
                <button onClick="{{ copyLink }}" style="border: 0; border-left: 2px solid #1F3A38; background: #820101; font-family: var(--tz-mono); font-size: 11px; padding: 0 12px; cursor: pointer; color: #F7F1E6;">{{ copyLabel }}</button>
              </div>
              <div style="display: flex; gap: 6px;">
                <a href="{{ waHref }}" target="_blank" rel="noopener" aria-label="Share on WhatsApp" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; font-family: var(--tz-mono); font-size: 10.5px; border: 2px solid #1F3A38; background: #FFFDF8; color: #14201F; padding: 9px; text-decoration: none;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
                <a href="{{ fbHref }}" target="_blank" rel="noopener" aria-label="Share on Facebook" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; font-family: var(--tz-mono); font-size: 10.5px; border: 2px solid #1F3A38; background: #FFFDF8; color: #14201F; padding: 9px; text-decoration: none;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Facebook
                </a>
                <a href="{{ emHref }}" aria-label="Share by email" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; font-family: var(--tz-mono); font-size: 10.5px; border: 2px solid #1F3A38; background: #FFFDF8; color: #14201F; padding: 9px; text-decoration: none;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1F3A38" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m2 6 10 7 10-7"></path></svg>
                  Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </section>

  <!-- Similar providers -->
  <section style="border-top: 2px solid #1F3A38; background: #EFE7D6; padding: 40px 24px;">
    <div style="max-width: 1200px; margin: 0 auto;">
      <div style="display: flex; align-items: baseline; gap: 10px; margin-bottom: 18px;">
        <h2 style="font-family: var(--tz-display); font-size: 28px; text-transform: uppercase; margin: 0;">More {{ category }}<span style="color: #820101;">.</span></h2>
        <span style="color: #820101; font-family: var(--tz-display); font-size: 22px;">›</span>
      </div>
      <div style="display: flex; gap: 16px; overflow-x: auto; padding-bottom: 8px;">
        <sc-for list="{{ similar }}" as="pv" hint-placeholder-count="6">
          <a href="{{ pv.href }}" style="flex: 0 0 230px; text-decoration: none; color: #14201F; background: #FFFDF8; border: 2px solid #1F3A38; display: flex; flex-direction: column;" style-hover="transform: translate(-3px,-3px); box-shadow: 5px 5px 0 #820101;">
            <img src="{{ pv.img }}" alt="{{ pv.name }}" style="width: 100%; height: 130px; object-fit: cover; display: block; border-bottom: 2px solid #1F3A38;">
            <div style="padding: 14px; display: flex; flex-direction: column; gap: 5px; flex: 1;">
              <div style="font-family: var(--tz-display); font-size: 17px; text-transform: uppercase; line-height: 1.05;">{{ pv.name }}</div>
              <div style="font-size: 12.5px; color: #6E6155;">{{ pv.city }} · ★ {{ pv.rating }}</div>
              <div style="margin-top: auto; font-family: var(--tz-mono); font-size: 12px; color: #820101;">{{ pv.rate }}</div>
            </div>
          </a>
        </sc-for>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer style="border-top: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 32px 24px;">
    <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px; align-items: center;">
      <a href="/" class="tz-logo-link" aria-label="Twendezetu home"><img src="/brand/logo-light.png" alt="Twendezetu" width="1211" height="229" class="tz-logo tz-logo--sm"></a>
      <div style="font-family: var(--tz-mono); font-size: 11px; color: rgba(247,241,230,0.7);">Masked contacts · Fees only when money moves</div>
    </div>
  </footer>
  ${SITE_TABBAR}
</div>
`;

export default template;
