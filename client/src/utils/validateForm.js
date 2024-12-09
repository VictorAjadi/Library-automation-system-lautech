export function validateUsername(username) {
    if (!username) {
        return {
            status: "error",
            message: "Username is required"
        };
    }
    
    const minLength = 4;
    const maxLength = 20;
    const validPattern = /^[a-zA-Z0-9_]+$/; // allows letters, numbers, and underscores

    if (username.length < minLength) {
        return {
            status: "error",
            message: `Username must be at least ${minLength} characters`
        };
    }
    
    if (username.length > maxLength) {
        return {
            status: "error",
            message: `Username must be less than ${maxLength} characters`
        };
    }
    
    if (!validPattern.test(username)) {
        return {
            status: "error",
            message: "Username can only contain letters, numbers, and underscores"
        };
    }

    return {
        status: "success",
        message: "Username is valid"
    };
}
