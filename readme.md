## Cube counting game


The game trains the ability to calculate the amount of cubes at the specified amount of time (10s by default).
This game was created with help of HTML5 canvas feature.

You must enter proper amount of cubes in the input field.

Canvas object must be passed to the constructor call of the function 
```javascript
var cubeGames = new CubeGame(canvasElement, {startX: 200, startY: 200, attempts: 3});
```

startX and startY properties of config object specifies starting params for the cube blocks


By default game plays three times and displays record table. It can be altered with *attempts* option in config object

New game can be started with **Redraw** button 

[demo page](alex-volkov.github.io/cube-count-game)