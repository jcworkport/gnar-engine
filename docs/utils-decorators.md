# `decorators` — GnarEngine Core Utility

The `decorators` utility provides a two-step pattern for **fetching** related entity data and **merging** it onto a list of records. It is exposed via `utils.decorators` from `@gnar-engine/core`.

---

## Overview

| Function | Purpose |
|---|---|
| [`extractEntityData`](#extractentitydata) | Fetch a keyed map of entity data from a service command |
| [`decorateEntityData`](#decorateentitydata) | Merge that data onto an existing array of records |

The two functions are designed to be used together in sequence:

```
extractEntityData  →  decorateEntityData
(fetch + index)        (merge onto data)
```

---

## `extractEntityData`

Executes a service command to fetch a list of entities, then indexes the result by id into a plain object for fast lookup.

### Signature

```javascript
const entityData = await utils.decorators.extractEntityData({
    commandsHandler,
    command,
    ids,
    fields,
    prefix,   // optional
    idField,  // optional
});
```

### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `commandsHandler` | `Object` | ✅ | The command handler instance used to execute the service command |
| `command` | `String` | ✅ | Dot-notation command to execute (e.g. `'propertyService.getManyProperties'`) |
| `ids` | `Array` | ✅ | List of entity ids to fetch |
| `fields` | `Array<String>` | ✅ | Fields to extract from each entity (e.g. `['name', 'address']`) |
| `prefix` | `String` | — | If provided, the ids payload key becomes `${prefix}Ids` instead of `ids` |
| `idField` | `String` | — | Field to use as the index key in the result object. Defaults to `id` |

### Returns

```typescript
Object<id, Record>
```

A plain object mapping each entity's id to an object containing only the requested `fields`.

```javascript
{
    'abc123': { name: 'Sunset Apartments', address: '123 Main St' },
    'def456': { name: 'Lakeside Tower',    address: '456 Lake Ave' },
}
```

Returns an empty object `{}` if `ids` is empty.

### Behaviour Notes

- The command is called with `{ ids }` by default, or `{ ${prefix}Ids }` when `prefix` is set.
- Only fields listed in `fields` are copied — all other entity data is discarded.
- When `idField` is specified, the value of `entity[idField]` is used as the map key instead of `entity.id`.

---

## `decorateEntityData`

Merges decorator data onto each item in a data array as a **nested object** under `propertyName`.

### Signature

```javascript
result.data = await utils.decorators.decorateEntityData({
    data,
    decorateWith,
    includeFields,
    propertyName,
    lookupKey,  // optional
});
```

> **Note:** The function returns a new array — it does not mutate in place. You must assign the return value back to your data reference.

### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `data` | `Array` | ✅ | The array of records to decorate (e.g. journal entries) |
| `decorateWith` | `Object` | ✅ | The indexed entity data returned by `extractEntityData` |
| `includeFields` | `Array<String>` | ✅ | Fields to include in the nested object (e.g. `['name', 'address']`) |
| `propertyName` | `String` | ✅ | The property name under which the nested object will be assigned (e.g. `'property'`) |
| `lookupKey` | `String` | — | The key on each `data` item used to look up its entry in `decorateWith`. Defaults to `${propertyName}Id` |

### Returns

```typescript
Array<Record>
```

A new array where each item has a nested object assigned at `propertyName`.

If no matching id is found, the property is set to `null`.

### Behaviour Notes

- The decorated fields are grouped into a single object:  
  `item[propertyName] = { field1, field2, ... }`
- Items without a matching id in `decorateWith` will have `propertyName: null`.
- The original `data` array is **not mutated** — a new array is returned.
- Missing or falsy values are normalised to `null`.

---

## Full Example

```javascript
import { utils } from '@gnar-engine/core';

// Step 1 — fetch and index the related entity data
const propertyData = await utils.decorators.extractEntityData({
    commandsHandler: commands,
    command: 'propertyService.getManyProperties',
    ids: propertyIds,
    fields: ['name', 'address'],
});

// Step 2 — merge property fields onto each journal entry
result.data = await utils.decorators.decorateEntityData({
    data: result.data,
    decorateWith: propertyData,
    includeFields: ['name', 'address'],
    propertyName: 'property',
});

// result.data[n] now contains:
// {
//   ...originalFields,
//   property: {
//     name: 'Sunset Apartments',
//     address: '123 Main St',
//   }
// }
```

---

## Full Example — Child holds the parent id

Use this pattern when the entity you are decorating does not hold the foreign key — instead, the decorator entity stores a reference back to the parent.

```js
import { utils } from '@gnar-engine/core';

// Step 1 — fetch leaseholders, but key the result by userId
const leaseholderData = await utils.decorators.extractEntityData({
    commandsHandler: commands,
    command: 'leaseholderService.getManyLeaseholders',
    ids: userIds,
    prefix: 'user',
    fields: ['name', 'addressLine1', 'addressLine2', 'town', 'county', 'postcode'],
    idField: 'userId',
});

// Step 2 — match each user by their own id
usersData.data = await utils.decorators.decorateEntityData({
    data: usersData.data,
    decorateWith: leaseholderData,
    includeFields: ['name', 'addressLine1', 'addressLine2', 'town', 'county', 'postcode'],
    propertyName: 'user',
    lookupKey: 'id',
});

// usersData.data[n] now contains:
// {
//   ...originalUserFields,
//   user: {
//     name: 'Mr Naseef Kaliisa',
//     addressLine1: '2 Minster Court',
//     town: 'Leicester',
//     ...
//   }
// }
```

---

## Data Shape Reference

Given:

```javascript
propertyName: 'property'
includeFields: ['name', 'address']
```

### Output structure

```javascript
{
  property: {
    name: string | null,
    address: string | null,
  }
}
```

---

## Common Patterns

### Custom id field

Use `idField` when the entity's primary key is not `id`:

```javascript
const unitData = await utils.decorators.extractEntityData({
    commandsHandler: commands,
    command: 'unitService.getManyUnits',
    ids: unitIds,
    fields: ['unitNumber', 'floor'],
    idField: 'unitId',
});
```

### Custom lookup key

Use `lookupKey` when the foreign key on your data items does not follow the `${propertyName}Id` convention:

```javascript
result.data = await utils.decorators.decorateEntityData({
    data: result.data,
    decorateWith: tenantData,
    includeFields: ['fullName', 'email'],
    propertyName: 'tenant',
    lookupKey: 'occupantId',
});
```