"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeDataGenerator = void 0;
/**
 * Fake Data Generator
 *
 * Generates realistic fake data for testing forms:
 * - Names, emails, passwords
 * - Addresses, phone numbers
 * - Dates, numbers
 */
class FakeDataGenerator {
    static firstNames = [
        'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'James', 'Emily',
        'Robert', 'Lisa', 'William', 'Mary', 'Thomas', 'Patricia', 'Daniel', 'Jennifer'
    ];
    static lastNames = [
        'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
        'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'
    ];
    static emailDomains = [
        'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'test.com'
    ];
    /**
     * Generate random first name
     */
    static firstName() {
        return this.randomItem(this.firstNames);
    }
    /**
     * Generate random last name
     */
    static lastName() {
        return this.randomItem(this.lastNames);
    }
    /**
     * Generate full name
     */
    static fullName() {
        return `${this.firstName()} ${this.lastName()}`;
    }
    /**
     * Generate random email
     */
    static email() {
        const first = this.firstName().toLowerCase();
        const last = this.lastName().toLowerCase();
        const number = Math.floor(Math.random() * 1000);
        const domain = this.randomItem(this.emailDomains);
        return `${first}.${last}${number}@${domain}`;
    }
    /**
     * Generate random username
     */
    static username() {
        const first = this.firstName().toLowerCase();
        const number = Math.floor(Math.random() * 10000);
        return `${first}${number}`;
    }
    /**
     * Generate random password
     */
    static password(length = 12) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        // Ensure at least one of each: uppercase, lowercase, number, special
        password += 'A' + String.fromCharCode(65 + Math.floor(Math.random() * 26));
        password += 'a' + String.fromCharCode(97 + Math.floor(Math.random() * 26));
        password += Math.floor(Math.random() * 10).toString();
        password += '!@#$%'[Math.floor(Math.random() * 5)];
        // Fill the rest
        for (let i = password.length; i < length; i++) {
            password += chars[Math.floor(Math.random() * chars.length)];
        }
        // Shuffle
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }
    /**
     * Generate phone number
     */
    static phoneNumber() {
        const area = Math.floor(Math.random() * 900) + 100;
        const prefix = Math.floor(Math.random() * 900) + 100;
        const line = Math.floor(Math.random() * 9000) + 1000;
        return `(${area}) ${prefix}-${line}`;
    }
    /**
     * Generate address
     */
    static address() {
        const number = Math.floor(Math.random() * 9999) + 1;
        const streets = ['Main St', 'Oak Ave', 'Park Rd', 'Elm St', 'Pine Rd', 'Maple Dr'];
        return `${number} ${this.randomItem(streets)}`;
    }
    /**
     * Generate city
     */
    static city() {
        const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia'];
        return this.randomItem(cities);
    }
    /**
     * Generate zipcode
     */
    static zipcode() {
        return Math.floor(Math.random() * 90000 + 10000).toString();
    }
    /**
     * Generate date (YYYY-MM-DD)
     */
    static date(minAge = 18, maxAge = 80) {
        const today = new Date();
        const year = today.getFullYear() - minAge - Math.floor(Math.random() * (maxAge - minAge));
        const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    /**
     * Generate company name
     */
    static company() {
        const adjectives = ['Global', 'Digital', 'Smart', 'Tech', 'Innovative'];
        const nouns = ['Solutions', 'Systems', 'Technologies', 'Services', 'Corp'];
        return `${this.randomItem(adjectives)} ${this.randomItem(nouns)}`;
    }
    /**
     * Auto-detect field type from name/id/placeholder and generate appropriate data
     */
    static autoFill(fieldName, placeholder, type) {
        const lowerName = fieldName.toLowerCase();
        const lowerPlaceholder = (placeholder || '').toLowerCase();
        const combined = `${lowerName} ${lowerPlaceholder}`;
        // Email
        if (combined.includes('email') || combined.includes('e-mail')) {
            return this.email();
        }
        // Password
        if (combined.includes('password') || combined.includes('pwd') || type === 'password') {
            return this.password();
        }
        // Username
        if (combined.includes('username') || combined.includes('user name')) {
            return this.username();
        }
        // First name
        if (combined.includes('first') && combined.includes('name')) {
            return this.firstName();
        }
        // Last name
        if (combined.includes('last') && combined.includes('name')) {
            return this.lastName();
        }
        // Full name
        if (combined.includes('name') || combined.includes('nama')) {
            return this.fullName();
        }
        // Phone
        if (combined.includes('phone') || combined.includes('mobile') || combined.includes('telp')) {
            return this.phoneNumber();
        }
        // Address
        if (combined.includes('address') || combined.includes('alamat') || combined.includes('street')) {
            return this.address();
        }
        // City
        if (combined.includes('city') || combined.includes('kota')) {
            return this.city();
        }
        // Zipcode
        if (combined.includes('zip') || combined.includes('postal')) {
            return this.zipcode();
        }
        // Date / Birthday
        if (combined.includes('date') || combined.includes('birth') || combined.includes('dob') || type === 'date') {
            return this.date();
        }
        // Company
        if (combined.includes('company') || combined.includes('organization') || combined.includes('perusahaan')) {
            return this.company();
        }
        // Age / Number
        if (combined.includes('age') || combined.includes('umur') || type === 'number') {
            return String(Math.floor(Math.random() * 60) + 18);
        }
        // Default: random text
        return `Test ${Math.floor(Math.random() * 10000)}`;
    }
    /**
     * Helper: get random item from array
     */
    static randomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    /**
     * Generate complete registration data
     */
    static generateRegistrationData() {
        const firstName = this.firstName();
        const lastName = this.lastName();
        const email = this.email();
        const password = this.password();
        return {
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
            email,
            username: this.username(),
            password,
            confirmPassword: password,
            phone: this.phoneNumber(),
            address: this.address(),
            city: this.city(),
            zipcode: this.zipcode(),
            dateOfBirth: this.date(),
            company: this.company(),
        };
    }
}
exports.FakeDataGenerator = FakeDataGenerator;
//# sourceMappingURL=FakeDataGenerator.js.map