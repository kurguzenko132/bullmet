import Link from 'next/link';
import { CheckCircle2, ExternalLink, Wrench } from 'lucide-react';

export type AdminModuleAction = {
  label: string;
  href: string;
  primary?: boolean;
  external?: boolean;
};

export type AdminModuleMetric = {
  label: string;
  value: string | number;
  hint: string;
};

export function AdminModulePage({
  eyebrow,
  title,
  description,
  metrics = [],
  actions = [],
  checklist = []
}: {
  eyebrow: string;
  title: string;
  description: string;
  metrics?: AdminModuleMetric[];
  actions?: AdminModuleAction[];
  checklist?: string[];
}) {
  return (
    <div className="admin-module-page">
      <div className="admin-page-head">
        <div>
          <p>{eyebrow}</p>
          <h1>{title}</h1>
          <span>{description}</span>
        </div>
        <div className="admin-head-actions">
          {actions.slice(0, 3).map((action) => (
            <Link key={action.href + action.label} href={action.href} target={action.external ? '_blank' : undefined} className={action.primary ? 'is-primary' : ''}>
              {action.primary ? <Wrench size={17} /> : <ExternalLink size={17} />}
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {!!metrics.length && (
        <section className="admin-module-metrics">
          {metrics.map((metric) => (
            <article key={metric.label}>
              <b>{metric.value}</b>
              <span>{metric.label}</span>
              <em>{metric.hint}</em>
            </article>
          ))}
        </section>
      )}

      <section className="admin-module-card">
        <h2>Рабочие действия</h2>
        <div className="admin-module-actions-grid">
          {actions.map((action) => (
            <Link key={action.href + action.label} href={action.href} target={action.external ? '_blank' : undefined} className={action.primary ? 'is-primary' : ''}>
              <span>{action.label}</span>
              <small>{action.external ? 'открывается в новой вкладке' : action.href}</small>
            </Link>
          ))}
        </div>
      </section>

      {!!checklist.length && (
        <section className="admin-module-card">
          <h2>Что проверить</h2>
          <div className="admin-module-checklist">
            {checklist.map((item) => (
              <p key={item}><CheckCircle2 size={17} />{item}</p>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
