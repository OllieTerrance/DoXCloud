function authSubmit(login) {
    if (!$("#authEmail").val()) {
        $("#infobar").html("<div class='infobar error'>You need to enter your email address.</div>");
        $("#authEmail").focus();
    } else if (!$("#authEmail").val().match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
        $("#infobar").html("<div class='infobar error'>Your email address seems incorrect.</div>");
        $("#authEmail").focus();
    } else if (!$("#authPass").val()) {
        $("#infobar").html("<div class='infobar error'>You need to enter your password.</div>");
        $("#authPass").focus();
    } else if ($("#authPass").val().length < 4) {
        $("#infobar").html("<div class='infobar error'>Your password is too short &ndash; make it at least 4 characters.</div>");
        $("#authPass").focus();
    } else {
        $("#authForm input").attr("disabled", "disabled");
        $("#infobar").html("<div class='infobar'>Just a second...</div>");
        $.ajax({
            url: "/api/auth.php",
            dataType: "json",
            method: "POST",
            data: {
                email: $("#authEmail").val(),
                pass: $("#authPass").val(),
                submit: login ? "login" : "register"
            },
            success: function(resp, status, obj) {
                if (resp.success) {
                    $("#infobar").html("<div class='infobar success'>" + resp.success + "</div>");
                    $(location).attr("href", ".");
                } else if (resp.error) {
                    $("#infobar").html("<div class='infobar error'>" + resp.error + "</div>");
                    $("#authForm input").removeAttr("disabled");
                    $("#authPass").focus();
                } else {
                    $("#infobar").html("<div class='infobar error'>Oops, something went wrong there...</div>");
                    $("#authForm input").removeAttr("disabled");
                    $("#authEmail").focus();
                }
            },
            error: function(obj, status, err) {
                $("#infobar").html("<div class='infobar error'>Oops, something went wrong there...</div>");
                $("#authForm input").removeAttr("disabled");
                $("#authEmail").focus();
            }
        });
    }
}
