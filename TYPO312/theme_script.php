<?php

// Définir le chemin vers votre installation TYPO3
define('PATH_site', __DIR__ . '/');
define('TYPO3_MODE', 'BE');

// Inclure le bootstrap TYPO3
require __DIR__ . '/typo3/sysext/core/Configuration/DefaultConfiguration.php';
require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/typo3conf/required.php';

use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use Cywolf\PageLinkInsights\Service\ThemeDataService;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Log\LogManager;

// Initialiser TYPO3
Bootstrap::init();

// ID de la page racine à analyser - AJUSTEZ SELON VOTRE SITE
$rootPageId = 1;

echo "=== Script d'analyse et de débogage des thèmes ===\n\n";

// Vérifier l'état actuel des tables
echo "Vérification des tables existantes...\n";
$connectionPool = GeneralUtility::makeInstance(ConnectionPool::class);

$tables = [
    'tx_pagelinkinsights_themes',
    'tx_pagelinkinsights_page_themes',
    'tx_pagelinkinsights_keywords'
];

foreach ($tables as $table) {
    try {
        $connection = $connectionPool->getConnectionForTable($table);
        $count = $connection->count('*', $table, []);
        echo "- Table $table : $count enregistrements\n";
    } catch (\Exception $e) {
        echo "- ERREUR avec la table $table : " . $e->getMessage() . "\n";
    }
}

// Nettoyer toutes les données thématiques
echo "\nNettoyage des tables de thèmes...\n";
foreach ($tables as $table) {
    try {
        $connection = $connectionPool->getConnectionForTable($table);
        $connection->truncate($table);
        echo "- Table $table vidée\n";
    } catch (\Exception $e) {
        echo "- ERREUR lors du nettoyage de $table : " . $e->getMessage() . "\n";
    }
}

// Obtenir le service d'analyse thématique
echo "\nDémarrage de l'analyse thématique pour la page racine $rootPageId...\n";
try {
    /** @var ThemeDataService $themeService */
    $themeService = GeneralUtility::makeInstance(ThemeDataService::class);
    
    // Analyser le contenu et stocker les thèmes
    $themeService->analyzePageContent($rootPageId);
    echo "Analyse thématique terminée avec succès.\n";
    
    // Vérifier les résultats
    echo "\nVérification des résultats :\n";
    foreach ($tables as $table) {
        $connection = $connectionPool->getConnectionForTable($table);
        $count = $connection->count('*', $table, []);
        echo "- Table $table : $count enregistrements\n";
    }
    
    // Récupérer les données de thèmes
    $themeData = $themeService->getThemesForSubtree($rootPageId);
    echo "\nDonnées de thèmes récupérées :\n";
    echo "- Thèmes : " . count($themeData['themes']) . "\n";
    echo "- Associations pages-thèmes : " . count($themeData['pageThemes']) . "\n";
    echo "- Mots-clés : " . count($themeData['keywords']) . "\n";
    
    // Afficher les 5 premiers thèmes
    if (!empty($themeData['themes'])) {
        echo "\nLes 5 premiers thèmes :\n";
        $i = 0;
        foreach ($themeData['themes'] as $theme) {
            if ($i >= 5) break;
            echo "- " . $theme['theme_name'] . " (poids: " . $theme['weight'] . ")\n";
            $i++;
        }
    } else {
        echo "\nAUCUN THÈME TROUVÉ !\n";
    }
    
    // Vérifier les associations pages-thèmes
    if (!empty($themeData['pageThemes'])) {
        echo "\nAssociations pages-thèmes :\n";
        foreach ($themeData['pageThemes'] as $pageId => $themes) {
            echo "- Page $pageId : " . count($themes) . " thème(s)\n";
            if (!empty($themes)) {
                echo "  Premier thème : " . $themes[0]['theme'] . " (relevance: " . $themes[0]['relevance'] . ")\n";
            }
        }
    } else {
        echo "\nAUCUNE ASSOCIATION PAGE-THÈME TROUVÉE !\n";
    }

} catch (\Exception $e) {
    echo "ERREUR CRITIQUE : " . $e->getMessage() . "\n";
    echo "Trace : \n" . $e->getTraceAsString() . "\n";
    
    // Vérifier les logs TYPO3
    echo "\nConsultez les logs TYPO3 pour plus de détails.\n";
}

echo "\n=== Fin du script ===\n";