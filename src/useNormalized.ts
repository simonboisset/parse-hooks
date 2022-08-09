import { useState } from 'react';

export type NormalizedData<T extends { id: string }> = Record<string, T>;
export type PartialNormalizedEntity<T extends { id: string }> = Partial<T> & { id: string };

const removeEntity = <T extends { id: string }>(entities: NormalizedData<T>, id: string) => {
  const nextEntities = { ...entities };
  delete nextEntities[id];
  return nextEntities;
};

const useNormalized = <T extends { id: string }>() => {
  const [entities, setEntities] = useState<NormalizedData<T>>({});

  const initialize = (entitiesToUpsert: T[]) => {
    let normalizedEntities: NormalizedData<T> = {};

    entitiesToUpsert.forEach((entity) => {
      normalizedEntities[entity.id] = entity;
    });
    setEntities(normalizedEntities);
  };

  const setMany = (entitiesToUpsert: T[]) => {
    let normalizedEntities: NormalizedData<T> = {};

    entitiesToUpsert.forEach((entity) => {
      normalizedEntities[entity.id] = entity;
    });
    setEntities((prevEntities) => ({ ...prevEntities, ...normalizedEntities }));
  };

  const set = (entity: T) => {
    setEntities((prevEntities) => ({ ...prevEntities, [entity.id]: entity }));
  };

  const update = (entity: PartialNormalizedEntity<T>) => {
    setEntities((prevEntities) => ({ ...prevEntities, [entity.id]: { ...prevEntities[entity.id], ...entity } }));
  };

  const remove = (id: string) => setEntities((prevEntities) => removeEntity(prevEntities, id));

  return [entities, { set, remove, setMany, initialize, update }] as [NormalizedData<T>, NormallizedMethods<T>];
};

export default useNormalized;

export type NormalizedSet<T> = (entity: T) => void;
export type NormalizedRemove = (id: string) => void;
export type NormalizedInitialize<T> = (entities: T[]) => void;
export type NormalizedSetMany<T> = (entities: T[]) => void;
export type NormallizedUpdate<T extends { id: string }> = (entity: PartialNormalizedEntity<T>) => void;
export type NormallizedMethods<T extends { id: string }> = {
  set: NormalizedSet<T>;
  remove: NormalizedRemove;
  setMany: NormalizedSetMany<T>;
  initialize: NormalizedInitialize<T>;
  update: NormallizedUpdate<T>;
};
