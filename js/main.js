const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = async function () {
    const scene = new BABYLON.Scene(engine);
    scene.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
    scene.animationPropertiesOverride.enableBlending = true;
    scene.animationPropertiesOverride.blendingSpeed = 0.05;
    scene.animationPropertiesOverride.loopMode = 1;
    
    const camera = new BABYLON.ArcRotateCamera("camera", 0, Math.PI / 3, 20, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 20, height: 20 }, scene);
    
    // バットを作成
    const bat = BABYLON.MeshBuilder.CreateCylinder("bat", { height: 1.5, diameter: 0.1 }, scene);
    const axes = new BABYLON.Debug.AxesViewer(scene, 2)
    // bat.position = new BABYLON.Vector3(0.2, 3.2, 0.9);
    bat.setPivotPoint(new BABYLON.Vector3(0, -0.75, 0)); // バットの先端を回転中心に
    bat.rotation = new BABYLON.Vector3(Math.PI/4, 0, 0);

    // 物理判定用のバット
    const bat2 = BABYLON.MeshBuilder.CreateCylinder("bat", { height: 1.5, diameter: 0.2 }, scene);
    bat2.position = new BABYLON.Vector3(0.2, 2.75, 0.9);
    bat2.setPivotPoint(new BABYLON.Vector3(0, -0.75, 0)); // バットの先端を回転中心に
    bat2.rotation = new BABYLON.Vector3(-Math.PI/2, -Math.PI/2, 0);
    bat2.isVisible = false;

    // 球場モデル
    // Drawing Lines Function
    const drawLine = (start, end, name, color, thickness) => {
        const points = [start, end];
        const line = BABYLON.MeshBuilder.CreateLines(name, { points: points, color: color }, scene);
        line.color = new BABYLON.Color3.FromHexString(color);
        line.width = thickness;
        return line;
    };

    // Baseball Field Setup
    const loadBaseball = () => {
        const thickness = 10.14;

        // Infield lines
        drawLine(new BABYLON.Vector3(-1.50, 0.01, 1.30), new BABYLON.Vector3(-88.94, 0.01, 88.94), "baseball_line_0", "#ffffff", thickness);
        drawLine(new BABYLON.Vector3(-1.50, 0.01, -1.30), new BABYLON.Vector3(-88.94, 0.01, -88.94), "baseball_line_1", "#ffffff", thickness);

        // Batter box left
        const batterboxOffset = 0.2;
        drawLine(new BABYLON.Vector3(-1.13 + (thickness / 2), 0.01, 1.588 - thickness), new BABYLON.Vector3(-1.13 + (thickness / 2), 0.01, 0.368 + thickness), "baseball_line_2", "#ffffff", thickness);
        drawLine(new BABYLON.Vector3(-1.13, 0.01, 0.368 + (thickness / 2)), new BABYLON.Vector3(0.698 + batterboxOffset, 0.01, 0.368 + (thickness / 2)), "baseball_line_3", "#ffffff", thickness);
        drawLine(new BABYLON.Vector3(0.698 - (thickness / 2) + batterboxOffset, 0.01, 0.368 + thickness), new BABYLON.Vector3(0.698 - (thickness / 2) + batterboxOffset, 0.01, 1.588 - thickness), "baseball_line_4", "#ffffff", thickness);
        drawLine(new BABYLON.Vector3(0.698 + batterboxOffset, 0.01, 1.588 - (thickness / 2)), new BABYLON.Vector3(-1.13, 0.01, 1.588 - (thickness / 2)), "baseball_line_5", "#ffffff", thickness);

        // Batter box right
        drawLine(new BABYLON.Vector3(-1.13 + (thickness / 2), 0.01, -1.588 + thickness), new BABYLON.Vector3(-1.13 + (thickness / 2), 0.01, -0.368 - thickness), "baseball_line_6", "#ffffff", thickness);
        drawLine(new BABYLON.Vector3(-1.13, 0.01, -0.368 - (thickness / 2)), new BABYLON.Vector3(0.698 + batterboxOffset, 0.01, -0.368 - (thickness / 2)), "baseball_line_7", "#ffffff", thickness);
        drawLine(new BABYLON.Vector3(0.698 - (thickness / 2) + batterboxOffset, 0.01, -0.368 - thickness), new BABYLON.Vector3(0.698 - (thickness / 2) + batterboxOffset, 0.01, -1.588 + thickness), "baseball_line_8", "#ffffff", thickness);
        drawLine(new BABYLON.Vector3(0.698 + batterboxOffset, 0.01, -1.588 + (thickness / 2)), new BABYLON.Vector3(-1.13, 0.01, -1.588 + (thickness / 2)), "baseball_line_9", "#ffffff", thickness);

        // Mound
        const mound = BABYLON.MeshBuilder.CreateCylinder("mound", {
            diameterTop: 0, diameterBottom: 5.48, height: 0.254, tessellation: 32
        }, scene);
        mound.position = new BABYLON.Vector3(-18.44 + 0.305, 0.127, 0);
        mound.material = new BABYLON.StandardMaterial("moundMat", scene);
        mound.material.diffuseColor = new BABYLON.Color3.FromHexString("#f4a460");

        // Batter Box
        const batterBox = BABYLON.MeshBuilder.CreateCylinder("batterBox", {
            diameterTop: 7.84, diameterBottom: 7.84, height: 0.001, tessellation: 32
        }, scene);
        batterBox.position.y = -0.01;
        batterBox.material = new BABYLON.StandardMaterial("batterBoxMat", scene);
        batterBox.material.diffuseColor = new BABYLON.Color3.FromHexString("#f4a460");

        // Fence (Approximation with Ribbon)
        const fencePath = [];
        for (let i = 15; i <= 75; i += 0.1) {
            const angle = BABYLON.Tools.ToRadians(i * 0.45); // Example calculation for angle
            const radius = 0.0100 + i * 0.01;
            fencePath.push(new BABYLON.Vector3(radius * Math.cos(angle), 0, radius * Math.sin(angle)));
        }

        const fence = BABYLON.MeshBuilder.CreateRibbon("fence", { pathArray: fencePath, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, scene);
        fence.material = new BABYLON.StandardMaterial("fenceMat", scene);
        // fence.material.diffuseTexture = new BABYLON.Texture("path/to/texture.png", scene);
    };

    // Call function to load the field
    loadBaseball();

    //選手モーション
    let animationGroups = {}
    let hand = null;
    let batGLTF = null;
    BABYLON.SceneLoader.ImportMesh("", "./model/motion/", "baseball-motion.glb", scene, function (meshes, particleSystems, skeletons, animationGroupsArray) {
        if (meshes.length > 0) {
            batGLTF = meshes[0];
            batGLTF.position = new BABYLON.Vector3(0, 0, 1.5);
            batGLTF.rotation = new BABYLON.Vector3(0, - Math.PI/2, 0);
            batGLTF.scaling = new BABYLON.Vector3(2, 2, 2); // 必要に応じてスケール調整
            
            animationGroupsArray.forEach(animGroup => {
                animationGroups[animGroup.name] = animGroup;
            });
            if (skeletons.length > 0) {
                const skeleton = skeletons[0];
                hand = skeleton.bones.find(bone => bone.name === "mixamorig:LeftHand");
            }
            
            if (animationGroups["Hit"])
                animationGroups["Hit"].play(false);
            if (animationGroups["Idle"])
                animationGroups["Idle"].play(true); // idleアニメーションをループ再生
        }
    });
    let ball;
    let ballSpeed;
    let isHit = false;

    const spawnBall = () => {
        if (ball) {
            ball.dispose();
        }
        ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 0.5 }, scene);
        ball.position = new BABYLON.Vector3(-10, 2, 0);
        ballSpeed = new BABYLON.Vector3(0.3 , 0, 0);
        isHit = false;
    };
    
    spawnBall();
    setInterval(spawnBall, 3000);
    
    scene.onBeforeRenderObservable.add(() => {
        if (hand) {
            bat.position.copyFrom(hand.getTransformNode().absolutePosition.addInPlace(new BABYLON.Vector3(-0., 0.6, 0)));
        }

        if (!isHit && ball) {
            ball.position.addInPlace(ballSpeed);
            
            // バットとの衝突判定
            if (ball.intersectsMesh(bat2, true)) {
                ballSpeed = new BABYLON.Vector3(- 0.2, 0.2, 0);
                isHit = true;
            }
         }
         else if (ball) {
            ball.position.addInPlace(ballSpeed);
        }
    });
    
    // バットをスイングするアニメーション
    window.addEventListener("keydown", (event) => {
        if (event.key === " ") { // スペースキーでスイング
            const anim = new BABYLON.Animation("swing", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            
            const keys = [];
            keys.push({ frame: 0, value: new BABYLON.Vector3(Math.PI/4, 0, 0) });
            keys.push({ frame: 10, value: new BABYLON.Vector3(-Math.PI/1.5, 0, 0) });
            keys.push({ frame: 20, value: new BABYLON.Vector3(-Math.PI/6, Math.PI/4, Math.PI/4) });
            
            anim.setKeys(keys);
            bat.animations = [anim];
            scene.beginAnimation(bat, 0, 20, false);

            const anim_2 = new BABYLON.Animation("swing2", "rotation.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            const keys_2 = [];
            keys_2.push({ frame: 0, value: -Math.PI/2 });
            keys_2.push({ frame: 10, value: Math.PI / 2 });
            keys_2.push({ frame: 20, value: -Math.PI / 2 });
            anim_2.setKeys(keys_2);
            bat2.animations = [anim_2];
            scene.beginAnimation(bat2, 0, 20, false);

            if (animationGroups["Idle"]) {
                animationGroups["Idle"].stop();
            }
            animationGroups["Hit"].play(false);
            animationGroups["Hit"].onAnimationEndObservable.addOnce(()=>{
                animationGroups["Idle"].play(true);
                bat.rotation = new BABYLON.Vector3(Math.PI/4, 0, 0);
            })
        }
    });
    
    return scene;
};

const scene = await createScene();
engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener("resize", () => {
    engine.resize();
});
