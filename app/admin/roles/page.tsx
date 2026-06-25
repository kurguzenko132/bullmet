import Link from 'next/link';
import { adminRoles } from '@/lib/adminPeople';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Роли и права | Админка Bullmet' };

export default function AdminRolesPage() {
  return (
    <div className="admin-roles-page">
      <div className="admin-page-head">
        <div>
          <p>Роли и права</p>
          <h1>Матрица доступа Bullmet</h1>
          <span>Заготовка системы ролей для будущей командной работы в админке.</span>
        </div>
        <div className="admin-head-actions">
          <Link href="/admin/users">Управлять пользователями</Link>
        </div>
      </div>

      <section className="admin-roles-grid">
        {adminRoles.map((role) => (
          <article key={role.value}>
            <div>
              <span>{role.value}</span>
              <h2>{role.label}</h2>
              <p>{role.description}</p>
            </div>
            <ul>
              {role.access.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        ))}
      </section>

      <section className="admin-role-note">
        <h2>Как это будет работать дальше</h2>
        <p>Сейчас роли уже сохраняются в профиле пользователя. Следующим техническим усилением можно подключить ограничение интерфейса: менеджеру показывать только заказы/заявки, контент-менеджеру — товары/главную/медиа, администратору — всё.</p>
      </section>
    </div>
  );
}
