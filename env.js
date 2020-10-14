(function (window) {
    window.__env = window.__env || {};

    // Either local or production
    window.__env.environment = 'local';

    // Local (example): http://localhost/datapedia/
    // Remote: https://www.datapedia.nl/
    window.__env.wwwBase = 'http://localhost/datapedia/';

    // Local (example): http://localhost/datapedia/api/public/
    // Remote: https://www.datapedia.nl/api/public/
    window.__env.APIBase = 'http://localhost/datapedia/api/public/';
}(this));