$(function () {
    var ImageInputString = 'nothing';
    var ImageOutputString = '';
    var SolutionResult = '';

    //選取範圍
    var ImgX = 0 , ImgY = 0 , ImgW = 0 , ImgH = 0 ;
    //圖寬高
    var selWidth = 0, selHeight = 0, scaleImg = 0;
    //真實圖寬高
    var realWidth = 0, realHeight = 0, boundw = 0, boundh = 0;
    // 畫布
    var ct = document.getElementById("myCanvas");
    var ctx = ct.getContext("2d");
    //畫布顯示比例 x,y,w,h,ratio
    var ImgX_ratio = 0 , ImgY_ratio = 0 , ImgW_ratio = 0 , ImgH_ratio = 0, ratio = 0;

    /* Upload Image to Server*/
    $('#upload').click(ImageInput);
    function ImageInput(data){
        function callback(result){ //result = True/False

       }
       ImageInputString = ct.toDataURL('image/jpeg', 1);
        dan.push('ImageInput', [ImageInputString], callback); //df_name, data, callback_function
        console.log('Upload to Server');
    }

    /* Get Image Base64*/
    function ImageOutput (data) {
        ImageOutputString = data[1];
        console.log(ImageOutputString);
        if (ImageOutputString == 1)
        {
            SolutionResult = '有毒(無螢光色)'
            var SolDom = $('#solution');
            SolDom.text(SolutionResult);
            console.log(SolutionResult);
        }
        else if (ImageOutputString == 0){
            SolutionResult = '無毒(有螢光色)'
            var SolDom = $('#solution');
            SolDom.text(SolutionResult);
            console.log(SolutionResult);
        }
        else{
            var SolDom = $('#solution');
            SolDom.text('Fault');
        }
    }

    /*Download Image*/
    $('#download').click(download);
    function download(data){
        var img = document.getElementById('GetImg');
        var url = img.src.replace(/^data:image\/[^;]+/, 'data:application/octet-stream');
        window.open(url);
        console.log('Download Image');
    }

    function iot_app () {
    }

    var profile = {
        'dm_name': 'Smartphone',
        'df_list': [ImageInput,ImageOutput],
    }

    var ida = {
        'iot_app': iot_app,
    };

    dai(profile, ida);


    /* 圖片 */
    ;(function(global, $, Crop) {
    var defaultOpt = {
        /* 整個圖片選擇、裁剪、上傳區域的最外圍包裹元素id，默認TCrop */
        id: 'TCrop',
        /* 上傳路徑 */
        url: '',
        /* 允許上傳的圖片的後綴，暫時支持以下四種，其餘格式圖片未測試 */
        allowsuf: ['jpg', 'jpeg', 'png', 'gif'],
        /* JCrop參數設置 */
        cropParam: {
            minSize: [10, 10],          // 選框最小尺寸
            // maxSize: [300, 300],        // 選框最大尺寸
            allowSelect: true,          // 允許新選框
            allowMove: true,            // 允許選框移動
            allowResize: true,          // 允許選框縮放
            dragEdges: true,            // 允許拖動邊選框
            onChange: function(c) {},   // 選框改變時的事件
            onSelect: function(c) {}    // 選框選定時的事件，參數c={x, y, x1, y1, w, h}
        },
        /* 是否進行裁剪，不裁剪則按原圖上傳，默認進行裁剪 */
        isCrop: true,
        /* 圖片上傳完成之後的回調，無論是否成功上傳 */
        onComplete: function(data) {
            console.log('upload complete!');
        }
    };

    /* 記錄jcrop實例 */
    var jcropApi;

    /* 完整DOM結構 --e-- */
    function _createDom($wrap, opt) {
        var accept = 'image/' + opt.allowsuf.join(', image/');
        var $ifr = $('<iframe id="uploadIfr" name="uploadIfr" class="crop-hidden"></iframe>');
        var $form = $('<form action="' + opt.url + '" enctype="multipart/form-data" method="post" target="uploadIfr"/>');
        var $cropDataInp = $('<input type="hidden" name="cropData">');
        var $picker = $('<div class="crop-picker-wrap"><button class="btn btn-info btn-lg" type="button"><i class="fa fa-image"></i> select</button></div>');
        var $fileInp = $('<input type="file" id="file" accept="' + accept + '" class="crop-picker-file">');
        $picker.append($fileInp);
        $form.append($cropDataInp).append($picker);

        var $cropWrap = $('<div class="crop-wrapper crop-hidden"/>');
        var $cropArea = $('<div class="crop-area-wrapper"></div>');
        var $cropPreviewWrap = $('<div class="crop-preview-wrapper"></div>');
        var $cropPreview = $('<div class="crop-preview-container"/>');
        $cropPreviewWrap.append($cropPreview);
        var $cropContainer = $('<div class="crop-container"/>').append($cropArea).append($cropPreviewWrap);
        $cropWrap.append($cropContainer);

        var $save = $('<div class="crop-save"><i class="fa fa-check"></i> 保存</div>');
        var $cropCancel = $('<div class="crop-cancel"><i class="fa fa-close"></i> 取消</div>');
        var $cropOpe = $('<div class="crop-operate"/>').append($save).append($cropCancel);


        if(!opt.isCrop) {
            $cropPreviewWrap.addClass('crop-hidden');
        }

        $cropWrap.append($cropOpe);
        $form.append($cropWrap);

        $wrap.append($ifr).append($form);

        return {
                $ifr: $ifr,
                $form: $form,
                $cropDataInp: $cropDataInp,
                $cropPicker: $picker,
                $fileInp: $fileInp,
                $cropWrap: $cropWrap,
                $cropArea: $cropArea,
                $cropPreview: $cropPreview,
                // $saveSource: $saveSource,
                $save: $save,
                $cancel: $cropCancel,
            };
    };

    /*
     * 綁定事件
     *
     */
    function _bind($cropObj, opt) {

        var $cropPicker = $cropObj.$cropPicker;
        var $fileInp = $cropObj.$fileInp;
        var $save = $cropObj.$save;
        var $cancel = $cropObj.$cancel;
        var $ifr = $cropObj.$ifr;

        $fileInp.change(function(eve) {
            if(!this.value) {return ;}
            var fileSuf = this.value.substring(this.value.lastIndexOf('.') + 1);
            if(!_checkSuf(fileSuf, opt.allowsuf)) {
                alert('只允許上傳後綴名為' + opt.allowsuf.join(',') + '的圖片');
                return ;
            }
            /* 進入裁剪流程 */
            _crop($cropObj, this);
            $cropPicker.addClass('crop-hidden').next().removeClass('crop-hidden');
        });

        $save.click(function(eve) {
            eve.preventDefault();
            $('#UpImg').attr("src", );
            // ct.width = Math.abs(ImgW-ImgX) * ratio, ct.height = Math.abs(ImgH-ImgY) * ratio;
            ct.width = selWidth, ct.height = selHeight;
            ctx.clearRect(0,0, selWidth, selHeight);
            ctx.drawImage(document.getElementById("previewBox"), ImgX_ratio, ImgY_ratio, ImgW_ratio, ImgH_ratio, 0, 0, selWidth, selHeight);
            console.log(ImgX,ImgY,ImgW,ImgH);
        });

        $cancel.click(function(eve) {
            eve.preventDefault();
            Crop.cancel();
        });

        /* iframe的load應該延遲綁定，避免首次插入文檔中加載完畢時觸發load事件 */
        window.setTimeout(function() {
            $ifr.on('load', function() {
                var body = this.contentWindow.document.body;
                var text = body.innerText;
                opt.onComplete(text);
            });
        }, 100);
    };

    /* 檢查文件是否符合上傳條件 */
    function _checkSuf(fileSuf, suffixs) {
        for(var i = 0, j = suffixs.length;i < j; i ++) {
            if(fileSuf.toLowerCase() == suffixs[i].toLowerCase()) {
                return true;
            }
        }
        return false;
    };

    /* 主要裁剪流程 */
    function _crop($cropObj, fileInp) {
        var cropArea = $cropObj.$cropArea.get(0);
        var cropPreview = $cropObj.$cropPreview.get(0);
        var opt = _getOpt();
        var jcropOpt = opt.cropParam;
        cropArea.innerHTML = '';
        if(fileInp.files && fileInp.files[0]) {
            $('#UpImg').attr("src", null);
            var img = document.createElement('img');
            img.style.visibility = 'hidden';
            cropArea.appendChild(img);
            img.setAttribute("id","previewBox");
            img.onload = function(e) {
                realWidth = this.width, realHeight = this.height;
                /* 在圖片加載完成之後便可以獲取原圖的大小，根據原圖大小和預覽區域大小獲取圖片的縮放比例以及原圖在預覽時所展現的大小 */
                var scaleOpt = _getScale(cropArea.clientWidth, cropArea.clientHeight, img.offsetWidth, img.offsetHeight);
                img.setAttribute('style', 'position: absolute;visibility: visible;width: ' + scaleOpt.w + 'px;height: ' + scaleOpt.h + 'px');
                if(!opt.isCrop) {return ;}

                var cropPreviewImg = img.cloneNode(true);
                cropPreview.appendChild(cropPreviewImg);

                _startCrop(img, jcropOpt);
                /* 記錄原始比例，上傳數據需要還原實際裁剪尺寸 */
                Crop.ratio = scaleOpt.scale;
                /* 記錄裁剪圖片及裁剪預覽圖像對象，更新預覽圖時需要使用 */
                Crop.cropPreview = {
                    cropAreaImg: img,
                    cropPreviewImg: cropPreviewImg
                };
            };
            var fr = new FileReader();
            fr.onload = function(eve) {
                img.src = eve.target.result;
            }
            fr.readAsDataURL(fileInp.files[0]);
        } else {
            var img = document.createElement('div');
            img.style.visibility = 'hidden';
            img.style.width = '100%';
            img.style.height = '100%';
            cropArea.appendChild(img);

            fileInp.select();
            var src = document.selection.createRange().text;
            // console.log(document.selection.createRange());

            var img_filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='image',src='" + src + "')";
            img.style.filter = img_filter;

            /* 需等待濾鏡加載完畢之後才能進行下一步操作*/
            window.setTimeout(function() {
                _loadFiter(cropArea, img);
            }, 100);
        }
    };

    /* 加載濾鏡，等待兩秒，超時則判定加載失敗 */
    function _loadFiter(cropArea, img) {
        var time = 0;
        if(img.offsetWidth != cropArea.clientWidth) {
            /* 濾鏡加載成功，進入裁剪流程 */
            _filterCrop(cropArea, img);
        } else {
            time ++;
            if(time < 20) {
                window.setTimeout(function() {
                    _loadFiter(cropArea, img);
                }, 100);
            } else {
                alert('圖片加載失敗，請重試！');
            }
        }
    };

    /* 使用濾鏡的裁剪 */
    function _filterCrop(cropArea, img) {
        var scaleOpt = _getScale(cropArea.clientWidth, cropArea.clientHeight, img.offsetWidth, img.offsetHeight);
        /* 更改濾鏡設置 */
        var s_filter = img.style.filter.replace(/sizingMethod='image'/g, "sizingMethod='scale'");
        var jcropOpt = _getOpt().cropParam;

        img.setAttribute('style', 'position: absolute;visibility: visible;width: ' + scaleOpt.w + 'px;height: ' + scaleOpt.h + 'px;filter: ' + s_filter);

        if(!_getOpt().isCrop) {return ;}

        var cropPreview = cropArea.nextSibling.firstChild;
        var cropPreviewImg = img.cloneNode(true);
        cropPreview.appendChild(cropPreviewImg);

        _startCrop(img, jcropOpt);

        /* 記錄原始比例，上傳數據需要還原實際裁剪尺寸 */
        Crop.ratio = scaleOpt.scale;
        /* 記錄裁剪图片及裁剪預覽圖像對象，更新預覽圖時需要使用 */
        Crop.cropPreview = {
            cropAreaImg: img,
            cropPreviewImg: cropPreviewImg
        };
    };

    /* 開始裁剪，初始化裁剪插件 */
    function _startCrop(img, jcropOpt) {
        var imgW = img.offsetWidth;
        var imgH = img.offsetHeight;
        var minW = jcropOpt.minSize[0], minH = jcropOpt.minSize[1];
        var offsetWidth = (imgW / 2) - (minW / 2);
        var offsetHeight = (imgH / 2) - (minH / 2);
        var obj = {
            x: offsetWidth,
            y: offsetHeight,
            x2: offsetWidth + minW,
            y2: offsetHeight + minH,
            w: minW,
            h: minH
        };
        $(img).Jcrop(jcropOpt, function() {
            jcropApi = this;
            this.animateTo([obj.x, obj.y, obj.x2, obj.y2]);
        });
        boundw = minW, boundh = minH;
    };

    /* 獲取配置參數opt */
    function _getOpt() {
        var id = Crop.crop.id;
        var cropDom = document.getElementById(id);
        var opt = $.data(cropDom, 'crop').opt;
        return opt;
    };

    /*
     * 獲取縮放比例
     *
     * 原始寬高vw,vh
     * 實際顯示寬高sw,sh
     * 返回：
     * {w,h,scale:max(sw/vw,sh/vh)}
     * w,h均為縮放到sw、sh後的寬高
     */
    function _getScale(vw, vh, sw, sh) {
        vw = Number(vw);
        vh = Number(vh);
        sw = Number(sw);
        sh = Number(sh);
        if(vw <= 0 || vh <= 0) {
            console.log('參數不能為0');
            return false;
        }
        var wScale = sw / vw;
        var hScale = sh / vh;
        var scale = 1, w, h;

        if(wScale > hScale) {
            scale = wScale;
            w = vw;
            h = sh / scale;
        } else {
            scale = hScale;
            h = vh;
            w = sw / scale;
        }
        scaleImg = scale;
        return {
            scale: scale,
            w: w,
            h: h
        };
    };

    /* 更新裁剪預覽圖 */
    function _updatePreview(c) {
        var cropAreaImg = Crop.cropPreview.cropAreaImg;
        var cropPreviewImg = Crop.cropPreview.cropPreviewImg;
        var $cropObj = $.data(document.getElementById(Crop.crop.id), 'crop').$cropObj;
        var $cropDataInp = $cropObj.$cropDataInp;
        var $cropPreview = $cropObj.$cropPreview;
        var $previewParent = $cropPreview.parent();
        var vw = $previewParent.width(), vh = $previewParent.height();
        var scaleOpt = _getScale(vw, vh, c.w, c.h);
        $cropPreview.width(scaleOpt.w);
        $cropPreview.height(scaleOpt.h);
        var width = $(cropAreaImg).width() / scaleOpt.scale;
        var height = $(cropAreaImg).height() / scaleOpt.scale;
        var top = -(c.y / scaleOpt.scale);
        var left = -(c.x / scaleOpt.scale);
        cropPreviewImg.style.width = width + 'px';
        cropPreviewImg.style.height = height + 'px';
        cropPreviewImg.style.top = top + 'px';
        cropPreviewImg.style.left = left + 'px';
        _setCropData($cropDataInp, c);
        selWidth = $(cropAreaImg).width(), selHeight = $(cropAreaImg).height();
    };

    /* 設置裁剪數據 */
    function _setCropData($cropDataInp, c) {
        ratio = Crop.ratio;
        var data = {
            x: c.x * ratio,
            y: c.y * ratio,
            w: c.w * ratio,
            h: c.h * ratio
        };
        ImgX = c.x , ImgY = c.y , ImgW = c.w , ImgH = c.h;
        ImgX_ratio = c.x * ratio , ImgY_ratio = c.y * ratio , ImgW_ratio = c.w * ratio , ImgH_ratio = c.h * ratio;
        var dataJson = JSON.stringify(data);
        $cropDataInp.val(dataJson);
    };
    /* 擴展配置參數，尤其是Jcrop裁剪參數中的onSelect,onChange參數 */
    function _extendOpt(opt) {
        opt = $.extend(true, {}, defaultOpt, opt);
        var select = opt.cropParam.onSelect;
        var change = opt.cropParam.onChange;
        if(Object.prototype.toString.call(select) == '[object Function]') {
            opt.cropParam.onSelect = function(c) {
                _updatePreview.call(jcropApi, c);
                select.call(jcropApi, c);
            };
        } else {
            opt.cropParam.onSelect = _updatePreview;
        }
        if(Object.prototype.toString.call(change) == '[object Function]') {
            opt.cropParam.onChange = function(c) {
                _updatePreview.call(jcropApi, c);
                change.call(jcropApi, c);
            }
        } else {
            opt.cropParam.onChange = _updatePreview;
        }
        return opt;
    };

    /* 初始化上傳裁剪區域 */
    function init(opt) {
        var opt = _extendOpt(opt);
        var $uploadCropWrap = $('#' + opt.id);
        var hasDom = true;
        if($uploadCropWrap.length == 0) {
            $uploadCropWrap = $('<div id="' + opt.id + '" />');
            hasDom = false;
        }

        /* 清空Dom原有內部結構 */
        $uploadCropWrap.html('');
        var $cropObj = _createDom($uploadCropWrap, opt);

        $.data($uploadCropWrap.get(0), 'crop', {opt: opt, $cropObj: $cropObj});
        hasDom || $('body').append($uploadCropWrap);

        _bind($cropObj, opt);

        Crop.crop = {id: opt.id, hasDom: hasDom};
    };

    /* 取消裁剪 */
    function cancel() {
        $('#UpImg').attr("src", "lib/ffffff.png");
        ctx.clearRect(0,0, selWidth, selHeight);
        var id = (Crop.crop && Crop.crop.id) || "";
        var dom = document.getElementById(id);
        if(!dom) {
            return ;
        }
        var $cropObj = $.data(dom, 'crop').$cropObj;
        $cropObj.$cropWrap.addClass('crop-hidden');
        $cropObj.$cropPicker.removeClass('crop-hidden');
    };

    /* 銷毀上傳裁剪區域 */
    function destroy() {
        var crop = Crop.crop || {};
        var $cropWrap = $('#' + crop.id);
        if(crop.hasDom === true) {
            $cropWrap.html('');
        } else {
            $cropWrap.remove();
        }
    };

    if($.isEmptyObject(Crop)) {
        global.Crop = Crop = {
            init: init,
            upload: upload,
            cancel: cancel,
            destroy: destroy,
            crop: {}
        };
    } else {
        Crop = $.extend(Crop, {
            init: init,
            upload: upload,
            cancel: cancel,
            destroy: destroy,
            crop: {}
        });
    }
    })(window, jQuery, window.Crop || {})
});
