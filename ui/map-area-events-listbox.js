var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var CZ;
(function (CZ) {
    (function (UI) {
        var MapAreaExhibitsListbox = (function (_super) {
            __extends(MapAreaExhibitsListbox, _super);
            function MapAreaExhibitsListbox(container, listItemContainer, exhibits) {
                var self = this;
                var listboxInfo = {
                    context: exhibits
                };

                var listItemsInfo = {
                    default: {
                        container: listItemContainer,
                        uiMap: {
                            iconImg: ".cz-map-event-listitem-icon > img",
                            titleTextblock: ".cz-map-event-listitem-title",
                            dateTextblock: ".cz-map-event-listitem-date"
                        }
                    }
                };

                listItemsInfo.default.ctor = MapAreaExhibitListItem;

                _super.call(this, container, listboxInfo, listItemsInfo);

                this.initialize();
            }

            MapAreaExhibitsListbox.prototype.initialize = function () {
                var _this = this;

                this.itemClick(function (item, index) {
                    _this.listboxSelectedItem = item;
                    _this.listboxSelectedItemIndex = index;

                    var cis = item.data.contentItems.map(function (ci) {
                            return {
                                title: ci.title,
                                mediaType: ci.mediaType,
                                media: ci.uri,
                                description: ci.description
                            };
                        }),
                        exhibit = {
                            id: item.data.infodotDescription.guid,
                            title: item.data.infodotDescription.title,
                            date: item.data.infodotDescription.date,
                            contentItems: cis
                        };

                    CZ._ExhibitFullscreenViewer.show([exhibit], item.data.infodotDescription.guid);
                });
            };

            MapAreaExhibitsListbox.prototype.remove = function (item) {
                for (var i = this.items.indexOf(item) + 1; i < this.items.length; i++)
                    if (this.items[i].data && this.items[i].data.order)
                        this.items[i].data.order--;

                _super.prototype.remove.call(this, item);
            };

            MapAreaExhibitsListbox.prototype.add = function (item, mapAreaId) {
                CZ.UI.ListboxBase.prototype.add.call(this, arguments[0]);
            };

            return MapAreaExhibitsListbox;
        })(UI.ListboxBase);
        UI.MapAreaExhibitsListbox = MapAreaExhibitsListbox;

        var MapAreaExhibitListItem = (function (_super) {
            __extends(MapAreaExhibitListItem, _super);

            function MapAreaExhibitListItem(parent, container, uiMap, context) {
                var _this = this;
                _super.call(this, parent, container, uiMap, context);

                var date = CZ.Dates.convertCoordinateToYear(context.infodotDescription.date);

                this.iconImg = this.container.find(uiMap.iconImg);
                this.titleTextblock = this.container.find(uiMap.titleTextblock);
                this.dateTextblock = this.container.find(uiMap.dateTextblock);

                this.iconImg.attr("onerror", "this.src='/images/Temp-Thumbnail2.png';");
                this.iconImg.attr("src", context.contentItems[0].uri);
                // this.iconImg.attr("src", iconSrc);
                this.titleTextblock.text(context.infodotDescription.title);
                this.dateTextblock.text(date.year + " " + date.regime);
            }

            return MapAreaExhibitListItem;
        })(UI.ListItemBase);
        UI.MapAreaExhibitListItem = MapAreaExhibitListItem;
    })(CZ.UI || (CZ.UI = {}));
    var UI = CZ.UI;
})(CZ || (CZ = {}));
