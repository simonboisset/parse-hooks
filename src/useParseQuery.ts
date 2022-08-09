import useNormalize, { NormallizeMethods } from '@onehook/normalize';
import { useEffect, useRef, useState } from 'react';

const useParseQuery = <T extends Parse.Object<Parse.Attributes>, E extends { id: string }>({
  query,
  enableLiveQuery,
  onUpdate,
  onDelete,
  onOpen,
}: {
  query?: Parse.Query<T>;
  enableLiveQuery?: boolean;
  onOpen?: (methods: NormallizeMethods<E>) => void;
  onUpdate?: (entity: T, methods: NormallizeMethods<E>) => void;
  onDelete?: (entity: T, methods: NormallizeMethods<E>) => void;
}) => {
  const [loading, setLoading] = useState(true);
  const [values, { initialize, set, remove, update, setMany, get }] = useNormalize<E>();

  const queryString = !!query
    ? JSON.stringify({
        className: query.className,
        query: query.toJSON(),
      })
    : undefined;

  const initializeRef = useRef(initialize);
  initializeRef.current = initialize;
  const setRef = useRef(set);
  setRef.current = set;
  const removeRef = useRef(remove);
  removeRef.current = remove;
  const updateRef = useRef(update);
  updateRef.current = update;
  const setManyRef = useRef(setMany);
  setManyRef.current = setMany;
  const getRef = useRef(get);
  getRef.current = get;

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    const subscribe = async () => {
      if (!!queryString) {
        const queryJSON = JSON.parse(queryString);
        const memoizedQuery = Parse.Query.fromJSON(queryJSON.className, queryJSON.query) as Parse.Query<T>;
        const include = queryJSON.query.include?.split(',');
        const firstFetch = onOpen
          ? () =>
              onOpen({
                initialize: initializeRef.current,
                remove: removeRef.current,
                update: updateRef.current,
                set: setRef.current,
                setMany: setManyRef.current,
              } as NormallizeMethods<E>)
          : async () => {
              const fetchedEntities: any = await memoizedQuery.findAll();
              initializeRef.current(fetchedEntities);
              setLoading(false);
            };
        setLoading(true);
        if (enableLiveQuery) {
          const liveQuerySubscription = await memoizedQuery.subscribe();
          const handleUpdate: (entity: any) => void = onUpdate
            ? (entity) =>
                onUpdate(entity, {
                  initialize: initializeRef.current,
                  remove: removeRef.current,
                  update: updateRef.current,
                  set: setRef.current,
                  setMany: setManyRef.current,
                  get: getRef.current,
                } as NormallizeMethods<E>)
            : async (entity: any) => {
                await entity.fetchWithInclude(include || []);
                setRef.current(entity);
              };

          const handleDelete: (entity: any) => void = onDelete
            ? (entity) =>
                onDelete(entity, {
                  initialize: initializeRef.current,
                  remove: removeRef.current,
                  update: updateRef.current,
                  set: setRef.current,
                  setMany: setManyRef.current,
                  get: getRef.current,
                } as NormallizeMethods<E>)
            : (entity: any) => {
                removeRef.current(entity.id);
              };

          liveQuerySubscription.on('open', firstFetch);
          liveQuerySubscription.on('enter', handleUpdate);
          liveQuerySubscription.on('create', handleUpdate);
          liveQuerySubscription.on('update', handleUpdate);
          liveQuerySubscription.on('leave', handleDelete);
          liveQuerySubscription.on('delete', handleDelete);

          unsubscribe = liveQuerySubscription.unsubscribe;
        } else {
          firstFetch();
        }
      }
    };

    subscribe();

    return unsubscribe;
  }, [queryString, enableLiveQuery]);

  return [values, { update, loading }] as const;
};

export default useParseQuery;
