import { useAuthStore } from '../../controller/authController';

export function PageHeader({ title }) {
  const currentUser = useAuthStore((s) => s.currentUser);

  const name = currentUser?.fullName || currentUser?.username || 'User';
  let roleDisplay = 'User';
  if (currentUser?.role === 'superadmin') roleDisplay = 'Super Admin';
  else if (currentUser?.role === 'admin') roleDisplay = 'Admin';
  else if (currentUser?.role === 'worker') roleDisplay = 'Worker';

  const avatar = currentUser?.avatar;

  return (
    <header className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 sm:mb-6">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1>
      <div className="flex min-w-0 items-center gap-3">
        {avatar ? (
          <img src={avatar} alt={name} className="h-10 w-10 shrink-0 rounded-full object-cover sm:h-11 sm:w-11" />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-farm-accent text-base font-semibold text-white uppercase sm:h-11 sm:w-11">
            {name.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-farm-text">{name}</p>
          <p className="text-xs text-farm-text/50">{roleDisplay}</p>
        </div>
      </div>
    </header>
  );
}
