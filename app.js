console.log("app.js loaded");

// Future SPA routing logic will go here
// For example, using a library like React Router
// or a simple custom router.

// Placeholder for route handling functions:
// function handleNavigation(path) {
//   console.log("Navigating to:", path);
//   // Logic to render different components based on path
// }

// Vanilla JS for Child Profile Page - Placed before React logic
document.addEventListener('DOMContentLoaded', function() {
    const mockChildProfile = {
        id: '1',
        name: 'Alex Dupont',
        uniqueCode: 'XYZ123',
        feedbackEntries: [
            { intervenant: 'Prof. A', text: 'Bonne participation en classe.', timestamp: new Date().toLocaleDateString() },
            { intervenant: 'Dr. B', text: 'Progrès notables en séance.', timestamp: new Date().toLocaleDateString() }
        ]
    };
    const mockChildProfile2 = {
        id: '2',
        name: 'Samira Petit',
        uniqueCode: 'ABC789',
        feedbackEntries: [
            { intervenant: 'Educ. C', text: 'A bien suivi la routine du matin.', timestamp: new Date().toLocaleDateString() }
        ]
    };
    const mockProfiles = [mockChildProfile, mockChildProfile2];
    let currentProfile = mockChildProfile; // Profile to display by default

    // DOM Elements
    const childNameDisplay = document.getElementById('child-name-display');
    const childCodeDisplay = document.getElementById('child-code-display');
    const feedbackList = document.getElementById('feedback-list');
    const feedbackForm = document.getElementById('feedback-form');
    const feedbackTextarea = document.getElementById('feedback-text');
    const childSearchForm = document.getElementById('child-search-form');
    const searchChildCodeInput = document.getElementById('search-child-code');
    // It's good to have a place for search error messages
    const searchFormContainer = childSearchForm.parentElement; // Assuming form is within a section or div
    let searchErrorMessageP = document.getElementById('search-error-message');
    if (!searchErrorMessageP) {
        searchErrorMessageP = document.createElement('p');
        searchErrorMessageP.id = 'search-error-message';
        searchErrorMessageP.style.color = 'red';
        // Insert after the search form
        childSearchForm.parentNode.insertBefore(searchErrorMessageP, childSearchForm.nextSibling);
    }


    function renderFeedbackList(entries) {
        if (!feedbackList) return;
        feedbackList.innerHTML = ''; // Clear existing items
        entries.forEach(entry => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<strong>${entry.intervenant}:</strong> ${entry.text} <em>(${entry.timestamp})</em>`;
            feedbackList.appendChild(listItem);
        });
    }

    function displayChildProfile(profile) {
        if (!profile) return;
        if (childNameDisplay) childNameDisplay.textContent = profile.name;
        if (childCodeDisplay) childCodeDisplay.textContent = profile.uniqueCode;
        if (feedbackList) renderFeedbackList(profile.feedbackEntries);
    }

    // Event Listener for Feedback Form
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const text = feedbackTextarea.value.trim();
            if (text && currentProfile) {
                const newEntry = {
                    intervenant: 'Utilisateur Actuel (mock)', // Placeholder
                    text: text,
                    timestamp: new Date().toLocaleDateString()
                };
                currentProfile.feedbackEntries.push(newEntry);
                renderFeedbackList(currentProfile.feedbackEntries);
                feedbackTextarea.value = ''; // Clear textarea
            }
        });
    }

    // Event Listener for Child Search Form
    if (childSearchForm) {
        childSearchForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const searchCode = searchChildCodeInput.value.trim().toUpperCase();
            const foundProfile = mockProfiles.find(profile => profile.uniqueCode.toUpperCase() === searchCode);

            if (foundProfile) {
                currentProfile = foundProfile;
                displayChildProfile(currentProfile);
                searchErrorMessageP.textContent = ''; // Clear error message
                searchChildCodeInput.value = ''; // Clear search input
            } else {
                searchErrorMessageP.textContent = 'Aucun profil trouvé avec ce code.';
            }
        });
    }

    // Initial display
    // Ensure elements exist before trying to display profile (important if this script runs before full DOM load)
    if (childNameDisplay && childCodeDisplay && feedbackList) {
         displayChildProfile(currentProfile);
    }
});

const { useState, useEffect } = React;

const ABA_TOKEN_ECONOMIES_KEY = 'abaTokenEconomies';
const ABA_CURRENT_ECONOMY_ID_KEY = 'abaCurrentEconomyId';

// Composant pour la page de sélection des économies
const TokenEconomySelectionPage = ({ tokenEconomies, setCurrentEconomyId, addTokenEconomy, navigateToApp }) => {
  const selectEconomy = (economyId) => {
    setCurrentEconomyId(economyId);
    navigateToApp();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            🌟 Choisir une Économie de Jetons 🌟
          </h1>
          <p className="text-white text-lg">
            Sélectionnez une économie existante ou créez-en une nouvelle
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Économies existantes */}
          {tokenEconomies.map(economy => (
            <div
              key={economy.id}
              onClick={() => selectEconomy(economy.id)}
              className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl cursor-pointer hover:scale-105 transition-all duration-200"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">{economy.selectedEmoji}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{economy.name}</h3>
                <p className="text-gray-600 mb-2">Objectif: {economy.goal} jetons</p>
                <p className="text-gray-600 mb-4">Gagnés: {economy.earnedTokens}/{economy.goal}</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((economy.earnedTokens / economy.goal) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {economy.rewardActivity || 'Aucune activité définie'}
                </p>
              </div>
            </div>
          ))}

          {/* Bouton pour ajouter une nouvelle économie */}
          <div
            onClick={addTokenEconomy}
            className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 shadow-2xl cursor-pointer hover:scale-105 transition-all duration-200 border-4 border-dashed border-white/50"
          >
            <div className="text-center text-white h-full flex flex-col justify-center">
              <div className="text-6xl mb-4">➕</div>
              <h3 className="text-xl font-bold mb-2">Nouvelle Économie</h3>
              <p className="text-sm">Créer une nouvelle économie de jetons</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ABATokenApp = () => {
  const [tokens, setTokens] = useState([
    { id: 1, color: '#FF6B6B', label: 'Rouge', inBasket: true },
    { id: 2, color: '#4ECDC4', label: 'Bleu', inBasket: true },
    { id: 3, color: '#45B7D1', label: 'Cyan', inBasket: true },
    { id: 4, color: '#96CEB4', label: 'Vert', inBasket: true },
    { id: 5, color: '#FFEAA7', label: 'Jaune', inBasket: true },
    { id: 6, color: '#DDA0DD', label: 'Violet', inBasket: true },
    { id: 7, color: '#FFB347', label: 'Orange', inBasket: true },
    { id: 8, color: '#FF69B4', label: 'Rose', inBasket: true }
  ]);
  
  const [draggedToken, setDraggedToken] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // State for multiple token economies
  const [tokenEconomies, setTokenEconomies] = useState([]);
  const [currentEconomyId, setCurrentEconomyId] = useState(null);
  const [isLoadedFromStorage, setIsLoadedFromStorage] = useState(false);

  // Page navigation state
  const [currentPage, setCurrentPage] = useState('selection');

  // Load from localStorage on initial mount
  useEffect(() => {
    try {
      const storedEconomies = localStorage.getItem(ABA_TOKEN_ECONOMIES_KEY);
      let loadedEconomies = null;
      if (storedEconomies) {
        loadedEconomies = JSON.parse(storedEconomies);
      }

      if (loadedEconomies && loadedEconomies.length > 0) {
        setTokenEconomies(loadedEconomies);
        const storedCurrentId = localStorage.getItem(ABA_CURRENT_ECONOMY_ID_KEY);
        const validCurrentId = storedCurrentId ? String(storedCurrentId) : null;

        if (validCurrentId && loadedEconomies.some(econ => String(econ.id) === validCurrentId)) {
          setCurrentEconomyId(validCurrentId);
        } else {
          setCurrentEconomyId(String(loadedEconomies[0].id));
        }
      } else {
        const defaultEconomyId = String(Date.now());
        const defaultEconomy = {
          id: defaultEconomyId,
          name: "Ma Première Économie",
          goal: 5,
          earnedTokens: 0,
          rewardActivity: '',
          selectedEmoji: '🎮',
          workArea: [],
        };
        setTokenEconomies([defaultEconomy]);
        setCurrentEconomyId(defaultEconomyId);
      }
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      const defaultEconomyId = String(Date.now());
      const defaultEconomy = {
        id: defaultEconomyId,
        name: "Ma Première Économie",
        goal: 5,
        earnedTokens: 0,
        rewardActivity: '',
        selectedEmoji: '🎮',
        workArea: [],
      };
      setTokenEconomies([defaultEconomy]);
      setCurrentEconomyId(defaultEconomyId);
    }
    setIsLoadedFromStorage(true);
  }, []);

  // Save tokenEconomies to localStorage
  useEffect(() => {
    if (isLoadedFromStorage) {
      localStorage.setItem(ABA_TOKEN_ECONOMIES_KEY, JSON.stringify(tokenEconomies));
    }
  }, [tokenEconomies, isLoadedFromStorage]);

  // Save currentEconomyId to localStorage
  useEffect(() => {
    if (isLoadedFromStorage && currentEconomyId !== null) {
      localStorage.setItem(ABA_CURRENT_ECONOMY_ID_KEY, String(currentEconomyId));
    }
  }, [currentEconomyId, isLoadedFromStorage]);

  // Helper to get current economy
  const getCurrentEconomy = () => tokenEconomies.find(e => String(e.id) === String(currentEconomyId));
  const currentEconomy = getCurrentEconomy();

  // Global states
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const availableEmojis = ['🎮', '📱', '🍎', '🏀', '🎨', '📚', '🎵', '🍕', '🚗', '⚽', '🎪', '🍭', '🎬', '🌟', '🏆', '🎯'];

  const handleDragStart = (e, token) => {
    setDraggedToken(token);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedToken(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    if (draggedToken && draggedToken.inBasket) {
      setTokens(prev => prev.map(token =>
        token.id === draggedToken.id ? { ...token, inBasket: false } : token
      ));
      
      let shouldShowReward = false;
      setTokenEconomies(prevEconomies => prevEconomies.map(econ => {
        if (econ.id === currentEconomyId) {
          const newEarnedTokens = econ.earnedTokens + 1;
          if (newEarnedTokens >= econ.goal) {
            shouldShowReward = true;
          }
          return {
            ...econ,
            workArea: [...econ.workArea, draggedToken],
            earnedTokens: newEarnedTokens,
          };
        }
        return econ;
      }));

      if (shouldShowReward) {
        setShowRewardModal(true);
      }
    }
  };

  const handleReturnToBasket = (tokenId) => {
    const currentEconomy = getCurrentEconomy();
    if (!currentEconomy) return;
    const token = currentEconomy.workArea.find(t => t.id === tokenId);
    if (token) {
      setTokens(prev => prev.map(t =>
        t.id === tokenId ? { ...t, inBasket: true } : t
      ));
      setTokenEconomies(prevEconomies => prevEconomies.map(econ =>
        econ.id === currentEconomyId
          ? { ...econ, workArea: econ.workArea.filter(t => t.id !== tokenId) }
          : econ
      ));
    }
  };

  const resetActivity = () => {
    setTokens(prev => prev.map(token => ({ ...token, inBasket: true })));
    setTokenEconomies(prevEconomies => prevEconomies.map(econ =>
      econ.id === currentEconomyId
        ? { ...econ, workArea: [], earnedTokens: 0 }
        : econ
    ));
    setShowRewardModal(false);
  };

  const claimReward = () => {
    setShowRewardModal(false);
    setTokenEconomies(prevEconomies => prevEconomies.map(econ =>
      econ.id === currentEconomyId
        ? { ...econ, earnedTokens: 0 }
        : econ
    ));
    setTimeout(() => {
      alert('🎉 Bravo ! Tu as gagné ta récompense ! 🎉');
    }, 500);
  };

  const basketTokens = tokens.filter(token => token.inBasket);
  const progress = currentEconomy ? Math.min((currentEconomy.earnedTokens / currentEconomy.goal) * 100, 100) : 0;

  const navigateToApp = () => setCurrentPage('app');
  const navigateToSelection = () => setCurrentPage('selection');

  const addTokenEconomy = () => {
    const newEconomyId = String(Date.now());
    const newEconomy = {
      id: newEconomyId,
      name: `Nouvelle Économie ${tokenEconomies.length + 1}`,
      goal: 5,
      earnedTokens: 0,
      rewardActivity: '',
      selectedEmoji: '🎉',
      workArea: [],
    };
    setTokenEconomies(prevEconomies => [...prevEconomies, newEconomy]);
    setCurrentEconomyId(newEconomyId);
    navigateToApp();
  };

  if (currentPage === 'selection') {
    return (
      <TokenEconomySelectionPage
        tokenEconomies={tokenEconomies}
        setCurrentEconomyId={setCurrentEconomyId}
        addTokenEconomy={addTokenEconomy}
        navigateToApp={navigateToApp}
      />
    );
  }

  // Guard against currentEconomy being null
  if (!currentEconomy && tokenEconomies.length > 0) {
    if (!isLoadedFromStorage) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-xl">Chargement des données...</div>
        </div>
      );
    }
    setCurrentPage('selection');
    return (
      <TokenEconomySelectionPage
        tokenEconomies={tokenEconomies}
        setCurrentEconomyId={setCurrentEconomyId}
        addTokenEconomy={addTokenEconomy}
        navigateToApp={navigateToApp}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center text-center mb-6">
          <button
            onClick={navigateToSelection}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-2 px-4 rounded-full transition-all duration-200 hover:scale-105 shadow-lg"
          >
            ⬅️ Changer d'économie
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
            {currentEconomy?.name || 'Économie de Jetons'}
          </h1>
          <div style={{ width: '150px' }} />
        </div>

        {/* Zone "Je travaille pour" */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            🎯 Je travaille pour...
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-4">
              <div
                className="text-6xl cursor-pointer hover:scale-110 transition-transform"
                onClick={() => setShowConfigModal(true)}
              >
                {currentEconomy?.selectedEmoji || '❓'}
              </div>
              <div className="text-center md:text-left">
                <input
                  type="text"
                  value={currentEconomy?.rewardActivity || ''}
                  onChange={(e) => {
                    const newActivity = e.target.value;
                    setTokenEconomies(prev => prev.map(econ =>
                      econ.id === currentEconomyId ? { ...econ, rewardActivity: newActivity } : econ
                    ));
                  }}
                  placeholder="Décris ton activité récompense..."
                  className="text-lg md:text-xl font-semibold text-gray-800 bg-transparent border-b-2 border-gray-300 focus:border-blue-500 outline-none p-2 w-full md:w-80"
                />
              </div>
            </div>
            <button
              onClick={() => setShowConfigModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-colors"
            >
              ⚙️ Configurer
            </button>
          </div>
        </div>

        {/* Économie de jetons */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Objectif actuel : {currentEconomy?.goal || 0} jetons
          </h2>
          <div className="flex flex-col items-center gap-4">
            <div className="text-xl font-semibold text-gray-700">
              {currentEconomy?.earnedTokens || 0} / {currentEconomy?.goal || 0} jetons accumulés
            </div>
            
            {/* Barre de progression */}
            <div className="w-full max-w-md bg-gray-200 rounded-full h-6 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                style={{ width: `${progress}%` }}
              >
                {progress > 20 && <span className="text-white text-sm font-bold">{Math.round(progress)}%</span>}
              </div>
            </div>
            
            {/* Représentation visuelle des jetons */}
            <div className="flex flex-wrap justify-center gap-2 max-w-md">
              {Array.from({ length: currentEconomy?.goal || 0 }, (_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    i < (currentEconomy?.earnedTokens || 0)
                      ? 'bg-yellow-400 border-yellow-500 text-yellow-800 scale-110' 
                      : 'bg-gray-200 border-gray-300 text-gray-500'
                  }`}
                >
                  {i < (currentEconomy?.earnedTokens || 0) ? '⭐' : i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panier de jetons */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              🧺 Panier de Jetons
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 min-h-[250px] p-4 bg-gradient-to-b from-blue-50 to-blue-100 rounded-2xl border-4 border-dashed border-blue-300">
              {basketTokens.map(token => (
                <div
                  key={token.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, token)}
                  onDragEnd={handleDragEnd}
                  className="group cursor-grab active:cursor-grabbing transform hover:scale-110 transition-all duration-200"
                  style={{ backgroundColor: token.color }}
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full shadow-lg flex items-center justify-center mx-auto group-hover:shadow-xl transition-shadow duration-200">
                    <span className="text-white font-bold text-xs md:text-sm drop-shadow-md">
                      {token.label}
                    </span>
                  </div>
                </div>
              ))}
              {basketTokens.length === 0 && (
                <div className="col-span-full text-center text-gray-500 text-lg py-8">
                  Panier vide ! 🎉
                </div>
              )}
            </div>
          </div>

          {/* Zone de travail */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              🎯 Zone de Travail
            </h2>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`min-h-[250px] p-4 rounded-2xl border-4 border-dashed transition-all duration-200 ${
                dragOver 
                  ? 'border-green-400 bg-green-50 scale-105' 
                  : 'border-gray-300 bg-gradient-to-b from-gray-50 to-gray-100'
              }`}
            >
              {(currentEconomy?.workArea || []).length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 text-lg">
                  <div className="text-center">
                    <div className="text-4xl mb-2">⬇️</div>
                    Glissez vos jetons ici !
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(currentEconomy?.workArea || []).map(token => (
                    <div
                      key={token.id}
                      onClick={() => handleReturnToBasket(token.id)}
                      className="group cursor-pointer transform hover:scale-110 transition-all duration-200"
                      style={{ backgroundColor: token.color }}
                    >
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-full shadow-lg flex items-center justify-center mx-auto group-hover:shadow-xl transition-shadow duration-200 relative">
                        <span className="text-white font-bold text-xs md:text-sm drop-shadow-md">
                          {token.label}
                        </span>
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          ✕
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bouton reset */}
        <div className="mt-6 text-center">
          <button
            onClick={resetActivity}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-3 px-6 rounded-full transition-all duration-200 hover:scale-105 shadow-lg"
          >
            🔄 Recommencer
          </button>
        </div>
      </div>

      {/* Modal de configuration */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">⚙️ Configuration de l'Économie</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nom de l'économie:
                </label>
                <input
                  type="text"
                  value={currentEconomy?.name || ''}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setTokenEconomies(prev => prev.map(econ =>
                      econ.id === currentEconomyId ? { ...econ, name: newName } : econ
                    ));
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nombre de jetons pour la récompense (1-10):
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentEconomy?.goal || 0}
                  onChange={(e) => {
                    const newGoal = parseInt(e.target.value);
                    setTokenEconomies(prev => prev.map(econ =>
                      econ.id === currentEconomyId ? { ...econ, goal: newGoal } : econ
                    ));
                  }}
                  className="w-full"
                />
                <div className="text-center text-lg font-semibold text-blue-600 mt-2">
                  {currentEconomy?.goal || 0} jetons
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Choisir un pictogramme:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {availableEmojis.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setTokenEconomies(prev => prev.map(econ =>
                          econ.id === currentEconomyId ? { ...econ, selectedEmoji: emoji } : econ
                        ));
                      }}
                      className={`text-3xl p-2 rounded-lg border-2 transition-all ${
                        (currentEconomy?.selectedEmoji || '❓') === emoji
                          ? 'border-blue-500 bg-blue-50 scale-110' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowConfigModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setTokenEconomies(prevEconomies => prevEconomies.map(econ =>
                    String(econ.id) === String(currentEconomyId)
                      ? { ...econ, earnedTokens: 0 }
                      : econ
                  ));
                  setShowConfigModal(false);
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition-colors"
              >
                Appliquer et Réinitialiser Jetons
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de récompense */}
      {showRewardModal && currentEconomy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-3xl font-bold text-green-600 mb-4">Félicitations !</h3>
            <p className="text-lg text-gray-700 mb-2">Tu as gagné {currentEconomy.goal} jetons !</p>
            <div className="text-4xl my-4">{currentEconomy.selectedEmoji}</div>
            <p className="text-xl font-semibold text-blue-600 mb-6">
              {currentEconomy.rewardActivity || "Ta récompense t'attend !"}
            </p>
            <button
              onClick={claimReward}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-colors text-lg"
            >
              🏆 Récupérer ma récompense !
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(ABATokenApp));