// Markup for the checkin page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #14201F; color: #F7F1E6; min-height: 100vh;">

  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 16px 24px; border-bottom: 2px solid #F7F1E6;">
    <div style="display: flex; align-items: center; gap: 20px;">
      <a href="/my-twende?tab=posts" style="text-decoration: none; color: #F7F1E6; font-family: var(--tz-display); font-size: 22px; text-transform: uppercase; line-height: 0.9;">TWENDE<span style="color: #D97A3B;">ZETU</span></a>
      <span style="font-family: var(--tz-mono); font-size: 12px; background: #D97A3B; color: #14201F; padding: 5px 10px;">DOOR CHECK-IN</span>
    </div>
    <div style="display: flex; gap: 12px; align-items: center; font-family: var(--tz-mono); font-size: 11px; color: rgba(247,241,230,0.7);">
      <span style="width: 8px; height: 8px; border-radius: 999px; background: {{ liveDot }}; display: inline-block;"></span>
      {{ liveLabel }}
    </div>
  </header>

  <div style="max-width: 760px; margin: 0 auto; padding: 20px 24px 40px;">
    <!-- Pick an event -->
    <sc-if value="{{ picking }}">
      <h1 style="font-family: var(--tz-display); font-size: clamp(28px, 5vw, 44px); text-transform: uppercase; line-height: 0.95; margin: 8px 0 12px;">Which door are you on<span style="color: #D97A3B;">?</span></h1>
      <p style="font-size: 14px; color: rgba(247,241,230,0.75); margin: 0 0 20px;">Events you organise, from two days ago onward.</p>
      <sc-if value="{{ noEvents }}"><div style="border: 2px dashed rgba(247,241,230,0.4); padding: 20px; font-size: 14px; color: rgba(247,241,230,0.75);">You have no upcoming events to check people into. <a href="/create-event" style="color: #E8A472;">Post one →</a></div></sc-if>
      <div style="display: grid; gap: 10px;">
        <sc-for list="{{ events }}" as="ev"><a href="{{ ev.href }}" style="display: flex; justify-content: space-between; gap: 12px; border: 2px solid #F7F1E6; padding: 16px 18px; color: #F7F1E6; text-decoration: none;"><span style="font-family: var(--tz-display); font-size: 18px; text-transform: uppercase;">{{ ev.title }}</span><span style="font-family: var(--tz-mono); font-size: 12px; color: #E8A472;">OPEN THE DOOR →</span></a></sc-for>
      </div>
    </sc-if>

    <sc-if value="{{ scanning }}">
    <div style="font-family: var(--tz-mono); font-size: 12px; color: #E8A472; letter-spacing: 0.08em;">[{{ eventTitle }} · <a href="/checkin" style="color: #E8A472;">change</a>]</div>
    <h1 style="font-family: var(--tz-display); font-size: clamp(28px, 5vw, 44px); text-transform: uppercase; line-height: 0.95; margin: 8px 0 20px;">Scan tickets at the door<span style="color: #D97A3B;">.</span></h1>

    <!-- Live counts -->
    <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 2px; border: 2px solid #F7F1E6; background: #F7F1E6; margin-bottom: 20px;">
      <div style="background: #14201F; padding: 14px clamp(10px, 3vw, 18px);">
        <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #E8A472;">ADMITTED</div>
        <div style="font-family: var(--tz-display); font-size: clamp(30px, 8vw, 40px); line-height: 1; margin-top: 4px;">{{ admitted }}</div>
      </div>
      <div style="background: #14201F; padding: 14px clamp(10px, 3vw, 18px);">
        <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #E8A472;">ISSUED</div>
        <div style="font-family: var(--tz-display); font-size: clamp(30px, 8vw, 40px); line-height: 1; margin-top: 4px;">{{ total }}</div>
      </div>
      <div style="background: #14201F; padding: 14px clamp(10px, 3vw, 18px);">
        <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #E8A472;">TURNED AWAY</div>
        <div style="font-family: var(--tz-display); font-size: clamp(30px, 8vw, 40px); line-height: 1; margin-top: 4px; color: #E8A472;">{{ blocked }}</div>
      </div>
    </div>

    <!-- Scanner viewport -->
    <div style="position: relative; border: 2px solid #F7F1E6; background: #0C1615; aspect-ratio: 4/3; overflow: hidden; display: flex; align-items: center; justify-content: center;">
      <!-- result flash -->
      <video id="checkin-camera" muted playsinline autoplay aria-label="Camera" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: {{ videoDisplay }};"></video>
      <sc-if value="{{ hasResult }}" hint-placeholder-val="{{ false }}">
        <div role="alert" style="position: absolute; inset: 0; z-index: 5; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 24px; background: {{ resultBg }};">
          <div style="font-family: var(--tz-display); font-size: clamp(30px, 7vw, 56px); text-transform: uppercase; line-height: 0.95; color: {{ resultFg }};">{{ resultTitle }}</div>
          <div style="font-family: var(--tz-mono); font-size: 13px; color: {{ resultFg }}; margin-top: 8px; opacity: 0.85;">{{ resultSub }}</div>
        </div>
      </sc-if>
      <!-- idle camera framing -->
      <div style="position: absolute; inset: 14%; border: 2px dashed rgba(247,241,230,0.4);"></div>
      <sc-if value="{{ cameraOn }}"><div data-scan-line style="position: absolute; left: 14%; right: 14%; height: 2px; background: #D97A3B; box-shadow: 0 0 12px #D97A3B; animation: tw-scan 2.4s ease-in-out infinite; z-index: 2;"></div></sc-if>
      <sc-if value="{{ cameraOff }}"><div style="font-family: var(--tz-mono); font-size: 12px; color: rgba(247,241,230,0.6); z-index: 1; text-align: center; padding: 0 24px; line-height: 1.6;">{{ cameraNote }}</div></sc-if>
    </div>

    <div style="display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap;">
      <sc-if value="{{ canUseCamera }}">
        <button onClick="{{ toggleCamera }}" style="flex: 1; min-width: 180px; font-family: var(--tz-display); font-size: 15px; text-transform: uppercase; background: {{ cameraBtnBg }}; color: #14201F; border: 2px solid #F7F1E6; padding: 13px; cursor: pointer;">{{ cameraBtnLabel }}</button>
      </sc-if>
    </div>

    <!-- Manual entry -->
    <div style="border: 2px solid #F7F1E6; background: #1F3A38; padding: 16px 18px; margin-top: 20px;">
      <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">[No camera? Type the code under the QR]</div>
      <div style="display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;">
        <input value="{{ manual }}" onChange="{{ setManual }}" onKeyDown="{{ manualKey }}" autocomplete="off" autocapitalize="characters" aria-label="Ticket code" placeholder="e.g. TW-7Q2K-M9XD" style="flex: 1; min-width: 160px; border: 2px solid #F7F1E6; background: #14201F; color: #F7F1E6; padding: 12px 14px; font-family: var(--tz-mono); font-size: 15px; letter-spacing: 0.15em; outline: none; text-transform: uppercase;">
        <button onClick="{{ checkManual }}" aria-busy="{{ checking }}" style="font-family: var(--tz-display); font-size: 15px; text-transform: uppercase; background: #D97A3B; color: #14201F; border: 2px solid #F7F1E6; padding: 12px 22px; cursor: pointer;">Check in</button>
      </div>
      <div style="font-family: var(--tz-mono); font-size: 10.5px; color: rgba(247,241,230,0.55); margin-top: 8px; line-height: 1.5;">Letters that look alike are forgiven: O reads as 0, I and L as 1.</div>
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
      HOW IT WORKS: each QR carries a signature, so a forged or edited code is refused before anything is looked up. Admission is a single database write, so two gates can never let the same ticket in twice; the second scan shows when it was first used. Refunded and voided tickets are refused. Counts refresh every few seconds, across every phone at every gate.
    </div>
    </sc-if>
  </div>
</div>
`;

export default template;
