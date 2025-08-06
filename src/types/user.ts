export interface User {
    accountid?: string;
    roleid?: string;
    role?: string;
    displayname?: string;
    username?: string;
    email?: string;
    phonenumber?: string;
    registrationdate?: Date;
    password?: string;
    address?: string;
    dateofbirth?: string;
    preferredlanguage?: string;
    avatar?: string;
    status?: string;
    gender?: string;
    identitycard?: string;
    isactive?: boolean;
    createdat?: Date;
    updatedat?: Date;
}

export interface Member {
    id: string; // MemberID
    accountId: string;
    membershipId?: string;
    points: number;
    tier: string;
    validUntil: string;
    createdAt: string;
    updatedAt: string;
}

export interface Staff {
    id: string;
    accountId: string;
    displayName: string;
    email: string;
    phone: string;
    role: string;
    department: string;
    createdAt: Date;
    updatedAt: Date;
}