window.onload = onWindowLoad;

/**
 * onWindowLoad
 * @namespace
 */

function onWindowLoad(){ 

	/**
	 * Object with two Image objects
	 */

	var images = {};

	/**
	 * Preview zoom factor
	 */

	var scaleFactor = 1;

	/**
	 * Offset for right (cyan) image 
	 */

	var offsetRight = {};
		offsetRight.x = 0;
		offsetRight.y = 0;

	/**
	 * Event handler for Preview zoom factor change.
	 * @param {object} e Change event.
	 */
	function onZoomChange(e){
		if (!images['left'] || !images['right']){
			return;
		}
		scaleFactor = $(e.target).find('input').val();

		document.getElementById('anaglyph').setAttribute('style','transform: scale(' + scaleFactor + ');');
		document.getElementById('wrapper').setAttribute('style','width: ' +  images['left'].naturalWidth * scaleFactor + 'px; height: ' + images['left'].naturalHeight * scaleFactor + 'px');
	}

	/**
	 * Event handler for Offset X(Y) increment(decrement) buttons click
	 * @param {object} e Mouse click event.
	 */
	function onBtnChangeOffsetClick(e){
		var dir = e.currentTarget.getAttribute('data-dir');
		var val = e.currentTarget.getAttribute('data-val');
		offsetRight[dir] += val*1;
		onBtnCreateAnaglyph();
	}

	/**
	 * Event handler for Create Anaglyph button click
	 * @param {object} e Mouse click event.
	 */
	function onBtnCreateAnaglyph(){
		if (!images['left'] || !images['right']){
			console.log('Error: Left or right image is not loaded.');
			return;
		}
		
		var canvas = document.getElementById('anaglyph')
		canvas.width = images['left'].naturalWidth;
		canvas.height = images['left'].naturalHeight;
		var ctx = canvas.getContext("2d");

		var imageLeft = getImageData(ctx, images['left'], 0, 0);
		var imageRight = getImageData(ctx, images['right'], offsetRight.x, offsetRight.y);
		
		// create anaglyph: red channel from left, blue and green fron right
		var size = imageRight.width * imageRight.height * 4;
		var t0 = Date.now();		
		for (var i = 0; i < size; i += 4){
			imageLeft.data [i] = imageLeft.data[i];
			imageLeft.data [i+1] = imageRight.data[i+1];
			imageLeft.data [i+2] = imageRight.data[i+2];
			imageLeft.data [i+3] = 255;
		}
		ctx.putImageData(imageLeft, 0, 0);
		console.log('Processing, ms: ' + (Date.now() - t0));
		
	}

	/**
	 * Event handler for file read complete
	 * @param {object} e
	 */
	function onImageFileRead(e){
		var img = new Image();
		img.addEventListener('load', onImageLoad);
		img.setAttribute('data-eye', e.target.eye);
		img.src = e.target.result;
	}

	/**
	 * Event handler for Image load
	 * @param {object} e
	 */
	function onImageLoad(e){
		var eye = e.target.getAttribute('data-eye'); 
		images[eye] = e.target;
		console.log('Loaded image for ' + eye + ' eye. Size: ' + e.target.naturalWidth + 'x' + e.target.naturalHeight);
		if (images['left'] && images['right']){
			$('#btnCreateAnaglyph, .btnChangeOffset, .zoomSelector').removeAttr('disabled');
		}

	}


	/**
	 * Event handler for Select left(right) file input change
	 * @param {object} e
	 */
	function onFileInputChange(e) {
		console.log(e);
		var eye = e.target.getAttribute('data-eye'); 
		var file = e.target.files[0];
		if (!file.type.match('image.*')) {
			console.log('Error: Selected file is not an image.');
			return;
		}	
		// read file from local filesystem
		var reader = new FileReader();
		reader.eye = eye;
		reader.addEventListener('load', onImageFileRead);
		reader.readAsDataURL(file);
	}


	/**
	 * Event handler for Select left(right) button click. 
	 * @param {object} e Mouse click event.
	 */
	function onBtnLoadFileClick(e){
		// trigger click on file input
		document.getElementById(e.target.getAttribute('data-eye')  + 'File').click();
	}

	/**
	 * Helper. Get image data from canvas
	 */
	function getImageData(ctx, img, offsetX, offsetY){
		ctx.drawImage(img, 0, 0, img.width, img.height);
		return ctx.getImageData(offsetX, offsetY, img.width, img.height);
	};


	// event handlers
	[].forEach.call(document.getElementsByClassName('btnLoadFile'), function(el) {el.addEventListener('click', onBtnLoadFileClick);});
	[].forEach.call(document.getElementsByClassName('fileInput'), function(el) {el.addEventListener('change', onFileInputChange);});
	[].forEach.call(document.getElementsByClassName('btnChangeOffset'), function(el) {el.addEventListener('click', onBtnChangeOffsetClick);});
	document.getElementById('btnCreateAnaglyph').addEventListener('click', onBtnCreateAnaglyph);
	$('.zoomSelector').on('click', onZoomChange);


}

