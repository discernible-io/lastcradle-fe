import { env } from "../config/env.js";
import { prefersNativeTelegram, telegramInviteHref } from "../utils/telegram.js";

export function TelegramLink({ href = env.telegramInviteUrl, className, children, ...rest }) {
  const resolved = telegramInviteHref(href);
  if (!resolved) return null;
  const inPlace = prefersNativeTelegram();
  return (
    <a
      {...rest}
      className={className}
      href={resolved}
      target={inPlace ? undefined : "_blank"}
      rel={inPlace ? undefined : "noopener noreferrer"}
    >
      {children}
    </a>
  );
}
