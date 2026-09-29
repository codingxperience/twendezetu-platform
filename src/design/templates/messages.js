// Markup for the messages page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh; display: flex; flex-direction: column;">

  <!-- Header -->
  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 18px 24px; border-bottom: 2px solid #1F3A38; background: #F7F1E6;">
    <div style="display: flex; align-items: center; gap: 24px;">
      <a href="/" class="tz-logo-link" aria-label="Twendezetu home"><img src="/brand/logo.png" alt="Twendezetu" width="1211" height="229" class="tz-logo tz-logo--md"></a>
      <span class="tw-hide-sm" style="font-family: var(--tz-mono); font-size: 12px; background: #1F3A38; color: #F7F1E6; padding: 5px 10px;">MESSAGES · MASKED BY DEFAULT</span>
    </div>
    <a href="/my-twende" style="font-family: var(--tz-mono); font-size: 13px; border: 2px solid #1F3A38; color: #14201F; text-decoration: none; padding: 10px 16px;">← MY TWENDE</a>
  </header>

  <div class="tw-shell tw-messages" data-view="{{ mobileView }}" style="flex: 1; display: grid; grid-template-columns: 340px 1fr; min-height: 0;">

    <!-- Thread list -->
    <aside class="tw-threads" style="border-right: 2px solid #1F3A38; background: #FFFDF8; overflow-y: auto;">
      <div style="padding: 16px 20px; border-bottom: 2px solid #1F3A38; font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em;">[Mazungumzo — threads]</div>
      <sc-if value="{{ noThreads }}">
        <div style="padding: 24px 20px; font-size: 13.5px; color: #6E6155; line-height: 1.55;">No conversations yet. They start when you message an organizer, ask a vendor for a quote, or get an offer on a need you posted.</div>
      </sc-if>
      <sc-for list="{{ threads }}" as="th">
        <button onClick="{{ th.open }}" aria-current="{{ th.current }}" style="display: block; width: 100%; text-align: left; padding: 16px 20px; border: 0; border-bottom: 1px solid #E3D9C6; background: {{ th.bg }}; cursor: pointer; font-family: inherit;">
          <div style="display: flex; justify-content: space-between; gap: 10px; align-items: baseline;">
            <span style="font-weight: 700; font-size: 14px; color: {{ th.fg }};">{{ th.name }}<sc-if value="{{ th.unread }}"><span aria-label="unread" style="display: inline-block; width: 8px; height: 8px; background: #D97A3B; border-radius: 50%; margin-left: 8px;"></span></sc-if></span>
            <span style="font-family: var(--tz-mono); font-size: 10.5px; color: {{ th.metaColor }}; white-space: nowrap;">{{ th.time }}</span>
          </div>
          <div style="font-family: var(--tz-mono); font-size: 11px; color: {{ th.metaColor }}; margin-top: 3px;">{{ th.re }}</div>
          <div style="font-size: 12.5px; color: {{ th.previewColor }}; margin-top: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ th.preview }}</div>
        </button>
      </sc-for>
    </aside>

    <!-- Conversation -->
    <section class="tw-convo" aria-label="Conversation" style="display: flex; flex-direction: column; min-height: 0; background: #F7F1E6;">
      <sc-if value="{{ noActive }}">
        <div style="margin: auto; max-width: 420px; text-align: center; padding: 40px 24px;">
          <div style="font-family: var(--tz-display); font-size: 26px; text-transform: uppercase;">Nothing open<span style="color: #D97A3B;">.</span></div>
          <p style="font-size: 14px; color: #6E6155; line-height: 1.55;">Every conversation on Twendezetu is masked: names, phones and emails stay hidden until an offer is accepted, and payments stay protected in escrow.</p>
          <a href="/vendors" style="display: inline-block; font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #D97A3B; color: #1F3A38; padding: 10px 16px; text-decoration: none;">FIND A VENDOR →</a>
        </div>
      </sc-if>

      <sc-if value="{{ hasActive }}">
      <!-- Thread header -->
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; padding: 14px 24px; border-bottom: 2px solid #1F3A38; background: #FFFDF8; position: relative;">
        <div style="display: flex; gap: 12px; align-items: center; min-width: 0;">
          <button onClick="{{ backToList }}" class="tw-mobile-only" aria-label="All conversations" style="border: 2px solid #1F3A38; background: #F7F1E6; font-family: var(--tz-mono); font-size: 13px; padding: 8px 10px; cursor: pointer;">←</button>
          <div style="width: 42px; height: 42px; flex-shrink: 0; background: #1F3A38; color: #F7F1E6; font-family: var(--tz-display); font-size: 16px; display: flex; align-items: center; justify-content: center;">{{ activeInitials }}</div>
          <div style="min-width: 0;">
            <div style="font-weight: 700; font-size: 15px;">{{ activeName }} <span style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155;">{{ activeSub }}</span></div>
            <div style="font-family: var(--tz-mono); font-size: 11px; color: #A85A23;">{{ activeRe }}</div>
          </div>
        </div>
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <span style="font-family: var(--tz-mono); font-size: 11px; background: {{ maskBg }}; border: 1px solid #A85A23; color: #7A3E0F; padding: 5px 10px;">{{ maskLabel }}</span>
          <sc-if value="{{ canDispute }}">
            <a href="{{ disputeHref }}" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #B8463A; color: #B8463A; background: #F7F1E6; padding: 8px 12px; text-decoration: none;">DISPUTE</a>
          </sc-if>
          <button onClick="{{ toggleReport }}" aria-expanded="{{ reportOpen }}" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 8px 12px; cursor: pointer;">REPORT</button>
        </div>
        <sc-if value="{{ reportOpen }}">
          <div style="position: absolute; top: 64px; right: 24px; width: 300px; background: #FFFDF8; border: 2px solid #1F3A38; box-shadow: 6px 6px 0 #1F3A38; z-index: 50;">
            <div style="padding: 12px 16px; border-bottom: 2px solid #1F3A38; font-family: var(--tz-display); font-size: 14px; text-transform: uppercase;">Report this conversation</div>
            <div style="padding: 10px 16px; font-size: 12px; color: #6E6155; line-height: 1.5; border-bottom: 1px solid #E3D9C6;">The trust team reads the whole thread. The other side is not told who reported.</div>
            <sc-for list="{{ reportReasons }}" as="r">
              <button onClick="{{ r.pick }}" style="display: block; width: 100%; text-align: left; background: none; border: 0; border-bottom: 1px solid #E3D9C6; padding: 12px 16px; font-family: var(--tz-sans); font-size: 13.5px; cursor: pointer;">{{ r.label }}</button>
            </sc-for>
          </div>
        </sc-if>
      </div>

      <!-- Messages scroll -->
      <div id="message-scroll" style="flex: 1; overflow-y: auto; padding: 24px; display: grid; gap: 16px; align-content: start;">

        <div style="justify-self: center; font-family: var(--tz-mono); font-size: 11px; color: #6E6155; border: 1px dashed #C9BFB1; padding: 8px 14px; background: #FFFDF8; max-width: 520px; text-align: center; line-height: 1.5;">{{ routingNote }}</div>

        <sc-for list="{{ messages }}" as="msg">
          <!-- text bubble -->
          <sc-if value="{{ msg.isText }}">
            <div style="justify-self: {{ msg.align }}; max-width: 70%;">
              <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #6E6155; margin-bottom: 4px; text-align: {{ msg.metaAlign }};">{{ msg.who }} · {{ msg.time }}</div>
              <div style="border: 2px solid #1F3A38; background: {{ msg.bg }}; color: {{ msg.fg }}; padding: 14px 16px; font-size: 14px; line-height: 1.55; white-space: pre-wrap; overflow-wrap: anywhere;">{{ msg.text }}</div>
            </div>
          </sc-if>
          <!-- attachment -->
          <sc-if value="{{ msg.isFile }}">
            <div style="justify-self: {{ msg.align }}; max-width: 70%;">
              <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #6E6155; margin-bottom: 4px; text-align: {{ msg.metaAlign }};">{{ msg.who }} · {{ msg.time }}</div>
              <sc-if value="{{ msg.isImage }}">
                <a href="{{ msg.fileHref }}" target="_blank" rel="noopener" style="display: block; border: 2px solid #1F3A38; background: #FFFDF8;"><img src="{{ msg.fileHref }}" alt="{{ msg.fileName }}" loading="lazy" style="display: block; max-width: 320px; max-height: 280px; width: 100%; object-fit: cover;"></a>
              </sc-if>
              <sc-if value="{{ msg.isDocument }}">
                <a href="{{ msg.fileHref }}" style="display: flex; gap: 10px; align-items: center; border: 2px solid #1F3A38; background: {{ msg.bg }}; color: {{ msg.fg }}; padding: 12px 14px; text-decoration: none; font-size: 13.5px;"><span style="font-family: var(--tz-mono); font-size: 11px; border: 1px solid currentColor; padding: 3px 6px;">PDF</span>{{ msg.fileName }}</a>
              </sc-if>
            </div>
          </sc-if>
          <!-- platform notice -->
          <sc-if value="{{ msg.isWarn }}">
            <div style="justify-self: center; max-width: 560px;">
              <div role="note" style="border: 2px dashed #B8463A; background: #FBEED8; padding: 12px 16px; font-size: 12.5px; line-height: 1.55; color: #7A3E0F;">{{ msg.text }}</div>
            </div>
          </sc-if>
          <!-- offer card -->
          <sc-if value="{{ msg.isOffer }}">
            <div style="justify-self: {{ msg.align }}; max-width: 70%; min-width: min(360px, 100%); border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 18px 20px;">
              <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #E8A472; letter-spacing: 0.08em;">[FORMAL OFFER · {{ msg.offerRef }}] · {{ msg.time }}</div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 16px; margin-top: 8px; flex-wrap: wrap;">
                <span style="font-family: var(--tz-display); font-size: 20px; text-transform: uppercase;">{{ msg.offerTitle }}</span>
                <span style="font-family: var(--tz-display); font-size: 22px; color: #D97A3B;">{{ msg.offerPrice }}</span>
              </div>
              <div style="font-size: 12.5px; color: rgba(247,241,230,0.8); margin-top: 6px; line-height: 1.5;">{{ msg.offerNote }}</div>
              <sc-if value="{{ msg.canRespond }}">
                <div style="display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap;">
                  <button onClick="{{ msg.accept }}" style="flex: 1; font-family: var(--tz-display); font-size: 14px; text-transform: uppercase; background: #D97A3B; color: #1F3A38; border: 0; padding: 11px; cursor: pointer;">Accept — {{ msg.offerPrice }}</button>
                  <sc-if value="{{ msg.canCounter }}">
                    <button onClick="{{ msg.counter }}" style="font-family: var(--tz-mono); font-size: 11px; background: none; color: #F7F1E6; border: 1px solid rgba(247,241,230,0.5); padding: 11px 14px; cursor: pointer;">COUNTER</button>
                  </sc-if>
                  <button onClick="{{ msg.decline }}" style="font-family: var(--tz-mono); font-size: 11px; background: none; color: #E8A472; border: 1px solid rgba(232,164,114,0.5); padding: 11px 14px; cursor: pointer;">DECLINE</button>
                </div>
              </sc-if>
              <sc-if value="{{ msg.canWithdraw }}">
                <div style="display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap;">
                  <button onClick="{{ msg.counter }}" style="flex: 1; font-family: var(--tz-mono); font-size: 11px; background: #D97A3B; color: #1F3A38; border: 0; padding: 11px 14px; cursor: pointer;">REVISE PRICE</button>
                  <button onClick="{{ msg.withdraw }}" style="font-family: var(--tz-mono); font-size: 11px; background: none; color: #E8A472; border: 1px solid rgba(232,164,114,0.5); padding: 11px 14px; cursor: pointer;">WITHDRAW</button>
                </div>
              </sc-if>
              <sc-if value="{{ msg.offerDone }}">
                <div style="margin-top: 12px; border-top: 1px solid rgba(247,241,230,0.3); padding-top: 10px; font-family: var(--tz-mono); font-size: 11.5px; color: #E8A472;">{{ msg.offerStatus }}</div>
              </sc-if>
            </div>
            <sc-if value="{{ msg.composerOpen }}">
              <div style="justify-self: end; max-width: 70%; width: 100%; border: 2px solid #1F3A38; background: #FFFDF8; padding: 16px 18px;">
                <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #A85A23; letter-spacing: 0.08em;">{{ composerLabel }}</div>
                <div style="font-size: 12.5px; color: #6E6155; margin-top: 6px; line-height: 1.5;">{{ composerHint }}</div>
                <div style="display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;">
                  <input value="{{ counterVal }}" onChange="{{ setCounterVal }}" onKeyDown="{{ counterKey }}" placeholder="{{ composerPlaceholder }}" aria-label="{{ composerLabel }}" style="flex: 1; min-width: 200px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 11px 13px; font-family: var(--tz-mono); font-size: 13px; outline: none;">
                  <button onClick="{{ sendCounter }}" style="font-family: var(--tz-display); font-size: 13px; text-transform: uppercase; background: #1F3A38; color: #F7F1E6; border: 0; padding: 11px 18px; cursor: pointer;">{{ composerAction }}</button>
                  <button onClick="{{ closeCounter }}" aria-label="Cancel" style="font-family: var(--tz-mono); font-size: 12px; background: none; border: 2px solid #1F3A38; padding: 0 12px; cursor: pointer;">✕</button>
                </div>
              </div>
            </sc-if>
          </sc-if>
        </sc-for>

        <!-- Booking this conversation led to -->
        <sc-if value="{{ hasBooking }}">
          <div style="justify-self: center; max-width: 580px; width: 100%; border: 2px solid #1F3A38; background: #FFFDF8; box-shadow: 5px 5px 0 #7B8B6E; padding: 20px 24px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap;">
              <div style="font-family: var(--tz-display); font-size: 20px; text-transform: uppercase;">Booking {{ booking.reference }}</div>
              <span style="font-family: var(--tz-mono); font-size: 10.5px; background: {{ bookingTone }}; border: 1px solid #1F3A38; padding: 4px 9px;">{{ booking.statusLabel }}</span>
            </div>
            <div style="font-family: var(--tz-mono); font-size: 11.5px; color: #6E6155; margin-top: 6px;">{{ bookingLine }}</div>
            <div class="tw-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 14px; font-size: 13px;">
              <div style="border: 1px solid #E3D9C6; padding: 12px 14px;">
                <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #A85A23;">{{ activeNameUpper }}</div>
                <div style="margin-top: 4px; line-height: 1.5; overflow-wrap: anywhere;">{{ contactLine }}</div>
              </div>
              <div style="border: 1px solid #E3D9C6; padding: 12px 14px;">
                <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #A85A23;">MONEY</div>
                <div style="margin-top: 4px; line-height: 1.5;">{{ moneyLine }}</div>
              </div>
            </div>
            <div style="display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap;">
              <sc-if value="{{ booking.canPay }}">
                <button onClick="{{ payBooking }}" style="font-family: var(--tz-mono); font-size: 11.5px; border: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 9px 14px; cursor: pointer;">PAY {{ booking.amount }} INTO ESCROW</button>
                <button onClick="{{ payWithPoints }}" style="font-family: var(--tz-mono); font-size: 11.5px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 9px 14px; cursor: pointer;">PAY WITH POINTS</button>
              </sc-if>
              <sc-if value="{{ booking.canConfirm }}">
                <button onClick="{{ confirmDone }}" style="font-family: var(--tz-mono); font-size: 11.5px; border: 2px solid #1F3A38; background: #D97A3B; padding: 9px 14px; cursor: pointer;">JOB DONE — RELEASE PAYMENT</button>
              </sc-if>
              <sc-if value="{{ booking.canCancel }}">
                <button onClick="{{ cancelBooking }}" style="font-family: var(--tz-mono); font-size: 11.5px; border: 2px solid #B8463A; color: #B8463A; background: none; padding: 9px 14px; cursor: pointer;">CANCEL BOOKING</button>
              </sc-if>
              <sc-if value="{{ booking.canReview }}">
                <a href="{{ reviewHref }}" style="font-family: var(--tz-mono); font-size: 11.5px; border: 2px solid #1F3A38; background: #D97A3B; color: #14201F; padding: 9px 14px; text-decoration: none;">LEAVE A REVIEW →</a>
              </sc-if>
            </div>
          </div>
        </sc-if>
      </div>

      <!-- Composer -->
      <form onSubmit="{{ send }}" style="border-top: 2px solid #1F3A38; background: #FFFDF8; padding: 16px 24px; display: flex; gap: 10px; align-items: center;">
        <label title="Attach a photo or PDF (up to 4 MB)" style="font-size: 16px; border: 2px solid #1F3A38; background: #F7F1E6; padding: 10px 13px; cursor: pointer; line-height: 1;">
          ＋<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange="{{ attach }}" aria-label="Attach a photo or PDF" style="position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none;">
        </label>
        <input value="{{ draft }}" onChange="{{ setDraft }}" placeholder="Andika ujumbe… (contacts auto-masked)" aria-label="Message" maxlength="2000" style="flex: 1; min-width: 0; border: 2px solid #1F3A38; background: #F7F1E6; padding: 13px 16px; font-family: var(--tz-sans); font-size: 14px; outline: none;">
        <button type="submit" aria-busy="{{ sending }}" style="font-family: var(--tz-display); font-size: 15px; text-transform: uppercase; background: #1F3A38; color: #F7F1E6; border: 2px solid #1F3A38; padding: 12px 24px; cursor: pointer; box-shadow: 3px 3px 0 #D97A3B;">Send</button>
      </form>
      </sc-if>
    </section>
  </div>

</div>
`;

export default template;
