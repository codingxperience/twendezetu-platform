// Markup for the disputes page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh;">

  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 18px 24px; border-bottom: 2px solid #1F3A38; background: #F7F1E6; position: sticky; top: 0; z-index: 40;">
    <div style="display: flex; align-items: center; gap: 24px;">
      <a href="/" class="tz-logo-link" aria-label="Twendezetu home"><img src="/brand/logo.png" alt="Twendezetu" width="1211" height="229" class="tz-logo tz-logo--md"></a>
      <span style="font-family: var(--tz-mono); font-size: 12px; background: #B8463A; color: #F7F1E6; padding: 5px 10px;">REFUNDS &amp; DISPUTES</span>
    </div>
    <a href="/my-twende" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; color: #14201F; text-decoration: none; padding: 10px 16px;">← MY TWENDE</a>
  </header>

  <div class="tw-2col" style="max-width: 1160px; margin: 0 auto; padding: 40px 24px 80px; display: grid; grid-template-columns: 1.3fr 0.8fr; gap: 44px; align-items: start;">

    <section>
      <!-- New case -->
      <sc-if value="{{ creating }}" hint-placeholder-val="{{ true }}">
        <div>
          <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em;">[Rejesho — open a case]</div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(32px, 4.5vw, 52px); text-transform: uppercase; line-height: 0.95; margin: 10px 0 8px;">Request a refund or open a dispute<span style="color: #D97A3B;">.</span></h1>
          <p style="font-size: 14px; color: #6E6155; line-height: 1.55; max-width: 560px; margin: 0 0 24px;">Opening a case <strong>freezes the money</strong>: an organizer's ticket payout waits and a booking's escrow stops releasing until the case closes.</p>

          <div style="font-family: var(--tz-mono); font-size: 11.5px; color: #A85A23; letter-spacing: 0.08em; margin-bottom: 10px;">1 · WHICH PURCHASE?</div>
          <sc-if value="{{ noPurchases }}" hint-placeholder-val="{{ false }}">
            <div style="max-width: 620px; border: 2px dashed #A85A23; background: #FFFDF8; padding: 18px 20px; font-size: 13.5px; color: #3A2F25; line-height: 1.55;">Nothing to open a case on. Paid tickets and funded bookings from the last 60 days show up here, unless a case on them was already decided.</div>
          </sc-if>
          <div style="display: grid; gap: 10px; max-width: 620px;">
            <sc-for list="{{ purchases }}" as="pu" hint-placeholder-count="2">
              <button onClick="{{ pu.pick }}" style="text-align: left; display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: center; border: 2px solid #1F3A38; background: {{ pu.bg }}; color: {{ pu.fg }}; padding: 14px 18px; cursor: pointer;">
                <div style="min-width: 0;">
                  <div style="font-family: var(--tz-display); font-size: 16px; text-transform: uppercase;">{{ pu.title }}</div>
                  <div style="font-family: var(--tz-mono); font-size: 11px; opacity: 0.75; margin-top: 3px;">{{ pu.meta }}</div>
                </div>
                <span style="font-family: var(--tz-display); font-size: 17px; color: #D97A3B;">{{ pu.amount }}</span>
              </button>
            </sc-for>
          </div>

          <div style="font-family: var(--tz-mono); font-size: 11.5px; color: #A85A23; letter-spacing: 0.08em; margin: 26px 0 10px;">2 · WHAT HAPPENED?</div>
          <div style="display: grid; gap: 8px; max-width: 620px;">
            <sc-for list="{{ reasons }}" as="re" hint-placeholder-count="4">
              <button onClick="{{ re.pick }}" role="radio" aria-checked="{{ re.on }}" style="text-align: left; display: flex; gap: 12px; align-items: center; border: 2px solid #1F3A38; background: {{ re.bg }}; color: {{ re.fg }}; padding: 13px 16px; cursor: pointer;">
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

          <div style="font-family: var(--tz-mono); font-size: 11.5px; color: #A85A23; letter-spacing: 0.08em; margin: 26px 0 10px;">3 · TELL US MORE (THE OTHER PARTY READS THIS)</div>
          <textarea rows="4" maxlength="2000" value="{{ detail }}" onChange="{{ setDetail }}" aria-label="What happened" placeholder="What went wrong, when, and what you'd consider fair…" style="width: 100%; max-width: 620px; box-sizing: border-box; border: 2px solid #1F3A38; background: #FFFDF8; padding: 14px 16px; font-family: var(--tz-sans); font-size: 14px; outline: none; resize: vertical;"></textarea>
          <div style="max-width: 620px; text-align: right; font-family: var(--tz-mono); font-size: 10.5px; color: #6E6155; margin-top: 4px;">{{ detailCount }}</div>
          <div style="display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap; align-items: center;">
            <label style="position: relative; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #FFFDF8; padding: 11px 16px; cursor: pointer;">＋ ADD EVIDENCE<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange="{{ attachEvidence }}" aria-label="Add a photo or PDF as evidence" style="position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none;"></label>
            <span style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">PHOTOS · RECEIPTS · SCREENSHOTS — JPG, PNG OR PDF, UP TO 4 MB</span>
          </div>
          <sc-if value="{{ uploading }}" hint-placeholder-val="{{ false }}"><div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; margin-top: 8px;">UPLOADING…</div></sc-if>
          <sc-if value="{{ hasFiles }}" hint-placeholder-val="{{ false }}">
            <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; max-width: 620px;">
              <sc-for list="{{ files }}" as="fi" hint-placeholder-count="1">
                <span style="display: inline-flex; align-items: center; gap: 8px; border: 1.5px solid #1F3A38; background: #EFE7D6; padding: 6px 10px; font-size: 12px;">📎 {{ fi.name }}<button onClick="{{ fi.remove }}" aria-label="Remove file" style="border: none; background: none; cursor: pointer; font-size: 14px; line-height: 1; color: #B8463A;">×</button></span>
              </sc-for>
            </div>
          </sc-if>

          <button onClick="{{ submit }}" style="margin-top: 26px; font-family: var(--tz-display); font-size: 16px; text-transform: uppercase; background: {{ submitBg }}; color: #14201F; border: 2px solid #1F3A38; padding: 14px 30px; cursor: pointer; box-shadow: 4px 4px 0 #B8463A;">{{ submitLabel }}</button>
          <sc-if value="{{ formError }}" hint-placeholder-val="{{ false }}">
            <div role="alert" style="font-size: 12.5px; color: #B8463A; margin-top: 12px;">{{ formError }}</div>
          </sc-if>
        </div>
      </sc-if>

      <!-- One case -->
      <sc-if value="{{ viewing }}" hint-placeholder-val="{{ false }}">
        <div>
          <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em;">[Kesi — case {{ caseRef }} · {{ caseStatus }}]</div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(32px, 4.5vw, 52px); text-transform: uppercase; line-height: 0.95; margin: 10px 0 18px;">{{ heading }}<span style="color: #D97A3B;">.</span></h1>

          <div style="border: 2px solid #1F3A38; background: #FFFDF8; max-width: 620px;">
            <div style="display: grid; grid-template-columns: 1fr auto; gap: 12px; padding: 16px 20px; border-bottom: 1px solid #E3D9C6;">
              <div style="min-width: 0;">
                <div style="font-family: var(--tz-display); font-size: 16px; text-transform: uppercase;">{{ subject }}</div>
                <div style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155; margin-top: 3px;">{{ reason }}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-family: var(--tz-display); font-size: 20px; color: #D97A3B;">{{ amount }}</div>
                <sc-if value="{{ wasRefunded }}" hint-placeholder-val="{{ false }}"><div style="font-family: var(--tz-mono); font-size: 10.5px; color: #7B8B6E; margin-top: 2px;">{{ refunded }} REFUNDED</div></sc-if>
              </div>
            </div>
            <div style="padding: 16px 20px;">
              <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #A85A23; letter-spacing: 0.08em;">{{ detailBy }}</div>
              <p style="font-size: 14px; line-height: 1.6; color: #3A2F25; margin: 6px 0 0; white-space: pre-line;">{{ caseDetail }}</p>
              <sc-if value="{{ hasEvidence }}" hint-placeholder-val="{{ false }}">
                <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 12px;">
                  <sc-for list="{{ evidence }}" as="ev" hint-placeholder-count="1">
                    <a href="{{ ev.href }}" target="_blank" rel="noopener" style="display: inline-flex; gap: 8px; align-items: center; border: 1.5px solid #1F3A38; background: #EFE7D6; color: #14201F; padding: 6px 10px; font-size: 12px; text-decoration: none;">📎 {{ ev.name }} <span style="font-family: var(--tz-mono); font-size: 9.5px; color: #6E6155;">{{ ev.by }}</span></a>
                  </sc-for>
                </div>
              </sc-if>
            </div>
          </div>

          <!-- Answer: only the other party, only while the case is open -->
          <sc-if value="{{ canRespond }}" hint-placeholder-val="{{ false }}">
            <div style="max-width: 620px; margin-top: 18px; border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 18px 20px;">
              <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">[YOUR ANSWER]</div>
              <p style="font-size: 13px; line-height: 1.55; margin: 8px 0 14px; opacity: 0.9;">Refund in full, refund part and keep the rest, or contest and let the resolution team decide. Most cases settle here.</p>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button onClick="{{ refundFull }}" style="font-family: var(--tz-display); font-size: 14px; text-transform: uppercase; background: #D97A3B; color: #14201F; border: 2px solid #F7F1E6; padding: 12px 18px; cursor: pointer;">{{ refundFullLabel }}</button>
                <button onClick="{{ refundPart }}" style="font-family: var(--tz-mono); font-size: 12px; background: none; color: #F7F1E6; border: 2px solid #F7F1E6; padding: 12px 16px; cursor: pointer;">REFUND PART</button>
                <button onClick="{{ contest }}" style="font-family: var(--tz-mono); font-size: 12px; background: none; color: #E8A472; border: 2px solid #E8A472; padding: 12px 16px; cursor: pointer;">CONTEST</button>
              </div>
            </div>
          </sc-if>

          <div style="font-family: var(--tz-mono); font-size: 11.5px; color: #A85A23; letter-spacing: 0.08em; margin: 26px 0 10px;">TIMELINE</div>
          <div style="border: 2px solid #1F3A38; background: #FFFDF8; max-width: 620px;">
            <sc-for list="{{ timeline }}" as="tl" hint-placeholder-count="3">
              <div style="display: grid; grid-template-columns: 34px 1fr; gap: 14px; padding: 16px 20px; border-bottom: 1px solid #E3D9C6;">
                <span style="width: 26px; height: 26px; border: 2px solid #1F3A38; background: {{ tl.bg }}; color: {{ tl.fg }}; font-family: var(--tz-mono); font-size: 12px; display: flex; align-items: center; justify-content: center;">{{ tl.mark }}</span>
                <div style="min-width: 0;">
                  <div style="display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
                    <div style="font-family: var(--tz-display); font-size: 15px; text-transform: uppercase; color: {{ tl.titleColor }};">{{ tl.title }}</div>
                    <sc-if value="{{ tl.hasWhen }}" hint-placeholder-val="{{ true }}"><span style="font-family: var(--tz-mono); font-size: 10.5px; color: #6E6155;">{{ tl.when }}</span></sc-if>
                  </div>
                  <div style="font-size: 12.5px; color: #6E6155; line-height: 1.5; margin-top: 2px; white-space: pre-line; overflow-wrap: anywhere;">{{ tl.desc }}</div>
                </div>
              </div>
            </sc-for>
          </div>

          <!-- Notes and evidence while the case is live -->
          <sc-if value="{{ canNote }}" hint-placeholder-val="{{ false }}">
            <div style="max-width: 620px; margin-top: 18px;">
              <textarea rows="3" maxlength="1000" value="{{ note }}" onChange="{{ setNote }}" aria-label="Add a note to the case" placeholder="Add context or answer a question. Both sides and the resolution team read this." style="width: 100%; box-sizing: border-box; border: 2px solid #1F3A38; background: #FFFDF8; padding: 12px 14px; font-family: var(--tz-sans); font-size: 14px; outline: none; resize: vertical;"></textarea>
              <sc-if value="{{ hasNoteFiles }}" hint-placeholder-val="{{ false }}">
                <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px;">
                  <sc-for list="{{ noteFiles }}" as="nf" hint-placeholder-count="1">
                    <span style="display: inline-flex; align-items: center; gap: 8px; border: 1.5px solid #1F3A38; background: #EFE7D6; padding: 6px 10px; font-size: 12px;">📎 {{ nf.name }}<button onClick="{{ nf.remove }}" aria-label="Remove file" style="border: none; background: none; cursor: pointer; font-size: 14px; line-height: 1; color: #B8463A;">×</button></span>
                  </sc-for>
                </div>
              </sc-if>
              <div style="display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap;">
                <label style="position: relative; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #FFFDF8; padding: 11px 16px; cursor: pointer;">＋ ATTACH<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange="{{ attachNote }}" aria-label="Attach a photo or PDF to the case" style="position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none;"></label>
                <button onClick="{{ sendNote }}" style="font-family: var(--tz-display); font-size: 14px; text-transform: uppercase; background: #1F3A38; color: #F7F1E6; border: 2px solid #1F3A38; padding: 11px 20px; cursor: pointer;">{{ noteLabel }}</button>
                <sc-if value="{{ canWithdraw }}" hint-placeholder-val="{{ false }}">
                  <button onClick="{{ withdraw }}" style="margin-left: auto; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #B8463A; color: #B8463A; background: none; padding: 11px 16px; cursor: pointer;">WITHDRAW CASE</button>
                </sc-if>
              </div>
            </div>
          </sc-if>

          <a href="/disputes" style="display: inline-block; margin-top: 24px; font-family: var(--tz-mono); font-size: 12px; color: #14201F;">← Open a different case</a>
        </div>
      </sc-if>
    </section>

    <!-- Right rail -->
    <aside class="tw-sticky" style="position: sticky; top: 100px; display: grid; gap: 16px;">
      <sc-if value="{{ hasCases }}" hint-placeholder-val="{{ false }}">
        <div style="border: 2px solid #1F3A38; background: #FFFDF8;">
          <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; letter-spacing: 0.08em; padding: 14px 18px 10px;">[Your cases]</div>
          <sc-for list="{{ cases }}" as="ca" hint-placeholder-count="2">
            <a href="{{ ca.href }}" style="display: block; padding: 12px 18px; border-top: 1px solid #E3D9C6; background: {{ ca.bg }}; color: #14201F; text-decoration: none;">
              <div style="display: flex; justify-content: space-between; gap: 10px; font-family: var(--tz-mono); font-size: 10.5px; color: #6E6155;"><span>{{ ca.reference }} · {{ ca.side }}</span><span>{{ ca.amount }}</span></div>
              <div style="font-size: 13px; font-weight: 600; margin-top: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ ca.subject }}</div>
              <div style="font-family: var(--tz-mono); font-size: 10.5px; color: {{ ca.statusColor }}; margin-top: 3px;">{{ ca.status }}</div>
            </a>
          </sc-for>
        </div>
      </sc-if>
      <div style="border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 20px 22px;">
        <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em;">[How refunds work]</div>
        <div style="display: grid; gap: 12px; margin-top: 12px; font-size: 13px; line-height: 1.55;">
          <div><strong style="color: #D97A3B;">Event cancelled:</strong> every paid ticket is refunded automatically, fees included. No case needed.</div>
          <div><strong style="color: #D97A3B;">Anything else:</strong> open a case within 60 days of paying. The other side has {{ responseHours }} hours to refund, offer part of it, or contest.</div>
          <div><strong style="color: #D97A3B;">No agreement:</strong> the resolution team reads both sides and decides. Their decision moves the money and is final.</div>
          <div><strong style="color: #D97A3B;">Getting paid back:</strong> points return to your wallet at once; card refunds take the bank 3–5 days.</div>
        </div>
      </div>
      <div style="border: 2px solid #1F3A38; background: #FFFDF8; padding: 20px 22px;">
        <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23; letter-spacing: 0.08em;">[The timeline]</div>
        <div style="font-family: var(--tz-mono); font-size: 11.5px; color: #3A2F25; line-height: 2; margin-top: 10px;">
          OPENED → MONEY FROZEN<br>
          → OTHER PARTY: {{ responseHours }}H TO ANSWER<br>
          → SETTLED, OR THE TEAM DECIDES<br>
          → POINTS BACK AT ONCE · CARDS 3–5 DAYS
        </div>
      </div>
    </aside>
  </div>

</div>
`;

export default template;
