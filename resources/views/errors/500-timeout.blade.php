<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Server Timeout</title>
    <link href="https://fonts.googleapis.com/css?family=Nunito:200,600" rel="stylesheet">
    <style>
        html, body {
            background-color: #fff;
            color: #636b6f;
            font-family: 'Nunito', sans-serif;
            font-weight: 100;
            height: 100vh;
            margin: 0;
        }
        .full-height {
            height: 100vh;
        }
        .flex-center {
            align-items: center;
            display: flex;
            justify-content: center;
        }
        .position-ref {
            position: relative;
        }
        .content {
            text-align: center;
        }
        .title {
            font-size: 36px;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="flex-center position-ref full-height">
        <div class="content">
            <div class="title">
                500 - Server is taking too long to respond.
            </div>
            <p>We're sorry, but the server is currently unable to process your request in a timely manner.</p>
            <p>This might be due to a temporary overload or a complex operation taking longer than expected.</p>
            <p>Please try again in a few moments. If the problem persists, please contact support.</p>
            <a href="{{ url('/') }}">Go to Homepage</a>
        </div>
    </div>
</body>
</html>
