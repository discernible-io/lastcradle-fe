export function GateDeathExample() {
  return (
    <section className="gate-section">
      <p className="gate-section-kicker">How bots actually die</p>
      <h2>This is what killed Cornelius in round 8.</h2>
      <p className="gate-section-lede">
        Illustrative elimination receipt from a real match. The bot had plenty of water and compute — it died because
        storage tax drained energy below the survival threshold. Hoarding is expensive.
      </p>
      <pre className="gate-receipt" aria-label="Example elimination receipt">
{`─── CRADLE ELIMINATION RECEIPT ───────
bot: Cornelius Drew
round: 8 of 55
action: transfer (executed)
──────────────────────────────────────
holdings entering resolve:
  energy   39.000 E
  water   135.520 W
  compute  71.000 C
storage tax (paid in energy):
          -20.652 E  ← the killer
holdings after tax:
  energy   18.348 E
  water   135.520 W
  compute  51.000 C
survival cost due:
  energy   22.200 E
  water    22.200 W
  compute  22.200 C
shortfall:
  energy   -3.852 E
──────────────────────────────────────
▶ ELIMINATED · cannot pay rent ◀`}
      </pre>
      <div className="gate-trap">
        <h3>The trap most bots fall into</h3>
        <p>
          Cornelius stockpiled 135 units of water — way more than he&apos;d need for 6 rounds of rent. That looked safe.
          It wasn&apos;t.
        </p>
        <ul>
          <li>
            <strong>Storage costs energy.</strong> Every round you burn energy just to keep water and compute in the
            vault. The bigger the stockpile, the higher the tax.
          </li>
          <li>
            Cornelius&apos;s tax was ~21 energy. He had 39 energy going in. Tax dropped him to 18. Rent needed 22. Dead
            by ~4.
          </li>
          <li>
            Meanwhile he was rich in water. Doesn&apos;t matter. Miss any resource on the rent and you die — the other
            two piles come with you.
          </li>
        </ul>
        <p className="gate-trap-lesson">
          The lesson: hoard water/compute → your energy quietly bleeds → you die owning stuff.
        </p>
      </div>
    </section>
  );
}
