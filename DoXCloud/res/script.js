$(document).ready(function() {
    // add helper prototype functions
    // Array.has: equivalent to Python's "item in array" statement
    Array.prototype.has = function has(item) {
        return this.indexOf(item) >= 0;
    };
    // Date.setHMS: set hours, minutes, seconds and milliseconds together
    Date.prototype.setHMS = function setHMS(hour, minute, second, millisecond) {
        this.setHours(hour);
        this.setMinutes(minute);
        this.setSeconds(second);
        if (!isNaN(millisecond)) {
            this.setMilliseconds(millisecond);
        }
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
    // String.toSentenceCase: capitalize first letter of each word
    String.prototype.toSentenceCase = function toSentenceCase() {
        var parts = this.split(" ");
        for (var x in parts) {
            // ignore prototype methods
            if (parts.hasOwnProperty(x)) {
                // capitalize first letter, keep the rest
                parts[x] = parts[x][0].toUpperCase() + parts[x].substr(1);
            }
        }
        // return the new string
        return parts.join(" ");
    };
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
                if (arg && !quoteOpen && lookForClose === -1) {
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
    $("#tabList a").on("click", function(e) {
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
    // start import wizard from menu
    $("#drpImport").on("click", function(e) {
        $("#hdnImport").click();
        e.preventDefault();
    });
    // when new files are selected, import them
    $("#hdnImport").on("change", function(e) {
        // if the user selected a file
        if (this.files.length) {
            // count number of tasks added
            var count = 0;
            // callback once file has been processed
            var callback = function() {
                // reset file input
                $("#frmImport").get(0).reset();
                DoX.saveTasks();
                UI.listRefresh();
                if (count) {
                    UI.alerts.add({
                        message: "Imported <strong>" + count + "</strong> task" + (count > 1 ? "s" : "") + ".",
                        type: "success",
                        tag: "task",
                        autoDismiss: 3000
                    });
                } else {
                    UI.alerts.add({
                        message: "Failed to import any tasks...  are you sure it was a valid task file?",
                        type: "warning",
                        tag: "task",
                        autoDismiss: 3000
                    });
                }
            };
            // separate processing to defer if user input is required
            var process = function(file, isTasks, noParse) {
                // read the file
                var reader = new FileReader;
                reader.readAsText(file);
                reader.onload = function() {
                    // split into task lines
                    var lines = reader.result.split("\n");
                    $.each(lines, function(index, item) {
                        // ignore blank lines
                        if (item) {
                            // create the task
                            var task = new Task(item);
                            // if not parsing, just pass line in as title
                            if (noParse) {
                                task = new Task({
                                    title: item
                                });
                            }
                            // if the task was created, store it
                            if (task) {
                                (isTasks ? DoX.tasks : DoX.done).push(task);
                                count++;
                            }
                        }
                    });
                    // return to callback
                    callback();
                };
            };
            // get file
            var file = this.files.item(0);
            // if a text file
            if (file.type === "text/plain") {
                // known file name, import
                if (["tasks.txt", "done.txt"].has(file.name)) {
                    process(file, file.name === "tasks.txt");
                // ask user which collection to import to
                } else {
                    var noParseCheck = $("<input id='modalImportTypeNoParse' type='checkbox'/>");
                    UI.modal({
                        title: "Import",
                        body: $("<div>").append("<p>This file seems to have an unexpected filename (it is neither <strong>tasks.txt</strong>, nor <strong>done.txt</strong>).  Would you like to import its contents into your current task list, or your completed tasks?</p>")
                                        .append($("<label>").append(noParseCheck)
                                                            .append("<span> Treat this file as plain text (don't parse, one task title per line).</span>"))
                                        .children(),
                        footer: [
                            {
                                text: "Import to Tasks",
                                style: "btn-primary",
                                dismiss: true,
                                callback: function(e) {
                                    process(file, true, noParseCheck.prop("checked"));
                                }
                            }, {
                                text: "Import to Done",
                                style: "btn-primary",
                                dismiss: true,
                                callback: function(e) {
                                    process(file, false, noParseCheck.prop("checked"));
                                }
                            }, {
                                text: "Cancel",
                                style: "btn-default",
                                dismiss: true
                            }
                        ]
                    }).on("hidden.bs.modal", function(e) {
                        $("#modalImportType").removeData("file");
                        $("#modalImportType").removeData("process");
                        $("#modalImportTypeNoParse").prop("checked", false);
                    });
                }
            // can't do anything with it
            } else {
                UI.modal({
                    title: "Import",
                    body: "<p>This file doesn't appear to be a valid text file.</p>"
                });
            }
        }
    });
    // turn tag field in add task window into a tag editor field
    $("#modalAddTags, #modalEditTags").tagsInput({
        defaultText: "Add...",
        // override size to use Bootstrap CSS
        height: "auto",
        width: "auto"
    });
    // re-apply Bootstrap control theme
    setTimeout(function() {
        $("#modalAddTags_tagsinput").addClass("form-control"); 
        $("#modalEditTags_tagsinput").addClass("form-control"); 
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
            // if no due date set, set it to today
            if ($("#modalAddDuePreset").val() === "none") {
                $("#modalAddDuePreset").val("today").trigger("change");
            }
        }
    });
    // toggle between all fields, quick add or multi add on add task window
    var addLayoutSwitch = function(layout) {
        // map dropdown options to blocks
        var blocks = ["#modalAddFields", "#modalAddQuick", "#modalAddMulti"];
        $("#modalAddToggleFields, #modalAddToggleQuick, #modalAddToggleMulti").each(function(index, item) {
            var show = (this.id === layout);
            if (show) {
                $("#modalAddToggleText").html(this.innerHTML + "&nbsp;");
            }
            $(blocks[index]).prop("style").display = (show ? "block" : "none");
        });
    };
    // update from default layout setting on show
    $("#modalAdd").on("show.bs.modal", function(e) {
        addLayoutSwitch("modalAddToggle" + DoX.settings.addTaskDefaultLayout.toSentenceCase());
    });
    // update when a new selection is made
    $("#modalAddToggleFields, #modalAddToggleQuick, #modalAddToggleMulti").on("click", function(e) {
        addLayoutSwitch(this.id);
    });
    // handler for confirming add task window
    var addNewTask = function() {
        var task;
        // using all fields
        if ($("#modalAddFields").prop("style").display !== "none") {
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
                    params.due.date.setDate(params.due.date.getDate() + 7);
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
                params.due.date.setHMS(0, 0, 0, 0);
            }
            // use preset values for repeat
            switch ($("#modalAddRepeatPreset").val()) {
                case "none":
                    params.repeat = false;
                    break;
                case "day":
                    params.repeat.days = 1;
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
            // if valid, add the task
            if (task) {
                DoX.addTask(task);
            }
        // using quick add
        } else if ($("#modalAddQuick").prop("style").display !== "none") {
            // use the Task constructor to parse
            task = new Task($("#modalAddString").val());
            // if valid, add the task
            if (task) {
                DoX.addTask(task);
            }
        // using multi editor
        } else if ($("#modalAddMulti").prop("style").display !== "none") {
            // split tasks by new line to get a list of strings
            var tasks = $("#modalAddLines").val().split("\n");
            var common = $("#modalAddCommon").val();
            // check at least one is valid
            var valid = 0;
            for (var x in tasks) {
                // ignore prototype methods
                if (tasks.hasOwnProperty(x)) {
                    // if not parsing, create a task from the common part, then override title
                    var noParse = $("#modalAddNoParse").prop("checked");
                    // add common part first, then override parameters with custom parts
                    var str = (common ? common : "") + " " + (noParse ? "" : tasks[x]);
                    // use the Task constructor to parse
                    var task = new Task(str);
                    // if valid, add the task
                    if (task) {
                        // replace title if no parse
                        if (noParse) {
                            task.title = tasks[x];
                        }
                        DoX.addTask(task);
                        valid++;
                    }
                }
            }
            // pass value to task
            task = valid
        }
        // if valid, save and close
        if (task) {
            // close add task window
            $("#modalAdd").modal("hide");
            // save and refresh the list
            DoX.saveTasks();
            UI.listRefresh();
            var opts = {
                type: "info",
                tag: "task",
                autoDismiss: 3000
            };
            if (typeof task === "object") {
                opts.message = "Added task <strong>" + UI.escape(task.title) + "</strong>.";
            } else {
                opts.message = "Added <strong>" + task + "</strong> task" + (task > 1 ? "s" : "") + ".";
            }
            UI.alerts.add(opts);
        }
    };
    // add when clicking on Add button
    $("#modalAddSave").on("click", addNewTask);
    // add when pressing Enter in the form
    $(["Fields", "Quick", "Multi"]).each(function(index, item) {
        $("#modalAdd" + item).on("submit", function(e) {
            addNewTask();
            e.preventDefault();
        });
    });
    // form reset handler on modal close
    $("#modalAdd").on("hidden.bs.modal", function(e) {
        // clear fields
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
        $("#modalAddLines").val("");
        $("#modalAddCommon").val("");
        // disable fields
        $("#modalAddDueDate").attr("disabled", "disabled");
        $("#modalAddDueTime").attr("disabled", "disabled");
        $("#modalAddRepeatDays").attr("disabled", "disabled");
        $("#modalAddRepeatFrom").attr("disabled", "disabled");
        // reset to field view
        $("#modalAddFields").prop("style").display = "block";
        $("#modalAddQuick, #modalAddMulti").prop("style").display = "none";
        $("#modalAddToggleText").html("All Fields&nbsp;");
    });
    // handler for updating due date/time on preset selection in edit task window
    $("#modalEditDuePreset").on("change", function(e) {
        var newDate = new Date();
        var val = this.value;
        // enable fields if custom enabled
        if (val === "custom") {
            $("#modalEditDueDate").removeAttr("disabled");
            $("#modalEditDueTime").removeAttr("disabled");
        } else {
            // no due date, clear fields
            if (val === "none") {
                $("#modalEditDueDate").val("");
                $("#modalEditDueTime").val("");
            } else {
                // include time in field
                if (val === "now") {
                    $("#modalEditDueTime").val(newDate.toISOString().substr(11, 8));
                } else {
                    // only use a date
                    $("#modalEditDueTime").val("");
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
                $("#modalEditDueDate").val(newDate.toISOString().substr(0, 10));
            }
            // disable fields (handled by preset instead)
            $("#modalEditDueDate").attr("disabled", "disabled");
            $("#modalEditDueTime").attr("disabled", "disabled");
        }
    });
    // handler for updating repeat days on preset selection in edit task window
    $("#modalEditRepeatPreset").on("change", function(e) {
        var val = this.value;
        // no repeat, clear field and disable options
        if (val === "none") {
            $("#modalEditRepeatDays").val("");
            $("#modalEditRepeatFrom").attr("disabled", "disabled");
        } else {
            // some repeat option, enable from selector
            $("#modalEditRepeatFrom").removeAttr("disabled");
            // custom days, enable days field
            if (val === "custom") {
                $("#modalEditRepeatDays").removeAttr("disabled");
            } else {
                // disable field (handled by preset instead)
                $("#modalEditRepeatDays").attr("disabled", "disabled");
                // set days from preset
                if (val === "day") {
                    $("#modalEditRepeatDays").val("1");
                } else if (val === "week") {
                    $("#modalEditRepeatDays").val("7");
                } else if (val === "fortnight") {
                    $("#modalEditRepeatDays").val("14");
                }
            }
            // if no due date set, set it to today
            if ($("#modalEditDuePreset").val() === "none") {
                $("#modalEditDuePreset").val("today").trigger("change");
            }
        }
    });
    // handler for confirming edit task window
    $("#modalEditSave").on("click", function(e) {
        // fetch task
        var task = DoX.tasks[$("#modalEdit").data("id")];
        // update fields
        task.title = $("#modalEditTitle").val();
        task.desc = $("#modalEditDesc").val();
        task.due = {
            date: new Date(),
            time: false
        };
        task.repeat = {
            days: 1,
            fromDue: $("#modalEditRepeatFrom").val() === "due"
        };
        task.pri = parseInt($("#modalEditPri").val());
        task.tags = $("#modalEditTags").val() === "" ? [] : $("#modalEditTags").val().split(",");
        // use preset values for due date
        switch ($("#modalEditDuePreset").val()) {
            case "none":
                task.due = false;
                break;
            case "now":
                task.due.time = true;
                break;
            case "yesterday":
                task.due.date.setDate(task.due.date.getDate() - 1);
                break;
            case "tomorrow":
                task.due.date.setDate(task.due.date.getDate() + 1);
                break;
            case "week":
                task.due.date.setDate(task.due.date.getDate() + 7);
                break;
            case "custom":
                // custom due date, read fields
                task.due.date = new Date($("#modalEditDueDate").val() + " " + $("#modalEditDueTime").val());
                // !! converts to boolean (true if value is truthy)
                task.due.time = !!$("#modalEditDueTime").val();
                break;
        }
        // due date but no time
        if (task.due && !task.due.time) {
            // clear time values
            task.due.date.setHMS(0, 0, 0, 0);
        }
        // use preset values for repeat
        switch ($("#modalEditRepeatPreset").val()) {
            case "none":
                task.repeat = false;
                break;
            case "day":
                task.repeat.days = 1;
                break;
            case "week":
                task.repeat.days = 7;
                break;
            case "fortnight":
                task.repeat.days = 14;
                break;
            case "custom":
                // custom due date, read field
                task.repeat.days = parseInt($("#modalEditRepeatDays").val());
                if (task.repeat.days < 1) {
                    task.repeat = false;
                }
                break;
        }
        // close edit task window
        $("#modalEdit").modal("hide");
        // save and refresh the list
        DoX.saveTasks();
        UI.listRefresh();
        UI.alerts.add({
            message: "Updated task <strong>" + UI.escape(task.title) + "</strong>.",
            type: "warning",
            tag: "task",
            autoDismiss: 3000
        });
    });
    // form reset handler on modal close
    $("#modalEdit").on("hidden.bs.modal", function(e) {
        // clear fields
        $("#modalEditTitle").val("");
        $("#modalEditDesc").val("");
        $("#modalEditPri").val("0");
        $("#modalEditDuePreset").val("none");
        $("#modalEditDueDate").val("");
        $("#modalEditDueTime").val("");
        $("#modalEditRepeatPreset").val("none");
        $("#modalEditRepeatDays").val("");
        $("#modalEditRepeatFrom").val("completion");
        $("#modalEditTags").importTags("");
        // disable fields
        $("#modalEditDueDate").attr("disabled", "disabled");
        $("#modalEditDueTime").attr("disabled", "disabled");
        $("#modalEditRepeatDays").attr("disabled", "disabled");
        $("#modalEditRepeatFrom").attr("disabled", "disabled");
        // clear data attribute
        $("#modalEdit").removeData("id");
    });
    // prefill user settings on modal show
    $("#modalSettings").on("show.bs.modal", function(e) {
        $("#optAddTaskDefaultLayout").val(DoX.settings.addTaskDefaultLayout);
        $("#optTaskTableRowHighlight").val(DoX.settings.taskTableRowHighlight);
    });
    // handler for updating settings
    $("#modalSettingsSave").on("click", function(e) {
        DoX.settings = {
            addTaskDefaultLayout: $("#optAddTaskDefaultLayout").val(),
            taskTableRowHighlight: $("#optTaskTableRowHighlight").val()
        };
        DoX.saveSettings();
        UI.listRefresh();
        $("#modalSettings").modal("hide");
    });
    // prefill export data on modal show
    $("#modalExport").on("show.bs.modal", function(e) {
        Task.showIDs = false;
        $("#edtExportTasks").val(DoX.tasks.join("\n"));
        $("#edtExportDone").val(DoX.done.join("\n"));
        Task.showIDs = true;
    });
    // show/hide IDs on checkbox toggle
    $("#modalExportIDs").on("click", function(e) {
        Task.showIDs = this.checked;
        $("#edtExportTasks").val(DoX.tasks.join("\n"));
        $("#edtExportDone").val(DoX.done.join("\n"));
        Task.showIDs = true;
    });
    // reset show IDs checkbox
    $("#modalExport").on("hidden.bs.modal", function(e) {
        $("#modalExportIDs").prop("checked", false);
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
    // if local storage available
    if (Store.has) {
        // no data yet, show first run dialog
        if (typeof Store.get("settings") === "undefined") {
            DoX.settings = {};
            Store.set("taskCount", "0");
            Store.set("doneCount", "0");
            UI.listRefresh();
            $("#modalFirstRun").modal("show");
        // load from storage and pre-fill task list
        } else {
            DoX.loadSettings();
            DoX.loadTasks();
            UI.listRefresh();
        }
        // merge unset or new setting defaults
        DoX.settings = $.extend({}, {
            addTaskDefaultLayout: "fields",
            taskTableRowHighlight: "none"
        }, DoX.settings);
        DoX.saveSettings();
    // if not, warn about no saving
    } else {
        UI.alerts.add({
            message: "<strong>Warning:</strong> local storage is not available in your browser.  You will not be able to save any tasks locally.", 
            type: "danger",
            tag: "store"
        });
    }
    // register network status change events
    $(window).on("online offline", function(e) {
        UI.alerts.clear("network");
        var opts = {
            type: e.type === "online" ? "success" : "info",
            tag: network
        };
        if (e.type === "online") {
            opts.message = "<strong>Just a heads up:</strong> your internet connection has been restored, and you can continue to work on your tasks as normal.";
        } else {
            opts.message = "<strong>Just a heads up:</strong> you don't seem to be connected to the internet any more.  No worries, you can just continue to work on your tasks right here.";
        }
        UI.alerts.add(opts);
    });
});
// Task object constructor
function Task(params) {
    // skeleton task
    var opts = {
        id: null,
        title: "",
        desc: "",
        pri: 0,
        due: false,
        repeat: false,
        tags: []
    };
    switch (typeof params) {
        // passed a DoX string, need to parse
        case "string":
            // shlex parse the string
            var args = params.shlex();
            // if invalid, end here
            if (!args) {
                return false;
            }
            // first generic parameter regarded as task title
            needTitle = true;
            for (var x in args) {
                // ignore prototype methods
                if (args.hasOwnProperty(x)) {
                    var arg = args[x];
                    // $ identifier (hex)
                    if (arg.match(/^\$[0-9a-f]{5}$/)) {
                        opts.id = arg.substr(1);
                    // ~ description
                    } else if (arg[0] === "~" && arg.length > 1) {
                        opts.desc = arg.substr(1).replace(/\|/g, "\n");
                    // ! priority (numerical)
                    } else if (arg.match(/^![0-3]$/)) {
                        opts.pri = parseInt(arg[1]);
                    // ! priority (bang)
                    } else if (arg.match(/!{1,3}$/)) {
                        opts.pri = arg.length;
                    // 0 (zero) priority
                    } else if (arg === "0") {
                        opts.pri = 0;
                    // @ due date
                    } else if (arg[0] === "@" && arg.length > 1) {
                        var keywords = arg.substr(1).toLowerCase().split("|");
                        if (keywords.length === 1) {
                            keywords.push("");
                        }
                        // parse date/time keywords
                        opts.due = Task.parseDue(keywords);
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
                            opts.repeat = {
                                days: days,
                                fromDue: fromDue
                            };
                        }
                    // # tags
                    } else if (arg[0] === "#" && arg.length > 1) {
                        tag = arg.substr(1);
                        if (!opts.tags.has(tag.toLowerCase(), true)) {
                            opts.tags.push(tag);
                        }
                    // generic
                    } else if (needTitle) {
                        opts.title = arg;
                        needTitle = false;
                    }
                }
            }
            // can't repeat without due date
            if (opts.repeat && !opts.due) {
                opts.due = {
                    date: new Date(),
                    time: false
                };
                opts.due.date.setHMS(0, 0, 0, 0);
            }
            break;
        // a full or partial params object, use extend to merge
        case "object":
            $.extend(opts, params);
            break;
        // ignore all other types, just create a blank task
    }
    // generate ID if not set
    if (!opts.id) {
        var tasks = DoX.tasks.concat(DoX.done);
        // list of IDs in use
        var used = [];
        for (var x in tasks) {
            if (tasks[x].id && !used.has(tasks[x].id)) {
                used.push(tasks[x].id);
            }
        }
        opts.id = DoX.newID();
        while (used.has(opts.id)) {
            opts.id = newID();
        }
    }
    // set new fields
    this.id = opts.id;
    this.title = opts.title;
    this.desc = opts.desc;
    this.pri = opts.pri;
    this.due = opts.due;
    this.repeat = opts.repeat;
    this.tags = opts.tags;
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
        if (Task.showIDs && this.id) {
            args.push("$" + this.id);
        }
        // return formatted string
        return args.join(" ");
    }
}
// include IDs in toString() output
// - outside of prototype to apply it to constructor rather than instance
Task.showIDs = true;
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
    today.setHMS(0, 0, 0, 0);
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
                        thisDate.setMonth(parts[1] - 1);
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
                thisDate.setHMS(thisTime.getHours(), thisTime.getMinutes(), thisTime.getSeconds());
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
    // dictionary of user settings
    this.settings = {};
    // shorthand to defaulting a variable
    function def(val, alt) {
        return typeof val === "undefined" ? alt : val;
    }
    // save settings to local storage
    this.saveSettings = function saveSettings() {
        Store.set("settings", JSON.stringify(this.settings));
    };
    // load settings from local storage
    this.loadSettings = function saveSettings() {
        this.settings = JSON.parse(Store.get("settings"));
    };
    // add a new task to the list
    this.addTask = function addTask(task) {
        this.tasks.push(task);
    };
    // (un)mark a task as complete
    this.doneTask = function doneTask(pos, isTasks) {
        isTasks = def(isTasks, true);
        if (isTasks) {
            // remove task at position from tasks, 
            var task = this.tasks.splice(pos, 1)[0];
            // schedule a repeat
            if (task.repeat) {
                taskCopy = $.extend({}, task);
                // repeat from today
                if (!taskCopy.repeat.fromDue) {
                    taskCopy.due.date = new Date();
                    taskCopy.due.date.setHMS(task.due.date.getHours(), task.due.date.getMinutes(), task.due.date.getSeconds());
                }
                taskCopy.due.date.setDate(taskCopy.due.date.getDate() + task.repeat.days);
                // remove original task ID (will receive a new one)
                task.id = null;
                // cancel repeat on original task (in case of undo)
                task.repeat = false;
                // append to done
                this.tasks.push(taskCopy);
            }
            // append to done
            this.done.push(task);
            // fix IDs (in case of task repeat)
            this.fixIDs();
        } else {
            // remove task at position from done, append to tasks
            this.tasks.push(this.done.splice(pos, 1)[0]);
        }
    };
    // move a task to a different position
    this.moveTask = function moveTask(pos, newPos, isTasks) {
        isTasks = def(isTasks, true);
        var tasks = (isTasks ? this.tasks : this.done);
        // remove task and re-insert at given position
        tasks.splice(newPos, 0, tasks.splice(pos, 1)[0]);
    };
    // delete a task
    this.deleteTask = function deleteTask(pos, isTasks) {
        isTasks = def(isTasks, true);
        // remove task at position from tasks/done
        (isTasks ? this.tasks : this.done).splice(pos, 1);
    };
    // save tasks to local storage
    this.saveTasks = function saveTasks() {
        Store.clear();
        Store.set("taskCount", this.tasks.length);
        Store.set("doneCount", this.done.length);
        $(this.tasks).each(function(index, item) {
            Store.set("task" + index, item);
        });
        $(this.done).each(function(index, item) {
            Store.set("done" + index, item);
        });
        // restore setting key
        this.saveSettings();
    };
    // load tasks from local storage
    this.loadTasks = function loadTasks() {
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
        var tasks = this.tasks.concat(this.done);
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
            toGen[x].id = this.newID();
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
        $("#listTasks tbody").children().remove();
        // anonymous function to avoid scoping issue on this.tab
        (function(tasks, ui) {
            // user has tasks, display them
            if (tasks.length) {
                // write header row
                var columns = ["#", "Task", "Priority", "Due"];
                if (ui.tab === "tasks") {
                    columns.push("Repeat");
                }
                columns.push("Tags", "Controls");
                var header = $("<tr class='active'/>");
                $(columns).each(function(index, item) {
                    var cell = $("<th>" + item + "</th>");
                    if (item === "#") {
                        cell.prop("style").width = "40px";
                    } else if (item === "Controls") {
                        cell.prop("style").width = (ui.tab === "tasks" ? "222px" : "122px");
                    }
                    header.append(cell);
                });
                $("#listTasks").append(header);
                $(tasks).each(function(index, item) {
                    var task = item;
                    var row = $("<tr/>");
                    // style row according to row highlight setting
                    var highlights = ["success", "warning", "danger"];
                    var prop = -1;
                    switch (DoX.settings.taskTableRowHighlight) {
                        case "pri":
                            prop = task.pri - 1;
                            break;
                        case "due":
                            if (task.due) {
                                var now = new Date();
                                if (!task.due.time) {
                                    now.setHMS(0, 0, 0, 0);
                                }
                                if (now > task.due.date) {
                                    prop = 2;
                                } else {
                                    if (Math.floor((task.due.date - now) / (1000 * 60 * 60 * 24)) <= 1) {
                                        prop = 1;
                                    } else {
                                        prop = 0;
                                    }
                                }
                            } else {
                                prop = -1;
                            }
                            break;
                    }
                    if (prop >= 0) {
                        row.addClass("row-" + highlights[prop]);
                    }
                    row.append($("<td>" + (index + 1) + "</td>"));
                    var title = $("<td>" + ui.escape(task.title) + " </td>");
                    // if task has a description, show details button
                    if (task.desc) {
                        var btnDetails = $("<button class='btn btn-xs btn-default'>...</button>");
                        btnDetails.on("click", function(e) {
                            $("#listTasksDesc" + index).prop("style").display = ($("#listTasksDesc" + index).prop("style").display === "table-row") ? "none" : "table-row";
                        });
                        title.append(btnDetails);
                    }
                    row.append(title);
                    row.append($("<td>" + task.pri + "</td>"));
                    row.append($("<td>" + (task.due ? task.formatDue() : "<em>None</em>") + "</td>"));
                    if (ui.tab === "tasks") {
                        row.append($("<td>" + (task.repeat ? task.formatRepeat() : "<em>None</em>") + "</td>"));
                    }
                    row.append($("<td>" + (task.tags.length > 0 ? task.tags.join(", ") : "<em>None</em>") + "</td>"));
                    var controls = $("<td/>");
                    // button to mark as done (green) or undo (white)
                    var btnDone = $("<button class='btn btn-xs'>" + (ui.tab === "tasks" ? "Done" : "Undo") + "</button>");
                    btnDone.addClass(ui.tab === "tasks" ? "btn-success" : "btn-default");
                    btnDone.on("click", function(e) {
                        DoX.doneTask(index, ui.tab === "tasks");
                        DoX.saveTasks();
                        ui.listRefresh();
                        var opts = {
                            type: ui.tab === "tasks" ? "success" : "warning",
                            tag: "task",
                            autoDismiss: 3000
                        };
                        if (ui.tab === "tasks") {
                            opts.message = "Marked task <strong>" + ui.escape(DoX.done[DoX.done.length - 1].title) + "</strong> as complete.  Well done!";
                        } else {
                            opts.message = "Unmarked task <strong>" + ui.escape(DoX.tasks[DoX.tasks.length - 1].title) + "</strong> as complete.  Oh...";
                        }
                        ui.alerts.add(opts);
                    });
                    controls.append(btnDone);
                    // edit button if not yet marked complete
                    if (ui.tab === "tasks") {
                        var btnEdit = $("<button class='btn btn-xs btn-warning'>Edit</button>");
                        btnEdit.on("click", function(e) {
                            $("#modalEdit").data("id", index);
                            $("#modalEditTitle").val(task.title);
                            $("#modalEditDesc").val(task.desc);
                            $("#modalEditPri").val(task.pri);
                            if (task.due) {
                                if (task.due.time) {
                                    $("#modalEditDuePreset").val("custom");
                                    $("#modalEditDueDate").val(task.due.date.format("yyyy-mm-dd"));
                                    $("#modalEditDueTime").val(task.due.date.format("HH:MM:SS"));
                                    $("#modalEditDueDate").removeAttr("disabled");
                                    $("#modalEditDueTime").removeAttr("disabled");
                                } else {
                                    var today = new Date();
                                    today.setHMS(0, 0, 0, 0);
                                    var offset = (task.due.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
                                    switch (offset) {
                                        case 0:
                                            $("#modalEditDuePreset").val("today");
                                            break;
                                        case -1:
                                            $("#modalEditDuePreset").val("yesterday");
                                            break;
                                        case 1:
                                            $("#modalEditDuePreset").val("tomorrow");
                                            break;
                                        case 7:
                                            $("#modalEditDuePreset").val("week");
                                            break;
                                        default:
                                            $("#modalEditDuePreset").val("custom");
                                            $("#modalEditDueDate").val(task.due.date.format("yyyy-mm-dd"));
                                            $("#modalEditDueDate").removeAttr("disabled");
                                            $("#modalEditDueTime").removeAttr("disabled");
                                            break;
                                    }
                                }
                            }
                            if (task.repeat) {
                                switch (task.repeat.days) {
                                    case 1:
                                        $("#modalEditRepeatPreset").val("day");
                                        break;
                                    case 7:
                                        $("#modalEditRepeatPreset").val("week");
                                        break;
                                    case 14:
                                        $("#modalEditRepeatPreset").val("fortnight");
                                        break;
                                    default:
                                        $("#modalEditRepeatPreset").val("custom");
                                        $("#modalEditRepeatDays").removeAttr("disabled");
                                        break;
                                }
                                $("#modalEditRepeatDays").val(task.repeat.days);
                                if (task.repeat.fromDue) {
                                    $("#modalEditRepeatFrom").val("due");
                                }
                                $("#modalEditRepeatFrom").removeAttr("disabled");
                            }
                            $("#modalEditTags").importTags(task.tags.join(","));
                            $("#modalEdit").modal("show");
                        });
                        controls.append(btnEdit);
                        // move button/menu
                        var drpMove = $("<span class='dropdown'/>");
                        var btnMove = $("<button class='btn btn-xs btn-default dropdown-toggle' data-toggle='dropdown'>Move <span class='caret'></span></button>");
                        var mnuMove = $("<ul class='dropdown-menu' role='menu'/>");
                        var items = [["Top", 0], ["Up", index - 1], ["Down", index + 1], ["Bottom", DoX.tasks.length - 1]];
                        $.each(items, function(subIndex, subItem) {
                            var wrap = $("<li/>");
                            var link = $("<a>" + subItem[0] + "</a>");
                            link.on("click", function(e) {
                                DoX.moveTask(index, subItem[1]);
                                ui.listRefresh();
                            });
                            wrap.append(link);
                            mnuMove.append(wrap);
                        });
                        drpMove.append(btnMove);
                        drpMove.append(mnuMove);
                        controls.append(drpMove);
                        btnMove.dropdown();
                    }
                    // delete button
                    var btnDelete = $("<button class='btn btn-xs btn-danger'>Delete</button>");
                    btnDelete.on("click", function(e) {
                        var title = (ui.tab === "tasks" ? DoX.tasks : DoX.done)[index].title;
                        DoX.deleteTask(index, ui.tab === "tasks");
                        DoX.saveTasks();
                        ui.listRefresh();
                        ui.alerts.add({
                            message: "Deleted task <strong>" + ui.escape(title) + "</strong>.  Oh...",
                            type: "danger",
                            tag: "task",
                            autoDismiss: 3000
                        });
                    });
                    controls.append(btnDelete);
                    row.append(controls);
                    $("#listTasks").append(row);
                    // if task has a description, add description row
                    if (task.desc) {
                        var descRow = $("<tr id='listTasksDesc" + index + "' style='display: none;'/>");
                        var linkRegExp = /(([a-z]+:\/\/)?([a-z\-\+]+\.)+[a-z]{2,6}([\/#?]\S*[^\.,\s\[\]\(\)]))*/g;
                        descRow.append($("<td colspan='7'/>").html(ui.escape(task.desc).replace(linkRegExp, "<a href=\"$1\">$1</a>")));
                        $("#listTasks").append(descRow);
                    }
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
    // shorthand to escape HTML entities
    this.escape = function escape(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
    };
    // method for creating on-the-fly Bootstrap modal dialogs
    this.modal = function modal(params) {
        // default modal options
        var opts = {
            header: true,
            footer: [{
                text: "Ok",
                style: "btn-primary",
                dismiss: true,
                callback: false
            }],
            close: true,
            title: "",
            body: "",
            options: {}
        };
        // apply parameters
        $.extend(opts, params);
        // start making the modal
        var root = $("<div class='modal fade'/>");
        var dialog = $("<div class='modal-dialog'>");
        var content = $("<div class='modal-content'/>");
        // show a header
        if (opts.header) {
            var header = $("<div class='modal-header'/>");
            // show a close button
            if (opts.close) {
                header.append("<button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button>");
            }
            // add title
            header.append("<h4 class='modal-title'>" + opts.title + "</h4>");
            content.append(header);
        }
        // add body
        var body = $("<div class='modal-body'/>");
        body.append(opts.body);
        content.append(body);
        // show a footer
        if (opts.footer && opts.footer.length) {
            var footer = $("<div class='modal-footer'/>");
            // add buttons to the footer
            $.each(opts.footer, function(index, item) {
                var button = $("<button type='button' class='btn'>" + item.text + "</button>");
                // custom button class
                if (item.style) {
                    button.addClass(item.style);
                }
                // dismiss modal on click
                if (item.dismiss) {
                    button.attr("data-dismiss", "modal");
                }
                // custom callback
                if (item.callback) {
                    button.on("click", item.callback);
                }
                // add footer
                footer.append(button);
            });
            content.append(footer);
        }
        // create modal
        dialog.append(content);
        root.append(dialog);
        root.modal(opts.options);
        root.on("hidden.bs.modal", function(e) {
            root.remove();
        });
        return root;
    };
    // subclass for managing Bootstrap alerts
    this.alerts = {
        // add an alert to the notification box
        add: function add(opts) {
            var alert = $("<div class='alert alert-dismissable fade in'>");
            // add class if defined
            if (opts.type) {
                alert.addClass("alert-" + opts.type);
            }
            // add tag and clear existing if defined
            if (opts.tag) {
                $(".notif-" + opts.tag).remove();
                alert.addClass("notif-" + opts.tag);
            }
            // default to true if undefined
            if (opts.dismissable !== false) {
                alert.append($("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>"));
            }
            // auto-dismiss after given time if specified
            if (opts.autoDismiss) {
                setTimeout(function() {
                    alert.alert("close");
                }, opts.autoDismiss);
            }
            alert.append($("<span/>").append(opts.message));
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
    this.has = ("localStorage" in window && window.localStorage !== null);
    // make a pseudo-storage object if local storage not available
    if (!this.has) {
        window.localStorage = {};
    }
    // store something in local storage
    this.set = function set(key, value) {
        return window.localStorage[key] = value.toString();
    }
    // retrieve something from local storage
    this.get = function get(key) {
        return window.localStorage[key];
    }
    // retrieve all items
    this.all = function all() {
        return window.localStorage;
    }
    // delete something in local storage
    this.del = function del(key) {
        return delete window.localStorage[key];
    }
    // delete all items
    this.clear = function clear() {
        if (this.has) {
            return window.localStorage.clear();
        } else {
            window.localStorage = {};
        }
    }
})();
