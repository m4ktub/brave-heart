function asyncMapFindHelpr<A, R>(
  sequence: A[],
  resolveTo: (result: R) => void,
  mapper: (value: A) => Promise<R>,
  filter: (value: R) => boolean
): void {
  if (sequence.length == 0) {
    resolveTo(null);
  } else {
    const head = sequence[0];
    const rest = sequence.slice(1);

    mapper(head).then(result => {
      if (filter(result)) {
        resolveTo(result);
      } else {
        asyncMapFindHelpr(rest, resolveTo, mapper, filter);
      }
    });
  }
}

export function asyncMapFind<A, R>(
  sequence: A[],
  mapper: (value: A) => Promise<R>,
  filter: (value: R) => boolean
): Promise<R> {
  return new Promise<R>(resolve => {
    asyncMapFindHelpr(sequence, resolve, mapper, filter);
  });
}
