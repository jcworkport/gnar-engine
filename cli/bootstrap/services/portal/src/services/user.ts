import client from '../client.js';
import {
    UserApi,
    AuthParams,
    AuthResponse,
    User,
    GetUserParams,
    CreateUserParams,
    UpdateUserParams,
    DeleteUserParams,
    SendPasswordResetParams,
    ChangePasswordParams
} from './types/user';

export const user: UserApi = {
    authenticate: async ({ username, password }: AuthParams): Promise<AuthResponse> => {
        const { data } = await client.post<AuthResponse>('/authenticate/', { username, password });
        return data;
    },

    getMany: async (): Promise<User[]> => {
        const { data } = await client.get<User[]>('/users/');
        return data;
    },

    getUser: async ({ userId }: GetUserParams): Promise<User> => {
        const { data } = await client.get<User>(`/users/${userId}`);
        return data;
    },

    createUser: async ({ user }: CreateUserParams): Promise<User> => {
        const { data } = await client.post<User>('/users/', { user });
        return data;
    },

    update: async ({ id, user }: UpdateUserParams): Promise<User> => {
        const { data } = await client.post<User>(`/users/${id}`, { user });
        return data;
    },

    delete: async ({ userId }: DeleteUserParams): Promise<void> => {
        await client.delete(`/users/${userId}`);
    },

    sendPasswordReset: async ({ email }: SendPasswordResetParams): Promise<void> => {
        await client.post('/users/request-password-reset', { email });
    },

    changePassword: async ({ email, token, password }: ChangePasswordParams): Promise<void> => {
        await client.post('/users/change-password', { email, token, password });
    },
};
