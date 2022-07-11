import { debounce } from 'debounce';
import { useMemo, useEffect, useRef } from 'react';

export default function useDebounce(cb: any, delay: any) {
  const immediate = false;
  const inputsRef = useRef(cb);
  const isMounted = useIsMounted();
  useEffect(() => {
    inputsRef.current = { cb, delay };
  });

  return useMemo(() =>
    debounce(
      (...args: any) => {
        // Don't execute callback, if (1) component in the meanwhile 
        // has been unmounted or (2) delay has changed
        if (inputsRef.current.delay === delay && isMounted())
          inputsRef.current.cb(...args);
      },
      delay,
      immediate
    ),
    [delay, immediate, isMounted]
  );
}

function useIsMounted() {
  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  return () => isMountedRef.current;
}