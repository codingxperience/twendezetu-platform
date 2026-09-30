// Markup for the admin page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #14201F; color: #F7F1E6; min-height: 100vh;">

  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 16px 24px; border-bottom: 2px solid #F7F1E6; background: #14201F; position: sticky; top: 0; z-index: 40;">
    <div style="display: flex; align-items: center; gap: 20px;">
      <a href="/" class="tz-logo-link" aria-label="Twendezetu home"><img src="/brand/logo-light.png" alt="Twendezetu" width="1211" height="229" class="tz-logo tz-logo--md"></a>
      <span style="font-family: var(--tz-mono); font-size: 12px; background: #B8463A; color: #F7F1E6; padding: 5px 10px;">ADMIN CONSOLE</span>
    </div>
    <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; position: relative;">
      <a href="/finance" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #F7F1E6; color: #F7F1E6; text-decoration: none; padding: 9px 14px;">◍ FINANCE →</a>
      <button onClick="{{ toggleMenu }}" aria-expanded="{{ menuOpen }}" aria-label="Account menu" style="width: 38px; height: 38px; background: #B8463A; color: #F7F1E6; border: 2px solid #F7F1E6; font-family: var(--tz-display); font-size: 15px; display: flex; align-items: center; justify-content: center; cursor: pointer;">{{ staffInitials }}</button>
      <sc-if value="{{ menuOpen }}" hint-placeholder-val="{{ false }}">
        <div style="position: absolute; top: 48px; right: 0; width: 290px; background: #1F3A38; border: 2px solid #F7F1E6; box-shadow: 6px 6px 0 rgba(0,0,0,0.4); z-index: 60;">
          <div style="padding: 14px 18px; border-bottom: 2px solid #F7F1E6;">
            <div style="font-weight: 700; font-size: 14.5px;">{{ staffName }}</div>
            <div style="font-family: var(--tz-mono); font-size: 10.5px; color: rgba(247,241,230,0.6); margin-top: 2px;">{{ staffMeta }}</div>
          </div>
          <a href="/settings?tab=security" style="display: block; text-decoration: none; color: #F7F1E6; border-bottom: 1px solid rgba(247,241,230,0.15); padding: 12px 18px; font-size: 14px;">⚙ &nbsp;Your security settings</a>
          <a href="/finance" style="display: block; text-decoration: none; color: #F7F1E6; border-bottom: 1px solid rgba(247,241,230,0.15); padding: 12px 18px; font-size: 14px;">◍ &nbsp;Finance console</a>
          <button onClick="{{ signOut }}" style="display: block; width: 100%; text-align: left; background: none; border: 0; color: #E9B4AC; padding: 12px 18px; font-family: var(--tz-sans); font-size: 14px; font-weight: 600; cursor: pointer;">→ &nbsp;Sign out</button>
        </div>
      </sc-if>
    </div>
  </header>

  <div class="tw-shell" style="display: grid; grid-template-columns: 230px 1fr; min-height: calc(100vh - 76px);">

    <nav class="tw-side" aria-label="Console sections" style="border-right: 2px solid #F7F1E6; padding: 20px 0; display: flex; flex-direction: column; gap: 2px; position: sticky; top: 76px; align-self: start;">
      <sc-for list="{{ navItems }}" as="n" hint-placeholder-count="7">
        <button onClick="{{ n.go }}" aria-current="{{ n.current }}" style="display: flex; justify-content: space-between; align-items: center; gap: 10px; text-align: left; background: {{ n.bg }}; color: {{ n.fg }}; border: 0; padding: 13px 20px; font-family: var(--tz-mono); font-size: 12.5px; letter-spacing: 0.04em; cursor: pointer; white-space: nowrap;">
          <span style="display: flex; align-items: center; gap: 10px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{{ n.iconPath }}"></path></svg>
            <span>{{ n.label }}</span>
          </span>
          <sc-if value="{{ n.badge }}" hint-placeholder-val="{{ false }}">
            <span style="background: #B8463A; color: #F7F1E6; font-size: 10px; padding: 2px 7px;">{{ n.badge }}</span>
          </sc-if>
        </button>
      </sc-for>
    </nav>

    <section style="padding: 32px 28px 80px; min-width: 0;">

      <!-- OVERVIEW -->
      <sc-if value="{{ isOverview }}" hint-placeholder-val="{{ true }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(30px, 4vw, 48px); text-transform: uppercase; margin: 0 0 24px;">Platform health<span style="color: #E9B4AC;">.</span></h1>
          <div class="tw-4col" style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 2px; border: 2px solid #F7F1E6; background: #F7F1E6; margin-bottom: 28px;">
            <sc-for list="{{ kpis }}" as="k" hint-placeholder-count="8">
              <div style="background: #1F3A38; padding: 18px 20px;">
                <div style="font-family: var(--tz-mono); font-size: 10.5px; letter-spacing: 0.08em; color: #E9B4AC;">{{ k.label }}</div>
                <div style="font-family: var(--tz-display); font-size: 34px; line-height: 1; margin-top: 8px;">{{ k.big }}</div>
                <div style="font-size: 12px; margin-top: 5px; color: {{ k.deltaColor }};">{{ k.delta }}</div>
              </div>
            </sc-for>
          </div>
          <div style="border: 2px solid #F7F1E6; background: #1F3A38; padding: 22px 24px;">
            <div style="font-family: var(--tz-mono); font-size: 11px; color: #E9B4AC; letter-spacing: 0.08em; margin-bottom: 14px;">[Needs attention now]</div>
            <sc-if value="{{ allClear }}" hint-placeholder-val="{{ false }}">
              <div style="font-size: 14px; color: rgba(247,241,230,0.75);">Nothing is waiting. Reports, cases, verifications and payouts are all clear.</div>
            </sc-if>
            <sc-for list="{{ attention }}" as="a" hint-placeholder-count="3">
              <button onClick="{{ a.go }}" style="display: flex; justify-content: space-between; align-items: center; gap: 14px; width: 100%; text-align: left; background: none; border: 0; border-bottom: 1px solid rgba(247,241,230,0.15); padding: 12px 2px; cursor: pointer; color: #F7F1E6; font-family: var(--tz-sans);">
                <span style="font-size: 14px;">{{ a.label }}</span>
                <span style="font-family: var(--tz-mono); font-size: 11px; color: #E9B4AC; white-space: nowrap;">{{ a.action }} →</span>
              </button>
            </sc-for>
          </div>
        </div>
      </sc-if>

      <!-- MODERATION -->
      <sc-if value="{{ isModeration }}" hint-placeholder-val="{{ false }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(30px, 4vw, 48px); text-transform: uppercase; margin: 0 0 8px;">Moderation queue<span style="color: #E9B4AC;">.</span></h1>
          <p style="font-size: 14px; color: rgba(247,241,230,0.7); margin: 0 0 24px;">Member reports and messages flagged for off-platform payment talk, most severe first.</p>
          <sc-if value="{{ noReports }}" hint-placeholder-val="{{ false }}">
            <div style="border: 2px dashed rgba(247,241,230,0.4); padding: 20px; font-size: 14px; color: rgba(247,241,230,0.75);">The queue is empty.</div>
          </sc-if>
          <div style="display: grid; gap: 14px;">
            <sc-for list="{{ reports }}" as="r" hint-placeholder-count="3">
              <div style="border: 2px solid #F7F1E6; background: #1F3A38; padding: 20px 22px;">
                <div style="display: flex; justify-content: space-between; gap: 14px; flex-wrap: wrap; align-items: start;">
                  <div style="min-width: 0; flex: 1;">
                    <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                      <span style="font-family: var(--tz-mono); font-size: 10.5px; background: {{ r.sevBg }}; color: #14201F; padding: 3px 8px;">{{ r.severity }}</span>
                      <span style="font-family: var(--tz-display); font-size: 17px; text-transform: uppercase;">{{ r.reason }}</span>
                      <span style="font-family: var(--tz-mono); font-size: 10.5px; color: rgba(247,241,230,0.5);">{{ r.reference }}</span>
                    </div>
                    <div style="font-family: var(--tz-mono); font-size: 11.5px; color: rgba(247,241,230,0.6); margin-top: 6px;">{{ r.meta }}</div>
                    <div style="font-size: 13.5px; color: rgba(247,241,230,0.85); line-height: 1.5; margin-top: 8px; max-width: 620px;">{{ r.body }}</div>
                  </div>
                  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button onClick="{{ r.dismiss }}" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid rgba(247,241,230,0.5); background: none; color: #F7F1E6; padding: 9px 13px; cursor: pointer;">DISMISS</button>
                    <sc-if value="{{ r.canAct }}" hint-placeholder-val="{{ true }}">
                      <button onClick="{{ r.warn }}" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #E9B4AC; background: #820101; color: #F7F1E6; padding: 9px 13px; cursor: pointer;">WARN</button>
                      <button onClick="{{ r.suspend }}" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #B8463A; background: #B8463A; color: #F7F1E6; padding: 9px 13px; cursor: pointer;">SUSPEND</button>
                    </sc-if>
                  </div>
                </div>
              </div>
            </sc-for>
          </div>
        </div>
      </sc-if>

      <!-- REFUND CASES -->
      <sc-if value="{{ isCases }}" hint-placeholder-val="{{ false }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(30px, 4vw, 48px); text-transform: uppercase; margin: 0 0 8px;">Refund cases<span style="color: #E9B4AC;">.</span></h1>
          <p style="font-size: 14px; color: rgba(247,241,230,0.7); margin: 0 0 24px; max-width: 680px;">Cases the two sides could not settle. The money stays frozen until you decide; your decision moves it and is final.</p>
          <sc-if value="{{ noCases }}" hint-placeholder-val="{{ false }}">
            <div style="border: 2px dashed rgba(247,241,230,0.4); padding: 20px; font-size: 14px; color: rgba(247,241,230,0.75);">No case is waiting for a decision.</div>
          </sc-if>
          <div style="display: grid; gap: 14px;">
            <sc-for list="{{ cases }}" as="c" hint-placeholder-count="2">
              <div style="border: 2px solid #F7F1E6; background: #1F3A38;">
                <div style="padding: 18px 22px; display: flex; justify-content: space-between; gap: 14px; flex-wrap: wrap; border-bottom: 1px solid rgba(247,241,230,0.2);">
                  <div style="min-width: 0;">
                    <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #E9B4AC;">{{ c.reference }} · {{ c.reason }} · OPENED {{ c.opened }}</div>
                    <div style="font-family: var(--tz-display); font-size: 18px; text-transform: uppercase; margin-top: 4px;">{{ c.subject }}</div>
                    <div style="font-family: var(--tz-mono); font-size: 11px; color: rgba(247,241,230,0.6); margin-top: 4px;">BUYER {{ c.opener }} · SELLER {{ c.respondent }}</div>
                  </div>
                  <div style="font-family: var(--tz-display); font-size: 24px; color: #E9B4AC;">{{ c.amount }}</div>
                </div>
                <div style="padding: 16px 22px; display: grid; gap: 10px;">
                  <div style="font-size: 13.5px; line-height: 1.55;"><span style="font-family: var(--tz-mono); font-size: 10.5px; color: #E9B4AC;">BUYER · </span>{{ c.detail }}</div>
                  <sc-if value="{{ c.hasNotes }}" hint-placeholder-val="{{ true }}">
                    <sc-for list="{{ c.notes }}" as="n" hint-placeholder-count="2">
                      <div style="font-size: 13px; line-height: 1.55; color: rgba(247,241,230,0.85);"><span style="font-family: var(--tz-mono); font-size: 10.5px; color: #E9B4AC;">{{ n.who }} · {{ n.when }} · </span>{{ n.note }}</div>
                    </sc-for>
                  </sc-if>
                  <sc-if value="{{ c.hasEvidence }}" hint-placeholder-val="{{ false }}">
                    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                      <sc-for list="{{ c.evidence }}" as="e" hint-placeholder-count="1">
                        <a href="{{ e.href }}" target="_blank" rel="noopener" style="font-family: var(--tz-mono); font-size: 11px; border: 1px solid rgba(247,241,230,0.5); color: #F7F1E6; text-decoration: none; padding: 5px 9px;">📎 {{ e.name }} · {{ e.side }}</a>
                      </sc-for>
                    </div>
                  </sc-if>
                </div>
                <div style="padding: 14px 22px; border-top: 1px solid rgba(247,241,230,0.2); display: flex; gap: 8px; flex-wrap: wrap;">
                  <button onClick="{{ c.refund }}" style="font-family: var(--tz-display); font-size: 13px; text-transform: uppercase; border: 2px solid #7B8B6E; background: #7B8B6E; color: #F7F1E6; padding: 10px 16px; cursor: pointer;">Refund in full</button>
                  <button onClick="{{ c.partial }}" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #F7F1E6; background: none; color: #F7F1E6; padding: 10px 14px; cursor: pointer;">REFUND PART</button>
                  <button onClick="{{ c.deny }}" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #B8463A; background: none; color: #E9B4AC; padding: 10px 14px; cursor: pointer;">NO REFUND</button>
                </div>
              </div>
            </sc-for>
          </div>
        </div>
      </sc-if>

      <!-- USERS -->
      <sc-if value="{{ isUsers }}" hint-placeholder-val="{{ false }}">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-end; gap: 14px; flex-wrap: wrap; margin-bottom: 20px;">
            <h1 style="font-family: var(--tz-display); font-size: clamp(30px, 4vw, 48px); text-transform: uppercase; margin: 0;">Users &amp; roles<span style="color: #E9B4AC;">.</span></h1>
            <input type="search" value="{{ search }}" onChange="{{ setSearch }}" onKeyDown="{{ searchKey }}" aria-label="Search members" placeholder="Name, email or handle · Enter" style="width: 280px; max-width: 100%; border: 2px solid rgba(247,241,230,0.5); background: rgba(247,241,230,0.06); color: #F7F1E6; padding: 10px 12px; font-family: var(--tz-sans); font-size: 13.5px; outline: none;">
          </div>
          <sc-if value="{{ noUsers }}" hint-placeholder-val="{{ false }}">
            <div style="border: 2px dashed rgba(247,241,230,0.4); padding: 20px; font-size: 14px; color: rgba(247,241,230,0.75);">No member matches that search.</div>
          </sc-if>
          <div style="border: 2px solid #F7F1E6; overflow-x: auto;">
            <div style="display: grid; grid-template-columns: 1.4fr 1fr 0.8fr 0.8fr 1.2fr; min-width: 780px; background: #F7F1E6; color: #14201F; font-family: var(--tz-mono); font-size: 10.5px; letter-spacing: 0.06em;">
              <span style="padding: 10px 14px;">USER</span><span style="padding: 10px 14px;">ROLE</span><span style="padding: 10px 14px;">CITY</span><span style="padding: 10px 14px;">STATUS</span><span style="padding: 10px 14px;">ACTIONS</span>
            </div>
            <sc-for list="{{ users }}" as="u" hint-placeholder-count="5">
              <div style="display: grid; grid-template-columns: 1.4fr 1fr 0.8fr 0.8fr 1.2fr; min-width: 780px; background: #1F3A38; border-top: 1px solid rgba(247,241,230,0.15); align-items: center;">
                <div style="padding: 12px 14px; min-width: 0;">
                  <div style="font-weight: 600; font-size: 13.5px;">{{ u.name }}</div>
                  <div style="font-family: var(--tz-mono); font-size: 10.5px; color: rgba(247,241,230,0.55);">{{ u.email }}</div>
                </div>
                <span style="padding: 12px 14px; font-family: var(--tz-mono); font-size: 11px; color: #E9B4AC;">{{ u.role }}</span>
                <span style="padding: 12px 14px; font-size: 12.5px;">{{ u.city }}</span>
                <span style="padding: 12px 14px; font-family: var(--tz-mono); font-size: 11px; color: {{ u.statusColor }};">{{ u.status }}</span>
                <div style="padding: 12px 14px; display: flex; gap: 6px; flex-wrap: wrap;">
                  <button onClick="{{ u.manage }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 1px solid rgba(247,241,230,0.5); background: {{ u.manageBg }}; color: #F7F1E6; padding: 6px 10px; cursor: pointer;">MANAGE</button>
                  <button onClick="{{ u.msg }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 1px solid rgba(247,241,230,0.5); background: none; color: #F7F1E6; padding: 6px 10px; cursor: pointer;">MESSAGE</button>
                  <sc-if value="{{ u.canSuspend }}" hint-placeholder-val="{{ true }}">
                    <button onClick="{{ u.toggleSuspend }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 1px solid {{ u.suspendColor }}; background: none; color: {{ u.suspendColor }}; padding: 6px 10px; cursor: pointer;">{{ u.suspendLabel }}</button>
                  </sc-if>
                </div>
              </div>
              <sc-if value="{{ u.managing }}" hint-placeholder-val="{{ false }}">
                <div style="min-width: 780px; background: #14201F; border-top: 2px solid #E9B4AC; padding: 18px 16px;">
                  <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #E9B4AC; letter-spacing: 0.08em; margin-bottom: 12px;">[MANAGE {{ u.name }} — EVERY CHANGE IS AUDIT-LOGGED AND THE MEMBER IS TOLD]</div>
                  <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
                    <sc-if value="{{ u.canRole }}" hint-placeholder-val="{{ true }}">
                      <select value="{{ u.roleDraft }}" onChange="{{ u.setRole }}" aria-label="Staff role" style="border: 2px solid rgba(247,241,230,0.4); background: #14201F; color: #F7F1E6; padding: 10px 12px; font-family: var(--tz-sans); font-size: 13px; outline: none;"><sc-for list="{{ u.roles }}" as="ro"><option value="{{ ro.value }}">{{ ro.label }}</option></sc-for></select>
                      <button onClick="{{ u.saveRole }}" style="font-family: var(--tz-display); font-size: 13px; text-transform: uppercase; background: #820101; color: #F7F1E6; border: 0; padding: 11px 18px; cursor: pointer;">Save role</button>
                    </sc-if>
                    <button onClick="{{ u.resetPw }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 1px solid rgba(247,241,230,0.5); background: none; color: #F7F1E6; padding: 11px 14px; cursor: pointer;">SEND PASSWORD RESET LINK</button>
                  </div>
                  <sc-if value="{{ u.roleNote }}" hint-placeholder-val="{{ false }}">
                    <div style="font-size: 12px; color: rgba(247,241,230,0.6); margin-top: 10px;">{{ u.roleNote }}</div>
                  </sc-if>
                </div>
              </sc-if>
              <sc-if value="{{ u.messaging }}" hint-placeholder-val="{{ false }}">
                <div style="min-width: 780px; background: #14201F; border-top: 2px solid #E9B4AC; padding: 18px 16px;">
                  <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #E9B4AC; letter-spacing: 0.08em; margin-bottom: 10px;">[MESSAGE {{ u.name }} — ARRIVES IN THEIR INBOX FROM THE TWENDEZETU TEAM]</div>
                  <textarea rows="3" maxlength="2000" value="{{ u.messageDraft }}" onChange="{{ u.setMessage }}" aria-label="Message" placeholder="Hi, this is the Twendezetu team…" style="width: 100%; box-sizing: border-box; border: 2px solid rgba(247,241,230,0.4); background: rgba(247,241,230,0.06); color: #F7F1E6; padding: 12px 14px; font-family: var(--tz-sans); font-size: 13.5px; outline: none; resize: vertical;"></textarea>
                  <div style="display: flex; gap: 8px; margin-top: 10px;">
                    <button onClick="{{ u.sendMsg }}" style="font-family: var(--tz-display); font-size: 13px; text-transform: uppercase; background: #820101; color: #F7F1E6; border: 0; padding: 10px 20px; cursor: pointer;">Send →</button>
                    <button onClick="{{ u.msg }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 1px solid rgba(247,241,230,0.5); background: none; color: #F7F1E6; padding: 10px 14px; cursor: pointer;">CANCEL</button>
                  </div>
                </div>
              </sc-if>
            </sc-for>
          </div>
        </div>
      </sc-if>

      <!-- VERIFICATION -->
      <sc-if value="{{ isVerify }}" hint-placeholder-val="{{ false }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(30px, 4vw, 48px); text-transform: uppercase; margin: 0 0 8px;">Vendor verification<span style="color: #E9B4AC;">.</span></h1>
          <p style="font-size: 14px; color: rgba(247,241,230,0.7); margin: 0 0 24px; max-width: 680px;">ID and business checks before the ✓ badge. Once you approve or reject, identity documents and numbers are deleted and only the decision is kept.</p>
          <sc-if value="{{ noVerifications }}" hint-placeholder-val="{{ false }}">
            <div style="border: 2px dashed rgba(247,241,230,0.4); padding: 20px; font-size: 14px; color: rgba(247,241,230,0.75);">No application is waiting.</div>
          </sc-if>
          <div style="display: grid; gap: 14px;">
            <sc-for list="{{ verifications }}" as="v" hint-placeholder-count="2">
              <div style="border: 2px solid #F7F1E6; background: #1F3A38; padding: 20px 22px; display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; align-items: center;">
                <div style="min-width: 0;">
                  <div style="font-family: var(--tz-display); font-size: 18px; text-transform: uppercase;">{{ v.name }}</div>
                  <div style="font-family: var(--tz-mono); font-size: 11.5px; color: rgba(247,241,230,0.6); margin-top: 4px;">{{ v.meta }} {{ v.idHint }}</div>
                  <div style="display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap;">
                    <sc-for list="{{ v.checks }}" as="ch" hint-placeholder-count="4">
                      <span style="font-family: var(--tz-mono); font-size: 10.5px; border: 1px solid rgba(247,241,230,0.4); padding: 4px 9px; color: {{ ch.color }};">{{ ch.label }}</span>
                    </sc-for>
                  </div>
                  <div style="display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap;">
                    <sc-for list="{{ v.documents }}" as="d" hint-placeholder-count="2">
                      <a href="{{ d.href }}" target="_blank" rel="noopener" style="font-family: var(--tz-mono); font-size: 10.5px; color: #E9B4AC;">{{ d.label }} ↗</a>
                    </sc-for>
                  </div>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <button onClick="{{ v.approve }}" style="font-family: var(--tz-display); font-size: 13px; text-transform: uppercase; border: 2px solid #7B8B6E; background: #7B8B6E; color: #F7F1E6; padding: 10px 18px; cursor: pointer;">Approve ✓</button>
                  <button onClick="{{ v.askInfo }}" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #E9B4AC; background: none; color: #E9B4AC; padding: 10px 14px; cursor: pointer;">ASK FOR MORE</button>
                  <button onClick="{{ v.reject }}" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #B8463A; background: none; color: #E9B4AC; padding: 10px 14px; cursor: pointer;">REJECT</button>
                </div>
              </div>
            </sc-for>
          </div>
        </div>
      </sc-if>

      <!-- CONTENT -->
      <sc-if value="{{ isContent }}" hint-placeholder-val="{{ false }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(30px, 4vw, 48px); text-transform: uppercase; margin: 0 0 24px;">Events &amp; needs<span style="color: #E9B4AC;">.</span></h1>
          <div style="border: 2px solid #F7F1E6; overflow-x: auto;">
            <div style="display: grid; grid-template-columns: 1.6fr 0.7fr 0.9fr 0.8fr 1fr; min-width: 780px; background: #F7F1E6; color: #14201F; font-family: var(--tz-mono); font-size: 10.5px; letter-spacing: 0.06em;">
              <span style="padding: 10px 14px;">POST</span><span style="padding: 10px 14px;">TYPE</span><span style="padding: 10px 14px;">CITY</span><span style="padding: 10px 14px;">TRACTION</span><span style="padding: 10px 14px;">ACTIONS</span>
            </div>
            <sc-for list="{{ posts }}" as="p" hint-placeholder-count="5">
              <div style="display: grid; grid-template-columns: 1.6fr 0.7fr 0.9fr 0.8fr 1fr; min-width: 780px; background: #1F3A38; border-top: 1px solid rgba(247,241,230,0.15); align-items: center;">
                <div style="padding: 12px 14px; min-width: 0;">
                  <div style="font-weight: 600; font-size: 13.5px;">{{ p.title }}</div>
                  <div style="font-family: var(--tz-mono); font-size: 10.5px; color: rgba(247,241,230,0.55);">{{ p.by }}</div>
                </div>
                <span style="padding: 12px 14px; font-family: var(--tz-mono); font-size: 11px; color: #E9B4AC;">{{ p.type }}</span>
                <span style="padding: 12px 14px; font-size: 12.5px;">{{ p.city }}</span>
                <span style="padding: 12px 14px; font-family: var(--tz-mono); font-size: 11px;">{{ p.traction }}</span>
                <div style="padding: 12px 14px; display: flex; gap: 6px; flex-wrap: wrap;">
                  <sc-if value="{{ p.canFeature }}" hint-placeholder-val="{{ true }}">
                    <button onClick="{{ p.feature }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 1px solid #E9B4AC; background: {{ p.featBg }}; color: {{ p.featFg }}; padding: 6px 10px; cursor: pointer;">{{ p.featLabel }}</button>
                  </sc-if>
                  <button onClick="{{ p.hide }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 1px solid rgba(247,241,230,0.5); background: none; color: #F7F1E6; padding: 6px 10px; cursor: pointer;">{{ p.hideLabel }}</button>
                </div>
              </div>
            </sc-for>
          </div>
        </div>
      </sc-if>

      <!-- SETTINGS -->
      <sc-if value="{{ isSettings }}" hint-placeholder-val="{{ false }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(30px, 4vw, 48px); text-transform: uppercase; margin: 0 0 8px;">Platform settings<span style="color: #E9B4AC;">.</span></h1>
          <p style="font-size: 14px; color: rgba(247,241,230,0.7); margin: 0 0 24px;">{{ settingsNote }}</p>
          <div style="display: grid; gap: 14px; max-width: 680px;">
            <sc-for list="{{ settings }}" as="st" hint-placeholder-count="4">
              <div style="border: 2px solid #F7F1E6; background: #1F3A38; padding: 18px 20px; display: flex; justify-content: space-between; gap: 16px; align-items: center; flex-wrap: wrap;">
                <div style="min-width: 0; flex: 1;">
                  <div style="font-weight: 700; font-size: 14.5px;">{{ st.title }}</div>
                  <div style="font-size: 12.5px; color: rgba(247,241,230,0.65); margin-top: 3px; line-height: 1.5;">{{ st.desc }}</div>
                </div>
                <sc-if value="{{ st.canToggle }}" hint-placeholder-val="{{ true }}">
                  <button onClick="{{ st.toggle }}" role="switch" aria-checked="{{ st.on }}" aria-label="{{ st.title }}" style="width: 54px; height: 28px; border: 2px solid #F7F1E6; background: {{ st.bg }}; cursor: pointer; position: relative; padding: 0; flex-shrink: 0;">
                    <span style="position: absolute; top: 2px; left: {{ st.knobLeft }}; width: 20px; height: 20px; background: #F7F1E6; transition: left 120ms ease;"></span>
                  </button>
                </sc-if>
                <sc-if value="{{ st.readOnly }}" hint-placeholder-val="{{ false }}">
                  <span style="font-family: var(--tz-mono); font-size: 12px; color: #E9B4AC;">{{ st.state }}</span>
                </sc-if>
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
