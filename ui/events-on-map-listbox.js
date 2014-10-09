var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var CZ;
(function (CZ) {
    (function (UI) {
        var CurrentMapEventsListbox = (function (_super) {
            __extends(CurrentMapEventsListbox, _super);
            function CurrentMapEventsListbox(container, listItemContainer, exhibits) {
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
                            dateTextblock: ".cz-map-event-listitem-date",
                            removeBtn: ".cz-listitem-remove-btn"
                        }
                    }
                };

                listItemsInfo.default.ctor = CurrentMapEventListItem;

                _super.call(this, container, listboxInfo, listItemsInfo);
            }

            CurrentMapEventsListbox.prototype.remove = function (item) {
                for (var i = this.items.indexOf(item) + 1; i < this.items.length; i++)
                    if (this.items[i].data && this.items[i].data.order)
                        this.items[i].data.order--;

                _super.prototype.remove.call(this, item);
            };

            CurrentMapEventsListbox.prototype.add = function (item, mapAreaId) {
                CZ.UI.ListboxBase.prototype.add.call(this, arguments[0]);

                mapAreaId = mapAreaId || item.mapAreaId;

                this.items[this.items.length - 1].container.attr("data-map-area-id", mapAreaId);
            };

            return CurrentMapEventsListbox;
        })(UI.ListboxBase);
        UI.CurrentMapEventsListbox = CurrentMapEventsListbox;

        var CurrentMapEventListItem = (function (_super) {
            __extends(CurrentMapEventListItem, _super);


            function onRemoveBtnClicked (event) {
                var item = event.data.item;
                var id = $(event.srcElement).parent().parent().parent().parent().attr("data-map-area-id");

                item.container.trigger("mapeventremoved", { item: item, id: id});
            }

            function CurrentMapEventListItem(parent, container, uiMap, context) {
                var _this = this;
                _super.call(this, parent, container, uiMap, context);

                var date = CZ.Dates.convertCoordinateToYear(context.infodotDescription.date);
                // ,iconSrc = CZ.Settings.contentItemThumbnailBaseUri + 'x3/' + this.data.contentItems[0].guid + '.png'

                this.iconImg = this.container.find(uiMap.iconImg);
                this.titleTextblock = this.container.find(uiMap.titleTextblock);
                this.dateTextblock = this.container.find(uiMap.dateTextblock);
                this.removeBtn = this.container.find(uiMap.removeBtn);

                this.removeBtn.on("click", {
                    item: this
                }, onRemoveBtnClicked);

                this.iconImg.attr("onerror", "this.src='/images/Temp-Thumbnail2.png';");
                this.iconImg.attr("src", context.contentItems[0].uri);
                // this.iconImg.attr("src", iconSrc);
                this.titleTextblock.text(context.infodotDescription.title);
                this.dateTextblock.text(date.year + " " + date.regime);
            }

            return CurrentMapEventListItem;
        })(UI.ListItemBase);
        UI.CurrentMapEventListItem = CurrentMapEventListItem;
    })(CZ.UI || (CZ.UI = {}));
    var UI = CZ.UI;
})(CZ || (CZ = {}));
