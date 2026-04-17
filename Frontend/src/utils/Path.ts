const app_name = 'cop4331-21.xyz'; // Your DigitalOcean IP

export const buildPath = (route: string) : string => {
    // If we are running locally, use localhost. If not, use the Droplet.
    if (process.env.NODE_ENV === 'production') {
        return `http://${app_name}:5555/${route}`;
    } else {
        return `http://localhost:5555/${route}`; 
    }
};
