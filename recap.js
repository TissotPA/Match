// Classe pour recréer PlayerStats (nécessaire pour les méthodes)
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

    getTotalPoints() {
        const pointsLF = this.lfReussis * 1;
        const pointsTirsInt = this.tirsIntReussis * 2;
        const pointsTirsExt = this.tirsExtReussis * 2;
        const points3pts = this.tirs3Reussis * 3;
        return pointsLF + pointsTirsInt + pointsTirsExt + points3pts;
    }

    getEvaluation() {
        const points = this.getTotalPoints();
        const tirsRates = (this.tirsIntTentes - this.tirsIntReussis) + 
                          (this.tirsExtTentes - this.tirsExtReussis) + 
                          (this.tirs3Tentes - this.tirs3Reussis);
        const lfRates = this.lfTentes - this.lfReussis;
        
        return points + this.rebonds + this.passes + this.interceptions + this.contres - tirsRates - lfRates - this.balPerdus;
    }
}

// Charger et afficher les données
document.addEventListener('DOMContentLoaded', () => {
    const recapDataString = sessionStorage.getItem('recapMatch');
    
    if (!recapDataString) {
        document.body.innerHTML = '<div style="text-align:center;padding:50px;color:white;font-size:1.5em;">❌ Aucune donnée de match disponible</div>';
        return;
    }

    const recapData = JSON.parse(recapDataString);
    
    // Afficher la date
    document.getElementById('matchDate').textContent = `Match du ${recapData.date}`;

    // Reconstituer les objets PlayerStats
    const joueuses = recapData.joueuses.map(j => ({
        nom: j.nom,
        stats: Object.assign(new PlayerStats(), j.stats)
    }));

    // Calculer les statistiques collectives
    const statsCollectives = {
        tirsIntTentes: 0,
        tirsIntReussis: 0,
        tirsExtTentes: 0,
        tirsExtReussis: 0,
        tirs3Tentes: 0,
        tirs3Reussis: 0,
        lfTentes: 0,
        lfReussis: 0,
        points: 0,
        rebonds: 0,
        passes: 0,
        interceptions: 0,
        contres: 0,
        balPerdus: 0,
        fautes: 0
    };

    joueuses.forEach(j => {
        statsCollectives.tirsIntTentes += j.stats.tirsIntTentes;
        statsCollectives.tirsIntReussis += j.stats.tirsIntReussis;
        statsCollectives.tirsExtTentes += j.stats.tirsExtTentes;
        statsCollectives.tirsExtReussis += j.stats.tirsExtReussis;
        statsCollectives.tirs3Tentes += j.stats.tirs3Tentes;
        statsCollectives.tirs3Reussis += j.stats.tirs3Reussis;
        statsCollectives.lfTentes += j.stats.lfTentes;
        statsCollectives.lfReussis += j.stats.lfReussis;
        statsCollectives.points += j.stats.getTotalPoints();
        statsCollectives.rebonds += j.stats.rebonds;
        statsCollectives.passes += j.stats.passes;
        statsCollectives.interceptions += j.stats.interceptions;
        statsCollectives.contres += j.stats.contres;
        statsCollectives.balPerdus += j.stats.balPerdus;
        statsCollectives.fautes += j.stats.fautes;
    });

    // Afficher les stats collectives
    const calculatePercentage = (reussis, tentes) => {
        if (tentes === 0) return '0%';
        return Math.round((reussis / tentes) * 100) + '%';
    };

    document.getElementById('tirsIntPct').textContent = calculatePercentage(statsCollectives.tirsIntReussis, statsCollectives.tirsIntTentes);
    document.getElementById('tirsIntDetail').textContent = `${statsCollectives.tirsIntReussis}/${statsCollectives.tirsIntTentes}`;
    
    document.getElementById('tirsExtPct').textContent = calculatePercentage(statsCollectives.tirsExtReussis, statsCollectives.tirsExtTentes);
    document.getElementById('tirsExtDetail').textContent = `${statsCollectives.tirsExtReussis}/${statsCollectives.tirsExtTentes}`;
    
    document.getElementById('tirs3Pct').textContent = calculatePercentage(statsCollectives.tirs3Reussis, statsCollectives.tirs3Tentes);
    document.getElementById('tirs3Detail').textContent = `${statsCollectives.tirs3Reussis}/${statsCollectives.tirs3Tentes}`;
    
    document.getElementById('lfPct').textContent = calculatePercentage(statsCollectives.lfReussis, statsCollectives.lfTentes);
    document.getElementById('lfDetail').textContent = `${statsCollectives.lfReussis}/${statsCollectives.lfTentes}`;
    
    document.getElementById('pointsTotal').textContent = statsCollectives.points;
    document.getElementById('rebondsTotal').textContent = statsCollectives.rebonds;
    document.getElementById('passesTotal').textContent = statsCollectives.passes;
    document.getElementById('interceptionsTotal').textContent = statsCollectives.interceptions;
    document.getElementById('contresTotal').textContent = statsCollectives.contres;
    document.getElementById('balPerdusTotal').textContent = statsCollectives.balPerdus;
    document.getElementById('fautesTotal').textContent = statsCollectives.fautes;

    // Afficher les stats individuelles
    const playersRecapContainer = document.getElementById('playersRecap');
    
    joueuses.forEach(joueuse => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-recap-card';
        
        playerCard.innerHTML = `
            <div class="player-recap-header">
                <div class="player-recap-name">${joueuse.nom}</div>
                <div class="player-recap-points">
                    <span class="player-recap-points-label">Points</span>
                    ${joueuse.stats.getTotalPoints()}
                </div>
            </div>
            
            <div class="player-stats-grid">
                <div class="player-stat-item">
                    <div class="player-stat-label">Tirs Intérieurs</div>
                    <div class="player-stat-value">${calculatePercentage(joueuse.stats.tirsIntReussis, joueuse.stats.tirsIntTentes)}</div>
                    <div class="player-stat-percentage">${joueuse.stats.tirsIntReussis}/${joueuse.stats.tirsIntTentes}</div>
                </div>
                
                <div class="player-stat-item">
                    <div class="player-stat-label">Tirs Extérieurs</div>
                    <div class="player-stat-value">${calculatePercentage(joueuse.stats.tirsExtReussis, joueuse.stats.tirsExtTentes)}</div>
                    <div class="player-stat-percentage">${joueuse.stats.tirsExtReussis}/${joueuse.stats.tirsExtTentes}</div>
                </div>
                
                <div class="player-stat-item">
                    <div class="player-stat-label">3 Points</div>
                    <div class="player-stat-value">${calculatePercentage(joueuse.stats.tirs3Reussis, joueuse.stats.tirs3Tentes)}</div>
                    <div class="player-stat-percentage">${joueuse.stats.tirs3Reussis}/${joueuse.stats.tirs3Tentes}</div>
                </div>
                
                <div class="player-stat-item">
                    <div class="player-stat-label">Lancers Francs</div>
                    <div class="player-stat-value">${calculatePercentage(joueuse.stats.lfReussis, joueuse.stats.lfTentes)}</div>
                    <div class="player-stat-percentage">${joueuse.stats.lfReussis}/${joueuse.stats.lfTentes}</div>
                </div>
                
                <div class="player-stat-item">
                    <div class="player-stat-label">Rebonds</div>
                    <div class="player-stat-value">${joueuse.stats.rebonds}</div>
                </div>
                
                <div class="player-stat-item">
                    <div class="player-stat-label">Passes Décisives</div>
                    <div class="player-stat-value">${joueuse.stats.passes}</div>
                </div>
                
                <div class="player-stat-item">
                    <div class="player-stat-label">Interceptions</div>
                    <div class="player-stat-value">${joueuse.stats.interceptions}</div>
                </div>
                
                <div class="player-stat-item">
                    <div class="player-stat-label">Contres</div>
                    <div class="player-stat-value">${joueuse.stats.contres}</div>
                </div>
                
                <div class="player-stat-item">
                    <div class="player-stat-label">Ballons Perdus</div>
                    <div class="player-stat-value">${joueuse.stats.balPerdus}</div>
                </div>
                
                <div class="player-stat-item">
                    <div class="player-stat-label">Fautes</div>
                    <div class="player-stat-value">${joueuse.stats.fautes}</div>
                </div>
            </div>
            
            <div class="player-evaluation">
                <div class="player-evaluation-label">Évaluation</div>
                <div class="player-evaluation-value">${joueuse.stats.getEvaluation()}</div>
            </div>
        `;
        
        playersRecapContainer.appendChild(playerCard);
    });
});
