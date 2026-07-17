import { type ReactNode } from "react";
import { Link } from "react-router-dom";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

type ResourceCardProps = {
  actions?: ReactNode;
  createdAt: string;
  description?: string;
  href?: string;
  icon: ReactNode;
  name: string;
  onClick?: () => void;
};

export function ResourceCard({
  actions,
  createdAt,
  description,
  href,
  icon,
  name,
  onClick,
}: ResourceCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_28px_-16px_rgba(15,23,42,0.35)] transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_18px_35px_-20px_rgba(79,70,229,0.42)]">
      {href ? (
        <Link
          aria-label={`Open ${name}`}
          className="absolute inset-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          to={href}
        />
      ) : onClick ? (
        <button
          aria-label={`Open ${name}`}
          className="absolute inset-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          onClick={onClick}
          type="button"
        />
      ) : null}
      <div className="relative pointer-events-none flex items-start justify-between gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>
        <div className="pointer-events-auto flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          {actions}
        </div>
      </div>
      <div className="relative pointer-events-none mt-8">
        <h2 className="truncate text-base font-semibold text-slate-900">
          {name}
        </h2>
        {description ? (
          <p className="mt-1 truncate text-sm text-slate-500">{description}</p>
        ) : null}
        <p className="mt-1 text-sm text-slate-500">
          Created {formatDate(createdAt)}
        </p>
      </div>
    </article>
  );
}
