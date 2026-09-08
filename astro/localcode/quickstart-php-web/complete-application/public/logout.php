<?php

logOut();

function logOut() {
    session_start();
    session_unset();
    session_destroy();
    header('Location: index.php');
    exit;
}
