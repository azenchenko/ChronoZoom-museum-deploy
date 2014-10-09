var CZ;
(function (CZ) {
    (function (Map) {
        var _this,
            projection,
            path;

        Map.prototype.MapAfrica = function (mapData, timeline) {
            _this = this;

            this.width = _this.$map.width();
            this.height = _this.$map.height();
            this.svg = d3.select(this.mapDiv)
                    .select("svg");
            this.active = d3.select(null);

            this.clearMap();
            this.mapType = "Africa";

            this.mapData = mapData || [];

            this.$title.text(timeline.title);
            this.$start.text(CZ.Dates.convertCoordinateToYear(timeline.x).year + " " + CZ.Dates.convertCoordinateToYear(timeline.x).regime);

            if (timeline.endDate === 9999) {
                this.$end.text("Present");
            }
            else {
                this.$end.text(CZ.Dates.convertCoordinateToYear(timeline.endDate).year + " " + CZ.Dates.convertCoordinateToYear(timeline.endDate).regime);
            }

            /* TODO: make map initialization smarter:
                        - don't erase map completely every time, but only clean associated
                          exhibit data if map type is the same 
            */
            // if (this.mapType === "Africa") {
            //     this.loadData(mapData);
            //     return this;
            // }
            // else {
            //     this.mapType = "Africa";
            // }

            loadMap(this.mapData);

            return this;
        };

        function loadMap (mapData) {
            _this.initDrag();
            _this.initZoom({
                minZoom:1,
                maxZoom: 40,
                onZoom: onZoom
            });

            d3.json("maps-topojson/africa.json", function (error, map) {
                if (error) {
                    return console.error(error);
                }

                // Initial projection.
                _this.projection = d3.geo.mercator()
                    .scale(1)
                    .translate([0, 0]);

                _this.path = d3.geo
                    .path()
                    .projection(_this.projection);

                // Centerin map view.
                var b = _this.path.bounds(topojson.feature(map, map.objects.africa_countries))
                s = .95 / Math.max((b[1][0] - b[0][0]) / _this.width, (b[1][1] - b[0][1]) / _this.height),
                t = [(_this.width - s * (b[1][0] + b[0][0])) / 2, (_this.height - s * (b[1][1] + b[0][1])) / 2];

                _this.projection.scale(s)
                    .translate(t);

                _this.svg.call(_this.behaviorZoom) // delete this line to disable free zooming
                    .call(_this.behaviorZoom.event)
                    .call(_this.behaviorDrag);

                _this.geoMapLayer.selectAll(".subunit")
                    .data(topojson.feature(map, map.objects.africa_countries).features)
                    .enter().append("path")
                    .attr("class", function (d) {
                        return "subunit " + d.properties.name;
                    }).attr("d", _this.path)
                    .attr("data-id", function (d) {
                        return d.id
                    })
                    .attr("data-name", function (d) {
                        return d.properties.name;
                    })
                    .on("mousemove", function () {
                        if (_this.isDragging) _this.preventClick = true;
                    })
                    .on("click", onAreaClicked);

                _this.geoMapLayer.selectAll(".place-label")
                    .data(topojson.feature(map, map.objects.africa_countries).features)
                    .enter().append("text")
                    .attr("class", function (d) { return "subunit-label " + d.id; })
                    .attr("transform", function (d) { return "translate(" + _this.path.centroid(d) + ")"; })
                    .attr("data-text-size", function (d) {
                        var _bounds = _this.path.bounds(d),
                            _width = _bounds[1][0] - _bounds[0][0],
                            _height = _bounds[1][1] - _bounds[0][1];

                        return _width * _height / 1000 / 16;
                    })
                    .style("font-size", function(d) {
                        Math.min(parseFloat($(this).attr("data-text-size")), 1) + "em";
                    })
                    .text(function (d) { return d.properties.name; });

                _this.geoMapLayer.append("path")
                    .datum(topojson.mesh(map, map.objects.africa_countries, function (a, b) { return a !== b; }))
                    .attr("class", "subunit-boundary")
                    .attr("d", _this.path);

                _this.clearData();
                _this.loadData(mapData);
            });
        }

        function onAreaClicked (area) {
            if (_this.preventClick) {
                _this.preventClick = false;
                return;
            }

            _this.onAreaClicked.apply(_this, [area, this]);
        };

        function onZoom() {
            _this.geoMapLayer.style("stroke-width", 1.5 / d3.event.scale + "px");
            _this.geoMapLayer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
            _this.geoMapLayer.selectAll(".subunit-label").style("font-size", function (d) {
                return Math.min(parseFloat($(this).attr("data-text-size")) * d3.event.scale, 1)   / d3.event.scale + "em";
            });
        }

        // If the drag behavior prevents the default click,
        // also stop propagation so we don’t click-to-zoom.
        function stopped() {
            if (d3.event.defaultPrevented) d3.event.stopPropagation();
        }

        function resetViewport() {
            _this.active.classed("active", false);
            _this.active = d3.select(null);

            _this.geoMapLayer.transition()
                .duration(750)
                .call(zoom.translate([0, 0]).scale(1).event);
        }
    })(CZ.Map || (CZ.Map = new function () {}));
})(CZ || (CZ = {}));
