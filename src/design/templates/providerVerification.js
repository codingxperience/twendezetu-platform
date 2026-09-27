// Markup for the providerVerification page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh;">

  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 18px 24px; border-bottom: 2px solid #1F3A38; background: #F7F1E6; position: sticky; top: 0; z-index: 40;">
    <div style="display: flex; align-items: center; gap: 24px;">
      <a href="/" style="text-decoration: none; color: #14201F; font-family: var(--tz-display); font-size: 26px; text-transform: uppercase; line-height: 0.9;">TWENDE<br><span style="color: #D97A3B;">ZETU</span></a>
      <span style="font-family: var(--tz-mono); font-size: 12px; background: #1F3A38; color: #F7F1E6; padding: 5px 10px;">VERIFICATION CENTER</span>
    </div>
    <div style="display: flex; gap: 12px; align-items: center;">
      <span role="status" style="font-family: var(--tz-mono); font-size: 11px; color: #4a7c4a;">{{ saveStamp }}</span>
      <a href="/provider-dashboard" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; color: #14201F; text-decoration: none; padding: 10px 16px;">SAVE &amp; EXIT →</a>
    </div>
  </header>

  <div class="tw-shell" style="max-width: 1240px; margin: 0 auto; display: grid; grid-template-columns: 280px 1fr; min-height: calc(100vh - 79px);">

    <!-- Section nav -->
    <aside class="tw-side" style="border-right: 2px solid #1F3A38; padding: 24px 0; display: flex; flex-direction: column; gap: 2px; position: sticky; top: 79px; align-self: start;">
      <div style="padding: 0 22px 14px;">
        <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; letter-spacing: 0.08em;">[PROGRESS — {{ pct }} COMPLETE]</div>
        <div style="height: 10px; border: 2px solid #1F3A38; background: #EFE7D6; margin-top: 8px;"><div style="height: 100%; width: {{ pct }}; background: #D97A3B; transition: width 300ms ease;"></div></div>
        <div style="font-size: 11.5px; color: #6E6155; margin-top: 8px; line-height: 1.5;">Every field autosaves. Close the tab, come back next week — you continue exactly here.</div>
      </div>
      <sc-if value="{{ statusBanner }}">
        <div style="margin: 0 22px 12px; border: 2px solid #1F3A38; background: {{ statusBg }}; color: {{ statusFg }}; padding: 12px 14px; font-size: 12.5px; line-height: 1.5;"><strong>{{ statusBanner }}</strong><sc-if value="{{ reviewNote }}"><br>{{ reviewNote }}</sc-if></div>
      </sc-if>
      <sc-for list="{{ navItems }}" as="n" hint-placeholder-count="6">
        <button onClick="{{ n.go }}" aria-current="{{ n.current }}" style="display: flex; justify-content: space-between; align-items: center; gap: 10px; text-align: left; background: {{ n.bg }}; color: {{ n.fg }}; border: 0; padding: 13px 22px; font-family: var(--tz-mono); font-size: 12px; letter-spacing: 0.04em; cursor: pointer; white-space: nowrap;">
          <span>{{ n.label }}</span>
          <span style="font-size: 10px; color: {{ n.chipColor }};">{{ n.chip }}</span>
        </button>
      </sc-for>
    </aside>

    <section style="padding: 32px 32px 80px; min-width: 0;">

      <!-- 1 BUSINESS INFO -->
      <sc-if value="{{ isBusiness }}" hint-placeholder-val="{{ true }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(28px, 4vw, 42px); text-transform: uppercase; margin: 0 0 6px;">Business information<span style="color: #D97A3B;">.</span></h1>
          <p style="font-size: 14px; color: #6E6155; margin: 0 0 24px;">Who you are and where you work. This is what the trust team checks first.</p>
          <div class="tw-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; max-width: 720px;">
            <label style="display: grid; gap: 6px;"><span style="font-family: var(--tz-mono); font-size: 11.5px; color: #A85A23;">BUSINESS / TRADING NAME *</span>
              <input value="{{ fBizName }}" onChange="{{ setBizName }}" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 12px 14px; font-family: var(--tz-sans); font-size: 14px; outline: none;"></label>
            <label style="display: grid; gap: 6px;"><span style="font-family: var(--tz-mono); font-size: 11.5px; color: #A85A23;">PRIMARY CATEGORY *</span>
              <select value="{{ fBizCat }}" onChange="{{ setBizCat }}" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 12px 14px; font-family: var(--tz-sans); font-size: 14px; outline: none;">
                <sc-for list="{{ categories }}" as="c"><option value="{{ c.label }}">{{ c.label }}</option></sc-for>
              </select></label>
            <label style="display: grid; gap: 6px;"><span style="font-family: var(--tz-mono); font-size: 11.5px; color: #A85A23;">CITIES SERVED *</span>
              <input value="{{ fBizCities }}" onChange="{{ setBizCities }}" placeholder="e.g. Kampala, Jinja, Entebbe" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 12px 14px; font-family: var(--tz-sans); font-size: 14px; outline: none;"></label>
            <label style="display: grid; gap: 6px;"><span style="font-family: var(--tz-mono); font-size: 11.5px; color: #A85A23;">YEARS OPERATING</span>
              <input value="{{ fBizYears }}" onChange="{{ setBizYears }}" inputmode="numeric" maxlength="2" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 12px 14px; font-family: var(--tz-sans); font-size: 14px; outline: none;"></label>
          </div>
          <label style="display: grid; gap: 6px; max-width: 720px; margin-top: 16px;"><span style="font-family: var(--tz-mono); font-size: 11.5px; color: #A85A23;">DESCRIBE YOUR SERVICE (SHOWN TO THE TRUST TEAM ONLY) *</span>
            <textarea rows="3" value="{{ fBizDesc }}" onChange="{{ setBizDesc }}" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 12px 14px; font-family: var(--tz-sans); font-size: 14px; outline: none; resize: vertical;"></textarea></label>
          <button onClick="{{ goIdentity }}" style="margin-top: 22px; font-family: var(--tz-display); font-size: 15px; text-transform: uppercase; background: #D97A3B; color: #1F3A38; border: 2px solid #1F3A38; padding: 12px 26px; cursor: pointer; box-shadow: 4px 4px 0 #1F3A38;">Continue → identity</button>
        </div>
      </sc-if>

      <!-- 2 IDENTITY -->
      <sc-if value="{{ isIdentity }}" hint-placeholder-val="{{ false }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(28px, 4vw, 42px); text-transform: uppercase; margin: 0 0 6px;">Identity<span style="color: #D97A3B;">.</span></h1>
          <p style="font-size: 14px; color: #6E6155; margin: 0 0 24px;">Government ID of the account owner. The number is encrypted, and the number and every document are deleted as soon as the trust team decides.</p>
          <div class="tw-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; max-width: 720px;">
            <label style="display: grid; gap: 6px;"><span style="font-family: var(--tz-mono); font-size: 11.5px; color: #A85A23;">LEGAL NAME (AS ON ID) *</span>
              <input value="{{ fIdName }}" onChange="{{ setIdName }}" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 12px 14px; font-family: var(--tz-sans); font-size: 14px; outline: none;"></label>
            <label style="display: grid; gap: 6px;"><span style="font-family: var(--tz-mono); font-size: 11.5px; color: #A85A23;">ID / PASSPORT NUMBER *</span>
              <input value="{{ fIdNumber }}" onChange="{{ setIdNumber }}" autocomplete="off" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 12px 14px; font-family: var(--tz-mono); font-size: 14px; outline: none;"></label>
          </div>
          <div style="display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap;">
            <label style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: {{ idBtnBg }}; padding: 12px 18px; cursor: pointer;">{{ idBtnLabel }}<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange="{{ uploadId }}" aria-label="Upload your ID" style="position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none;"></label>
            <span style="align-self: center; font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">NATIONAL ID · PASSPORT · DRIVING PERMIT — JPG, PNG OR PDF, UP TO 4 MB</span>
          </div>
          <button onClick="{{ goProof }}" style="margin-top: 22px; font-family: var(--tz-display); font-size: 15px; text-transform: uppercase; background: #D97A3B; color: #1F3A38; border: 2px solid #1F3A38; padding: 12px 26px; cursor: pointer; box-shadow: 4px 4px 0 #1F3A38;">Continue → business proof</button>
        </div>
      </sc-if>

      <!-- 3 PROOF -->
      <sc-if value="{{ isProof }}" hint-placeholder-val="{{ false }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(28px, 4vw, 42px); text-transform: uppercase; margin: 0 0 6px;">Business proof<span style="color: #D97A3B;">.</span></h1>
          <p style="font-size: 14px; color: #6E6155; margin: 0 0 24px;">Formal route (a document) or informal route (portfolio + references) — built for how East African businesses actually operate.</p>
          <div class="tw-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; max-width: 760px;">
            <button onClick="{{ pickFormal }}" aria-pressed="{{ isFormalRoute }}" style="text-align: left; border: 2px solid #1F3A38; background: {{ formalBg }}; color: {{ formalFg }}; padding: 20px; cursor: pointer;">
              <div style="font-family: var(--tz-display); font-size: 19px; text-transform: uppercase;">Formal — document</div>
              <div style="font-size: 12.5px; opacity: 0.8; margin-top: 4px; line-height: 1.5;">Trading licence, business permit, or TIN certificate.</div>
            </button>
            <button onClick="{{ pickInformal }}" aria-pressed="{{ isInformalRoute }}" style="text-align: left; border: 2px solid #1F3A38; background: {{ informalBg }}; color: {{ informalFg }}; padding: 20px; cursor: pointer;">
              <div style="font-family: var(--tz-display); font-size: 19px; text-transform: uppercase;">Informal — portfolio</div>
              <div style="font-size: 12.5px; opacity: 0.8; margin-top: 4px; line-height: 1.5;">5+ photos of past work + two reference contacts we call.</div>
            </button>
          </div>
          <sc-if value="{{ isFormalRoute }}" hint-placeholder-val="{{ true }}">
            <div style="display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap;">
              <label style="align-self: end; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: {{ proofBtnBg }}; padding: 12px 18px; cursor: pointer;">{{ proofBtnLabel }}<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange="{{ uploadProof }}" aria-label="Upload your business document" style="position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none;"></label>
              <label style="display: grid; gap: 6px; flex: 1; min-width: 220px;"><span style="font-family: var(--tz-mono); font-size: 11.5px; color: #A85A23;">LICENCE / TIN NUMBER</span>
                <input value="{{ fProofNum }}" onChange="{{ setProofNum }}" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 12px 14px; font-family: var(--tz-mono); font-size: 13px; outline: none;"></label>
            </div>
          </sc-if>
          <sc-if value="{{ isInformalRoute }}" hint-placeholder-val="{{ false }}">
            <div style="display: grid; gap: 12px; margin-top: 18px; max-width: 720px;">
              <label style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: {{ portBtnBg }}; padding: 12px 18px; cursor: pointer; text-align: left;">{{ portBtnLabel }}<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange="{{ uploadPortfolio }}" aria-label="Upload photos of past work" style="position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none;"></label>
              <div class="tw-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <input value="{{ fRef1 }}" onChange="{{ setRef1 }}" maxlength="160" aria-label="Reference 1" placeholder="Reference 1 — name & phone" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 12px 14px; font-family: var(--tz-sans); font-size: 13.5px; outline: none;">
                <input value="{{ fRef2 }}" onChange="{{ setRef2 }}" maxlength="160" aria-label="Reference 2" placeholder="Reference 2 — name & phone" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 12px 14px; font-family: var(--tz-sans); font-size: 13.5px; outline: none;">
              </div>
            </div>
          </sc-if>
          <button onClick="{{ goPhone }}" style="margin-top: 22px; font-family: var(--tz-display); font-size: 15px; text-transform: uppercase; background: #D97A3B; color: #1F3A38; border: 2px solid #1F3A38; padding: 12px 26px; cursor: pointer; box-shadow: 4px 4px 0 #1F3A38;">Continue → phone</button>
        </div>
      </sc-if>

      <!-- 4 PHONE -->
      <sc-if value="{{ isPhone }}" hint-placeholder-val="{{ false }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(28px, 4vw, 42px); text-transform: uppercase; margin: 0 0 6px;">Phone<span style="color: #D97A3B;">.</span></h1>
          <p style="font-size: 14px; color: #6E6155; margin: 0 0 24px;">The number that gets escrow alerts and security codes. It is never shown to customers.</p>
          <sc-if value="{{ otpIdle }}" hint-placeholder-val="{{ true }}">
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <input type="tel" value="{{ fPhone }}" onChange="{{ setPhone }}" autocomplete="tel" aria-label="Phone number" placeholder="+256 772 000 000" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 12px 14px; font-family: var(--tz-mono); font-size: 13px; outline: none;">
              <button onClick="{{ sendOtp }}" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 12px 18px; cursor: pointer;">SEND CODE VIA SMS</button>
            </div>
          </sc-if>
          <sc-if value="{{ otpSent }}" hint-placeholder-val="{{ false }}">
            <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
              <input placeholder="6-digit code" value="{{ otpValue }}" onChange="{{ setOtp }}" inputmode="numeric" autocomplete="one-time-code" maxlength="6" aria-label="Code from the text message" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 12px 14px; font-family: var(--tz-mono); font-size: 15px; letter-spacing: 0.3em; width: 130px; outline: none;">
              <button onClick="{{ checkOtp }}" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #D97A3B; padding: 12px 18px; cursor: pointer;">VERIFY</button>
              <button onClick="{{ resendOtp }}" style="background: none; border: 0; font-family: var(--tz-mono); font-size: 11px; color: #A85A23; cursor: pointer; text-decoration: underline;">USE ANOTHER NUMBER</button>
            </div>
            <div style="font-size: 12px; color: #6E6155; margin-top: 8px;">We texted a code to {{ fPhone }}. It works for 10 minutes.</div>
            <sc-if value="{{ otpError }}" hint-placeholder-val="{{ false }}">
              <div role="alert" style="font-size: 12px; color: #B8463A; margin-top: 8px;">✕ {{ otpError }}</div>
            </sc-if>
          </sc-if>
          <sc-if value="{{ otpDone }}" hint-placeholder-val="{{ false }}">
            <div style="font-family: var(--tz-mono); font-size: 12.5px; color: #4a7c4a;">✓ {{ fPhone }} VERIFIED</div>
          </sc-if>
          <button onClick="{{ goPayout }}" style="margin-top: 22px; font-family: var(--tz-display); font-size: 15px; text-transform: uppercase; background: #D97A3B; color: #1F3A38; border: 2px solid #1F3A38; padding: 12px 26px; cursor: pointer; box-shadow: 4px 4px 0 #1F3A38;">Continue → payout</button>
        </div>
      </sc-if>

      <!-- 5 PAYOUT -->
      <sc-if value="{{ isPayout }}" hint-placeholder-val="{{ false }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(28px, 4vw, 42px); text-transform: uppercase; margin: 0 0 6px;">Payout details<span style="color: #D97A3B;">.</span></h1>
          <p style="font-size: 14px; color: #6E6155; margin: 0 0 24px;">Where your earnings go when you withdraw. The number is encrypted, and it becomes a saved payout method when you submit.</p>
          <div style="display: grid; gap: 10px; max-width: 560px;">
            <sc-for list="{{ payoutOpts }}" as="po" hint-placeholder-count="3">
              <button onClick="{{ po.pick }}" aria-pressed="{{ po.selected }}" style="text-align: left; display: flex; justify-content: space-between; align-items: center; gap: 12px; border: 2px solid #1F3A38; background: {{ po.bg }}; color: {{ po.fg }}; padding: 16px 18px; cursor: pointer;">
                <div>
                  <div style="font-family: var(--tz-display); font-size: 16px; text-transform: uppercase;">{{ po.title }}</div>
                  <div style="font-size: 12px; opacity: 0.8; margin-top: 2px;">{{ po.desc }}</div>
                </div>
                <span style="font-family: var(--tz-mono); font-size: 10.5px; border: 1px solid currentColor; padding: 4px 8px;">{{ po.chip }}</span>
              </button>
            </sc-for>
            <label style="display: grid; gap: 6px;"><span style="font-family: var(--tz-mono); font-size: 11.5px; color: #A85A23;">ACCOUNT / NUMBER *</span>
              <input value="{{ fPayoutNum }}" onChange="{{ setPayoutNum }}" autocomplete="off" aria-label="Account or wallet number" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 12px 14px; font-family: var(--tz-mono); font-size: 13px; outline: none;"></label>
          </div>
          <button onClick="{{ goReview }}" style="margin-top: 22px; font-family: var(--tz-display); font-size: 15px; text-transform: uppercase; background: #D97A3B; color: #1F3A38; border: 2px solid #1F3A38; padding: 12px 26px; cursor: pointer; box-shadow: 4px 4px 0 #1F3A38;">Continue → review</button>
        </div>
      </sc-if>

      <!-- 6 REVIEW -->
      <sc-if value="{{ isReview }}" hint-placeholder-val="{{ false }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(28px, 4vw, 42px); text-transform: uppercase; margin: 0 0 6px;">Review &amp; submit<span style="color: #D97A3B;">.</span></h1>
          <p style="font-size: 14px; color: #6E6155; margin: 0 0 24px;">Everything below was autosaved as you went. Fix anything by clicking its section.</p>
          <div style="border: 2px solid #1F3A38; max-width: 720px;">
            <sc-for list="{{ reviewRows }}" as="rr" hint-placeholder-count="5">
              <button onClick="{{ rr.go }}" style="display: grid; grid-template-columns: 150px 1fr auto; gap: 14px; width: 100%; text-align: left; align-items: center; background: #FFFDF8; border: 0; border-bottom: 1px solid #E3D9C6; padding: 14px 18px; cursor: pointer;">
                <span style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23;">{{ rr.label }}</span>
                <span style="font-size: 13.5px; color: #3A2F25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ rr.value }}</span>
                <span style="font-family: var(--tz-mono); font-size: 10.5px; color: {{ rr.chipColor }};">{{ rr.chip }}</span>
              </button>
            </sc-for>
          </div>
          <button onClick="{{ submit }}" aria-busy="{{ submitting }}" style="margin-top: 22px; width: 100%; max-width: 720px; font-family: var(--tz-display); font-size: 16px; text-transform: uppercase; background: {{ submitBg }}; color: {{ submitFg }}; border: 2px solid #1F3A38; padding: 15px; cursor: pointer; box-shadow: 4px 4px 0 #D97A3B;">{{ submitLabel }}</button>
          <sc-if value="{{ submitted }}" hint-placeholder-val="{{ false }}">
            <div style="margin-top: 14px; max-width: 720px; border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 20px 22px;">
              <div style="font-family: var(--tz-display); font-size: 20px; text-transform: uppercase;">✓ Submitted — in review</div>
              <div style="font-size: 13.5px; color: rgba(247,241,230,0.8); line-height: 1.55; margin-top: 8px;">The trust team reviews applications in the order they arrive, and you are told the moment there is a decision. Keep answering leads meanwhile: the ✓ badge appears on your listing as soon as you are approved.</div>
            </div>
          </sc-if>
        </div>
      </sc-if>
    </section>
  </div>

</div>
`;

export default template;
