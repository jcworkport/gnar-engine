# Testing Your Service in Development Mode

To run your tests in development mode, use the following command:
```bash
gnar dev up --core-dev --test-service <serviceName>
```

**Note:** The `--core-dev` flag uses your local core instead of the npm distribution. This means any changes you make to your core will immediately affect your current development process.

## What This Command Does

This command will:

1. Spin up the necessary containers
2. Create a disposable MySQL database (separate from your production database)
3. Automatically discover and run all tests in your **tests** directory

## Hot Reload Feature

Thanks to hot reload functionality, any changes you make to your files will automatically trigger the tests to re-run. This is particularly useful when you're debugging and fixing issues, as you'll get immediate feedback without manually restarting the test suite.