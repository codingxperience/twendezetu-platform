// Markup for the admin page. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #14201F; color: #F7F1E6; min-height: 100vh;">

  <!-- Top bar -->
  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 16px 24px; border-bottom: 2px solid #F7F1E6; background: #14201F; position: sticky; top: 0; z-index: 40;">
    <div style="display: flex; align-items: center; gap: 20px;">
      <a href="/" style="text-decoration: none; color: #F7F1E6; font-family: var(--tz-display); font-size: 24px; text-transform: uppercase; line-height: 0.9;">TWENDE<br><span style="color: #D97A3B;">ZETU</span></a>
      <span style="font-family: var(--tz-mono); font-size: 12px; background: #B8463A; color: #F7F1E6; padding: 5px 10px;">ADMIN CONSOLE</span>
    </div>
    <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; position: relative;">
      <a href="/finance" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #F7F1E6; color: #F7F1E6; text-decoration: none; padding: 9px 14px;">◍ FINANCE →</a>
      <button onClick="{{ broadcast }}" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #D97A3B; background: #D97A3B; color: #14201F; padding: 9px 14px; cursor: pointer;">📣 BROADCAST</button>
      <button onClick="{{ toggleAdminMenu }}" style="width: 38px; height: 38px; background: #B8463A; color: #F7F1E6; border: 2px solid #F7F1E6; font-family: var(--tz-display); font-size: 15px; display: flex; align-items: center; justify-content: center; cursor: pointer;">JA</button>
      <sc-if value="{{ adminMenuOpen }}" hint-placeholder-val="{{ false }}">
        <div style="position: absolute; top: 48px; right: 0; width: 280px; background: #1F3A38; border: 2px solid #F7F1E6; box-shadow: 6px 6px 0 rgba(0,0,0,0.4); z-index: 60;">
          <div style="padding: 14px 18px; border-bottom: 2px solid #F7F1E6;">
            <div style="font-weight: 700; font-size: 14.5px;">Josephat A.</div>
            <div style="font-family: var(--tz-mono); font-size: 10.5px; color: rgba(247,241,230,0.6); margin-top: 2px;">SUPER ADMIN · 2FA ON · AUDIT LOGGED</div>
          </div>
          <button onClick="{{ adminSettings }}" style="display: block; width: 100%; text-align: left; background: none; border: 0; border-bottom: 1px solid rgba(247,241,230,0.15); padding: 12px 18px; font-family: var(--tz-sans); font-size: 14px; color: #F7F1E6; cursor: pointer;">⚙ &nbsp;Console settings &amp; admin roles</button>
          <a href="/finance" style="display: block; text-decoration: none; color: #F7F1E6; border-bottom: 1px solid rgba(247,241,230,0.15); padding: 12px 18px; font-size: 14px;">◍ &nbsp;Finance console</a>
          <a href="/sign-in" style="display: block; text-decoration: none; color: #E8A472; padding: 12px 18px; font-size: 14px; font-weight: 600;">→ &nbsp;Sign out</a>
        </div>
      </sc-if>
    </div>
  </header>

  <div class="tw-shell" style="display: grid; grid-template-columns: 230px 1fr; min-height: calc(100vh - 76px);">

    <!-- Sidebar -->
    <aside class="tw-side" style="border-right: 2px solid #F7F1E6; padding: 20px 0; display: flex; flex-direction: column; gap: 2px; position: sticky; top: 76px; align-self: start;">
      <sc-for list="{{ navItems }}" as="n" hint-placeholder-count="6">
        <button onClick="{{ n.go }}" style="display: flex; justify-content: space-between; align-items: center; gap: 10px; text-align: left; background: {{ n.bg }}; color: {{ n.fg }}; border: 0; padding: 13px 20px; font-family: var(--tz-mono); font-size: 12.5px; letter-spacing: 0.04em; cursor: pointer; white-space: nowrap;">
          <span style="display: flex; align-items: center; gap: 10px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="{{ n.iconPath }}"></path></svg>
            <span>{{ n.label }}</span>
          </span>
          <sc-if value="{{ n.badge }}" hint-placeholder-val="{{ false }}">
            <span style="background: #B8463A; color: #F7F1E6; font-size: 10px; padding: 2px 7px;">{{ n.badge }}</span>
          </sc-if>
        </button>
      </sc-for>
    </aside>

    <!-- Main -->
    <section style="padding: 32px 28px 80px; min-width: 0;">

      <!-- OVERVIEW -->
      <sc-if value="{{ isOverview }}" hint-placeholder-val="{{ true }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(30px, 4vw, 48px); text-transform: uppercase; margin: 0 0 24px;">Platform health<span style="color: #D97A3B;">.</span></h1>
          <div class="tw-4col" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; border: 2px solid #F7F1E6; background: #F7F1E6; margin-bottom: 28px;">
            <sc-for list="{{ kpis }}" as="k" hint-placeholder-count="8">
              <div style="background: #1F3A38; padding: 18px 20px;">
                <div style="font-family: var(--tz-mono); font-size: 10.5px; letter-spacing: 0.08em; color: #E8A472;">{{ k.label }}</div>
                <div style="font-family: var(--tz-display); font-size: 34px; line-height: 1; margin-top: 8px;">{{ k.big }}</div>
                <div style="font-size: 12px; margin-top: 5px; color: {{ k.deltaColor }};">{{ k.delta }}</div>
              </div>
            </sc-for>
          </div>
          <div style="border: 2px solid #F7F1E6; background: #1F3A38; padding: 22px 24px;">
            <div style="font-family: var(--tz-mono); font-size: 11px; color: #E8A472; letter-spacing: 0.08em; margin-bottom: 14px;">[Needs attention now]</div>
            <sc-for list="{{ attention }}" as="a" hint-placeholder-count="4">
              <button onClick="{{ a.go }}" style="display: flex; justify-content: space-between; align-items: center; gap: 14px; width: 100%; text-align: left; background: none; border: 0; border-bottom: 1px solid rgba(247,241,230,0.15); padding: 12px 2px; cursor: pointer; color: #F7F1E6; font-family: var(--tz-sans);">
                <span style="font-size: 14px;">{{ a.label }}</span>
                <span style="font-family: var(--tz-mono); font-size: 11px; color: #D97A3B;">{{ a.action }} →</span>
              </button>
            </sc-for>
          </div>
        </div>
      </sc-if>

      <!-- MODERATION -->
      <sc-if value="{{ isModeration }}" hint-placeholder-val="{{ false }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(30px, 4vw, 48px); text-transform: uppercase; margin: 0 0 8px;">Moderation queue<span style="color: #D97A3B;">.</span></h1>
          <p style="font-size: 14px; color: rgba(247,241,230,0.7); margin: 0 0 24px;">Reports from masked threads, flagged posts, and automated scam detection. Thread evidence is preserved read-only.</p>
          <div style="display: grid; gap: 14px;">
            <sc-for list="{{ reports }}" as="r" hint-placeholder-count="3">
              <div style="border: 2px solid #F7F1E6; background: #1F3A38; padding: 20px 22px;">
                <div style="display: flex; justify-content: space-between; gap: 14px; flex-wrap: wrap; align-items: start;">
                  <div>
                    <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                      <span style="font-family: var(--tz-mono); font-size: 10.5px; background: {{ r.sevBg }}; color: #14201F; padding: 3px 8px;">{{ r.severity }}</span>
                      <span style="font-family: var(--tz-display); font-size: 17px; text-transform: uppercase;">{{ r.reason }}</span>
                    </div>
                    <div style="font-family: var(--tz-mono); font-size: 11.5px; color: rgba(247,241,230,0.6); margin-top: 6px;">{{ r.meta }}</div>
                    <div style="font-size: 13.5px; color: rgba(247,241,230,0.85); line-height: 1.5; margin-top: 8px; max-width: 560px;">{{ r.body }}</div>
                  </div>
                  <sc-if value="{{ r.open }}" hint-placeholder-val="{{ true }}">
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                      <button onClick="{{ r.dismiss }}" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid rgba(247,241,230,0.5); background: none; color: #F7F1E6; padding: 9px 13px; cursor: pointer;">DISMISS</button>
                      <button onClick="{{ r.warn }}" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #D97A3B; background: #D97A3B; color: #14201F; padding: 9px 13px; cursor: pointer;">WARN USER</button>
                      <button onClick="{{ r.suspend }}" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #B8463A; background: #B8463A; color: #F7F1E6; padding: 9px 13px; cursor: pointer;">SUSPEND</button>
                    </div>
                  </sc-if>
                  <sc-if value="{{ r.resolved }}" hint-placeholder-val="{{ false }}">
                    <span style="font-family: var(--tz-mono); font-size: 11px; color: #7B8B6E;">{{ r.resolution }}</span>
                  </sc-if>
                </div>
              </div>
            </sc-for>
          </div>
        </div>
      </sc-if>

      <!-- USERS -->
      <sc-if value="{{ isUsers }}" hint-placeholder-val="{{ false }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(30px, 4vw, 48px); text-transform: uppercase; margin: 0 0 24px;">Users &amp; roles<span style="color: #D97A3B;">.</span></h1>
          <div style="border: 2px solid #F7F1E6; overflow-x: auto;">
            <div style="display: grid; grid-template-columns: 1.4fr 1fr 0.8fr 0.8fr 1.1fr; gap: 0; min-width: 760px; background: #F7F1E6; color: #14201F; font-family: var(--tz-mono); font-size: 10.5px; letter-spacing: 0.06em;">
              <span style="padding: 10px 14px;">USER</span><span style="padding: 10px 14px;">ROLE</span><span style="padding: 10px 14px;">CITY</span><span style="padding: 10px 14px;">STATUS</span><span style="padding: 10px 14px;">ACTIONS</span>
            </div>
            <sc-for list="{{ users }}" as="u" hint-placeholder-count="5">
              <div style="display: grid; grid-template-columns: 1.4fr 1fr 0.8fr 0.8fr 1.1fr; min-width: 760px; background: #1F3A38; border-top: 1px solid rgba(247,241,230,0.15); align-items: center;">
                <div style="padding: 12px 14px;">
                  <div style="font-weight: 600; font-size: 13.5px;">{{ u.name }}</div>
                  <div style="font-family: var(--tz-mono); font-size: 10.5px; color: rgba(247,241,230,0.55);">{{ u.email }}</div>
                </div>
                <span style="padding: 12px 14px; font-family: var(--tz-mono); font-size: 11px; color: #E8A472;">{{ u.role }}</span>
                <span style="padding: 12px 14px; font-size: 12.5px;">{{ u.city }}</span>
                <span style="padding: 12px 14px; font-family: var(--tz-mono); font-size: 11px; color: {{ u.statusColor }};">{{ u.status }}</span>
                <div style="padding: 12px 14px; display: flex; gap: 6px;">
                  <button onClick="{{ u.view }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 1px solid rgba(247,241,230,0.5); background: {{ u.viewBg }}; color: #F7F1E6; padding: 6px 10px; cursor: pointer;">{{ u.viewLabel }}</button>
                  <button onClick="{{ u.msg }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 1px solid rgba(247,241,230,0.5); background: none; color: #F7F1E6; padding: 6px 10px; cursor: pointer;">MESSAGE</button>
                  <button onClick="{{ u.toggle }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 1px solid {{ u.toggleBorder }}; background: none; color: {{ u.toggleColor }}; padding: 6px 10px; cursor: pointer;">{{ u.toggleLabel }}</button>
                </div>
              </div>
              <sc-if value="{{ u.editing }}" hint-placeholder-val="{{ false }}">
                <div style="min-width: 760px; background: #14201F; border-top: 2px solid #D97A3B; padding: 18px 16px;">
                  <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #E8A472; letter-spacing: 0.08em; margin-bottom: 12px;">[EDIT PROFILE — CHANGES ARE AUDIT-LOGGED &amp; USER IS NOTIFIED]</div>
                  <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                    <input value="{{ u.name }}" style="border: 2px solid rgba(247,241,230,0.4); background: rgba(247,241,230,0.06); color: #F7F1E6; padding: 10px 12px; font-family: var(--tz-sans); font-size: 13px; outline: none;">
                    <input value="{{ u.email }}" style="border: 2px solid rgba(247,241,230,0.4); background: rgba(247,241,230,0.06); color: #F7F1E6; padding: 10px 12px; font-family: var(--tz-mono); font-size: 12px; outline: none;">
                    <select style="border: 2px solid rgba(247,241,230,0.4); background: #14201F; color: #F7F1E6; padding: 10px 12px; font-family: var(--tz-sans); font-size: 13px; outline: none;">
                      <option>USER</option><option>USER + ADVERTISER</option><option>PROVIDER</option><option>PROVIDER ✓</option><option>ORGANIZER ✓</option><option>ADMIN</option>
                    </select>
                    <input value="{{ u.city }}" style="border: 2px solid rgba(247,241,230,0.4); background: rgba(247,241,230,0.06); color: #F7F1E6; padding: 10px 12px; font-family: var(--tz-sans); font-size: 13px; outline: none;">
                  </div>
                  <div style="display: flex; gap: 8px; margin-top: 12px;">
                    <button onClick="{{ u.save }}" style="font-family: var(--tz-display); font-size: 13px; text-transform: uppercase; background: #D97A3B; color: #14201F; border: 0; padding: 10px 20px; cursor: pointer;">Save changes</button>
                    <button onClick="{{ u.resetPw }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 1px solid rgba(247,241,230,0.5); background: none; color: #F7F1E6; padding: 10px 14px; cursor: pointer;">SEND PASSWORD RESET</button>
                  </div>
                </div>
              </sc-if>
              <sc-if value="{{ u.messaging }}" hint-placeholder-val="{{ false }}">
                <div style="min-width: 760px; background: #14201F; border-top: 2px solid #D97A3B; padding: 18px 16px;">
                  <div style="font-family: var(--tz-mono); font-size: 10.5px; color: #E8A472; letter-spacing: 0.08em; margin-bottom: 10px;">[MESSAGE {{ u.name }} — DELIVERED AS AN OFFICIAL PLATFORM THREAD, VISIBLE IN THEIR INBOX]</div>
                  <textarea rows="3" placeholder="Habari — this is the Twendezetu team…" style="width: 100%; box-sizing: border-box; border: 2px solid rgba(247,241,230,0.4); background: rgba(247,241,230,0.06); color: #F7F1E6; padding: 12px 14px; font-family: var(--tz-sans); font-size: 13.5px; outline: none; resize: vertical;"></textarea>
                  <div style="display: flex; gap: 8px; margin-top: 10px;">
                    <button onClick="{{ u.sendMsg }}" style="font-family: var(--tz-display); font-size: 13px; text-transform: uppercase; background: #D97A3B; color: #14201F; border: 0; padding: 10px 20px; cursor: pointer;">Send →</button>
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
          <h1 style="font-family: var(--tz-display); font-size: clamp(30px, 4vw, 48px); text-transform: uppercase; margin: 0 0 8px;">Provider verification<span style="color: #D97A3B;">.</span></h1>
          <p style="font-size: 14px; color: rgba(247,241,230,0.7); margin: 0 0 24px;">ID + business checks before the ✓ badge. Verified providers rank higher in matching.</p>
          <div style="display: grid; gap: 14px;">
            <sc-for list="{{ verifications }}" as="v" hint-placeholder-count="3">
              <div style="border: 2px solid #F7F1E6; background: #1F3A38; padding: 20px 22px; display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; align-items: center;">
                <div>
                  <div style="font-family: var(--tz-display); font-size: 18px; text-transform: uppercase;">{{ v.name }}</div>
                  <div style="font-family: var(--tz-mono); font-size: 11.5px; color: rgba(247,241,230,0.6); margin-top: 4px;">{{ v.meta }}</div>
                  <div style="display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap;">
                    <sc-for list="{{ v.checks }}" as="c" hint-placeholder-count="3">
                      <span style="font-family: var(--tz-mono); font-size: 10.5px; border: 1px solid rgba(247,241,230,0.4); padding: 4px 9px; color: {{ c.color }};">{{ c.label }}</span>
                    </sc-for>
                  </div>
                </div>
                <sc-if value="{{ v.pending }}" hint-placeholder-val="{{ true }}">
                  <div style="display: flex; gap: 8px;">
                    <button onClick="{{ v.approve }}" style="font-family: var(--tz-display); font-size: 13px; text-transform: uppercase; border: 2px solid #7B8B6E; background: #7B8B6E; color: #F7F1E6; padding: 10px 18px; cursor: pointer;">Approve ✓</button>
                    <button onClick="{{ v.reject }}" style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #B8463A; background: none; color: #E8A472; padding: 10px 14px; cursor: pointer;">REQUEST MORE INFO</button>
                  </div>
                </sc-if>
                <sc-if value="{{ v.done }}" hint-placeholder-val="{{ false }}">
                  <span style="font-family: var(--tz-mono); font-size: 11px; color: #7B8B6E;">{{ v.result }}</span>
                </sc-if>
              </div>
            </sc-for>
          </div>
        </div>
      </sc-if>

      <!-- CONTENT -->
      <sc-if value="{{ isContent }}" hint-placeholder-val="{{ false }}">
        <div>
          <h1 style="font-family: var(--tz-display); font-size: clamp(30px, 4vw, 48px); text-transform: uppercase; margin: 0 0 24px;">Events &amp; needs<span style="color: #D97A3B;">.</span></h1>
          <div style="border: 2px solid #F7F1E6; overflow-x: auto;">
            <div style="display: grid; grid-template-columns: 1.6fr 0.7fr 0.9fr 0.7fr 1fr; min-width: 760px; background: #F7F1E6; color: #14201F; font-family: var(--tz-mono); font-size: 10.5px; letter-spacing: 0.06em;">
              <span style="padding: 10px 14px;">POST</span><span style="padding: 10px 14px;">TYPE</span><span style="padding: 10px 14px;">CITY</span><span style="padding: 10px 14px;">TRACTION</span><span style="padding: 10px 14px;">ACTIONS</span>
            </div>
            <sc-for list="{{ posts }}" as="p" hint-placeholder-count="5">
              <div style="display: grid; grid-template-columns: 1.6fr 0.7fr 0.9fr 0.7fr 1fr; min-width: 760px; background: #1F3A38; border-top: 1px solid rgba(247,241,230,0.15); align-items: center;">
                <div style="padding: 12px 14px;">
                  <div style="font-weight: 600; font-size: 13.5px;">{{ p.title }}</div>
                  <div style="font-family: var(--tz-mono); font-size: 10.5px; color: rgba(247,241,230,0.55);">{{ p.by }}</div>
                </div>
                <span style="padding: 12px 14px; font-family: var(--tz-mono); font-size: 11px; color: #E8A472;">{{ p.type }}</span>
                <span style="padding: 12px 14px; font-size: 12.5px;">{{ p.city }}</span>
                <span style="padding: 12px 14px; font-family: var(--tz-mono); font-size: 11px;">{{ p.traction }}</span>
                <div style="padding: 12px 14px; display: flex; gap: 6px;">
                  <button onClick="{{ p.feature }}" style="font-family: var(--tz-mono); font-size: 10.5px; border: 1px solid #D97A3B; background: {{ p.featBg }}; color: {{ p.featFg }}; padding: 6px 10px; cursor: pointer;">{{ p.featLabel }}</button>
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
          <h1 style="font-family: var(--tz-display); font-size: clamp(30px, 4vw, 48px); text-transform: uppercase; margin: 0 0 24px;">Platform settings<span style="color: #D97A3B;">.</span></h1>
          <div style="display: grid; gap: 14px; max-width: 680px;">
            <sc-for list="{{ settings }}" as="st" hint-placeholder-count="5">
              <div style="border: 2px solid #F7F1E6; background: #1F3A38; padding: 18px 20px; display: flex; justify-content: space-between; gap: 16px; align-items: center; flex-wrap: wrap;">
                <div>
                  <div style="font-weight: 700; font-size: 14.5px;">{{ st.title }}</div>
                  <div style="font-size: 12.5px; color: rgba(247,241,230,0.65); margin-top: 3px; line-height: 1.5;">{{ st.desc }}</div>
                </div>
                <sc-if value="{{ st.isToggle }}" hint-placeholder-val="{{ true }}">
                  <button onClick="{{ st.toggle }}" style="width: 54px; height: 28px; border: 2px solid #F7F1E6; background: {{ st.bg }}; cursor: pointer; position: relative; padding: 0; flex-shrink: 0;">
                    <span style="position: absolute; top: 2px; left: {{ st.knobLeft }}; width: 20px; height: 20px; background: #F7F1E6; transition: left 120ms ease;"></span>
                  </button>
                </sc-if>
                <sc-if value="{{ st.isValue }}" hint-placeholder-val="{{ false }}">
                  <span style="font-family: var(--tz-display); font-size: 20px; color: #D97A3B;">{{ st.value }}</span>
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
