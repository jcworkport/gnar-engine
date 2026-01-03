import { commands, logger, test } from '@gnar-engine/core';

// Preparation before tests run
test.prep(async () => {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('Do not run tests in production mode!');
    }
})

// Test create user command
test.run('Create User Command', async () => {
    const users = await commands.execute('createUsers', [
        {
            email: 'test@gnar.co.uk'
        }
    ]);

    test.assert(users.length === 1, 'User was not created successfully');
    test.assert(users[0].email === 'test@gnar.co.uk', 'User email does not match');
});


