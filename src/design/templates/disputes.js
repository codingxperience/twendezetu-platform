// Markup for the disputes page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh;">

  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 18px 24px; border-bottom: 2px solid #1F3A38; background: #F7F1E6; position: sticky; top: 0; z-index: 40;">
    <div style="display: flex; align-items: center; gap: 24px;">
      <a href="/" style="text-decoration: none; color: #14201F; font-family: var(--tz-display); font-size: 26px; text-transform: uppercase; line-height: 0.9;">TWENDE<br><span style="color: #D97A3B;">ZETU</span></a>
      <span style="font-family: var(--tz-mono); font-size: 12px; background: #B8463A; color: #F7F1E6; padding: 5px 10px;">REFUNDS &amp; DISPUTES</span>
    </div>
    <a href="/my-twende" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; color: #14201F; text-decoration: none; padding: 10px 16px;">← MY TWENDE</a>
  </header>

  <div class="tw-2col" style="max-width: 1160px; margin: 0 auto; padding: 40px 24px 80px; display: grid; grid-template-columns: 1.3fr 0.8fr; gap: 44px; align-items: start;">

    <main>
      <!-- New request -->
      <sc-if value="{{ notSubmitted }}" hint-placeholder-val="{{ true }}">
        <div>
          <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em;">[Rejesho — open a request]</div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(32px, 4.5vw, 52px); text-transform: uppercase; line-height: 0.95; margin: 10px 0 8px;">Request a refund or open a dispute<span style="color: #D97A3B;">.</span></h1>
          <p style="font-size: 14px; color: #6E6155; line-height: 1.55; max-width: 560px; margin: 0 0 24px;">The moment you open a dispute, the money is <strong>frozen in escrow</strong> — no payout happens until it's resolved.</p>

          <!-- Which purchase -->
          <div style="font-family: var(--tz-mono); font-size: 11.5px; color: #A85A23; letter-spacing: 0.08em; margin-bottom: 10px;">1 · WHICH PURCHASE?</div>
          <div style="display: grid; gap: 10px; max-width: 620px;">
            <sc-for list="{{ purchases }}" as="pu" hint-placeholder-count="2">
              <button onClick="{{ pu.pick }}" style="text-align: left; display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: center; border: 2px solid #1F3A38; background: {{ pu.bg }}; color: {{ pu.fg }}; padding: 14px 18px; cursor: pointer;">
                <div>
                  <div style="font-family: var(--tz-display); font-size: 16px; text-transform: uppercase;">{{ pu.title }}</div>
                  <div style="font-family: var(--tz-mono); font-size: 11px; opacity: 0.75; margin-top: 3px;">{{ pu.meta }}</div>
                </div>
                <span style="font-family: var(--tz-display); font-size: 17px; color: #D97A3B;">{{ pu.amount }}</span>
              </button>
            </sc-for>
          </div>

          <!-- Reason -->
          <div style="font-family: var(--tz-mono); font-size: 11.5px; color: #A85A23; letter-spacing: 0.08em; margin: 26px 0 10px;">2 · WHAT HAPPENED?</div>
          <div style="display: grid; gap: 8px; max-width: 620px;">
            <sc-for list="{{ reasons }}" as="re" hint-placeholder-count="4">
              <button onClick="{{ re.pick }}" style="text-align: left; display: flex; gap: 12px; align-items: center; border: 2px solid #1F3A38; background: {{ re.bg }}; color: {{ re.fg }}; padding: 13px 16px; cursor: pointer;">
                <span style="width: 18px; height: 18px; border: 2px solid currentColor; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <sc-if value="{{ re.on }}" hint-placeholder-val="{{ false }}"><span style="width: 8px; height: 8px; border-radius: 999px; background: #D97A3B;"></span></sc-if>
                </span>
                <div>
                  <div style="font-weight: 700; font-size: 14px;">{{ re.title }}</div>
                  <div style="font-size: 12px; opacity: 0.75; margin-top: 1px;">{{ re.desc }}</div>
                </div>
              </button>
            </sc-for>
          </div>

          <!-- Details + evidence -->
          <div style="font-family: var(--tz-mono); font-size: 11.5px; color: #A85A23; letter-spacing: 0.08em; margin: 26px 0 10px;">3 · TELL US MORE (SHOWN TO THE OTHER PARTY)</div>
          <textarea rows="4" value="{{ detail }}" onChange="{{ setDetail }}" placeholder="What went wrong, when, and what you'd consider fair…" style="width: 100%; max-width: 620px; box-sizing: border-box; border: 2px solid #1F3A38; background: #FFFDF8; padding: 14px 16px; font-family: var(--tz-sans); font-size: 14px; outline: none; resize: vertical;"></textarea>
          <div style="display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;">
            <button onClick="{{ addEvidence }}" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: {{ evBtnBg }}; padding: 11px 16px; cursor: pointer;">{{ evBtnLabel }}</button>
            <span style="align-self: center; font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">PHOTOS · RECEIPTS · SCREENSHOTS — OPTIONAL BUT POWERFUL</span>
          </div>

          <button onClick="{{ submit }}" style="margin-top: 26px; font-family: var(--tz-display); font-size: 16px; text-transform: uppercase; background: {{ submitBg }}; color: {{ submitFg }}; border: 2px solid #1F3A38; padding: 14px 30px; cursor: pointer; box-shadow: 4px 4px 0 #B8463A;">{{ submitLabel }}</button>
          <sc-if value="{{ formError }}" hint-placeholder-val="{{ false }}">
            <div style="font-size: 12.5px; color: #B8463A; margin-top: 10px;">{{ formError }}</div>
          </sc-if>
        </div>
      </sc-if>

      <!-- Submitted: case timeline -->
      <sc-if value="{{ submitted }}" hint-placeholder-val="{{ false }}">
        <div>
          <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em;">[Kesi yako — case #DSP-1042]</div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(32px, 4.5vw, 52px); text-transform: uppercase; line-height: 0.95; margin: 10px 0 8px;">Case opened<span style="color: #D97A3B;">.</span> Money frozen<span style="color: #D97A3B;">.</span></h1>
          <p style="font-size: 14px; color: #3A2F25; line-height: 1.55; max-width: 560px;">The other party has <strong>72 hours</strong> to respond. Most cases settle right there — if not, the platform decides within 5 business days and the refund goes back to your original payment method.</p>
          <div style="border: 2px solid #1F3A38; background: #FFFDF8; max-width: 620px; margin-top: 20px;">
            <sc-for list="{{ timeline }}" as="tl" hint-placeholder-count="4">
              <div style="display: grid; grid-template-columns: 34px 1fr; gap: 14px; padding: 16px 20px; border-bottom: 1px solid #E3D9C6;">
                <span style="width: 26px; height: 26px; border: 2px solid #1F3A38; background: {{ tl.bg }}; color: {{ tl.fg }}; font-family: var(--tz-mono); font-size: 12px; display: flex; align-items: center; justify-content: center;">{{ tl.mark }}</span>
                <div>
                  <div style="font-family: var(--tz-display); font-size: 15px; text-transform: uppercase; color: {{ tl.titleColor }};">{{ tl.title }}</div>
                  <div style="font-size: 12.5px; color: #6E6155; line-height: 1.5; margin-top: 2px;">{{ tl.desc }}</div>
                </div>
              </div>
            </sc-for>
          </div>
          <div style="display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap;">
            <a href="/messages" style="font-family: var(--tz-display); font-size: 14px; text-transform: uppercase; background: #1F3A38; color: #F7F1E6; border: 2px solid #1F3A38; padding: 12px 22px; text-decoration: none;">Open case thread →</a>
            <button onClick="{{ withdraw }}" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #B8463A; color: #B8463A; background: none; padding: 12px 18px; cursor: pointer;">WITHDRAW CASE</button>
          </div>
        </div>
      </sc-if>
    </main>

    <!-- Right rail -->
    <aside class="tw-sticky" style="position: sticky; top: 100px; display: grid; gap: 16px;">
      <div style="border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 20px 22px;">
        <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">[How refunds work]</div>
        <div style="display: grid; gap: 12px; margin-top: 12px; font-size: 13px; line-height: 1.55;">
          <div><strong style="color: #D97A3B;">Free events:</strong> nothing to refund — just cancel your RSVP.</div>
          <div><strong style="color: #D97A3B;">Event cancelled:</strong> automatic 100% refund to everyone, no case needed.</div>
          <div><strong style="color: #D97A3B;">Tickets:</strong> full refund up to 48h before; after that, the organizer's policy applies.</div>
          <div><strong style="color: #D97A3B;">Provider bookings:</strong> escrow isn't released until you confirm the job happened — disputes freeze it instantly.</div>
        </div>
      </div>
      <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 20px 22px;">
        <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; letter-spacing: 0.08em;">[The timeline]</div>
        <div style="font-family: var(--tz-mono); font-size: 11.5px; color: #3A2F25; line-height: 2; margin-top: 10px;">
          OPENED → ESCROW FROZEN<br>
          → OTHER PARTY: 72H TO RESPOND<br>
          → SETTLE, OR PLATFORM DECIDES (5 DAYS)<br>
          → REFUND TO ORIGINAL METHOD (3–5 DAYS)
        </div>
      </div>
    </aside>
  </div>

</div>
`;

export default template;
