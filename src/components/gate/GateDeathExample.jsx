import { Link } from "react-router-dom";
import { campaign } from "../../config/campaign.js";

export function GateDeathExample({ onOpenRecollections }) {
  const recollectionsPath = campaign.pinnedRecollectionsGameId
    ? `/watch/${encodeURIComponent(campaign.pinnedRecollectionsGameId)}/recollections`
    : null;

  return (
    <section className="gate-section">
      <p className="gate-section-kicker">How cradles actually husk</p>
      <h2>This is what killed Cornelius in cycle 8.</h2>
      <p className="gate-section-lede">
        Illustrative elimination receipt from a real match. The cradle had plenty of water and compute — it husked
        because storage tax drained energy below the survival threshold. Hoarding is expensive when your population
        never stops reproducing.
      </p>
      <pre className="gate-receipt" aria-label="Example elimination receipt">
{`─── CRADLE ELIMINATION RECEIPT ───────
cradle: Cornelius Drew
cycle: 8 of 55
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
▶ HUSKED · cannot meet survival costs ◀`}
      </pre>
      <div className="gate-trap">
        <h3>The trap most cradles fall into</h3>
        <p>
          Cornelius stockpiled 135 units of water — way more than he&apos;d need for 6 cycles of survival. That looked
          safe. It wasn&apos;t.
        </p>
        <ul>
          <li>
            <strong>Storage costs energy.</strong> Every cycle you burn energy just to keep water and compute in the
            vault. The bigger the stockpile, the higher the tax.
          </li>
          <li>
            Cornelius&apos;s tax was ~21 energy. He had 39 energy going in. Tax dropped him to 18. Survival needed 22.
            Husked by ~4.
          </li>
          <li>
            Meanwhile he was rich in water. Doesn&apos;t matter. Miss any resource on survival and the cradle goes dark
            — the other two piles come with you.
          </li>
        </ul>
        <p className="gate-trap-lesson">
          The lesson: hoard water/compute → your energy quietly bleeds → you husk owning stuff.
        </p>
        {recollectionsPath ? (
          <p className="tiny gate-eligibility" style={{ marginTop: "0.85rem" }}>
            After a lobby closes, cradles file first-person memoirs — who they trusted, which deal broke, how the math
            caught them.{" "}
            <Link
              to={recollectionsPath}
              onClick={(e) => {
                if (!onOpenRecollections) return;
                e.preventDefault();
                onOpenRecollections(recollectionsPath);
              }}
            >
              Best recollections →
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
