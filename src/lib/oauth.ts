const PRODUCTION_OAUTH_ORIGIN = "https://spark-agile.com";

const allowedOAuthHosts = new Set([
    "spark-agile.com",
    "sparked-agile.lovable.app",
    "localhost",
    "127.0.0.1",
]);

export const getOAuthOrigin = () => {
    const { origin, hostname } = window.location;
    return allowedOAuthHosts.has(hostname) ? origin : PRODUCTION_OAUTH_ORIGIN;
};

export const getOAuthCallbackUrl = (provider: string) => `${getOAuthOrigin()}/oauth/${provider}/callback`;