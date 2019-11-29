export interface IFormUser {
    firstname: string;
    lastname: string;
    username: string;
    dateOfBirth: Date;
    email: string;
    password: string;
    confirmPassword?: string;
}

export interface IDatabaseUser {
    firstname: string;
    lastname: string;
    username: string;
    dateOfBirth: Date;
    email: string;
    password: string;
    confirmPassword?: string;
    isEmailConfirmed: boolean;
}