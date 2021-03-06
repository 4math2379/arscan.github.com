
/**
 * @author alteredq / http://alteredqualia.com/
 * @author rscanlon / updated to accept some args to make code less cumbersome / http://www.robscanlon.com/
 */

THREE.ShaderPass = function ( shader, uniformArgs, needsSwap ) {

    this.textureID = "tDiffuse";

    this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

    if(uniformArgs !== undefined){
        for(var x in uniformArgs){
            this.uniforms[x].value = uniformArgs[x];
        }
    }

    this.material = new THREE.ShaderMaterial( {

        uniforms: this.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader

    } );

    this.renderToScreen = false;

    this.enabled = true;
    this.needsSwap = true;

    if(needsSwap !== undefined){
        this.needsSwap = needsSwap;
        console.log(needsSwap);
    }
    this.clear = false;


    this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    this.scene  = new THREE.Scene();

    this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
    this.scene.add( this.quad );

};

THREE.ShaderPass.prototype = {

    render: function ( renderer, writeBuffer, readBuffer, delta ) {

        if ( this.uniforms[ this.textureID ] ) {

            this.uniforms[ this.textureID ].value = readBuffer;

        }

        this.quad.material = this.material;

        if ( this.renderToScreen ) {

            renderer.render( this.scene, this.camera );

        } else {

            renderer.render( this.scene, this.camera, writeBuffer, this.clear );

        }

    }

};
