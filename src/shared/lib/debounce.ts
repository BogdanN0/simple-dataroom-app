type Debounced<TArgs extends unknown[]> = ((...args: TArgs) => void) & {
  cancel: () => void;
};

export function debounce<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay = 300,
): Debounced<TArgs> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const debounced = (...args: TArgs) => {
    if (timeoutId) window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), delay);
  };
  debounced.cancel = () => {
    if (timeoutId) window.clearTimeout(timeoutId);
  };
  return debounced;
}
