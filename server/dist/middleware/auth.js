import * as Sentry from "@sentry/node";
export const protect = async (req, res, next) => {
    try {
        const { userId } = req.auth;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        next();
    }
    catch (error) {
        Sentry.captureException(error);
        return res.status(500).json({
            message: error.code || error.message || 'Internal Server Error'
        });
    }
};
// whsec_vHlqo1Xs8NyQAvoaRiD8nvWSsLqL+Gae
