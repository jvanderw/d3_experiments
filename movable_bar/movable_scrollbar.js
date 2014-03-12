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

    // var brush = d3.svg.brush().x(xScale)
    //     .on('brush', brushing);

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

    var svg = d3.select('div').append('svg')
        .attr('width', width + 20).attr('height', height + 20);
    var g = svg.append('g').attr('transform', 'translate(10,10)');
    
    svg.selectAll('path.x').data([plotData])
        .enter().append('path').attr('class', 'x path')
        .attr('d', xLine);
    
svg.selectAll('path.y').data([plotData])
        .enter().append('path').attr('class', 'y path')
        .attr('d', yLine);

    svg.selectAll('path.z').data([plotData])
        .enter().append('path').attr('class', 'z path')
        .attr('d', zLine);
    
    
}

function brushing() {
    console.log('brushing');
}

d3.json('plot_data.json', function(err, plotData) {
        if (err) {
            console.log('Unable to load plot data')
            return;
        }
    createPlot(plotData.plotData);
});
