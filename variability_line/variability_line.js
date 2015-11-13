/* Copyright (c) 2015 Jess VanDerwalker
 *
 * Line plot to show variability.
 */


// Samples per second.
var SAMPLE_RATE = 128;

var HEIGHT = 700;
var WIDTH = 700;

// Get the time values for the yData
function yValueTimes(yData) {
    var secondsPerSample = 1 / SAMPLE_RATE;
    yData.forEach(function(d, i) {
        d.time = i * secondsPerSample;
    });
    return yData;
}

// Need to matchup the time from the signal to the time
// of a pair.
function yValuesForPair(pairs, yData) {
    pairs.forEach(function(d) {
        var lastIdx = 0
        d.yValues = [];
        yData.forEach(function(e) {
            if (e.time > d.start && e.time < d.end) {
                d.yValues.push(e);
            }
        });
    });
}

// Change the times so the value is relative to the start time.
// Also return the longest duration and  largest and smallest y.
function getPairDurations(pairs) {
    var xMax = 0;
    var yMax = 0;
    var yMin = 0;
    
    pairs.forEach(function(d) {
        var start = d.start;
        d.start = 0;
        d.end = d.end - start;
        if (d.end > xMax) {
            xMax = d.end;
        }
        d.yValues.map(function(e) {
            e.time = e.time - start;
            e.y = +e.y;
            if (e.y > yMax) {
                yMax = e.y;
            } else if (e.y < yMin) {
                yMin = e.y;
            }
            return e;
        });
    });
    return {xMax: xMax, yMax: yMax, yMin: yMin};
}

function plotVariability(pairs, yData) {
    yValuesForPair(pairs, yData);
    var bounds = getPairDurations(pairs);

    var xScale = d3.scale.linear().range([0, WIDTH])
        .domain([0, bounds.xMax]);
    var yScale = d3.scale.linear().range([HEIGHT, 0])
        .domain([bounds.yMin, bounds.yMax]);

    var line = d3.svg.line()
        .x(function(d) { return xScale(d.time); })
        .y(function(d) { return yScale(d.y); });

    var svg = d3.select('div#plot-container').append('svg')
        .attr({'width': WIDTH, 'height': HEIGHT})
    var lineGs = svg.selectAll('g').data(pairs)
        .enter()
        .append('g').attr({'width': WIDTH, 'height': HEIGHT});

    lineGs.append('path')
        .attr('class', 'path left')
        .attr('d', function(d) {
            return line(d.yValues);
        });
}

// Load the data files and process
d3.csv('left-initial-pairs.csv', function(err, pairs) {
    if (err) {
        console.log('unable to load initial pair data');
        return;
    }

    d3.csv('y-data.csv', function(err, yCsv) {
        if (err) {
            console.log('unable to load initial pair data');
            return;
        }
        var yData = yValueTimes(yCsv);
        plotVariability(pairs, yData);
    });
});
