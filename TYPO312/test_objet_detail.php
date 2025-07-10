<?php

// --- Configuration ---
$apiKey = 'k7mrsOXH'; // Votre clé API
$projectId = 4324;   // Votre ID projet
$objectId = 5064942; // <<< ID de l'objet à tester (le restaurant)
// $objectId = 4745988; // <<< Ou testez l'ID de l'hôtel si besoin

// Endpoint API (Utilisation de l'endpoint de recherche)
$apiUrl = 'https://api.apidae-tourisme.com/api/v002/recherche/list-objets-touristiques';

// --- Champs Demandés ---
// Mêmes champs que dans fetchObjectById pour un test cohérent
$responseFields = [
    'id', 'nom', 'type',
    'localisation',                 // Adresse
    'localisation.geolocalisation', // GeoJson
    'localisation.latitude',        // Latitude
    'localisation.longitude',       // Longitude
    'illustrations',
    'presentation', // Inclut descriptifCourt et descriptifDetaille
    'informations', // Inclut moyensCommunication
    'ouverture',
    'informationsHotelleriePleinAir',
    'informationsRestauration',
    'informationsHotellerie',
    'prestations',
    // Ajoutez d'autres champs si vous en avez besoin dans la vue détail
];

// --- Préparation de la Requête ---
$queryData = [
    'apiKey'         => $apiKey,
    'projetId'       => $projectId,
    'identifiants'   => [$objectId],         // Recherche par ID spécifique
    'responseFields' => $responseFields, // Demande des champs spécifiques
];

$jsonQuery = json_encode($queryData);
if ($jsonQuery === false) {
    die("Erreur Encodage JSON: " . json_last_error_msg());
}

$urlEncodedJsonQuery = urlencode($jsonQuery);
$fullUrl = $apiUrl . '?query=' . $urlEncodedJsonQuery;

echo "--- Test API Apidae pour Objet ID: " . $objectId . " ---\n\n";
echo "URL Requête:\n" . $fullUrl . "\n\n";
echo "Données JSON envoyées (avant urlencode):\n" . json_encode($queryData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n\n";

// --- Exécution cURL ---
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $fullUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true); // Important: garder la vérification SSL
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'User-Agent: Standalone PHP Test Script'
]);

echo "--- Exécution cURL... ---\n";
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// --- Analyse de la Réponse ---
if ($curlError) {
    echo "\n!!! ERREUR cURL: " . $curlError . "\n";
    exit;
}

echo "Code HTTP retourné: " . $httpCode . "\n\n";
echo "--- Réponse Brute de l'API ---\n";
echo $response . "\n\n";

echo "--- Analyse de la Réponse JSON --- \n";
if ($httpCode == 200) {
    $data = json_decode($response, true); // Décode en tableau associatif
    if (json_last_error() === JSON_ERROR_NONE) {
        // Affiche la réponse décodée et formatée
        echo "Réponse décodée et formatée:\n";
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        echo "\n\n";

        // Vérification spécifique de la géolocalisation dans le premier objet retourné
        if (isset($data['objetsTouristiques'][0])) {
            $objectData = $data['objetsTouristiques'][0];
            echo "--- Vérification Géolocalisation dans l'objet retourné ---\n";
            if (isset($objectData['localisation']['geolocalisation'])) {
                echo "✅ Clé 'geolocalisation' trouvée.\nContenu:\n";
                print_r($objectData['localisation']['geolocalisation']);
            } elseif (isset($objectData['localisation']['latitude']) && isset($objectData['localisation']['longitude'])) {
                 echo "✅ Clés 'latitude'/'longitude' trouvées.\n";
                 echo "   Latitude: " . $objectData['localisation']['latitude'] . "\n";
                 echo "   Longitude: " . $objectData['localisation']['longitude'] . "\n";
            } else {
                echo "❌ Aucune clé 'geolocalisation', 'latitude' ou 'longitude' trouvée sous 'localisation'.\n";
            }
            echo "\nStructure complète de 'localisation':\n";
            print_r($objectData['localisation'] ?? 'Clé localisation absente');

        } else {
            echo "Aucun objet touristique ('objetsTouristiques') trouvé dans la réponse JSON.\n";
        }

    } else {
        echo "!!! Erreur décodage JSON de la réponse: " . json_last_error_msg() . "\n";
    }
} else {
    echo "!!! La requête API a échoué (Code HTTP non 200).\n";
}

?>
