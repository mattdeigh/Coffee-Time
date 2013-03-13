var tone;
if($.sound.support) {
  tone = $.sound.load('/resources/tone');
}

$(document).ready(function(){
  // Disable default pinch/etc.
  document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
  $.getJSON('resources/brewMethods.json',function(data){
    /*
     * Set up the Slider pages
     */
    mainView = new SwipeView('#wrapper', { numberOfPages: 3, loop: false });
    $(mainView.masterPages[1]).append(ich.home({methods: _(data).keys().map(function(name){return {'name': name};})}));
    $(mainView.masterPages[2]).append(ich.weights());
    $(mainView.masterPages[0]).append(ich.timer());
    
    // Program variables
    var brewMethod = $('#brew-methods option:selected').val();
    var ratio = data[brewMethod]["default-ratio"];
    var gMassCoffee = {};
    var gMassWater = {};
    
    /*
     * Navigation
     */
    hashName = [ 'home', 'weights', 'timer'];
    mainView.onFlip(function () {
      $('#nav .selected').removeClass('selected');
      $('#dot'+mainView.pageIndex).addClass('selected');
      window.location.hash = hashName[mainView.pageIndex];
    });

    mainView.onMoveOut(function () {
      mainView.masterPages[mainView.currentMasterPage].className = mainView.masterPages[mainView.currentMasterPage].className.replace(/(^|\s)swipeview-active(\s|$)/, '');
    });

    mainView.onMoveIn(function () {
      var className = mainView.masterPages[mainView.currentMasterPage].className;
      /(^|\s)swipeview-active(\s|$)/.test(className) || (mainView.masterPages[mainView.currentMasterPage].className = !className ? 'swipeview-active' : className + ' swipeview-active');
    });

    /*
     * Set up the Main page
     */

    /*
     * Set up the weights scrollers
     */
    
    //Your code for each page load here
    $("#coffee-scroller").mobiscroll({
     onChange: function(text, inst) {
       $("#water-scroller").mobiscroll('setValue', [parseInt(text)*ratio, 'g'], true);
     },
     wheels:[{
       'mass': gMassCoffee,
       'units':{
         g:'g'
       }
     }], 
     display: 'inline',
     height: 25,
     showLabel: false
    });
    $("#water-scroller").mobiscroll({
     onChange: function(text, inst) {
       var coffeeVal = typeof gMassCoffee[Math.ceil(parseInt(text)/ratio)] == 'number' ? Math.ceil(parseInt(text)/ratio) : Math.floor(parseInt(text)/ratio);
       console.log(coffeeVal);
       $("#coffee-scroller").mobiscroll('setValue', [coffeeVal, 'g'], true);
     },
     wheels:[{
       'mass': gMassWater,
       'units':{
         g:'g'
       }
     }], 
     display: 'inline',
     height: 25,
     showLabel: false
    });

    var setScrollers = function(ratio) {
      gMassCoffee = {};
      gMassWater = {};
      _.each(_.range(8,73,4), function (n) {
        gMassCoffee[n] = n;
        gMassWater[Math.round(n*ratio)] = Math.round(n*ratio);
      });

      $("#coffee-scroller").mobiscroll('option', 'wheels', [{
        'mass': gMassCoffee,
        'units':{
          g:'g'
        }
      }]);
      $("#water-scroller").mobiscroll('option', 'wheels', [{
        'mass': gMassWater,
        'units':{
          g:'g'
        }
      }]);
    };
    setScrollers(ratio);
     /*
      * Set up the Countdown Timer
      */
    var bloomCallback = function(days, hours, minutes, seconds){
        if(minutes+seconds == 0) {
          tone.play();
          cd.setLeft(2*60);
          cd.setCallback(infusionCallback);
          var head = $("#timerPage h1");
          head.addClass('animated fadeOut');
          head.bind( 'animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', function(){ 
            head.text("Infusion");
            head.removeClass("fadeOut");
            head.addClass('animated fadeIn');
            head.bind( 'animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', function(){
              head.removeClass("fadeIn");
              head.addClass("animated flash");
              head.bind( 'animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', function(){
                head.removeClass("animated flash");
              });
            }); 
          });
        }
      };
    var infusionCallback = function(days,hours,minutes,seconds){
            if(minutes+seconds == 0) {
              tone.play();
              console.log('all done!');
              cd.pause();
            }
          }

    var cd = $('#countdown').countdown({
      left: 2,
      callback: bloomCallback
    });


    var startButton = $("#start-timer-button");
    startButton.bind('tapone',function(){
      cd.start();
      startButton.detach();

      $("#timerPage").append(
        '<div id="pause-timer-button" class="button half-button">Pause</div>\
        <div id="reset-timer-button" class="button half-button">Reset</div>'
      );

      $("#pause-timer-button").bind('tapone',function(){
        if(cd._start){
          cd.pause();
          $("#pause-timer-button").text("Resume");
        } else {
          cd.resume();
          $("#pause-timer-button").text("Pause");
        }
      });

      $("#reset-timer-button").bind('tapone',function(){
        cd.pause();
        cd.setLeft(30);
        cd.setCallback(bloomCallback);
        $("#timerPage h1").text("Bloom");
        $("#pause-timer-button").remove();
        $("#reset-timer-button").remove();
        $("#timerPage").append(startButton);
      });
    });
    
    window.showValue = function(val) {
      brewMethod = val;
      ratio = data[brewMethod]["default-ratio"];

      setScrollers(ratio);
    }

    /*
     * Routing
     */
    var goHome = _.partial(mainView.goToPage, 0).bind(mainView);
    var goWeights = _.partial(mainView.goToPage, 1).bind(mainView);
    var goTimer = function() {
      $(mainView.masterPages[0]).css('visibility', "");
      mainView.goToPage(2);
    };

    Path.map("#home").to(goHome);

    Path.map("#weights").to(goWeights);

    Path.map("#timer").to(goTimer);

    Path.root("#home");

    Path.rescue(goHome);

    Path.listen();
  });
});
