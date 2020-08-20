<?php
return [
    'settings' => [
        'displayErrorDetails' => true, // set to false in production

        // Renderer settings
        'renderer' => [
            'template_path' => __DIR__ . '/../templates/',
        ],

        // Monolog settings
        'logger' => [
            'name' => 'slim-app',
            'path' => __DIR__ . '/../logs/app.log',
        ],

        'db' => [
            'host' => getenv('DB_HOST'),
            'user' => getenv('DB_USER'),
            'pass' => getenv('DB_PASS'),
            'dbname' => getenv('DB_DATABASE')
        ],

        'media' => [
            'path' => getenv('CONFIG_UPLOAD_PATH'),
            'www' => getenv('CONFIG_UPLOAD_URL')
        ],
    ],
];
