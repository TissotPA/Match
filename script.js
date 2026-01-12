// Classe pour gérer les statistiques d'une joueuse
class PlayerStats {
    constructor() {
        this.tirsIntTentes = 0;
        this.tirsIntReussis = 0;
        this.tirsExtTentes = 0;
        this.tirsExtReussis = 0;
        this.tirs3Tentes = 0;
        this.tirs3Reussis = 0;
        this.lfTentes = 0;
        this.lfReussis = 0;
        this.rebonds = 0;
        this.passes = 0;
        this.fautes = 0;
        this.balPerdus = 0;
        this.interceptions = 0;
        this.contres = 0;
    }

    // Calcul automatique des points
    getTotalPoints() {
        const pointsLF = this.lfReussis * 1;
        const pointsTirsInt = this.tirsIntReussis * 2;
        const pointsTirsExt = this.tirsExtReussis * 2;
        const points3pts = this.tirs3Reussis * 3;
        return pointsLF + pointsTirsInt + pointsTirsExt + points3pts;
    }

    // Calcul de l'évaluation
    getEvaluation() {
        const points = this.getTotalPoints();
        const tirsRates = (this.tirsIntTentes - this.tirsIntReussis) + 
                          (this.tirsExtTentes - this.tirsExtReussis) + 
                          (this.tirs3Tentes - this.tirs3Reussis);
        const lfRates = this.lfTentes - this.lfReussis;
        
        return points + this.rebonds + this.passes + this.interceptions + this.contres - tirsRates - lfRates - this.balPerdus;
    }
}

// Gestionnaire principal de l'application
class BasketStatsApp {
    constructor() {
        this.players = [];
        this.playersContainer = document.getElementById('playersContainer');
        this.template = document.getElementById('playerCardTemplate');
        this.addPlayerBtn = document.getElementById('addPlayerBtn');
        this.nouveauMatchBtn = document.getElementById('nouveauMatchBtn');
        this.importBtn = document.getElementById('importBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.cloturerBtn = document.getElementById('cloturerBtn');
        this.resetAllBtn = document.getElementById('resetAllBtn');
        this.fileInput = document.getElementById('fileInput');
        
        // Modale
        this.modal = document.getElementById('customModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalMessage = document.getElementById('modalMessage');
        this.modalConfirm = document.getElementById('modalConfirm');
        this.modalCancel = document.getElementById('modalCancel');

        this.init();
    }

    // Fonction pour afficher une confirmation personnalisée
    showConfirm(title, message) {
        return new Promise((resolve) => {
            this.modalTitle.textContent = title;
            this.modalMessage.textContent = message;
            this.modalCancel.style.display = 'inline-block';
            this.modal.classList.add('active');

            const onConfirm = () => {
                this.modal.classList.remove('active');
                cleanup();
                resolve(true);
            };

            const onCancel = () => {
                this.modal.classList.remove('active');
                cleanup();
                resolve(false);
            };

            const cleanup = () => {
                this.modalConfirm.removeEventListener('click', onConfirm);
                this.modalCancel.removeEventListener('click', onCancel);
            };

            this.modalConfirm.addEventListener('click', onConfirm);
            this.modalCancel.addEventListener('click', onCancel);
        });
    }

    // Fonction pour afficher une alerte personnalisée
    showAlert(title, message) {
        return new Promise((resolve) => {
            this.modalTitle.textContent = title;
            this.modalMessage.textContent = message;
            this.modalCancel.style.display = 'none';
            this.modalConfirm.textContent = 'OK';
            this.modal.classList.add('active');

            const onConfirm = () => {
                this.modal.classList.remove('active');
                this.modalConfirm.textContent = 'Confirmer';
                this.modalConfirm.removeEventListener('click', onConfirm);
                resolve();
            };

            this.modalConfirm.addEventListener('click', onConfirm);
        });
    }

    init() {
        // Événements des boutons principaux
        this.addPlayerBtn.addEventListener('click', () => this.addPlayer());
        this.nouveauMatchBtn.addEventListener('click', () => this.nouveauMatch());
        this.importBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.importFromJSON(e));
        this.exportBtn.addEventListener('click', () => this.exportToJSON());
        this.cloturerBtn.addEventListener('click', () => this.cloturerMatch());
        this.resetAllBtn.addEventListener('click', () => this.resetAll());

        // Charger les données sauvegardées
        this.loadFromLocalStorage();

        // Ajouter une joueuse par défaut si aucune n'existe
        if (this.players.length === 0) {
            this.addPlayer();
        }
    }

    addPlayer() {
        // Créer une nouvelle joueuse
        const player = {
            id: Date.now(),
            name: '',
            stats: new PlayerStats()
        };

        this.players.push(player);
        this.renderPlayer(player);
        this.saveToLocalStorage();
    }

    nouveauMatch() {
        // Charger le fichier empty_PRF.json depuis la racine
        fetch('empty_PRF.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Fichier empty_PRF.json non trouvé');
                }
                return response.json();
            })
            .then(data => {
                // Demander confirmation
                this.showConfirm(
                    '🆕 Nouveau match',
                    `Charger un nouveau match avec ${data.joueuses?.length || 0} joueuse(s) ? Cela remplacera les données actuelles.`
                ).then(confirmed => {
                    if (!confirmed) return;

                    // Effacer les données actuelles
                    this.players = [];
                    this.playersContainer.innerHTML = '';

                    // Importer les joueuses du template
                    if (data.joueuses && Array.isArray(data.joueuses)) {
                        data.joueuses.forEach(joueuseData => {
                            const player = {
                                id: Date.now() + Math.random(),
                                name: joueuseData.nom || '',
                                stats: new PlayerStats()
                            };

                            // Charger les statistiques si présentes
                            const stats = joueuseData.statistiques;
                            if (stats) {
                                if (stats.tirs) {
                                    player.stats.tirsIntTentes = stats.tirs.interieurs?.tentes || 0;
                                    player.stats.tirsIntReussis = stats.tirs.interieurs?.reussis || 0;
                                    player.stats.tirsExtTentes = stats.tirs.exterieurs?.tentes || 0;
                                    player.stats.tirsExtReussis = stats.tirs.exterieurs?.reussis || 0;
                                    player.stats.tirs3Tentes = stats.tirs.trois_points?.tentes || 0;
                                    player.stats.tirs3Reussis = stats.tirs.trois_points?.reussis || 0;
                                    player.stats.lfTentes = stats.tirs.lancers_francs?.tentes || 0;
                                    player.stats.lfReussis = stats.tirs.lancers_francs?.reussis || 0;
                                }
                                player.stats.rebonds = stats.rebonds || 0;
                                player.stats.passes = stats.passes_decisives || 0;
                                player.stats.interceptions = stats.interceptions || 0;
                                player.stats.contres = stats.contres || 0;
                                player.stats.balPerdus = stats.ballons_perdus || 0;
                                player.stats.fautes = stats.fautes || 0;
                            }

                            this.players.push(player);
                            this.renderPlayer(player);
                        });
                    }

                    this.saveToLocalStorage();
                    this.showAlert('✅ Succès', 'Nouveau match chargé !');
                });
            })
            .catch(error => {
                console.error('Erreur lors du chargement du fichier:', error);
                this.showAlert('❌ Erreur', 'Impossible de charger le fichier empty_PRF.json. Assurez-vous qu\'il est présent à la racine du projet.');
            });
    }

    cloturerMatch() {
        if (this.players.length === 0) {
            this.showAlert('⚠️ Aucune donnée', 'Ajoutez au moins une joueuse avant de clôturer le match.');
            return;
        }

        // Préparer les données pour le récapitulatif
        const recapData = {
            date: new Date().toLocaleString('fr-FR'),
            joueuses: this.players.map(player => ({
                nom: player.name || 'Sans nom',
                stats: player.stats
            }))
        };

        // Stocker temporairement dans sessionStorage
        sessionStorage.setItem('recapMatch', JSON.stringify(recapData));

        // Ouvrir le récapitulatif dans un nouvel onglet
        window.open('recap.html', '_blank');
    }

    renderPlayer(player) {
        // Cloner le template
        const cardElement = this.template.content.cloneNode(true);
        const card = cardElement.querySelector('.player-card');
        card.dataset.playerId = player.id;

        // Nom de la joueuse
        const nameInput = card.querySelector('.player-name');
        nameInput.value = player.name;
        nameInput.addEventListener('input', (e) => {
            player.name = e.target.value;
            this.saveToLocalStorage();
        });

        // Bouton de suppression
        const removeBtn = card.querySelector('.remove-player-btn');
        removeBtn.addEventListener('click', () => this.removePlayer(player.id));

        // Configurer tous les boutons de stats
        const statButtons = card.querySelectorAll('.stat-btn');
        statButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const statName = btn.dataset.stat;
                const isPlus = btn.classList.contains('plus');
                this.updateStat(player.id, statName, isPlus);
            });
        });

        // Afficher les valeurs initiales
        this.updateCardDisplay(card, player);

        // Ajouter au container
        this.playersContainer.appendChild(card);
    }

    updateStat(playerId, statName, isIncrement) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return;

        // Mettre à jour la statistique
        if (isIncrement) {
            player.stats[statName]++;
            
            // Règle spéciale : quand on incrémente un tir réussi, on incrémente aussi les tentés
            if (statName === 'tirsIntReussis') {
                player.stats.tirsIntTentes++;
            } else if (statName === 'tirsExtReussis') {
                player.stats.tirsExtTentes++;
            } else if (statName === 'tirs3Reussis') {
                player.stats.tirs3Tentes++;
            } else if (statName === 'lfReussis') {
                player.stats.lfTentes++;
            }
        } else {
            // Décrémentation (ne pas descendre en dessous de 0)
            if (player.stats[statName] > 0) {
                player.stats[statName]--;
            }
        }

        // Règles de cohérence : les réussis ne peuvent pas dépasser les tentés
        if (player.stats.tirsIntReussis > player.stats.tirsIntTentes) {
            player.stats.tirsIntTentes = player.stats.tirsIntReussis;
        }
        if (player.stats.tirsExtReussis > player.stats.tirsExtTentes) {
            player.stats.tirsExtTentes = player.stats.tirsExtReussis;
        }
        if (player.stats.tirs3Reussis > player.stats.tirs3Tentes) {
            player.stats.tirs3Tentes = player.stats.tirs3Reussis;
        }
        if (player.stats.lfReussis > player.stats.lfTentes) {
            player.stats.lfTentes = player.stats.lfReussis;
        }

        // Mettre à jour l'affichage
        const card = this.playersContainer.querySelector(`[data-player-id="${playerId}"]`);
        this.updateCardDisplay(card, player);

        // Sauvegarder
        this.saveToLocalStorage();
    }

    updateCardDisplay(card, player) {
        // Mettre à jour toutes les valeurs affichées
        const statValues = card.querySelectorAll('.stat-value');
        statValues.forEach(valueElement => {
            const statName = valueElement.dataset.stat;
            valueElement.textContent = player.stats[statName];
        });

        // Mettre à jour le total de points
        const pointsValue = card.querySelector('.points-value');
        pointsValue.textContent = player.stats.getTotalPoints();

        // Mettre à jour l'évaluation
        const evaluationValue = card.querySelector('.evaluation-value');
        evaluationValue.textContent = player.stats.getEvaluation();
    }

    removePlayer(playerId) {
        this.showConfirm(
            '🗑️ Supprimer la joueuse',
            'Êtes-vous sûr de vouloir supprimer cette joueuse ?'
        ).then(confirmed => {
            if (confirmed) {
                // Supprimer du tableau
                this.players = this.players.filter(p => p.id !== playerId);

                // Supprimer de l'affichage
                const card = this.playersContainer.querySelector(`[data-player-id="${playerId}"]`);
                if (card) {
                    card.remove();
                }

                this.saveToLocalStorage();
            }
        });
    }

    resetAll() {
        this.showConfirm(
            '🔄 Réinitialiser tout',
            'Êtes-vous sûr de vouloir réinitialiser toutes les statistiques ?'
        ).then(confirmed => {
            if (confirmed) {
                // Réinitialiser les stats de toutes les joueuses
                this.players.forEach(player => {
                    player.stats = new PlayerStats();
                });

                // Recharger l'affichage
                this.playersContainer.innerHTML = '';
                this.players.forEach(player => this.renderPlayer(player));

                this.saveToLocalStorage();
            }
        });
    }

    cloturerMatch() {
        if (this.players.length === 0) {
            this.showAlert('⚠️ Aucune donnée', 'Ajoutez au moins une joueuse avant de clôturer le match.');
            return;
        }

        // Préparer les données pour le récapitulatif
        const recapData = {
            date: new Date().toLocaleString('fr-FR'),
            joueuses: this.players.map(player => ({
                nom: player.name || 'Sans nom',
                stats: player.stats
            }))
        };

        // Stocker temporairement dans sessionStorage
        sessionStorage.setItem('recapMatch', JSON.stringify(recapData));

        // Ouvrir le récapitulatif dans un nouvel onglet
        window.open('recap.html', '_blank');
    }

    exportToJSON() {
        // Préparer les données pour l'export
        const exportData = {
            date: new Date().toISOString(),
            nombreJoueuses: this.players.length,
            joueuses: this.players.map(player => ({
                nom: player.name || 'Sans nom',
                statistiques: {
                    tirs: {
                        interieurs: {
                            tentes: player.stats.tirsIntTentes,
                            reussis: player.stats.tirsIntReussis,
                            pourcentage: player.stats.tirsIntTentes > 0 ? 
                                Math.round((player.stats.tirsIntReussis / player.stats.tirsIntTentes) * 100) : 0
                        },
                        exterieurs: {
                            tentes: player.stats.tirsExtTentes,
                            reussis: player.stats.tirsExtReussis,
                            pourcentage: player.stats.tirsExtTentes > 0 ? 
                                Math.round((player.stats.tirsExtReussis / player.stats.tirsExtTentes) * 100) : 0
                        },
                        trois_points: {
                            tentes: player.stats.tirs3Tentes,
                            reussis: player.stats.tirs3Reussis,
                            pourcentage: player.stats.tirs3Tentes > 0 ? 
                                Math.round((player.stats.tirs3Reussis / player.stats.tirs3Tentes) * 100) : 0
                        },
                        lancers_francs: {
                            tentes: player.stats.lfTentes,
                            reussis: player.stats.lfReussis,
                            pourcentage: player.stats.lfTentes > 0 ? 
                                Math.round((player.stats.lfReussis / player.stats.lfTentes) * 100) : 0
                        }
                    },
                    points: player.stats.getTotalPoints(),
                    rebonds: player.stats.rebonds,
                    passes_decisives: player.stats.passes,
                    interceptions: player.stats.interceptions,
                    contres: player.stats.contres,
                    ballons_perdus: player.stats.balPerdus,
                    fautes: player.stats.fautes,
                    evaluation: player.stats.getEvaluation()
                }
            }))
        };

        // Créer le blob JSON
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // Créer un lien de téléchargement
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Nom du fichier avec la date
        const dateStr = new Date().toISOString().split('T')[0];
        a.download = `stats_basket_${dateStr}.json`;
        
        // Déclencher le téléchargement
        document.body.appendChild(a);
        a.click();
        
        // Nettoyer
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importFromJSON(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Valider les données
                if (!data.joueuses || !Array.isArray(data.joueuses)) {
                    this.showAlert('❌ Erreur', 'Fichier JSON invalide : structure incorrecte');
                    return;
                }

                // Demander confirmation
                this.showConfirm(
                    '📂 Importer les données',
                    `Importer ${data.joueuses.length} joueuse(s) ? Cela remplacera les données actuelles.`
                ).then(confirmed => {
                    if (!confirmed) return;

                    // Effacer les données actuelles
                    this.players = [];
                    this.playersContainer.innerHTML = '';

                    // Importer chaque joueuse
                    data.joueuses.forEach(joueuseData => {
                        const player = {
                            id: Date.now() + Math.random(), // Générer un nouvel ID unique
                            name: joueuseData.nom || '',
                            stats: new PlayerStats()
                        };

                        // Charger les statistiques
                        const stats = joueuseData.statistiques;
                        if (stats) {
                            // Tirs
                            if (stats.tirs) {
                                player.stats.tirsIntTentes = stats.tirs.interieurs?.tentes || 0;
                                player.stats.tirsIntReussis = stats.tirs.interieurs?.reussis || 0;
                                player.stats.tirsExtTentes = stats.tirs.exterieurs?.tentes || 0;
                                player.stats.tirsExtReussis = stats.tirs.exterieurs?.reussis || 0;
                                player.stats.tirs3Tentes = stats.tirs.trois_points?.tentes || 0;
                                player.stats.tirs3Reussis = stats.tirs.trois_points?.reussis || 0;
                                player.stats.lfTentes = stats.tirs.lancers_francs?.tentes || 0;
                                player.stats.lfReussis = stats.tirs.lancers_francs?.reussis || 0;
                            }
                            
                            // Autres stats
                            player.stats.rebonds = stats.rebonds || 0;
                            player.stats.passes = stats.passes_decisives || 0;
                            player.stats.interceptions = stats.interceptions || 0;
                            player.stats.contres = stats.contres || 0;
                            player.stats.balPerdus = stats.ballons_perdus || 0;
                            player.stats.fautes = stats.fautes || 0;
                        }

                        this.players.push(player);
                        this.renderPlayer(player);
                    });

                    this.saveToLocalStorage();
                    this.showAlert('✅ Succès', `Import réussi : ${data.joueuses.length} joueuse(s) importée(s)`);
                });
                
            } catch (error) {
                console.error('Erreur lors de l\'import:', error);
                this.showAlert('❌ Erreur', 'Erreur lors de la lecture du fichier JSON. Vérifiez que le fichier est valide.');
            }
        };

        reader.readAsText(file);
        // Réinitialiser l'input pour permettre de réimporter le même fichier
        event.target.value = '';
    }

    saveToLocalStorage() {
        const data = this.players.map(player => ({
            id: player.id,
            name: player.name,
            stats: player.stats
        }));
        localStorage.setItem('basketStats', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const savedData = localStorage.getItem('basketStats');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                data.forEach(playerData => {
                    const player = {
                        id: playerData.id,
                        name: playerData.name,
                        stats: Object.assign(new PlayerStats(), playerData.stats)
                    };
                    this.players.push(player);
                    this.renderPlayer(player);
                });
            } catch (error) {
                console.error('Erreur lors du chargement des données:', error);
            }
        }
    }
}

// Initialiser l'application au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    new BasketStatsApp();
});
