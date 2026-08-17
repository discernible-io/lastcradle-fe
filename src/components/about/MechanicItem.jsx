import { MechanicIcon } from "./mechanicIcons.jsx";

export function MechanicItem({ icon, toneIndex = 0, title, children }) {
  return (
    <div className="about-mechanic">
      <MechanicIcon name={icon} toneIndex={toneIndex} />
      <dt>{title}</dt>
      <dd>{children}</dd>
    </div>
  );
}
