/// <reference path='../ui/controls/formbase.ts'/>
/// <reference path='../scripts/authoring.ts'/>
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
        var FormEditCI = (function (_super) {
            __extends(FormEditCI, _super);
            function FormEditCI(container, formInfo) {
                var _this = this;
                _super.call(this, container, formInfo);

                this.titleTextblock = container.find(formInfo.titleTextblock);
                this.titleInput = container.find(formInfo.titleInput);
                this.mediaInput = container.find(formInfo.mediaInput);
                this.mediaSourceInput = container.find(formInfo.mediaSourceInput);
                this.mediaTypeInput = container.find(formInfo.mediaTypeInput);
                this.mediaInputName = container.find(formInfo.mediaInputName);
                this.attributionInput = container.find(formInfo.attributionInput);
                this.descriptionInput = container.find(formInfo.descriptionInput);
                this.previewButton = container.find('a.preview');
                this.previewBox = container.find('div.preview');
                this.errorMessage = container.find(formInfo.errorMessage);
                this.saveButton = container.find(formInfo.saveButton);
                this.mediaListContainer = container.find(formInfo.mediaListContainer);

                // Hack to clear file input value.
                if (this.mediaInput.length > 0) {
                    this.mediaInput.remove();
                }

                this.mediaInput = $("<input type='file' class='cz-form-item-mediaurl cz-input'" +
                        "style='width: 100%; display: block;'></input>")
                    .insertBefore(this.mediaInputName);

                this.titleInput.focus(function () {
                    _this.titleInput.hideError();
                });

                this.mediaInput.focus(function () {
                    _this.mediaInput.hideError();
                });

                this.mediaSourceInput.focus(function () {
                    _this.mediaSourceInput.hideError();
                });

                this.prevForm = formInfo.prevForm;

                this.exhibit = formInfo.context.exhibit;
                this.contentItem = formInfo.context.contentItem;

                this.mode = CZ.Authoring.mode; // deep copy mode. it never changes throughout the lifecycle of the form.
                this.isCancel = true;
                this.isModified = false;
                this.mediaFileChanged = false;
                this.initUI();
            }
            FormEditCI.prototype.initUI = function () {
                var _this = this;

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

                this.saveButton.prop('disabled', false);

                this.titleInput.change(function () {
                    _this.isModified = true;
                });
                this.mediaInput.change(function () {
                    _this.isModified = true;
                });
                this.mediaSourceInput.change(function () {
                    _this.isModified = true;
                });
                this.mediaTypeInput.change(function () {
                    _this.isModified = true;
                });
                this.attributionInput.change(function () {
                    _this.isModified = true;
                });
                this.descriptionInput.change(function () {
                    _this.isModified = true;
                });

                this.mediaInput.change(function () {
                    var $this = $(this),
                        file = $this.get(0).files[0];

                    _this.mediaFileChanged = true;

                    if (file) {
                        _this.mediaInputName.val(file.name);
                    }
                    else {
                        _this.mediaInputName.val("No file selected");
                    }

                    _this.file = file || null;
                });

                if (CZ.Media.SkyDriveMediaPicker.isEnabled && this.mediaTypeInput.find("option[value='skydrive-image']").length === 0) {
                    $("<option></option>", {
                        value: "skydrive-image",
                        text: " Skydrive Image "
                    }).appendTo(this.mediaTypeInput);
                    $("<option></option>", {
                        value: "skydrive-document",
                        text: " Skydrive Document "
                    }).appendTo(this.mediaTypeInput);
                }

                this.file = null;
                this.titleInput.val(this.contentItem.title || "");
                this.mediaInputName.val(this.contentItem.uri || "No file selected");
                this.mediaSourceInput.val(this.contentItem.mediaSource || "");
                this.mediaTypeInput.val(this.contentItem.mediaType || "");
                this.attributionInput.val(this.contentItem.attribution || "");
                this.descriptionInput.val(this.contentItem.description || "");

                this.renderPreviewButton = function ()
                {
                    if (_this.previewBox.is(':visible'))
                    {
                        _this.previewButton.text('edit');
                        _this.previewButton.attr('title', 'Return to editing the description');
                    }
                    else
                    {
                        _this.previewButton.text('preview');
                        _this.previewButton.attr('title', 'See what the description looks like using Markdown');
                    }
                };

                this.renderPreviewButton(); // call to set initial label and text

                this.previewButton.off().on('click', function (event)
                {
                    _this.previewBox.html(marked(_this.descriptionInput.val()));
                    _this.descriptionInput.toggle();
                    _this.previewBox.toggle();
                    _this.renderPreviewButton();
                });

                this.saveButton.off();
                this.saveButton.click(function () {
                    return _this.onSaveClick();
                });

                if (CZ.Authoring.contentItemMode === "createContentItem") {
                    this.titleTextblock.text("Create New");
                    this.saveButton.text("Create Artifiact");

                    this.closeButton.hide();
                } else if (CZ.Authoring.contentItemMode === "editContentItem") {
                    this.titleTextblock.text("Edit");
                    this.saveButton.text("Update Artifact");

                    if (this.prevForm && this.prevForm instanceof UI.FormEditExhibit)
                        this.closeButton.hide();
                    else
                        this.closeButton.show();
                } else {
                    console.log("Unexpected authoring mode in content item form.");
                    this.close();
                }

                this.saveButton.show();
            };

            FormEditCI.prototype.saveContentItem = function (filename) {
                var _this = this;

                this.mediaInputName.val(filename);
                this.mediaInput.attr("data-filename", filename);

                var newContentItem = {
                    title: this.titleInput.val() || "",
                    uri: filename,
                    mediaSource: this.mediaSourceInput.val() || "",
                    mediaType: this.mediaTypeInput.val() || "",
                    attribution: this.attributionInput.val() || "",
                    description: this.descriptionInput.val() || "",
                    order: this.contentItem.order
                };

                if (!CZ.Authoring.isNotEmpty(newContentItem.title)) {
                    this.titleInput.showError("Title can't be empty");
                }

                if (!CZ.Authoring.isNotEmpty(newContentItem.uri)) {
                    this.mediaInput.showError("URL can't be empty");
                }

                if (CZ.Authoring.validateContentItems([newContentItem], this.mediaInput)) {
                    if (CZ.Authoring.contentItemMode === "createContentItem") {
                        if (this.prevForm && this.prevForm instanceof UI.FormEditExhibit) {
                            this.isCancel = false;
                            this.prevForm.contentItemsListbox.add(newContentItem);
                            $.extend(this.exhibit.contentItems[this.contentItem.order], newContentItem);
                            this.prevForm.exhibit = this.exhibit = CZ.Authoring.renewExhibit(this.exhibit);
                            CZ.Common.vc.virtualCanvas("requestInvalidate");
                            this.isModified = false;
                            this.back();
                        }
                    } else if (CZ.Authoring.contentItemMode === "editContentItem") {
                        if (this.prevForm && this.prevForm instanceof UI.FormEditExhibit) {
                            // Updating exhibit.

                            if (!this.contentItem.guid) {
                                clickedListItem.iconImg.attr("src", newContentItem.uri);
                            }

                            this.isCancel = false;
                            var clickedListItem = this.prevForm.clickedListItem;
                            clickedListItem.titleTextblock.text(newContentItem.title);
                            clickedListItem.descrTextblock.text(newContentItem.description);
                            $.extend(this.exhibit.contentItems[this.contentItem.order], newContentItem);
                            this.prevForm.exhibit = this.exhibit = CZ.Authoring.renewExhibit(this.exhibit);
                            this.prevForm.isModified = true;
                            CZ.Common.vc.virtualCanvas("requestInvalidate");
                            this.isModified = false;
                            this.back();
                        } else {
                            // Editing single content item.

                            var filetype = this.file ? this.file.type : this.contentItem.mediaType;

                            $("#wait2").attr("data-text", "Updating thumbnail... ")
                                .show();

                            // Update local thumbnail for existing exhibit (guid is defined).
                            CZ.Common.generateLocalThumbnail(filetype, filename, this.contentItem.guid)
                                .done(function () {
                                    $("#wait2").hide();
                                    console.log("Generated local thumbnail for item " + _this.contentItem.guid);

                                    _this.saveButton.prop('disabled', true);
                                    CZ.Authoring.updateContentItem(_this.exhibit, _this.contentItem, newContentItem).then(function (response) {
                                        _this.isCancel = false;
                                        _this.isModified = false;
                                        _this.close();
                                    }, function (error) {
                                        var errorMessage = error.statusText;

                                        if (errorMessage.match(/Media Source/)) {
                                            _this.errorMessage.text("One or more fields filled wrong");
                                            _this.mediaSourceInput.showError("Media Source URL is not a valid URL");
                                        } else {
                                            _this.errorMessage.text("Sorry, internal server error :(");
                                        }

                                        _this.errorMessage.show().delay(7000).fadeOut();
                                    }).always(function () {
                                        _this.saveButton.prop('disabled', false);
                                    });
                                });
                        }
                    }
                } else {
                    this.errorMessage.text("One or more fields filled wrong").show().delay(7000).fadeOut();
                }
            };

            FormEditCI.prototype.onSaveClick = function () {
                var _this = this;

                this.mediaInput.hideError();
                this.mediaTypeInput.hideError();

                // File was not selected.
                if (this.mediaInputName.val() === "No file selected") {
                    this.mediaInput.showError("Media file was not selected.");
                    return false;
                }

                // Selected image, but media type is not image.
                if (this.file && this.mediaTypeInput.val().match(/image/) && !this.file.type.match(/image/)) {
                    this.mediaTypeInput.showError("Selected media type is an image, but uploaded file is not an image.");
                    return false;
                }

                // Selected video, but media type is not video.
                if (this.file && this.mediaTypeInput.val().match(/video/) && !this.file.type.match(/video/)) {
                    this.mediaTypeInput.showError("Selected media type is an video, but uploaded file is not an video.");
                    return false;
                }

                // File wasn't changed, but media type changed. Can occur only while editing existing content item,
                // proper media type was changed to improper.
                if (!this.file && this.mediaTypeInput.val() !== this.contentItem.mediaType) {
                    this.mediaTypeInput.showError("Selected media type doesn't match media type of selected file.");
                    return false;
                }

                if (this.mediaFileChanged) {
                    CZ.Service.postLocalFile(this.file).then(function (filename) {
                        _this.mediaInputName.val(filename)
                        _this.saveContentItem(filename);
                    },
                    function (error) {
                        console.log("[Error] Failed to post a file stream. Given error: " + error);
                    });
                }
                else {
                    this.saveContentItem(this.mediaInputName.val());
                }
            };

            FormEditCI.prototype.updateMediaInfo = function () {
                this.mediaInputName.val(this.mediaInput.uri || "No file selected");
                this.mediaSourceInput.val(this.contentItem.mediaSource || "");
                this.mediaTypeInput.val(this.contentItem.mediaType || "");
                this.attributionInput.val(this.contentItem.attribution || "");
            };

            FormEditCI.prototype.show = function (noAnimation) {
                CZ.Authoring.isActive = true;
                this.activationSource.addClass("active");
                this.errorMessage.hide();
                _super.prototype.show.call(this, noAnimation ? undefined : {
                    effect: "slide",
                    direction: "left",
                    duration: 500
                });
            };

            FormEditCI.prototype.close = function (noAnimation) {
                var _this = this;
                if (typeof noAnimation === "undefined") { noAnimation = false; }
                if (this.isModified) {
                    if (window.confirm("There is unsaved data. Do you want to close without saving?")) {
                        this.isModified = false;
                    } else {
                        return;
                    }
                }

                $("#wait2").hide();

                _super.prototype.close.call(this, noAnimation ? undefined : {
                    effect: "slide",
                    direction: "left",
                    duration: 500,
                    complete: function () {
                        if (_this.mediaList) {
                            _this.mediaList.remove();
                        }

                        _this.mediaInput.hideError();
                        _this.titleInput.hideError();
                        _this.mediaSourceInput.hideError();
                    }
                });
                if (this.isCancel) {
                    if (CZ.Authoring.contentItemMode === "createContentItem") {
                        this.exhibit.contentItems.pop();
                    }
                }
                this.activationSource.removeClass("active");
                CZ.Authoring.isActive = false;
            };

            return FormEditCI;
        })(CZ.UI.FormUpdateEntity);
        UI.FormEditCI = FormEditCI;
    })(CZ.UI || (CZ.UI = {}));
    var UI = CZ.UI;
})(CZ || (CZ = {}));
