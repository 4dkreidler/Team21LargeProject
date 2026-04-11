const app_name = '159.203.105.19'; // Your DigitalOcean IP

export const buildPath = (route: string) : string => {
    // If we are running locally, use localhost. If not, use the Droplet.
    if (process.env.NODE_ENV === 'production') {
        return `http://${app_name}:5000/${route}`;
    } else {
        return `http://localhost:5000/${route}`;
    }
};