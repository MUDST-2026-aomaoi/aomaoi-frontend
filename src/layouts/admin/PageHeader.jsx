const DEFAULT_ADMIN = { name: 'อำนวย ดูแลไร่', role: 'Admin', avatar: null };

export function PageHeader({ title, admin = DEFAULT_ADMIN }) {
  return (
    <header className="mb-6 flex items-center justify-between">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        {admin.avatar ? (
          <img src={admin.avatar} alt={admin.name} className="h-11 w-11 rounded-full object-cover" />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-farm-accent text-base font-semibold text-white">
            {admin.name.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-farm-text">{admin.name}</p>
          <p className="text-xs text-farm-text/50">{admin.role}</p>
        </div>
      </div>
    </header>
  );
}
