const { useState, useRef, useEffect } = React;

const ABA_TOKEN_ECONOMIES_KEY = 'abaTokenEconomies';
const ABA_CURRENT_ECONOMY_ID_KEY = 'abaCurrentEconomyId';

const ABATokenApp = () => {
  const [tokens, setTokens] = useState([ // This state is universal, not per economy, so its persistence is not requested here.
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
  const [currentPage, setCurrentPage] = useState('selection'); // 'selection' or 'app'

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
        // Ensure storedCurrentId is a string for comparison if it's a number in storage
        const validCurrentId = storedCurrentId ? String(storedCurrentId) : null;

        if (validCurrentId && loadedEconomies.some(econ => String(econ.id) === validCurrentId)) {
          setCurrentEconomyId(validCurrentId);
        } else {
          setCurrentEconomyId(String(loadedEconomies[0].id)); // Default to first loaded economy's ID
        }
      } else {
        // Initialize with a default economy if nothing in storage or empty array
        const defaultEconomyId = String(Date.now()); // Ensure ID is string
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
      console.error("Failed to load from localStorage or data corrupted:", error);
      // Fallback to default initialization in case of error
      const defaultEconomyId = String(Date.now()); // Ensure ID is string
      const defaultEconomy = {
        id: defaultEconomyId,
        name: "Ma Première Économie Error", // Indicate error case if desired
        goal: 5,
        earnedTokens: 0,
        rewardActivity: '',
        selectedEmoji: '🎮',
        workArea: [],
      };
      setTokenEconomies([defaultEconomy]);
      setCurrentEconomyId(defaultEconomyId);
      // Optionally clear corrupted localStorage
      // localStorage.removeItem(ABA_TOKEN_ECONOMIES_KEY);
      // localStorage.removeItem(ABA_CURRENT_ECONOMY_ID_KEY);
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
    if (isLoadedFromStorage && currentEconomyId !== null) { // Do not save null ID
      localStorage.setItem(ABA_CURRENT_ECONOMY_ID_KEY, String(currentEconomyId));
    }
  }, [currentEconomyId, isLoadedFromStorage]);

  // Helper to get current economy and its properties
  const getCurrentEconomy = () => tokenEconomies.find(e => String(e.id) === String(currentEconomyId));
  const currentEconomy = getCurrentEconomy();

  // Global states (not per economy)
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
      // Déplacer le jeton du panier vers la zone de travail
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
    const currentEconomy = getCurrentEconomy(); // getCurrentEconomy() will give the latest version on re-render
    if (!currentEconomy) return; // Should not happen if currentEconomyId is always valid
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
    // Reset inBasket status for all tokens globally
    setTokens(prev => prev.map(token => ({ ...token, inBasket: true })));
    // Reset workArea and earnedTokens for the current economy
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
    // Animation de célébration
    setTimeout(() => {
      alert('🎉 Bravo ! Tu as gagné ta récompense ! 🎉');
    }, 500);
  };

  const basketTokens = tokens.filter(token => token.inBasket);
  // Update progress calculation to use current economy's state
  const progress = currentEconomy ? Math.min((currentEconomy.earnedTokens / currentEconomy.goal) * 100, 100) : 0;

  const navigateToApp = () => setCurrentPage('app');
  const navigateToSelection = () => setCurrentPage('selection');

  const addTokenEconomy = () => {
    const newEconomyId = String(Date.now()); // Ensure ID is string
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
    return React.createElement(TokenEconomySelectionPage, {
      tokenEconomies,
      setCurrentEconomyId,
      addTokenEconomy,
      navigateToApp,
    });
  }

  // Main App UI (currentPage === 'app')
  // Guard against currentEconomy being null if all economies are deleted (future feature)
  if (!currentEconomy && tokenEconomies.length > 0) {
    // Default to first economy if current one is somehow invalid but economies exist
    // setCurrentEconomyId(String(tokenEconomies[0].id)); // Ensure ID is string
    // The above line might be problematic if tokenEconomies is empty during an intermediate render.
    // The initial load useEffect should handle setting a valid currentEconomyId.
    // If still no currentEconomy, it might be during initial loading phase.
    if (!isLoadedFromStorage) {
      return React.createElement('div', {className: "min-h-screen flex items-center justify-center bg-gray-100"}, React.createElement('div', {className: "text-xl"}, "Chargement des données..."));
    }
    // If loaded and still no current economy (e.g. all economies deleted and currentId became invalid)
    // or no economies at all, redirect to selection.
    setCurrentPage('selection'); // Fallback to selection page
    return React.createElement(TokenEconomySelectionPage, { // Render selection page
      tokenEconomies,
      setCurrentEconomyId,
      addTokenEconomy,
      navigateToApp,
    });
  }

  return React.createElement('div', { className: "min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4" },
    React.createElement('div', { className: "max-w-7xl mx-auto" },
      // Header
      React.createElement('div', { className: "flex justify-between items-center text-center mb-6" },
        React.createElement('button', {
          onClick: navigateToSelection,
          className: "bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-2 px-4 rounded-full transition-all duration-200 hover:scale-105 shadow-lg"
        }, '⬅️ Changer d\'économie'),
        React.createElement('h1', { className: "text-3xl md:text-4xl font-bold text-white drop-shadow-lg" },
          currentEconomy?.name || 'Économie de Jetons' // Display current economy name in header
        ),
        React.createElement('div', { style: { width: '150px' } }) // Spacer to balance the button
      ),

      // Zone "Je travaille pour"
      React.createElement('div', { className: "bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-6" },
        React.createElement('h2', { className: "text-2xl font-bold text-gray-800 mb-4 text-center" },
          '🎯 Je travaille pour...'
        ),
        React.createElement('div', { className: "flex flex-col md:flex-row items-center justify-center gap-4" },
          React.createElement('div', { className: "flex items-center gap-4" },
            React.createElement('div', {
              className: "text-6xl cursor-pointer hover:scale-110 transition-transform",
              onClick: () => setShowConfigModal(true)
            }, currentEconomy?.selectedEmoji || '❓'),
            React.createElement('div', { className: "text-center md:text-left" },
              React.createElement('input', {
                type: "text",
                value: currentEconomy?.rewardActivity || '',
                onChange: (e) => {
                  const newActivity = e.target.value;
                  setTokenEconomies(prev => prev.map(econ =>
                    econ.id === currentEconomyId ? { ...econ, rewardActivity: newActivity } : econ
                  ));
                },
                placeholder: "Décris ton activité récompense...",
                className: "text-lg md:text-xl font-semibold text-gray-800 bg-transparent border-b-2 border-gray-300 focus:border-blue-500 outline-none p-2 w-full md:w-80"
              })
            )
          ),
          React.createElement('button', {
            onClick: () => setShowConfigModal(true),
            className: "bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-colors"
          }, '⚙️ Configurer')
        )
      ),

      // Économie de jetons
      React.createElement('div', { className: "bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-6" },
        React.createElement('h2', { className: "text-2xl font-bold text-gray-800 mb-4 text-center" },
          `Objectif actuel : ${currentEconomy?.goal || 0} jetons` // Display current economy goal
        ),
        React.createElement('div', { className: "flex flex-col items-center gap-4" },
          React.createElement('div', { className: "text-xl font-semibold text-gray-700" },
            `${currentEconomy?.earnedTokens || 0} / ${currentEconomy?.goal || 0} jetons accumulés`
          ),
          
          // Barre de progression
          React.createElement('div', { className: "w-full max-w-md bg-gray-200 rounded-full h-6 overflow-hidden" },
            React.createElement('div', {
              className: "h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2",
              style: { width: `${progress}%` }
            },
              progress > 20 && React.createElement('span', { className: "text-white text-sm font-bold" }, `${Math.round(progress)}%`)
            )
          ),
          
          // Représentation visuelle des jetons
          React.createElement('div', { className: "flex flex-wrap justify-center gap-2 max-w-md" },
            Array.from({ length: currentEconomy?.goal || 0 }, (_, i) =>
              React.createElement('div', {
                key: i,
                className: `w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  i < (currentEconomy?.earnedTokens || 0)
                    ? 'bg-yellow-400 border-yellow-500 text-yellow-800 scale-110'
                    : 'bg-gray-200 border-gray-300 text-gray-500'
                }`
              },
                i < (currentEconomy?.earnedTokens || 0) ? '⭐' : i + 1
              )
            )
          )
        )
      ),

      React.createElement('div', { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
        // Panier de jetons
        React.createElement('div', { className: "bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl" },
          React.createElement('h2', { className: "text-xl font-bold text-gray-800 mb-4 text-center" },
            '🧺 Panier de Jetons'
          ),
          React.createElement('div', { className: "grid grid-cols-2 sm:grid-cols-3 gap-3 min-h-[250px] p-4 bg-gradient-to-b from-blue-50 to-blue-100 rounded-2xl border-4 border-dashed border-blue-300" },
            basketTokens.map(token =>
              React.createElement('div', {
                key: token.id,
                draggable: true,
                onDragStart: (e) => handleDragStart(e, token),
                onDragEnd: handleDragEnd,
                className: "group cursor-grab active:cursor-grabbing transform hover:scale-110 transition-all duration-200",
                style: { backgroundColor: token.color }
              },
                React.createElement('div', { className: "w-14 h-14 md:w-16 md:h-16 rounded-full shadow-lg flex items-center justify-center mx-auto group-hover:shadow-xl transition-shadow duration-200" },
                  React.createElement('span', { className: "text-white font-bold text-xs md:text-sm drop-shadow-md" },
                    token.label
                  )
                )
              )
            ),
            basketTokens.length === 0 && React.createElement('div', { className: "col-span-full text-center text-gray-500 text-lg py-8" },
              'Panier vide ! 🎉'
            )
          )
        ),

        // Zone de travail
        React.createElement('div', { className: "bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl" },
          React.createElement('h2', { className: "text-xl font-bold text-gray-800 mb-4 text-center" },
            '🎯 Zone de Travail'
          ),
          React.createElement('div', {
            onDragOver: handleDragOver,
            onDragLeave: handleDragLeave,
            onDrop: handleDrop,
            className: `min-h-[250px] p-4 rounded-2xl border-4 border-dashed transition-all duration-200 ${
              dragOver
                ? 'border-green-400 bg-green-50 scale-105'
                : 'border-gray-300 bg-gradient-to-b from-gray-50 to-gray-100'
            }`
          },
            (currentEconomy?.workArea || []).length === 0 ?
              React.createElement('div', { className: "flex items-center justify-center h-full text-gray-500 text-lg" },
                React.createElement('div', { className: "text-center" },
                  React.createElement('div', { className: "text-4xl mb-2" }, '⬇️'),
                  'Glissez vos jetons ici !'
                )
              ) :
              React.createElement('div', { className: "grid grid-cols-2 sm:grid-cols-3 gap-3" },
                (currentEconomy?.workArea || []).map(token =>
                  React.createElement('div', {
                    key: token.id, // Ensure unique key if tokens can be duplicated across economies in workarea
                    onClick: () => handleReturnToBasket(token.id),
                    className: "group cursor-pointer transform hover:scale-110 transition-all duration-200",
                    style: { backgroundColor: token.color }
                  },
                    React.createElement('div', { className: "w-14 h-14 md:w-16 md:h-16 rounded-full shadow-lg flex items-center justify-center mx-auto group-hover:shadow-xl transition-shadow duration-200 relative" },
                      React.createElement('span', { className: "text-white font-bold text-xs md:text-sm drop-shadow-md" },
                        token.label
                      ),
                      React.createElement('div', { className: "absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity" },
                        '✕'
                      )
                    )
                  )
                )
              )
          )
        )
      ),

      // Bouton reset
      React.createElement('div', { className: "mt-6 text-center" },
        React.createElement('button', {
          onClick: resetActivity,
          className: "bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-3 px-6 rounded-full transition-all duration-200 hover:scale-105 shadow-lg"
        }, '🔄 Recommencer')
      )
    ),

    // Modal de configuration
    showConfigModal && React.createElement('div', { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" },
      React.createElement('div', { className: "bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" },
        React.createElement('h3', { className: "text-2xl font-bold text-gray-800 mb-4 text-center" }, '⚙️ Configuration de l\'Économie'),
        
        React.createElement('div', { className: "space-y-6" },
          React.createElement('div', {},
            React.createElement('label', { htmlFor: `economyName-${currentEconomy?.id}`, className: "block text-sm font-bold text-gray-700 mb-2" },
              'Nom de l\'économie:'
            ),
            React.createElement('input', {
              type: "text",
              id: `economyName-${currentEconomy?.id}`,
              value: currentEconomy?.name || '',
              onChange: (e) => {
                const newName = e.target.value;
                setTokenEconomies(prev => prev.map(econ =>
                  econ.id === currentEconomyId ? { ...econ, name: newName } : econ
                ));
              },
              className: "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            })
          ),
          React.createElement('div', {},
            React.createElement('label', { htmlFor: `economyGoal-${currentEconomy?.id}`, className: "block text-sm font-bold text-gray-700 mb-2" },
              'Nombre de jetons pour la récompense (1-10):'
            ),
            React.createElement('input', {
              type: "range",
              id: `economyGoal-${currentEconomy?.id}`,
              min: "1",
              max: "10",
              value: currentEconomy?.goal || 0,
              onChange: (e) => {
                const newGoal = parseInt(e.target.value);
                setTokenEconomies(prev => prev.map(econ =>
                  econ.id === currentEconomyId ? { ...econ, goal: newGoal } : econ
                ));
              },
              className: "w-full"
            }),
            React.createElement('div', { className: "text-center text-lg font-semibold text-blue-600 mt-2" },
              `${currentEconomy?.goal || 0} jetons`
            )
          ),

          React.createElement('div', {},
            React.createElement('label', { htmlFor: `economyEmoji-${currentEconomy?.id}`, className: "block text-sm font-bold text-gray-700 mb-2" },
              'Choisir un pictogramme:'
            ),
            React.createElement('div', { id: `economyEmoji-${currentEconomy?.id}`, className: "grid grid-cols-4 gap-2" },
              availableEmojis.map(emoji =>
                React.createElement('button', {
                  key: emoji,
                  onClick: () => {
                    setTokenEconomies(prev => prev.map(econ =>
                      econ.id === currentEconomyId ? { ...econ, selectedEmoji: emoji } : econ
                    ));
                  },
                  className: `text-3xl p-2 rounded-lg border-2 transition-all ${
                    (currentEconomy?.selectedEmoji || '❓') === emoji
                      ? 'border-blue-500 bg-blue-50 scale-110'
                      : 'border-gray-200 hover:border-gray-300'
                  }`
                }, emoji)
              )
            )
          )
        ),

        React.createElement('div', { className: "flex gap-3 mt-8" }, // Increased margin-top for spacing
          React.createElement('button', {
            onClick: () => {
              // Before closing, we might want to revert changes if the modal had temporary states.
              // Currently, changes are applied directly to tokenEconomies state on each input's onChange.
              // So, "Fermer" just closes the modal without reverting anything.
              // If the original values were needed for a revert, they should be stored when modal opens.
              const originalEconomy = tokenEconomies.find(e => String(e.id) === String(currentEconomyId));
              // This is just an example if we had temp states:
              // setTempName(originalEconomy.name); setTempGoal(originalEconomy.goal); etc.
              setShowConfigModal(false);
            },
            className: "flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full transition-colors"
          }, 'Fermer'),
          React.createElement('button', {
            onClick: () => {
              // Name, Goal, Emoji are already updated in tokenEconomies state due to direct onChange handlers.
              // Main action here is to reset earnedTokens for the current economy and close the modal.
              setTokenEconomies(prevEconomies => prevEconomies.map(econ =>
                String(econ.id) === String(currentEconomyId) // Ensure comparison is consistent (string vs string)
                  ? { ...econ, earnedTokens: 0 } // Reset earned tokens for current economy
                  : econ
              ));
              setShowConfigModal(false);
            },
            className: "flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition-colors"
          }, 'Appliquer et Réinitialiser Jetons')
        )
      )
    ),

    // Modal de récompense
    // Ensure currentEconomy is available before rendering modal content related to it
    showRewardModal && currentEconomy && React.createElement('div', { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" },
      React.createElement('div', { className: "bg-white rounded-3xl p-8 max-w-md w-full text-center" }, // Removed animate-bounce as per a comment in prev diff, can be added back if desired
        React.createElement('div', { className: "text-6xl mb-4" }, '🎉'),
        React.createElement('h3', { className: "text-3xl font-bold text-green-600 mb-4" }, 'Félicitations !'),
        React.createElement('p', { className: "text-lg text-gray-700 mb-2" }, `Tu as gagné ${currentEconomy.goal} jetons !`),
        React.createElement('div', { className: "text-4xl my-4" }, currentEconomy.selectedEmoji),
        React.createElement('p', { className: "text-xl font-semibold text-blue-600 mb-6" },
          currentEconomy.rewardActivity || "Ta récompense t'attend !"
        ),
        React.createElement('button', {
          onClick: claimReward,
          className: "bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-colors text-lg"
        }, '🏆 Récupérer ma récompense !')
      )
    )
  );
};

// Rendu de l'application
ReactDOM.render(React.createElement(ABATokenApp), document.getElementById('root'));