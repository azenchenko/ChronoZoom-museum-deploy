/// <reference path='../ui/controls/formbase.ts'/>
/// <reference path='../scripts/authoring.ts'/>
/// <reference path='../scripts/settings.ts'/>
/// <reference path='../scripts/typings/jquery/jquery.d.ts'/>
/// <reference path='../scripts/media.ts'/>
/// <reference path='../ui/media/skydrive-mediapicker.ts'/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var CZ;
(function (CZ) {
    (function (UI) {
        var FormEditCollection = (function (_super) {
            __extends(FormEditCollection, _super);
            // We only need to add additional initialization in constructor.
            function FormEditCollection(container, formInfo) {
                var _this = this;
                _super.call(this, container, formInfo);
                this.contentItem = {};

                this.saveButton = container.find(formInfo.saveButton);
                this.backgroundInput = container.find(formInfo.backgroundInput);
                this.backgroundInputName = container.find(formInfo.backgroundInputName);
                this.backgroundInputContainer = container.find(formInfo.backgroundInputContainer);
                this.chkBackgroundImage = container.find(formInfo.chkBackgroundImage);
                this.collectionTheme = formInfo.collectionTheme;
                this.activeCollectionTheme = jQuery.extend(true, {}, formInfo.collectionTheme);
                this.mediaListContainer = container.find(formInfo.mediaListContainer);
                this.kioskmodeInput = formInfo.kioskmodeInput;
                this.chkEditors = container.find(formInfo.chkEditors);
                this.btnEditors = container.find(formInfo.btnEditors);
                this.idleTimeoutContainer = container.find(formInfo.idleTimeoutContainer);
                this.inputIdleTimeout = container.find(formInfo.inputIdleTimeout);
                this.chkAutoPlayback = container.find(formInfo.chkAutoPlayback);

                this.timelineBackgroundColorInput = formInfo.timelineBackgroundColorInput;
                this.timelineBackgroundOpacityInput = formInfo.timelineBackgroundOpacityInput;
                this.timelineBorderColorInput = formInfo.timelineBorderColorInput;
                this.exhibitBackgroundColorInput = formInfo.exhibitBackgroundColorInput;
                this.exhibitBackgroundOpacityInput = formInfo.exhibitBackgroundOpacityInput;
                this.exhibitBorderColorInput = formInfo.exhibitBorderColorInput;

                // Hack to clear file input value.
                if (this.backgroundInput.length > 0) {
                    this.backgroundInput.remove();
                }

                this.backgroundInput = $("<input type='file' class='cz-form-item-collection-background cz-input'" +
                        "style='width: 100%; display: block;'></input>")
                    .insertBefore(this.backgroundInputName);

                this.backgroundInput.change(function () {
                    var $this = $(this);

                    file = $this.get(0).files[0];
                    _this.file = file || null;

                    if (file && !file.type.match(/image/)) {
                        _this.backgroundInput.showError("Please, select an image file.");
                        return false;
                    }

                    if (_this.file) {
                        _this.backgroundInputName.val(file.name);
                    }
                    else {
                        _this.backgroundInputName.val("No file selected");
                    }

                    _this.mediaFileChanged = true;

                    if (_this.file) {
                        CZ.Service.postLocalFile(_this.file).then(function (filename) {
                            _this.backgroundInputName.val(filename);
                            _this.updateCollectionTheme(true);
                        });
                    }
                });

                this.kioskmodeInput.change(function () {
                    _this.updateCollectionTheme(true);
                });

                this.timelineBackgroundColorInput.change(function () {
                    _this.updateCollectionTheme(true);
                });

                this.timelineBackgroundOpacityInput.change(function () {
                    _this.updateCollectionTheme(true);
                });

                this.timelineBorderColorInput.change(function () {
                    _this.updateCollectionTheme(true);
                });

                this.exhibitBackgroundColorInput.change(function () {
                    _this.updateCollectionTheme(true);
                });

                this.exhibitBackgroundOpacityInput.change(function () {
                    _this.updateCollectionTheme(true);
                });

                this.exhibitBorderColorInput.change(function () {
                    _this.updateCollectionTheme(true);
                });

                this.chkAutoPlayback.off("change");
                this.chkBackgroundImage.off("change");
                this.inputIdleTimeout.off("blur");

                this.inputIdleTimeout.on("blur", function (event) {
                    var $this = $(this),
                        duration = $this.val();

                    if (_this.chkAutoPlayback.is(":checked")) {
                        if (!_this.checkIdleDuration()) {
                            return false;
                        }
                        else {
                            _this.collectionTheme.idleTimeout = parseInt(duration);
                        }
                    }
                    else {
                        if (!_this.checkIdleDuration()) {
                            _this.collectionTheme.idleTimeout = CZ.Settings.theme.idleTimeout;
                        }
                        else {
                            _this.collectionTheme.idleTimeout = parseInt(duration);
                        }
                    }
                });

                this.inputIdleTimeout.off("focus")
                    .on("focus", function () {
                        $(this).hideError();
                    });

                this.chkAutoPlayback.change(function (event) {
                    var $this = $(this);

                    if ($this.is(":checked")) {
                        _this.idleTimeoutContainer.slideDown("fast");
                        _this.updateCollectionTheme(true);
                    } else {
                        _this.idleTimeoutContainer.slideUp("fast");
                        _this.updateCollectionTheme(true);
                    }
                });

                // Handler for enable/disable background image for collection.
                this.chkBackgroundImage.change(function (event) {
                    var $this = $(this);

                    if ($this.is(":checked")) {
                        _this.backgroundInputContainer.slideDown("fast");
                        _this.updateCollectionTheme(true);
                    }
                    else {
                        _this.backgroundInputContainer.slideUp("fast");
                        _this.updateCollectionTheme(true);
                    }
                });

                this.backgroundInput.focus(function () {
                    _this.backgroundInput.hideError();
                });

                this.mediaFileChanged = false;

                try  {
                    this.initialize();
                } catch (e) {
                    console.log("Error initializing collection form attributes");
                }

                this.saveButton.off().click(function (event) {
                    if (!_this.updateCollectionTheme(true)) {
                        return false;
                    }

                    // Checking if autoplay is enabled.
                    if (_this.chkAutoPlayback.is(":checked")) {
                        if (!_this.checkIdleDuration()) {
                            return false;
                        }
                        else {
                            _this.collectionTheme.idleTimeout = parseInt(_this.inputIdleTimeout.val());
                        }
                    }
                    else {
                        // Set idle timeout to current one, if the value is not correct.
                        if (!_this.checkIdleDuration()) {
                            _this.collectionTheme.idleTimeout = CZ.Settings.theme.idleTimeout;
                        }
                        else {
                            _this.collectionTheme.idleTimeout = parseInt(_this.inputIdleTimeout.val());
                        }
                    }

                    _this.activeCollectionTheme = _this.collectionTheme;

                    var collectionData = {
                        theme: JSON.stringify(_this.collectionTheme),
                        MembersAllowed: $(_this.chkEditors).prop('checked')
                    };

                    CZ.Service.putCollection(CZ.Service.superCollectionName, CZ.Service.collectionName, collectionData).always(function () {
                        _this.saveButton.prop('disabled', false);
                        _this.close();
                    });
                });
            }
            FormEditCollection.prototype.initialize = function () {
                var _this = this;
                this.saveButton.prop('disabled', false);

                // Hide container for mediapicker list if no mediapicker is enabled
                if ($.isEmptyObject(CZ.Media.mediaPickers)) {
                    this.mediaListContainer.hide()
                        .prev()
                            .hide()
                        .next().next()
                            .hide();
                }
                else {
                    this.mediaList = new CZ.UI.MediaList(this.mediaListContainer, CZ.Media.mediaPickers, this.contentItem, this);
                }

                this.backgroundInputName.val(this.collectionTheme.backgroundUrl);
                this.kioskmodeInput.prop("checked", false); // temp default to false for now until fix in place that loads theme from db (full fix implemented in MultiUser branch)

                if (!this.collectionTheme.timelineColor)
                    this.collectionTheme.timelineColor = CZ.Settings.timelineColorOverride;

                if (this.collectionTheme.backgroundUrlEnabled) {
                    this.chkBackgroundImage.prop("checked", this.collectionTheme.backgroundUrlEnabled);
                    this.backgroundInputContainer.slideDown("fast");
                }

                if (this.collectionTheme.autoplay) {
                    this.chkAutoPlayback.prop("checked", this.collectionTheme.autoplay);
                    this.idleTimeoutContainer.slideDown("fast");
                }

                this.inputIdleTimeout.val(this.collectionTheme.idleTimeout);
                this.timelineBackgroundColorInput.val(this.getHexColorFromColor(this.collectionTheme.timelineColor));
                this.timelineBackgroundOpacityInput.val(this.getOpacityFromRGBA(this.collectionTheme.timelineColor).toString());
                this.timelineBorderColorInput.val(this.getHexColorFromColor(this.collectionTheme.timelineStrokeStyle));

                this.exhibitBackgroundColorInput.val(this.getHexColorFromColor(this.collectionTheme.infoDotFillColor));
                this.exhibitBackgroundOpacityInput.val(this.getOpacityFromRGBA(this.collectionTheme.infoDotFillColor).toString());
                this.exhibitBorderColorInput.val(this.getHexColorFromColor(this.collectionTheme.infoDotBorderColor));

                CZ.Service.getCollection().done(function (data) {
                    var themeFromDb = JSON.parse(data.theme);
                    if (themeFromDb == null) {
                        $(_this.kioskmodeInput).prop('checked', false);
                    } else {
                        $(_this.kioskmodeInput).prop('checked', themeFromDb.kioskMode);
                    }
                    $(_this.chkEditors).prop('checked', data.MembersAllowed);
                    _this.renderManageEditorsButton();
                });

                this.chkEditors.off().click(function (event) {
                    _this.renderManageEditorsButton();
                });
            };

            FormEditCollection.prototype.colorIsRgba = function (color) {
                return color ? color.substr(0, 5) === "rgba(" : false;
            };

            FormEditCollection.prototype.colorIsRgb = function (color) {
                return color ? color.substr(0, 4) === "rgb(" : false;
            };

            FormEditCollection.prototype.colorIsHex = function (color) {
                return color ? color.substr(0, 1) === "#" && color.length >= 7 : false;
            };

            FormEditCollection.prototype.rgbaFromColor = function (color, alpha) {
                if (!color)
                    return color;

                if (this.colorIsRgba(color)) {
                    var parts = color.substr(5, color.length - 5 - 1).split(",");
                    if (parts.length > 3)
                        parts[parts.length - 1] = alpha.toString();
                    else
                        parts.push(alpha.toString());
                    return "rgba(" + parts.join(",") + ")";
                }

                var red = parseInt("0x" + color.substr(1, 2));
                var green = parseInt("0x" + color.substr(3, 2));
                var blue = parseInt("0x" + color.substr(5, 2));

                return "rgba(" + red + "," + green + "," + blue + "," + alpha + ")";
            };

            FormEditCollection.prototype.getOpacityFromRGBA = function (rgba) {
                if (!rgba)
                    return null;
                if (!this.colorIsRgba(rgba))
                    return 1.0;

                var parts = rgba.split(",");
                var lastPart = parts[parts.length - 1].split(")")[0];
                return parseFloat(lastPart);
            };

            FormEditCollection.prototype.getHexColorFromColor = function (color) {
                if (this.colorIsHex(color))
                    return color;

                if (!this.colorIsRgb(color) && !this.colorIsRgba(color))
                    return null;

                var offset = this.colorIsRgb(color) ? 4 : 5;
                var parts = color.substr(offset, color.length - offset - 1).split(",");
                var lastPart = parts[parts.length - 1].split(")")[0];
                return "#" + this.colorHexFromInt(parts[0]) + this.colorHexFromInt(parts[1]) + this.colorHexFromInt(parts[2]);
            };

            FormEditCollection.prototype.colorHexFromInt = function (colorpart) {
                var hex = Number(colorpart).toString(16);
                if (hex.length === 1)
                    return "0" + hex;

                return hex;
            };

            FormEditCollection.prototype.renderManageEditorsButton = function () {
                if (this.chkEditors.prop('checked')) {
                    this.btnEditors.slideDown('fast');
                } else {
                    this.btnEditors.slideUp('fast');
                }
            };

            FormEditCollection.prototype.updateCollectionTheme = function (clearError) {
                this.collectionTheme = {
                    backgroundUrlEnabled: this.chkBackgroundImage.prop("checked"),
                    backgroundUrl: this.backgroundInputName.val(),
                    backgroundColor: "#232323",
                    timelineColor: this.rgbaFromColor(this.timelineBackgroundColorInput.val(), this.timelineBackgroundOpacityInput.val()),
                    timelineStrokeStyle: this.timelineBorderColorInput.val(),
                    infoDotFillColor: this.rgbaFromColor(this.exhibitBackgroundColorInput.val(), this.exhibitBackgroundOpacityInput.val()),
                    infoDotBorderColor: this.exhibitBorderColorInput.val(),
                    kioskMode: this.kioskmodeInput.prop("checked"),
                    autoplay: this.chkAutoPlayback.prop("checked")
                };

                // If the input holds an rgba color, update the textbox with new alpha value
                if (this.colorIsRgb(this.timelineBackgroundColorInput.val())) {
                    this.timelineBackgroundColorInput.val(this.collectionTheme.timelineColor);
                    this.exhibitBackgroundColorInput.val(this.collectionTheme.infoDotFillColor);
                }

                if (this.file && !this.file.type.match(/image/)) {
                    this.backgroundInput.showError("Please, select an image file.");
                    return false;
                }

                if (clearError) {
                    this.inputIdleTimeout.hideError();
                }

                this.updateCollectionThemeFromTheme(this.collectionTheme);

                return true;
            };

            FormEditCollection.prototype.updateCollectionThemeFromTheme = function (theme) {
                if (this.file && !this.file.type.match(/image/)) {
                    this.backgroundInput.showError("Please, select an image file.");
                    return false;
                }

                CZ.Settings.applyTheme(theme, false);

                CZ.Common.vc.virtualCanvas("forEachElement", function (element) {
                    if (element.type === "timeline") {
                        element.settings.fillStyle = theme.timelineColor;
                        element.settings.strokeStyle = theme.timelineStrokeStyle;
                        element.settings.gradientFillStyle = theme.timelineStrokeStyle;
                    } else if (element.type === "infodot") {
                        element.settings.fillStyle = theme.infoDotFillColor;
                        element.settings.strokeStyle = theme.infoDotBorderColor;
                    }
                });

                CZ.Common.vc.virtualCanvas("requestInvalidate");
            };

            FormEditCollection.prototype.updateMediaInfo = function () {
                var clearError = true;

                // Using tempSource is less than ideal; however, SkyDrive does not support any permanent link to the file and therefore we will warn users. Future: Create an image cache in the server.

                this.updateCollectionTheme(clearError);
            };

            FormEditCollection.prototype.show = function () {
                _super.prototype.show.call(this, {
                    effect: "slide",
                    direction: "left",
                    duration: 500
                });

                this.activationSource.addClass("active");
            };

            FormEditCollection.prototype.close = function () {
                var _this = this;
                _super.prototype.close.call(this, {
                    effect: "slide",
                    direction: "left",
                    duration: 500,
                    complete: function () {
                        _this.backgroundInput.hideError();
                        _this.inputIdleTimeout.hideError();

                        if (_this.mediaList) {
                            _this.mediaList.remove();
                        }
                    }
                });

                this.updateCollectionThemeFromTheme(this.activeCollectionTheme);
            };

            /**
             * Check that value that is in idle input is valid.
             * If it's not valid returns false and shows error under input element.
             */
            FormEditCollection.prototype.checkIdleDuration = function () {
                var duration = this.inputIdleTimeout.val();

                // Duration is not a number.
                if (isNaN(Number(duration)) || !isFinite(Number(duration)) || isNaN(parseInt(duration))) {
                    this.inputIdleTimeout.showError("Idling timeout should be a valid number.");
                    return false;
                }

                // Timeout can't be lower than 30 seconds.
                if (duration < CZ.Settings.defaultIdleTimeout) {
                    this.inputIdleTimeout.showError("Idling timeout should be at least " + CZ.Settings.defaultIdleTimeout + " seconds.")
                    return false;
                }

                return true;
            };

            return FormEditCollection;
        })(CZ.UI.FormUpdateEntity);
        UI.FormEditCollection = FormEditCollection;
    })(CZ.UI || (CZ.UI = {}));
    var UI = CZ.UI;
})(CZ || (CZ = {}));
