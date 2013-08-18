<?
session_start();
if (!$_SESSION["auth"]) {
    require("login.html");
    die();
}
?><!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <title>DoX &ndash; Task management, your way.</title>
        <meta name="title" content="DoX"/>
        <meta name="description" content="Task management, your way."/>
        <meta name="author" content="Ollie Terrance"/>
        <link rel="icon" type="image/png" href="res/check.png"/>
        <link rel="shortcut icon" type="image/png" href="res/check.png"/>
        <link type="text/css" rel="stylesheet" href="http://fonts.googleapis.com/css?family=Open+Sans|Noto+Serif|Oxygen+Mono"/>
        <link type="text/css" rel="stylesheet" href="res/bootstrap.min.css"/>
        <link type="text/css" rel="stylesheet" href="res/style.css"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <script type="text/javascript" src="res/jquery-1.10.2.min.js"></script>
        <script type="text/javascript" src="res/bootstrap.min.js"></script>
    </head>
    <body>
        <div class="navbar navbar-fixed-top">
            <div class="container">
                <div class="navbar-header">
                    <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <a class="navbar-brand" href="#">DoX</a>
                </div>
                <div class="navbar-collapse collapse">
                    <ul class="nav navbar-nav">
                        <li class="active"><a href="#">Tasks</a></li>
                        <li><a href="#">Done</a></li>
                    </ul>
                    <ul class="nav navbar-nav navbar-right">
                        <li class="dropdown">
                            <a href="#" class="dropdown-toggle" data-toggle="dropdown"><? print($_SESSION["auth"]["email"]); ?> <b class="caret"></b></a>
                            <ul class="dropdown-menu">
                                <li><a href="#">Settings</a></li>
                                <li><a href="#">Logout</a></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </body>
</html>