# Parse server hooks

React hooks for [parse-server](https://parseplatform.org/)

## Installation

```bash
yarn add parse-server-hooks
```

## Hooks

### useParseQuery

This hook return data of a `ParseQuery` and can enable `liveQuery` and rerender on each event.

```ts
const query = new Api.Query(MyClass);

// In react component
const [data, { loading }] = useParseQuery({
  query,
  // Optionnal
  enableLiveQuery: true,
  onOpen,
  onUpdate,
  onDelete,
});

// Optionnal :
const mapData = (element: MyClass): MyFrontData => ({
  id: element.id,
  name: element.name,
});

const onOpen = ({ initialize }) => {
  const data = await query.findAll();
  initialize(data.map(mapData));
};

const onUpdate = (element: MyClass, { set }) => {
  set(mapData(element));
};

const onDelete = (element: MyClass, { remove }) => {
  remove(element.id);
};
```

You can use `onOpen`, `onUpdate` and `onDelete` to customize your data mapping on each events.
