/** Copyright (c) 2014 Jess VanDerwalker <washu@sonic.net>
 *
 * movable_scrollbar.js
 *
 * Experiments with brushes in D3
 */

var height = 400;
var width = 1000;

function createPlot(plotData) {
    var xScale = d3.scale.linear().range([0, width]);
    var yScale = d3.scale.linear().range([height, 0]);
    xScale.domain(d3.extent(plotData, function(d) { return parseInt(d.time); } ));
    yScale.domain(d3.extent(plotData, function(d) { return parseInt(d.x); }));

    var xAxis = d3.svg.axis().scale(xScale).orient('bottom');
    var yAxis = d3.svg.axis().scale(yScale).orient('left');

    var brush = d3.svg.brush().x(xScale);
    brush.on('brush', brushing).on('brushstart', brushing);

    var xLine = d3.svg.line()
        .x(function(d) {
            return xScale(d.time); })
        .y(function(d) {
            return yScale(d.x); });
    var yLine = d3.svg.line()
        .x(function(d) { return xScale(d.time); })
        .y(function(d) { return yScale(d.y); });
    var zLine = d3.svg.line()
        .x(function(d) { return xScale(d.time); })
        .y(function(d) { return yScale(d.z); });

    var svg = d3.select('div#plot-container').append('svg')
        .attr('width', width + 20).attr('height', height + 20);
    var lineG = svg.append('g')
            .attr('width', width + 20).attr('height', height + 20);
        
    var xPath = lineG.selectAll('path.x').data([plotData])
        .enter().append('path').attr('class', 'x path')
        .attr('id', 'x-path')
        .attr('d', xLine);
    var xPathInfo = getPathInfoObj(xPath);
    
    var yPath = lineG.selectAll('path.y').data([plotData])
        .enter().append('path').attr('class', 'y path')
        .attr('d', yLine);
    var yPathInfo = getPathInfoObj(yPath);
    
    var zPath = lineG.selectAll('path.z').data([plotData])
        .enter().append('path').attr('class', 'z path')
        .attr('d', zLine);
    var zPathInfo = getPathInfoObj(zPath);
    
    var circle = svg.append("circle")
        .attr("cx", 100)
        .attr("cy", 350)
        .attr("r", 3)
        .attr("fill", "red");
    
    // Setup brush
    svg.append('g')
        .attr('class', 'brush')
        .call(brush)
        .selectAll('rect')
        .attr('y', 0)
        .attr('height', height);
    var brushLine = svg.append('line').attr('class', 'brush-line')
        .attr({ 'y1': 0, 'y2': height, 'x1': 0, 'x2': xScale.range()[0]});


    // Setup the text area
    var results = d3.select('div#value-container');
    var timeValue = results.append('p').text('Time: ' + xScale.domain()[0]);
    var xValue = results.append('p').text('x: ');
    var yValue = results.append('p').text('y: ');
    var zValue = results.append('p').text('z: ');
    
    function brushing() {
        if (d3.event.sourceEvent) {
            var mouseX = d3.mouse(this)[0];
            var current = xScale.invert(mouseX);
            brush.extent([ current, current ]);
            brushLine.attr('x1', mouseX).attr('x2', mouseX);

            timeValue.text('Time: ' + current);
            xValue.text('x: ' + yScale.invert(getYValueAtScrub(xPathInfo, mouseX)));
            yValue.text('y: ' + yScale.invert(getYValueAtScrub(yPathInfo, mouseX)));
            zValue.text('z: ' + yScale.invert(getYValueAtScrub(zPathInfo, mouseX)));
            circle.attr('cx', mouseX).attr('cy', getYValueAtScrub(zPathInfo, mouseX));
        }
    }
}

function getYValueAtScrub(pathInfo, mouseX) {
    var x = mouseX;
    var beginning = mouseX;
    var end = pathInfo.length;
    var target;
    var pos;
    while (true) {
        target = Math.floor((beginning + end) / 2);
        pos = pathInfo.element.getPointAtLength(target);
        if ((target === end || target === beginning) && pos.x !== x) {
            break;
        }
        if (pos.x > x) {
            end = target;
        } else if (pos.x < x) {
            beginning = target;
        } else {
            break;
        }
    }
    return pos.y;
}

function getPathInfoObj(path) {
    var element = path.node();
    var length = element.getTotalLength();
    return { path: path,
             element: element,
             length: length };
}

d3.json('../sample_data/plot_data.json', function(err, plotData) {
    if (err) {
        console.log('Unable to load plot data');
        return;
    }
    createPlot(plotData.plotData);
});
