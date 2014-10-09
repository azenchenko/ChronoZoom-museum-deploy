var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var CZ;
(function (CZ) {
    (function (UI) {
        var FormEditMapView = (function (_super) {
            __extends(FormEditMapView, _super);

            var _this,
                map;

            // We only need to add additional initialization in constructor.
            function FormEditMapView(container, formInfo) {
                _this = this;
                _super.call(this, container, formInfo);

                this.exhibits = formInfo.context.exhibits;
                this.mapType = formInfo.context.mapType;
                this.timeline = formInfo.context.timeline;

                switch (formInfo.context.mapType) {
                    case "world":
                        map = CZ.Map.prototype.MapWorld.call(CZ.Common.map, this.exhibits, formInfo.context.timeline);
                        break;
                    case "america":
                        map = CZ.Map.prototype.MapAmerica.call(CZ.Common.map, this.exhibits, formInfo.context.timeline);
                        break;
                    case "north-america":
                        map = CZ.Map.prototype.MapNorthAmerica.call(CZ.Common.map, this.exhibits, formInfo.context.timeline);
                        break;
                    case "south-america":
                        map = CZ.Map.prototype.MapSouthAmerica.call(CZ.Common.map, this.exhibits, formInfo.context.timeline);
                        break;
                    case "usa-albers":
                        map = CZ.Map.prototype.MapUSA.call(CZ.Common.map, this.exhibits, formInfo.context.timeline);
                        break;
                    case "eurasia":
                        map = CZ.Map.prototype.MapEurasia.call(CZ.Common.map, this.exhibits, formInfo.context.timeline);
                        break;
                    case "europe":
                        map = CZ.Map.prototype.MapEurope.call(CZ.Common.map, this.exhibits, formInfo.context.timeline);
                        break;
                    case "asia":
                        map = CZ.Map.prototype.MapAsia.call(CZ.Common.map, this.exhibits, formInfo.context.timeline);
                        break;
                    case "oceania":
                        map = CZ.Map.prototype.MapOceania.call(CZ.Common.map, this.exhibits, formInfo.context.timeline);
                        break;
                    case "africa":
                        map = CZ.Map.prototype.MapAfrica.call(CZ.Common.map, this.exhibits, formInfo.context.timeline);
                        break;
                }

                map.show();

                this.$navBackBtn = this.container.find(formInfo.navBackBtn);

                this.mapEvents = [];
                this.notMapEvents = [];

                Object.keys(this.exhibits).forEach(function (key) {
                    if (_this.exhibits[key].mapAreaId === null) {
                        _this.notMapEvents.push(_this.exhibits[key]);
                    }
                    else {
                        _this.mapEvents.push(_this.exhibits[key]);
                    }
                });

                this.newMapEventForm = {
                    $container: this.container.find(formInfo.newMapEventForm.container),
                    $titleTextblock: this.container.find(formInfo.newMapEventForm.titleTextblock),
                    $emptyListPlaceholder: this.container.find(formInfo.newMapEventForm.emptyListPlaceholder),
                    $eventsListbox: this.container.find(formInfo.newMapEventForm.eventsListbox),
                    eventsListboxTemplate: formInfo.newMapEventForm.eventsListboxTemplate,
                    eventsListbox: new CZ.UI.NewMapEventListbox(container.find(formInfo.newMapEventForm.eventsListbox),
                        formInfo.newMapEventForm.eventsListboxTemplate,
                        this.notMapEvents)
                };

                this.currentMapEventsForm = {
                    $container: this.container.find(formInfo.currentMapEventsForm.container),
                    $titleTextblock: this.container.find(formInfo.currentMapEventsForm.titleTextblock),
                    $emptyListPlaceholder: this.container.find(formInfo.currentMapEventsForm.emptyListPlaceholder),
                    $eventsListbox: this.container.find(formInfo.currentMapEventsForm.eventsListbox),
                    $eventsListboxTemplate: this.container.find(formInfo.currentMapEventsForm.eventsListboxTemplate),
                    eventsListbox: new CZ.UI.CurrentMapEventsListbox(container.find(formInfo.currentMapEventsForm.eventsListbox),
                        formInfo.currentMapEventsForm.eventsListboxTemplate,
                        this.mapEvents)
                };

                this.initialize();
            }

            FormEditMapView.prototype.initialize = function () {
                if (this.mapEvents.length > 0) {
                    this.currentMapEventsForm.$eventsListbox.show();
                    this.currentMapEventsForm.$emptyListPlaceholder.hide();
                }
                else {
                    this.currentMapEventsForm.$eventsListbox.hide();
                    this.currentMapEventsForm.$emptyListPlaceholder.show();
                }

                if (this.notMapEvents.length > 0) {
                    this.newMapEventForm.$eventsListbox.show();
                    this.newMapEventForm.$emptyListPlaceholder.hide();
                }
                else {
                    this.newMapEventForm.$eventsListbox.hide();
                    this.newMapEventForm.$emptyListPlaceholder.show();
                }

                this.$navBackBtn.on("click", onNavBackClicked);

                this.container.on("emptylistbox", function (event, listboxName) {
                    switch (listboxName) {
                        case "newMapEventListbox":
                            _this.newMapEventForm.$eventsListbox.hide();
                            _this.newMapEventForm.$emptyListPlaceholder.show();
                            break;
                        case "eventsOnMapListbox":
                            _this.currentMapEventsForm.$eventsListbox.hide();
                            _this.currentMapEventsForm.$emptyListPlaceholder.show();
                            break;
                    }
                });

                this.container.on("mapeventremoved", function (event, args) {
                    var item = args.item;
                    var id = args.id;

                    item.data.mapAreaId = null;
                    _this.currentMapEventsForm.eventsListbox.remove(item);

                    try {
                        $(".subunit[data-id='" + id + "']").attr("class",  $(".subunit[data-id='" + id + "']").attr("class").replace(/selected/g, ""))
                    }
                    catch (ex) {
                    }

                    if (_this.currentMapEventsForm.eventsListbox.items.length === 0) {
                        _this.currentMapEventsForm.$eventsListbox.hide();
                        _this.currentMapEventsForm.$emptyListPlaceholder.show();
                    }

                    _this.newMapEventForm.eventsListbox.add(item.data);
                });
            };

            FormEditMapView.prototype.addMapEvent = function (mapAreaId, index) {
                index = typeof index === "undefined" ? this.newMapEventForm.eventsListbox.listboxSelectedItemIndex : index;
                var item = this.newMapEventForm.eventsListbox.items[index];

                if (index === -1) {
                    return false;
                }

                var cl = $(".subunit[data-id='" + mapAreaId + "']").attr("class");
                $(".subunit[data-id='" + mapAreaId + "']").attr("class", cl +" selected");

                item.data.mapAreaId = mapAreaId;

                this.newMapEventForm.eventsListbox.removeAt(index);
                this.currentMapEventsForm.eventsListbox.add(item.data, mapAreaId);

                if (this.currentMapEventsForm.eventsListbox.items.length > 0) {
                    this.currentMapEventsForm.$eventsListbox.show();
                    this.currentMapEventsForm.$emptyListPlaceholder.hide();
                }
            };

            FormEditMapView.prototype.show = function () {
                _super.prototype.show.call(this, {
                    effect: "slide",
                    direction: "left",
                    duration: 500
                });
            };

            FormEditMapView.prototype.close = function () {
                _super.prototype.close.call(this, {
                    effect: "slide",
                    direction: "left",
                    duration: 500,
                    complete: function () {
                        _this.newMapEventForm.eventsListbox.clear();
                        _this.currentMapEventsForm.eventsListbox.clear();
                    }
                });
            };

            /**
             * Click handler for navigation back button.
             */
            var onNavBackClicked = function (event) {
                _this.back();

                map.hide();
            };

            return FormEditMapView;
        })(CZ.UI.FormBase);
        UI.FormEditMapView = FormEditMapView;
    })(CZ.UI || (CZ.UI = {}));
    var UI = CZ.UI;
})(CZ || (CZ = {}));
