var Bar = function(paper, x, y, vals) {
  var barAnimateTime = 2000;
  var barHeight = 20;

  var colors = ["#0f0", "#00f", "#f00"];

  var rect = function(x, y, w, h, color) {
    return paper.rect(x,y,w,h).attr({fill: color, stroke: "none"});
  };

  var bars = {};

  for(var i in vals) {
    var b = vals[i];
    var size = b.size || 0;
    b.bar = rect(x,y,size, barHeight, colors[i % colors.length]);
    bars[b.name] = b;
  }

  var resizeBar = function(bar, size) {
    bar.animate({width: size}, barAnimateTime);
  };

  var destroy = function() {
    for(var i in bars) {
      if (bars.hasOwnProperty(i)) {
        bars[i].bar.stop();
        bars[i] = null;
      }
    }
  };

  return {
    setSize: function(name, n) {
      resizeBar(bars[name].bar, n);
    },
    vals: vals,
    destroy: destroy
  };
};

var Bars = function(bars) {
  var index = {};

  for(var i in bars) {
    var bar = bars[i];
    var vals = bar.vals;
    for (var j in vals) {
      var val = vals[j];
      index[val.name] = bar;
    };
  };

  var destroy = function() {
    for(var i in bars) {
      bars[i].destroy();
    };
  };

  return {
    setSize: function(name, n) {
      var b = index[name];
      if(b)
        b.setSize(name, n);
    },
    destroy: destroy
  };
};

var Circles = function(paper, w, h) {
  var defaultRadius = 20;
  var padding = 50;
  var createAnimateTime = 500;
  var removeAnimateTime = 200;
  var moveAnimateTime = 1000;

  var reportScoreFn;
  var removeCounter = 0;

  var removeAll = false;

  var randomPoint = function() {
    var maxHeight = h - padding;
    var x = Math.floor(Math.random() * w);
    if(x < padding)
      x = padding;
    var y = Math.floor(Math.random() * h);
    if(y < padding)
      y = padding;
    if(y > maxHeight)
      y = maxHeight;
    return {x: x, y: y};
  };

  var removeCircle = function(c) {
    if(c && !removeAll) {
      c.animate({r: 0}, removeAnimateTime, function() {
        c.remove();
      });
    };
  };

  var moveCircle = function(c) {
    if (c && !removeAll) {
      var point = randomPoint();
      c.animate({"cx": point.x, "cy": point.y}, moveAnimateTime, function() {
        if (removeCounter > 0) {
          c.animate({fill: "#000"}, 100);
          removeCircle(c);
          removeCounter--;
        };
        moveCircle(c);
      };
    };
  };

  var makeCircle = function() {
    var birth = new Date();
    var point = randomPoint();
    var circle = paper.circle(point.x, point.y, 0).attr({
      fill: "#f00", stroke: "none", opacity: 0.6
    });
    circle.animate({r: defaultRadius}, createAnimateTime);
    moveCircle(circle);

    circle.mouseover(function() {
      var death = new Date();
      var t = death - birth;
      var points = 1;
      if(t <= 500)
        points = 3;
      else if (t <= 1000)
        points = 2;

      if (reportScoreFn)
        reportScoreFn(points);
      removeCircle(circle);
    });
  };

  var destroy = function() {
    removeAll = true;
  };

  return {
    addCircle: function() {
      makeCircle();
    },
    removeCircle: function() {
      removeCounter++;
    },
    addScoreReporter: function(f) {
      reportScoreFn = f;
    },
    destroy: destroy
  };
};