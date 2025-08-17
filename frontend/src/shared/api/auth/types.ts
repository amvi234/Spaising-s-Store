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
    otp_secret: string;
    otp: string;
    message: string;
}

export type RegisterPayload = {
    username: string;
    email: string;
    password: string;
}
