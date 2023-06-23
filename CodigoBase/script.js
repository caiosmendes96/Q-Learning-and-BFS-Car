import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";

const 	rendSize 	= new THREE.Vector2();
var container;
const loader = new GLTFLoader();
var scene,
		renderer,
		camera,
    car,
    track,
    box,
    texture,
    textureRoad;

var pathSize = { x: 13, y: 4 }; // Tamanho da grade da pista (10x5)
var learningRate = 1.0; // Taxa de aprendizado
var discountFactor = 1.0; // Fator de desconto
var explorationRate = 1.0; // Taxa de exploração
var epsilon_decay = 0.01;
var leraning_decay = 0.01;

var qTable = [];
var path = [];
var trackAux = [];


function main() {

	renderer = new THREE.WebGLRenderer({ antialias: true } );
	renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));
  renderer.setPixelRatio( window.devicePixelRatio );
 
	rendSize.x = rendSize.y = Math.min(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
	renderer.setSize(rendSize.x * 1.3, rendSize.y / 1.4);
	container = document.getElementById( 'threejs-canvas' );
	document.body.appendChild(container);
	container.appendChild( renderer.domElement );

	scene 	= new THREE.Scene();
  scene.background = new THREE.Color( 0x87CEEB );
  scene.rotation.y = 0.0;
  scene.rotation.x = -Math.PI/ 3 ;
  scene.rotation.z = 0.0;

	camera = new THREE.PerspectiveCamera(50, rendSize.x / rendSize.y, 1.0, 2000);
	camera.position.set(6,5, 21);

  initTrack();

	initLights();

  initHoles();

  loader.load('../Models/suv.glb', loadCar);

  renderer.render(scene, camera);
  train();
}
function initHoles(){
  texture 	= new THREE.TextureLoader().load("../../Models/hole2.png");
	// criação dos buracos
  var holes = [];
	const obstacleGeometry = new THREE.PlaneGeometry(0.8, 0.8);
	const obstacleGeometryMaterial = new THREE.MeshBasicMaterial( { map:texture,
                                                                  transparent: true } );
	holes[0] = new THREE.Mesh(obstacleGeometry, obstacleGeometryMaterial);
	holes[0].position.set(4,0.2,2);

  holes[1] = holes[0].clone();
	holes[1].position.set(4,-1.2,2);

  holes[2] = holes[0].clone();
	holes[2].position.set(7,0,2);

  holes[3] = holes[0].clone();
	holes[3].position.set(9,-1,2);

  holes[4] = holes[0].clone();
	holes[4].position.set(9,-2,2);

  holes[5] = holes[0].clone();
	holes[5].position.set(11,-3,2);

  holes.forEach(item =>{
    scene.add(item);

  });
}

function initTrack(){
 
  textureRoad = new THREE.TextureLoader().load("../../Models/ativo.png");

  const trackGeometry = new THREE.PlaneGeometry(pathSize.x, pathSize.y + 1.0);
  const trackMaterial = new THREE.MeshPhongMaterial({ map:textureRoad, specular: 0x10101, depthWrite: false });
  const track2 = new THREE.Mesh(trackGeometry, trackMaterial);
  track2.receiveShadow = true;
  track2.position.x += 6;
  track2.position.y -= 1.5;
  track2.position.z = 1.9;
  scene.add(track2);
 
 


  const trackSideGeometry = new THREE.PlaneGeometry(pathSize.x, 1.5)
	const materialTrackSide = new THREE.MeshPhongMaterial({specular: 0x101010, color: 0x101010 });
	const trackSide = new THREE.Mesh(trackSideGeometry, materialTrackSide);
  trackSide.position.x += 6;
  trackSide.position.y += 1.7;
  trackSide.position.z = 1.9;
	scene.add(trackSide);

  const trackSide2 = trackSide.clone();
  trackSide2.position.y = -4.5;
	scene.add(trackSide2);

  track = [
    [1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1]
  ];

  trackAux = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ];

  // Definir a tabela Q inicializada com zeros
  for (let x = 0; x < pathSize.x; x++) {
    qTable[x] = [];
    for (let y = 0; y < pathSize.y; y++) {
      qTable[x][y] = { right: 0, up: 0, down: 0 };
    }
  }
}

// Inicializa o modelo do carro e o posiciona corretamente na pista
function loadCar(loadedCar){
	car = loadedCar.scene;
	car.traverse((o) => {
		if (o.isMesh){
			o.material.side = THREE.DoubleSide;
      o.castShadow = true;
      o.receiveShadow = true;
		} 
	  });
  resetCar();
	car.rotation.x = Math.PI / 2;
	car.rotation.y = -Math.PI/2;
  car.scale.set(0.7,0.7,0.5);
  car.position.z = 1.8;
	scene.add(car);
	box = new THREE.Box3().setFromObject(car);
  renderer.render(scene, camera);
}

// Inicializa a iluminação global da cena
function initLights(){
	const hemiLight = new THREE.HemisphereLight( 0xffffbb, 0x080820 );
	scene.add( hemiLight );
	const spotLight = new THREE.SpotLight();
	spotLight.angle = Math.PI / 8;
	spotLight.penumbra = 0.1;
	spotLight.castShadow = true;
	spotLight.position.set( 20, 10, 35 );
	scene.add( spotLight );
}
// Função para verificar se uma célula contém um buraco
function isHole(x, y) {

  if(track[y][x] == 0){
    return true;
  }else{
    return false;
  }
}
// Função para escolher uma ação com base nos valores Q e na taxa de exploração
function chooseAction(position) {
  if (Math.random() < explorationRate) {
    // escolhe uma ação aleatória
    var actions = Object.keys(qTable[position.x][position.y]);
    var randomIndex = Math.floor(Math.random() * actions.length);

    return actions[randomIndex];
  } else {
    // escolhe a ação com maior valor Q
    var actions = Object.keys(qTable[position.x][position.y]);
    let maxQ = -Infinity;
    let bestAction = actions[0];
   
    actions.forEach(action => {
      var qValue = qTable[position.x][position.y][action];
      if (qValue > maxQ) {
        maxQ = qValue;
        bestAction = action;
      }
    });
    return bestAction;
  }
}
// Função para atualizar a tabela Q com base na transição de estado
function updateQTable(position, action, reward, nextPosition) {
  var currentQ = qTable[position.x][position.y][action];
  var maxNextQ = Math.max(...Object.values(qTable[nextPosition.x][nextPosition.y]));
  var updatedQ = (1 - learningRate) * currentQ + learningRate * (reward + discountFactor * maxNextQ);
  qTable[position.x][position.y][action] = updatedQ;
}
function resetCar(){
  car.position.set(0, 0, 1.8);
  renderer.render(scene, camera);
}

function resetMatrix(){
  for (var i = 0; i < pathSize.x; i++) {
    for (var j = 0; j < pathSize.y; j++) {
      trackAux[j][i] = 0;
    }
  }
}
// Função para treinar o agente usando o algoritmo Q-learning
function train() {
 
  let counter = 0;
  const numEpisodes = 50; // Número de episódios de treinamento
  
  for (let episode = 0; episode < numEpisodes; episode++) {
    resetMatrix();
    let currentPosition = { x: 0, y: 0 }; // Posição inicial do carro

    while (true) {
      counter++;

      var action = chooseAction(currentPosition); //Escolhe a ação (aleatória ou a melhor ação)
      let nextPosition = { x: currentPosition.x, y: currentPosition.y };
      trackAux[currentPosition.y][currentPosition.x] = 1; // Marca a posição atual como já visitada na pista auxiliar

      if(currentPosition.x == 12){
        //Chegou no destino final
        reward = +10;
        updateQTable(currentPosition, action, reward, nextPosition );
        break;
      }

      if (action === 'right' && currentPosition.x >= 0) {
        nextPosition.x++;
      } else if (action === 'up' && currentPosition.y > 0) {
        nextPosition.y--;
      } else if (action === 'down' && currentPosition.y < pathSize.y - 1) {
        nextPosition.y++;
      }
      var reward = 0;
      if(isHole(nextPosition.x, nextPosition.y)){ 
        reward  -= 20; // Recompensa negativa se a ação faz o carro cair em um buraco
      }else{
        reward  += 1; // Recompensa positiva se a ação não faz o carro cair em um buraco
      }
      if((currentPosition.y == 0 && action === 'up' ) || (currentPosition.y == 3 && action === 'down') ){ // Recompensa negativa se a ação faz o carro sair da pista
        reward  -= 1;
      }
      if(trackAux[nextPosition.y][nextPosition.x] == 1){ //Recompensa negativa se a ação faz o carro visitar uma posição já visitada
        reward -= 2;
      }
      updateQTable(currentPosition, action, reward, nextPosition);
      currentPosition = nextPosition;
      
    }
    explorationRate -= epsilon_decay;
    learningRate -= leraning_decay;
    console.log("exploration rate",explorationRate );
  }
 // console.log("Tabela Q treinada: ", qTable);
  runAgent();
 // console.log("Passos: ", counter);
  //console.log("Média de passos/episódios: ", counter/numEpisodes);
  
}

// Função para executar o agente treinado e criar o array de posições para animação
function runAgent() {
  
  let currentPosition = { x: 0, y: 0 }; // Posição inicial do carro
  var counterHoles = 0;
  
  while(true){

    var actions = Object.keys(qTable[currentPosition.x][currentPosition.y]);
    let maxQ = -Infinity;
    let bestAction = actions[0];

    actions.forEach(action => {
      var qValue = qTable[currentPosition.x][currentPosition.y][action];
      if (qValue > maxQ) {
        maxQ = qValue;
        bestAction = action;
      }
    });
    let nextPosition = { x: currentPosition.x, y: currentPosition.y };

    if (bestAction === 'right' && currentPosition.x >= 0) {
      nextPosition.x++;
    } else if (bestAction === 'up' && currentPosition.y > 0) {
      nextPosition.y--;
    } else if (bestAction === 'down' && currentPosition.y < pathSize.y) {
      nextPosition.y++;
    }
    if(isHole(nextPosition.x, nextPosition.y)){
      counterHoles++;
    }
    path.push(currentPosition); // Adiciona a posição da melhor ação a partir da Q_Table
    currentPosition = nextPosition;

    if(currentPosition.x == 12){
      path.push(currentPosition);
      console.log("Caminho percorrido (já treinado): ", path);
      console.log("Buracos", counterHoles);
      animateCar(path);
      break;
    }
  }

}

function animateCar() {

  var i=0;
    var id = setInterval(function() { 

    if(path[i] == undefined){
      console.log("Encerra animação!");
      clearInterval(id);
    }else{
      car.position.set(path[i].x, - path[i].y, 2);
      i++;
    }
      renderer.render(scene, camera);
    }, 180);

}
//********************************** */

main();
// Iniciar o treinamento
