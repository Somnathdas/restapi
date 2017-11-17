module.exports = {
    
    port: process.env.PORT || '3037',
    SITE_BASE_URL: 'http://localhost:3037',
    IMAGE_BASE_DIR: 'http://localhost:3037/public/images/',
    dbAccess: 'local',
    database:{
        'server':{
            username: "",
            password: "",   // %40 => '@'
            authDb: "admin",
            port: 27017,
            host: "localhost",
            dbName: ""
        },
        'local': {
            port: 27017,
            host: "localhost",
            dbName: "testrestapi"
        }        
    },
    status: {
        OK: 200,
        CREATED: 201,
        FOUND: 302,
        BAD_REQUEST: 400,
        NOT_AUTHORIZED: 401,
        PAYMENT_REQUERED: 402,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        CONFLICT: 409,
        SERVER_ERROR: 500,
        NO_SERVICE: 503
    },
    secret : 'Afv2iPlj0riaT1@soB6rtha-ipEn0iluG9maeI-Tn2Tn9eRe',
    push:{
        
        FCM: {
            requestUrl: '',
            apiKeyLegacy: '',
            apiKey: ''
        }        
    },
   
};