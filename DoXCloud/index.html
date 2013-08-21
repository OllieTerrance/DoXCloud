<!DOCTYPE html>
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
        <style type="text/css">
        body {
            padding-top: 68px;
        }
        </style>
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
                        <li title="Task management, your way.">
                            <a data-target="#tasks" href="./" class="navbar-brand">DoX&nbsp;&nbsp;</a>
                        </li>
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
        <div class="container">
            <table id="listTasks" class="table table-bordered table-striped">
                <tr id="listTasksHead">
                    <th>#</th>
                    <th>Task</th>
                    <th>Priority</th>
                    <th>Due</th>
                    <th>Repeat</th>
                    <th>Tags</th>
                </tr>
            </table>
        </div>
        <div id="modalAdd" class="modal fade">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h4 class="modal-title">Add New Task</h4>
                    </div>
                    <div class="modal-body">
                        <form id="modalAddFields" class="form-horizontal" role="form">
                            <div class="form-group">
                                <label for="modalAddTitle" class="col-lg-2 control-label">Title</label>
                                <div class="col-lg-10">
                                    <input id="modalAddTitle" class="form-control" placeholder="Clean out garage"/>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="modalAddDesc" class="col-lg-2 control-label">Description</label>
                                <div class="col-lg-10">
                                    <textarea id="modalAddDesc" class="form-control" placeholder="Lots of junk to clear &ndash; yard sale?"></textarea>
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
                                        <option value="none">Not due</option>
                                        <option value="today">Today</option>
                                        <option value="now">Now</option>
                                        <option value="yesterday">Yesterday</option>
                                        <option value="tomorrow">Tomorrow</option>
                                        <option value="week">Next week</option>
                                        <option value="custom">Custom...</option>
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
                                <div class="col-lg-4">
                                    <select id="modalAddRepeatPreset" class="form-control">
                                        <option value="none">No repeat</option>
                                        <option value="day">Every day</option>
                                        <option value="week">Every week</option>
                                        <option value="fortnight">Every fortnight</option>
                                        <option value="custom">Custom...</option>
                                    </select>
                                </div>
                                <div class="col-lg-2">
                                    <input id="modalAddRepeatDays" type="number" class="form-control" min="1" placeholder="n/a" disabled/>
                                </div>
                                <div class="col-lg-4">
                                    <select id="modalAddRepeatFrom" class="form-control" disabled>
                                        <option value="due">From due date</option>
                                        <option value="completion">From completion</option>
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
                        <form id="modalAddQuick" class="form-horizontal" role="form" style="display: none;">
                            <div class="form-group">
                                <div class="col-lg-11">
                                    <input id="modalAddString" class="form-control" placeholder="&quot;Feed the cat&quot; !2 @tomorrow|13:30 &daily #Home #Cat"/>
                                </div>
                                <div class="col-lg-1 control-label">
                                    <a data-toggle="modal" data-target="#modalHowToWrite" href="#howToWrite">Help?</a>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button id="modalAddSave" type="button" class="btn btn-primary">Add</button>
                        <button id="modalAddToggle" type="button" class="btn btn-info">Quick Add</button>
                        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
        <div id="modalHowToWrite" class="modal fade">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h4 class="modal-title">Quick Add Explained</h4>
                    </div>
                    <div class="modal-body">
                        <ul>
                            <li>The first word or phrase without a symbol is taken to be the task title.</li>
                            <li>A <code>~</code> includes a longer description of the task.</li>
                            <li>A <code>!</code> symbol sets a task's priority, a number between 0 (low) and 3 (high).</li>
                            <li>An <code>@</code> denotes a due date and time for the task.  This can be a date, or a date and time.  Write it as <code>date|time</code>.</li>
                            <li>An <code>&amp;</code> defines a repetition rule.  This can be a number of days before the task is due again, counting by default from task completion, or from the previous due date by adding <code>*</code> after the number of days.</li>
                            <li>A <code>#</code> adds a tag.  A task can have any number of tags.</li>
                            <li>If any part contains spaces, wrap the whole part in double quotes.</li>
                        </ul>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Ok</button>
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
                        <button id="modalSettingsSave" type="button" class="btn btn-primary">Save</button>
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
                        <button id="modalLogoutConfirm" type="button" class="btn btn-primary">Logout</button>
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
