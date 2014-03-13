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
    xScale.domain(d3.extent(plotData, function(d) {
        return parseInt(d.time, 10);
    }));
    yScale.domain(d3.extent(plotData, function(d) {
        return parseInt(d.x, 10);
    }));

    var xAxis = d3.svg.axis().scale(xScale).orient('bottom');
    var yAxis = d3.svg.axis().scale(yScale).orient('left');

    var brush = d3.svg.brush().x(xScale);
    brush.on('brushend', endBrushing);

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
    
    var yPath = lineG.selectAll('path.y').data([plotData])
        .enter().append('path').attr('class', 'y path')
        .attr('d', yLine);
    
    var zPath = lineG.selectAll('path.z').data([plotData])
        .enter().append('path').attr('class', 'z path')
        .attr('d', zLine);
    
    // Setup brush
    svg.append('g')
        .attr('class', 'brush')
        .call(brush)
        .selectAll('rect')
        .attr('y', 0)
        .attr('height', height);

    // Setup the text area
    var results = d3.select('div#value-container');
    var rangeValue = results.append('p').text('start: ~, end: ~');
    
    function endBrushing() {
        var extents = brush.extent();
        console.log(extents);
        if ( Math.abs(extents[0] - extents[1]) < 1) {
            d3.select('.brush').call(brush.clear());
            return;
        }
        xScale.domain(extents);
        rangeValue.text('start: ' +
                        extents[0].toPrecision(4) +
                        ',  end: ' +
                        extents[1].toPrecision(4));
        xPath.attr('d', xLine);
        yPath.attr('d', yLine);
        zPath.attr('d', zLine);
        d3.select('.brush').call(brush.clear());
    }
}

d3.json('../sample_data/plot_data.json', function(err, plotData) {
    if (err) {
        console.log('Unable to load plot data');
        return;
    }
    createPlot(plotData.plotData);
});
