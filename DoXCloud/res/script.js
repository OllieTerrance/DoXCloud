$(document).ready(function() {
    // add helper prototype functions
    // Array.has: equivalent to Python's "item in array" statement
    Array.prototype.has = function has(item) {
        return this.indexOf(item) >= 0;
    };
    // Date.format: pretty prints a date according to any format
    Date.prototype.format = function format(pattern) {
        // default pattern if none specified
        if (!pattern) pattern = "dd/mm/yyyy HH:MM:SS";
        // make all numbers 2 digits
        function pad(n) {
            return n < 10 ? "0" + n : n;
        }
        return pattern.split("yyyy").join(this.getFullYear())                       // full 4-digit year
                      .split("yy").join(this.getFullYear().toString().substring(2)) // abreviated 2-digit year
                      .split("mm").join(pad(this.getMonth() + 1))                   // padded month
                      .split("m").join(this.getMonth() + 1)                         // plain month
                      .split("dd").join(pad(this.getDate()))                        // padded date
                      .split("d").join(this.getDate())                              // plain date
                      .split("HH").join(pad(this.getHours()))                       // padded hour
                      .split("H").join(this.getHours())                             // plain hour
                      .split("MM").join(pad(this.getMinutes()))                     // padded minute
                      .split("M").join(this.getMinutes())                           // plain minute
                      .split("SS").join(pad(this.getSeconds()))                     // padded second
                      .split("S").join(this.getSeconds());                          // plain second
    }
    // String.shlex: equivalent to Python's "shlex.split" method
    String.prototype.shlex = function shlex() {
        // default to splitting by space
        var args = this.split(" ");
        // return list of args
        var out = [];
        // if unmatched quotes, store the start of the last opened quote
        var lookForClose = -1;
        // checking if quotes are open within an arg
        var quoteOpen = false;
        for (var x in args) {
            // ignore prototype methods
            if (args.hasOwnProperty(x)) {
                var arg = args[x];
                // previous character was a backslash, expecting escape sequence
                var escSeq = false;
                for (var y in arg) {
                    // last character was a backslash, treat next character as literal
                    if (escSeq) {
                        escSeq = false;
                    // found a backslash
                    } else if (arg[y] === "\\") {
                        escSeq = true;
                    // found a real quote
                    } else if (arg[y] === "\"") {
                        quoteOpen = !quoteOpen;
                    }
                }
                // nothing special here, just return a single argument
                if (!quoteOpen && lookForClose === -1) {
                    out.push(arg);
                // opening quote in this arg, search for a closing quote
                } else if (quoteOpen && lookForClose === -1) {
                    lookForClose = x;
                // still searching for a closing quote, try looking here
                } else if (!quoteOpen && lookForClose >= 0) {
                    // take the block of args from the one with opening quote, to current with closing quote
                    var block = args.slice(lookForClose, parseInt(x) + 1).join(" ");
                    var escSeq = false;
                    // list of indexes of quotes to remove
                    var quotes = [];
                    for (var y in block) {
                        // treat next character as literal
                        if (escSeq) {
                            escSeq = false;
                        // start escape sequence
                        } else if (block[y] === "\\") {
                            escSeq = true;
                        // found a quote
                        } else if (block[y] === "\"") {
                            quotes.push(y);
                        }
                    }
                    // trim quotes off either end, even if contained within the args
                    // - assumes two quotes, will ignore any additional inner pairs
                    var parts = [];
                    parts.push(block.substr(0, quotes[0]));
                    parts.push(block.substr(parseInt(quotes[0]) + 1, quotes[quotes.length - 1] - (parseInt(quotes[0]) + 1)));
                    parts.push(block.substr(parseInt(quotes[quotes.length - 1]) + 1));
                    block = parts.join("");
                    out.push(block);
                    // stop looking for a close quote
                    lookForClose = -1;
                }
                // other case: searching for a quote whilst quote is open
                // - already known so skip
            }
        }
        // if unbalanced, return false
        return quoteOpen ? false : out;
    }
    // handler for navbar links to select clicked item, deselect others
    $("#tabList li a").on("click", function() {
        // get hash part from link href
        var id = this.hash.substr(1);
        // map all links in menu
        $("#tabList li").map(function(index, item) {
            // add active class if the clicked item
            if (item.id.substr(3).toLowerCase() === id) {
                $(item).addClass("active");
            // remove if not
            } else {
                $(item).removeClass("active");
            }
        });
    });
    // turn tag field in add task window into a tag editor field
    $("#modalAddTags").tagsInput({
        defaultText: "Add...",
        // override size to use Bootstrap CSS
        height: "auto",
        width: "auto"
    });
    // re-apply Bootstrap control theme
    setTimeout(function() {
        $("#modalAddTags_tagsinput").addClass("form-control"); 
    }, 50);
    // handler for updating due date/time on preset selection in add task window
    $("#modalAddDuePreset").on("change", function(e) {
        var newDate = new Date();
        var val = this.value;
        // enable fields if custom enabled
        if (val === "custom") {
            $("#modalAddDueDate").removeAttr("disabled");
            $("#modalAddDueTime").removeAttr("disabled");
        } else {
            // no due date, clear fields
            if (val === "none") {
                $("#modalAddDueDate").val("");
                $("#modalAddDueTime").val("");
            } else {
                // include time in field
                if (val === "now") {
                    $("#modalAddDueTime").val(newDate.toISOString().substr(11, 8));
                } else {
                    // only use a date
                    $("#modalAddDueTime").val("");
                    // set offset according to choice
                    if (val === "yesterday") {
                        newDate.setDate(newDate.getDate() - 1);
                    } else if (val === "tomorrow") {
                        newDate.setDate(newDate.getDate() + 1);
                    } else if (val === "week") {
                        newDate.setDate(newDate.getDate() + 7);
                    }
                }
                // update date field
                $("#modalAddDueDate").val(newDate.toISOString().substr(0, 10));
            }
            // disable fields (handled by preset instead)
            $("#modalAddDueDate").attr("disabled", "disabled");
            $("#modalAddDueTime").attr("disabled", "disabled");
        }
    });
    // handler for updating repeat days on preset selection in add task window
    $("#modalAddRepeatPreset").on("change", function(e) {
        var val = this.value;
        // no repeat, clear field and disable options
        if (val === "none") {
            $("#modalAddRepeatDays").val("");
            $("#modalAddRepeatFrom").attr("disabled", "disabled");
        } else {
            // some repeat option, enable from selector
            $("#modalAddRepeatFrom").removeAttr("disabled");
            // custom days, enable days field
            if (val === "custom") {
                $("#modalAddRepeatDays").removeAttr("disabled");
            } else {
                // disable field (handled by preset instead)
                $("#modalAddRepeatDays").attr("disabled", "disabled");
                // set days from preset
                if (val === "day") {
                    $("#modalAddRepeatDays").val("1");
                } else if (val === "week") {
                    $("#modalAddRepeatDays").val("7");
                } else if (val === "fortnight") {
                    $("#modalAddRepeatDays").val("14");
                }
            }
        }
    });
    // toggle between all fields and quick add on add task window
    $("#modalAddToggle").on("click", function(e) {
        if ($("#modalAddFields").prop("style").display === "none") {
            // hide quick add, show fields
            $("#modalAddQuick").prop("style").display = "none";
            $("#modalAddFields").prop("style").display = "block";
            $("#modalAddToggle").html("Quick Add");
            $("#modalAddString").focus();
        } else {
            // hide fields, show quick add
            $("#modalAddFields").prop("style").display = "none";
            $("#modalAddQuick").prop("style").display = "block";
            $("#modalAddToggle").html("Show Fields");
            $("#modalAddTitle").focus();
        }
    });
    // handler for confirming add task window
    $("#modalAddSave").on("click", function(e) {
        // using quick add
        if ($("#modalAddFields").prop("style").display === "none") {
            // use the Task constructor to parse
            var task = new Task($("#modalAddString").val());
            // if valid, add new task
            if (task) {
                DoX.tasks.push(task);
                DoX.saveTasks();
            }
        // using all fields
        } else {
            // fill in basic details
            var params = {
                title: $("#modalAddTitle").val(),
                desc: $("#modalAddDesc").val(),
                pri: parseInt($("#modalAddPri").val()),
                due: {
                    date: new Date(),
                    time: false
                },
                repeat: {
                    days: 1,
                    fromDue: $("#modalAddRepeatFrom").val() === "due"
                },
                tags: $("#modalAddTags").val().split(",")
            };
            // use preset values for due date
            switch ($("#modalAddDuePreset").val()) {
                case "none":
                    params.due = false;
                    break;
                case "now":
                    params.due.time = true;
                    break;
                case "yesterday":
                    params.due.date.setDate(params.due.date.getDate() - 1);
                    break;
                case "tomorrow":
                    params.due.date.setDate(params.due.date.getDate() + 1);
                    break;
                case "week":
                    params.due.date.setDate(params.due.date.getDate() + 1);
                    break;
                case "custom":
                    // custom due date, read fields
                    params.due.date = new Date($("#modalAddDueDate").val() + " " + $("#modalAddDueTime").val());
                    // !! converts to boolean (true if value is truthy)
                    params.due.time = !!$("#modalAddDueTime").val();
                    break;
            }
            // due date but no time
            if (params.due && !params.due.time) {
                // clear time values
                params.due.date.setHours(0);
                params.due.date.setMinutes(0);
                params.due.date.setSeconds(0);
            }
            // use preset valus for repeat
            switch ($("#modalAddRepeatPreset").val()) {
                case "none":
                    params.repeat = false;
                    break;
                case "week":
                    params.repeat.days = 7;
                    break;
                case "fortnight":
                    params.repeat.days = 14;
                    break;
                case "custom":
                    // custom due date, read field
                    params.repeat.days = parseInt($("#modalAddRepeatDays").val());
                    if (params.repeat.days < 1) {
                        params.repeat = false;
                    }
                    break;
            }
            // add new task
            DoX.tasks.push(new Task(params));
            DoX.saveTasks();
        }
        // close add task window
        $("#modalAdd").modal("hide");
        // refresh the list
        listRefresh();
    });
    // form reset handler on modal close
    $("#modalAdd").on("hidden.bs.modal", function(e) {
        $("#modalAddTitle").val("");
        $("#modalAddDesc").val("");
        $("#modalAddPri").val("0");
        $("#modalAddDuePreset").val("none");
        $("#modalAddDueDate").val("");
        $("#modalAddDueTime").val("");
        $("#modalAddRepeatPreset").val("none");
        $("#modalAddRepeatDays").val("");
        $("#modalAddRepeatFrom").val("completion");
        $("#modalAddTags").importTags("");
        $("#modalAddString").val("");
    });
    // handler for logout option in menu
    $("#modalLogoutConfirm").on("click", function (e) {
        // disable controls to prevent sending multiple times
        $("#modalLogoutControls button").prop("disabled", true);
        $.ajax({
            url: "/api/auth.php",
            dataType: "json",
            method: "GET",
            data: {
                submit: "logout"
            },
            success: function(resp, status, obj) {
                // done, return to login page
                $(location).attr("href", ".");
            },
            error: function(obj, status, err) {
                // error, re-enable controls
                $("#modalLogoutControls button").prop("disabled", false);

            }
        });
    });
    // if local storage available, load from storage and pre-fill task list
    if (hasStorage()) {
        DoX.loadTasks();
        listRefresh();
    // if not, warn about no saving
    } else {
        addAlert("<strong>Warning:</strong> local storage is not available in your browser.  You will not be able to save any tasks locally.", "danger", "localStorage");
    }
    // register network status change events
    $(window).on("online offline", function(e) {
        clearAlerts("network");
        if (e.type === "online") {
            addAlert("<strong>Just a heads up:</strong> your internet connection has been restored, and you can continue to work on your tasks as normal.", "success", "network");
        } else {
            addAlert("<strong>Just a heads up:</strong> you don't seem to be connected to the internet any more.  No worries, you can just continue to work on your tasks right here.", "info", "network");
        }
    });
});
// Task object constructor
function Task(params) {
    switch (typeof params) {
        // passed a DoX string, need to parse
        case "string":
            // shlex parse the string
            var args = params.shlex();
            // if invalid, end here
            if (!args) {
                return false;
            }
            // skeleton task params
            params = {
                title: "",
                desc: "",
                pri: 0,
                due: false,
                repeat: false,
                tags: []
            };
            // first generic parameter regarded as task title
            needTitle = true;
            for (var x in args) {
                // ignore prototype methods
                if (args.hasOwnProperty(x)) {
                    var arg = args[x];
                    // $ identifier (hex)
                    if (arg.match(/^\$[0-9a-f]{5}$/)) {
                        params.id = arg.substr(1);
                    // ~ description
                    } else if (arg[0] === "~" && arg.length > 1) {
                        params.desc = arg.substr(1).replace("|", "\n");
                    // ! priority (numerical)
                    } else if (arg.match(/^![0-3]$/)) {
                        params.pri = parseInt(arg[1]);
                    // ! priority (bang)
                    } else if (arg.match(/!{1,3}$/)) {
                        params.pri = arg.length;
                    // 0 (zero) priority
                    } else if (arg === "0") {
                        params.pri = 0;
                    // @ due date
                    } else if (arg[0] === "@" && arg.length > 1) {
                        keywords = arg.substr(1).split("|");
                        if (keywords.length === 1) {
                            keywords.push("");
                        }
                        // parse date/time keywords
                    // & repeat
                    } else if (arg[0] === "&" && arg.length > 1) {
                        var days = arg.substr(1);
                        var fromDue = true;
                        // repeat from completion instead of due date
                        if (days[days.length - 1] === "*") {
                            days = days.substr(0, days.length - 1);
                            fromDue = false;
                        }
                        // aliases
                        if (["daily", "day", "every day"].has(days)) {
                            days = 1;
                        } else if (["weekly", "week"].has(days)) {
                            days = 7;
                        } else if (["fortnightly", "fortnight", "2 weeks"].has(days)) {
                            days = 14;
                        } else {
                            // no matches, treat as an integer
                            days = parseInt(days);
                            if (isNaN(days) || days <= 0) {
                                days = false;
                            }
                        }
                        if (days) {
                            params.repeat = {
                                days: days,
                                fromDue: fromDue
                            };
                        }
                    // # tags
                    } else if (arg[0] === "#" && arg.length > 1) {
                        tag = arg.substr(1);
                        if (!params.tags.has(tag.toLowerCase(), true)) {
                            params.tags.push(tag);
                        }
                    // generic
                    } else if (needTitle) {
                        params.title = arg;
                        needTitle = false;
                    }
                }
            }
            // can't repeat without due date
            if (params.repeat && !params.due) {
                params.due = {
                    date: new Date(),
                    time: false
                };
                params.due.date.setHours(0);
                params.due.date.setMinutes(0);
                params.due.date.setSeconds(0);
            }
            break;
        // no parameters, create a blank task
        case "undefined":
            params = {
                title: "",
                desc: "",
                pri: 0,
                due: false,
                repeat: false,
                tags: []
            };
            break;
    }
    // set new fields
    this.title = params.title;
    this.desc = params.desc;
    this.pri = params.pri;
    this.due = params.due;
    this.repeat = params.repeat;
    this.tags = params.tags;
}
// build Task prototype
Task.prototype = {
    // assign constructor
    constructor: Task,
    // return the due date as a string
    formatDue: function formatDue() {
        if (this.due) {
            return this.due.date.format(this.due.time ? "dd/mm/yyyy HH:MM:SS" : "dd/mm/yyyy");
        }
    },
    // return the repeat selection as a string
    formatRepeat: function formatRepeat() {
        if (this.repeat) {
            var out = "";
            switch (this.repeat.days) {
                case 1:
                    out = "Daily";
                    break;
                case 7:
                    out = "Weekly";
                    break;
                case 14:
                    out = "Fortnightly";
                    break;
                default:
                    out = "Every " + this.repeat.days + " days";
                    break;
            }
            return out + " from " + (this.repeat.fromDue ? "due date" : "completion");
        }
    },
    // override toString() method to return DoX string format instead
    toString: function toString() {
        var args = [];
        // wrap multi-word strings with quotes
        function quote(str) {
            if (str.indexOf(" ") >= 0) {
                str = "\"" + str.replace(/\"/g, "\\\"") + "\"";
            }
            return str;
        }
        if (this.title) {
            // just print title
            args.push(quote(this.title));
        }
        if (this.desc) {
            // description with line breaks converted
            args.push("~" + quote(this.desc.replace(/\n/g, "|")));
        }
        if (this.pri) {
            // basic priority if not 0
            args.push("!" + this.pri);
        }
        if (this.due) {
            // due date in standard format
            args.push(this.due.date.format(this.due.time ? "@dd/mm/yyyy|HH:MM:SS" : "@dd/mm/yyyy"));
        }
        if (this.repeat) {
            // repeat as a number
            args.push("&" + this.repeat.days + (this.repeat.fromDue ? "" : "*"));
        }
        if (this.tags.length > 0) {
            // individual tags
            for (var x in this.tags) {
                // ignore prototype methods
                if (this.tags.hasOwnProperty(x)) {
                    args.push("#" + quote(this.tags[x]));
                }
            }
        }
        if (this.id) {
            args.push("$" + this.id);
        }
        // return formatted string
        return args.join(" ");
    }
}
// main DoX API: access to tasks and helper methods
// - self-calling function returns an object instance
var DoX = new (function DoX() {
    // list of user's tasks, as Task objects
    this.tasks = [];
    // list of completed tasks
    this.done = [];
    // save tasks to local storage
    this.saveTasks = function saveTasks() {
        if (hasStorage()) {
            localStorage.clear();
            localStorage.taskCount = this.tasks.length;
            localStorage.doneCount = this.done.length;
            $(this.tasks).each(function(index, item) {
                localStorage["task" + index] = item;
            });
            $(this.done).each(function(index, item) {
                localStorage["done" + index] = item;
            });
        }
    };
    // load tasks from local storage
    this.loadTasks = function loadTasks() {
        if (hasStorage()) {
            var taskCount = parseInt(localStorage.taskCount);
            this.tasks = [];
            for (var x = 0; x < taskCount; x++) {
                this.tasks.push(new Task(localStorage["task" + x]));
            }
            var doneCount = parseInt(localStorage.doneCount);
            this.done = [];
            for (var x = 0; x < doneCount; x++) {
                this.done.push(new Task(localStorage["done" + x]));
            }
        }
    };
    // generate a random ID
    this.newID = function newID() {
        var id = Math.floor((Math.random() * 1048576)).toString(16);
        while (id.length < 5) {
            id = "0" + id;
        }
        return id;
    }
    // generate IDs for all tasks
    this.fixIDs = function fixIDs() {
        // list of IDs in use
        var used = [];
        // list of task objects to generate IDs for
        var toGen = [];
        for (var x in tasks) {
            if (tasks[x].id && !used.has(tasks[x].id)) {
                used.push(tasks[x].id);
            } else {
                toGen.push(tasks[x]);
            }
        }
        for (var x in toGen) {
            // generate a new ID
            toGen[x].id = newID();
            while (used.has(toGen[x].id)) {
                toGen[x].id = newID();
            }
            used.push(toGen[x].id);
        }
    }
})();
// check if local storage is available in browser
function hasStorage() {
    return "localStorage" in window && localStorage !== null;
}
// build task list table
function listRefresh() {
    // clear all table rows, except for headers
    $("#listTasks tbody").children().map(function(index, item) {
        if (item.id !== "listTasksHead") {
            item.remove();
        }
    });
    // user has tasks, display them
    if (DoX.tasks.length) {
        $(DoX.tasks).each(function(index, task) {
            var row = $("<tr/>");
            row.append($("<td>" + (index + 1) + "</td>"));
            row.append($("<td>" + task.title + "</td>"));
            row.append($("<td>" + task.pri + "</td>"));
            row.append($("<td>" + (task.due ? task.formatDue() : "<em>None</em>") + "</td>"));
            row.append($("<td>" + (task.repeat ? task.formatRepeat() : "<em>None</em>") + "</td>"));
            row.append($("<td>" + (task.tags.length > 0 ? task.tags.join(", ") : "<em>None</em>") + "</td>"));
            $("#listTasks").append(row);
        });
    // no user tasks, show column spanning information message
    } else {
        var row = $("<tr/>");
        row.append($("<td colspan='6'>No tasks to show.  Would you like to <a data-toggle='modal' data-target='#modalAdd' href='#add'>add one</a>?</td>"));
        $("#listTasks").append(row);
    }
}
// add an alert to the notification box
function addAlert(message, type, tag, dismissable) {
    var alert = $("<div class='alert alert-dismissable'>");
    // add class if defined
    if (type) {
        alert.addClass("alert-" + type);
    }
    // add tag if defined
    if (tag) {
        alert.addClass("notif-" + tag);
    }
    // default to true if undefined
    if (dismissable !== false) {
        alert.append($("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>"));
    }
    alert.append($("<span>" + message + "</span>"));
    $("#notifBox").append(alert);
}
// clear all alerts, or ones with a specific type (class)
function clearAlerts(tag) {
    $(".alert" + (tag ? ".notif-" + tag : "")).remove();
}
