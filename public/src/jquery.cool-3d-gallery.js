/*
 *
 * Copyright (c) 2015 Jommy Barban (http://www.herrgottland.com)
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Dependencies: THREE.js, jQuery, Tween.js
 *
 * Version 1.0.0
 * Demo: http://www.herrgottland.com/code/jquery/cool-3d-gallery
 *
 */
 
(function($) {
 
 'use strict';

/**
 * Creates a simple gallery into the container element
 *
 * @name     C3DGallery
 * @author   Jommy Barban (http://www.herrgottland.com)
 * @type     jQuery
 * @example
 * @example
 * @example
 *
 */
$.fn.C3DGallery = function( options ){

	options = options || {};

	var 	container 	= this,
			data 		= options.data || {},
			effect 		= options.effect || 'sphere',
			duration 	= options.duration || 2000,
			easing	 	= options.easing || TWEEN.Easing.Exponential.InOut;

	var 	camera, scene, renderer, controls,
			objects = [],
			targets = { table: [], sphere: [], helix: [], grid: [], spiral: [], random: [] };

	// for global access
	window.objects3d = objects;
	window.targets3d = targets;

	function wrapImage( elem ) {
		var element = document.createElement('div');
		element.className = 'element';
		element.style.zIndex = 0;
		element.style.backgroundColor = 'rgba(0,0,0,0)';

		var wrapper = document.createElement('div');
		wrapper.className = 'image';

		wrapper.appendChild(elem);
		element.appendChild(wrapper);

		return element;
	}

	function init() {

		camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.z = 3000;

		scene = new THREE.Scene();

		// create images from parameters
		var loaded = 0;

		for ( var i = 0; i < data.length; i++ ) {

			var image = document.createElement('img');
			image.onload = function(){
				loaded++;

				if (loaded == data.length) {
					transform(  targets[effect], duration );
				}
			}

			image.src = data[i].image;

			var element = wrapImage( image );
			element.id = "image_" + i;

			element.addEventListener('click', function () {
				showImage(this);
			});

			object = new THREE.CSS3DObject(element);
			object.position.x = Math.random() * 4000 - 2000;
			object.position.y = Math.random() * 4000 - 2000;
			object.position.z = Math.random() * 4000 - 2000;

			scene.add(object);
			objects.push(object);
		}

		// table

		var k = 0, object;

		for ( var i = 0; i < objects.length; i++ ) {

			var target = new THREE.Object3D();
			target.position.x = ( ((i % 20) * 140) ) - 1300;
			target.position.y = - ( k * 200 ) + 500;

			targets.table.push( target );

			if (i % 20 == 0 && i !== 0)
				k++;

		}

		// sphere

		var vector = new THREE.Vector3();

		for ( var i = 0, l = objects.length; i < l; i ++ ) {

			var phi = Math.acos( -1 + ( 2 * i ) / l );
			var theta = Math.sqrt( l * Math.PI ) * phi;

			var object = new THREE.Object3D();

			object.position.x = 800 * Math.cos( theta ) * Math.sin( phi );
			object.position.y = 800 * Math.sin( theta ) * Math.sin( phi );
			object.position.z = 800 * Math.cos( phi );

			vector.copy( object.position ).multiplyScalar( 2 );

			object.lookAt( vector );

			targets.sphere.push( object );

		}

		// helix

		var vector = new THREE.Vector3();
		var l_object = new THREE.Object3D();

		for ( var i = 0, l = objects.length; i < l; i ++ ) {

			var phi = i * 0.175 + Math.PI;

			var target = new THREE.Object3D();

			target.position.x = 900 * Math.sin( phi );
			target.position.y = - ( i * 8 ) + 450;
			target.position.z = 900 * Math.cos( phi );

			vector.x = target.position.x * 2;
			vector.y = target.position.y;
			vector.z = target.position.z * 2;

			target.lookAt( /*l_object.position*/ vector );

			targets.helix.push( target );

			// test
			l_object = target;

		}

		// grid

		for ( var i = 0; i < objects.length; i ++ ) {

			var target = new THREE.Object3D();

			target.position.x = ( ( i % 5 ) * 400 ) - 800;
			target.position.y = ( - ( Math.floor( i / 5 ) % 5 ) * 400 ) + 800;
			target.position.z = ( Math.floor( i / 25 ) ) * 1000 - 2000;

			targets.grid.push( target );

		}

		// spiral

		var x = 0;
		var y = 0;

		var b = 0;
		var c = false;
		k = -1;
		var mov = 0;
		var mult = 1.0;

		var inc = [ [140, 0], [0, 200], [-140, 0], [0, -200] ];

		for ( var i = 0; i < objects.length; i ++ ) {

			var target = new THREE.Object3D();

			x += inc[mov][0] * mult;
			y += inc[mov][1] * mult;

			target.position.x = x;
			target.position.y = y;

			targets.spiral.push( target );

			if (k < b) {
				k++;
			}
			else {
				k = 0;
				mov = (mov + 1) % 4;
				if (c) {
					b++;
					c = false;
				} else {
					c = true;
				}
			}

			mult += 0.005;

		}

		// create images from parameters
		var loaded = 0;

		for ( var i = 0; i < objects.length; i++ ) {

			var target = new THREE.CSS3DObject(element);
			target.position.x = Math.random() * 4000 - 2000;
			target.position.y = Math.random() * 4000 - 2000;
			target.position.z = Math.random() * 4000 - 2000;

			targets.random.push( target );
		}

		//

		renderer = new THREE.CSS3DRenderer();

		renderer.setSize( container.width(), container.height());
		renderer.domElement.style.position = 'relative';
		container.append( renderer.domElement );

		//

		controls = new THREE.TrackballControls( camera, renderer.domElement );
		controls.rotateSpeed = 0.5;
		controls.minDistance = 0;
		controls.maxDistance = 16000;
		controls.addEventListener( 'change', render );

		function nextEffect(){
			var arr = [], index = 0;
			for (var eff in targets3d) {
				arr.push(eff);
				if (eff === effect) index = arr.length;

			}
			effect = arr[index % arr.length];
			return targets3d[effect];
		}

		window.addEventListener( 'keydown', function ( evt ) {

			if ( evt.key != 'n' || !evt.altKey ) return;

			transform(  nextEffect(), duration );

		}, false );

		//

		render();

		window.addEventListener( 'resize', onWindowResize, false );

	}

	function transform( targets, duration ) {

		TWEEN.removeAll();

		for ( var i = 0; i < objects.length; i ++ ) {

			var object = objects[ i ];
			var target = targets[ i ];

			new TWEEN.Tween( object.position )
					.to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
					.easing( TWEEN.Easing.Exponential.InOut )
					.start();

			new TWEEN.Tween( object.rotation )
					.to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
					.easing( TWEEN.Easing.Exponential.InOut )
					.start();

		}

		new TWEEN.Tween( this )
				.to( {}, duration * 2 )
				.onUpdate( render )
				.start();

	}

	function showImage( elem ){

		TWEEN.removeAll();

		var object;
		var target = camera;

		var matrix = new THREE.Matrix4();

		matrix.multiplyMatrices( camera.matrixWorld, matrix.getInverse( camera.projectionMatrix ) );

		var target_pos = (new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z-60)).sub(camera.position).applyProjection(matrix);

		console.log( target_pos );
		console.log( camera.position );

		for (var i = 0; i < objects.length; i++) {
			if ( elem.id == objects[i].element.id) {
				object = objects[i];

				break;
			}
		}

		new TWEEN.Tween( object.position )
				.to( { x:target_pos.x, y: target_pos.y, z: target_pos.z }, 500 )
				.easing( TWEEN.Easing.Exponential.InOut )
				.start();

		new TWEEN.Tween( object.rotation )
				.to( { x: target.rotation.x + 6.28, y: target.rotation.y + 6.28, z: target.rotation.z + 6.28 }, 300 )
				.easing( TWEEN.Easing.Circular.Out )
				.start();

		new TWEEN.Tween( this )
				.to( {}, 300 )
				.onUpdate( function(){
					$(object.element).css("z-index", 20000);
					render();
				} )
				.start();

	}

	function onWindowResize() {

		camera.aspect = container.width() / container.height();
		camera.updateProjectionMatrix();

		renderer.setSize( container.width(), container.height() );

		render();

	}

	function updateZIndexes(){

		for (var i = 0; i < objects.length; i++){
			var distance = camera.position.distanceTo( objects[i].position );
			$(objects[i].element).css("z-index", Math.floor( 20000 - distance ));
		}

	}

	function animate() {

		requestAnimationFrame( animate );

		TWEEN.update();

		updateZIndexes();

		controls.update();

		render();

	}

	function render() {

		renderer.render( scene, camera );

	}


	this.each(
		function()
		{
			if(this.nodeName.toLowerCase() != "img") return;

			// TODO: add image to gallery
		}
	);

	init();
	animate();

	return this;
};



})(jQuery);