// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
var canvas = document.getElementById("renderCanvas");

var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = function () {
  return new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    disableWebGL2Support: false
  });
};
var delayCreateScene = function () {
  // Create a scene.
  var scene = new BABYLON.Scene(engine);

  // Create a default skybox with an environment.
  //var hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("textures/environment.dds", scene);
  //var currentSkybox = scene.createDefaultSkybox(hdrTexture, true);

  // Append glTF model to scene.
  BABYLON.SceneLoader.Append("model/", "grace.gltf", scene, function (scene) {
    // Create a default arc rotate camera and light.
    scene.createDefaultCameraOrLight(true, true, true);

    // The default camera looks at the back of the asset.
    // Rotate the camera by 180 degrees to the front of the asset.
    scene.activeCamera.alpha += Math.PI;
  });

  return scene;
};
window.initFunction = async function () {
  var asyncEngineCreation = async function () {
    try {
      return createDefaultEngine();
    } catch (e) {
      console.log("the available createEngine function failed. Creating the default engine instead");
      return createDefaultEngine();
    }
  }

  window.engine = await asyncEngineCreation();
  if (!engine) throw 'engine should not be null.';
  window.scene = delayCreateScene();
};
initFunction().then(() => {
  sceneToRender = scene
  engine.runRenderLoop(function () {
    if (sceneToRender && sceneToRender.activeCamera) {
      sceneToRender.render();
    }
  });
});

// Resize
window.addEventListener("resize", function () {
  engine.resize();
});
