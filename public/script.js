/*
 *
 * Init
 *
 */
Game = {};
Game.Launch = function() {
  Game.cupcakes = 0;
  Game.cps = 0;
  Game.stats = {
    clicker: 0,
    grandma: 0,
    farm: 0,
    mine: 0,
    factory: 0,
    bank: 0,
    temple: 0,
    wizardtower: 0,
    shipment: 0,
    alchemylab: 0,
    portal: 0,
    timemachine: 0
  };
  Game.msg = "";
  Game.timeStr = "5<b>:</b>00";
  Game.day = 1;
  Game.timeUntilNight = 5 * 60;
  Game.setupComplete = false;

  //taken from cookie clicker wiki
  Game.CPS_CONSTANTS = {
    clicker: 0.1,
    grandma: 1,
    farm: 8,
    mine: 47,
    factory: 260,
    bank: 1400,
    temple: 7800,
    wizardtower: 44000,
    shipment: 260000,
    alchemylab: 1600000,
    portal: 10000000,
    timemachine: 65000000
  };
  //taken from cookie clicker wiki
  Game.BASE_COST_CONSTANTS = {
    clicker: 15,
    grandma: 100,
    farm: 1100,
    mine: 12000,
    factory: 130000,
    bank: 1400000,
    temple: 20000000,
    wizardtower: 330000000,
    shipment: 5100000000,
    alchemylab: 75000000000,
    portal: 1000000000000,
    timemachine: 14000000000000
  };
  //taken from cookie clicker wiki
  Game.COST_GROWTH = 1.15;
};

/*
 *
 * Calculation functions
 *
 */

Game.Costs = function() {
  var ret = {};
  Object.keys(Game.stats).forEach(function(key) {
    ret[key] = Math.ceil(
      Game.BASE_COST_CONSTANTS[key] *
        Math.pow(Game.COST_GROWTH, Game.stats[key])
    );
  });
  return ret;
};

Game.NumEnemies = function() {
  return Math.round(20 * Math.pow(1.15, Math.max(0, Game.day - 2)));
};

Game.CupcakesToSurvive = function() {
  return Math.round(Game.NumEnemies() * 2.25);
};

/*
 *
 * Update functions
 *
 */
Game.UpdateUI = function() {
  Game.UpdateMsg();
  document.getElementById("msg").innerHTML = Game.msg;
  document.getElementById("timer").innerHTML = "Day " + Game.day + ".";
  var cps = Game.cps;
  document.getElementById("cps").innerHTML =
    "Cupcakes/Second: " +
    addCommas(Math.floor(cps) != cps ? cps.toFixed(1) : cps).replace(
      ".",
      "<b>.</b>"
    );

  document.getElementById("cupcakes").innerHTML =
    "Cupcakes: " + formatNum(Math.floor(Game.cupcakes));

  costs = Game.Costs();

  Object.keys(Game.stats).forEach(function(key) {
    var button = document.getElementById("buy" + key);
    document.getElementById(key + "-count").innerHTML = addCommas(
      Game.stats[key]
    );
    document.getElementById(key + "-cost").innerHTML = addCommas(costs[key]);
    var cps = Game.stats[key] * Game.CPS_CONSTANTS[key];
    document.getElementById(key + "-cps").innerHTML = addCommas(
      Math.floor(cps) != cps ? cps.toFixed(1) : cps
    );
    if (costs[key] <= Game.cupcakes) {
      $("#buy" + key).tooltip("enable");
      button.style.opacity = 1.0;
      button.style.borderColor = "rgba(0, 0, 0, 1)";
      button.disabled = false;
    } else {
      $("#buy" + key).tooltip("dispose");
      $("#buy" + key).tooltip("disable");
      button.disabled = true;
      button.style.opacity = 0.65;
      button.style.borderColor = "rgba(0, 0, 0, 0)";
    }
  });
};

Game.UpdateCps = function() {
  var tot = 0;

  Object.keys(Game.stats).forEach(function(key) {
    tot += Game.stats[key] * Game.CPS_CONSTANTS[key];
  });

  Game.cps = tot;
};

Game.UpdateMsg = function() {
  if (Game.day <= 2) {
    Game.msg =
      "* Don't worry, there will be hungry babies until the second night.";
  } else {
    Game.msg = "Congrats on surviving the night.";
  }
  Game.msg +=
    " You will face " +
    formatNum(Game.NumEnemies()) +
    " babies. You need " +
    formatNum(Game.CupcakesToSurvive()) +
    " cupcakes \\ to survive the night! *";
};

Game.Earn = function(x) {
  Game.cupcakes += x;
};

Game.Buy = function(product) {
  var cost = Game.Costs()[product];
  if (Math.floor(Game.cupcakes) >= cost) {
    Game.cupcakes -= cost;
    Game.stats[product]++;
    Game.UpdateCps();
  }
};

function SetupCountdown() {
  var container = document.getElementById("countdown");

  bar = new ProgressBar.Circle(container, {
    color: "#aaa",
    // This has to be the same size as the maximum width to
    // prevent clipping
    strokeWidth: 4,
    trailWidth: 1,
    duration: 5 * 60 * 1000,
    text: {
      autoStyleContainer: false
    },
    from: { color: "#ff0000", width: 2 },
    to: { color: "#00ff00", width: 5 },
    // Set default step function for all animate calls
    step: function(state, circle) {
      circle.path.setAttribute("stroke", state.color);
      circle.path.setAttribute("stroke-width", state.width);

      var value = Math.round(circle.value() * 5 * 60);
      if (Game.setupComplete) {
        Game.timeUntilNight = value;
      }
      circle.setText(formatTime(value));
    }
  });
  bar._opts.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
  bar._opts.text.style.fontSize = "6em";
  document.getElementsByClassName("progressbar-text")[0].style.color =
    "rgba(0,0,0,1)";
}

/*
 *
 * Helper Functions
 *
 */

Game.startAttack = function() {
  var needed = Game.CupcakesToSurvive();
  var diff = needed - Math.round(Game.cupcakes);
  if (needed > Game.cupcakes) {
    var str =
      "Unforunately you didn't have enough cupcakes to feed all " +
      formatNum(Game.NumEnemies()) +
      " babies. They overrun your home :( <br /><br />" +
      "You had " +
      formatNum(Math.round(Game.cupcakes)) +
      " cupcakes and needed " +
      formatNum(diff) +
      " more cupcakes to meet the needed " +
      formatNum(needed) +
      "<br/> Good luck on your next attempt.";
    document.getElementById("youLoseText").innerHTML = str;
    bar.stop();
    $("#youLose").modal();

    return false;
  }
  Game.cupcakes -= needed;
  return true;
};

function passiveEarn() {
  Game.Earn(Game.cps * 0.02857);
  Game.UpdateUI();
  saveGameCookies();
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  return `${minutes}:${seconds}`;
}
function formatNum(num, shouldFloor = true) {
  if (num >= Number.parseFloat("1e15")) {
    return Number.parseFloat(num).toExponential(5);
  } else if (num >= "1e12") {
    return (Number.parseFloat(num) / 1000000000000).toFixed(4) + " Trillion";
  } else if (num >= "1e9") {
    return (Number.parseFloat(num) / 1000000000).toFixed(4) + " Billion";
  } else {
    if (shouldFloor) {
      return addCommas(Math.floor(num));
    }
    return num;
  }
}

Game.Reset = function() {
  clearInterval(earnInterval);
  Game.Launch();
  Game.UpdateUI();

  saveGameCookies();

  bar.set(1.0);
  bar.animate(0, {}, cb);

  earnInterval = setInterval(passiveEarn, 35);
};

function addCommas(num) {
  if (num.toString() == Number.parseFloat(num).toExponential()) {
    return num.toFixed(4);
  }
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

function cb() {
  if (Game.day != 1) {
    clearInterval(earnInterval);
    if (!Game.startAttack()) {
      return;
    }
    earnInterval = setInterval(passiveEarn, 35);
  }
  Game.day++;
  Game.timeUntilNight = 5 * 60;

  bar.set(1.0);
  bar.animate(0, {}, cb);
}

/*
 *
 * Cookie Code (from W3 Schools)
 *
 */
function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";";
}
function saveGameCookies() {
  setCookie("cupcakes", Math.round(Game.cupcakes), 5);
  setCookie("cps", Game.cps, 5);
  Object.keys(Game.stats).forEach(function(key) {
    setCookie(key, Game.stats[key], 5);
  });
  setCookie("day", Game.day, 5);
  setCookie("timeUntilNight", Game.timeUntilNight, 5);
}

function loadGameCookies() {
  Game.cupcakes = parseInt(getCookie("cupcakes"));
  Game.cps = parseFloat(getCookie("cps"));
  Object.keys(Game.stats).forEach(function(key) {
    Game.stats[key] = parseInt(getCookie(key));
  });
  Game.day = parseInt(getCookie("day"));
  Game.timeUntilNight = parseInt(getCookie("timeUntilNight"));
}
