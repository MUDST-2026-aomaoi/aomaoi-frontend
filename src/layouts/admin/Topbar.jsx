const CURRENT_ADMIN = { name: 'อำนวย ดูแลไร่', role: 'ผู้ดูแลระบบ' };

export function Topbar() {
  return (
    <header className="flex h-16 items-center justify-end border-b border-farm-secondary/30 bg-white px-6">
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-farm-text">{CURRENT_ADMIN.name}</p>
          <p className="text-xs text-farm-text/60">{CURRENT_ADMIN.role}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-farm-accent text-sm font-semibold text-white">
          {CURRENT_ADMIN.name.charAt(0)}
        </div>
      </div>
    </header>
  );
}
