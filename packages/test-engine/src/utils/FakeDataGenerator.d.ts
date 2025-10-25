/**
 * Fake Data Generator
 *
 * Generates realistic fake data for testing forms:
 * - Names, emails, passwords
 * - Addresses, phone numbers
 * - Dates, numbers
 */
export declare class FakeDataGenerator {
    private static firstNames;
    private static lastNames;
    private static emailDomains;
    /**
     * Generate random first name
     */
    static firstName(): string;
    /**
     * Generate random last name
     */
    static lastName(): string;
    /**
     * Generate full name
     */
    static fullName(): string;
    /**
     * Generate random email
     */
    static email(): string;
    /**
     * Generate random username
     */
    static username(): string;
    /**
     * Generate random password
     */
    static password(length?: number): string;
    /**
     * Generate phone number
     */
    static phoneNumber(): string;
    /**
     * Generate address
     */
    static address(): string;
    /**
     * Generate city
     */
    static city(): string;
    /**
     * Generate zipcode
     */
    static zipcode(): string;
    /**
     * Generate date (YYYY-MM-DD)
     */
    static date(minAge?: number, maxAge?: number): string;
    /**
     * Generate company name
     */
    static company(): string;
    /**
     * Auto-detect field type from name/id/placeholder and generate appropriate data
     */
    static autoFill(fieldName: string, placeholder?: string, type?: string): string;
    /**
     * Helper: get random item from array
     */
    private static randomItem;
    /**
     * Generate complete registration data
     */
    static generateRegistrationData(): RegistrationData;
}
export interface RegistrationData {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    phone: string;
    address: string;
    city: string;
    zipcode: string;
    dateOfBirth: string;
    company: string;
}
//# sourceMappingURL=FakeDataGenerator.d.ts.map