var renderer, scene, sceneF;
var camera = new Array(3);
var camera_on = 0;
var cameraF;

// Variáveis das entidades
var table;
var material, geometry, mesh;
var carro;
var laranjas = new Array(3);
var vidas = new Array(5);

var sol;
var velas = new Array(6);
var farois = new Array(2);
var faroison = false;

var wires = false;
var matOn = false;
var mat = 1;
var entidades = new THREE.Group();

// Variáveis da câmara
var scale_width, scale_height, last_width, last_height;
var ratio = 1.6;
var scale;

// Variáveis de Interação e de Tempo
var keyPressed = [];
var clock = new THREE.Clock();
var delta, Tpausa;
var CameFromPausa = false;
var frenteCarro;

// Variáveis de Texturas
var pause, gameover;
var pauseimg = 'js/pause.png';
var gameoverimg = 'js/gameover.png';

/********************************
            CAMERAS
********************************/

function createOrtoCamera() {
  'use strict';

  scale_width = window.innerWidth * 0.011;
  scale_height = window.innerHeight * ratio * 0.011;

  if (window.innerWidth / window.innerHeight > ratio)
       camera[0] = new THREE.OrthographicCamera(window.innerWidth / - scale_height, window.innerWidth / scale_height, window.innerHeight / scale_height, window.innerHeight / - scale_height, 1, 100);
   else
       camera[0] = new THREE.OrthographicCamera(window.innerWidth / - scale_width, window.innerWidth / scale_width, window.innerHeight / scale_width, window.innerHeight / - scale_width, 1, 100);

    camera[0].position.z = 15;
  	camera[0].lookAt(scene.position);

    last_width = window.innerWidth;
    last_height = window.innerHeight;
}

function createFixedOrtoCamera() {
	scale = window.innerWidth * 0.0085;
	cameraF = new THREE.OrthographicCamera(window.innerWidth / - scale, window.innerWidth / scale, window.innerHeight / scale, window.innerHeight / - scale, 1, 100);
	cameraF.position.set(0, 0, 20);
}

function createFixedPerspCamera(){
	'use strict';

	camera[1] = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000 );
	scene.add(camera[1]);

	camera[1].position.z = 80;
    camera[1].position.x = 0;
    camera[1].position.y = 0;
    camera[1].lookAt(scene.position);

}

function createMobilePerspCamera(){
	camera[2] = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000 );
	carro.add(camera[2]);
	camera[2].up.set(0, 0, 1);
    camera[2].position.set(-20, 0, 20);
}

function onResize(){
  'use strict';
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (camera_on == 0){
    scale_width = (window.innerWidth * scale_width) / last_width;
    scale_height = (window.innerHeight * scale_height) / last_height;

    last_width = window.innerWidth;
    last_height = window.innerHeight;

    if (window.innerWidth / window.innerHeight > ratio)
      resizeAuxORT(scale_height);
    else
      resizeAuxORT(scale_width);
  }
  else{
    resizeAuxPER();
  }
}

function resizeAuxORT(scale){
  camera[0].left = -window.innerWidth / scale;
  camera[0].right = window.innerWidth / scale;
  camera[0].top = window.innerHeight / scale;
  camera[0].bottom = -window.innerHeight / scale;
  camera[0].updateProjectionMatrix();
}

function resizeAuxPER(){
  if((window.innerWidth / window.innerHeight) < ratio)

  camera[camera_on].aspect = window.innerWidth / window.innerHeight;
  camera[camera_on].updateProjectionMatrix();
  camera[camera_on].lookAt(scene.position);
}

/********************************
              LUZES
********************************/

function createSun(){
  sol = new THREE.DirectionalLight( 0xffffff, 1);
  sol.position.set(0, 5, 10);
  sol.target.position.set(0,0,0);
  sol.target.updateMatrixWorld();
  scene.add(sol);
}

function createVelas(){
  velas[0] = new THREE.PointLight(0xffffff, 1, 100);
  velas[0].position.set(0,30,5);
  velas[1] = new THREE.PointLight(0xffffff, 1, 100);
  velas[1].position.set(-42, 30,5);
  velas[2] = new THREE.PointLight(0xffffff, 1, 100);
  velas[2].position.set(42,30,5);
  velas[3] = new THREE.PointLight(0xffffff, 1, 100);
  velas[3].position.set(60,-25,5);
  velas[4] = new THREE.PointLight(0xffffff, 1, 100);
  velas[4].position.set(-60,-25,5);
  velas[5] = new THREE.PointLight(0xffffff, 1, 100);
  velas[5].position.set(0,-30,5);
  for (i = 0; i < 6; i++) {
    scene.add(velas[i]);
    velas[i].visible = false;
  }
}

function createFarois(carro, x, y, z) {


  carro.farois[0] = new THREE.SpotLight(0xffffff, 2, 100, Math.PI/3, 1, 2);

  carro.farois[1] = new THREE.SpotLight(0xffffff, 2, 100, Math.PI/3, 1, 2);
  carro.farois[0].castShadow = true;

  // Place Spotlight at Car
  carro.add(carro.farois[0]);
  carro.farois[0].position.set(3,2,4);
  carro.add(carro.farois[1]);
  carro.farois[1].position.set(3,-2,4);

  // Update Target of SpotLight
  frenteCarro = new THREE.Object3D();
  frenteCarro.position.set(carro.position.x + 50, carro.position.y, 4);
  carro.farois[0].target = frenteCarro;
  carro.farois[1].target = frenteCarro;
  carro.farois[0].target.updateMatrixWorld();
  carro.add(frenteCarro);
  //lightHelper1 = new THREE.SpotLightHelper(carro.farois[0]);
  //scene.add(lightHelper1);

  //lightHelper2 = new THREE.SpotLightHelper(carro.farois[1]);
  //scene.add(lightHelper2);
}

/********************************
          INICIALIZACAO
********************************/

function init() {
    'use strict';

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.autoClear = false;

    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

    createScene();
    createFixedScene();
    createOrtoCamera();
    createFixedOrtoCamera();
    createFixedPerspCamera();
    createMobilePerspCamera();
    createSun();
    createVelas();
    render();

    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
}


function createScene(){
    'use strict';

    scene = new THREE.Scene();

    scene.add(new THREE.AxisHelper(10));

    carro = new Carro(0,35,0);
    entidades.add(carro);

    createPista();

    table = new Mesa(160, 100);

    scene.add(entidades);
}

function createPista(){
  new Manteiga(50, -0, 5, 10);
  new Manteiga(-50, -40, 10, 5);
  new Manteiga(-40, 35, 10, 5);
  new Manteiga(20, -30, 5, 10);
  new Manteiga(45, 35, 10, 5);

  for(var i = 0; i < 84; i = i + 4){
    new Cherio(-40 + i, 45);
    new Cherio(-40 + i, -45);
  }

  for(var i = 0; i < 60; i += 4) {
    new Cherio(-30 + i, 25);
    new Cherio(-30 + i, -25);
  }

  for(var i = 0; i < 22; i = i + 4){
    new Cherio(-45, -10 + i);
    new Cherio(45, -10 + i);

  }

  for(var i = 0; i < 22; i = i + 4){
    new Cherio(-70, -10 + i);
    new Cherio(70, -10 + i);
  }

  for(var i = 0, j = 0; i < Math.PI / 1.9; i += Math.PI / 20, j++){
    if (j % 2 == 0) {
        new Cherio(30+15*Math.cos(i), 10+15*Math.sin(i));
    }
    new Cherio(40+30*Math.cos(i), 15+30*Math.sin(i));
  }

  for(var i = 0, j = 0; i < Math.PI / 1.9; i += Math.PI / 20, j++){
    if (j % 2 == 0) {
        new Cherio(30+15*Math.sin(i), -10-15*Math.cos(i));
    }
    new Cherio(40+30*Math.sin(i), -15-30*Math.cos(i));
  }

  for(var i = 0, j = 0; i < Math.PI / 1.9; i += Math.PI / 20, j++){
    if (j % 2 == 0) {
        new Cherio(-30-15*Math.cos(i), 10+15*Math.sin(i));
    }
    new Cherio(-40-30*Math.cos(i), 15+30*Math.sin(i));
  }

  for(var i = 0, j = 0; i < Math.PI / 1.9; i += Math.PI / 20, j++){
    if (j % 2 == 0) {
        new Cherio(-30-15*Math.cos(i), -10-15*Math.sin(i));
    }
    new Cherio(-40-30*Math.cos(i), -15-30*Math.sin(i));
  }

  entidades.add(new Laranja());
  entidades.add(new Laranja());
  entidades.add(new Laranja());
}

function createFixedScene() {
	sceneF = new THREE.Scene();
	createMensagem(pauseimg, true);
	createMensagem(gameoverimg, false);
	createVidas();
}

function createMensagem(img, flag) {
  geometry = new THREE.PlaneGeometry(100, 50, 0);
  var texture = new THREE.TextureLoader().load(img);
  var material = new THREE.MeshBasicMaterial({map: texture, transparent: true});
  if (flag) {
  	pause = new THREE.Mesh(geometry, material);
  	pause.visible = false;
    pause.material.depthTest = false;
    pause.material.depthWrite = false;
  	sceneF.add(pause);	
  }
  else {
  	gameover = new THREE.Mesh(geometry, material);
  	gameover.visible = false;
    gameover.material.depthTest = false;
    gameover.material.depthWrite = false;
 		sceneF.add(gameover);
  }
}

function createVidas() {
	var x = -110;
	for(var i = 0; i < 5; i++) {
		vidas[i] = new Carro(x + i*15, 50, 0);
	  vidas[i].children[0].material.depthTest = false;
    vidas[i].children[0].material.depthWrite = false;
		sceneF.add(vidas[i]);
	}
}

/********************************
              CICLO
********************************/

function render() {
    'use strict';
    renderer.clear();
    renderer.render(scene, camera[camera_on]);
    renderer.render(sceneF, cameraF);
}

function animate(){
    'use strict';
    if(!gamePaused() && !gameOver()) {
      checkMovement();
      render();
    }

    requestAnimationFrame(animate);
}

function checkMovement() {
    delta = clock.getDelta();
    len = entidades.children.length;
    for (var i = 0; i < len; i++) {
      if (entidades.children[i].checkType() == "Carro")
        entidades.children[i].pressingKeys(delta);
      else if (entidades.children[i].checkType() == "Laranja") {
        if(entidades.children[i].tempo_saida == -1)
          entidades.children[i].moveLaranjas(delta);
        else if (entidades.children[i].tempo_saida != -1) {
          if(CameFromPausa) {
              entidades.children[i].tempo_saida += Tpausa;
          }
          if (entidades.children[i].tempo_saida < performance.now() - 3000){
            entidades.children[i].tempo_saida = -1;
            entidades.children[i].visible = true;
          }
        }
      }
    }
    CameFromPausa = false;
    seeCollisions(len);
}

function seeCollisions(len) {
  for (var i = 0; i < len; i++) {
    for (var j = i; j < len; j++) {
      entidades.children[i].checkCollision(entidades.children[j]);
    }
  }
}

/********************************
            CALLBACK
********************************/

function onKeyUp(e) {
  keyPressed[e.keyCode] = false;
}

function onKeyDown(e){
  'use strict';

  switch(e.keyCode) {
  	// A
  	case 65:
  	case 97:
      wires = !wires;
      for (var i = 0, l = entidades.children.length; i < l; i++) {
          entidades.children[i].toggleWireframe(wires);
      }
    	break;
    // 1
    case 49:
      camera_on = 0;
      onResize();
      break;
    // 2
    case 50:
      camera_on = 1;
      onResize();
      break;
    // 3
    case 51:
      camera_on = 2;
      onResize();
      break;
    // L
    case 76:
    case 108:
      if (matOn) {
        for (var i = 0, l = entidades.children.length; i < l; i++) {
          entidades.children[i].toggleMaterial(0);
        }
      }
      else{
        for (var i = 0, l = entidades.children.length; i < l; i++) {
          entidades.children[i].toggleMaterial(mat);
        }
      }
      matOn = !matOn;
      break;
    // N
    case 78:
    case 110:
      if (matOn){
        sol.visible = !sol.visible;
      }
      break;
    // G
    case 71:
    case 103:
      if (matOn){
        if (mat == 1) mat = 2;
        else mat = 1;
        for (var i = 0, l = entidades.children.length; i < l; i++) {
          entidades.children[i].toggleMaterial(mat);
        }
        matOn = true;
      }
      break;
    // C
    case 67:
    case 99:
      if (matOn){
        for (i = 0; i < 6; i++) velas[i].visible = !velas[i].visible;
      }
      break;
    case 72:
    case 104:
      faroison = !faroison;
      carro.farois[0].visible = faroison;
      carro.farois[1].visible = faroison;
      break;
    // R
    case 82:
    case 114:
    	restartGame();
    	break;
    // S
    case 83:
    case 115:
    	managePausa();
      break;
  }

  keyPressed[e.keyCode] = true;
}

/********************************
        PAUSA E GAMEOVER
********************************/

function restartGame() {
	if(gameOver()) {
		var len = entidades.children.length;
		for(var i = 0; i < len; i++)
			entidades.children[i].newAtributes();
		resetLifes();
		toggleGameOver();
	}
}

function resetLifes() {
	var len = vidas.length;
	for(var i = 0; i < len; i++)
		vidas[i].visible = true;
}

function managePausa() {
	if(!gameOver()) {
	  if (!gamePaused())
	  	Tpausa = performance.now();
	  else {
	    Tpausa = performance.now() - Tpausa;
	    CameFromPausa = true;
	  }
	  togglePause();
	  delta = clock.getDelta();
	  render();
	}
}

function toggleGameOver() {
	gameover.visible = !gameover.visible;
}

function togglePause() {
	pause.visible = !pause.visible;
}

function gamePaused() {
	return pause.visible;
}

function gameOver() {
	return gameover.visible;
}

/********************************
          SUPERCLASSE
********************************/

class Entity extends THREE.Object3D{
  constructor(){
    super();

    this.vel = 0;
    this.acc = 0;
    this.bacc = 0;
    this.atrito = 1;
    this.theway = new THREE.Vector3();
    this.initpos = new Array(3);
    this.materials = [new THREE.MeshBasicMaterial({ vertexColors: THREE.FaceColors, wireframe: false}),
                      new THREE.MeshLambertMaterial({ vertexColors: THREE.FaceColors, wireframe: false}),
                      new THREE.MeshPhongMaterial({ vertexColors: THREE.FaceColors, wireframe: false})];
    }

  checkType() {
    return "Entity";
  }

  setShininess(num) {
    this.materials[2].shininess = num;
  }

  setInitPos(x, y, z) {
  	this.initpos[0] = x;
  	this.initpos[1] = y;
  	this.initpos[2] = z;
  }

	newAtributes() {
		this.position.set(this.initpos[0], this.initpos[1], this.initpos[2]);
	 	this.rotation.set(0, 0, 0);
	 	this.vel = 0;
  }

  /*setTexture(img, x, y) {
    var texture = new THREE.TextureLoader().load(img);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(x, y);
    for(var i = 0; i < 3; i++)
      this.materials[i].map = texture;
  }*/

  toggleWireframe(wire) {
    this.children[0].material.wireframe = wire;
  }

  toggleMaterial(mat){
    this.children[0].material = this.materials[mat];
    this.children[0].material.wireframe = wires;
  }

  moveObject(v) {
    this.position.x += this.vel * this.theway.x;
    this.position.y += this.vel * this.theway.y;
  }

  checkCollision(obj) {
    var pos1 = this.position;
    var pos2 = obj.position;
    if((this.checkType() == "Laranja" || this.checkType() == "Carro") && obj.checkType() == "Mesa") {
      if(!((pos1.x + this.raio < pos2.x + obj.width) && (pos1.x - this.raio > pos2.x - obj.width))) {
        this.treatCollision(obj);
        return;
      }
      if(!((pos1.y + this.raio < pos2.y + obj.height) && (pos1.y - this.raio > pos2.y - obj.height))) {
        this.treatCollision(obj);
        return;
      }
    }
    else if(obj.checkType() == "Manteiga") {
      if((pos1.x + this.raio < pos2.x - obj.width) || (pos1.x - this.raio) > pos2.x + obj.width)
        return;
      if((pos1.y + this.raio < pos2.y - obj.height) || (pos1.y - this.raio) > pos2.y + obj.height)
        return;
      this.treatCollision(obj);
    }
    else {
      var raios = Math.pow(this.raio + obj.raio, 2);
      if (raios >= Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2)) {
          this.treatCollision(obj);
      }
    }
  }

  treatCollision(obj) {}
}

/********************************
              MESA
********************************/

class Mesa extends Entity{
  constructor(x, y){
    super();

    this.width = x / 2;
    this.height =  y / 2;
    this.seg = 20;
    this.setShininess(5);
    this.setInitPos(0, 0, 0);

    var texture = new THREE.TextureLoader().load( 'js/background.png' );
    this.materials = [new THREE.MeshBasicMaterial({ vertexColors: THREE.FaceColors,   map: texture, wireframe: false}),
                      new THREE.MeshLambertMaterial({ vertexColors: THREE.FaceColors,   map: texture, wireframe: false}),
                      new THREE.MeshPhongMaterial({ vertexColors: THREE.FaceColors,   map: texture, wireframe: false})];




    geometry = new THREE.Geometry();
    createTableVertices(geometry, -this.width, this.width, -this.height, this.height, -2, 2, this.seg);
    createTableFaces(geometry, (x/this.seg) + 1, (y/this.seg) + 1, 2);

    //geometry = new THREE.PlaneGeometry(160, 100, 8, 5);
    geometry.computeBoundingBox();

    var max = geometry.boundingBox.max,
    min = geometry.boundingBox.min;
    var offset = new THREE.Vector2(0 - min.x, 0 - min.y);
    var range = new THREE.Vector2(max.x - min.x, max.y - min.y);
    var faces = geometry.faces;

    geometry.faceVertexUvs[0] = [];

    for (var i = 0; i < faces.length ; i++) {

      var v1 = geometry.vertices[faces[i].a],
        v2 = geometry.vertices[faces[i].b],
        v3 = geometry.vertices[faces[i].c];

        geometry.faceVertexUvs[0].push([
        new THREE.Vector2((v1.x + offset.x)/range.x ,(v1.y + offset.y)/range.y),
        new THREE.Vector2((v2.x + offset.x)/range.x ,(v2.y + offset.y)/range.y),
        new THREE.Vector2((v3.x + offset.x)/range.x ,(v3.y + offset.y)/range.y)
      ]);
    }
    geometry.uvsNeedUpdate = true;

    mesh = new THREE.Mesh(geometry, this.materials[0]);

    this.add(mesh);
    entidades.add(this);
    this.position.set(0, 0, 0);

    this.raio = Math.sqrt(35600)/2;
  }

  checkType() {
    return "Mesa";
  }
}

/********************************
              CARRO
********************************/

class Carro extends Entity {
  constructor(x, y, z) {
    super();
    this.width = 3;
    this.height = 2;
    this.setShininess(80);
    this.setInitPos(x, y, z);

    this.farois = new Array(2);
    createCarro(this, x, y, z);

    this.vel = 0;
    this.acc = 1.5;
    this.bacc = 2;
    this.atrito = 1;
    this.theway = new THREE.Vector3();
    this.oldpos = new THREE.Vector3();
    this.raio = Math.sqrt(52)/2;
  }

  checkType() {
    return "Carro";
  }

  pressingKeys(delta) {
      var angle = this.rotation.z % (2 * Math.PI);
      this.oldpos.copy(this.position);
      this.theway.set(Math.cos(angle), Math.sin(angle), 0);

      if(keyPressed[37]) {
        this.rotation.z += Math.PI / 60;
      }
      if(keyPressed[38] && !keyPressed[40]) {
        this.vel += this.acc*delta;
        this.vel = Math.min(this.vel, 1);
        this.moveObject(this.vel);
      }
      if(!keyPressed[38] && !keyPressed[40] && this.vel > 0) {
        this.vel -= this.atrito*delta;
        this.vel = Math.max(this.vel, 0);
        this.moveObject(this.vel);
      }
      // Andar para tras
      if(!keyPressed[38] && !keyPressed[40] && this.vel < 0) {
        this.vel += this.atrito*delta;
        this.vel = Math.min(this.vel, 0);
        this.moveObject(this.vel);
      }
      if(keyPressed[39]) {
        this.rotation.z -= Math.PI / 60;
      }
      // Seta baixo
      if(keyPressed[40] && !keyPressed[38]){
        this.vel -= this.bacc*delta;
        this.vel = Math.max(this.vel, -0.7);
        this.moveObject(this.vel);
      }

      if (keyPressed[40] && keyPressed[38]){
        if (this.vel > 0){
          this.vel -= this.atrito*delta;
          this.vel = Math.max(this.vel, 0);
          this.moveObject(this.vel);
        }
        else{
          this.vel += this.atrito*delta;
          this.vel = Math.min(this.vel, 0);
          this.moveObject(this.vel);
        }
    }
  }

  treatCollision(obj) {
    if (obj.checkType() == "Laranja") {
      if(this.position.x == this.initpos[0] && this.position.y == this.initpos[1] && this.position.z == this.initpos[2])
        return;
      if(!obj.visible)
        return;
      getRekt();
    }

    else if(obj.checkType() == "Mesa") {
    	getRekt();
    }

    else if(obj.checkType() == "Manteiga") {
      this.position.copy(this.oldpos);
      this.vel = 0;
    }

    else if(obj.checkType() == "Cherio") {
      obj.vel = Math.abs(this.vel);
      var pos1 = this.position;
      var pos2 = obj.position;
      obj.theway.set((pos2.x - pos1.x) / this.raio, (pos2.y - pos1.y) / this.raio, 0);
      obj.moveObject(obj.vel);
    }
  }
}

function getRekt() {
	entidades.children[0].newAtributes();
 	retiraVida();
}

function retiraVida() {
	for(var i = vidas.length - 1; i >= 0; i--)
		if(vidas[i].visible) {
			vidas[i].visible = false;
			if (i == 0)
				toggleGameOver();
			return;
		}
}

function createCarro(carro, x, y, z) {

  var meshes = [];
  createBox(meshes, carro, 0x00ff00, 0x00ff00, -3, 3, -2, 2, 2.8, 4.8, false);
  createBox(meshes, carro, 0x87CEFA, 0x00ff00, -2.5, 1.5, -1.8, 1.8, 4.8, 5.8, true);
  createCarWheel(meshes, carro, 0x000000, 1.5, 2.2, 2.8);
  createCarWheel(meshes, carro, 0x000000, -1.5, 2.2, 2.8);
  createCarWheel(meshes, carro, 0x000000, 1.5, -2.2, 2.8);
  createCarWheel(meshes, carro, 0x000000, -1.5, -2.2, 2.8);

  geometry = mergeMeshes(meshes);
  mesh = new THREE.Mesh(geometry, carro.materials[0]);
  carro.add(mesh);

  createFarois(carro, x, y, z);
  carro.farois[0].visible = faroison;
  carro.farois[1].visible = faroison;
  carro.position.set(x, y, z);
}

/********************************
            CHEERIO
********************************/

class Cherio extends Entity{
  constructor(x, y){
      super();

      this.setShininess(10);
      this.setInitPos(x, y, 2.5);

      geometry = new THREE.TorusGeometry(1, 0.5, 5, 10);
      setMaterialColor(this, 0xe7af5a);
      mesh = new THREE.Mesh(geometry, this.materials[0]);

      this.add(mesh);
      entidades.add(this);
      this.position.set(x, y, 2.5);


      this.raio = 1;
      this.vel = 0;
      this.theway = new THREE.Vector3();
  }

  checkType() {
    return "Cherio";
  }

  treatCollision(obj) {
    if(obj.checkType() == "Cherio") {
      var posc = carro.position;
      var dist = Math.pow(this.position.x - posc.x, 2) + Math.pow(this.position.y - posc.y, 2);
      var diso = Math.pow(obj.position.x - posc.x, 2) + Math.pow(obj.position.y - posc.y, 2);
      if(dist > diso) {
        this.vel = Math.abs(obj.vel);
        var pos1 = obj.position;
        var pos2 = this.position;
        this.theway.set((pos2.x - pos1.x) / obj.raio, (pos2.y - pos1.y) / obj.raio, 0);
        this.moveObject(this.vel);
      }
      else {
        obj.vel = Math.abs(this.vel);
        var pos1 = this.position;
        var pos2 = obj.position;
        obj.theway.set((pos2.x - pos1.x) / this.raio, (pos2.y - pos1.y) / this.raio, 0);
        obj.moveObject(obj.vel);
      }
    }
    else if(obj.checkType() == "Carro") {
      this.vel = Math.abs(obj.vel);
      var pos1 = obj.position;
      var pos2 = this.position;
      this.theway.set((pos2.x - pos1.x) / obj.raio, (pos2.y - pos1.y) / obj.raio, 0);
      this.moveObject(this.vel);
    }
  }
}

/********************************
            LARANJA
********************************/

class Laranja extends Entity{
  constructor(){
      super();
      this.tempo_saida = -1;

      this.setShininess(40);
      this.setInitPos(0, 0, 0);

      var meshes = [];

      geometry = new THREE.SphereGeometry(4, 11, 11);
      setMaterialColor(this, 0xff8000);
      mesh = new THREE.Mesh(geometry, this.materials[0]);
      meshes.push(mesh);

      createBox(meshes, this, 0x654321, 0x654321, -0.5, 0.5, -0.5, 0.5, 3.8, 4.8, false);
      createLeaf(meshes, this, 0x00ff00, 1.2, 0, 4.3);

      geometry = mergeMeshes(meshes);
      mesh = new THREE.Mesh(geometry, this.materials[0]);

      this.add(mesh);

      this.newAtributes();

      this.acc = 0.2;
      this.raio = 4;
  }

  rotate(radians){
    this.theway.normalize();
    var rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(new THREE.Vector3(-this.theway.y, this.theway.x,0), radians*this.vel);
    this.matrix.multiply(rotObjectMatrix);
    this.rotation.setFromRotationMatrix(this.matrix);
    this.updateMatrix();
  }

  checkType() {
    return "Laranja";
  }

  moveLaranjas(delta){
    this.vel += this.acc*delta;
    this.moveObject(this.vel);
    this.rotate(Math.PI/40);
  }

  newAtributes() {
    this.rotation.set(0, 0, 0);
    this.position.set(Math.floor((Math.random() * 140) - 70), Math.floor((Math.random() * 90) - 45), 6);
    this.vel = Math.random() * 0.3;
    var angle = Math.random() * (2 * Math.PI) + 0.1;
    this.theway.set(Math.cos(angle), Math.sin(angle), 0);
  }

  treatCollision(obj) {
    if(obj.checkType() == "Mesa") {
      this.tempo_saida = performance.now();
      this.newAtributes();
      this.visible = false;
    }
  }
}

/********************************
            MANTEIGA
********************************/

class Manteiga extends Entity{
  constructor(x, y, xB, yB){
      super();

      this.setShininess(100);
      this.setInitPos(x, -y, 4.7);

      geometry = new THREE.CubeGeometry(xB, yB, 5);
      setMaterialColor(this, 0xffff99);
      mesh = new THREE.Mesh(geometry, this.materials[0]);

      this.width = xB / 2;
      this.height = yB / 2;

      this.add(mesh);

      entidades.add(this);

      this.position.set(x, -y, 4.7);
      this.raio = Math.sqrt(Math.pow(xB, 2) + Math.pow(yB, 2))/2;

  }

  checkType() {
    return "Manteiga";
  }
}

/********************************
            GEOMETRIA
********************************/
function createBox(full, obj, hex1, hex2, xmin, xmax, ymin, ymax, zmin, zmax, flag) {
  geometry = new THREE.Geometry();
  createBoxVertices(geometry, xmin, xmax, ymin, ymax, zmin, zmax, flag);
  createBoxFaces(geometry, hex1, hex2);
  mesh = new THREE.Mesh(geometry, obj.materials[0]);
  full.push(mesh);
}

function createCarWheel(full, carro, hex, x, y, z) {
  geometry = new THREE.Geometry();
  createWheelVertices(geometry, x, y, z, 0.7, 0.7, 0.3);
  createWheelFaces(geometry, hex);
  mesh = new THREE.Mesh(geometry, carro.materials[0]);
  full.push(mesh);
}

function createLeaf(full, carro, hex, x, y, z) {
  geometry = new THREE.Geometry();
  createWheelVertices(geometry, x, y, z, 0.7, 0.3, 0.05);
  createWheelFaces(geometry, hex);
  mesh = new THREE.Mesh(geometry, carro.materials[0]);
  full.push(mesh);
}

function mergeMeshes (meshes) {
  var merged = new THREE.Geometry();

  for (var i = 0; i < meshes.length; i++) {
    meshes[i].updateMatrix();
    merged.merge(meshes[i].geometry, meshes[i].matrix);
  }
  return merged;
}

/********************************
        VERTICES E FACES
********************************/

function createBoxVertices(geometry, xmin, xmax, ymin, ymax, zmin, zmax, flag) {
  geometry.vertices.push(new THREE.Vector3(xmin, ymin, zmin),
                         new THREE.Vector3(xmin, ymax, zmin),
                         new THREE.Vector3(xmax, ymin, zmin),
                         new THREE.Vector3(xmax, ymax, zmin));
  if(flag)
    geometry.vertices.push(new THREE.Vector3(xmin+0.5, ymin, zmax),
                           new THREE.Vector3(xmin+0.5, ymax, zmax),
                           new THREE.Vector3(xmax-1, ymin, zmax),
                           new THREE.Vector3(xmax-1, ymax, zmax));
  else
    geometry.vertices.push(new THREE.Vector3(xmin, ymin, zmax),
                           new THREE.Vector3(xmin, ymax, zmax),
                           new THREE.Vector3(xmax, ymin, zmax),
                           new THREE.Vector3(xmax, ymax, zmax));
}

function createBoxFaces(geometry, hex1, hex2) {
  // Bottom Face
  createFace(geometry, hex1, 0, 3, 2);
  createFace(geometry, hex1, 0, 1, 3);

  // Top Face
  createFace(geometry, hex2, 4, 6, 7);
  createFace(geometry, hex2, 4, 7, 5);

  // Back Face
  createFace(geometry, hex1, 0, 5, 1);
  createFace(geometry, hex1, 0, 4, 5);

  // Front Face
  createFace(geometry, hex1, 2, 3, 7);
  createFace(geometry, hex1, 2, 7, 6);

  // Right Face
  createFace(geometry, hex1, 0, 2, 6);
  createFace(geometry, hex1, 0, 6, 4);

  // Left Face
  createFace(geometry, hex1, 1, 7, 3);
  createFace(geometry, hex1, 1, 5, 7);

  geometry.computeFaceNormals();
  geometry.computeVertexNormals();
}

function createTableVertices(geometry, xmin, xmax, ymin, ymax, zmin, zmax, seg) {
  for(var x = xmin; x <= xmax; x += seg)
    for(var y = ymin; y <= ymax; y += seg) {
      geometry.vertices.push(new THREE.Vector3(x, y, zmin));
      geometry.vertices.push(new THREE.Vector3(x, y, zmax));
    }
}

function createTableFaces(geometry, xnum, ynum, znum) {
  // xnum = (160 / 20) + 1 = 9
  // ynum = (100 / 20) + 1 = 6
  // znum = (4 / 4) + 1 = 2
  for(var x = 0; x < xnum; x += 1)
    for(var y = 0; y < ynum; y += 1)
      for(var z = 0; z < znum; z += 1) {
        v1 = z + y*znum + x*ynum*znum;
        v2 = v1 + ynum*znum;
        v3 = v1 + znum;
        v4 = v2 + znum;
        var hex1 = ((x + y + z) % 2 == 0 ? 0xffffff : 0xffffff);
        var hex2 = ((x + y + z) % 2 != 0 ? 0xffffff : 0xffffff);
        if(x == 0 && y < ynum - 1 && z == 0) {
          createFace(geometry, hex1, v1, v3 + 1, v3);
          createFace(geometry, hex1, v1, v1 + 1, v3 + 1);
        }
        if(x < xnum - 1 && y == 0 && z == 0) {
          createFace(geometry, hex1, v2, v1 + 1, v1);
          createFace(geometry, hex1, v2, v2 + 1, v1 + 1);
        }
        if(x == xnum - 1 && y < ynum - 1 && z == 0) {
          createFace(geometry, hex2, v1, v3, v3 + 1);
          createFace(geometry, hex2, v1, v3 + 1, v1 + 1);
        }
        if(x < xnum - 1 && y == ynum - 1 && z == 0) {
          createFace(geometry, hex2, v2, v1, v1 + 1);
          createFace(geometry, hex2, v2, v1 + 1, v2 + 1);
        }
        if(x < xnum - 1 && y < ynum - 1 && z == 1) {
          createFace(geometry, hex1, v1, v4, v3);
          createFace(geometry, hex1, v1, v2, v4);
        }
      }
  geometry.computeFaceNormals();
  geometry.computeVertexNormals();
}

function createWheelVertices(geometry, x, y, z, raio1, raio2, l) {
  geometry.vertices.push(new THREE.Vector3(x, y - l, z),
                         new THREE.Vector3(x, y + l, z));
  for(var angle = 0; angle < 2*Math.PI; angle += Math.PI/3) {
    geometry.vertices.push(new THREE.Vector3(x + raio1*Math.cos(angle), y - l, z + raio2*Math.sin(angle)),
                           new THREE.Vector3(x + raio1*Math.cos(angle), y + l, z + raio2*Math.sin(angle)));
  }
}

function createWheelFaces(geometry, hex) {
  createFace(geometry, hex, 0, 4, 2);
  createFace(geometry, hex, 0, 6, 4);
  createFace(geometry, hex, 0, 8, 6);
  createFace(geometry, hex, 0, 10, 8);
  createFace(geometry, hex, 0, 12, 10);
  createFace(geometry, hex, 0, 2, 12);

  createFace(geometry, hex, 1, 3, 5);
  createFace(geometry, hex, 1, 5, 7);
  createFace(geometry, hex, 1, 7, 9);
  createFace(geometry, hex, 1, 9, 11);
  createFace(geometry, hex, 1, 11, 13);
  createFace(geometry, hex, 1, 13, 3);

  createFace(geometry, hex, 3, 2, 4);
  createFace(geometry, hex, 3, 4, 5);
  createFace(geometry, hex, 5, 4, 6);
  createFace(geometry, hex, 5, 6, 7);
  createFace(geometry, hex, 7, 6, 8);
  createFace(geometry, hex, 7, 8, 9);
  createFace(geometry, hex, 9, 8, 10);
  createFace(geometry, hex, 9, 10, 11);
  createFace(geometry, hex, 11, 10, 12);
  createFace(geometry, hex, 11, 12, 13);
  createFace(geometry, hex, 13, 12, 2);
  createFace(geometry, hex, 13, 2, 3);

  geometry.computeFaceNormals();
  geometry.computeVertexNormals();
}

function createFace(geometry, hex, v1, v2, v3) {
  var face = new THREE.Face3(v1, v2, v3);
  face.color.setHex(hex);
  geometry.faces.push(face);
}

/********************************
          COR E BRILHO
********************************/

function setMaterialColor(obj, hex) {
  var len = obj.materials.length;
  for(var i = 0; i < len; i++)
    obj.materials[i].color.setHex(hex);
}
