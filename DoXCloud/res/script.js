$(document).ready(function() {
    Array.prototype.has = function(item) {
        return this.indexOf(item) >= 0;
    };
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
        if (["Yesterday", "Today", "Now", "Tomorrow", "Next week"].has(val)) {
            if (val === "Now") {
                $("#modalAddDueTime").val(newDate.toISOString().substr(11, 8));
            } else {
                $("#modalAddDueTime").val("");
                if (val === "Yesterday") {
                    newDate.setDate(newDate.getDate() - 1);
                } else if (val === "Tomorrow") {
                    newDate.setDate(newDate.getDate() + 1);
                } else if (val === "Next week") {
                    newDate.setDate(newDate.getDate() + 7);
                }
            }
            $("#modalAddDueDate").val(newDate.toISOString().substr(0, 10));
        } else if (val === "Not due") {
            $("#modalAddDueDate").val("");
            $("#modalAddDueTime").val("");
        }
        if (val === "Custom...") {
            $("#modalAddDueDate").removeAttr("disabled");
            $("#modalAddDueTime").removeAttr("disabled");
        } else {
            $("#modalAddDueDate").attr("disabled", "disabled");
            $("#modalAddDueTime").attr("disabled", "disabled");
        }
    });
    $("#modalAddRepeatPreset").on("change", function(e) {
        var val = this.value;
        if (val === "No repeat") {
            $("#modalAddRepeatDays").val("");
        } else if (val === "Every day") {
            $("#modalAddRepeatDays").val("1");
        } else if (val === "Every week") {
            $("#modalAddRepeatDays").val("7");
        } else if (val === "Every fortnight") {
            $("#modalAddRepeatDays").val("14");
        }
        if (val === "Custom...") {
            $("#modalAddRepeatDays").removeAttr("disabled");
            $("#modalAddRepeatFrom").removeAttr("disabled");
        } else {
            $("#modalAddRepeatDays").attr("disabled", "disabled");
            if (val === "No repeat") {
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
});
var tasks = [
    {
        title: "Test Task",
        desc: "This is an example task.",
        pri: 2,
        due: {
            date: new Date(1377000000),
            time: true
        },
        repeat: {
            days: 7,
            fromCompletion: true
        },
        tags: ["Test"]
    }
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
                row.append($("<td>" + task.due + "</td>"));
                row.append($("<td>" + task.repeat + "</td>"));
                row.append($("<td>" + task.tags.join(", ") + "</td>"));
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
function modalAdd() {}
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
