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
    <header className="mb-6 flex items-center justify-between">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        {avatar ? (
          <img src={avatar} alt={name} className="h-11 w-11 rounded-full object-cover" />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-farm-accent text-base font-semibold text-white uppercase">
            {name.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-farm-text">{name}</p>
          <p className="text-xs text-farm-text/50">{roleDisplay}</p>
        </div>
      </div>
    </header>
  );
}
