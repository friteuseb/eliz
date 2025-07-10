<?php

// Configuration
$apiUrl = 'https://nlpservice.semantic-suggestion.com/api/batch_similarity';
$method = 'cosine';

// Fonction pour simuler les données de pages
function generateSamplePageData($count) {
    $sampleData = [];
    for ($i = 0; $i < $count; $i++) {
        $sampleData[] = [
            'title' => "Exemple de titre " . ($i + 1),
            'content' => "Ceci est un exemple de contenu pour la page " . ($i + 1) . ". Il contient des informations variées pour tester la similarité.",
        ];
    }
    return $sampleData;
}

// Générer des données d'exemple
$pages = generateSamplePageData(5);

// Préparer les paires de textes
$textPairs = [];
for ($i = 0; $i < count($pages); $i++) {
    for ($j = $i + 1; $j < count($pages); $j++) {
        $textPairs[] = [
            'text1' => $pages[$i]['title'] . ' ' . $pages[$i]['content'],
            'text2' => $pages[$j]['title'] . ' ' . $pages[$j]['content'],
        ];
    }
}

// Préparer les données pour l'API
$data = [
    'text_pairs' => array_map(function($pair) {
        return [
            'text1' => base64_encode($pair['text1']),
            'text2' => base64_encode($pair['text2'])
        ];
    }, $textPairs),
    'method' => $method
];

// Configurer cURL
$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

// Exécuter la requête
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

// Vérifier les erreurs
if (curl_errno($ch)) {
    echo 'Erreur cURL : ' . curl_error($ch) . "\n";
} else {
    echo "Code de réponse HTTP : " . $httpCode . "\n";
    echo "Réponse de l'API :\n";
    echo $response . "\n";
}

// Fermer la session cURL
curl_close($ch);