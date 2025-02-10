const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

let havokInstance;
HavokPhysics().then((havok) => {
// Havok is now available
    havokInstance = havok;
});

const createScene = async function () {
    const scene = new BABYLON.Scene(engine);
    scene.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
    scene.animationPropertiesOverride.enableBlending = true;
    scene.animationPropertiesOverride.blendingSpeed = 0.05;
    scene.animationPropertiesOverride.loopMode = 1;
    // 物理エンジンを有効化
    const havokInstance = await HavokPhysics();
    const hk = new BABYLON.HavokPlugin(true, havokInstance);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);

    // BGM系
    const mainBGM = new Audio('music/main.mp3');
    const robikasuBGM = new Audio('music/robikasu.mp3');
    const hitBGM = new Audio('music/bat.mp3');
    const throwBGM = new Audio('music/throw.mp3');
    const swingBGM = new Audio('music/swing.mp3');
    const homerunBGM = new Audio('music/homerun.mp3');
    const missBGM = new Audio('music/miss.mp3');
    const clearBGM = new Audio('music/game_clear.mp3');
    const failBGM = new Audio('music/game_fail.mp3');

    // カメラ
    const camera = new BABYLON.ArcRotateCamera("camera", 0, Math.PI / 2.5, 5, new BABYLON.Vector3(0, 1, 0), scene);
    // camera.attachControl(canvas, true);
    const cameraBase = camera.position.clone();
    let isCameraFollow = false;
    let cameraDelta = 0;
    let strike = false;
    let land = false;
    let isGameStart = false;
    
    //光源
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    
    // バット
    const bat = BABYLON.MeshBuilder.CreateCylinder("bat", { height: 0.75, diameter: 0.05 }, scene);
    bat.setPivotPoint(new BABYLON.Vector3(0, -0.375, 0)); // バットの先端を回転中心に
    bat.rotation = new BABYLON.Vector3(-Math.PI/4, 0, 0);
    bat.material = new BABYLON.StandardMaterial("batMat", scene);
    bat.material.diffuseColor = new BABYLON.Color3.FromHexString("#f4a460");

    // 物理判定用のバット
    const bat2 = BABYLON.MeshBuilder.CreateCylinder("bat", { height: 2, diameter: 0.2 }, scene);
    bat2.position = new BABYLON.Vector3(0.1, 1.5, -0.45);
    bat2.setPivotPoint(new BABYLON.Vector3(0, -0.375, 0)); // バットの先端を回転中心に
    bat2.rotation = new BABYLON.Vector3(Math.PI/2, Math.PI/2, 0);
    bat2.isVisible = false;

    //ボタン
    const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    // 一球結果表示用テキスト
    const resultBlock = new BABYLON.GUI.TextBlock();
    // スコア表示用テキスト
    const scoreBlock = new BABYLON.GUI.TextBlock();
    // 最終結果用
    const statBlock = new BABYLON.GUI.TextBlock();
    let trial = 0;
    const MAX_TRIAL = {"BEGINNER": 5, "EASY": 10, "MEDIUM": 20, "HARD": 30, "ROBIKASU": 40};
    const CLEAR_HR = {"BEGINNER": 2, "EASY": 4, "MEDIUM": 10, "HARD": 15, "ROBIKASU": 24};
    let homerun_num = 0;
    let level = "BEGINNER";
    // 難易度選択
    let buttonGroup = [];
    const createButton = (name, text, top, press = true) => {
        const startButton = BABYLON.GUI.Button.CreateSimpleButton(name, text);
        buttonGroup.push(startButton);
        startButton.width = 0.2;
        startButton.height = "40px";
        startButton.top = top;
        startButton.color = "white";
        startButton.background = "green";
        startButton.cornerRadius = 20;
        startButton.fontFamily = "KFhimaji";
        if (press) {
            startButton.isPointerBlocker = true;
            startButton.onPointerClickObservable.add(() => {
                isGameStart = true;
                level = name;
                if (name == "ROBIKASU") {
                    mainBGM.pause();
                    robikasuBGM.play();
                    robikasuBGM.loop = true;
                    const assetPath = "https://raw.githubusercontent.com/eldinor/ForBJS/master/Lava_005_SD/"
                    ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", assetPath +
                        "Lava_005_DISP.png",
                        1000, 1000, 400, 0, 0.005, scene, false);
                
                
                    let material = new BABYLON.PBRMaterial("mat", scene);
                    material.albedoTexture = new BABYLON.Texture(assetPath +"Lava_005_COLOR.jpg", scene);
                    material.albedoTexture.uScale = 200;
                    material.albedoTexture.vScale = 200;
                    material.bumpTexture = new BABYLON.Texture(assetPath +"Lava_005_NORM.jpg", scene);
                    material.bumpTexture.uScale = 200;
                    material.bumpTexture.vScale = 200;
                    material.bumpTexture.level = 0.5;
                    material.emissiveTexture = new BABYLON.Texture(assetPath +"spider_webs_compressed.jpg", scene);
                    material.emissiveTexture.uScale = 200;
                    material.emissiveTexture.vScale = 200;
                    material.emissiveColor = new BABYLON.Color3(245/255, 20/255, 20/255);
                    material.ambientTexture = new BABYLON.Texture(assetPath +"Lava_005_OCC.jpg", scene);
                    material.ambientTexture.uScale = 200;
                    material.ambientTexture.vScale = 200;
                    material.metallicTexture = new BABYLON.Texture(assetPath +"Lava_005_ROUGH.jpg", scene);
                    material.roughness = 1;
                    material.metallic = 0.1;
                    material.useRoughnessFromMetallicTextureAlpha = true;
                    material.useRoughnessFromMetallicTextureGreen = false;
                    material.useMetallnessFromMetallicTextureBlue = false;
                    
                    ground.material = material;
                
                    material.clearCoat.isEnabled = true;
                    material.clearCoat.bumpTexture = new BABYLON.Texture(assetPath +"Lava_005_NORM.jpg", scene);
                    material.clearCoat.bumpTexture.level = 0.0;
                
                    var alpha = 0;
                    scene.registerBeforeRender(function () {
                        material.albedoTexture.uOffset += 0.001;
                        material.bumpTexture.uOffset += 0.001;
                        material.ambientTexture.uOffset += 0.001;
                        material.metallicTexture.uOffset += 0.001;   
                        material.emissiveTexture.uOffset += 0.01; 
                        material.emissiveTexture.vOffset -= 0.005; 
                        ground.scaling.y += Math.sin(alpha) / 100;
                        alpha += 0.01;material.clearCoat.bumpTexture.level  += Math.sin(alpha) / 100;
                    });
                
                } else {
                    mainBGM.play();
                    mainBGM.loop = true;
                    mainBGM.volume = 0.5;
                }
                buttonGroup.forEach((button) =>{
                    advancedTexture.removeControl(button);
                })

                // 押したらテキストが出てくる
                resultBlock.text = "";
                resultBlock.fontSize = 50;
                resultBlock.top = canvas.height / 3;
                resultBlock.left = 0;
                resultBlock.color = "green";
                resultBlock.outlineWidth = 4;  // 境界線をつける
                resultBlock.outlineColor = "black"; // 境界線の色
                resultBlock.shadowBlur = 4;  // 影をつける
                resultBlock.shadowColor = "rgba(205, 44, 44, 0.5)";  // 影の色
                resultBlock.isPointerBlocker = false;
                resultBlock.fontFamily = "KFhimaji";
                advancedTexture.addControl(resultBlock);

                scoreBlock.text = "もくひょう: " + String(CLEAR_HR[level]) + "本\nホームラン: " + String(homerun_num) + "本\nのこり　　: " + String(MAX_TRIAL[level] - trial) + "球";
                scoreBlock.fontSize = 35;
                scoreBlock.top = canvas.height / 3;
                scoreBlock.left = canvas.width / 3;
                scoreBlock.color = "green";
                scoreBlock.outlineWidth = 4;  // 境界線をつける
                scoreBlock.outlineColor = "black"; // 境界線の色
                scoreBlock.shadowBlur = 4;  // 影をつける
                scoreBlock.shadowColor = "rgba(205, 44, 44, 0.5)";  // 影の色
                scoreBlock.isPointerBlocker = false;
                scoreBlock.fontFamily = "KFhimaji";
                advancedTexture.addControl(scoreBlock);

                statBlock.text = "";
                statBlock.fontSize = 70;
                statBlock.color = "green";
                statBlock.outlineWidth = 4;  // 境界線をつける
                statBlock.outlineColor = "black"; // 境界線の色
                statBlock.shadowBlur = 4;  // 影をつける
                statBlock.shadowColor = "rgba(205, 44, 44, 0.5)";  // 影の色
                statBlock.isPointerBlocker = false;
                statBlock.fontFamily = "KFhimaji";
                advancedTexture.addControl(statBlock);
            });
        }
        advancedTexture.addControl(startButton);
        return startButton;
    }

    // 開始ボタン
    createButton("BEGINNER", "かんたん", - canvas.height * 7.5 / 18);
    createButton("EASY", "すこしはやい", - canvas.height * 4.5/ 18);
    createButton("MEDIUM", "まきゅう1", - canvas.height * 1.5/ 18);
    createButton("HARD", "まきゅう2", canvas.height * 1.5/ 18);
    createButton("ROBIKASU", "さいきょう", canvas.height * 4.5 / 18);
    createButton("HOWTO", "(Spaceキー) スイング", canvas.height * 7.5 / 18, false);

    const updateScore = () => {
        scoreBlock.text = "もくひょう: " + String(CLEAR_HR[level]) + "本\nホームラン: " + String(homerun_num) + "本\nのこり　　: " + String(MAX_TRIAL[level] - trial) + "球";
    }

    const showResult = () => {
        if (homerun_num >= CLEAR_HR[level]) {
            statBlock.text = "クリア！！";
            clearBGM.play();
        }
        else {
            statBlock.text = "しっぱい・・";
            failBGM.play();
        }
        isGameStart = false;
        cameraDelta = 0;
    }

    // 球場
    let ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 2000, height: 2000 }, scene);
    ground.material = new BABYLON.StandardMaterial("fenceMat", scene);
    ground.material.diffuseTexture = new BABYLON.Texture("./model/Cartoon_green_texture_grass.jpg", scene);
    ground.material.diffuseTexture.uScale = 200;
    ground.material.diffuseTexture.vScale = 200;
    new BABYLON.PhysicsAggregate(
        ground,
        BABYLON.PhysicsShapeType.BOX,
        { mass: 0, restitution: 0.2},
        scene
    );

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

        // Mound
        const mound = BABYLON.MeshBuilder.CreateCylinder("mound", {
            diameterTop: 0, diameterBottom: 5.48, height: 0.254, tessellation: 32
        }, scene);
        mound.position = new BABYLON.Vector3(-18.44 + 0.305, 0.127, 0);
        mound.material = new BABYLON.StandardMaterial("moundMat", scene);
        mound.material.diffuseColor = new BABYLON.Color3.FromHexString("#f4a460");

        // Batter Box
        const batterBox = BABYLON.MeshBuilder.CreateCylinder("batterBox", {
            diameterTop: 5, diameterBottom: 5, height: 0.02, tessellation: 32
        }, scene);
        batterBox.material = new BABYLON.StandardMaterial("batterBoxMat", scene);
        batterBox.material.diffuseTexture = new BABYLON.Texture("./model/sand.jpg", scene);
        batterBox.material.diffuseTexture.uScale = 10
        batterBox.material.diffuseTexture.vScale = 10;
        const height = 3; // フェンスの高さ
        const degrees = 95; // 角度の範囲
        const step = degrees / 300; // 細かさ調整

        const controlPoints = [
            { angle: 130, radius: 90 },
            { angle: 135, radius: 90 },
            { angle: 180, radius: 90 },
            { angle: 225, radius: 90 },
            { angle: 230, radius: 90 }
        ];

        // Strike Zone
        const strikeZone = BABYLON.MeshBuilder.CreateBox("strikeZone", { width: 0.05, height: 0.5, depth: 0.5 }, scene);
        strikeZone.position.y = 1;  // キャッチャー前の適切な高さに配置
        strikeZone.position.x = 0;  // バッターとピッチャーの間
        const strikeZoneMaterial = new BABYLON.StandardMaterial("strikeZoneMat", scene);
        strikeZoneMaterial.diffuseColor = new BABYLON.Color3(0, 0, 1);  // 青
        strikeZoneMaterial.alpha = 0.7;  // 透過率 (0: 完全透明, 1: 不透明)
        strikeZone.material = strikeZoneMaterial;

        // Catmull-Romスプラインによる補間
        function interpolateControlPoints(points, t) {
            const p0 = points[Math.max(0, Math.floor(t) - 1)];
            const p1 = points[Math.max(0, Math.floor(t))];
            const p2 = points[Math.min(points.length - 1, Math.floor(t) + 1)];
            const p3 = points[Math.min(points.length - 1, Math.floor(t) + 2)];

            const tt = t - Math.floor(t);
            const tt2 = tt * tt;
            const tt3 = tt2 * tt;

            const q0 = -tt3 + 2 * tt2 - tt;
            const q1 = 3 * tt3 - 5 * tt2 + 2;
            const q2 = -3 * tt3 + 4 * tt2 + tt;
            const q3 = tt3 - tt2;

            const angle = 0.5 * (q0 * p0.angle + q1 * p1.angle + q2 * p2.angle + q3 * p3.angle);
            const radius = 0.5 * (q0 * p0.radius + q1 * p1.radius + q2 * p2.radius + q3 * p3.radius);

            return { angle, radius };
        }

        // フェンスの形状を定義
        const paths = [];
        const totalLength = controlPoints.reduce((acc, point, idx, arr) => {
            if (idx > 0) {
                const prev = arr[idx - 1];
                const dist = Math.sqrt(
                    Math.pow(point.radius * Math.cos(BABYLON.Tools.ToRadians(point.angle)) - prev.radius * Math.cos(BABYLON.Tools.ToRadians(prev.angle)), 2) +
                    Math.pow(point.radius * Math.sin(BABYLON.Tools.ToRadians(point.angle)) - prev.radius * Math.sin(BABYLON.Tools.ToRadians(prev.angle)), 2)
                );
                return acc + dist;
            }
            return acc;
        }, 0);

        for (let i = 15; i <= 75; i += step) {
            const t = (i / degrees) * (controlPoints.length - 1);
            const { angle, radius } = interpolateControlPoints(controlPoints, t);

            const x = radius * Math.cos(BABYLON.Tools.ToRadians(angle));
            const z = radius * Math.sin(BABYLON.Tools.ToRadians(angle));

            paths.push([
                new BABYLON.Vector3(x, 0, z),
                new BABYLON.Vector3(x, height, z)
            ]);
        }

        // フェンスを作成
        const fence = BABYLON.MeshBuilder.CreateRibbon("fence", { pathArray: paths, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, scene);

        // UV マッピング
        const positions = fence.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        const uvData = [];
        let accumulatedLength = 0;

        for (let i = 0; i < positions.length; i += 6) {
            const x1 = positions[i];
            const x2 = positions[i + 3];

            const segmentLength = Math.abs(x2 - x1);
            accumulatedLength += segmentLength;
            const u = accumulatedLength / totalLength;

            uvData.push(u - segmentLength / totalLength, 0);
            uvData.push(u - segmentLength / totalLength, 1);
            uvData.push(u, 0);

            uvData.push(u - segmentLength / totalLength, 1);
            uvData.push(u, 1);
            uvData.push(u, 0);
        }
        fence.setVerticesData(BABYLON.VertexBuffer.UVKind, uvData);

        // 法線の再計算
        BABYLON.VertexData.ComputeNormals(positions, fence.getIndices(), fence.getVerticesData(BABYLON.VertexBuffer.NormalKind));

        // マテリアル適用
        const fenceMaterial = new BABYLON.StandardMaterial("fenceMat", scene);
        fenceMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        fenceMaterial.emissiveColor = new BABYLON.Color3(0.5, 0.25, 0);
        fenceMaterial.backFaceCulling = false; // 両面表示
        fence.material = fenceMaterial;
        new BABYLON.PhysicsAggregate(
            fence,
            BABYLON.PhysicsShapeType.MESH,
            { mass: 0 },
            scene
        );

    };

    // Call function to load the field
    loadBaseball();

    //選手モーション
    let animationGroups = {"Pitcher": {}, "Batter": {}}
    let hand = null;
    let batter = null;

    let pitcher = null;
    BABYLON.SceneLoader.ImportMesh("", "./model/motion/", "baseball-bat-motion.glb", scene, function (meshes, particleSystems, skeletons, animationGroupsArray) {
        if (meshes.length > 0) {
            batter = meshes[0];
            batter.position = new BABYLON.Vector3(0, 0, - 0.75);
            batter.rotation = new BABYLON.Vector3(0, Math.PI/2, 0);
            
            animationGroupsArray.forEach(animGroup => {
                animationGroups["Batter"][animGroup.name] = animGroup;
            });
            if (skeletons.length > 0) {
                const skeleton = skeletons[0];
                hand = skeleton.bones.find(bone => bone.name === "mixamorig:LeftHand");
            }
            animationGroups["Batter"]["Hit"].speedRatio = 2;
            
            if (animationGroups["Batter"]["Hit"])
                animationGroups["Batter"]["Hit"].play(false);
            if (animationGroups["Batter"]["Idle"])
                animationGroups["Batter"]["Idle"].play(true); // idleアニメーションをループ再生
        }
    });

    BABYLON.SceneLoader.ImportMesh("", "./model/motion/", "baseball-pitch-motion.glb", scene, function (meshes, particleSystems, skeletons, animationGroupsArray) {
        if (meshes.length > 0) {
            pitcher = meshes[0];
            pitcher.position = new BABYLON.Vector3(-18.48, 0.3, 0);
            pitcher.rotation = new BABYLON.Vector3(0, - Math.PI / 2, 0);
            
            animationGroupsArray.forEach(animGroup => {
                animationGroups["Pitcher"][animGroup.name] = animGroup;
                animationGroups["Pitcher"][animGroup.name].speedRatio = 2;
            });

            if (animationGroups["Pitcher"]["Idle"])
                animationGroups["Pitcher"]["Idle"].play(false);
            if (animationGroups["Pitcher"]["Idle"])
                animationGroups["Pitcher"]["Idle"].play(true); // idleアニメーションをループ再生
        }
    });
    let ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 0.25 }, scene);
    ball.position = new BABYLON.Vector3(-18.44, -1, 0);
    let ballSpeed = new BABYLON.Vector3.Zero();
    let isHit = false;
    let ballPhysics;

    const startPitchAnimation = () => {
        if (trial < MAX_TRIAL[level] && isGameStart) {
            ball.position = new BABYLON.Vector3(-18.44, -1, 0);
            strike = false;
            land = false;
            cameraDelta = 0;
            if (animationGroups["Pitcher"]["Pitch"]) {
                animationGroups["Pitcher"]["Pitch"].play(false);
                animationGroups["Pitcher"]["Pitch"].onAnimationEndObservable.addOnce(()=>{
                    animationGroups["Pitcher"]["Idle"].play(false);
                })
                scene.onBeforeRenderObservable.add(checkThrowTiming);
            }
        }
    };
    
    let pitchIntervalId = setInterval(startPitchAnimation, 5000);
    
    const checkThrowTiming = () =>{
        if (animationGroups["Pitcher"]["Pitch"]) {
            if (!animationGroups["Pitcher"]["Pitch"].targetedAnimations[0].animation.runtimeAnimations[0]) return;

            const currentFrame = animationGroups["Pitcher"]["Pitch"].targetedAnimations[0].animation.runtimeAnimations[0].currentFrame;
            const THROW_FRAME = 120;
            if (Math.abs(currentFrame - THROW_FRAME) < 1) {
                scene.onBeforeRenderObservable.remove(checkThrowTiming);
                throwBall();
            }
        }
    }

    const throwBall = () => {
        if (ballPhysics) {
            ballPhysics.dispose();
            ballPhysics = new BABYLON.PhysicsAggregate(
                ball,
                BABYLON.PhysicsShapeType.SPHERE,
                { mass: 0},
                scene
            );
        }
        ball.position = new BABYLON.Vector3(-18.48, 1, 0);
        if (level == "BEGINNER" || level == "HARD") {
            ballSpeed = new BABYLON.Vector3(0.15, 0, 0);
        }
        else if (level == "EASY" || level == "MEDIUM" || level == "ROBIKASU") {
            ballSpeed = new BABYLON.Vector3(0.25, 0, 0);
        }
        isHit = false;
        throwBGM.play();
    }

    scene.onBeforeRenderObservable.add(() => {
        if (hand) {
            bat.position.copyFrom(hand.getTransformNode().absolutePosition.addInPlace(new BABYLON.Vector3(-0., 0.3, 0)));
        }
        //まきゅう1
        ball.isVisible = ((level == "MEDIUM" || level == "ROBIKASU") && ball.position.x > -5.0)? false: true;
        //まきゅう2
        ballSpeed.x = ((level == "HARD" || level == "ROBIKASU") && ballSpeed.x > 0)? Math.min(0.3, Math.max(0.02, ballSpeed.x + ((Math.random() -0.5) * 0.1))) :ballSpeed.x;
        
        if (!isHit && ball && isGameStart) {
            ball.position.addInPlace(ballSpeed);
            // バットとの衝突判定
            if (ball.intersectsMesh(bat2, true)) {
                ballPhysics = new BABYLON.PhysicsAggregate(
                    ball,
                    BABYLON.PhysicsShapeType.SPHERE,
                    { mass: 1, restitution: 0.55},
                    scene
                );
                isHit = true;
                hitBGM.play();
                ball.isVisible = true;
                
                const angle = Math.atan2(-ball.position.x, 1);
                const bonus = Math.abs(ball.position.x) < 0.4? 2.6 + Math.random() / 2: 1 + Math.random();
                console.log(ball.position.x, bonus);
                const HEIGHT_SCALE = Math.max(10, 10 * bonus / 1.5);
                const DIR_SCALE = 10 * bonus;
                const POWER_SCALE = 10 * bonus;
                ballPhysics.body.applyImpulse(new BABYLON.Vector3(-POWER_SCALE, HEIGHT_SCALE, -DIR_SCALE * Math.sin(angle)), ball.getAbsolutePosition() );
                clearInterval(pitchIntervalId);
                isCameraFollow = true;

                pitchIntervalId = setInterval(startPitchAnimation, 9000);
            }
        }
        
        cameraDelta += engine.getDeltaTime();
        //ボールが当たらなかった
        if (3 < ball.position.x) {
            if (!strike && ball.position.x < 4) {
                resultBlock.text = "STRIKE";
                strike = true;
                if (isGameStart) {
                    trial += 1;
                    updateScore();
                }
                clearInterval(pitchIntervalId);
                pitchIntervalId = setInterval(startPitchAnimation, 5000);
            }
            
            if (strike && cameraDelta > 4000)  {
                resultBlock.text = "";
                ball.position = new BABYLON.Vector3(-18.44, -1, 0);
                ballSpeed = new BABYLON.Vector3.Zero();
                if (trial == MAX_TRIAL[level]) showResult();
            }
        }

        //当たった
        if (isCameraFollow) {
            camera.target = ball.position.clone();  // ボールを中心に
            camera.radius = 10;
            //判定
            if (ball.position.y < 0.2 && !land) {
                const distance= BABYLON.Vector3.Distance(ball.position, new BABYLON.Vector3.Zero()).toFixed(2);
                if (distance > 90) {
                    resultBlock.text = "HOMERUN!\n (" + distance.toString() + " m)";
                    homerun_num += 1;
                    homerunBGM.play();
                } else {
                    missBGM.play();
                }
                land = true;
                trial += 1;
                updateScore();
            }
            if (cameraDelta > 8000) {
                resultBlock.text = "";
                isCameraFollow = false;
                camera.target = new BABYLON.Vector3(0, 1, 0);
                camera.radius = 5;
                camera.position = cameraBase;
                if (trial == MAX_TRIAL[level]) showResult();
            }
        }
    });
    
    // バットをスイングするアニメーション
    window.addEventListener("keydown", (event) =>  {
        if (event.key === " ") { // スペースキーでスイング
            const anim = new BABYLON.Animation("swing", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            
            const keys = [];
            keys.push({ frame: 0, value: new BABYLON.Vector3(-Math.PI/4, 0, 0) });
            keys.push({ frame: 5, value: new BABYLON.Vector3( Math.PI/1.5, 0, 0) });
            keys.push({ frame: 10, value: new BABYLON.Vector3(-Math.PI/6, -Math.PI/4, -Math.PI/4) });
            
            anim.setKeys(keys);
            bat.animations = [anim];
            scene.beginAnimation(bat, 0, 20, false);

            const anim_2 = new BABYLON.Animation("swing2", "rotation.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            const keys_2 = [];
            keys_2.push({ frame: 0, value: Math.PI/2 });
            keys_2.push({ frame: 5, value: -Math.PI / 2 });
            keys_2.push({ frame: 20, value: Math.PI / 2 });
            anim_2.setKeys(keys_2);
            bat2.animations = [anim_2];
            scene.beginAnimation(bat2, 0, 20, false);

            if (animationGroups["Batter"]["Idle"]) {
                animationGroups["Batter"]["Idle"].stop();
            }
            animationGroups["Batter"]["Hit"].play(false);
            swingBGM.play();
            animationGroups["Batter"]["Hit"].onAnimationEndObservable.addOnce(()=>{
                animationGroups["Batter"]["Idle"].play(true);
                bat.rotation = new BABYLON.Vector3(-Math.PI/4, 0, 0);
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