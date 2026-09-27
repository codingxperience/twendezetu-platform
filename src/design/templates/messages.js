// Markup for the messages page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh; display: flex; flex-direction: column;">

  <!-- Header -->
  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 18px 24px; border-bottom: 2px solid #1F3A38; background: #F7F1E6;">
    <div style="display: flex; align-items: center; gap: 24px;">
      <a href="/" style="text-decoration: none; color: #14201F; font-family: var(--tz-display); font-size: 26px; text-transform: uppercase; line-height: 0.9;">TWENDE<br><span style="color: #D97A3B;">ZETU</span></a>
      <span style="font-family: var(--tz-mono); font-size: 12px; background: #1F3A38; color: #F7F1E6; padding: 5px 10px;">MESSAGES · MASKED BY DEFAULT</span>
    </div>
    <a href="/my-twende" style="font-family: var(--tz-mono); font-size: 13px; border: 2px solid #1F3A38; color: #14201F; text-decoration: none; padding: 10px 16px;">← MY TWENDE</a>
  </header>

  <div class="tw-shell" style="flex: 1; display: grid; grid-template-columns: 340px 1fr; min-height: 0;">

    <!-- Thread list -->
    <aside class="tw-threads" style="border-right: 2px solid #1F3A38; background: #FFFDF8; overflow-y: auto;">
      <div style="padding: 16px 20px; border-bottom: 2px solid #1F3A38; font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em;">[Mazungumzo — threads]</div>
      <sc-for list="{{ threads }}" as="th" hint-placeholder-count="4">
        <button onClick="{{ th.open }}" style="display: block; width: 100%; text-align: left; padding: 16px 20px; border: 0; border-bottom: 1px solid #E3D9C6; background: {{ th.bg }}; cursor: pointer;">
          <div style="display: flex; justify-content: space-between; gap: 10px; align-items: baseline;">
            <span style="font-weight: 700; font-size: 14px; color: {{ th.fg }};">{{ th.name }}<sc-if value="{{ th.unread }}" hint-placeholder-val="{{ false }}"><span style="display: inline-block; width: 8px; height: 8px; background: #D97A3B; border-radius: 50%; margin-left: 8px;"></span></sc-if></span>
            <span style="font-family: var(--tz-mono); font-size: 10.5px; color: {{ th.metaColor }};">{{ th.time }}</span>
          </div>
          <div style="font-family: var(--tz-mono); font-size: 11px; color: {{ th.metaColor }}; margin-top: 3px;">{{ th.re }}</div>
          <div style="font-size: 12.5px; color: {{ th.previewColor }}; margin-top: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ th.preview }}</div>
        </button>
      </sc-for>
    </aside>

    <!-- Conversation -->
    <main style="display: flex; flex-direction: column; min-height: 0; background: #F7F1E6;">
      <!-- Thread header -->
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; padding: 14px 24px; border-bottom: 2px solid #1F3A38; background: #FFFDF8; position: relative;">
        <div style="display: flex; gap: 12px; align-items: center;">
          <div style="width: 42px; height: 42px; background: #1F3A38; color: #F7F1E6; font-family: var(--tz-display); font-size: 16px; display: flex; align-items: center; justify-content: center;">{{ activeInitials }}</div>
          <div>
            <div style="font-weight: 700; font-size: 15px;">{{ activeName }} <span style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">{{ activeSub }}</span></div>
            <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23;">{{ activeRe }}</div>
          </div>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-family: var(--tz-mono); font-size: 11px; background: {{ maskBg }}; border: 1px solid #A85A23; color: #7A3E0F; padding: 5px 10px;">{{ maskLabel }}</span>
          <a href="/disputes" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #B8463A; color: #B8463A; background: #F7F1E6; padding: 8px 12px; text-decoration: none;">DISPUTE</a>
          <button onClick="{{ toggleReport }}" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 8px 12px; cursor: pointer;">REPORT</button>
        </div>
        <sc-if value="{{ reportOpen }}" hint-placeholder-val="{{ false }}">
          <div style="position: absolute; top: 64px; right: 24px; width: 300px; background: #FFFDF8; border: 2px solid #1F3A38; box-shadow: 6px 6px 0 #1F3A38; z-index: 50;">
            <div style="padding: 12px 16px; border-bottom: 2px solid #1F3A38; font-family: var(--tz-display); font-size: 14px; text-transform: uppercase;">Report this conversation</div>
            <sc-for list="{{ reportReasons }}" as="r" hint-placeholder-count="4">
              <button onClick="{{ r.pick }}" style="display: block; width: 100%; text-align: left; background: none; border: 0; border-bottom: 1px solid #E3D9C6; padding: 12px 16px; font-family: var(--tz-sans); font-size: 13.5px; cursor: pointer;">{{ r.label }}</button>
            </sc-for>
          </div>
        </sc-if>
      </div>

      <!-- Messages scroll -->
      <div style="flex: 1; overflow-y: auto; padding: 24px; display: grid; gap: 16px; align-content: start;">

        <div style="justify-self: center; font-family: var(--tz-mono); font-size: 11px; color: #6E6155; border: 1px dashed #C9BFB1; padding: 8px 14px; background: #FFFDF8; max-width: 520px; text-align: center; line-height: 1.5;">
          Routed through Twendezetu. Names, emails and phones are hidden on both sides until an offer is accepted. Payments outside the platform are not protected.
        </div>

        <sc-for list="{{ messages }}" as="msg" hint-placeholder-count="4">
          <!-- text bubble -->
          <sc-if value="{{ msg.isText }}" hint-placeholder-val="{{ true }}">
            <div style="justify-self: {{ msg.align }}; max-width: 70%;">
              <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #6E6155; margin-bottom: 4px; text-align: {{ msg.metaAlign }};">{{ msg.who }} · {{ msg.time }}</div>
              <div style="border: 2px solid #1F3A38; background: {{ msg.bg }}; color: {{ msg.fg }}; padding: 14px 16px; font-size: 14px; line-height: 1.55;">{{ msg.text }}</div>
            </div>
          </sc-if>
          <!-- masked warning -->
          <sc-if value="{{ msg.isWarn }}" hint-placeholder-val="{{ false }}">
            <div style="justify-self: {{ msg.align }}; max-width: 70%;">
              <div style="border: 2px dashed #B8463A; background: #FBEED8; padding: 12px 16px; font-size: 12.5px; line-height: 1.55; color: #7A3E0F;">{{ msg.text }}</div>
            </div>
          </sc-if>
          <!-- offer card -->
          <sc-if value="{{ msg.isOffer }}" hint-placeholder-val="{{ false }}">
            <div style="justify-self: start; max-width: 70%; border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 18px 20px;">
              <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #E8A472; letter-spacing: 0.08em;">[FORMAL OFFER · {{ msg.offerId }}]</div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 16px; margin-top: 8px; flex-wrap: wrap;">
                <span style="font-family: var(--tz-display); font-size: 20px; text-transform: uppercase;">{{ msg.offerTitle }}</span>
                <span style="font-family: var(--tz-display); font-size: 22px; color: #D97A3B;">{{ msg.offerPrice }}</span>
              </div>
              <div style="font-size: 12.5px; color: rgba(247,241,230,0.8); margin-top: 6px; line-height: 1.5;">{{ msg.offerNote }}</div>
              <sc-if value="{{ msg.offerOpen }}" hint-placeholder-val="{{ true }}">
                <div style="display: flex; gap: 8px; margin-top: 14px;">
                  <button onClick="{{ msg.accept }}" style="flex: 1; font-family: var(--tz-display); font-size: 14px; text-transform: uppercase; background: #D97A3B; color: #1F3A38; border: 0; padding: 11px; cursor: pointer;">Accept — {{ msg.offerPrice }}</button>
                  <button onClick="{{ msg.counter }}" style="font-family: var(--tz-mono); font-size: 11px; background: none; color: #F7F1E6; border: 1px solid rgba(247,241,230,0.5); padding: 11px 14px; cursor: pointer;">COUNTER</button>
                </div>
              </sc-if>
              <sc-if value="{{ msg.offerDone }}" hint-placeholder-val="{{ false }}">
                <div style="margin-top: 12px; border-top: 1px solid rgba(247,241,230,0.3); padding-top: 10px; font-family: var(--tz-mono); font-size: 11.5px; color: #E8A472;">{{ msg.offerStatus }}</div>
              </sc-if>
            </div>
          </sc-if>
          <!-- counter composer -->
          <sc-if value="{{ msg.isCounter }}" hint-placeholder-val="{{ false }}">
            <div style="justify-self: end; max-width: 70%; width: 100%; border: 2px solid #1F3A38; background: #FFFDF8; padding: 16px 18px;">
              <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #A85A23; letter-spacing: 0.08em;">[YOUR COUNTER-OFFER]</div>
              <div style="display: flex; gap: 8px; margin-top: 10px;">
                <input value="{{ counterVal }}" onChange="{{ setCounterVal }}" style="flex: 1; min-width: 0; border: 2px solid #1F3A38; background: #F7F1E6; padding: 11px 13px; font-family: var(--tz-mono); font-size: 13px; outline: none;">
                <button onClick="{{ sendCounter }}" style="font-family: var(--tz-display); font-size: 13px; text-transform: uppercase; background: #1F3A38; color: #F7F1E6; border: 0; padding: 0 18px; cursor: pointer;">Send counter</button>
              </div>
            </div>
          </sc-if>
          <!-- acceptance card -->
          <sc-if value="{{ msg.isAccepted }}" hint-placeholder-val="{{ false }}">
            <div style="justify-self: center; max-width: 560px; width: 100%; border: 2px solid #1F3A38; background: #FFFDF8; box-shadow: 5px 5px 0 #7B8B6E; padding: 20px 24px;">
              <div style="font-family: var(--tz-display); font-size: 20px; text-transform: uppercase;">✓ Offer accepted — contacts revealed</div>
              <div class="tw-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 14px; font-size: 13px;">
                <div style="border: 1px solid #E3D9C6; padding: 12px 14px;">
                  <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #A85A23;">{{ activeNameUpper }}</div>
                  <div style="margin-top: 4px;">+256 7•• ••• 214<br>kato@…tours.ug</div>
                </div>
                <div style="border: 1px solid #E3D9C6; padding: 12px 14px;">
                  <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #A85A23;">SHARED WITH THEM</div>
                  <div style="margin-top: 4px;">Your name + phone<br>Booking #BK-5521</div>
                </div>
              </div>
              <div style="font-size: 12.5px; color: #6E6155; margin-top: 12px; line-height: 1.5;">Added to both calendars with reminders. Deposit held in escrow until the job is confirmed. Manage in <a href="/my-twende" style="color: #A85A23;">My Twende</a>.</div>
            </div>
          </sc-if>
        </sc-for>
      </div>

      <!-- Composer -->
      <div style="border-top: 2px solid #1F3A38; background: #FFFDF8; padding: 16px 24px; display: flex; gap: 10px; align-items: center; position: relative;">
        <button onClick="{{ toggleAttach }}" style="font-size: 16px; border: 2px solid #1F3A38; background: {{ attachBg }}; padding: 10px 13px; cursor: pointer;">＋</button>
        <sc-if value="{{ attachOpen }}" hint-placeholder-val="{{ false }}">
          <div style="position: absolute; bottom: 72px; left: 24px; width: 250px; background: #FFFDF8; border: 2px solid #1F3A38; box-shadow: 6px 6px 0 #1F3A38; z-index: 50;">
            <sc-for list="{{ attachOpts }}" as="a" hint-placeholder-count="3">
              <button onClick="{{ a.pick }}" style="display: block; width: 100%; text-align: left; background: none; border: 0; border-bottom: 1px solid #E3D9C6; padding: 12px 16px; font-family: var(--tz-sans); font-size: 13.5px; cursor: pointer;">{{ a.label }}</button>
            </sc-for>
          </div>
        </sc-if>
        <input value="{{ draft }}" onChange="{{ setDraft }}" onKeyDown="{{ onKey }}" placeholder="Andika ujumbe… (contacts auto-masked)" style="flex: 1; min-width: 0; border: 2px solid #1F3A38; background: #F7F1E6; padding: 13px 16px; font-family: var(--tz-sans); font-size: 14px; outline: none;">
        <button onClick="{{ send }}" style="font-family: var(--tz-display); font-size: 15px; text-transform: uppercase; background: #1F3A38; color: #F7F1E6; border: 2px solid #1F3A38; padding: 12px 24px; cursor: pointer; box-shadow: 3px 3px 0 #D97A3B;">Send</button>
      </div>
    </main>
  </div>

</div>
`;

export default template;
