import { useState } from "react";

/** Steps forward/backward through a list of stat options. */
export function useSwappableStat<T>(options: T[]) {
  const [index, setIndex] = useState(0);

  const next = () => {
    if (options.length > 0) setIndex((i) => (i + 1) % options.length);
  };

  const prev = () => {
    if (options.length > 0) setIndex((i) => (i - 1 + options.length) % options.length);
  };

  const current = options.length > 0 ? options[index % options.length] : undefined;

  return { current, next, prev, index, count: options.length };
}
