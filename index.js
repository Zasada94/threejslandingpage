import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import gsap from "gsap";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	75,
	innerWidth / innerHeight,
	0.1,
	1000
);
const renderer = new THREE.WebGLRenderer();
const raycaster = new THREE.Raycaster();
const gui = new dat.GUI();
const world = {
	plane: {
		width: 5,
		height: 5,
		widthSegments: 10,
		heightSegments: 10,
	},
};
gui.add(world.plane, "width", 1, 20).onChange(generatePlane);

gui.add(world.plane, "height", 1, 20).onChange(generatePlane);
gui.add(world.plane, "widthSegments", 1, 50).onChange(generatePlane);
gui.add(world.plane, "heightSegments", 1, 50).onChange(generatePlane);

function generatePlane() {
	planeMesh.geometry.dispose();
	planeMesh.geometry = new THREE.PlaneGeometry(
		world.plane.width,
		world.plane.height,
		world.plane.widthSegments,
		world.plane.heightSegments
	);

	const { array } = planeMesh.geometry.attributes.position;
	for (let i = 0; i < array.length; i += 3) {
		const x = array[i];
		const y = array[i + 1];
		const z = array[i + 2];

		array[i + 2] = z + Math.random();
	}
}

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

const planeGeometry = new THREE.PlaneGeometry(5, 5, 10, 10);
const planeMaterial = new THREE.MeshPhongMaterial({
	side: THREE.DoubleSide,
	flatShading: true,
	vertexColors: true,
});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(planeMesh);

const { array } = planeMesh.geometry.attributes.position;

for (let i = 0; i < array.length; i += 3) {
	const x = array[i];
	const y = array[i + 1];
	const z = array[i + 2];

	array[i + 2] = z + Math.random();
}

const colors = [];
for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
	colors.push(0, 0.19, 0.4);
}

planeMesh.geometry.setAttribute(
	"color",
	new THREE.BufferAttribute(new Float32Array(colors), 3)
);

console.log(planeMesh.geometry.attributes);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 0, 1);
scene.add(light);

const backLight = new THREE.DirectionalLight(0xffffff, 1);
backLight.position.set(0, 0, -1);
scene.add(backLight);

camera.position.z = 5;
new OrbitControls(camera, renderer.domElement);

const mouse = {
	x: undefined,
	y: undefined,
};
function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObject(planeMesh);
	if (intersects.length > 0) {
		const { color } = intersects[0].object.geometry.attributes;

		//vertice 1
		color.setX(intersects[0].face.a, 0.1);
		color.setY(intersects[0].face.a, 0.5);
		color.setZ(intersects[0].face.a, 1);
		//vertice 2
		color.setX(intersects[0].face.b, 0.1);
		color.setY(intersects[0].face.b, 0.5);
		color.setZ(intersects[0].face.b, 1);
		//vertice 3
		color.setX(intersects[0].face.c, 0.1);
		color.setY(intersects[0].face.c, 0.5);
		color.setZ(intersects[0].face.c, 1);

		intersects[0].object.geometry.attributes.color.needsUpdate = true;

		const initialColor = {
			r: 0,
			g: 0.19,
			b: 0.4,
		};
		const hoverColor = {
			r: 0.1,
			g: 0.5,
			b: 1,
		};
		gsap.to(hoverColor, {
			r: initialColor.r,
			g: initialColor.g,
			b: initialColor.b,
			onUpdate: () => {
				//vertice 1
				color.setX(intersects[0].face.a, hoverColor.r);
				color.setY(intersects[0].face.a, hoverColor.g);
				color.setZ(intersects[0].face.a, hoverColor.b);
				//vertice 2
				color.setX(intersects[0].face.b, hoverColor.r);
				color.setY(intersects[0].face.b, hoverColor.g);
				color.setZ(intersects[0].face.b, hoverColor.b);
				//vertice 3
				color.setX(intersects[0].face.c, hoverColor.r);
				color.setY(intersects[0].face.c, hoverColor.g);
				color.setZ(intersects[0].face.c, hoverColor.b);
			},
		});
	}
}

animate();

addEventListener("mousemove", (event) => {
	mouse.x = (event.clientX / innerWidth) * 2 - 1;
	mouse.y = -((event.clientY / innerHeight) * 2 - 1);
});
