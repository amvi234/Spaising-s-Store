export type VerifyOtpPayload = {
    username: string;
    otp: string;
}

export type VerifyOtpResponse = {
    name: string;
    access: string;
    refresh: string;
}

export type LoginPayload = {
    username: string;
    password: string;
}

export type LoginResponse = {
    name: string;
    access: string;
    refresh: string;
}

export type RegisterPayload = {
    username: string;
    email: string;
    is_admin: boolean,
    admin_key: string,
    password: string;
}
