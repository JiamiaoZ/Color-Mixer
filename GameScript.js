//@input SceneObject stageObject
//@input Component.Text stageText

//@input SceneObject scoreObject
//@input Component.Text scoreText

//@input SceneObject paletteObject
//@input Component.Image paletteImage

//@input SceneObject[] circleObjects
//@input Component.Image[] circleImages

//@input SceneObject inputColorObj
//@input Asset.Material inputMaterial
//@input Asset.Texture inputTex

// @input vec3 color
// @input SceneObject colorWheelComponent

//@input SceneObject confirmObject
//@input Component.Text confirmText

//@input SceneObject revealObject
//@input Component.Image revealImage

//@input SceneObject percentageObj
//@input Component.Text percentageTxt

//@input Component.ScriptComponent leaderboard

print(script.colorWheelComponent.wheelValue); //Outputs selected color
script.colorWheelComponent.wheelValue = script.color; //Updates color wheel and its target objects

script.colorWheelComponent.pickCallbacks = () => changeInputMaterial();
//script.colorWheelComponent.pickCallbacks = () => print("func 2");

print(script.colorWheelComponent.pickCallbacks); // Output: pickCallbacks object

var tempScale = new vec3(0, 0, 0);

var currentStage = 1;
var currentScore = 0;
var circleColor = null;

var stageTriggered = false;
var stageColors = [];
var stageTime = 0;
var inputClicked = false;
var scoreUpdated = false;
var scoreSubmitted = false;

var GameState = {
    WAIT: 0,
    START: 1,
    PLAYING: 2,
    END: 3
    };

var gameState = GameState.WAIT;

var inputTransform = script.inputColorObj.getTransform();
var initInputScale = inputTransform.getLocalScale();

script.confirmText.text = "OK!";

script.stageText.enabled = false;
script.scoreText.enabled = false;
script.confirmText.enabled = false;
script.percentageTxt.enabled = false;

script.colorWheelComponent.enabled = false;

/*script.circleImages.forEach((circle) => {
    circle.enabled = false;
});
script.circleObjects.forEach((circle) => {
    var circleTransform = circle.getTransform();
    circleTransform.setLocalScale(new vec3(0, 0, 0));
})*/
for (var i = 0; i < script.circleImages.length; i++) {
    script.circleImages[i].enabled = false;
}

for (var i = 0; i < script.circleObjects.length; i++) {
    var circleTransform = script.circleObjects[i].getTransform();
    circleTransform.setLocalScale(tempScale);
}

script.revealImage.enabled = false;

/*for (var i = 0; i < script.circleImages.length; i++) {
    var img = script.circleImages[i];

    var mat = img.mainPass.material;
    img.mainPass.material = mat.clone();

    img.enabled = false;
}*/

var paletteTransform = script.paletteObject.getTransform();

var stageTransform = script.stageObject.getTransform();
stageTransform.setLocalScale(tempScale);
var scoreTransform = script.scoreObject.getTransform();
scoreTransform.setLocalScale(tempScale);

var wheelTransform = script.colorWheelComponent.getTransform();
wheelTransform.setLocalScale(tempScale);

function enlarge(transform, target, dt) {
    var currentScale = transform.getLocalScale();

    if (currentScale.x < target) {
        var growSpeed = 3;
        var delta = growSpeed * dt;

        var newScale = Math.min(currentScale.x + delta, target);

        transform.setLocalScale(
            new vec3(newScale, newScale, newScale)
        );
    }
}

function randomColor() {
    return new vec4(
        Math.random(),
        Math.random(),
        Math.random(),
        1
    );
}

var changedInputMaterial = false;
function changeInputMaterial() {
    var img = script.inputColorObj.getComponent("Component.Image");
    if(!changedInputMaterial){
        img.mainPass.baseTex = null;
        img.mainPass.baseTex = script.inputTex;
        img.mainPass.material = script.inputMaterial;

        changedInputMaterial = true;
        script.confirmText.enabled = true;
        print("material swapped");
    }
}

function hsvToRgb(h, s, v) {
    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: return new vec4(v, t, p, 1);
        case 1: return new vec4(q, v, p, 1);
        case 2: return new vec4(p, v, t, 1);
        case 3: return new vec4(p, q, v, 1);
        case 4: return new vec4(t, p, v, 1);
        case 5: return new vec4(v, p, q, 1);
    }
}

function generateStageColor(stage) {
    var hue;
    var sat;
    var val;

    if (stage === 1) {
        var baseHues = [0, 0.16, 0.33, 0.5, 0.66, 0.83];
        hue = baseHues[Math.floor(Math.random() * baseHues.length)];
        sat = 1;
        val = 1;
    }
    else if (stage === 2) {
        hue = Math.random();
        sat = 0.85 + Math.random() * 0.15;
        val = 1;
    }
    else if (stage === 3) {
        hue = Math.random();
        sat = 0.6 + Math.random() * 0.4;
        val = 1;
    }
    else if (stage === 4) {
        hue = Math.random();
        sat = 0.5 + Math.random() * 0.5;
        val = 0.85 + Math.random() * 0.15;
    }
    else {
        hue = Math.random();
        sat = Math.random();
        val = Math.random();
    }

    return hsvToRgb(hue, sat, val);
}

function generateStageColors(count) {
    stageColors = [];

    for (var i = 0; i < count; i++) {
        stageColors.push(generateStageColor(currentStage));
    }
}

function showCircles() {
    for (var i = 0; i < currentStage + 1; i++) {
        var obj = script.circleObjects[i];
        var img = script.circleImages[i];

        obj.enabled = true;
        img.enabled = true;

        if(i != 5){ //can use length here too
            img.mainPass.baseColor = stageColors[i];
        }
    }
    script.inputColorObj.enabled = true;
    script.inputColorObj.getComponent("Component.Image").enabled = true;
}

var circleDelays = [0, 0.05, 0.1, 0.15, 0.2, 0.25];
function animateCircles(dt) {
    stageTime += dt;

    for (var i = 0; i < script.circleObjects.length; i++) {
        if(stageTime < circleDelays[i]){
            continue;
        }

        enlarge(script.circleObjects[i].getTransform(), 0.35, dt);
    }
}

function mixColors() {
    var storedColors = [];
    for(var i = 0; i < currentStage + 1; i++){

        storedColors[i] = stageColors[i];
    }

    var r = 0, g = 0, b = 0;

    for (var i = 0; i < storedColors.length; i++) {
        r += storedColors[i].x;
        g += storedColors[i].y;
        b += storedColors[i].z;
    }

    var count = storedColors.length;
    var mixed = new vec4(r / count, g / count, b / count, 1)
    print(mixed);
    script.revealImage.mainPass.baseColor = mixed;

    return mixed;
}

function colorMatchPercent(a, b) {
    var dr = a.x - b.x;
    var dg = a.y - b.y;
    var db = a.z - b.z;

    var distance = Math.sqrt(dr*dr + dg*dg + db*db);
    var maxDistance = Math.sqrt(3);

    var match = 1 - (distance / maxDistance);
    match = Math.max(0, Math.min(1, match));

    return match * 100;
}

function endStage() {
    stageColors = null;
    currentStage++;
    script.revealImage.enabled = false;
    script.percentageTxt.enabled = false;
    script.confirmText.text = "OK!";

    for (var i = 0; i < script.circleImages.length; i++) {
        script.circleImages[i].enabled = false;
    }

    for (var i = 0; i < script.circleObjects.length; i++) {
        var circleTransform = script.circleObjects[i].getTransform();
        circleTransform.setLocalScale(tempScale);
    }
    gameState = GameState.START;
}

function submitIfHighScore(currentScore) {
    //eh, wanted to do score storage stuff but might not work
    script.leaderboard.onLeaderboardRecordsUpdated.addOnce(function (recordsWrapper) {
    
    var previousRecord = recordsWrapper.currentUserRecord;
    var previousScore = 0;

    if (previousRecord && previousRecord.score !== undefined) {
        previousScore = previousRecord.score;
    }

    print("Previous best score: " + previousScore);

    if (currentScore > previousScore) {

        script.leaderboard.submitScoreAsync(currentScore)
            .then(function () {
                print("New high score submitted: " + currentScore);
            })
            .catch(function (err) {
                print("Failed to submit: " + err);
            });

    } else {
        print("Not a high score, submission skipped");
    }
});

}

function onUpdate() {
    if (!stageTriggered && paletteTransform.getLocalScale().x >= 1) {
        stageTriggered = true;
        gameState = GameState.START;
    }

    var dt = getDeltaTime();

    if (gameState === GameState.START) {
        stageTime = 0;
        changedInputMaterial = false;
        scoreUpdated = false;
        script.stageText.text = currentStage + "/5";

        generateStageColors(script.circleObjects.length);
        showCircles();

        gameState = GameState.PLAYING;
    }

    if (gameState === GameState.PLAYING) {
        animateCircles(dt);

        var c = script.colorWheelComponent.wheelValue;
        script.circleImages[5].mainPass.baseColor =
        new vec4(c.x, c.y, c.z, 1);
    }

    if(gameState === GameState.END){
        script.colorWheelComponent.enabled = false;
        for (var i = 0; i < script.circleObjects.length - 1; i++) {
            script.circleImages[i].enabled = false;
        }
        script.revealImage.enabled = true;
        mixColors();

        var percentage = colorMatchPercent(script.circleImages[5].mainPass.baseColor, mixColors());
        script.percentageTxt.text = Math.round(percentage).toString() + "%";
        script.percentageTxt.enabled = true;

        if(!scoreUpdated){
            var tempScore = currentScore + Math.round(percentage * 100);
            currentScore = tempScore;
            script.scoreText.text = "SCORE: " + tempScore.toString();
            scoreUpdated = true;
        }
        if (currentStage != 5) {
            script.confirmText.text = "NEXT";
        } else {
            gameState = GameState.WAIT;
        }
    }

    if (gameState === GameState.WAIT && currentStage == 5 && !scoreSubmitted) {
        script.confirmText.text = "Restart";
        /*script.Leaderboard.submitScoreAsync(currentScore);
        script.Leaderboard.onScoreSubmittedSuccess.addOnce(() => {
            print("Score submitted successfully");
        })*/
        submitIfHighScore(currentScore);
        scoreSubmitted = true;
    }

    if (inputClicked) {
        script.colorWheelComponent.enabled = true;
        enlarge(script.colorWheelComponent.getTransform(), 1, dt);
    } else {
        script.colorWheelComponent.enabled = false;
        wheelTransform.setLocalScale(tempScale);

        var pulse = Math.sin(getTime() * 6);
        var pulseScale = 1 + pulse * 0.05;

        inputTransform.setLocalScale(
            new vec3(
                initInputScale.x * pulseScale,
                initInputScale.y * pulseScale,
                initInputScale.z * pulseScale
            )
        );
    }
}

var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(onUpdate);

function onTap(eventData){
    var tapPosition = eventData.getTapPosition();

    var screenTransform = script.circleObjects[5].getComponent("Component.ScreenTransform");

    if (script.circleImages[5].enabled && screenTransform.containsScreenPoint(tapPosition) && gameState === GameState.PLAYING) {
        inputClicked = true;
    } else {
        inputClicked = false;
    }

    var screenTransform2 = script.confirmObject.getComponent("Component.ScreenTransform");
    if(script.confirmText.enabled && screenTransform2.containsScreenPoint(tapPosition)){
        if(script.confirmText.text == "OK!"){
            gameState = GameState.END;
        } else if (script.confirmText.text == "NEXT"){
            endStage();
        } else if (script.confirmText.text == "Restart") {
            
            currentStage = 1;
            currentScore = 0;
            circleColor = null;

            stageTriggered = false;
            stageColors = [];
            stageTime = 0;
            inputClicked = false;
            scoreUpdated = false;
            scoreSubmitted = false;

            script.confirmText.text = "OK!";
            script.scoreText.text = "Score: 0";

            script.stageText.enabled = false;
            script.scoreText.enabled = false;
            script.confirmText.enabled = false;
            script.percentageTxt.enabled = false;

            script.colorWheelComponent.enabled = false;

            for (var i = 0; i < script.circleImages.length; i++) {
                script.circleImages[i].enabled = false;
            }

            for (var i = 0; i < script.circleObjects.length; i++) {
                var circleTransform = script.circleObjects[i].getTransform();
                circleTransform.setLocalScale(tempScale);
            }

            script.revealImage.enabled = false;

            stageTransform.setLocalScale(tempScale);
            scoreTransform.setLocalScale(tempScale);
            wheelTransform.setLocalScale(tempScale);

            changedInputMaterial = false;

            gameState = GameState.START;
        }
    }
}
var tapEvent = script.createEvent("TapEvent");
tapEvent.bind(onTap);
