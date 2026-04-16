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

Merges decorator data onto each item in a data array. Each decorated field is written as a camelCase prefixed key (e.g. field `name` with prefix `property` → `propertyName`).

### Signature

```javascript
result.data = await utils.decorators.decorateEntityData({
    data,
    decoratorData,
    decoratorFields,
    decoratorPrefix,
    lookupKey,  // optional
});
```

> **Note:** The function returns a new array — it does not mutate in place. You must assign the return value back to your data reference.

### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `data` | `Array` | ✅ | The array of records to decorate (e.g. journal entries) |
| `decoratorData` | `Object` | ✅ | The indexed entity data returned by `extractEntityData` |
| `decoratorFields` | `Array<String>` | ✅ | Fields to merge onto each record (e.g. `['name', 'address']`) |
| `decoratorPrefix` | `String` | ✅ | Prefix applied to each merged field (e.g. `'property'` → `propertyName`) |
| `lookupKey` | `String` | — | The key on each `data` item used to look up its entry in `decoratorData`. Defaults to `${decoratorPrefix}Id` |

### Returns

```typescript
Array<Record>
```

A new array where each item has the decorator fields merged in under their prefixed names. Items with no matching id in `decoratorData` are returned unchanged.

If a matched field value is falsy, it is written as `null`.

### Behaviour Notes

- Each field `f` is written as `${decoratorPrefix}${f[0].toUpperCase()}${f.slice(1)}` (standard camelCase prefix).
- Items without a matching id in `decoratorData` pass through unmodified.
- The original `data` array is **not mutated** — a new array is returned.

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
    // prefix: 'property'  →  sends { propertyIds } to the command
});

// Step 2 — merge property fields onto each journal entry
result.data = await utils.decorators.decorateEntityData({
    data: result.data,
    decoratorData: propertyData,
    decoratorFields: ['name', 'address'],
    decoratorPrefix: 'property',
    // lookupKey defaults to 'propertyId'
});

// result.data[n] now contains:
// {
//   ...originalFields,
//   propertyName: 'Sunset Apartments',
//   propertyAddress: '123 Main St',
// }
```

---

## Full Example — Child holds the parent id
Use this pattern when the entity you are decorating does not hold the foreign key — instead, the decorator entity stores a reference back to the parent.
A common example is a leaseholder table that stores a userId foreign key. The user record has no direct leaseholderId, so a standard lookup won't work.
The solution is two steps:

In extractEntityData, set idField to the parent id field on the child entity (e.g. userId). This re-keys decoratorData by the parent id instead of the child's own id.
In decorateEntityData, set lookupKey: 'id' so each item matches on its own id against those re-keyed entries.

```js
import { utils } from '@gnar-engine/core';

// Step 1 — fetch leaseholders, but key the result by userId (the parent id)
//
// Without idField: 'userId', decoratorData would be keyed by the leaseholder's
// own id and would never match against user records.
const leaseholderData = await utils.decorators.extractEntityData({
    commandsHandler: commands,
    command: 'leaseholderService.getManyLeaseholders',
    ids: userIds,
    prefix: 'user',        // sends { userIds } to the command
    fields: ['name', 'addressLine1', 'addressLine2', 'town', 'county', 'postcode'],
    idField: 'userId',     // re-key result by userId, not leaseholder id
});

// leaseholderData is now keyed by userId:
// {
//   "e817163f-...": { name: 'Mr Naseef Kaliisa', addressLine1: '2 Minster Court', ... },
// }

// Step 2 — match each user by their own id against the re-keyed decorator data
usersData.data = await utils.decorators.decorateEntityData({
    data: usersData.data,
    decoratorData: leaseholderData,
    decoratorFields: ['name', 'addressLine1', 'addressLine2', 'town', 'county', 'postcode'],
    decoratorPrefix: 'user',
    lookupKey: 'id',       // item.id matches the userId keys in decoratorData
});

// usersData.data[n] now contains:
// {
//   ...originalUserFields,
//   userName: 'Mr Naseef Kaliisa',
//   userAddressLine1: '2 Minster Court',
//   userTown: 'Leicester',
//   ...
// }
```
---

## Field Naming Reference

Given `decoratorPrefix: 'property'` and `decoratorFields: ['name', 'address']`:

| Original field | Decorated key on item |
|---|---|
| `name` | `propertyName` |
| `address` | `propertyAddress` |

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
    idField: 'unitId',   // index by entity.unitId instead of entity.id
});
```

### Custom lookup key

Use `lookupKey` when the foreign key on your data items does not follow the `${prefix}Id` convention:

```javascript
result.data = await utils.decorators.decorateEntityData({
    data: result.data,
    decoratorData: tenantData,
    decoratorFields: ['fullName', 'email'],
    decoratorPrefix: 'tenant',
    lookupKey: 'occupantId',   // item.occupantId instead of item.tenantId
});
```