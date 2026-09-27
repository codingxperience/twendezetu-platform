// Markup for the signin page. Bindings are resolved by src/design/render.js.

const template = `
<div class="tw-2col" style="font-family: var(--tz-sans); background: #1F3A38; color: #F7F1E6; min-height: 100vh; display: grid; grid-template-columns: 0.9fr 1.1fr;">

  <!-- Left: brand panel -->
  <div style="padding: 40px; display: flex; flex-direction: column; justify-content: space-between; border-right: 2px solid #F7F1E6;">
    <a href="/" style="text-decoration: none; color: #F7F1E6; font-family: var(--tz-display); font-size: 30px; text-transform: uppercase; line-height: 0.9;">TWENDE<br><span style="color: #D97A3B;">ZETU</span></a>
    <div>
      <div style="font-family: var(--tz-mono); font-size: 12px; color: #E8A472; letter-spacing: 0.08em;">[Karibu tena]</div>
      <div style="font-family: var(--tz-display); font-size: clamp(44px, 5vw, 76px); text-transform: uppercase; line-height: 0.94; margin-top: 12px;">
        One portal<span style="color: #D97A3B;">.</span><br>Every gathering<span style="color: #D97A3B;">.</span><br><em style="font-family: var(--tz-serif); text-transform: none; color: #E8A472;">Popote ulipo.</em>
      </div>
      <p style="font-size: 14.5px; line-height: 1.6; color: rgba(247,241,230,0.75); max-width: 380px; margin-top: 18px;">
        Guests browse free — no account needed. Create one to save events, get reminders, post needs, or offer your services.
      </p>
    </div>
    <div style="font-family: var(--tz-mono); font-size: 11px; color: rgba(247,241,230,0.5);">NAIROBI · KAMPALA · DAR · KIGALI · NY/NJ · EST. 2026</div>
  </div>

  <!-- Right: form panel -->
  <div style="background: #F7F1E6; color: #14201F; padding: 40px; display: flex; flex-direction: column; justify-content: center;">
    <div style="max-width: 460px; width: 100%; margin: 0 auto;">

      <!-- Mode tabs -->
      <sc-if value="{{ isCredentials }}">
      <div style="display: flex; border: 2px solid #1F3A38; margin-bottom: 28px;">
        <button onClick="{{ setSignIn }}" style="flex: 1; font-family: var(--tz-display); font-size: 16px; text-transform: uppercase; padding: 13px; border: 0; cursor: pointer; background: {{ signInBg }}; color: {{ signInFg }};">Sign in</button>
        <button onClick="{{ setRegister }}" style="flex: 1; font-family: var(--tz-display); font-size: 16px; text-transform: uppercase; padding: 13px; border: 0; border-left: 2px solid #1F3A38; cursor: pointer; background: {{ registerBg }}; color: {{ registerFg }};">Register</button>
      </div>

      </sc-if>

      <!-- Role picker (register only) -->
      <sc-if value="{{ isRegister }}" hint-placeholder-val="{{ false }}">
        <div style="margin-bottom: 24px;">
          <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em; margin-bottom: 10px;">[Wewe ni nani? — pick your role]</div>
          <div style="display: grid; gap: 10px;">
            <sc-for list="{{ roleCards }}" as="rc" hint-placeholder-count="3">
              <button onClick="{{ rc.pick }}" style="text-align: left; display: grid; grid-template-columns: 1fr auto; gap: 14px; align-items: center; border: 2px solid #1F3A38; background: {{ rc.bg }}; color: {{ rc.fg }}; padding: 16px 18px; cursor: pointer; box-shadow: {{ rc.shadow }};">
                <div>
                  <div style="font-family: var(--tz-display); font-size: 18px; text-transform: uppercase;">{{ rc.title }}</div>
                  <div style="font-size: 13px; opacity: 0.8; margin-top: 3px; line-height: 1.45;">{{ rc.desc }}</div>
                </div>
                <span style="font-family: var(--tz-mono); font-size: 11px; border: 1px solid currentColor; padding: 4px 8px;">{{ rc.tag }}</span>
              </button>
            </sc-for>
          </div>
        </div>
      </sc-if>

      <!-- Form -->
      <sc-if value="{{ notice }}">
        <div style="border: 2px solid #1F3A38; background: #EFE7D6; padding: 12px 14px; font-size: 13.5px; line-height: 1.5; margin-bottom: 16px;">{{ notice }}</div>
      </sc-if>

      <sc-if value="{{ isCredentials }}">
      <div style="display: grid; gap: 16px;" onKeyDown="{{ submitOnEnter }}">
        <sc-if value="{{ isRegister }}" hint-placeholder-val="{{ false }}">
          <label style="display: grid; gap: 6px;">
            <span style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23;">YOUR NAME *</span>
            <input autocomplete="name" placeholder="Amina Mushi" value="{{ name }}" onChange="{{ setName }}" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 14px 16px; font-family: var(--tz-sans); font-size: 15px; outline: none;">
          </label>
        </sc-if>
        <label style="display: grid; gap: 6px;">
          <span style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23;">EMAIL *</span>
          <input type="email" autocomplete="email" placeholder="you@example.com" value="{{ email }}" onChange="{{ setEmail }}" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 14px 16px; font-family: var(--tz-sans); font-size: 15px; outline: none;">
        </label>
        <label style="display: grid; gap: 6px;">
          <span style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23;">PASSWORD *</span>
          <input type="password" autocomplete="{{ passwordAutocomplete }}" placeholder="{{ passwordPlaceholder }}" value="{{ password }}" onChange="{{ setPassword }}" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 14px 16px; font-family: var(--tz-sans); font-size: 15px; outline: none;">
        </label>
        <sc-if value="{{ isRegister }}" hint-placeholder-val="{{ false }}">
          <label style="display: grid; gap: 6px;">
            <span style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23;">HOME CITY (FOR MATCHING &amp; CURRENCY)</span>
            <select value="{{ home }}" onChange="{{ setHome }}" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 14px 16px; font-family: var(--tz-sans); font-size: 15px; outline: none;">
              <sc-for list="{{ homes }}" as="h">
                <option value="{{ h.value }}">{{ h.label }}</option>
              </sc-for>
            </select>
          </label>
        </sc-if>
        <sc-if value="{{ error }}">
          <div role="alert" style="font-size: 13px; color: #B8463A; line-height: 1.45;">{{ error }}</div>
        </sc-if>
        <button onClick="{{ submit }}" aria-busy="{{ busy }}" style="font-family: var(--tz-display); font-size: 17px; text-transform: uppercase; background: #D97A3B; color: #1F3A38; border: 2px solid #1F3A38; padding: 15px; cursor: pointer; box-shadow: 4px 4px 0 #1F3A38; text-align: center; display: block; width: 100%;">{{ ctaLabel }}</button>
        <sc-if value="{{ isSignIn }}">
          <button onClick="{{ showForgot }}" style="background: none; border: 0; padding: 0; font-family: var(--tz-mono); font-size: 12px; color: #A85A23; text-decoration: underline; cursor: pointer; justify-self: start;">Forgot your password?</button>
        </sc-if>
      </div>
      </sc-if>

      <sc-if value="{{ isTwoFactor }}">
      <div style="display: grid; gap: 16px;" onKeyDown="{{ submitOnEnter }}">
        <div style="font-size: 14.5px; line-height: 1.55;">We texted a 6-digit code to <strong>{{ phoneHint }}</strong>. Enter it to finish signing in.</div>
        <input inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="123456" value="{{ code }}" onChange="{{ setCode }}" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 14px 16px; font-family: var(--tz-sans); font-size: 15px; outline: none; font-family: var(--tz-mono); font-size: 22px; letter-spacing: 0.3em; text-align: center;">
        <sc-if value="{{ error }}">
          <div role="alert" style="font-size: 13px; color: #B8463A;">{{ error }}</div>
        </sc-if>
        <button onClick="{{ submit }}" aria-busy="{{ busy }}" style="font-family: var(--tz-display); font-size: 17px; text-transform: uppercase; background: #D97A3B; color: #1F3A38; border: 2px solid #1F3A38; padding: 15px; cursor: pointer; box-shadow: 4px 4px 0 #1F3A38; text-align: center; display: block; width: 100%;">Verify and continue →</button>
        <button onClick="{{ resendCode }}" style="background: none; border: 0; padding: 0; font-family: var(--tz-mono); font-size: 12px; color: #A85A23; text-decoration: underline; cursor: pointer; justify-self: start;">Text me a new code</button>
      </div>
      </sc-if>

      <sc-if value="{{ isForgot }}">
      <div style="display: grid; gap: 16px;" onKeyDown="{{ submitOnEnter }}">
        <div style="font-size: 14.5px; line-height: 1.55;">Enter your account email and we'll send a link to choose a new password. The link works for 30 minutes.</div>
        <input type="email" autocomplete="email" placeholder="you@example.com" value="{{ email }}" onChange="{{ setEmail }}" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 14px 16px; font-family: var(--tz-sans); font-size: 15px; outline: none;">
        <sc-if value="{{ error }}">
          <div role="alert" style="font-size: 13px; color: #B8463A;">{{ error }}</div>
        </sc-if>
        <button onClick="{{ submit }}" aria-busy="{{ busy }}" style="font-family: var(--tz-display); font-size: 17px; text-transform: uppercase; background: #D97A3B; color: #1F3A38; border: 2px solid #1F3A38; padding: 15px; cursor: pointer; box-shadow: 4px 4px 0 #1F3A38; text-align: center; display: block; width: 100%;">Send reset link →</button>
        <button onClick="{{ backToSignIn }}" style="background: none; border: 0; padding: 0; font-family: var(--tz-mono); font-size: 12px; color: #A85A23; text-decoration: underline; cursor: pointer; justify-self: start;">Back to sign in</button>
      </div>
      </sc-if>

      <sc-if value="{{ isReset }}">
      <div style="display: grid; gap: 16px;" onKeyDown="{{ submitOnEnter }}">
        <div style="font-size: 14.5px; line-height: 1.55;">Choose a new password. At least 10 characters — a short phrase works well.</div>
        <input type="password" autocomplete="new-password" placeholder="New password" value="{{ password }}" onChange="{{ setPassword }}" style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 14px 16px; font-family: var(--tz-sans); font-size: 15px; outline: none;">
        <sc-if value="{{ error }}">
          <div role="alert" style="font-size: 13px; color: #B8463A;">{{ error }}</div>
        </sc-if>
        <button onClick="{{ submit }}" aria-busy="{{ busy }}" style="font-family: var(--tz-display); font-size: 17px; text-transform: uppercase; background: #D97A3B; color: #1F3A38; border: 2px solid #1F3A38; padding: 15px; cursor: pointer; box-shadow: 4px 4px 0 #1F3A38; text-align: center; display: block; width: 100%;">Save new password →</button>
      </div>
      </sc-if>

      <div style="display: flex; align-items: center; gap: 12px; margin: 22px 0;">
        <span style="flex: 1; height: 1px; background: #C9BFB1;"></span>
        <span style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">AU — OR</span>
        <span style="flex: 1; height: 1px; background: #C9BFB1;"></span>
      </div>
      <a href="{{ guestHref }}" style="display: block; text-align: center; border: 2px solid #1F3A38; background: #FFFDF8; color: #14201F; text-decoration: none; font-size: 14px; font-weight: 600; padding: 14px;">Continue as guest — browse without an account →</a>
      <div style="font-size: 12px; color: #6E6155; text-align: center; margin-top: 14px; line-height: 1.5;">Guests can view, RSVP and share. Saving, posting, and provider tools need an account.</div>
    </div>
  </div>
</div>
`;

export default template;
