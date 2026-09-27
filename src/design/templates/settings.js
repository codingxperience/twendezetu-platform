// Markup for the settings page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh;">

  <!-- Header -->
  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 18px 24px; border-bottom: 2px solid #1F3A38; background: #F7F1E6; position: sticky; top: 0; z-index: 40;">
    <div style="display: flex; align-items: center; gap: 24px;">
      <a href="/" style="text-decoration: none; color: #14201F; font-family: var(--tz-display); font-size: 26px; text-transform: uppercase; line-height: 0.9;">TWENDE<br><span style="color: #D97A3B;">ZETU</span></a>
      <span style="font-family: var(--tz-mono); font-size: 12px; background: #1F3A38; color: #F7F1E6; padding: 5px 10px;">ACCOUNT SETTINGS</span>
    </div>
    <div style="display: flex; gap: 12px; align-items: center;">
      <a href="{{ backHref }}" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; color: #14201F; text-decoration: none; padding: 10px 16px;">← {{ backLabel }}</a>
      <a href="/sign-in" style="font-family: var(--tz-mono); font-size: 12px; color: #B8463A; text-decoration: underline;">SIGN OUT</a>
    </div>
  </header>

  <div class="tw-shell" style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 240px 1fr; gap: 0; min-height: calc(100vh - 79px);">

    <!-- Side nav -->
    <aside class="tw-side" style="border-right: 2px solid #1F3A38; padding: 28px 0; display: flex; flex-direction: column; gap: 2px; position: sticky; top: 79px; align-self: start;">
      <sc-for list="{{ navItems }}" as="n" hint-placeholder-count="4">
        <button onClick="{{ n.go }}" style="display: flex; align-items: center; gap: 12px; text-align: left; background: {{ n.bg }}; color: {{ n.fg }}; border: 0; padding: 14px 22px; font-family: var(--tz-mono); font-size: 12.5px; letter-spacing: 0.04em; cursor: pointer; white-space: nowrap;">
          <span style="width: 18px; display: inline-flex;">{{ n.icon }}</span>
          <span>{{ n.label }}</span>
        </button>
      </sc-for>
    </aside>

    <section style="padding: 36px 32px 80px; min-width: 0;">

      <!-- PROFILE -->
      <sc-if value="{{ isProfile }}" hint-placeholder-val="{{ true }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(30px, 4vw, 44px); text-transform: uppercase; margin: 0 0 6px;">Profile<span style="color: #D97A3B;">.</span></h1>
          <p style="font-size: 14px; color: #6E6155; margin: 0 0 28px;">Changes save to your account and apply everywhere — listings, posts, messages.</p>
          <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 24px;">
            <div style="width: 76px; height: 76px; background: #1F3A38; color: #F7F1E6; border: 2px solid #1F3A38; font-family: var(--tz-display); font-size: 30px; display: flex; align-items: center; justify-content: center;">{{ initials }}</div>
            <button onClick="{{ changePhoto }}" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #FFFDF8; padding: 10px 16px; cursor: pointer;">CHANGE PHOTO</button>
          </div>
          <div class="tw-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px; max-width: 720px;">
            <label style="display: grid; gap: 6px;">
              <span style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23;">FULL NAME</span>
              <input value="{{ fName }}" onChange="{{ setFName }}" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 13px 15px; font-family: var(--tz-sans); font-size: 14.5px; outline: none;">
            </label>
            <label style="display: grid; gap: 6px;">
              <span style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23;">DISPLAY / BUSINESS NAME</span>
              <input value="{{ fBiz }}" onChange="{{ setFBiz }}" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 13px 15px; font-family: var(--tz-sans); font-size: 14.5px; outline: none;">
            </label>
            <label style="display: grid; gap: 6px;">
              <span style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23;">EMAIL (LOGIN — MASKED IN THREADS)</span>
              <input value="{{ fEmail }}" onChange="{{ setFEmail }}" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 13px 15px; font-family: var(--tz-sans); font-size: 14.5px; outline: none;">
            </label>
            <label style="display: grid; gap: 6px;">
              <span style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23;">PHONE (MASKED UNTIL YOU ACCEPT)</span>
              <input value="{{ fPhone }}" onChange="{{ setFPhone }}" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 13px 15px; font-family: var(--tz-sans); font-size: 14.5px; outline: none;">
            </label>
            <label style="display: grid; gap: 6px;">
              <span style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23;">HOME CITY (MATCHING + CURRENCY)</span>
              <select style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 13px 15px; font-family: var(--tz-sans); font-size: 14.5px; outline: none;">
                <option>New Jersey / New York, USA</option><option>Nairobi, Kenya</option><option>Kampala, Uganda</option><option>Dar es Salaam, Tanzania</option><option>Kigali, Rwanda</option>
              </select>
            </label>
            <label style="display: grid; gap: 6px;">
              <span style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23;">TIME ZONE (ALL EVENT TIMES SHOWN IN THIS + VENUE TIME)</span>
              <select style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 13px 15px; font-family: var(--tz-sans); font-size: 14.5px; outline: none;">
                <option>Auto — from device (America/New_York, EDT)</option><option>Africa/Nairobi (EAT)</option><option>Africa/Kampala (EAT)</option><option>Africa/Dar_es_Salaam (EAT)</option><option>Africa/Kigali (CAT)</option>
              </select>
            </label>
          </div>
          <button onClick="{{ saveProfile }}" style="margin-top: 24px; font-family: var(--tz-display); font-size: 16px; text-transform: uppercase; background: #D97A3B; color: #1F3A38; border: 2px solid #1F3A38; padding: 13px 30px; cursor: pointer; box-shadow: 4px 4px 0 #1F3A38;">{{ saveLabel }}</button>
        </div>
      </sc-if>

      <!-- NOTIFICATIONS -->
      <sc-if value="{{ isNotifs }}" hint-placeholder-val="{{ false }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(30px, 4vw, 44px); text-transform: uppercase; margin: 0 0 6px;">Notifications<span style="color: #D97A3B;">.</span></h1>
          <p style="font-size: 14px; color: #6E6155; margin: 0 0 28px;">Per channel, per type. Off means off — never a nuisance.</p>
          <div style="border: 2px solid #1F3A38; max-width: 860px; overflow-x: auto;">
            <div style="display: grid; grid-template-columns: 1.6fr repeat(4, 80px); min-width: 640px; background: #1F3A38; color: #F7F1E6; font-family: var(--tz-mono); font-size: 10.5px; letter-spacing: 0.06em;">
              <span style="padding: 11px 16px;">NOTIFICATION TYPE</span><span style="padding: 11px 0; text-align: center;">IN-APP</span><span style="padding: 11px 0; text-align: center;">EMAIL</span><span style="padding: 11px 0; text-align: center;">SMS</span><span style="padding: 11px 0; text-align: center; color: #E8A472;">WHATSAPP</span>
            </div>
            <sc-for list="{{ notifRows }}" as="r" hint-placeholder-count="6">
              <div style="display: grid; grid-template-columns: 1.6fr repeat(4, 80px); min-width: 640px; background: #FFFDF8; border-top: 1px solid #E3D9C6; align-items: center;">
                <div style="padding: 13px 16px;">
                  <div style="font-weight: 600; font-size: 13.5px;">{{ r.title }}</div>
                  <div style="font-size: 11.5px; color: #6E6155;">{{ r.desc }}</div>
                </div>
                <div style="text-align: center;"><button onClick="{{ r.tApp }}" style="width: 40px; height: 22px; border: 2px solid #1F3A38; background: {{ r.appBg }}; cursor: pointer; position: relative; padding: 0;"><span style="position: absolute; top: 1px; left: {{ r.appKnob }}; width: 14px; height: 14px; background: #1F3A38; transition: left 120ms;"></span></button></div>
                <div style="text-align: center;"><button onClick="{{ r.tEmail }}" style="width: 40px; height: 22px; border: 2px solid #1F3A38; background: {{ r.emailBg }}; cursor: pointer; position: relative; padding: 0;"><span style="position: absolute; top: 1px; left: {{ r.emailKnob }}; width: 14px; height: 14px; background: #1F3A38; transition: left 120ms;"></span></button></div>
                <div style="text-align: center;"><button onClick="{{ r.tSms }}" style="width: 40px; height: 22px; border: 2px solid #1F3A38; background: {{ r.smsBg }}; cursor: pointer; position: relative; padding: 0;"><span style="position: absolute; top: 1px; left: {{ r.smsKnob }}; width: 14px; height: 14px; background: #1F3A38; transition: left 120ms;"></span></button></div>
                <div style="text-align: center;"><button onClick="{{ r.tWa }}" style="width: 40px; height: 22px; border: 2px solid #1F3A38; background: {{ r.waBg }}; cursor: pointer; position: relative; padding: 0;"><span style="position: absolute; top: 1px; left: {{ r.waKnob }}; width: 14px; height: 14px; background: #1F3A38; transition: left 120ms;"></span></button></div>
              </div>
            </sc-for>
          </div>

          <!-- Quiet hours -->
          <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 18px 20px; max-width: 860px; margin-top: 16px; display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">
            <div>
              <div style="font-family: var(--tz-display); font-size: 17px; text-transform: uppercase;">Quiet hours</div>
              <div style="font-size: 12.5px; color: #6E6155; margin-top: 3px;">No pings overnight (except money & security). Uses your local time zone.</div>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <input value="22:00" style="width: 68px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 9px; font-family: var(--tz-mono); font-size: 13px; text-align: center; outline: none;">
              <span style="font-family: var(--tz-mono); font-size: 12px; color: #6E6155;">→</span>
              <input value="07:00" style="width: 68px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 9px; font-family: var(--tz-mono); font-size: 13px; text-align: center; outline: none;">
              <button onClick="{{ toggleQuiet }}" style="width: 50px; height: 26px; border: 2px solid #1F3A38; background: {{ quietBg }}; cursor: pointer; position: relative; padding: 0;"><span style="position: absolute; top: 2px; left: {{ quietKnob }}; width: 18px; height: 18px; background: #1F3A38; transition: left 120ms;"></span></button>
            </div>
          </div>
          <div style="display: flex; gap: 12px; margin-top: 18px; flex-wrap: wrap; max-width: 780px;">
            <button onClick="{{ digestAll }}" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #FFFDF8; padding: 11px 16px; cursor: pointer;">SWITCH EVERYTHING TO WEEKLY DIGEST</button>
            <button onClick="{{ muteAll }}" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #FFFDF8; padding: 11px 16px; cursor: pointer;">MUTE ALL FOR 7 DAYS</button>
          </div>
        </div>
      </sc-if>

      <!-- PAYMENTS -->
      <sc-if value="{{ isPayments }}" hint-placeholder-val="{{ false }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(30px, 4vw, 44px); text-transform: uppercase; margin: 0 0 6px;">Payment methods<span style="color: #D97A3B;">.</span></h1>
          <p style="font-size: 14px; color: #6E6155; margin: 0 0 28px;">Used for top-ups, tickets, membership — and as the destination when you withdraw.</p>
          <div style="display: grid; gap: 12px; max-width: 640px;">
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
                    <span style="font-family: var(--tz-mono); font-size: 10.5px; background: #D97A3B; border: 1px solid #1F3A38; padding: 5px 10px;">DEFAULT</span>
                  </sc-if>
                  <sc-if value="{{ pm.notDefault }}" hint-placeholder-val="{{ true }}">
                    <button onClick="{{ pm.makeDefault }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 1px solid #1F3A38; background: #F7F1E6; padding: 5px 10px; cursor: pointer;">MAKE DEFAULT</button>
                  </sc-if>
                  <button onClick="{{ pm.remove }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 1px solid #B8463A; color: #B8463A; background: none; padding: 5px 10px; cursor: pointer;">REMOVE</button>
                </div>
              </div>
            </sc-for>
            <button onClick="{{ addMethod }}" style="border: 2px dashed #A85A23; background: #FBEED8; color: #7A3E0F; font-family: var(--tz-mono); font-size: 12.5px; padding: 15px; cursor: pointer;">+ ADD CARD, M-PESA, MTN MOMO OR AIRTEL MONEY</button>
          </div>
        </div>
      </sc-if>

      <!-- SECURITY -->
      <sc-if value="{{ isSecurity }}" hint-placeholder-val="{{ false }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(30px, 4vw, 44px); text-transform: uppercase; margin: 0 0 6px;">Security<span style="color: #D97A3B;">.</span></h1>
          <p style="font-size: 14px; color: #6E6155; margin: 0 0 28px;">Your money and your masked identity depend on this account staying yours.</p>
          <div style="display: grid; gap: 12px; max-width: 640px;">
            <sc-for list="{{ securityRows }}" as="sr" hint-placeholder-count="4">
              <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; gap: 14px; flex-wrap: wrap;">
                <div>
                  <div style="font-weight: 700; font-size: 14px;">{{ sr.title }}</div>
                  <div style="font-size: 12.5px; color: #6E6155; margin-top: 2px;">{{ sr.desc }}</div>
                </div>
                <button onClick="{{ sr.action }}" style="font-family: var(--tz-mono); font-size: 11.5px; border: 2px solid #1F3A38; background: {{ sr.btnBg }}; color: {{ sr.btnFg }}; padding: 9px 14px; cursor: pointer;">{{ sr.btn }}</button>
              </div>
            </sc-for>
          </div>
        </div>
      </sc-if>
    </section>
  </div>

</div>
`;

export default template;
