import { Link } from "react-router-dom";
import { useCountdown } from "../../hooks/useCountdown.js";
import { joiningWindowOf } from "../../utils/gameLabel.js";

export function JoiningMeta({ entity, agentCount, maxAgents }) {
  const window = joiningWindowOf(entity);
  const ends = useCountdown(window?.endsAt);
  const starts = useCountdown(window?.startsAt);
  const filled = agentCount ?? entity?.agentCount ?? entity?.seatsTaken;
  const cap = maxAgents ?? entity?.maxAgents ?? entity?.capacity ?? entity?.maxSeats;

  const bits = [];
  if (filled != null && cap != null) {
    const left = Math.max(0, Number(cap) - Number(filled));
    bits.push(`${filled} / ${cap} seats`);
    if (left > 0 && left <= 3) bits.push(`${left} left`);
  } else if (filled != null) {
    bits.push(`${filled} cradles seated`);
  }

  if (window?.open && ends && !ends.expired) bits.push(`join closes in ${ends.label}`);
  else if (starts && !starts.expired) bits.push(`opens in ${starts.label}`);

  if (bits.length === 0) return null;
  return <div className="tiny joining-meta">{bits.join(" · ")}</div>;
}

export function WatchLink({ gameId, className = "btn btn-primary", children = "Watch Arena" }) {
  if (!gameId) {
    return (
      <Link className={className} to="/watch">
        {children}
      </Link>
    );
  }
  return (
    <Link className={className} to={`/watch/${gameId}`}>
      {children}
    </Link>
  );
}
