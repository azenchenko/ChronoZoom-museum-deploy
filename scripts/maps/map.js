var CZ;
(function (CZ) {
    var Map = (function () {
        var _opts = {
            closeBtnClass: "map-close-btn",
            titleClass: "map-title",
            dateClassStart: "map-start-date",
            dateClassEnd: "map-end-date"
        };

        var _this;

        function Map(mapDiv) {
            this.mapDiv = mapDiv;
            this.map = null;
            this.$map = null;
            this.geoMapLayer;
            this.$closeBtn = null;
            this.mapType = null;
            this.mapData = [];
            this.$infoPanel = null;
            this.$contentContainer = null;
            this.$header = null;
            this.$infoCloseBtn = null;
            this.$title = null;
            this.$start = null;
            this.$end = null;
            this.path;
            this.projection;
            this.behaviorZoom;
            this.behaviorDrag;
            this.isDragging;
            this.preventClick;
        }

        /**
         * Creates datepicker based on given JQuery instance of div
         */
        Map.prototype.init = function () {
            _this = this;

            this.map = d3.select(this.mapDiv);
            this.$map = $(this.map[0]);

            this.preventClick = false;

            this.$closeBtn = $("<div></div>", {
                class: _opts.closeBtnClass,
                title: "Close the map view"
            });

            this.$closeBtn.appendTo(this.$map)
                .on("click", this, onCloseBtnClick);

            this.$title = $("<div></div>", {
                class: _opts.titleClass
            });

            this.$start = $("<div></div>", {
                class: _opts.dateClassStart
            });

            this.$end = $("<div></div>", {
                class: _opts.dateClassEnd
            });

            this.$title.appendTo(this.$map);
            this.$start.appendTo(this.$map);
            this.$end.appendTo(this.$map);

            svg = this.map.append("svg");
            this.geoMapLayer = svg.append("g")
                .style("stroke-width", "1.5px");

            this.$infoPanel = this.$map.find("#mapAreaInfo");

            this.initInfoPanel();
        };

        /**
         * Initializes d3 drag behavior.
         */
        Map.prototype.initDrag = function () {
            var _this = this;

            this.isDragging = false;

            this.behaviorDrag = d3.behavior.drag()
                .on("drag", function () {
                    _this.isDragging = true;
                })
                .on("dragend", function () {
                    _this.isDragging = false;
                });
        };

        /**
         * Initializes d3 zoom behavior.
         */
        Map.prototype.initZoom = function (args) {
            var args = args || {},
                minZoom = typeof args.minZoom !== "undefined" ? args.minZoom : 1,
                maxZoom = typeof args.maxZoom !== "undefined" ? args.maxZoom : 40;

            this.behaviorZoom = d3.behavior
                .zoom()
                .translate([0, 0])
                .scale(1)
                .scaleExtent([minZoom, maxZoom])
                .on("zoom", args.onZoom);
        };

        /**
         * Handler for click over map area.
         *
         * @param   area    {string}    Map area that was clicked.
         * @param   caller  {Object}    Event caller.
         */
        Map.prototype.onAreaClicked = function (area, caller) {
            this.active.classed("active-selected", false);

            if (CZ.Authoring.isActive) {
                this.$map.trigger("mapareaclicked", {
                    mapAreaId: area.id
                });
            }
            else {
                var exhibits = [];

                this.active.classed("active", false);
                this.active = d3.select(caller).classed("active", true);

                var bounds = this.path.bounds(area),
                    dx = bounds[1][0] - bounds[0][0],
                    dy = bounds[1][1] - bounds[0][1],
                    x = (bounds[0][0] + bounds[1][0]) / 2,
                    y = (bounds[0][1] + bounds[1][1]) / 2,
                    scale = .95 / Math.max(dx / this.width, dy / this.height),
                    translate = [this.width / 2 - scale * x, this.height / 2 - scale * y];

                this.geoMapLayer.transition()
                    .duration(750)
                    .call(this.behaviorZoom.translate(translate).scale(scale).event)
                    .selectAll(".subunit-label").style("font-size", 15 / d3.event.scale + "px");

                // Initialize tooltips.
                Object.keys(_this.mapData).filter(function (key) {
                    return _this.mapData[key].mapAreaId && _this.mapData[key].mapAreaId === area.id;
                }).forEach(function (key) {
                    exhibits.push(_this.mapData[key]);
                });

                // Highlight active area that has events.
                if (exhibits.length > 0) {
                    this.active.classed("active-selected", true);
                    window._MapAreaExhibitsForm.show(exhibits);
                }
                else {
                    window._MapAreaExhibitsForm.close();
                }
            }
        };

        /**
         * Show map.
         */
        Map.prototype.show = function (args) {
            $('#wait').show();
            this.$map.show("clip", {}, 200);
        };

        /**
         * Hide map.
         */
        Map.prototype.hide = function (args) {
            this.$map.hide("clip", {}, 200);
        };

        /**
         * Removes map object.
         */
        Map.prototype.destroy = function () {
            d3.select(this.mapDiv)
                .select("svg")
                .remove();

            this.$map.removeAttr("data-map-type");
            this.$closeBtn.remove();
            this.mapType = null;
        };

        /**
         * Clears map paths.
         */
        Map.prototype.clearMap = function () {
            $(this.geoMapLayer[0]).empty()
                .off();
            this.mapType = null;
        };

        /**
         * Shows a placeholder for info related to area with given id.
         */
        Map.prototype.showMapAreaInfo = function (event) {
            var id = event.data.id;
            var info = event.data.info;

            _this.$infoPanel.show();
            _this.$contentContainer.empty();
            _this.$header.text(event.data.title);

            info.forEach(function (item) {
                var $container = $("<div></div>", {
                    class: "map-view-exhibit-info"
                });

                var media;

                switch (item.mediaType) {
                    case "Picture":
                    case "image":
                        media = $("<img></img>");
                        break;
                    default:
                        media = $("<iframe></iframe>");
                };

                media.css("float", "left")
                    .attr("src", item.uri);

                var des = $("<div></div>", {
                    text: item.description,
                    class: "map-view-exhibit-info-description"
                });

                $container.append(media)
                    .append(des);

                _this.$contentContainer.append($container);
            });

            window._MapAreaExhibitsForm.container.hide();
        };

        /**
         * Hides a placeholder that shows info of particular area.
         */
        Map.prototype.hideMapAreaInfo = function () {
            
        };

        /**
         * Loads data associated with map areas to the map.
         */
        Map.prototype.loadData = function (data) {
            $('#wait').hide();

            if (data === this.mapData) {
                return;
            }

            this.mapData = data;
            this.generateTooltips();
        };

        Map.prototype.initInfoPanel = function() {
            var _this = this;

            this.$header = this.$infoPanel.find(".map-view-exhibit-info-header");
            this.$infoCloseBtn = this.$infoPanel.find(".map-view-exhibit-info-close-btn")
                .click(function () {
                    _this.$infoPanel.hide();
                    window._MapAreaExhibitsForm.container.show();
                });;
            this.$contentContainer = this.$infoPanel.find(".content-container");
        };

        Map.prototype.generateTooltips = function () {
            $(".subunit").each(function () {
                var $this = $(this),
                    name = $this.attr("data-name");

                $this.data("powertip", name)
                    .attr("data-powertip", name)
                    .powerTip({
                        followMouse: true
                    });
            });

            var ids = [],
                _this = this;

            // Create list of ids for map areas that are in mapData.
            Object.keys(this.mapData).forEach(function (key) {
                var item = _this.mapData[key];

                if (item.mapAreaId && ids.indexOf(item.mapAreaId === -1)) {
                    ids.push(item.mapAreaId);
                }
            });

            // Create tooltip for every map area contains all exhibits associated with this map area.
            ids.forEach(function (id) {
                // Hack to add 'selected' class to subunit.
                // Html tag contains too much data in attrs, so $.addClass doesn't work.
                var _class = $(".subunit[data-id='" + id + "']").attr("class");
                $(".subunit[data-id='" + id + "']").attr("class", _class + " selected");
            });
        };

        /**
         * Removes data associated with map areas.
         */
        Map.prototype.clearData = function () {
            this.mapData = null;

            // TODO: remove tooltipster from elements that were initialized before,
            //       remove data attrs associated with exhibits data,
            //       remove event handlers
        };

        /**
         * Close map view button click handler.
         */
        var onCloseBtnClick = function (event) {
            Map.prototype.hide.call(event.data);
            window._MapAreaExhibitsForm.close();
        };

        return Map;
    })();

    CZ.Map = Map;
})(CZ || (CZ = {}));
