
const FUSIONAUTH_API_KEY = process.env.FUSIONAUTH_API_KEY;
const FUSIONAUTH_URL = process.env.FUSIONAUTH_URL;

// :snippet-start: loadGrantsMW
async function loadGrants(req, res, next) {
    if (req.isAuthenticated()) {
        const grantsResponse = await fetch(`${FUSIONAUTH_URL}/api/entity/grant/search?userId=${req.user.user.id}`, {
            headers: {
                'Authorization': FUSIONAUTH_API_KEY
            }
        });
        const grants = await grantsResponse.json();
        req.user.grants = grants.grants;
    }
    next();
};
// :snippet-end:

module.exports = loadGrants;