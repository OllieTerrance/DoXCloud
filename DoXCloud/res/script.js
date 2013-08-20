$(document).ready(function() {
    Array.prototype.has = function(item) {
        return this.indexOf(item) >= 0;
    };
    Date.prototype.format = function(pattern) {
        if (!pattern) pattern = "dd/mm/yyyy HH:MM:SS";
        function pad(n) {
            return n < 10 ? "0" + n : n;
        }
        return pattern.split("yyyy").join(this.getFullYear())
                      .split("yy").join(this.getFullYear().toString().substring(2))
                      .split("mm").join(pad(this.getMonth() + 1))
                      .split("m").join(this.getMonth() + 1)
                      .split("dd").join(pad(this.getDate()))
                      .split("d").join(this.getDate())
                      .split("HH").join(pad(this.getHours()))
                      .split("H").join(this.getHours())
                      .split("MM").join(pad(this.getMinutes()))
                      .split("M").join(this.getMinutes())
                      .split("SS").join(pad(this.getSeconds()))
                      .split("S").join(this.getSeconds());
    }
    $("#tabList li a").on("click", function() {
        var id = this.hash.substr(1);
        $("#tabList li").map(function(index, item) {
            if (item.id.substr(3).toLowerCase() === id) {
                $(item).addClass("active");
            } else {
                $(item).removeClass("active");
            }
        });
    });
    $("#modalAddTags").tagsInput({
        defaultText: "Add...",
        height: "auto",
        width: "auto"
    });
    setTimeout(function() {
        $("#modalAddTags_tagsinput").addClass("form-control"); 
    }, 50);
    $("#modalAdd").on("show.bs.modal", function(e) {
        
    });
    $("#modalAddDuePreset").on("change", function(e) {
        var newDate = new Date();
        var val = this.value;
        if (["yesterday", "today", "now", "tomorrow", "week"].has(val)) {
            if (val === "now") {
                $("#modalAddDueTime").val(newDate.toISOString().substr(11, 8));
            } else {
                $("#modalAddDueTime").val("");
                if (val === "yesterday") {
                    newDate.setDate(newDate.getDate() - 1);
                } else if (val === "tomorrow") {
                    newDate.setDate(newDate.getDate() + 1);
                } else if (val === "week") {
                    newDate.setDate(newDate.getDate() + 7);
                }
            }
            $("#modalAddDueDate").val(newDate.toISOString().substr(0, 10));
        } else if (val === "none") {
            $("#modalAddDueDate").val("");
            $("#modalAddDueTime").val("");
        }
        if (val === "custom") {
            $("#modalAddDueDate").removeAttr("disabled");
            $("#modalAddDueTime").removeAttr("disabled");
        } else {
            $("#modalAddDueDate").attr("disabled", "disabled");
            $("#modalAddDueTime").attr("disabled", "disabled");
        }
    });
    $("#modalAddRepeatPreset").on("change", function(e) {
        var val = this.value;
        if (val === "none") {
            $("#modalAddRepeatDays").val("");
        } else if (val === "day") {
            $("#modalAddRepeatDays").val("1");
        } else if (val === "week") {
            $("#modalAddRepeatDays").val("7");
        } else if (val === "fortnight") {
            $("#modalAddRepeatDays").val("14");
        }
        if (val === "custom") {
            $("#modalAddRepeatDays").removeAttr("disabled");
            $("#modalAddRepeatFrom").removeAttr("disabled");
        } else {
            $("#modalAddRepeatDays").attr("disabled", "disabled");
            if (val === "none") {
                $("#modalAddRepeatFrom").attr("disabled", "disabled");
            } else {
                $("#modalAddRepeatFrom").removeAttr("disabled");
            }
        }
    });
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
    });
    listRefresh();
});
function shlex(str) {
    var args = str.split(" ");
    var out = [];
    var lookForClose = -1;
    var quoteOpen = false;
    for (var x in args) {
        if (args.hasOwnProperty(x)) {
            var arg = args[x];
            var escSeq = false;
            for (var y in arg) {
                if (escSeq) {
                    escSeq = false;
                } else if (arg[y] === "\\") {
                    escSeq = true;
                } else if (arg[y] === "\"") {
                    quoteOpen = !quoteOpen;
                }
            }
            if (!quoteOpen && lookForClose === -1) {
                out.push(arg);
            } else if (quoteOpen && lookForClose === -1) {
                lookForClose = x;
            } else if (!quoteOpen && lookForClose >= 0) {
                var block = args.slice(lookForClose, parseInt(x) + 1).join(" ");
                var escSeq = false;
                var quotes = [];
                for (var y in block) {
                    if (escSeq) {
                        escSeq = false;
                    } else if (block[y] === "\\") {
                        escSeq = true;
                    } else if (block[y] === "\"") {
                        quotes.push(y);
                    }
                }
                var parts = [];
                parts.push(block.substr(0, quotes[0]));
                parts.push(block.substr(parseInt(quotes[0]) + 1, quotes[1] - (parseInt(quotes[0]) + 1)));
                parts.push(block.substr(parseInt(quotes[1]) + 1));
                block = parts.join("");
                out.push(block);
                lookForClose = -1;
            }
        }
    }
    return quoteOpen ? false : out;
}
function Task(params) {
    if (!params) {
        params = {}
    }
    this.title = params.title;
    this.desc = params.desc;
    this.pri = params.pri;
    this.due = params.due;
    this.repeat = params.repeat;
    this.tags = params.tags;
}
Task.prototype = {
    constructor: Task,
    formatDue: function() {
        if (this.due) {
            return this.due.date.format(this.due.time ? "dd/mm/yyyy HH:MM:SS" : "dd/mm/yyyy");
        }
    },
    formatRepeat: function() {
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
            }
            return out + " from " + (this.repeat.fromDue ? "due date" : "completion");
        }
    }
}
var tasks = [
    new Task({
        title: "Test Task",
        desc: "This is an example task.",
        pri: 2,
        due: {
            date: new Date(1376953200000),
            time: false
        },
        repeat: {
            days: 7,
            fromDue: true
        },
        tags: ["Test"]
    }),
    new Task({
        title: "Another Test Task",
        desc: "This is an additional example task.",
        pri: 1,
        due: false,
        repeat: false,
        tags: ["Test", "Again"]
    })
];
function listRefresh() {
    $("#listTasks tbody").children().map(function(index, item) {
        if (item.id !== "listTasksHead") {
            item.remove();
        }
    });
    if (tasks.length) {
        for (var i in tasks) {
            if (tasks.hasOwnProperty(i)) {
                var task = tasks[i];
                var row = $("<tr/>");
                row.append($("<td>" + (parseInt(i) + 1) + "</td>"));
                row.append($("<td>" + task.title + "</td>"));
                row.append($("<td>" + task.pri + "</td>"));
                row.append($("<td>" + (task.due ? task.formatDue() : "<em>None</em>") + "</td>"));
                row.append($("<td>" + (task.repeat ? task.formatRepeat() : "<em>None</em>") + "</td>"));
                row.append($("<td>" + (task.tags.length ? task.tags.join(", ") : "<em>None</em>") + "</td>"));
                $("#listTasks").append(row);
            }
        }
    } else {
        var row = $("<tr/>");
        row.append($("<td colspan='6'>No tasks to show.</td>"));
        $("#listTasks").append(row);
    }
}
function modalAddToggle() {
    if ($("#modalAddFields").prop("style").display === "none") {
        $("#modalAddQuick").prop("style").display = "none";
        $("#modalAddFields").prop("style").display = "block";
        $("#modalAddToggle").html("Quick Add");
        setTimeout(function() {
            $("#modalAddString").focus();
        }, 50);
    } else {
        $("#modalAddFields").prop("style").display = "none";
        $("#modalAddQuick").prop("style").display = "block";
        $("#modalAddToggle").html("Show Fields");
        setTimeout(function() {
            $("#modalAddTitle").focus();
        }, 50);
    }
}
function modalAdd() {
    if ($("#modalAddFields").prop("style").display === "none") {
        var args = shlex($("#modalAddString").val());
        var params = {
            title: "",
            desc: "",
            pri: 0,
            due: false,
            repeat: false,
            tags: []
        };
        needTitle = true;
        for (var x in args) {
            if (args.hasOwnProperty(x)) {
                var arg = args[x];
                if (arg.match(/^\$[0-9a-f]{5}$/)) {
                    params.id = arg.substr(1);
                } else if (arg[0] === "~" && arg.length > 1) {
                    params.desc = arg.substr(1).replace("|", "\n");
                } else if (arg.match(/^![0-3]$/)) {
                    params.pri = parseInt(arg[1]);
                } else if (arg.match(/!{1,3}$/)) {
                    params.pri = arg.length;
                } else if (arg === "0") {
                    params.pri = 0;
                } else if (arg[0] === "@" && arg.length > 1) {
                    keywords = arg.substr(1).split("|");
                    if (keywords.length === 1) {
                        keywords.push("");
                    }
                    // parse date/time keywords
                } else if (arg[0] === "&" && arg.length > 1) {
                    var days = arg.substr(1);
                    var fromDue = true;
                    if (days[days.length - 1] === "*") {
                        days = days.substr(0, days.length - 1);
                        fromDue = false;
                    }
                    if (["daily", "day", "every day"].has(days)) {
                        days = 1;
                    } else if (["weekly", "week"].has(days)) {
                        days = 7;
                    } else if (["fortnightly", "fortnight", "2 weeks"].has(days)) {
                        days = 14;
                    } else {
                        try {
                            days = parseInt(days);
                            if (days <= 0) {
                                days = false;
                            }
                        } catch (error) {
                            days = false;
                        }
                    }
                    if (days) {
                        params.repeat = {
                            days: days,
                            fromDue: fromDue
                        };
                    }
                } else if (arg[0] === "#" && arg.length > 1) {
                    tag = arg.substr(1);
                    if (!params.tags.has(tag.toLowerCase(), true)) {
                        params.tags.push(tag);
                    }
                } else if (needTitle) {
                    params.title = arg;
                    needTitle = false;
                }
            }
        }
        if (params.repeat && !params.due) {
            params.due = {
                date: new Date(),
                time: false
            };
            params.due.date.setHours(0);
            params.due.date.setMinutes(0);
            params.due.date.setSeconds(0);
        }
        tasks.push(new Task(params));
    } else {
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
                params.due.date = new Date($("#modalAddDueDate").val() + " " + $("#modalAddDueTime").val());
                params.due.time = !!$("#modalAddDueTime").val();
                break;
        }
        if (params.due && !params.due.time) {
            params.due.date.setHours(0);
            params.due.date.setMinutes(0);
            params.due.date.setSeconds(0);
        }
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
                params.repeat.days = parseInt($("#modalAddRepeatDays").val());
                break;
        }
        tasks.push(new Task(params));
    }
    $("#modalAdd").modal("hide");
    listRefresh();
}
function modalLogout() {
    $("#modalLogoutControls button").prop("disabled", true);
    $.ajax({
        url: "/api/auth.php",
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
