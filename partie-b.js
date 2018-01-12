/***
* 	Projet : Jeu Battleship en Javascript
*
*		Description : - Partie-b du jeu Battleship, Controlleur du jeu 
*
*		Author : Younes Rabdi 0821450
*		Date : 10/10/2017
*		Last Modification : 18/10/2017
***/

(function($) {
  // Créer le tableau du jeu
  $.fn.creerTableau = function() {
    $(this).append('<div class="row">');
    for (var j = 0; j <= 10; j++) {
      $(this).append('<div class="col-xs-1 carre txtcol text-center"><h5>' + j + '</h5></div>');
    }
    $(this).append('</div>');

    for (j = 1; j <= 10; j++) {
      $(this).append('<div class="row">');
      var i = 1;
      $(this).append('<div class="col-xs-1 carre txtligne text-center"><h5>' + Ubox.utilePosLiteral(i, j).lettre + '</h5></div>');
      for (i = 1; i <= 10; i++) {
        $(this).append('<div class="col-xs-1 carre" id="' + Ubox.utilePosLiteral(i, j).str + '"></div>');
      }
      $(this).append('</div>');
    }
    return $(this).redimentionnerFenetre();
  };

  // Redimentionner les elements de la fenetre
  $.fn.redimentionnerFenetre = function() {
    var wid = $(this).width();
    $('.carre').css({
      width : wid/12,
      height: wid/12
    });

    wid *= 1.7;
    $('.radar').css({
      width : wid,
      height: wid,
      'margin-left': -wid / 2,
      'margin-top': -wid / 2
    });

    $('.placedShip').css({
      width : wid/12 * $('#' + $(this).attr("id")).data("taille"),
      height: wid/12
    });

    $('.selectedShip').css({
      width : wid/12 * $('#' + $(this).attr("id")).data("taille"),
      height: wid/12
    });
  };

  // Controlleur du jeu : anime le jeu, ecoute les evenements et fait jouer a tour de role
  var battleShipController = function() {
    var	self	=	this;
    var listeBateauxJ1 = [
			{'nom' : 'porte-avions', 'taille' : 5 },
			{'nom' : 'cuirasse', 'taille' : 4},
			{'nom' : 'destroyer', 'taille' : 3},
			{'nom' : 'torpilleur', 'taille' : 3},
			{'nom' : 'sous-marin', 'taille' : 2}]; // Liste des bateaux du joueur 1
		var listeBateauxJ2 = [
			{'nom' : 'porte-avions', 'taille' : 5 },
			{'nom' : 'cuirasse', 'taille' : 4},
			{'nom' : 'destroyer', 'taille' : 3},
			{'nom' : 'torpilleur', 'taille' : 3},
			{'nom' : 'sous-marin', 'taille' : 2}];

    // Commencer une partie
    this.commencerPartie = function()  {
      $('.startGame').css('display','none');
      $('.bateauxjoueur').css('display','block');
      self.placerBateauxJ1();
      self.placerBateauxJ2();
    };

    // Placer les bateaux du joueur 1
    var positionsChoisies = [];
    this.placerBateauxJ1 = function() {
      var $selectedship;
      var $direction;
      $('.bateauxjoueur').on('click', '.selectable',function(e) {
        if ($selectedship && e.target.id == $selectedship.id) {
		        return;
        } else if ($selectedship) {
			      $selectedship.remove();
			      $('#contentTabBateaux .carre').off("contextmenu");
		    }

        $selectedShip = $('#' + e.target.id).clone();
        $selectedShip.removeClass('bateaujoueur');
        $direction = 'h';
        var imgBateau = document.createElement("img");
        imgBateau.setAttribute("src", $selectedShip.attr('src'));
        imgBateau.setAttribute("class", 'selectedShip');
        imgBateau.setAttribute("width", $('.carre').width() * $($selectedShip).data("taille"));
        imgBateau.setAttribute("height", $('.carre').height());
        imgBateau.setAttribute("id", e.target.id);
        imgBateau.style.opacity = 1;
        imgBateau.style.position = "absolute";
        $selectedship = imgBateau;
        $('#contentTabBateaux').append($selectedship);

        // Evenement clique droit dans tableaux des bateaux
        $('#contentTabBateaux .carre').on("contextmenu", function(evt) {
          var _left;
           var _top;
          if ($selectedship && $direction == 'h') {
            _left = $('.selectedShip').position().left;
            _top = $('.selectedShip').position().top ;
            $('.selectedShip').position().left = $('#' + evt.target.id).position().left + "px";
            $('.selectedShip').position().top = $('#' + evt.target.id).position().top + "px";
            $('.selectedShip').css({
              "-webkit-transform": "rotate(90deg)",
              "-moz-transform": "rotate(90deg)",
              "transform": "rotate(90deg)" /* For modern browsers(CSS3) */
            });
            $direction = 'v';
          }
          else if ($selectedship && $direction == 'v') {
            _left = $('.selectedShip').position().left;
            _top = $('.selectedShip').position().top;
            $('.selectedShip').position().left = $('#' + evt.target.id).position().left + ($('.carre').width()  * $($selectedShip).data("taille")) + "px";
            $('.selectedShip').position().top = $('#' + evt.target.id).position().top - ($('.carre').width()  * $($selectedShip).data("taille")) + "px";
            $('.selectedShip').css({
              "-webkit-transform": "rotate(0deg)",
              "-moz-transform": "rotate(0deg)",
              "transform": "rotate(0deg)" /* For modern browsers(CSS3)*/
            });
            $direction = 'h';
          }

          var coordonee = Ubox.utileStringLiteral(evt.target.id);
          if(coordonee == null)
			     return;
          var x = Ubox.utilePlacerBateau(coordonee, $direction, $($selectedShip).data("taille"), positionsChoisies);
          if(x != null) {
            colorifyPossibleCases(x);
          }
        });
      }); /* fin on click*/

      // Evenement mouseover dans tableaux des bateaux
      $('#contentTabBateaux').on('mouseover', '.carre', function(e) {
        if($selectedship) {
          var coordonee = Ubox.utileStringLiteral(e.target.id);
          if(coordonee == null)
			return;
          var x = Ubox.utilePlacerBateau(coordonee, $direction, $($selectedShip).data("taille"), positionsChoisies);
          if(x != null) {
            colorifyPossibleCases(x);
          }
        }
      });

      // Evenement clique dans tableaux des bateaux
      $('#contentTabBateaux').on('click', '.carre', function(e) {
        positionnerBateau(e);
      });

      // Colorier les cases possibles
      function colorifyPossibleCases(p_cases) {
        $('#contentTabBateaux .carre').removeClass('possiblePoses');
        for (var i = 0; i < listeBateauxJ1.length; i++) {
          if ($selectedship.id == listeBateauxJ1[i].nom) {
            listeBateauxJ1[i].positions = p_cases;
            for(var j = 0; j < listeBateauxJ1[i].positions.length; j++) {
              $('div#contentTabBateaux .carre#' + listeBateauxJ1[i].positions[j]).addClass('possiblePoses');
            }
            break;
          }
        }

        if ($direction == 'v') {
          $selectedship.style.left = $('#' + p_cases[0]).position().left - ($('.carre').width() * $($selectedShip).data("taille")) + "px";
          $selectedship.style.top = $('#' + p_cases[0]).position().top + ($('.carre').width() * $($selectedShip).data("taille")) + "px";
        } else if ($direction == 'h') {
          $selectedship.style.left = $('#' + p_cases[0]).position().left + "px";
          $selectedship.style.top = $('#' + p_cases[0]).position().top + "px";
        }
      }

      // Colorier les cases qui contiennent les bateaux du joueur
      function colorifyChosenCases(p_cases) {
        $('#contentTabBateaux .carre').removeClass('chosenPoses');
        for(var j = 0; j < p_cases.length; j++) {
          $('div#contentTabBateaux .carre#' + p_cases[j]).addClass('chosenPoses');
        }
      }

      // Placer un bateau visuellement sur la table des bateaux du joueur
      function positionnerBateau(e) {
        if ($selectedship) {
          var coordonee = Ubox.utileStringLiteral(e.target.id);
          if(coordonee == null)
          return;

          var x = Ubox.utilePlacerBateau(coordonee, $direction, $($selectedShip).data("taille"), positionsChoisies);
          if (x != null) {
            positionsChoisies = positionsChoisies.concat(x);
            $('#contentTabBateaux .carre').off();
            $('#' + $($selectedship).attr('id')).off().removeClass('selectable').css('opacity', 0.5);
            colorifyChosenCases(positionsChoisies);
            $selectedship.style.left = $(e.target).css("left") + "px";
            $selectedship.style.top = $(e.target).css("top") + "px";
            $selectedShip.removeClass('selectedShip');
            $selectedShip.addClass('placedShip');
            //$selectedShip.style.opacity = 1;
            //$('#contentTabBateaux').append($selectedship.cloneNode(true));
            $selectedship.remove();
            $selectedShip = undefined;

            if ($('.selectable').length == 0) {
              $('.accepterPositions').css('opacity', 1);
              $('.accepterPositions').attr('onclick', 'accepterPositions()');
            }
          }
        }
      }
    }; // fin placerBateauxJoueur1

    // Placer les bateaux du joueur2 (IA)
    this.placerBateauxJ2 = function() {
      var tempListeJ2 = window.IA.placerBateaux();
      for (var i = 0; i < listeBateauxJ2.length; i++) {
        if (tempListeJ2.hasOwnProperty(listeBateauxJ2[i].nom)) {
          listeBateauxJ2[i].positions = tempListeJ2[listeBateauxJ2[i].nom];
        }
      }
    };

    // Accepter les positions choisies
    this.accepterPoses = function() {
      $('.bateauxjoueur').css('display', 'none');
      $('#contentTabAttaques').css('display', 'block');
      commencerAttacks();
    };

    // Reset la table des bateaux
  this.resetPositions = function() {
    positionsChoisies = [];
    for (var i = 0; i < listeBateauxJ1.length; i++) {
      listeBateauxJ1[i].positions = [];
    }
    $('#contentTabBateaux .carre').removeClass('chosenPoses').removeClass('possiblePoses');
    $('.bateauxjoueur .bateaujoueur').removeClass('selectable').addClass('selectable').css('opacity', 1);
  };

  // placer les bateaux automatiquement 
  this.autoPlacerBateaux = function() {
    var positions = {};
    var positionsChoisies = [];
    // pour chaque bateau
    for (var i = 0; i < listeBateauxJ1.length; i++) {
      var nomPropriete = listeBateauxJ1[i].nom; // nom du bateau
      var bateauInPosition = false;
      var maxVal = 10 - listeBateauxJ1[i].taille;
      while(!bateauInPosition) {
        var uneCase = autoChoixCasePourPlacer(maxVal);
        var uneLigne = autoChoixCasePourPlacer(maxVal);
        var xyPos = Ubox.utilePosLiteral(uneCase, uneLigne);
        if (xyPos) {
          var poses;
          if (Ubox.utileGetRandom(1, 3) == 1)
          	poses = Ubox.utilePlacerBateau(xyPos, 'H', listeBateauxJ1[i].taille, positionsChoisies);
          else
          	poses = Ubox.utilePlacerBateau(xyPos, 'V', listeBateauxJ1[i].taille, positionsChoisies);
          if (poses != null) {
            positionsChoisies = positionsChoisies.concat(poses);
            positions[nomPropriete] = poses;
            bateauInPosition = true;
          }
        }
      } // Fin while
    }

    for (var j = 0;j < listeBateauxJ1.length; j++) {
      if (positions.hasOwnProperty(listeBateauxJ1[j].nom)) {
        listeBateauxJ1[j].positions = positions[listeBateauxJ1[j].nom];
      }
    }
    var colorierPoses = [];
    for (var k = 0; k < listeBateauxJ1.length; k++) {
      colorierPoses = colorierPoses.concat(listeBateauxJ1[k].positions);
    }

    $('#contentTabBateaux .carre').removeClass('chosenPoses').removeClass('possiblePoses');
    $('.bateauxjoueur .bateaujoueur').removeClass('selectable').css('opacity', 0.5);
    for (var l = 0; l < colorierPoses.length; l++) {
      $('div#contentTabBateaux .carre#' + colorierPoses[l]).addClass('chosenPoses');
    }
  }; // Fin autoPlacerBateaux

  // Commencer les attaques
  var commencerAttacks = function() {
    for (var c = 0; c < listeBateauxJ1.length; c++) {
      listeBateauxJ1[c].enVie = listeBateauxJ1[c].positions.slice(0);
      listeBateauxJ2[c].enVie = listeBateauxJ2[c].positions.slice(0);
      listeBateauxJ1[c].detruit = false;
      listeBateauxJ2[c].detruit = false;
      var selector = $('.bateautailletext#' + listeBateauxJ1[c].nom);
      var image = $('img#' + listeBateauxJ1[c].nom);
      image.css('display', 'none');
      selector.each(function( index ) {
        //console.log( index + ": " + $( this ) );
        $(this).css('display', 'inline-block');
        drawMyImage(this, image.first(), listeBateauxJ1[c].enVie.length, 25, 'white');
      });

    }

    var controlleur = new partieControlleur();
    // Premier joueur au hasard
    var PremierAJouer = Ubox.utileGetRandom(1,10);
    var message, selecteur;
    if (PremierAJouer > 5) { // 50% IA en premier
      setTimeout(function() {
            controlleur.j2Attack(window.IA.lancerMissile());
      }, 2000);
      message = "IA PaperBoi Commence les attaques";
      selecteur = $('#contentTabBateaux');
    } else  {
      message = "Vous Commencez les attaques";
      selecteur = $('#contentTabAttaques');
      controlleur.prochain = "J1"; // 50% Joueur1 en premier
    }
    selecteur.first().notify(message, {className: "success", position:"top right" });

    $('#contentTabAttaques').on('mouseover', '.carre', function(e) {
      var coordonee = Ubox.utileStringLiteral(e.target.id.toString());
      if(coordonee == null || controlleur.prochain != "J1")
        return;
      $('div#contentTabAttaques .carre').removeClass('missilePos');
      $('div#contentTabAttaques .carre#' + coordonee.str).css('cursor', 'crosshair');
      $('div#contentTabAttaques .carre#' + e.target.id.toString()).addClass('missilePos');
    });

    $('#contentTabAttaques').on('click', '.carre', function(e) {
      var coordonee = Ubox.utileStringLiteral(e.target.id.toString());
      if(coordonee == null || controlleur.prochain != "J1")
        return;
      $('div#contentTabAttaques .carre').removeClass('missilePos');
      $('div#contentTabAttaques .carre#' + coordonee.str).css('cursor', 'crosshair');
      controlleur.j1Attack(coordonee.str);
    });
  }; // Fin commencerAttacks

  // Partie controlleur : Determiner le premier a jouer et fait jouer a tour de role
  var partieControlleur = function() {
    var me = this;
    this.j1Attack = function(p_strPos) {
      var poses = [p_strPos];
      var resultat = lancerAttaque(p_strPos, listeBateauxJ2);
      if (resultat == 1) { // Touché
        var bat = verifierDestruction(listeBateauxJ2);
        if (bat && bat.nom != null) {
          resultat = bat.numValue;
          poses = bat.positions;
          if (verifierFin(listeBateauxJ2)) {
            $.notify("Vous avez gagné. Bravo",{className: "info", globalPosition: 'top right'});
            animerAttaque(resultat, poses);
            $('#contentTabAttaques').off();
            $('.startGame').css('display','inline-block').text('Jouer une autre parite').attr('onclick', 'window.location.reload()');
            return;
          } else {
            $.notify("Bateau ennemi: " + bat.nom + " a coulé.",{className: "success", globalPosition: 'bottom right'});
          }
        }
      }
      animerAttaque(resultat, poses);
      me.prochain = "J2";
      setTimeout(function() { me.j2Attack(window.IA.lancerMissile()); }, 1500);

    };

    // Joueur 2 Attaque
    this.j2Attack = function(p_strPos) {
      var poses = [p_strPos];

      var resultat = lancerAttaque(p_strPos, listeBateauxJ1);
      if (resultat == 1) { // Touché
        var bat = verifierDestruction(listeBateauxJ1);
        if (bat && bat.nom != null) {
          resultat = bat.numValue;
          poses = bat.positions;
          if (verifierFin(listeBateauxJ1)) {
            $.notify("Vous avez perdu. PaperBoi a gagné cette fois",{className: "info", globalPosition: 'top right'});
            //setTimeout(function() { window.location.reload(); }, 5000);
            animerAttaque(resultat, poses);
            $('.startGame').css('display','inline-block').text('Jouer une autre parite').attr('onclick', 'window.location.reload()');
            return;
          } else {
            $.notify("Votre bateau: " + bat.nom + " a coulé.",{className: "info", globalPosition: 'bottom right'});
          }
        }
      }
      animerAttaque(resultat, poses);
      window.IA.resultatLancerMissile(resultat);
      setTimeout(function(){ me.prochain = "J1"; }, 500);
    };

    // Animer une attaque
    var animerAttaque = function(p_resultat, p_position) {
      if(!Ubox.utilePosValide(p_position[0]))
        return;
      var resultatClass;
      switch(p_resultat) {
        case 0 : resultatClass = 'missed'; break;
        case 1 : resultatClass = 'touched'; break;
        case 2 : resultatClass = 'destroyed'; break;
        case 3 : resultatClass = 'destroyed'; break;
        case 4 : resultatClass = 'destroyed'; break;
        case 5 : resultatClass = 'destroyed'; break;
        case 6 : resultatClass = 'destroyed'; break;
      }
      var tab;
      if(me.prochain == 'J1')
        tab = '#contentTabAttaques';
      else tab = '#contentTabBateaux';

      for(var t = 0; t < p_position.length; t++) {
        var selecteur = $( tab + " .carre#" + p_position[t]);
            selecteur.effect("shake", 500 + (p_resultat * 100)).addClass(resultatClass);
      }
    };

    // Attaquer, verifier le resultat et creer les effets en consequences
    var lancerAttaque = function(p_strPos, p_listBateauxAdversaire) {
      var strPos = Ubox.utileStringLiteral(p_strPos);
      if (strPos == null)
        return null;

      for (var c = 0; c < p_listBateauxAdversaire.length; c++) {
        var idx = Ubox.utileFindElement(p_listBateauxAdversaire[c].enVie, strPos.str);
        if (idx != -1) {
          Ubox.utileRemoveElement(p_listBateauxAdversaire[c].enVie, strPos.str);
          var tab;
          if(me.prochain == 'J1')
            tab = '.bateauxIA';
          else tab = '.bateauxjoueur';
          var selector = $(tab + ' .bateautailletext#' + p_listBateauxAdversaire[c].nom);
          var image = $(tab + ' img#' + p_listBateauxAdversaire[c].nom);
          var tailleEnVie = (p_listBateauxAdversaire[c].positions.length - p_listBateauxAdversaire[c].enVie.length);
          tailleEnVie = p_listBateauxAdversaire[c].positions.length - tailleEnVie;
          var coulTxt = 'white';
          switch (tailleEnVie) {
            case 0: coulTxt = 'DarkRed'; break;
            case 1: coulTxt = 'Red'; break;
            case 2: coulTxt = 'OrangeRed'; break;
            case 3: coulTxt = 'Gold'; break;
            case 4: coulTxt = 'Khaki'; break;
          }
          // ne pas montrer le bateau touché de IA, jusqua qu'il soit coulé
          selector.each(function(index) {
            $(this).css('display', 'inline-block');
            if (tab == '.bateauxjoueur') {
              drawMyImage(this, image.first(), p_listBateauxAdversaire[c].enVie.length, 25, coulTxt);
              $(this).css( 'opacity', tailleEnVie / 10 + 0.4);
            }
            else if(tailleEnVie == 0) {
              drawMyImage(this, image.first(), '0', 25, 'DarkRed');
              $(this).css( 'opacity', tailleEnVie / 10 + 0.4);
            }

          });
         return 1;
        }
      }
      return 0;
    };

    // Verifier si un bateau et detruit
    var verifierDestruction = function(p_listBateauxJ) {
      var bateau = {};
      for (var c = 0; c < p_listBateauxJ.length; c++) {
        if (p_listBateauxJ[c].enVie.length == 0 && !p_listBateauxJ[c].detruit) {
          bateau.nom = p_listBateauxJ[c].nom;
          p_listBateauxJ[c].detruit = true;
          bateau.positions = p_listBateauxJ[c].positions;
          switch(bateau.nom) {
            case 'porte-avions' : bateau.numValue = 2; break;
            case 'cuirasse' : bateau.numValue = 3; break;
            case 'destroyer' : bateau.numValue = 4; break;
            case 'torpilleur' : bateau.numValue = 5; break;
            case 'sous-marin' : bateau.numValue = 6; break;
          }
          return bateau;
        }
      }
      return null;
    };

    // Verifier si c'est la fin de la partie
    var verifierFin = function(p_listBateauxJ) {
      var enVie = false;
      for (var r = 0; r < p_listBateauxJ.length; r++) {
        if (p_listBateauxJ[r].enVie.length > 0) {
          enVie = true;
          break;
        }
      }
      return !enVie;
    };
  }; // Fin controlleur

  // Dessiner un canvas et une image et du texte on top
  function drawMyImage(p_canvas, p_image, p_text, p_txtSize, p_txtColor) {
    var canvas = p_canvas;
      canvas.width = p_image.width();
      canvas.height = $('.carre').width() * 1.5;
      canvas.crossOrigin = "Anonymous";
      /*canvas.style.top = p_image.position().top;
      canvas.style.left = p_image.position().left;*/
    var ctx = canvas.getContext('2d');
      ctx.drawImage(p_image.get(0), 0, 0, canvas.width, canvas.height);
      ctx.font = p_txtSize + "pt Verdana";
      //redraw image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(p_image.get(0), 0, 0,canvas.width, canvas.height);
      //refill text
      ctx.fillStyle = p_txtColor;
      ctx.fillText(p_text, 0, 25);
      return ctx;
  }

  // choisir une case au hasard
  function autoChoixCasePourPlacer(p_maxval) {
    if (!isNaN(p_maxval) && Ubox.utileGetRandom(1, 2) == 1)
      return Ubox.utileGetRandom(1, p_maxval); // eviter cases du milieu
    else if (!isNaN(p_maxval)  && Ubox.utileGetRandom(1, 2) == 1 && 7 < p_maxval )
      return Ubox.utileGetRandom(7, p_maxval);// eviter cases du milieu
    else
      return Ubox.utileGetRandom(1, p_maxval);// de temps a autre choisir n'import quelle case
  }
}; // FIN BattleshipController

window.battleShipCont = new battleShipController(); // ajouter controlleur à la fenetre

})(jQuery);
