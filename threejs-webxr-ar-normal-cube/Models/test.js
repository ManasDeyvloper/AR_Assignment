import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'


let loadedModels = [];
let hitTestSource = null;
let hitTestSourceRequested = false;

let gltfLoader = new GLTFLoader();
gltfLoader.load('/scene.gltf', onLoad);


function onLoad(gltf) {
    loadedModels = gltf.scene;
}

const scene = new THREE.Scene()

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const light = new THREE.AmbientLight(0xffffff, 1.0)
scene.add(light)


let reticle = new THREE.Mesh(
    new THREE.RingGeometry(0.15, .2, 32).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xffffff * Math.random() })
)
reticle.visible = false;
reticle.matrixAutoUpdate = false;
scene.add(reticle)

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0, 2, 5);
camera.lookAt(new THREE.Vector3(0, 0, 0))
scene.add(camera);


const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true

});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.xr.enabled = true

document.body.appendChild(renderer.domElement);
document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }));


let controller = renderer.xr.getController(0);
camera.set
controller.addEventListener('select', onSelect);
scene.add(controller)

function onSelect() {
    if (reticle.visible) {
        
        console.log(camera.rotation);
        console.log("Clicked")
        if(camera.rotation.x >= 1 && camera.rotation.x <= 2)
        {
        //let randomIndex = Math.floor((Math.random() * loadedModels.length))
        let model = loadedModels.clone()
        let rotation = new THREE.Quaternion()
        model.position.setFromMatrixPosition(reticle.matrix);
        rotation.setFromRotationMatrix(reticle.matrix)
        
        //model.scale.set(.5, .5, .5)
        model.name = "model"

        scene.add(model)
        }
    }
}

renderer.setAnimationLoop(render)

function render(timestamp, frame) {
    if (frame) {
        const referenceSpace = renderer.xr.getReferenceSpace();
        const session = renderer.xr.getSession();

        if (hitTestSourceRequested === false) {
            session.requestReferenceSpace('viewer').then(referenceSpace => {
                session.requestHitTestSource({ space: referenceSpace }).then(source =>
                    hitTestSource = source)
            })

            hitTestSourceRequested = true;

            session.addEventListener("end", () => {
                hitTestSourceRequested = false;
                hitTestSource = null;
            })
        }

        if (hitTestSource) {
            const hitTestResults = frame.getHitTestResults(hitTestSource);
            if (hitTestResults.length > 0) {
                const hit = hitTestResults[0];
                reticle.visible = true;
                reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix)

            } else {
                reticle.visible = false

            }
        }
    }
    //console.log(camera.rotation);
    scene.children.forEach(object => {
        if (object.name === "model") {
           // object.rotation.y += 0.01
        }
    })
    renderer.render(scene, camera)
}
xrSession.updateRenderState({
    depthNear: .010,
    depthFar: 5.0,
  });

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(window.devicePixelRatio)

})