<?php
// Use in the “Post-Receive URLs” section of your GitHub repo.
if ($_POST['payload']) {
    shell_exec("cd /home/datapedia/domains/datapedia.nl/public_html/test && git pull");
}
?>

