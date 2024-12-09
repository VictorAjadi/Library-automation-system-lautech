exports.secureHelmet={   
    contentSecurityPolicy:{
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", 'http://res.cloudinary.com', 'https://res.cloudinary.com','https://fonts.googleapis.com','https://unpkg.com/boxicons@2.1.4','https://cdnjs.cloudflare.com'],
            imgSrc: ['*','data:', 'blob:'],
            scriptSrc: ["'self'","unsafe-eval"],
            mediaSrc: ["'self'", 'data:', 'blob:',"https://res.cloudinary.com"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
          }
    },
    crossOriginOpenerPolicy: { policy: process.env.NODE_ENV==='developement' ? 'unsafe-none' : 'same-origin' },
    crossOriginResourcePolicy: process.env.NODE_ENV === 'development'
    ? { policy: 'cross-origin' }  // Development: allow cross-origin
    : { policy: 'same-origin' },  // Production: restrict to same-origin
    
    referrerPolicy: { policy: 'no-referrer' },
    hsts: process.env.NODE_ENV === "production" ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    } : undefined,
    noSniff: true,
    dnsPrefetchControl: { allow: false },
    ieNoOpen: true,
    frameguard: { action: 'deny' },
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    hidePoweredBy: true
}