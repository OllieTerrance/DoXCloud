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
                      .split("yy").join(this.getFullYear().toString().substring(2)) // abbreviated 2-digit year
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
    $("#tabList a").on("click", function() {
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
        // refresh task list with new context
        UI.tab = id;
        UI.listRefresh();
        // don't follow hash link
        return false;
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
        var task;
        // using quick add
        if ($("#modalAddFields").prop("style").display === "none") {
            // use the Task constructor to parse
            task = new Task($("#modalAddString").val());
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
                tags: $("#modalAddTags").val() === "" ? [] : $("#modalAddTags").val().split(",")
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
            // use preset values for repeat
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
            // create new task
            task = new Task(params);
        }
        // if valid, add new task
        if (task) {
            DoX.addTask(task);
            // close add task window
            $("#modalAdd").modal("hide");
            // save and refresh the list
            DoX.saveTasks();
            UI.listRefresh();
            UI.alerts.add("Added task <strong>" + task.title + "</strong>.", "info", "task", true, 3000);
        }
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
            method: "POST",
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
    if (Store.has()) {
        DoX.loadTasks();
        UI.listRefresh();
    // if not, warn about no saving
    } else {
        UI.alerts.add("<strong>Warning:</strong> local storage is not available in your browser.  You will not be able to save any tasks locally.", "danger", "store");
    }
    // register network status change events
    $(window).on("online offline", function(e) {
        UI.alerts.clear("network");
        if (e.type === "online") {
            UI.alerts.add("<strong>Just a heads up:</strong> your internet connection has been restored, and you can continue to work on your tasks as normal.", "success", "network");
        } else {
            UI.alerts.add("<strong>Just a heads up:</strong> you don't seem to be connected to the internet any more.  No worries, you can just continue to work on your tasks right here.", "info", "network");
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
                        var keywords = arg.substr(1).toLowerCase().split("|");
                        if (keywords.length === 1) {
                            keywords.push("");
                        }
                        // parse date/time keywords
                        params.due = Task.parseDue(keywords);
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
// function to parse a date string into a due param
// - outside of prototype to apply it to constructor rather than instance
Task.parseDue = function parseDue(keywords) {
    var date = keywords[0];
    var time = keywords[1];
    // aliases for days
    var days = {
        "monday": 0,
        "mon": 0,
        "tuesday": 1,
        "tues": 1,
        "tue": 1,
        "wednesday": 2,
        "wed": 2,
        "thursday": 3,
        "thurs": 3,
        "thur": 3,
        "thu": 3,
        "friday": 4,
        "fri": 4,
        "saturday": 5,
        "sat": 5,
        "sunday": 6,
        "sun": 6
    }
    var today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    var thisDate;
    // basic string understanding
    switch (date) {
        case "today":
            thisDate = today;
            break;
        case "tomorrow":
            thisDate = today;
            thisDate.setDate(thisDate.getDate() + 1);
            break;
        case "yesterday":
            thisDate = today;
            thisDate.setDate(thisDate.getDate() + -1);
            break;
        case "week":
        case "next week":
            thisDate = today;
            thisDate.setDate(thisDate.getDate() + 7);
            break;
        default:
            if (typeof days[date] === "number") {
                // compare given day with today
                var delta = days[date] - today.getDay() + 1;
                // shift by a week if already passed
                if (delta <= 0) {
                    delta += 7;
                }
                thisDate = today;
                thisDate.setDate(thisDate.getDate() + delta);
            } else {
                // no matches, try standard parse
                var parts = date.split("/");
                thisDate = today;
                if (parts[0]) {
                    thisDate.setDate(parts[0]);
                    if (parts[1]) {
                        thisDate.setMonth(parts[1]);
                        if (parts[2]) {
                            thisDate.setFullYear(parts[2]);
                        }
                    }
                }
                // failed to get a date
                if (isNaN(thisDate)) {
                    thisDate = null;
                }
            }
            break;
    }
    var due = false;
    // match found, now try to find a time
    if (thisDate && !isNaN(thisDate)) {
        due = {
            date: thisDate,
            time: false
        };
        // if a time is specified
        if (time) {
            var thisTime = new Date();
            if (time !== "now") {
                // no matches, try standard parse
                var parts = time.split(":");
                thisTime = today;
                if (parts[0]) {
                    thisTime.setHours(parts[0]);
                    if (parts[1]) {
                        thisTime.setMinutes(parts[1]);
                        if (parts[2]) {
                            thisTime.setSeconds(parts[2]);
                        }
                    }
                }
                // failed to get a date
                if (isNaN(thisTime)) {
                    thisTime = null;
                }
            }
            // valid time calculated
            if (thisTime && !isNaN(thisTime)) {
                // update date object
                thisDate.setHours(thisTime.getHours());
                thisDate.setMinutes(thisTime.getMinutes());
                thisDate.setSeconds(thisTime.getSeconds());
                due = {
                    date: thisDate,
                    time: true
                };
            }
        }
    }
    return due;
}
// main DoX API: access to tasks and helper methods
// - self-calling function returns an object instance
var DoX = new (function DoX() {
    // list of user's tasks, as Task objects
    this.tasks = [];
    // list of completed tasks
    this.done = [];
    // add a new task to the list
    this.addTask = function addTask(task) {
        this.tasks.push(task);
    };
    // (un)mark a task as complete
    this.doneTask = function doneTask(pos, isTasks) {
        if (isTasks) {
            // remove task at position from tasks, append to done
            this.done.push(this.tasks.splice(pos, 1)[0]);
        } else {
            // remove task at position from done, append to tasks
            this.tasks.push(this.done.splice(pos, 1)[0]);
        }
    };
    // delete a task
    this.deleteTask = function deleteTask(pos, isTasks) {
        // remove task at position from tasks/done
        (isTasks ? this.tasks : this.done).splice(pos, 1);
    };
    // save tasks to local storage
    this.saveTasks = function saveTasks() {
        if (Store.has()) {
            Store.clear();
            Store.set("taskCount", this.tasks.length);
            Store.set("doneCount", this.done.length);
            $(this.tasks).each(function(index, item) {
                Store.set("task" + index, item);
            });
            $(this.done).each(function(index, item) {
                Store.set("done" + index, item);
            });
        }
    };
    // load tasks from local storage
    this.loadTasks = function loadTasks() {
        if (Store.has()) {
            var taskCount = parseInt(Store.get("taskCount"));
            this.tasks = [];
            for (var x = 0; x < taskCount; x++) {
                this.tasks.push(new Task(Store.get("task" + x)));
            }
            var doneCount = parseInt(Store.get("doneCount"));
            this.done = [];
            for (var x = 0; x < doneCount; x++) {
                this.done.push(new Task(Store.get("done" + x)));
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
// UI API: helper methods for controlling the frontend
// - self-calling function returns an object instance
var UI = new (function UI() {
    // store current tab name
    this.tab = "tasks";
    // build task list table
    this.listRefresh = function listRefresh() {
        // clear all table rows, except for headers
        $("#listTasks tbody").children().map(function(index, item) {
            if (item.id !== "listTasksHead") {
                item.remove();
            }
        });
        // anonymous function to avoid scoping issue on this.tab
        (function(tasks, ui) {
            // user has tasks, display them
            if (tasks.length) {
                $(tasks).each(function(index, task) {
                    var row = $("<tr/>");
                    var priClasses = ["active", "success", "warning", "danger"];
                    row.addClass(priClasses[task.pri]);
                    row.append($("<td>" + (index + 1) + "</td>"));
                    row.append($("<td>" + task.title + "</td>"));
                    row.append($("<td>" + task.pri + "</td>"));
                    row.append($("<td>" + (task.due ? task.formatDue() : "<em>None</em>") + "</td>"));
                    row.append($("<td>" + (task.repeat ? task.formatRepeat() : "<em>None</em>") + "</td>"));
                    row.append($("<td>" + (task.tags.length > 0 ? task.tags.join(", ") : "<em>None</em>") + "</td>"));
                    var controls = $("<td/>");
                    var btnDone = $("<button class='btn btn-xs'>" + (ui.tab === "tasks" ? "Done" : "Undo") + "</button>");
                    btnDone.addClass(ui.tab === "tasks" ? "btn-success" : "btn-default");
                    btnDone.on("click", function(e) {
                        DoX.doneTask(index, ui.tab === "tasks");
                        DoX.saveTasks();
                        ui.listRefresh();
                        if (ui.tab === "tasks") {
                            ui.alerts.add("Marked task <strong>" + DoX.done[DoX.done.length - 1].title + "</strong> as complete.  Well done!", "success", "task", true, 3000);
                        } else {
                            ui.alerts.add("Unmarked task <strong>" + DoX.tasks[DoX.tasks.length - 1].title + "</strong> as complete.  Oh...", "warning", "task", true, 3000);
                        }
                    });
                    controls.append(btnDone);
                    controls.append($("<button class='btn btn-xs btn-warning'>Edit</button>"));
                    var btnDelete = $("<button class='btn btn-xs btn-danger'>Delete</button>");
                    btnDelete.on("click", function(e) {
                        var title = (ui.tab === "tasks" ? DoX.tasks : DoX.done)[index].title;
                        DoX.deleteTask(index, ui.tab === "tasks");
                        DoX.saveTasks();
                        ui.listRefresh();
                        ui.alerts.add("Deleted task <strong>" + title + "</strong>.  Oh...", "danger", "task", true, 3000);
                    });
                    controls.append(btnDelete);
                    row.append(controls);
                    $("#listTasks").append(row);
                });
            // no user tasks, show column spanning information message
            } else {
                var row = $("<tr/>");
                row.append($("<td colspan='7'>No tasks to show.  " + (ui.tab === "tasks" ? "Would you like to <a data-toggle='modal' data-target='#modalAdd' href='#add'>add one</a>?" : "Go and complete some!") + "</td>"));
                $("#listTasks").append(row);
            }
        })((this.tab === "tasks" ? DoX.tasks : DoX.done), this);
        // reset table stacking for mobile devices
        $(".table-stack.table-stack-small").remove();
        $("#listTasks").stacktable({myClass: "table table-bordered table-striped table-stack table-stack-small"});
        // remove top row, add spacing between task blocks
        $('.table-stack-small tr:empty:nth-child(1)').remove();
    };
    // subclass for managing Bootstrap alerts
    this.alerts = {
        // add an alert to the notification box
        add: function add(message, type, tag, dismissable, autoDismiss) {
            var alert = $("<div class='alert alert-dismissable fade in'>");
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
            // auto-dismiss after given time if specified
            if (autoDismiss) {
                setTimeout(function() {
                    alert.alert("close");
                }, autoDismiss);
            }
            alert.append($("<span>" + message + "</span>"));
            $("#notifBox").append(alert);
        },
        // clear all alerts, or ones with a specific type (class)
        clear: function clear(tag) {
            $(".alert" + (tag ? ".notif-" + tag : "")).remove();
        }
    };
    // confirm actions by requiring second click of button within 2 seconds
    this.sure = function sure(element, callback) {
        var label, event, form;
        // define function to reset label to default
        var resetLabel = function() {
            // is a form, reset submit button
            if (form) {
                element.value = label;
                form.onsubmit = event;
            // reset actual button
            } else {
                if (element.nodeName === "BUTTON") element.innerHTML = label;
                else if (element.nodeName === "INPUT") element.value = label;
                element.onclick = event;
            }
        };
        // define callback wrapper to reset label first
        var callbackWrapper = function() {
            resetLabel();
            callback();
        };
        // element is a form, override form's onsubmit but visible cue on submit button instead
        if (element.nodeName === "FORM") {
            form = element;
            element = $("#" + element.id + " input[type=submit]").get(0);
            label = element.value;
            element.value = "Sure?";
            event = form.onsubmit;
            form.onsubmit = callbackWrapper;
        } else {
            // button label is entire internal HTML
            if (element.nodeName === "BUTTON") {
                label = element.innerHTML;
                element.innerHTML = "Sure?";
            // input has a value parameter
            } else if (element.nodeName === "INPUT") {
                label = element.value;
                element.value = "Sure?";
            }
            // override callback
            event = element.onclick;
            element.onclick = callbackWrapper;
        }
        // button hasn't been pressed in time, revert
        setTimeout(resetLabel, 2000);
    };
})();
// Store API: light shorthand wrapper for local storage
var Store = new (function Store() {
    // check if local storage is available in browser
    this.has = function has() {
        return "localStorage" in window && localStorage !== null;
    };
    // store something in local storage
    this.set = function set(key, value) {
        return localStorage[key] = value;
    }
    // retrieve something from local storage
    this.get = function get(key) {
        return localStorage[key];
    }
    // retrieve all items
    this.all = function all() {
        return localStorage;
    }
    // delete something in local storage
    this.del = function del(key) {
        return delete localStorage[key];
    }
    // delete all items
    this.clear = function clear() {
        return localStorage.clear();
    }
})();
