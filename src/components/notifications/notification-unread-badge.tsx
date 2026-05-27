export function NotificationUnreadBadge({ count }: { count: number }) {
  if (count <= 0) {
    return null;
  }

  return (
    <span
      aria-label={`${count} notificări necitite`}
      className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full border-2 border-background bg-[#E9B44C] px-1 text-[0.65rem] font-black leading-none text-foreground"
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}
