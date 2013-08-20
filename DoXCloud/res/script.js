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
        $("#modalAddDuePreset").val("Not due");
        $("#modalAddDueDate").val("");
        $("#modalAddDueTime").val("");
        $("#modalAddRepeatPreset").val("No repeat");
        $("#modalAddRepeatDays").val("No repeat");
        $("#modalAddRepeatFrom").val("From completion");
        $("#modalAddTags").importTags("");
    });
    listRefresh();
});
function shlex(str) {
    var args = str.split(" ");
    var out = [];
    var lookForClose = -1;
    for (var x in args) {
        if (args.hasOwnProperty(x)) {
            var arg = args[x];
            if (lookForClose >= 0) {
                if (arg.indexOf("\"") >= 0 && arg.charAt(arg.indexOf("\"") - 1) !== "\\") {
                    var block = args.slice(lookForClose, parseInt(x) + 1).join(" ");
                    out.push(block.substr(1, block.length - 2).replace(/\\\"/g, "\"").replace(/\\\\/g, "\\"));
                    lookForClose = -1;
                }
            } else {
                if (arg.indexOf("\"") === 0) {
                    lookForClose = x;
                } else {
                    out.push(arg);
                }
            }
        }
    }
    return out;
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
            return out + " from " + (this.repeat.fromCompletion ? "completion" : "due date");
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
            fromCompletion: true
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
        // handle quick add
    } else {
        var title = $("#modalAddTitle").val();
        var desc = $("#modalAddDesc").val();
        var pri = parseInt($("#modalAddPri").val());
        var due = {
            date: new Date(),
            time: false
        };
        switch ($("#modalAddDuePreset").val()) {
            case "none":
                due = false;
                break;
            case "now":
                due.time = true;
                break;
            case "yesterday":
                due.date.setDate(due.date.getDate() - 1);
                break;
            case "tomorrow":
                due.date.setDate(due.date.getDate() + 1);
                break;
            case "week":
                due.date.setDate(due.date.getDate() + 1);
                break;
            case "custom":
                due.date = new Date($("#modalAddDueDate").val() + " " + $("#modalAddDueTime").val());
                due.time = !!$("#modalAddDueTime").val();
                break;
        }
        if (due && !due.time) {
            due.date.setHours(0);
            due.date.setMinutes(0);
            due.date.setSeconds(0);
        }
        var repeat = {
            days: 1,
            fromCompletion: $("#modalAddRepeatFrom").val() === "completion"
        };
        switch ($("#modalAddRepeatPreset").val()) {
            case "none":
                repeat = false;
                break;
            case "week":
                repeat.days = 7;
                break;
            case "fortnight":
                repeat.days = 14;
                break;
            case "custom":
                repeat.days = parseInt($("#modalAddRepeatDays").val());
                break;
        }
        var tags = $("#modalAddTags").val().split(",");
        tasks.push(new Task({
            title: title,
            desc: desc,
            pri: pri,
            due: due,
            repeat: repeat,
            tags: tags
        }));
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
