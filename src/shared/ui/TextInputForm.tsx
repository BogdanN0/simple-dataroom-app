import type { FormEventHandler } from "react";

type TextInputFormProps = {
  buttonLabel?: string;
  disabled?: boolean;
  error?: string;
  id: string;
  label: string;
  loadingLabel?: string;
  onChange: (value: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  placeholder: string;
  value: string;
};

export function TextInputForm({
  buttonLabel,
  disabled = false,
  error,
  id,
  label,
  loadingLabel,
  onChange,
  onSubmit,
  placeholder,
  value,
}: TextInputFormProps) {
  return (
    <form className="w-full sm:w-auto" onSubmit={onSubmit}>
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <div className="flex rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-indigo-500">
        <input
          autoComplete="off"
          className="min-w-0 flex-1 rounded-lg px-3 py-2 text-sm outline-none placeholder:text-slate-400 sm:w-52"
          id={id}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
        {buttonLabel && (
          <button
            className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            disabled={disabled}
            type="submit"
          >
            {disabled && loadingLabel ? loadingLabel : buttonLabel}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm font-medium text-rose-700">{error}</p>
      )}
    </form>
  );
}
