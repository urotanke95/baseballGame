const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    
    const camera = new BABYLON.ArcRotateCamera("camera", 0, Math.PI / 3, 20, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 20, height: 20 }, scene);
    
    // バットを作成
    const bat = BABYLON.MeshBuilder.CreateCylinder("bat", { height: 3, diameter: 0.3 }, scene);
    const axes = new BABYLON.Debug.AxesViewer(scene, 2)
    bat.position = new BABYLON.Vector3(0, -0.5, -2);
    bat.rotation = new BABYLON.Vector3(-Math.PI/2, Math.PI/2 , 0);
    bat.setPivotPoint(new BABYLON.Vector3(0, 1.5, 0)); // バットの先端を回転中心に
    
    let ball;
    let ballSpeed;
    let isHit = false;

    const spawnBall = () => {
        if (ball) {
            ball.dispose();
        }
        ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 0.5 }, scene);
        ball.position = new BABYLON.Vector3(-5, 1, 0);
        ballSpeed = new BABYLON.Vector3(0.1, 0, 0);
        isHit = false;
    };
    
    spawnBall();
    setInterval(spawnBall, 3000);
    
    scene.onBeforeRenderObservable.add(() => {
        if (!isHit && ball) {
            ball.position.addInPlace(ballSpeed);
            
            // バットとの衝突判定
            if (ball.intersectsMesh(bat, true)) {
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
            const anim = new BABYLON.Animation("swing", "rotation.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            
            const keys = [];
            keys.push({ frame: 0, value: Math.PI/2 });
            keys.push({ frame: 10, value: - Math.PI / 2 });
            keys.push({ frame: 20, value: Math.PI / 2 });
            
            anim.setKeys(keys);
            bat.animations = [anim];
            scene.beginAnimation(bat, 0, 20, false);
        }
    });
    
    return scene;
};

const scene = createScene();
engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener("resize", () => {
    engine.resize();
});
