<?php
date_default_timezone_set('Europe/London');
        $dbname = "sqlite:../kohsteds/data/StEdsWalks.sdb";
        $db = new PDO($dbname, '', '', array(PDO::ATTR_PERSISTENT => false));
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $walks = $db->query('SELECT date as _id, time, region, organizer, map, area as venue FROM walkday WHERE date > "2019-01-01" ')->fetchAll(PDO::FETCH_ASSOC);

// print_r($walks);

foreach ($walks as &$walk) {
    $date = new DateTime($walk['_id']);
    $date2 = new DateTime($walk['_id']);
    $walk['lastCancel'] = $date->modify('-6 days')->setTime(23, 59)->format('Y-m-d H:i');
    $walk['firstBooking'] = $date2->modify('-6 weeks - 3 days')->format('Y-m-d');
    $walk['_id'] = 'W'.$walk['_id'];
    $walk['walkId'] = $walk['_id'];
    $walk['capacity'] = 51;
    $walk['bookings'] = (object)(array());
    $walk['fee'] = 8;
    $walk['type'] = 'walk';
}
    $body = json_encode(["docs"=>$walks]);
    file_put_contents("stedsWalks.json", $body);
