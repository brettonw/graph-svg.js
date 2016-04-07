var GraphSvg = function () {
    var gs = Object.create(null);

    var graph = {
        n: {},
        e: []
        minC: [],
        maxC: []
    };

    function makeSvg () {
        // open the SVG and make the render port work like a mathematical system
        var halfRange = range / -2.0;
        var svg = "<svg id=\"svg\" xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\"  viewBox=\"" + halfRange + " " + halfRange + " " + range + " " + range + "\" preserveAspectRatio=\"xMidYMid meet\">";
        svg += "<g transform=\"scale(1, -1)\">";

        // lay down all the edges
        for (var i = 0, end = graph.e.length; i < end; ++i){
            svg += "<line id=\"e" + i + "\" x1=\"0\" y1=\"0\" x2=\"200\" y2=\"200\" stroke=\"black\" stroke-width=\"0.005\" visibility=\"hidden\" />";
        }

        // helper to lay down nodes
        var makeCircles = function (source, color) {
            var keys = Object.keys (source);
            for (var i = 0, count = keys.length; i < count; ++i) {
                var key = keys[i];
                var x = (Math.random() * 2.0) - 1.0;
                var y = (Math.random() * 2.0) - 1.0;
                svg += "<circle id=\"" + key + "\" cx=\"" + x + "\" cy=\"" + y + "\" r=\"" + circleRadius + "\" stroke=\"black\" stroke-width=\"0.005\" fill=\"" + color + "\">";
                svg += "<title>" + key + "</title>";
                svg += "</circle>";
            }
        }

        // lay down the nodes
        makeCircles (graph.k, "red");
        makeCircles (graph.m, "blue");

        // close the SVG
        svg += "</g></svg>";
        return svg;
    }

    gs.addNode = function (name, container, mass) {
    }

    gs.addEdge = function (left, right, container, length) {
    }

    gs.addConstraint = function (left, right, length, push, pull) {
    }

    gs.update = function () {
        var computeConstraint = function (c, km, mm, l, push, pull) {
            // compute the total masses, and the individual weight
            var mt = km + mm;
            var kw = km / mt;
            var mw = mm / mt;

            var dx = c.kx - c.mx;
            var dy = c.ky - c.my;
            var d = Math.sqrt ((dx * dx) + (dy * dy));
            var delta = l - d;                  // the total change to be made

            // only do this if the constraint says to
            if (((delta > 0) && push) || ((delta < 0) && pull)) {
                    var dxn = dx / d;
                    var dyn = dy / d;
                    c.kx += 0.5 * mw * delta * dxn;
                    c.ky += 0.5 * mw * delta * dyn;
                    c.mx += -0.5 * kw * delta * dxn;
                    c.my += -0.5 * kw * delta * dyn;
            }

            return c;
        }

        var enforceConstraint = function (a, b, am, bm, l, push, pull) {
            var c = {
                kx:a.modelData.x, ky:a.modelData.y,
                mx:b.modelData.x, my:b.modelData.y
            };
            c = computeConstraint (c, am, bm, l, push, pull);
            a.modelData.x = c.kx; a.modelData.y = c.ky;
            b.modelData.x = c.mx; b.modelData.y = c.my;
            return c;
        }

        // apply the min distance constraints
        for (var i = 0, end = graph.minC.length; i < end; ++i) {
            var c = graph.minC[i];
            enforceConstraint (c.a, c.b, 1.0, 1.0, c.l, true, false);
        }

        // apply the max distance constraints
        for (var i = 0, end = graph.maxC.length; i < end; ++i) {
            var c = graph.maxC[i];
            enforceConstraint (c.a, c.b, 1.0, 1.0, c.l, false, true);
        }

        // apply the edges
        for (var i = 0, end = graph.e.length; i < end; ++i) {
            var e = graph.e[i];
            enforceConstraint (e.a, e.b, 2.0, 1.0, e.l, true, true);
        }

        // now update the visuals
        var svg = document.getElementById ("svg");
        var handle = svg.suspendRedraw (1000);

        // update all the nodes
        var updateNodes = function (collection) {
            var keys = Object.keys (collection);
            for (var i = 0, end = keys.length; i < end; ++i) {
                var key = keys[i];
                var node = collection[key];
                var element = node.element;
                var modelData = node.modelData;
                element.setAttribute ("cx", modelData.x);
                element.setAttribute ("cy", modelData.y);
            }
        };
        updateNodes (graph.k);
        updateNodes (graph.m);

        // update all the edges
        for (var i = 0, end = graph.e.length; i < end; ++i) {
            var e = graph.e[i];
            var element = e.element;
            element.setAttribute ("x1", e.a.modelData.x);
            element.setAttribute ("y1", e.a.modelData.y);
            element.setAttribute ("x2", e.b.modelData.x);
            element.setAttribute ("y2", e.b.modelData.y);
            element.setAttribute ("visibility", "visible");
        }

        // and circle back to here
        svg.unsuspendRedraw (handle);
        onClickAnimate ();
    }

    // will want to redesign this to resemble the tree helper, with a graph helper that
    // creates the graph object and then embeds it in a div for you
    gs.create = function () {
    }

    return gs;
} ();
