// Markup for the settings page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh;">

  <!-- Header -->
  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 18px 24px; border-bottom: 2px solid #1F3A38; background: #F7F1E6; position: sticky; top: 0; z-index: 40;">
    <div style="display: flex; align-items: center; gap: 24px;">
      <a href="/" class="tz-logo-link" aria-label="Twendezetu home"><img src="/brand/logo.png" alt="Twendezetu" width="1211" height="229" class="tz-logo tz-logo--md"></a>
      <span style="font-family: var(--tz-mono); font-size: 12px; background: #1F3A38; color: #F7F1E6; padding: 5px 10px;">ACCOUNT SETTINGS</span>
    </div>
    <div style="display: flex; gap: 12px; align-items: center;">
      <a href="{{ backHref }}" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; color: #14201F; text-decoration: none; padding: 10px 16px;">← {{ backLabel }}</a>
      <button onClick="{{ signOut }}" style="background: none; border: 0; cursor: pointer; font-family: var(--tz-mono); font-size: 12px; color: #B8463A; text-decoration: underline;">SIGN OUT</button>
    </div>
  </header>

  <div class="tw-shell" style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 240px 1fr; gap: 0; min-height: calc(100vh - 79px);">

    <!-- Side nav -->
    <aside class="tw-side" style="border-right: 2px solid #1F3A38; padding: 28px 0; display: flex; flex-direction: column; gap: 2px; position: sticky; top: 79px; align-self: start;">
      <sc-for list="{{ navItems }}" as="n" hint-placeholder-count="4">
        <button onClick="{{ n.go }}" aria-current="{{ n.current }}" style="display: flex; align-items: center; gap: 12px; text-align: left; background: {{ n.bg }}; color: {{ n.fg }}; border: 0; padding: 14px 22px; font-family: var(--tz-mono); font-size: 12.5px; letter-spacing: 0.04em; cursor: pointer; white-space: nowrap;">
          <span style="width: 18px; display: inline-flex;">{{ n.icon }}</span>
          <span>{{ n.label }}</span>
        </button>
      </sc-for>
    </aside>

    <section style="padding: 36px 32px 80px; min-width: 0;">

      <!-- PROFILE -->
      <sc-if value="{{ isProfile }}" hint-placeholder-val="{{ true }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(30px, 4vw, 44px); text-transform: uppercase; margin: 0 0 6px;">Profile<span style="color: #820101;">.</span></h1>
          <p style="font-size: 14px; color: #6E6155; margin: 0 0 28px;">Changes save to your account and apply everywhere — listings, posts, messages.</p>
          <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 24px;">
            <sc-if value="{{ hasAvatar }}"><img src="{{ avatarUrl }}" alt="Your photo" style="width: 76px; height: 76px; object-fit: cover; border: 2px solid #1F3A38;"></sc-if>
            <sc-if value="{{ noAvatar }}"><div style="width: 76px; height: 76px; background: #1F3A38; color: #F7F1E6; border: 2px solid #1F3A38; font-family: var(--tz-display); font-size: 30px; display: flex; align-items: center; justify-content: center;">{{ initials }}</div></sc-if>
            <label style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #FFFDF8; padding: 10px 16px; cursor: pointer;">{{ photoLabel }}<input type="file" accept="image/jpeg,image/png,image/webp" onChange="{{ changePhoto }}" aria-label="Upload a profile photo" style="position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none;"></label>
            <sc-if value="{{ hasAvatar }}"><button onClick="{{ removePhoto }}" style="background: none; border: 0; font-family: var(--tz-mono); font-size: 11px; color: #B8463A; cursor: pointer; text-decoration: underline;">REMOVE</button></sc-if>
          </div>
          <div class="tw-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px; max-width: 720px;">
            <label style="display: grid; gap: 6px;">
              <span style="font-family: var(--tz-mono); font-size: 12px; color: #820101;">FULL NAME</span>
              <input value="{{ fName }}" onChange="{{ setFName }}" maxlength="80" autocomplete="name" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 13px 15px; font-family: var(--tz-sans); font-size: 14.5px; outline: none;">
            </label>
            <sc-if value="{{ isProvider }}">
            <label style="display: grid; gap: 6px;">
              <span style="font-family: var(--tz-mono); font-size: 12px; color: #820101;">BUSINESS NAME (ON YOUR LISTING)</span>
              <input value="{{ fBiz }}" onChange="{{ setFBiz }}" maxlength="80" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 13px 15px; font-family: var(--tz-sans); font-size: 14.5px; outline: none;">
            </label>
            </sc-if>
            <label style="display: grid; gap: 6px;">
              <span style="font-family: var(--tz-mono); font-size: 12px; color: #820101;">EMAIL (SIGN-IN — NEVER SHOWN IN THREADS)</span>
              <div style="display: flex; gap: 8px;">
                <input value="{{ fEmail }}" readOnly aria-label="Email" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 13px 15px; font-family: var(--tz-sans); font-size: 14.5px; outline: none; flex: 1; min-width: 0; background: #EFE7D6;">
                <button onClick="{{ changeEmail }}" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #1F3A38; background: #FFFDF8; padding: 0 12px; cursor: pointer;">CHANGE</button>
              </div>
            </label>
            <label style="display: grid; gap: 6px;">
              <span style="font-family: var(--tz-mono); font-size: 12px; color: #820101;">PHONE (FOR CODES AND ALERTS — NEVER SHOWN)</span>
              <div style="display: flex; gap: 8px;">
                <input value="{{ fPhone }}" readOnly aria-label="Phone" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 13px 15px; font-family: var(--tz-sans); font-size: 14.5px; outline: none; flex: 1; min-width: 0; background: #EFE7D6;">
                <button onClick="{{ changePhone }}" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #1F3A38; background: #FFFDF8; padding: 0 12px; cursor: pointer;">{{ phoneAction }}</button>
              </div>
            </label>
            <label style="display: grid; gap: 6px;">
              <span style="font-family: var(--tz-mono); font-size: 12px; color: #820101;">HOME CITY (FOR MATCHING AND WHAT'S NEAR YOU)</span>
              <input value="{{ fCity }}" onChange="{{ setFCity }}" maxlength="80" autocomplete="address-level2" placeholder="e.g. Jersey City" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 13px 15px; font-family: var(--tz-sans); font-size: 14.5px; outline: none;">
            </label>
            <label style="display: grid; gap: 6px;">
              <span style="font-family: var(--tz-mono); font-size: 12px; color: #820101;">COUNTRY</span>
              <select value="{{ fCountry }}" onChange="{{ setFCountry }}" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 13px 15px; font-family: var(--tz-sans); font-size: 14.5px; outline: none;"><sc-for list="{{ countries }}" as="c"><option value="{{ c.code }}">{{ c.name }}</option></sc-for></select>
            </label>
            <label style="display: grid; gap: 6px;">
              <span style="font-family: var(--tz-mono); font-size: 12px; color: #820101;">SHOW PRICES IN</span>
              <select value="{{ fCurrency }}" onChange="{{ setFCurrency }}" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 13px 15px; font-family: var(--tz-sans); font-size: 14.5px; outline: none;"><sc-for list="{{ currencies }}" as="cur"><option value="{{ cur }}">{{ cur }}</option></sc-for></select>
            </label>
            <div style="display: grid; gap: 6px; align-content: start;">
              <span style="font-family: var(--tz-mono); font-size: 12px; color: #820101;">YOUR TIME ZONE</span>
              <div style="font-size: 13.5px; color: #3A2F25; line-height: 1.5; padding-top: 6px;">{{ timezoneNote }}</div>
            </div>
          </div>
          <button onClick="{{ saveProfile }}" aria-busy="{{ savingProfile }}" style="margin-top: 24px; font-family: var(--tz-display); font-size: 16px; text-transform: uppercase; background: #820101; color: #F7F1E6; border: 2px solid #1F3A38; padding: 13px 30px; cursor: pointer; box-shadow: 4px 4px 0 #1F3A38;">{{ saveLabel }}</button>
        </div>
      </sc-if>

      <!-- NOTIFICATIONS -->
      <sc-if value="{{ isNotifs }}" hint-placeholder-val="{{ false }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(30px, 4vw, 44px); text-transform: uppercase; margin: 0 0 6px;">Notifications<span style="color: #820101;">.</span></h1>
          <p style="font-size: 14px; color: #6E6155; margin: 0 0 28px;">Per channel, per type. Off means off. Money notices always reach you somewhere, so your account never goes quiet.</p>
          <div style="border: 2px solid #1F3A38; max-width: 780px; overflow-x: auto;">
            <div style="display: grid; grid-template-columns: 1.6fr repeat(3, 80px); min-width: 560px; background: #1F3A38; color: #F7F1E6; font-family: var(--tz-mono); font-size: 10.5px; letter-spacing: 0.06em;">
              <span style="padding: 11px 16px;">NOTIFICATION TYPE</span><span style="padding: 11px 0; text-align: center;">IN-APP</span><span style="padding: 11px 0; text-align: center;">EMAIL</span><span style="padding: 11px 0; text-align: center;">SMS</span>
            </div>
            <sc-for list="{{ notifRows }}" as="r" hint-placeholder-count="6">
              <div style="display: grid; grid-template-columns: 1.6fr repeat(3, 80px); min-width: 560px; background: #FFFDF8; border-top: 1px solid #E3D9C6; align-items: center;">
                <div style="padding: 13px 16px;">
                  <div style="font-weight: 600; font-size: 13.5px;">{{ r.title }}</div>
                  <div style="font-size: 11.5px; color: #6E6155;">{{ r.desc }}</div>
                </div>
                <div style="text-align: center;"><button onClick="{{ r.tApp }}" role="switch" aria-checked="{{ r.appOn }}" aria-label="{{ r.title }} · in-app" style="width: 40px; height: 22px; border: 2px solid #1F3A38; background: {{ r.appBg }}; cursor: pointer; position: relative; padding: 0;"><span style="position: absolute; top: 1px; left: {{ r.appKnob }}; width: 14px; height: 14px; background: #1F3A38; transition: left 120ms;"></span></button></div>
                <div style="text-align: center;"><button onClick="{{ r.tEmail }}" role="switch" aria-checked="{{ r.emailOn }}" aria-label="{{ r.title }} · Email" style="width: 40px; height: 22px; border: 2px solid #1F3A38; background: {{ r.emailBg }}; cursor: pointer; position: relative; padding: 0;"><span style="position: absolute; top: 1px; left: {{ r.emailKnob }}; width: 14px; height: 14px; background: #1F3A38; transition: left 120ms;"></span></button></div>
                <div style="text-align: center;"><button onClick="{{ r.tSms }}" role="switch" aria-checked="{{ r.smsOn }}" aria-label="{{ r.title }} · SMS" style="width: 40px; height: 22px; border: 2px solid #1F3A38; background: {{ r.smsBg }}; cursor: pointer; position: relative; padding: 0;"><span style="position: absolute; top: 1px; left: {{ r.smsKnob }}; width: 14px; height: 14px; background: #1F3A38; transition: left 120ms;"></span></button></div>
              </div>
            </sc-for>
          </div>

          <!-- Quiet hours -->
          <sc-if value="{{ smsNeedsPhone }}"><div style="font-size: 12px; color: #6E6155; margin-top: 8px; max-width: 780px;">Text messages go only to a verified phone. <button onClick="{{ changePhone }}" style="background: none; border: 0; padding: 0; font: inherit; color: #820101; cursor: pointer; text-decoration: underline;">Verify yours</button>.</div></sc-if>
          <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 18px 20px; max-width: 780px; margin-top: 16px; display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">
            <div>
              <div style="font-family: var(--tz-display); font-size: 17px; text-transform: uppercase;">Quiet hours · 21:00 → 07:00</div>
              <div style="font-size: 12.5px; color: #6E6155; margin-top: 3px;">No text messages overnight in your time zone ({{ timezone }}), except money and security. Email and in-app are never delayed.</div>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <button onClick="{{ toggleQuiet }}" role="switch" aria-checked="{{ quietOn }}" aria-label="Quiet hours" style="width: 50px; height: 26px; border: 2px solid #1F3A38; background: {{ quietBg }}; cursor: pointer; position: relative; padding: 0;"><span style="position: absolute; top: 2px; left: {{ quietKnob }}; width: 18px; height: 18px; background: #1F3A38; transition: left 120ms;"></span></button>
            </div>
          </div>
          <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 18px 20px; max-width: 780px; margin-top: 12px; display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">
            <div>
              <div style="font-family: var(--tz-display); font-size: 17px; text-transform: uppercase;">Weekly digest</div>
              <div style="font-size: 12.5px; color: #6E6155; margin-top: 3px;">One email on Monday: what's coming up, offers on your needs, and what's new near you. Sent only when there is news.</div>
            </div>
            <button onClick="{{ toggleDigest }}" role="switch" aria-checked="{{ digestOn }}" aria-label="Weekly digest" style="width: 50px; height: 26px; border: 2px solid #1F3A38; background: {{ digestBg }}; cursor: pointer; position: relative; padding: 0;"><span style="position: absolute; top: 2px; left: {{ digestKnob }}; width: 18px; height: 18px; background: #1F3A38; transition: left 120ms;"></span></button>
          </div>
          <div style="display: flex; gap: 12px; margin-top: 18px; flex-wrap: wrap; max-width: 780px;">
            <button onClick="{{ digestAll }}" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #FFFDF8; padding: 11px 16px; cursor: pointer;">DIGEST INSTEAD OF EMAILS</button>
            <button onClick="{{ muteAll }}" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #FFFDF8; padding: 11px 16px; cursor: pointer;">MUTE ALL BUT MONEY</button>
          </div>
        </div>
      </sc-if>

      <!-- PAYMENTS -->
      <sc-if value="{{ isPayments }}" hint-placeholder-val="{{ false }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(30px, 4vw, 44px); text-transform: uppercase; margin: 0 0 6px;">Payment methods<span style="color: #820101;">.</span></h1>
          <p style="font-size: 14px; color: #6E6155; margin: 0 0 28px; max-width: 640px;">Where money goes when you cash out points or withdraw earnings. Cards are entered on Stripe's secure page each time you pay, and Twendezetu never stores card numbers.</p>
          <div style="display: grid; gap: 12px; max-width: 640px;">
            <sc-if value="{{ noMethods }}"><div style="border: 2px dashed #1F3A38; background: #FFFDF8; padding: 18px 20px; font-size: 13.5px; color: #6E6155;">No payout methods yet.</div></sc-if>
            <sc-for list="{{ payMethods }}" as="pm" hint-placeholder-count="3">
              <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; gap: 14px; flex-wrap: wrap;">
                <div style="display: flex; gap: 14px; align-items: center;">
                  <span style="width: 44px; height: 30px; border: 2px solid #1F3A38; background: {{ pm.iconBg }}; color: {{ pm.iconFg }}; font-family: var(--tz-mono); font-size: 10px; display: flex; align-items: center; justify-content: center;">{{ pm.icon }}</span>
                  <div>
                    <div style="font-weight: 700; font-size: 14px;">{{ pm.label }}</div>
                    <div style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">{{ pm.meta }}</div>
                  </div>
                </div>
                <div style="display: flex; gap: 8px;">
                  <sc-if value="{{ pm.isDefault }}" hint-placeholder-val="{{ false }}">
                    <span style="font-family: var(--tz-mono); font-size: 10.5px; background: #820101; border: 1px solid #1F3A38; padding: 5px 10px; color: #F7F1E6;">DEFAULT</span>
                  </sc-if>
                  <sc-if value="{{ pm.notDefault }}" hint-placeholder-val="{{ true }}">
                    <button onClick="{{ pm.makeDefault }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 1px solid #1F3A38; background: #F7F1E6; padding: 5px 10px; cursor: pointer;">MAKE DEFAULT</button>
                  </sc-if>
                  <button onClick="{{ pm.remove }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 1px solid #B8463A; color: #B8463A; background: none; padding: 5px 10px; cursor: pointer;">REMOVE</button>
                </div>
              </div>
            </sc-for>
            <sc-if value="{{ addClosed }}"><button onClick="{{ addMethod }}" style="border: 2px dashed #820101; background: #FBEED8; color: #5C0000; font-family: var(--tz-mono); font-size: 12.5px; padding: 15px; cursor: pointer;">+ ADD M-PESA, MTN MOMO, AIRTEL MONEY OR A BANK ACCOUNT</button></sc-if>
            <sc-if value="{{ addOpen }}">
              <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 18px 20px; display: grid; gap: 12px;">
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <sc-for list="{{ kinds }}" as="k"><button onClick="{{ k.pick }}" aria-pressed="{{ k.selected }}" style="font-family: var(--tz-mono); font-size: 11.5px; border: 2px solid #1F3A38; background: {{ k.bg }}; color: {{ k.fg }}; padding: 9px 12px; cursor: pointer;">{{ k.label }}</button></sc-for>
                </div>
                <sc-if value="{{ isBank }}"><input value="{{ newBank }}" onChange="{{ setNewBank }}" maxlength="30" aria-label="Bank name" placeholder="Bank name, e.g. Stanbic" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 13px 15px; font-family: var(--tz-sans); font-size: 14.5px; outline: none;"></sc-if>
                <input value="{{ newAccount }}" onChange="{{ setNewAccount }}" autocomplete="off" aria-label="{{ accountLabel }}" placeholder="{{ accountLabel }}" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 13px 15px; font-family: var(--tz-sans); font-size: 14.5px; outline: none; font-family: var(--tz-mono);">
                <div style="font-size: 12px; color: #6E6155;">The number is encrypted; only its last four digits are ever shown.</div>
                <div style="display: flex; gap: 8px;">
                  <button onClick="{{ saveMethod }}" style="font-family: var(--tz-display); font-size: 14px; text-transform: uppercase; background: #820101; color: #F7F1E6; border: 2px solid #1F3A38; padding: 11px 20px; cursor: pointer;">Save</button>
                  <button onClick="{{ closeAdd }}" style="font-family: var(--tz-mono); font-size: 11px; background: none; border: 2px solid #1F3A38; padding: 11px 14px; cursor: pointer;">CANCEL</button>
                </div>
              </div>
            </sc-if>
          </div>
        </div>
      </sc-if>

      <!-- SECURITY -->
      <sc-if value="{{ isSecurity }}" hint-placeholder-val="{{ false }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(30px, 4vw, 44px); text-transform: uppercase; margin: 0 0 6px;">Security<span style="color: #820101;">.</span></h1>
          <p style="font-size: 14px; color: #6E6155; margin: 0 0 28px;">Your money and your masked identity depend on this account staying yours.</p>
          <sc-if value="{{ staffLocked }}">
            <div role="status" style="border: 2px solid #1F3A38; background: #EFE7D6; padding: 14px 18px; font-size: 14px; line-height: 1.55; max-width: 640px; margin: 0 0 16px;">
              <div style="font-family: var(--tz-mono); font-size: 12px; color: #820101; letter-spacing: 0.08em; margin-bottom: 4px;">[STAFF TOOLS LOCKED]</div>
              {{ staffLockedText }}
            </div>
          </sc-if>
          <div style="display: grid; gap: 12px; max-width: 640px;">
            <sc-for list="{{ securityRows }}" as="sr" hint-placeholder-count="4">
              <div style="border: 2px solid {{ sr.border }}; background: #FFFDF8; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; gap: 14px; flex-wrap: wrap;">
                <div style="max-width: 440px;">
                  <div style="font-weight: 700; font-size: 14px;">{{ sr.title }}</div>
                  <div style="font-size: 12.5px; color: #6E6155; margin-top: 2px;">{{ sr.desc }}</div>
                </div>
                <sc-if value="{{ sr.isLink }}"><a href="{{ sr.href }}" download style="font-family: var(--tz-mono); font-size: 11.5px; border: 2px solid #1F3A38; background: {{ sr.btnBg }}; color: {{ sr.btnFg }}; padding: 9px 14px; text-decoration: none;">{{ sr.btn }}</a></sc-if>
                <sc-if value="{{ sr.isButton }}"><button onClick="{{ sr.action }}" style="font-family: var(--tz-mono); font-size: 11.5px; border: 2px solid {{ sr.btnBorder }}; background: {{ sr.btnBg }}; color: {{ sr.btnFg }}; padding: 9px 14px; cursor: pointer;">{{ sr.btn }}</button></sc-if>
              </div>
            </sc-for>
          </div>
          <h2 style="font-family: var(--tz-display); font-size: 22px; text-transform: uppercase; margin: 32px 0 10px;">Where you're signed in<span style="color: #820101;">.</span></h2>
          <div style="border: 2px solid #1F3A38; max-width: 640px;">
            <sc-for list="{{ sessions }}" as="ss">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 13px 18px; background: #FFFDF8; border-bottom: 1px solid #E3D9C6;">
                <div><div style="font-weight: 600; font-size: 13.5px;">{{ ss.device }}</div><div style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">{{ ss.meta }}</div></div>
                <sc-if value="{{ ss.current }}"><span style="font-family: var(--tz-mono); font-size: 10.5px; background: #DCE8D9; border: 1px solid #1F3A38; padding: 4px 9px;">THIS DEVICE</span></sc-if>
                <sc-if value="{{ ss.other }}"><button onClick="{{ ss.revoke }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 1px solid #B8463A; color: #B8463A; background: none; padding: 5px 10px; cursor: pointer;">SIGN OUT</button></sc-if>
              </div>
            </sc-for>
          </div>
          <sc-if value="{{ hasOtherSessions }}"><button onClick="{{ revokeOthers }}" style="margin-top: 12px; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #B8463A; color: #B8463A; background: none; padding: 10px 14px; cursor: pointer;">SIGN OUT EVERYWHERE ELSE</button></sc-if>
        </div>
      </sc-if>
    </section>
  </div>

</div>
`;

export default template;
