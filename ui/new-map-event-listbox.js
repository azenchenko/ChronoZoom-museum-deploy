var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var CZ;
(function (CZ) {
    (function (UI) {
        var NewMapEventListbox = (function (_super) {
            __extends(NewMapEventListbox, _super);

            var _this;

            function NewMapEventListbox(container, listItemContainer, exhibits) {
                var self = this;
                _this = this;

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

                this.listboxSelectedItem = null;
                this.listboxSelectedItemIndex = -1;
                listItemsInfo.default.ctor = NewMapEventListItem;

                _super.call(this, container, listboxInfo, listItemsInfo);

                this.initialize();
            }

            NewMapEventListbox.prototype.initialize = function () {
                this.itemClick(function (item, index) {
                    this.container.find(".selected").removeClass("selected");

                    this.items[index].container.find(".cz-listitem").addClass("selected");

                    this.listboxSelectedItem = item;
                    this.listboxSelectedItemIndex = index;
                });

                this.itemRemove(function (index) {
                    if (_this.items.length === 0) {
                        _this.container.trigger("emptylistbox", "newMapEventListbox");
                    }
                });
            };

            NewMapEventListbox.prototype.remove = function (item) {
                for (var i = this.items.indexOf(item) + 1; i < this.items.length; i++) {
                    if (this.items[i].data && this.items[i].data.order)
                        this.items[i].data.order--;

                    if (this.listboxSelectedItem === item) {
                        this.listboxSelectedItem = null;
                        this.listboxSelectedItemIndex = -1;
                    }
                }

                _super.prototype.remove.call(this, item);
            };

            NewMapEventListbox.prototype.removeAt = function (index) {
                CZ.UI.ListboxBase.prototype.removeAt.call(this, index);

                if (index === this.listboxSelectedItemIndex) {
                    this.listboxSelectedItem = null;
                    this.listboxSelectedItemIndex = -1;
                }
            };

            return NewMapEventListbox;
        })(UI.ListboxBase);
        UI.NewMapEventListbox = NewMapEventListbox;

        var NewMapEventListItem = (function (_super) {
            __extends(NewMapEventListItem, _super);

            function NewMapEventListItem(parent, container, uiMap, context) {
                var _this = this;
                _super.call(this, parent, container, uiMap, context);

                var date = CZ.Dates.convertCoordinateToYear(context.infodotDescription.date);

                this.iconImg = this.container.find(uiMap.iconImg);
                this.titleTextblock = this.container.find(uiMap.titleTextblock);
                this.dateTextblock = this.container.find(uiMap.dateTextblock);

                this.iconImg.attr("onerror", "this.src='/images/Temp-Thumbnail2.png';");
                this.iconImg.attr("src", context.contentItems[0].uri);
                this.titleTextblock.text(context.infodotDescription.title);
                this.dateTextblock.text(date.year + " " + date.regime);
            }

            return NewMapEventListItem;
        })(UI.ListItemBase);
        UI.NewMapEventListItem = NewMapEventListItem;
    })(CZ.UI || (CZ.UI = {}));
    var UI = CZ.UI;
})(CZ || (CZ = {}));
