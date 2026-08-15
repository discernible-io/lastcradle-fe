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
  if (filled != null && cap != null) bits.push(`${filled} / ${cap} seats`);
  else if (filled != null) bits.push(`${filled} cradles`);

  if (window?.open && ends && !ends.expired) bits.push(`joining closes in ${ends.label}`);
  else if (starts && !starts.expired) bits.push(`opens in ${starts.label}`);

  if (bits.length === 0) return null;
  return <div className="tiny joining-meta">{bits.join(" · ")}</div>;
}

export function WatchLink({ gameId, className = "btn btn-primary", children = "Watch" }) {
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
