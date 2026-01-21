# Creating a New Entity

Creating new entities streamlines the process of adding functionality to your existing service. When you create an entity, the CLI automatically scaffolds all the necessary modules:

- Migration module
- HTTP controller module
- Command module
- Schema module
- Policy module
- Service module

**Note:** While the base structure is generated for you, you'll still need to customize these modules to fit your specific requirements.

## CLI Command
```bash
gnar create entity --in-service <serviceName> <entityName>
```

**Tip:** Use camelCase for entity names.

## Important: Post-Creation Steps

After creating an entity, you must complete two registration steps to integrate it with your application:

### 1. Register HTTP Routes

Add the HTTP controller (located in the `controllers` directory) to the controllers array when calling the `http.registerRoutes` function:
```javascript
// Register HTTP routes
await http.registerRoutes({
    controllers: [
        <httpControllerName>,
        <httpControllerName2>
    ]
});
```

### 2. Import the Command Handler Module

Dynamically import the command handler module in your main application file:
```javascript
await import('./commands/<entityName>.handler.js');
```

---

**That's it!** Your new entity is now fully integrated and ready for customization.