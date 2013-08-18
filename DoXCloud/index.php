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
        <meta http-equiv="X-UA-Compatible" content="IE=Edge,chrome=1"/>
        <title>DoX &ndash; Task management, your way.</title>
        <meta name="title" content="DoX"/>
        <meta name="description" content="Task management, your way."/>
        <meta name="author" content="Ollie Terrance"/>
        <link rel="icon" type="image/png" href="res/check.png"/>
        <link rel="shortcut icon" type="image/png" href="res/check.png"/>
        <link type="text/css" rel="stylesheet" href="http://fonts.googleapis.com/css?family=Open+Sans|Noto+Serif|Oxygen+Mono"/>
        <link type="text/css" rel="stylesheet" href="res/bootstrap.min.css"/>
        <link type="text/css" rel="stylesheet" href="res/jquery.tagsinput.css"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
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
                        <li class="navbar-brand" title="Task management, your way.">DoX</li>
                    </ul>
                </div>
                <div class="navbar-collapse collapse">
                    <ul id="tabList" class="nav navbar-nav">
                        <li id="tabTasks" class="active">
                            <a href="#tasks">Tasks</a>
                        </li>
                        <li id="tabDone">
                            <a href="#done">Done</a>
                        </li>
                    </ul>
                    <ul class="nav navbar-nav navbar-right">
                        <li>
                            <a data-toggle="modal" data-target="#modalAdd" href="#add">Add Task</a>
                        </li>
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
        <div id="modalAdd" class="modal fade">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h4 class="modal-title">Add New Task</h4>
                    </div>
                    <div class="modal-body">
                        <form class="form-horizontal" role="form">
                            <div class="form-group">
                                <label for="modalAddTitle" class="col-lg-2 control-label">Title</label>
                                <div class="col-lg-10">
                                    <input id="modalAddTitle" class="form-control" placeholder="Feed the cat"/>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="modalAddDesc" class="col-lg-2 control-label">Description</label>
                                <div class="col-lg-10">
                                    <textarea id="modalAddDesc" class="form-control" placeholder="Bubbles deserves a treat, so make sure to feed him the good chunks."></textarea>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="modalAddPri" class="col-lg-2 control-label">Priority</label>
                                <div class="col-lg-10">
                                    <select id="modalAddPri" class="form-control">
                                        <option value="0" class="alert-info">0 &ndash; Low</option>
                                        <option value="1" class="alert-success">1 &ndash; Medium</option>
                                        <option value="2" class="alert">2 &ndash; High</option>
                                        <option value="3" class="alert-danger">3 &ndash; Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="modalAddDuePreset" class="col-lg-2 control-label">Due</label>
                                <div class="col-lg-3">
                                    <select id="modalAddDuePreset" class="form-control">
                                        <option>Not due</option>
                                        <option>Today</option>
                                        <option>Now</option>
                                        <option>Yesterday</option>
                                        <option>Tomorrow</option>
                                        <option>Next week</option>
                                        <option>Custom...</option>
                                    </select>
                                </div>
                                <div class="col-lg-4">
                                    <input id="modalAddDueDate" type="date" class="form-control" disabled/>
                                </div>
                                <div class="col-lg-3">
                                    <input id="modalAddDueTime" type="time" class="form-control" step="1" disabled/>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="modalAddRepeatPreset" class="col-lg-2 control-label">Repeat</label>
                                <div class="col-lg-3">
                                    <select id="modalAddRepeatPreset" class="form-control">
                                        <option>No repeat</option>
                                        <option>Daily</option>
                                        <option>Weekly</option>
                                        <option>Fortnightly</option>
                                        <option>Custom...</option>
                                    </select>
                                </div>
                                <div class="col-lg-2">
                                    <input id="modalAddRepeatDays" type="number" class="form-control" min="1" placeholder="n/a" disabled/>
                                </div>
                                <div class="col-lg-5">
                                    <select id="modalAddRepeatFrom" class="form-control" disabled>
                                        <option>From completion</option>
                                        <option>From due date</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="modalAddTags_tag" class="col-lg-2 control-label">Tags</label>
                                <div class="col-lg-10">
                                    <input id="modalAddTags" class="form-control" placeholder="Home Cat"/>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" onclick="modalAdd();">Add Task</button>
                        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                    </div>
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
        <script type="text/javascript" src="res/jquery-1.10.2.min.js"></script>
        <script type="text/javascript" src="res/bootstrap.min.js"></script>
        <script type="text/javascript" src="res/jquery.tagsinput.min.js"></script>
        <script type="text/javascript" src="res/script.js"></script>
    </body>
</html>