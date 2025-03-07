const dummyRoleMiddleware = (roles) => {
    return (req, res, next) => {
        console.log(`🟢 Dummy role middleware: User role is '${req.user.role}', allowed roles: ${roles}`);

        // Just log and pass the request through without actually checking roles
        next();
    };
};

module.exports = dummyRoleMiddleware;
