const dummyAuthMiddleware = (req, res, next) => {
    req.user = {
        uid: 'random-user-id',
        role: 'Student', 
        UserID:1,
        Name: "Daniel Tunyinko",
        Email: "daniel.tunyinko@ashesi.edu.gh"
    };
    console.log('Dummy auth middleware passed!');
    next();
};

module.exports = dummyAuthMiddleware;
