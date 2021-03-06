$("#centermapoverlay").streamwriter({enabled:false});
$("#leftmapoverlay").streamwriter({enabled:false});
$("#leftbottom1overlay").streamwriter({enabled:false});
$("#rightmapoverlay").streamwriter({enabled:false});
$("#rightbottom1text").streamwriter({enabled:false,charblock: 20, maxlines:7, timeout: 20});
$("#rightbottom2text").streamwriter({enabled:false,maxlines:7, charblock: 20, timeout: 20});
$("#leftbottom2text").streamwriter({enabled:false,maxlines:7, charblock: 20, timeout: 20});



var width = 500,
    height = 300;

var eventcount = 1,
    australiacount = 0,
    europecount=0,
    usacount=0,
    identyes=0,
    maxExplosions = 1000,
    explosionIndex = 0,
    usercount = 0,
    explosionRing = [];

var starttime = new Date();

var paused = false;
$('#leftbottom2').mouseenter(function() {
    paused = true;
    $('#paused').css('display','inherit');
});
$('#leftbottom2').mouseleave(function() {
    $('#paused').css('display','none');
    paused = false;
});
$('#rightbottom1').mouseenter(function() {
    paused = true;
    $('#paused').css('display','inherit');
});
$('#rightbottom1').mouseleave(function() {
    $('#paused').css('display','none');
    paused = false;
});

$('#rightbottom2').mouseenter(function() {
    paused = true;
    $('#paused').css('display','inherit');
});
$('#rightbottom2').mouseleave(function() {
    $('#paused').css('display','none');
    paused = false;
});


var centerprojection = d3.geo.mercator() //d3.geo.mercator()
    .scale(80)
    .translate([width / 2, height / 2])
    .precision(.1);

var centerpath = d3.geo.path()
    .projection(centerprojection);

var leftprojection = d3.geo.mercator() //d3.geo.mercator()
    .scale(400)
    .translate([1.85*width, 1.45 * height])
    .precision(.1);

var leftbotprojection = d3.geo.mercator() //d3.geo.mercator()
    .scale(197)
    .translate([-385,0])
    .precision(.1);

var leftpath = d3.geo.path()
    .projection(leftprojection);

var leftbotpath = d3.geo.path()
    .projection(leftbotprojection);


var rightprojection = d3.geo.mercator()
    .scale(400)
    .translate([.3*width, 1.8*height ])
    .precision(.1);

var rightpath = d3.geo.path()
    .projection(rightprojection);


var svg = d3.select("#centermap").append("svg")
    .attr("width", width)
    .attr("height", height-12);

var svgleft = d3.select("#leftmap").append("svg")
    .attr("width", width)
    .attr("height", height);

var svgleftbottom = d3.select("#leftbottom1").append("svg")
    .attr("width", 230)
    .attr("height", 200);

var svgright = d3.select("#rightmap").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json("world_small.json", function(error, world) {
  svg.insert("path")
      .datum(topojson.feature(world, world.objects.ne_110m_coastline))
      .attr("class", "land")
      .attr("d", centerpath);

  svg.insert("path")
      .datum(topojson.feature(world, world.objects.russia))
      .attr("class", "russia")
      .attr("d", centerpath);

  svg.insert("path")
      .datum(topojson.feature(world, world.objects.usa))
      .attr("class", "usa")
      .attr("d", centerpath);

});

d3.json("europe_small.json", function(error, world) {
  svgright.insert("path")
      .datum(topojson.feature(world, world.objects.europe))
      .attr("class", "land")
      .attr("d", rightpath);


});
d3.json("wargames_usa.json", function(error, world) {
  svgleft.insert("path")
      .datum(topojson.feature(world, world.objects.usa))
      .attr("class", "usa")
      .attr("d", leftpath);

});

d3.json("australia_small.json", function(error, world) {
  svgleftbottom.insert("path")
      .datum(topojson.feature(world, world.objects.australia))
      .attr("class", "land")
      .attr("d", leftbotpath);

});

var pad = function(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

var updateStats = function(){
    var elapsed = parseInt((new Date() - starttime)/1000);
    $("#elapsedtime").text(pad(elapsed,5));
    $("#eventpermin").text(pad(parseInt(60*eventcount/elapsed),5));
    $("#eventtotal").text(pad(eventcount,5));
    $("#identpercent").text(pad(parseInt(100*identyes/eventcount),2) + "%");
    $("#usatotal").text(pad(usacount,5));
    $("#europetotal").text(pad(europecount,5));
    $("#australiatotal").text(pad(australiacount,5));
    $("#fancy2").text(pad(parseInt(usercount),5));
}

var updateStatsLoop = function(){
   setTimeout(updateStatsLoop,1000);
   updateStats();
}
updateStatsLoop();

var updateTwitterLoop = function(){
    setTimeout(updateTwitterLoop,100000);
    $.getJSON('//cdn.api.twitter.com/1/urls/count.json?url=' + encodeURIComponent(document.URL) + '&callback=?', null, function (results) {
            $("#twitter").text(pad(results.count,5));
            });
}

updateTwitterLoop();

d3.select(self.frameElement).style("height", height + "px");

var es = new EventSource("//github-api.robscanlon.com/events.js");

var drawExplosion = function(svg, coord){
    if(explosionRing[explosionIndex]){
        explosionRing[explosionIndex].remove();
    }
    explosionRing[explosionIndex] = svg.append('svg:circle')
        .attr('cx', coord[0])
        .attr('cy', coord[1])
        .attr('r', 0)
        .style('opacity',0)
        .attr('class','point')
        .transition()
        .duration(200)
        .attr('r',50)
        .style('opacity',1.0)
        .transition()
        .ease('linear')
        .duration(500 + Math.random()*500)
        .attr('r',2)
        .style('opacity',1)[0][0];

    explosionIndex = (explosionIndex+1) % maxExplosions;
};

var listener = function (event) {
    var data = JSON.parse(event.data);

    if(data.stream === "meta"){
        usercount = data.size;
    } else if(data.stream === "github"){
        eventcount++;
        setTimeout(function(){
            if(paused) return;

            if(data.username){
                $("#leftbottom2text").streamwriter("write", data.username);
            }
            if(data.title){
                $("#rightbottom1text").streamwriter("write", data.title);
            }
            if(data.type){
                $("#rightbottom2text").streamwriter("write", data.type);
            }
            if(data.latlon){
                identyes++;

                drawExplosion(svg, centerprojection([data.latlon.lon, data.latlon.lat]));
                $("#centermapoverlay").streamwriter("write",data.location);

                /* USA */

                if(data.latlon.lat < 50 && data.latlon.lat >24 && data.latlon.lon > -125 && data.latlon.lon < -66){ 
                    usacount++;
                    drawExplosion(svgleft, leftprojection([data.latlon.lon,data.latlon.lat]));

                    $("#leftmapoverlay").streamwriter("write",data.location);
                }

                /* europe */
                
                if(data.latlon.lat < 60 && data.latlon.lat > 35 && data.latlon.lon > -9 && data.latlon.lon < 40){ 
                    europecount++;
                    drawExplosion(svgright, rightprojection([data.latlon.lon,data.latlon.lat]));

                    $("#rightmapoverlay").streamwriter("write",data.location);
                }

                /* AUS / NZ */

                if(data.latlon.lat < -10 && data.latlon.lat > -50 && data.latlon.lon > 115 && data.latlon.lon < 180){ 
                    australiacount++;
                    drawExplosion(svgleftbottom, leftbotprojection([data.latlon.lon,data.latlon.lat])); 
                    $("#leftbottom1overlay").streamwriter("write",data.location);
                }

            }
        }, Math.random() * 500);
    }
    // console.log(event.stream);
    // if(event.MessageEvent.stream === "github"){
    //     console.log(event);


    // }
};
es.addEventListener("message", listener);

window.StreamServer && StreamServer.onMessage(function (datain) {
    var chunks = datain.message.split("*");
    
    eventcount++;
    console.log(datain);

    var data = {};
    if(datain.location){
       data.location = datain.location.name;
       if(datain.location.lat && datain.location.lng){
           data.latlng = {"lat": datain.location.lat, "lng": datain.location.lng};
       }
    }
    
    data.actor = chunks[3].trim();
    data.repo = chunks[0].trim();
    data.type = chunks[5].trim();
    data.url = datain[3];

    setTimeout(function(){
        if(paused) return;
            /*
            $("#leftbottom2").prepend("<a href='" + data.url + "'>" + data.actor + "</a><br/>");
            $("#rightbottom1").prepend("<a href='" + data.url + "'>" + data.repo + "</a><br/>");
            $("#rightbottom2").prepend("<a href='" + data.url + "'>" + data.type + "</a><br/>");
            */


            $("#leftbottom2text").streamwriter("write", data.actor);
            $("#rightbottom1text").streamwriter("write", data.repo);
            $("#rightbottom2text").streamwriter("write", data.type);

        if(!data.latlng){
            // $("#centerbottom table").prepend("<tr><td><a href='" + data.url + "'>" + data.repo + "</a></td><td class='actor'><a href='http://github.com/" + data.actor + "'>" + data.actor + "</a></td><td>&nbsp;</td></tr>\n");
        } else {
            identyes++;
            // $("#centerbottom table").prepend("<tr><td class='hit repo'>" + data.repo + "</td><td class='actor hit'><a href='http://github.com/" + data.actor + "'>" + data.actor + "</a></td><td class='loc hit'>" + data.location + "</td></tr>\n");
        
            centercoordinates = centerprojection([data.latlng.lng,data.latlng.lat]);
            svg.append('svg:circle')
            .attr('cx', centercoordinates[0])
            .attr('cy', centercoordinates[1])
            .attr('r', 0)
            .style('opacity',0)
            .attr('class','point')
            .transition()
            .duration(200)
            .attr('r',50)
            .style('opacity',1.0)
            .transition()
            .ease('linear')
            .duration(500 + Math.random()*500)
            .attr('r',2)
            .style('opacity',1);

            // $("#centermapoverlay").prepend(data.location + "<br/>");
            $("#centermapoverlay").streamwriter("write",data.location);

            /* USA */

            if(data.latlng.lat < 50 && data.latlng.lat >24 && data.latlng.lng > -125 && data.latlng.lng < -66){ 
                usacount++;
                leftcoordinates = leftprojection([data.latlng.lng,data.latlng.lat]);
                svgleft.append('svg:circle')
                .attr('cx', leftcoordinates[0])
                .attr('cy', leftcoordinates[1])
                .attr('r', 0)
                .style('opacity',0)
                .attr('class','point')
                .transition()
                .duration(200)
                .attr('r',100)
                .style('opacity',1.0)
                .transition()
                .ease('linear')
                .duration(500 + Math.random()*500)
                .attr('r',4)
                .style('opacity',1);

                //$("#leftmapoverlay").prepend(data.location + "<br/>");
                $("#leftmapoverlay").streamwriter("write",data.location);
            }

            /* europe */
            
            if(data.latlng.lat < 60 && data.latlng.lat > 35 && data.latlng.lng > -9 && data.latlng.lng < 40){ 
                europecount++;
                rightcoordinates = rightprojection([data.latlng.lng,data.latlng.lat]);
                svgright.append('svg:circle')
                .attr('cx', rightcoordinates[0])
                .attr('cy', rightcoordinates[1])
                .attr('r', 0)
                .style('opacity',0)
                .attr('class','point')
                .transition()
                .duration(200)
                .attr('r',100)
                .style('opacity',1.0)
                .transition()
                .ease('linear')
                .duration(500 + Math.random()*500)
                .attr('r',4)
                .style('opacity',1);
                //$("#rightmapoverlay").prepend(data.location + "<br/>");
                $("#rightmapoverlay").streamwriter("write",data.location);
            }

            /* AUS / NZ */

            if(data.latlng.lat < -10 && data.latlng.lat > -50 && data.latlng.lng > 115 && data.latlng.lng < 180){ 
                australiacount++;
                leftbottomcoordinates = leftbotprojection([data.latlng.lng,data.latlng.lat]);
                svgleftbottom.append('svg:circle')
                .attr('cx', leftbottomcoordinates[0])
                .attr('cy', leftbottomcoordinates[1])
                .attr('r', 0)
                .style('opacity',0)
                .attr('class','point')
                .transition()
                .duration(200)
                .attr('r',100)
                .style('opacity',1.0)
                .transition()
                .ease('linear')
                .duration(500 + Math.random()*500)
                .attr('r',4)
                .style('opacity',1);
                //$("#leftbottom1overlay").prepend(data.location + "<br/>");
                $("#leftbottom1overlay").streamwriter("write",data.location);
            }
        }
    }, Math.random()*3000);
});


// force a reload every hour
setTimeout(function(){location.reload(true)},3600000);
