// Request interfaces
export interface AuthParams {
    username: string;
    password: string;
}

export interface GetUserParams {
    userId: string | number;
}

export interface CreateUserParams {
    user: Partial<User>;
}

export interface UpdateUserParams {
    id: string | number;
    user: Partial<User>;
}

export interface DeleteUserParams {
    userId: string | number;
}

export interface SendPasswordResetParams {
    email: string;
}

export interface ChangePasswordParams {
    email: string;
    token: string;
    password: string;
}

// Response interfaces
export interface User {
    id: number;
    email: string;
    name: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

// Service interface
export interface UserApi {
    authenticate(params: AuthParams): Promise<AuthResponse>;
    getMany(): Promise<User[]>;
    getUser(params: GetUserParams): Promise<User>;
    createUser(params: CreateUserParams): Promise<User>;
    update(params: UpdateUserParams): Promise<User>;
    delete(params: DeleteUserParams): Promise<void>;
    sendPasswordReset(params: SendPasswordResetParams): Promise<void>;
    changePassword(params: ChangePasswordParams): Promise<void>;
}
