export const validateEmail = (email) => {
    if (!email) return true;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const validateRequired = (value, fieldName) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        return `${fieldName} es requerido`;
    }
    return null;
};

export const validateNumber = (value, fieldName, min = null, max = null) => {
    const num = parseFloat(value);
    if (isNaN(num)) {
        return `${fieldName} debe ser un número`;
    }
    if (min !== null && num < min) {
        return `${fieldName} debe ser al menos ${min}`;
    }
    if (max !== null && num > max) {
        return `${fieldName} debe ser como máximo ${max}`;
    }
    return null;
};