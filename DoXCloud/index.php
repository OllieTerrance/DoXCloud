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
        <script type="text/javascript">
        function tabSwitch(tab) {
            $("#tabs li").map(function(index, item) {
                if (item.id.substr(3) === tab) {
                    $(item).addClass("active");
                } else {
                    $(item).removeClass("active");
                }
            });
        }
        function modalLogout() {
            $("#modalLogoutControls button").prop("disabled", true);
            $.ajax({
                url: "auth.php",
                dataType: "json",
                method: "GET",
                data: {
                    submit: "logout"
                },
                success: function(resp, status, obj) {
                    $(location).attr("href", ".");
                },
                error: function(obj, status, err) {
                    $("#modalLogoutControls button").prop("disabled", false);
                }
            });
        }
        </script>
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
                    <ul class="nav navbar-nav">
                        <li>
                            <a href="#tasks" class="navbar-brand" onclick="tabSwitch('Tasks');">DoX</a>
                        </li>
                    </ul>
                </div>
                <div class="navbar-collapse collapse">
                    <ul id="tabs" class="nav navbar-nav">
                        <li id="tabTasks" class="active">
                            <a href="#tasks" onclick="tabSwitch('Tasks');">Tasks</a>
                        </li>
                        <li id="tabDone">
                            <a href="#done" onclick="tabSwitch('Done');">Done</a>
                        </li>
                    </ul>
                    <ul class="nav navbar-nav navbar-right">
                        <li class="dropdown">
                            <a href="#" class="dropdown-toggle" data-toggle="dropdown">Account <b class="caret"></b></a>
                            <ul class="dropdown-menu">
                                <li class="dropdown-header">Logged in as:<br/><? print($_SESSION["auth"]["email"]); ?></li>
                                <li>
                                    <a data-toggle="modal" data-target="#modalSettings" href="#settings">Settings</a>
                                </li>
                                <li>
                                    <a data-toggle="modal" data-target="#modalLogout" href="#logout">Logout</a>
                                </li>
                                <li class="divider"></li>
                                <li class="dropdown-header">About DoX and DoXCloud</li>
                                <li>
                                    <a href="https://github.com/OllieTerrance/DoX">Watch DoX on GitHub</a>
                                </li>
                                <li>
                                    <a href="https://github.com/OllieTerrance">@OllieTerrance on GitHub</a>
                                </li>
                                <li>
                                    <a href="https://twitter.com/OllieTerrance">@OllieTerrance on Twitter</a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div id="modalSettings" class="modal fade">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h4 class="modal-title">Settings</h4>
                    </div>
                    <div class="modal-body">
                        <p>Some settings go here.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" onclick="modalSettings();">Save Changes</button>
                        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
        <div id="modalLogout" class="modal fade">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h4 class="modal-title">Logout</h4>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to logout?</p>
                    </div>
                    <div id="modalLogoutControls" class="modal-footer">
                        <button type="button" class="btn btn-primary" onclick="modalLogout();">Logout</button>
                        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>