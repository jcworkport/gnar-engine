import { commands, logger, test } from '@gnar-engine/core';

// Preparation before tests run
test.prep(async () => {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('Do not run tests in production mode!');
    }
})

// Test create user command
test.run('Create user command', async () => {
    const users = await commands.execute('createUsers', { users: [
        {
            email: 'test@gnar.co.uk',
            password: 'p4ssw0rd987'
        }
    ]});
    test.assert(users.length === 1, 'User was not created successfully');
    test.assert(users[0].email === 'test@gnar.co.uk', 'User email does not match');
});

// Test create user with random password command
test.run('Create user with random password command', async () => {
    const users = await commands.execute('createUserWithRandomPassword', { users: [
        {
            email: 'test2@gnar.co.uk'
        }
    ]});
    test.assert(users.length === 1, 'User was not created successfully');
    test.assert(users[0].email === 'test2@gnar.co.uk', 'User email does not match');
});
