// Markup for the checkin page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #14201F; color: #F7F1E6; min-height: 100vh;">

  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 16px 24px; border-bottom: 2px solid #F7F1E6;">
    <div style="display: flex; align-items: center; gap: 20px;">
      <a href="/provider-dashboard" style="text-decoration: none; color: #F7F1E6; font-family: var(--tz-display); font-size: 22px; text-transform: uppercase; line-height: 0.9;">TWENDE<span style="color: #D97A3B;">ZETU</span></a>
      <span style="font-family: var(--tz-mono); font-size: 12px; background: #D97A3B; color: #14201F; padding: 5px 10px;">DOOR CHECK-IN</span>
    </div>
    <div style="display: flex; gap: 12px; align-items: center; font-family: var(--tz-mono); font-size: 11px; color: rgba(247,241,230,0.7);">
      <span style="width: 8px; height: 8px; border-radius: 999px; background: #7B8B6E; display: inline-block;"></span>
      OFFLINE-READY · SYNCS WHEN ONLINE
    </div>
  </header>

  <div style="max-width: 760px; margin: 0 auto; padding: 20px 24px 40px;">
    <div style="font-family: var(--tz-mono); font-size: 12px; color: #E8A472; letter-spacing: 0.08em;">[Nyama Choma Festival Nanenane · Gate: Communipaw Ave]</div>
    <h1 style="font-family: var(--tz-display); font-size: clamp(28px, 5vw, 44px); text-transform: uppercase; line-height: 0.95; margin: 8px 0 20px;">Scan tickets at the door<span style="color: #D97A3B;">.</span></h1>

    <!-- Live counts -->
    <div class="tw-2col" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; border: 2px solid #F7F1E6; background: #F7F1E6; margin-bottom: 20px;">
      <div style="background: #14201F; padding: 16px 18px;">
        <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #E8A472;">ADMITTED</div>
        <div style="font-family: var(--tz-display); font-size: 40px; line-height: 1;">{{ admitted }}</div>
      </div>
      <div style="background: #14201F; padding: 16px 18px;">
        <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #E8A472;">EXPECTED</div>
        <div style="font-family: var(--tz-display); font-size: 40px; line-height: 1;">214</div>
      </div>
      <div style="background: #14201F; padding: 16px 18px;">
        <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #E8A472;">DUPLICATES BLOCKED</div>
        <div style="font-family: var(--tz-display); font-size: 40px; line-height: 1; color: #E8A472;">{{ blocked }}</div>
      </div>
    </div>

    <!-- Scanner viewport -->
    <div style="position: relative; border: 2px solid #F7F1E6; background: #0C1615; aspect-ratio: 4/3; overflow: hidden; display: flex; align-items: center; justify-content: center;">
      <!-- result flash -->
      <sc-if value="{{ hasResult }}" hint-placeholder-val="{{ false }}">
        <div style="position: absolute; inset: 0; z-index: 5; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 24px; background: {{ resultBg }};">
          <div style="font-family: var(--tz-display); font-size: clamp(30px, 7vw, 56px); text-transform: uppercase; line-height: 0.95; color: {{ resultFg }};">{{ resultTitle }}</div>
          <div style="font-family: var(--tz-mono); font-size: 13px; color: {{ resultFg }}; margin-top: 8px; opacity: 0.85;">{{ resultSub }}</div>
        </div>
      </sc-if>
      <!-- idle camera framing -->
      <div style="position: absolute; inset: 14%; border: 2px dashed rgba(247,241,230,0.4);"></div>
      <div style="position: absolute; left: 14%; right: 14%; height: 2px; background: #D97A3B; box-shadow: 0 0 12px #D97A3B; animation: tw-scan 2.4s ease-in-out infinite;"></div>
      <div style="font-family: var(--tz-mono); font-size: 12px; color: rgba(247,241,230,0.5); z-index: 1;">CAMERA VIEWFINDER — POINT AT A TICKET QR</div>
    </div>

    <!-- Simulate scans -->
    <div style="display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap;">
      <button onClick="{{ scanValid }}" style="flex: 1; min-width: 150px; font-family: var(--tz-display); font-size: 15px; text-transform: uppercase; background: #7B8B6E; color: #14201F; border: 2px solid #F7F1E6; padding: 13px; cursor: pointer;">Simulate valid scan</button>
      <button onClick="{{ scanDup }}" style="flex: 1; min-width: 150px; font-family: var(--tz-display); font-size: 15px; text-transform: uppercase; background: #E8A472; color: #14201F; border: 2px solid #F7F1E6; padding: 13px; cursor: pointer;">Simulate duplicate</button>
      <button onClick="{{ scanInvalid }}" style="flex: 1; min-width: 150px; font-family: var(--tz-display); font-size: 15px; text-transform: uppercase; background: #B8463A; color: #F7F1E6; border: 2px solid #F7F1E6; padding: 13px; cursor: pointer;">Simulate invalid</button>
    </div>

    <!-- Manual entry -->
    <div style="border: 2px solid #F7F1E6; background: #1F3A38; padding: 16px 18px; margin-top: 20px;">
      <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">[No camera? Type the code under the QR]</div>
      <div style="display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;">
        <input value="{{ manual }}" onChange="{{ setManual }}" placeholder="e.g. TW-8841" style="flex: 1; min-width: 160px; border: 2px solid #F7F1E6; background: #14201F; color: #F7F1E6; padding: 12px 14px; font-family: var(--tz-mono); font-size: 15px; letter-spacing: 0.15em; outline: none; text-transform: uppercase;">
        <button onClick="{{ checkManual }}" style="font-family: var(--tz-display); font-size: 15px; text-transform: uppercase; background: #D97A3B; color: #14201F; border: 2px solid #F7F1E6; padding: 12px 22px; cursor: pointer;">Check in</button>
      </div>
      <div style="font-family: var(--tz-mono); font-size: 10.5px; color: rgba(247,241,230,0.55); margin-top: 8px; line-height: 1.5;">Valid demo codes: TW-8841, TW-8842, TW-8843 · try one twice to see a duplicate block</div>
    </div>

    <!-- Recent scans -->
    <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em; margin: 22px 0 10px;">[Recent scans]</div>
    <div style="display: grid; gap: 6px;">
      <sc-for list="{{ log }}" as="l" hint-placeholder-count="3">
        <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 12px; align-items: center; border: 1px solid rgba(247,241,230,0.25); padding: 10px 14px;">
          <span style="font-size: 15px;">{{ l.icon }}</span>
          <div>
            <div style="font-family: var(--tz-mono); font-size: 13px;">{{ l.code }} · {{ l.name }}</div>
            <div style="font-family: var(--tz-mono); font-size: 10.5px; color: rgba(247,241,230,0.55);">{{ l.note }}</div>
          </div>
          <span style="font-family: var(--tz-mono); font-size: 10.5px; color: {{ l.color }};">{{ l.status }}</span>
        </div>
      </sc-for>
      <sc-if value="{{ empty }}" hint-placeholder-val="{{ true }}">
        <div style="font-family: var(--tz-mono); font-size: 12px; color: rgba(247,241,230,0.4); padding: 14px; text-align: center;">No scans yet — admit your first guest above.</div>
      </sc-if>
    </div>

    <div style="font-family: var(--tz-mono); font-size: 10.5px; color: rgba(247,241,230,0.45); margin-top: 22px; line-height: 1.7;">
      HOW IT WORKS: each ticket carries a signed QR that rotates every 60s, so screenshots can't be reused. Scans are validated on-device and work offline — the door keeps admitting during a signal drop and reconciles with the server when it reconnects. Duplicates and refunded/disputed tickets are rejected instantly.
    </div>
  </div>
</div>
`;

export default template;
