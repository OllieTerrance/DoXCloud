<?
require("/home/pi/www/lib/keystore.php");
$conn = mysqli_connect(keystore("mysql", "db"), keystore("mysql", "user"), keystore("mysql", "pass"), "dox_cloud");
if ($_POST["submit"]) {
    $email = $_POST["email"];
    $pass = $_POST["pass"];
    $data = mysqli_query($conn, "SELECT * FROM `users` WHERE `email` = \"" . $email . "\";");
    $num = mysqli_num_rows($data);
    if ($_POST["submit"] === "login") {
        if ($num) {
            $row = mysqli_fetch_assoc($data);
            if (md5($pass) === $row["pass"]) {
                $success = "Awesome, you're now logged in!";
            } else {
                $error = "That password seems to be incorrect.";
            }
        } else {
            $error = "There doesn't seem to be an account registered with that email address.";
        }
    } elseif ($_POST["submit"] === "register") {
        if ($num) {
            $error = "There's already an account registered with that email address.";
        } else {
            if (mysqli_query($conn, "INSERT INTO `users` (`email`, `pass`) VALUES (\"" . $email . "\", \"" . md5($pass) . "\");")) {
                $success = "Boom, your account has been created!";
            } else {
                $error = "Oops, something went wrong there...";
            }
        }
    }
    if ($success) {
?>{ "success": "<? print($success); ?>" }<?
    } elseif ($error) {
?>{ "error": "<? print($error); ?>" }<?
    }
}
?>