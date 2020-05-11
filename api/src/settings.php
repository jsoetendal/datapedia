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
            'host' => "localhost",
            'user' => "nodes",
            'pass' => "nodes",
            'dbname' => "nodes"
        ],

        'media' => [
            'path' => getenv('CONFIG_UPLOAD_PATH'),
            'www' => getenv('CONFIG_UPLOAD_URL')
        ],
    ],
];
