
$(document).ready(function (){
  document.ontouchmove = function(e){
    e.preventDefault();
  }
  if( !!window.TouchEvent ) {
    $('body').addClass('touch-enabled');
  } else {
    // add nav buttons
  }

  $('#home-page').bind("swipeleft", function(){
    $.mobile.changePage( "#weights-page", {      
      transition: "slide"     
    });
  });
  $('#weights-page').bind("swipeleft", function(){
    $.mobile.changePage( "#timer-page", {      
      transition: "slide"     
    });
  });
   $('#weights-page').bind("swiperight", function(){
   $.mobile.changePage( "#home-page", {      
       transition: "reverse slide", 
   });  });
   $('#timer-page').bind("swiperight", function(){
   $.mobile.changePage( "#weights-page", {      
       transition: "reverse slide",    
   });  });
});

$(document).delegate('#weights-page', 'pageinit', function () {
  var waterToCoffee = 18.75
  //Your code for each page load here
  var gMassCoffee = {};
  var gMassWater = {};

  _.each(_.range(8,73,4), function (n) {
    gMassCoffee[n] = n;
    gMassWater[n*waterToCoffee] = n*waterToCoffee;
  });
  $("#coffee-scroller").mobiscroll({
    onChange: function(text, inst) {
      $("#water-scroller").mobiscroll('setValue', [parseInt(text)*waterToCoffee, 'g'], true);
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
      $("#coffee-scroller").mobiscroll('setValue', [parseInt(text)/waterToCoffee, 'g'], true);
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
});

$(document).delegate('#timer-page', 'pageinit', function () {
  var bloomCallback = function(days, hours, minutes, seconds){
      if(minutes+seconds == 0) {
        cd.setLeft(2*60);
        cd.setCallback(infusionCallback);
        var head = $("#timer-page h1");
        head.addClass('animated fadeOut');
        head.animationComplete(function(){ 
          head.text("Infusion");
          head.removeClass("fadeOut");
          head.addClass('animated fadeIn');
          head.animationComplete(function(){
            head.removeClass("fadeIn");
            head.addClass("animated flash");
            head.animationComplete(function(){
              head.removeClass("animated flash");
            });
          }); 
        });
      }
    };
  var infusionCallback = function(days,hours,minutes,seconds){
          if(minutes+seconds == 0) {
            console.log('all done!');
            cd.pause();
          }
        }

  var cd = $('#countdown').countdown({
    left: 30,
    callback: bloomCallback
  });


  var startButton = $("#start-timer-button");
  startButton.bind('vclick',function(){
    cd.start();
    startButton.detach();

    $("#timer-page .content").append(
      '<div id="pause-timer-button" data-role="button" data-inline="true">Pause</div>\
      <div id="reset-timer-button" data-role="button" data-inline="true">Reset</div>'
    ).trigger('create');

    $("#pause-timer-button").bind('vclick',function(){
      if(cd._start){
        cd.pause();
        $("#pause-timer-button .ui-btn-text").text("Resume").trigger('create');
      } else {
        cd.resume();
        $("#pause-timer-button .ui-btn-text").text("Pause").trigger('create');
      }
    });

    $("#reset-timer-button").bind('vclick',function(){
      cd.pause();
      cd.setLeft(30);
      cd.setCallback(bloomCallback);
      $("#timer-page h1").text("Bloom");
      $("#pause-timer-button").remove();
      $("#reset-timer-button").remove();
      $("#timer-page .content").append(startButton);
    });
  });

});
