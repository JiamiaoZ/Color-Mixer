//@input SceneObject textObject1
//@input Component.Text textComponent

//@input SceneObject textObject2
//@input Component.Text textComponent2

//@input SceneObject paletteObject
//@input Component.Image paletteImage

//@input SceneObject stageObject
//@input Component.Text stageText

//@input SceneObject scoreObject
//@input Component.Text scoreText

script.textComponent.text = "TAP TO START";
script.textComponent2.text = "GUESS THE MIXED COLOR!";
script.paletteImage.enabled = false;

script.stageText.text = "1/5";
script.scoreText.text = "SCORE:0";
script.stageText.enabled = false;
script.scoreText.enabled = false;

var disappearDuration = 0.3;
var pulseSpeed = 3;
var swayAngle = 0.1;

var tapped = false;
var gameStarted = false;
var paletteShown = false;
var time = 0;

var t1 = script.textObject1.getTransform();
var t2 = script.textObject2.getTransform();
var paletteT = script.paletteObject.getTransform();
var stageT = script.stageObject.getTransform();
var scoreT = script.scoreObject.getTransform();

var startScale1 = t1.getLocalScale();
var startScale2 = t2.getLocalScale();

var tempScale = new vec3(0, 0, 0);

paletteT.setLocalScale(vec3.zero());
stageT.setLocalScale(vec3.zero());
scoreT.setLocalScale(vec3.zero());

function onTap() {
    if (tapped) return;
    tapped = true;
    time = 0;
}

script.createEvent("TapEvent").bind(onTap);

function enlarge(transform, target, dt) {
    var s = transform.getLocalScale().x;
    if (s >= target) return;

    var newScale = Math.min(s + dt * 3, target);
    tempScale.x = tempScale.y = tempScale.z = newScale;
    transform.setLocalScale(tempScale);
}

function onUpdate() {
    var dt = getDeltaTime();

    if (tapped && script.textComponent.enabled) {
        time += dt;
        var t = Math.min(time / disappearDuration, 1);
        var s = 1 - t;

        tempScale.x = startScale1.x * s;
        tempScale.y = startScale1.y * s;
        tempScale.z = startScale1.z * s;
        t1.setLocalScale(tempScale);

        if (t >= 1) {
            script.textComponent.enabled = false;
            gameStarted = true;
        }
    }

    if (gameStarted) {
        script.paletteImage.enabled = true;
        enlarge(paletteT, 1, dt);
        paletteShown = true;
    }

    if (paletteShown) {
        script.stageText.enabled = true;
        script.scoreText.enabled = true;

        enlarge(stageT, 0.4, dt);
        enlarge(scoreT, 0.6, dt);
    }

    var phase = getTime() * pulseSpeed;
    var sway = Math.sin(phase);
    var pulse = 1 + Math.sin(phase * 2) * 0.1;

    tempScale.x = startScale2.x * pulse;
    tempScale.y = startScale2.y * pulse;
    tempScale.z = startScale2.z * pulse;
    t2.setLocalScale(tempScale);

    var rot = quat.fromEulerAngles(0, 0, sway * swayAngle);
    t1.setLocalRotation(rot);
    t2.setLocalRotation(rot);
}

script.createEvent("UpdateEvent").bind(onUpdate);
