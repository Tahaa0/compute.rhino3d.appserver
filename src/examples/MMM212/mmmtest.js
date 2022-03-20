// Import libraries
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.126.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/controls/OrbitControls.js";
import rhino3dm from "https://cdn.jsdelivr.net/npm/rhino3dm@7.11.1/rhino3dm.module.js";
import { RhinoCompute } from "https://cdn.jsdelivr.net/npm/compute-rhino3d@0.13.0-beta/compute.rhino3d.module.js";
import { Rhino3dmLoader } from "https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/loaders/3DMLoader.js";

            //this is for music background
            var audio = document.getElementById("audio1");
            audio.volume = 0.2;

const definitionName = "MMM 2.gh";

const data = {
  definition: 'MMM 2.gh',
}

// Set up sliders
const length_slider = document.getElementById('Length')
length_slider.addEventListener('mouseup', onSliderChange, false)
length_slider.addEventListener('touchend', onSliderChange, false)

const depth_slider = document.getElementById('Depth')
depth_slider.addEventListener('mouseup', onSliderChange, false)
depth_slider.addEventListener('touchend', onSliderChange, false)

const numberoffaçades_slider = document.getElementById('Number of Façades')
numberoffaçades_slider.addEventListener('mouseup', onSliderChange, false)
numberoffaçades_slider.addEventListener('touchend', onSliderChange, false)

const tramedestructure_slider = document.getElementById('Trame de sructure')
tramedestructure_slider.addEventListener('mouseup', onSliderChange, false)
tramedestructure_slider.addEventListener('touchend', onSliderChange, false)

const loader = new Rhino3dmLoader()
loader.setLibraryPath('https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/')



let rhino, definition, doc
rhino3dm().then(async m => {
    console.log('Loaded rhino3dm.')
    rhino = m // global

    
  //RhinoCompute.url = getAuth( 'https://macad2021.compute.rhino3d.com/' ) // RhinoCompute server url. Use http://localhost:8081 if debugging locally.
  //RhinoCompute.apiKey = getAuth( 'macad2021' )  // RhinoCompute server api key. Leave blank if debugging locally.

  RhinoCompute.url = "http://localhost:8081/"; //if debugging locally.

  // load a grasshopper file!

  const url = definitionName;
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const arr = new Uint8Array(buffer);
  definition = arr;

  init();

  compute();
});

//calling download function
const downloadButton = document.getElementById("downloadButton")
downloadButton.onclick = download



//set up tthe sliderrs

async function compute() {


    const param1 = new RhinoCompute.Grasshopper.DataTree('Depth')
    param1.append([0], [depth_slider.valueAsNumber])

    const param2 = new RhinoCompute.Grasshopper.DataTree('Length')
    param2.append([0], [length_slider.valueAsNumber])

    const param3 = new RhinoCompute.Grasshopper.DataTree('Number of Façades')
    param3.append([0], [numberoffaçades_slider.valueAsNumber])

    const param4 = new RhinoCompute.Grasshopper.DataTree('Trame de sructure')
    param4.append([0], [tramedestructure_slider.valueAsNumber])

    // clear values
    const trees = []
    trees.push(param1)
    trees.push(param2)
    trees.push(param3)
    trees.push(param4)

    const res = await RhinoCompute.Grasshopper.evaluateDefinition(definition, trees)


  //console.log(res);

  doc = new rhino.File3dm();

    // hide spinner and enable download and screenshot button
   document.getElementById("loader").style.display = "none";
   downloadButton.disabled = false
   shot.disabled = false



   //decode grasshopper objects and put them into a rhino document
  for (let i = 0; i < res.values.length; i++) {
    for (const [key, value] of Object.entries(res.values[i].InnerTree)) {
      for (const d of value) {
        const data = JSON.parse(d.data);
        const rhinoObject = rhino.CommonObject.decode(data);
        doc.objects().add(rhinoObject, null);
      }
    }
  }



  // go through the objects in the Rhino document

  let objects = doc.objects();
  for ( let i = 0; i < objects.count; i++ ) {
  
    const rhinoObject = objects.get( i );


     // asign geometry userstrings to object attributes
    if ( rhinoObject.geometry().userStringCount > 0 ) {
      const g_userStrings = rhinoObject.geometry().getUserStrings()
      rhinoObject.attributes().setUserString(g_userStrings[0][0], g_userStrings[0][1])
      
    }
  }


  // clear objects from scene
  scene.traverse((child) => {
    if (!child.isLight) {
      scene.remove(child);
    }
  });

  const buffer = new Uint8Array(doc.toByteArray()).buffer;
  loader.parse(buffer, function (object) {

    // go through all objects, check for userstrings and assing colors

    object.traverse((child) => {
      if (child.isLine) {

        if (child.userData.attributes.geometry.userStringCount > 0) {
          
          //get color from userStrings
          const colorData = child.userData.attributes.userStrings[0]
          const col = colorData[1];

          //convert color from userstring to THREE color and assign it
          const threeColor = new THREE.Color("rgb(" + col + ")");
          const mat = new THREE.LineBasicMaterial({ color: threeColor });
          child.material = mat;


          
        }
      }
    });

    ///////////////////////////////////////////////////////////////////////
    // add object graph from rhino model to three.js scene
    scene.add(object);



  });
}

function onSliderChange() {
  // show spinner
  document.getElementById("loader").style.display = "block";
  compute();
}


// THREE BOILERPLATE //
let scene, camera, renderer, controls;

function init() {
      //Change up to z-axis
THREE.Object3D.DefaultUp = new THREE.Vector3( 0, 0, 1 )
  // create a scene and a camera
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xb7312c);
  var aspect = window.innerWidth / window.innerHeight;
  var d = 30;
  camera = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 1, 1000 );
  camera.position.set( -20, 20, 20 ); // all components equal
  camera.lookAt( scene.position ); // or the origin

  // add Screenshot listener
document.getElementById("shot").addEventListener('click', takeScreenshot);

  // create the renderer and add it to the html
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // add some controls to orbit the camera
  controls = new OrbitControls(camera, renderer.domElement);

  // add a directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.intensity =3;
  scene.add(directionalLight);

  const light = new THREE.AmbientLight( 0x404040 ); // soft white light
  scene.add( light );

  const hemiLight = new THREE.HemisphereLight( 0x404040 , 0x404040 ,3);
  hemiLight.color.setHSL( 0.6, 1, 0.6 );
  hemiLight.groundColor.setHSL( 0.095, 0.75, 1 );
  hemiLight.position.set( 0, 0, 200 );
  scene.add( hemiLight );

 

  
  animate();
}





function animate() {
  requestAnimationFrame(animate);
  scene.traverse(function(child){
    if (child.isMesh){
        child.rotation.z +=0.001
        
    }else{(child.isLine)
      child.rotation.z +=0.001
    }})
    
    
  renderer.render(scene, camera);
}

    
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  animate();
}

function meshToThreejs(mesh, material) {
  const loader = new THREE.BufferGeometryLoader();
  const geometry = loader.parse(mesh.toThreejsJSON());
  return new THREE.Mesh(geometry, material);
}


   //This function is called when the download button is clicked

function download () {
  // write rhino doc to "blob"
  const bytes = doc.toByteArray()
  const blob = new Blob([bytes], {type: "application/octect-stream"})
// use "hidden link" trick to get the browser to download the blob
  const filename = data.definition.replace(/\.gh$/, '') + '.3dm'
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = filename
  link.click()
 }

//CALLING FUNCTION TAKE SCREENSHOT

function takeScreenshot() {

      renderer.render(scene, camera);
      renderer.domElement.toBlob(function(blob){
        var b = document.createElement('a');
        var url = URL.createObjectURL(blob);
        b.href = url;
        b.download = 'maison.png';
        b.click();
      }, 'image/png', 20.0);
   }




 

