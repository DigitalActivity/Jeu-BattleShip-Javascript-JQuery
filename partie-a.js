/***
* 	Projet : Jeu Battleship en Javascript
*
*		Description : - Partie-a du jeu Battleship, IA capable de jouer contre un autre joueur
*									- Fonctions utilitaires qui seront aussi utilisées par la partie-b
* 									- Les fonctions utilitaires sont disponibles dans Ubox
*
*		Author : Younes Rabdi 0821450
*		Date : 10/10/2017
*
***/
var Ubox = {}; // Contient les fonctions utilitaires qui seront aussi utilisées par la partie-b

(function($) {
	///Regex///
	var regNom = new RegExp("^[A-Za-z0-9-]+$"); // nom bateau valide
	var regTaille = new RegExp("^([1-5])$"); // taille bateau valide
	var regPosition = new RegExp("^[A-Ja-j][-]([0][1]|[1-9]|10)$"); // position valide de A à J verticalement et de 1 à 10 (ou 01 à 10) horizontal.
	///Fin Regex///

	///IA///
	var IA = function() {
		var dernierMissilePos = ''; // Position du dernier missile lancé
		var positionsPrises = []; // Positions occupées par les Bateaux du AI
		var historique = []; // historique list {position, resultat} avec les missiles lancés et resultat
		var defaultPosesToFindShips = []; // positions default à frapper pour trouver les bateaux de l'enemie
		// Liste bateaux joueurs
		var listeBateauxIA = [
		{ 'nom' : 'porte-avions', 'taille' : 5 },
		{ 'nom' : 'cuirasse', 'taille' : 4 },
		{ 'nom' : 'destroyer', 'taille' : 3 },
		{ 'nom' : 'torpilleur', 'taille' : 3 },
			{ 'nom' : 'sous-marin', 'taille' : 2 }]; // Liste des bateaux du joueur IA
			var listeBateauxAdversaire = [
			{ 'nom' : 'porte-avions', 'taille' : 5 },
			{ 'nom' : 'cuirasse', 'taille' : 4 },
			{ 'nom' : 'destroyer', 'taille' : 3 },
			{ 'nom' : 'torpilleur', 'taille' : 3 },
			{ 'nom' : 'sous-marin', 'taille' : 2 }]; // Les bateaux restants de l'adversaire
		// Proie detecté par le IA 
		var proie = { historique : [], 
			direction : '', 
			traquer : false,
			taille : { max : utileLonguestShip(listeBateauxAdversaire),
				min : utileShortestShip(listeBateauxAdversaire) }
			};

		// placerBateaux()
		this.placerBateaux = function() {
			positionsPrises = []; // Vider le tabelaux des positions prises
			var strategPlacement = new StrategiePlacement(); // Strategy placement
			strategPlacement.definirStrategie(new StrategiePlacementAuHasard()); 
			return strategPlacement.placerBateaux(listeBateauxIA);
		};

		// lancerMissile()
		this.lancerMissile = function() {
			//Ubox.IATargetsToFind = defaultPosesToFindShips; // tests
			var strategLancement = new StrategieMissile(); // strategie lancer missile

			if (defaultPosesToFindShips.length == 0 && historique.length == 0) {
				defaultPosesToFindShips = logiqueIAInitialiserPosesFindShip();
			}

			if (proie.traquer) {
				strategLancement.definirStrategie(new StrategieMissileHuntShip(proie));
			}
			else {
				strategLancement.definirStrategie(new StrategieMissileShootToFind());
			}

			dernierMissilePos = strategLancement.lancerMissile();

			if (dernierMissilePos && dernierMissilePos.hasOwnProperty('str') && utilePosValide(dernierMissilePos.str)) {
				if(utileFindElement(defaultPosesToFindShips, dernierMissilePos) != -1) {
					utileRemoveElement(defaultPosesToFindShips, dernierMissilePos);
				}
				return dernierMissilePos.str;
			}
			else {
				// TODO
			}
		};

		// resultatLancerMissile()
		this.resultatLancerMissile = function(p_resultat) {
			if (isNaN(p_resultat) || dernierMissilePos == '') {
				console.log('resultat en paramettre est invalide ou aucun missile lancé');
				return;
			}
			var donneeHisto;
			// Enregistrer le resultat dans l'historique de IA
			if (dernierMissilePos && dernierMissilePos != '') {
				donneeHisto = { pos : dernierMissilePos, res : p_resultat };
				historique.push(donneeHisto);
			}

			if (p_resultat == 1) {
				proie.traquer = true;
				proie.historique.push(donneeHisto);
			}
			else if (p_resultat != 0) {
				proie = { historique : [], direction : '', 
				taille : { max : utileLonguestShip(listeBateauxAdversaire),
					min : utileShortestShip(listeBateauxAdversaire) }, traquer :false };

					var bateauDetruit = '';
					switch (p_resultat) {
						case 2 : bateauDetruit = 'porte-avions'; break;
						case 3 : bateauDetruit = 'cuirasse'; break;
						case 4 : bateauDetruit = 'destroyer'; break;
						case 5 : bateauDetruit = 'torpilleur'; break;
						case 6 : bateauDetruit = 'sous-marin'; break;
					}
					for (var i = 0; i < listeBateauxAdversaire.length; i++) {
						if (listeBateauxAdversaire[i].nom == bateauDetruit) {
							listeBateauxAdversaire.splice(listeBateauxAdversaire[i], 1);
							break;
						}
					}
				}

			dernierMissilePos = ''; // lancer missile definit la position, resultatMissile recoie le resultat et remet à ''
		};

		// Placement Strategy Design Pattern : Pour definir une strategy de placement
		// source : http://www.dofactory.com/javascript/strategy-design-pattern
		var StrategiePlacement = function() {
			this.strategy = '';
		};
		// Prototype Placement Strategy
		StrategiePlacement.prototype = {
			definirStrategie : function(p_strategie) {
				this.strategy = p_strategie;
			},
			placerBateaux : function(p_bateaux) {
				return this.strategy.placerBateaux(p_bateaux);
			}
		};
		// strategie de placement AuHasard: placer les bateaux au hasard
		var StrategiePlacementAuHasard = function() {
			var positions = {};
			this.placerBateaux = function(p_bateaux) {
				// pour chaque bateau
				for(var i = 0; i < p_bateaux.length; i++) {
					var nomPropriete = p_bateaux[i].nom; // nom du bateau
					var bateauInPosition = false;
					var maxVal = 10 - p_bateaux[i].taille;
					while(!bateauInPosition) {
						var uneCase = logiqueIAChoixCasePourPlacer(maxVal);
						var uneLigne = logiqueIAChoixCasePourPlacer(maxVal);
						var xyPos = utilePosLiteral(uneCase, uneLigne);
						if (xyPos) {
							var poses;
							if (utileGetRandom(1, 3) == 1) {
								poses = utilePlacerBateau(xyPos, 'H', p_bateaux[i].taille, positionsPrises);
							} else {
								poses = utilePlacerBateau(xyPos, 'V', p_bateaux[i].taille, positionsPrises);
							}

							if (poses != null) {
								positionsPrises = positionsPrises.concat(poses);
								positions[nomPropriete] = poses;
								bateauInPosition = true;
							}
						}
					} // Fin while
				}
				return positions;
			};
		};

		// Missiles Strategy Design Pattern : Pour definir une strategie de lancement de missiles
		// source : http://www.dofactory.com/javascript/strategy-design-pattern
		var StrategieMissile = function() {
			this.strategy = '';
		};

		// Prototype Missiles Strategy
		StrategieMissile.prototype = {
			definirStrategie : function(p_strategie) {
				this.strategy = p_strategie;
			},
			lancerMissile : function() {
				return this.strategy.lancerMissile();
			}
		};

		// strategie de lancement de missiles : shoot to find
		var StrategieMissileShootToFind = function() {
			this.lancerMissile = function() {
				if(defaultPosesToFindShips.length == 0 && historique.length != 0) {
					defaultPosesToFindShips = repopulerPositionsShootToFind();
				}

				var pos = estUneBonnePositionToShoot(defaultPosesToFindShips);
				if(pos == null) {
					pos = defaultPosesToFindShips[utileGetRandom(0, defaultPosesToFindShips.length-1)];
				}
				return pos;
			};

			// Trouve les meilleurs positions pour lancer des missiles
			var estUneBonnePositionToShoot = function(p_defaultPoses) {				
				var longuestShip = utileLonguestShip(listeBateauxAdversaire);
				var shortestShip = utileShortestShip(listeBateauxAdversaire);
				var bestPoses = [];
				var mediumPoses = [];
				var toRemovePosition = [];
				for (var i = 0; i < p_defaultPoses.length; i++) {
					var position = p_defaultPoses[i];
					if (utileFindInHistorique(position, historique) == -1) {
						var searchDirections = { up : [], down : [], left : [], right : [] };						
						// search right
						searchDirections.right = searchValidePoses(position, longuestShip, 'right');
						// search left
						searchDirections.left = searchValidePoses(position, longuestShip, 'left');
						// search down
						searchDirections.down = searchValidePoses(position, longuestShip, 'down');
						// search up
						searchDirections.up = searchValidePoses(position, longuestShip, 'up');

						var horizontalTargets = searchDirections.left.concat(searchDirections.right);
						var verticalTargets = searchDirections.up.concat(searchDirections.down);

						if (horizontalTargets.length >= longuestShip && verticalTargets.length >= longuestShip) {
							bestPoses.push(position);
						} 
						else if (horizontalTargets.length >= shortestShip && verticalTargets.length >= shortestShip) {
							mediumPoses.push(position);
						}
					} 
					else {
						toRemovePosition.push(position);
					}
				}

				for(var t = 0; t < toRemovePosition.length; t++) {
					utileRemoveElement(defaultPosesToFindShips, toRemovePosition[t]);
				}

				if (bestPoses.length > 0) {
					return bestPoses[utileGetRandom(0 ,bestPoses.length-1)];
				} 
				else if (mediumPoses.length > 0) {
					return mediumPoses[utileGetRandom(0 ,mediumPoses.length-1)];
				}
				return null;
			};

			// Repopuler les meilleurs position to shoot missile
			var repopulerPositionsShootToFind = function() {
				var searchDirections = { up : [], down : [], left : [], right : [] };
				var maxVal = utileLonguestShip(listeBateauxAdversaire);
				var defaultPoses = [];
				var moinsBonnesPoses = [];
				// Meilleur tactique pour trouver tous les bateaux en 50 coups ou moins
				// source : https://www.youtube.com/watch?v=vP9VKwksDwk
				for (var x = 1; x < 11 ; x++) {
					for (var y = 1; y < 11 ; y++) {
						if (x % 2 == 0 && y % 2 != 0 || (x % 2 != 0 && y % 2 == 0)) {
							var position = utilePosLiteral(x, y);
							if (utileFindInHistorique(position, historique) == -1) {			
								// search right
								searchDirections.right = searchValidePoses(position, maxVal, 'right');
								// search left
								searchDirections.left = searchValidePoses(position, maxVal, 'left');
								// search down
								searchDirections.down = searchValidePoses(position, maxVal, 'down');
								// search up
								searchDirections.up = searchValidePoses(position, maxVal, 'up');

								var horizontalTargets = searchDirections.left.concat(searchDirections.right);
								var verticalTargets = searchDirections.up.concat(searchDirections.down);

								if (horizontalTargets.length >= utileShortestShip(listeBateauxAdversaire) &&
									verticalTargets.length >= utileShortestShip(listeBateauxAdversaire)) {
									defaultPoses.push(utilePosLiteral(x, y));
							} else if(horizontalTargets.length >= utileShortestShip(listeBateauxAdversaire) ||
								verticalTargets.length >= utileShortestShip(listeBateauxAdversaire)) {
								moinsBonnesPoses.push(utilePosLiteral(x, y));
							}
						}
					}
					} // fin for y
				} // fin for x
				defaultPoses = defaultPoses.concat(moinsBonnesPoses);
				if (defaultPoses.length < 1) {
					for (var a = 1; a < 11 ; a++) {
						for (var b = 1; b < 11 ; b++) {
							var pos = utilePosLiteral(a, b);
							if (pos != null && (utileFindInHistorique(pos, historique) == -1)) {
								defaultPoses.push(utilePosLiteral(a, b));
							}
						} // fin for y
					} // fin for x
				}
				return defaultPoses;
			};
		};

		// strategie de lancement de missiles : Hunt Ship
		var StrategieMissileHuntShip = function(p_proie) {
			this.lancerMissile = function() {
				var PosesPotentielles = logiqueIAPredictDirectionProie(p_proie);

				if (PosesPotentielles.length > 0)
					return PosesPotentielles[0];
			}; // fin lancerMissile Hunt Ship
		};

		// Trouver des positions optimales pour lancer les missiles
		function searchValidePoses(p_initialPos, p_max, p_direction, p_resultAExclure) {
			var indexHisto;
			var position;
			var poses = [];
			if (p_direction == 'right') {
				// search right
				for (var i = 1; i < p_max; i++) {
					position = utilePosLiteral(p_initialPos.x + i, p_initialPos.y);
					if (position == null) {
						break;
					}
					indexHisto = utileFindInHistorique(position, historique);
					if (indexHisto != -1) {
						if (p_resultAExclure) {
							if (historique[indexHisto].res != p_resultAExclure)
								break;
						} else break;
					}
					poses.push(position);
					
				}
				return poses;
			}

			if (p_direction == 'left') {
				// search left
				for (var j = -1; j > -p_max; j--) {
					position = utilePosLiteral(p_initialPos.x + j, p_initialPos.y);
					if(position == null) {
						break;
					}
					indexHisto = utileFindInHistorique(position, historique);
					if (indexHisto != -1) {
						if (p_resultAExclure) {
							if (historique[indexHisto].res != p_resultAExclure)
								break;
						} else break;
					}					
					poses.push(position);
					
				}
				return poses;
			}

			if (p_direction == 'down') {
				// search down
				for (var k = 1; k < p_max; k++) {
					position = utilePosLiteral(p_initialPos.x, p_initialPos.y  + k);
					if(position == null) {
						break;
					}
					indexHisto = utileFindInHistorique(position, historique);
					if (indexHisto != -1) {
						if (p_resultAExclure) {
							if (historique[indexHisto].res != p_resultAExclure)
								break;
						} else break;
					}					
					poses.push(position);
					
				}
				return poses;
			}

			if (p_direction == 'up') {
				// search up
				for (var l = -1; l > -p_max; l--) {
					position = utilePosLiteral(p_initialPos.x, p_initialPos.y  + l);
					if(position == null) {
						break;
					}
					indexHisto = utileFindInHistorique(position, historique);
					if (indexHisto != -1) {
						if (p_resultAExclure) {
							if (historique[indexHisto].res != p_resultAExclure)
								break;
						} else break;
					}					
					poses.push(position);
					
				}
				return poses;
			}
		}

		// logique IA à predire la direction d'un bateau traqué
		function logiqueIAPredictDirectionProie(p_proie) {
			var searchDirections = { up : [], down : [], left : [], right : [] };
			var maxVal = p_proie.taille.max + 1;
			var indexHisto;
			var position = utilePosLiteral(p_proie.historique[0].pos.x, p_proie.historique[0].pos.y);
			// search right
			searchDirections.right = searchValidePoses(position, maxVal, 'right', 1);
			// search left
			searchDirections.left = searchValidePoses(position, maxVal, 'left', 1);
			// search down
			searchDirections.down = searchValidePoses(position, maxVal, 'down', 1);
			// search up
			searchDirections.up = searchValidePoses(position, maxVal, 'up', 1);

			var horizontalTargets, verticalTargets;
			if (searchDirections.left.length > searchDirections.right.length)
				horizontalTargets = searchDirections.left.concat(searchDirections.right);
			else 
				horizontalTargets = searchDirections.right.concat(searchDirections.left);

			if (searchDirections.up.length > searchDirections.down.length)
				verticalTargets = searchDirections.up.concat(searchDirections.down);
			else 
				verticalTargets = searchDirections.down.concat(searchDirections.up);

			// Determiner Direction
			var hitsH = 0, hitsV = 0;
			for (var k = 0; k < horizontalTargets.length; k++) {
				if (utileFindInHistorique(horizontalTargets[k], proie.historique) != -1)
					hitsH++;
			}
			for (k = 0; k < verticalTargets.length; k++) {
				if (utileFindInHistorique(verticalTargets[k], proie.historique) != -1) {
					hitsV++;
				}
			}

			if (hitsH > hitsV && horizontalTargets.length >= proie.taille.min) {
				p_proie.direction = 'horizontal';
			}
			else if (hitsH < hitsV || verticalTargets.length >= proie.taille.min) {
				p_proie.direction = 'vertical';
			}
			else {
				p_proie.direction = '';
			}

			// Consolider toutes les positions potentielles
			var toutePosPotentielle = [];
			if (horizontalTargets.length >= proie.taille.min && p_proie.direction != 'vertical') {
				for (k = 0; k < horizontalTargets.length; k++) {
					indexHisto = utileFindInHistorique(horizontalTargets[k], historique);
					if (indexHisto == -1)
						toutePosPotentielle.push(horizontalTargets[k]);
				}
			}

			if (toutePosPotentielle.length <= 0 || p_proie.direction != 'horizontal') {
				for (k = 0; k < verticalTargets.length; k++) {
					indexHisto = utileFindInHistorique(verticalTargets[k], historique);
					if (indexHisto == -1) {
						toutePosPotentielle.push(verticalTargets[k]);
					}
				}
			}

			if(toutePosPotentielle < 1) {

			}

			return toutePosPotentielle;
		}

		// Logique IA de choisir une case pour placer son bateau
		function logiqueIAChoixCasePourPlacer(p_maxval) {
			if (!isNaN(p_maxval) && utileGetRandom(1, 2) == 1) {
				return utileGetRandom(1, p_maxval); // eviter cases du milieu
			}
			else if (!isNaN(p_maxval)  && utileGetRandom(1, 2) == 1 && 7 < p_maxval ) {
				return utileGetRandom(7, p_maxval);// eviter cases du milieu
			}
			else {
				return utileGetRandom(1, p_maxval);// de temps a autre choisir n'import quelle case
			}
		}

		// Initialiser le pattern des positions pour trouver tous les bateaux en 50 coups ou moins
		function logiqueIAInitialiserPosesFindShip() {
			var defaultPoses = [];
			// Meilleur tactique pour trouver tous les bateaux en 50 coups ou moins
			// source : https://www.youtube.com/watch?v=vP9VKwksDwk
			var y, x;
			for (y = 1; y < 11 ; y = y + 3) {
				for (x = 0; x < 11 ; x = x + 3) {
					if (utilePosLiteral(x, y) != null) {
						defaultPoses.push(utilePosLiteral(x, y));
					}
				} // fin for y
			} // fin for x

			for (y = 2; y < 11 ; y = y + 3) {
				for (x = 1; x < 11 ; x = x + 3) {
					if (utilePosLiteral(x, y) != null) {
						defaultPoses.push(utilePosLiteral(x, y));
					}
				} // fin for y
			} // fin for x

			for (y = 3; y < 11 ; y = y + 3) {
				for (x = 2; x < 11 ; x = x + 3) {
					if (utilePosLiteral(x, y) != null) {
						defaultPoses.push(utilePosLiteral(x, y));
					}
				} // fin for y
			} // fin for x
			return defaultPoses;
		} // Fin logique IA Initialiser Poses FindShip

			///Funcions Utilitaires du jeu///
		// Trouve le plus grand bateau non coulé de l'ennemi
		function utileLonguestShip(p_listeBateaux) {
			var plusGrand = p_listeBateaux[0].taille;
			for (var i = 1; i < p_listeBateaux.length; i++) {
				if (plusGrand < p_listeBateaux[i].taille) {
					plusGrand = p_listeBateaux[i].taille;
				}
			}
			return plusGrand;
		}

		// Trouve le plus petit bateau non coulé de l'ennemi
		function utileShortestShip(p_listeBateaux) {
			var plusPetit = p_listeBateaux[0].taille;
			for (var i = 1; i < p_listeBateaux.length; i++) {
				if (plusPetit > p_listeBateaux[i].taille) {
					plusPetit = p_listeBateaux[i].taille;
				}
			}
			return plusPetit;
		}

		// Vérifier si une coordonnée est valide
		function utilePosValide(p_position) {
			return regPosition.test(p_position); // Regex de validation de coordonnée
		}

		// Convertir coordonnées x y en literal : x, y, lettre, str
		function utilePosLiteral(p_x, p_y) {
			if (isNaN(p_x) || isNaN(p_y) || p_x > 10 || p_y > 10 || p_x < 1 || p_y < 1) {
				return null;
			}
			var str = String.fromCharCode(p_y + 64) + '-' + p_x.toString();
			if (!utilePosValide(str)) {
				return null;
			}
			var tokens = str.split("-");
			return {'x' : p_x,
			'y' : tokens[0].charCodeAt(0) % 64, // (A==65)=>LigneNum=1; (B==66)=>LignNum = 2;
			'lettre' : tokens[0].toUpperCase(),
			'str' : str};
		}

		// Convertir string en coordonnées x, y. return literal x, y , lettre, str.
		function utileStringLiteral(p_str) {
			if (!utilePosValide(p_str)) {
				return null;
			}
			var tokens = p_str.split("-");
			return utilePosLiteral(parseInt(tokens[1]), tokens[0].charCodeAt(0) % 64);
		}

		// Obtenir un random
		function utileGetRandom(p_min, p_max) {
			if (!isNaN(p_min) && !isNaN(p_max) && p_max < Number.MAX_VALUE) {
				return Math.floor(Math.random() * (p_max - p_min + 1)) + p_min;
			}
			else {
				return Math.random();
			}
		}

		// Enlever une donnée d'un array
		function utileRemoveElement(array, element) {
			var index = array.indexOf(element);
			if(index > -1) {
				array.splice(index, 1);
			}
			else  {
				console.log('element à enlever est introuvable');
			}
		}

		// Verifier si un array contient une donnée
		function utileFindElement(array, obj) {
			for (var i = 0; i < array.length; i++) {
				if (array[i] === obj) {
					return i;
				}
			}
			return -1;
		}

		// Verifier si historique array contient une position. return l'index de la position, ou -1 si aucune trouvée
		function utileFindInHistorique(p_position, p_historyPosArray) {
			if(!regPosition.test(p_position.str))
				return -1;

			for(var k = 0; k < p_historyPosArray.length; k++) {
				if(p_historyPosArray[k].pos.str == p_position.str) {
					return k;
				}
			}
			return -1;
		}

		// Placer un bateau
		function utilePlacerBateau(p_coordonnee, p_direction, p_taille, p_positionsPrises) {
			if (!p_direction || isNaN(p_taille) || !utilePosValide(p_coordonnee.str)) {
				return null;
			}
			var coordonnees = [];
			var i, maxV, direction;

			if (p_direction.toUpperCase() == 'H' || p_direction.toUpperCase() == 'X') {
				i = p_coordonnee.x;
				maxV = p_taille + p_coordonnee.x;
				direction = 'H';
			}
			else if(p_direction.toUpperCase() == 'V' || p_direction.toUpperCase() == 'Y') {
				i = p_coordonnee.y;
				maxV = p_taille + p_coordonnee.y;
				direction = 'V';
			}
			else return null;
			var pos;
			for(i; i < maxV; i++) {
				if(direction == 'V') {
					pos = utilePosLiteral(p_coordonnee.x, i);
				}
				else if(direction == 'H') {
					pos = utilePosLiteral(i, p_coordonnee.y);
				}

				if (!pos || !utilePosValide(pos.str) ||
					utileFindElement(p_positionsPrises, pos.str) != -1) {
					return null;
			} 
			else {
				coordonnees.push(pos.str);
			}
		}

		if (coordonnees.length > 0) {
			return coordonnees;
		}
		else {
			return null;
		}
	}
	///FIN Function du jeu///
	Ubox.regNom = regNom;
	Ubox.regTaille = regTaille;
	Ubox.regPosition = regPosition;
	Ubox.utileLonguestShip = utileLonguestShip;
	Ubox.utilePosValide = utilePosValide;
	Ubox.utilePosLiteral = utilePosLiteral;
	Ubox.utileStringLiteral = utileStringLiteral;
	Ubox.utileGetRandom = utileGetRandom;
	Ubox.utileRemoveElement = utileRemoveElement;
	Ubox.utileFindElement = utileFindElement;
	Ubox.utileFindInHistorique = utileFindInHistorique;
	Ubox.utilePlacerBateau = utilePlacerBateau;
};
var monIA = new IA();
	///FIN IA///

	///Fonction de competition///
	// DONE : VALIDER L'EXISTENCE DE LA FONCTION
	if (window.Battleship && window.Battleship.ajouterJoueur /*&& $.isFunction(window.Battleship.ajouterJoueur)*/) {
		window.Battleship.ajouterJoueur('Younes PaperBoi', monIA);
	}
	window.IA = monIA; // ajouter IA directement à la fenetre
	///FIN fonction de competition///
})(jQuery);
