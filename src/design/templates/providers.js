// Markup for the provider directory. Bindings are resolved by src/design/render.js.

const template = `
<div style="font-family: var(--tz-sans); background: #F7F1E6; color: #14201F; min-height: 100vh;">

  <!-- Header -->
  <header style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 18px 24px; border-bottom: 2px solid #1F3A38; background: #F7F1E6; position: sticky; top: 0; z-index: 40;">
    <div style="display: flex; align-items: center; gap: 36px;">
      <a href="/" style="text-decoration: none; color: #14201F; font-family: var(--tz-display); font-size: 26px; text-transform: uppercase; line-height: 0.9;">TWENDE<br><span style="color: #D97A3B;">ZETU</span></a>
      <nav class="tw-nav" style="display: flex; gap: 24px; font-size: 14px; font-weight: 500;">
        <a href="/" style="color: #6E6155; text-decoration: none;">Event guide</a>
        <a href="/providers" aria-current="page" style="color: #14201F; text-decoration: none; border-bottom: 2px solid #D97A3B;">Directory</a>
        <a href="/create-event?kind=need" style="color: #6E6155; text-decoration: none;">Post a need</a>
      </nav>
    </div>
    <div style="display: flex; gap: 10px; align-items: center;">
      <a href="{{ me.accountHref }}" style="font-size: 14px; font-weight: 600; color: #14201F; text-decoration: none; padding: 10px 16px;">{{ accountLabel }}</a>
      <a href="/provider-dashboard" style="font-family: var(--tz-mono); font-size: 13px; background: #1F3A38; color: #F7F1E6; text-decoration: none; padding: 12px 20px; box-shadow: 4px 4px 0 #D97A3B;">FOR PROVIDERS →</a>
    </div>
  </header>

  <!-- Title + search -->
  <section style="max-width: 1200px; margin: 0 auto; padding: 40px 24px 20px;">
    <div style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23; letter-spacing: 0.08em;">[Watoa huduma — the directory]</div>
    <h1 style="font-family: var(--tz-display); font-size: clamp(44px, 7vw, 92px); text-transform: uppercase; line-height: 0.92; margin: 10px 0 12px;">{{ title }}<span style="color: #D97A3B;">.</span></h1>
    <p style="font-size: 15px; color: #3A2F25; max-width: 640px; line-height: 1.55; margin: 0 0 24px;">DJs, caterers, tents, drivers, photographers and MCs across East Africa and the diaspora. Ask any of them for a quote without an account; your phone and email stay masked.</p>
    <form onSubmit="{{ search }}" role="search" style="display: flex; gap: 10px; flex-wrap: wrap; max-width: 760px;">
      <input type="search" value="{{ q }}" onChange="{{ setQ }}" aria-label="Search providers" placeholder="Search by name or what they do — e.g. amapiano, pilau, airport runs" style="flex: 2; min-width: 240px; border: 2px solid #1F3A38; background: #FFFDF8; padding: 14px 16px; font-family: var(--tz-sans); font-size: 15px; outline: none;">
      <input value="{{ city }}" onChange="{{ setCity }}" aria-label="City" placeholder="City" list="directory-cities" style="flex: 1; min-width: 140px; border: 2px solid #1F3A38; background: #FFFDF8; padding: 14px 16px; font-family: var(--tz-sans); font-size: 15px; outline: none;">
      <datalist id="directory-cities"><sc-for list="{{ cities }}" as="c"><option value="{{ c.name }}"></option></sc-for></datalist>
      <button type="submit" style="font-family: var(--tz-display); font-size: 16px; text-transform: uppercase; background: #D97A3B; color: #1F3A38; border: 2px solid #1F3A38; padding: 12px 26px; cursor: pointer; box-shadow: 4px 4px 0 #1F3A38;">Search</button>
    </form>
  </section>

  <!-- Category chips -->
  <nav aria-label="Categories" style="max-width: 1200px; margin: 0 auto; padding: 0 24px 24px; display: flex; gap: 8px; flex-wrap: wrap;">
    <sc-for list="{{ categories }}" as="cat">
      <a href="{{ cat.href }}" aria-current="{{ cat.current }}" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: {{ cat.bg }}; color: {{ cat.fg }}; padding: 9px 14px; text-decoration: none; white-space: nowrap;">{{ cat.label }} <span style="opacity: 0.65;">{{ cat.count }}</span></a>
    </sc-for>
  </nav>

  <!-- Results -->
  <section style="border-top: 2px solid #1F3A38; background: #EFE7D6; padding: 32px 24px 56px;">
    <div style="max-width: 1200px; margin: 0 auto;">
      <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; margin-bottom: 18px;">
        <div style="font-family: var(--tz-mono); font-size: 12px; color: #6E6155;">{{ resultLine }}</div>
        <sc-if value="{{ filtered }}"><a href="/providers" style="font-family: var(--tz-mono); font-size: 12px; color: #A85A23;">CLEAR FILTERS ✕</a></sc-if>
      </div>
      <sc-if value="{{ empty }}">
        <div style="border: 2px dashed #1F3A38; background: #FFFDF8; padding: 28px; max-width: 640px;">
          <div style="font-family: var(--tz-display); font-size: 22px; text-transform: uppercase;">Nobody listed for that yet</div>
          <p style="font-size: 14px; color: #6E6155; line-height: 1.55; margin: 8px 0 16px;">Post a need instead. Providers who serve the area hear about it and send offers you can compare.</p>
          <a href="/create-event?kind=need" style="font-family: var(--tz-mono); font-size: 12px; border: 2px solid #1F3A38; background: #D97A3B; color: #1F3A38; padding: 10px 16px; text-decoration: none;">POST A NEED →</a>
        </div>
      </sc-if>
      <div class="tw-3col" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px;">
        <sc-for list="{{ providers }}" as="pv">
          <a href="{{ pv.href }}" style="border: 2px solid #1F3A38; background: #FFFDF8; text-decoration: none; color: #14201F; display: flex; flex-direction: column;" style-hover="transform: translate(-3px,-3px); box-shadow: 5px 5px 0 #D97A3B;">
            <div style="position: relative;">
              <img src="{{ pv.img }}" alt="" loading="lazy" style="width: 100%; height: 170px; object-fit: cover; display: block; border-bottom: 2px solid #1F3A38; background: #EFE7D6;">
              <span style="position: absolute; top: 10px; left: 10px; background: #F7F1E6; border: 2px solid #1F3A38; font-family: var(--tz-mono); font-size: 10px; padding: 3px 8px;">{{ pv.cat }}</span>
              <sc-if value="{{ pv.verified }}"><span style="position: absolute; top: 10px; right: 10px; background: #1F3A38; color: #F7F1E6; font-family: var(--tz-mono); font-size: 10px; padding: 4px 8px;">✓ VERIFIED</span></sc-if>
            </div>
            <div style="padding: 14px 16px; display: flex; flex-direction: column; flex: 1;">
              <div style="font-family: var(--tz-display); font-size: 19px; text-transform: uppercase; line-height: 1.05;">{{ pv.name }}</div>
              <div style="font-family: var(--tz-mono); font-size: 11px; color: #6E6155; margin-top: 5px;">{{ pv.meta }}</div>
              <div style="font-size: 13px; color: #3A2F25; line-height: 1.5; margin-top: 8px;">{{ pv.desc }}</div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 14px;">
                <span style="font-family: var(--tz-display); font-size: 15px; color: #A85A23;">{{ pv.rateLabel }}</span>
                <span style="font-family: var(--tz-mono); font-size: 11px; border: 2px solid #1F3A38; background: #D97A3B; padding: 8px 14px;">VIEW →</span>
              </div>
            </div>
          </a>
        </sc-for>
      </div>
    </div>
  </section>

  <!-- For providers -->
  <section style="border-top: 2px solid #1F3A38; background: #1F3A38; color: #F7F1E6; padding: 40px 24px;">
    <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap;">
      <div>
        <div style="font-family: var(--tz-display); font-size: 30px; text-transform: uppercase;">Do this for a living<span style="color: #D97A3B;">?</span></div>
        <div style="font-size: 14px; color: rgba(247,241,230,0.8); margin-top: 6px; max-width: 560px; line-height: 1.5;">List your service, hear about matching needs in your cities, and get paid through escrow. Masked contacts protect you too.</div>
      </div>
      <a href="/provider-dashboard" style="font-family: var(--tz-display); font-size: 16px; text-transform: uppercase; background: #D97A3B; color: #1F3A38; border: 2px solid #F7F1E6; padding: 14px 28px; text-decoration: none;">List your service →</a>
    </div>
  </section>
</div>
`;

export default template;
