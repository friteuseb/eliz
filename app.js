const { useState, useRef, useEffect } = React;

const ABA_TOKEN_ECONOMIES_KEY = 'abaTokenEconomies';
const ABA_CURRENT_ECONOMY_ID_KEY = 'abaCurrentEconomyId';

// Composant pour la page de sélection des économies
const TokenEconomySelectionPage = ({ tokenEconomies, setCurrentEconomyId, addTokenEconomy, navigateToApp }) => {
  const selectEconomy = (economyId) => {
    setCurrentEconomyId(economyId);
    navigateToApp();
  };

  return React.createElement('div', { className: "min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4" },
    React.createElement('div', { className: "max-w-4xl mx-auto" },
      React.createElement('div', { className: "text-center mb-8" },
        React.createElement('h1', { className: "text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg" },
          '🌟 Choisir une Économie de Jetons 🌟'
        ),
        React.createElement('p', { className: "text-white text-lg" },
          'Sélectionnez une économie existante ou créez-en une nouvelle'
        )
      ),

      React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" },
        // Économies existantes
        tokenEconomies.map(economy =>
          React.createElement('div', {
            key: economy.id,
            onClick: () => selectEconomy(economy.id),
            className: "bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl cursor-pointer hover:scale-105 transition-all duration-200"
          },
            React.createElement('div', { className: "text-center" },
              React.createElement('div', { className: "text-4xl mb-4" }, economy.selectedEmoji),
              React.createElement('h3', { className: "text-xl font-bold text-gray-800 mb-2" }, economy.name),
              React.createElement('p', { className: "text-gray-600 mb-2" }, `Objectif: ${economy.goal} jetons`),
              React.createElement('p', { className: "text-gray-600 mb-4" }, `Gagnés: ${economy.earnedTokens}/${economy.goal}`),
              React.createElement('div', { className: "w-full bg-gray-200 rounded-full h-2" },
                React.createElement('div', {
                  className: "bg-green-500 h-2 rounded-full transition-all duration-300",
                  style: { width: `${Math.min((economy.earnedTokens / economy.goal) * 100, 100)}%` }
                })
              ),
              React.createElement('p', { className: "text-sm text-gray-500 mt-2" },
                economy.rewardActivity || 'Aucune activité définie'
              )
            )
          )
        ),

        // Bouton pour ajouter une nouvelle économie
        React.createElement('div', {
          onClick: addTokenEconomy,
          className: "bg-white/20 backdrop-blur-sm rounded-3xl p-6 shadow-2xl cursor-pointer hover:scale-105 transition-all duration-200 border-4 border-dashed border-white/50"
        },
          React.createElement('div', { className: "text-center text-white h-full flex flex-col justify-center" },
            React.createElement('div', { className: "text-6xl mb-4" }, '➕'),
            React.createElement('h3', { className: "text-xl font-bold mb-2" }, 'Nouvelle Économie'),
            React.createElement('p', { className: "text-sm" }, 'Créer une nouvelle économie de jetons')
          )
        )
      )
    )
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
  
  const [workArea, setWorkArea] = useState([]);
  const [draggedToken, setDraggedToken] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  
  // Configuration de l'économie de jetons
  const [tokenEconomyGoal, setTokenEconomyGoal] = useState(5);
  const [earnedTokens, setEarnedTokens] = useState(0);
  const [rewardActivity, setRewardActivity] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🎮');
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
      setWorkArea(prev => [...prev, draggedToken]);
      
      // Gagner un jeton dans l'économie
      const newEarnedTokens = earnedTokens + 1;
      setEarnedTokens(newEarnedTokens);
      
      // Vérifier si l'objectif est atteint
      if (newEarnedTokens >= tokenEconomyGoal) {
        setShowRewardModal(true);
      }
    }
  };

  const handleReturnToBasket = (tokenId) => {
    const token = workArea.find(t => t.id === tokenId);
    if (token) {
      setTokens(prev => prev.map(t => 
        t.id === tokenId ? { ...t, inBasket: true } : t
      ));
      setWorkArea(prev => prev.filter(t => t.id !== tokenId));
    }
  };

  const resetActivity = () => {
    setTokens(prev => prev.map(token => ({ ...token, inBasket: true })));
    setWorkArea([]);
    setEarnedTokens(0);
    setShowRewardModal(false);
  };

  const claimReward = () => {
    setShowRewardModal(false);
    setEarnedTokens(0);
    // Animation de célébration
    setTimeout(() => {
      alert('🎉 Bravo ! Tu as gagné ta récompense ! 🎉');
    }, 500);
  };

  const basketTokens = tokens.filter(token => token.inBasket);
  const progress = Math.min((earnedTokens / tokenEconomyGoal) * 100, 100);

  return React.createElement('div', { className: "min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4" },
    React.createElement('div', { className: "max-w-7xl mx-auto" },
      // Header
      React.createElement('div', { className: "text-center mb-6" },
        React.createElement('h1', { className: "text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg" },
          '🌟 Application ABA - Économie de Jetons 🌟'
        )
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
            }, selectedEmoji),
            React.createElement('div', { className: "text-center md:text-left" },
              React.createElement('input', {
                type: "text",
                value: rewardActivity,
                onChange: (e) => setRewardActivity(e.target.value),
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
          '💰 Économie de Jetons'
        ),
        React.createElement('div', { className: "flex flex-col items-center gap-4" },
          React.createElement('div', { className: "text-xl font-semibold text-gray-700" },
            `${earnedTokens} / ${tokenEconomyGoal} jetons gagnés`
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
            Array.from({ length: tokenEconomyGoal }, (_, i) =>
              React.createElement('div', {
                key: i,
                className: `w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  i < earnedTokens 
                    ? 'bg-yellow-400 border-yellow-500 text-yellow-800 scale-110' 
                    : 'bg-gray-200 border-gray-300 text-gray-500'
                }`
              },
                i < earnedTokens ? '⭐' : i + 1
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
            workArea.length === 0 ? 
              React.createElement('div', { className: "flex items-center justify-center h-full text-gray-500 text-lg" },
                React.createElement('div', { className: "text-center" },
                  React.createElement('div', { className: "text-4xl mb-2" }, '⬇️'),
                  'Glissez vos jetons ici !'
                )
              ) :
              React.createElement('div', { className: "grid grid-cols-2 sm:grid-cols-3 gap-3" },
                workArea.map(token =>
                  React.createElement('div', {
                    key: token.id,
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
        React.createElement('h3', { className: "text-2xl font-bold text-gray-800 mb-4 text-center" }, '⚙️ Configuration'),
        
        React.createElement('div', { className: "space-y-6" },
          React.createElement('div', {},
            React.createElement('label', { className: "block text-sm font-bold text-gray-700 mb-2" },
              'Nombre de jetons pour la récompense (1-10):'
            ),
            React.createElement('input', {
              type: "range",
              min: "1",
              max: "10",
              value: tokenEconomyGoal,
              onChange: (e) => setTokenEconomyGoal(parseInt(e.target.value)),
              className: "w-full"
            }),
            React.createElement('div', { className: "text-center text-lg font-semibold text-blue-600 mt-2" },
              `${tokenEconomyGoal} jetons`
            )
          ),

          React.createElement('div', {},
            React.createElement('label', { className: "block text-sm font-bold text-gray-700 mb-2" },
              'Choisir un pictogramme:'
            ),
            React.createElement('div', { className: "grid grid-cols-4 gap-2" },
              availableEmojis.map(emoji =>
                React.createElement('button', {
                  key: emoji,
                  onClick: () => setSelectedEmoji(emoji),
                  className: `text-3xl p-2 rounded-lg border-2 transition-all ${
                    selectedEmoji === emoji 
                      ? 'border-blue-500 bg-blue-50 scale-110' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`
                }, emoji)
              )
            )
          )
        ),

        React.createElement('div', { className: "flex gap-3 mt-6" },
          React.createElement('button', {
            onClick: () => setShowConfigModal(false),
            className: "flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full transition-colors"
          }, 'Fermer'),
          React.createElement('button', {
            onClick: () => {
              setShowConfigModal(false);
              setEarnedTokens(0);
            },
            className: "flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition-colors"
          }, 'Appliquer')
        )
      )
    ),

    // Modal de récompense
    showRewardModal && React.createElement('div', { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" },
      React.createElement('div', { className: "bg-white rounded-3xl p-8 max-w-md w-full text-center animate-bounce" },
        React.createElement('div', { className: "text-6xl mb-4" }, '🎉'),
        React.createElement('h3', { className: "text-3xl font-bold text-green-600 mb-4" }, 'Félicitations !'),
        React.createElement('p', { className: "text-lg text-gray-700 mb-2" }, `Tu as gagné ${tokenEconomyGoal} jetons !`),
        React.createElement('div', { className: "text-4xl my-4" }, selectedEmoji),
        React.createElement('p', { className: "text-xl font-semibold text-blue-600 mb-6" },
          rewardActivity || "Ta récompense t'attend !"
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