/* TODO
 1. change the angle of the cubes +
 2. make records table
 3. make params field
 */
function CubeGame(canvasElement, config) {
	var self = this;
	self.canvas = canvasElement;
	self.ctx = this.canvas.getContext('2d');
	self.cubeCount = 0;
	self.firstPass = true;
	self.fields = [];
	self.isDebug = false;
	var defaults = {
		coeff: 20,
		startX: 100,
		startY: 200,
		lineIncrement: 10
	};
	self.config = _.extend(defaults, config);


	function drawCube(leftTopX, leftTopY) {
		ctx = self.ctx;
		ctx.fillStyle = 'white';
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 2;
		// first side
		ctx.fillStyle = '#eee';
		ctx.beginPath();
		ctx.moveTo(leftTopX, leftTopY);
		ctx.lineTo(leftTopX + 1.8 * self.config.coeff, leftTopY + 1 * self.config.coeff);
		ctx.lineTo(leftTopX + 1.8 * self.config.coeff, leftTopY + 3.5 * self.config.coeff);
		ctx.lineTo(leftTopX, leftTopY + 2.5 * self.config.coeff);
		ctx.lineTo(leftTopX, leftTopY);
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
		// second side
		ctx.beginPath();
		ctx.fillStyle = '#fff';
		ctx.lineTo(leftTopX + 2.2 * self.config.coeff, leftTopY - 1 * self.config.coeff);
		ctx.lineTo(leftTopX + 4 * self.config.coeff, leftTopY);
		ctx.lineTo(leftTopX + 1.8 * self.config.coeff, leftTopY + 1 * self.config.coeff);
		ctx.lineTo(leftTopX, leftTopY);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		// third side
		ctx.beginPath();
		ctx.fillStyle = '#ccc';
		ctx.moveTo(leftTopX + 4 * self.config.coeff, leftTopY);
		ctx.lineTo(leftTopX + 4 * self.config.coeff, leftTopY + 2.5 * self.config.coeff);
		ctx.lineTo(leftTopX + 1.8 * self.config.coeff, leftTopY + 3.5 * self.config.coeff);
		ctx.lineTo(leftTopX + 1.8 * self.config.coeff, leftTopY + 1 * self.config.coeff);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		self.cubeCount++;
	}

	function fillLine(width) {
		var res = [];
		for (var cnt = 0; cnt < width; cnt++) {
			if(!self.isDebug){
				res.push(Math.round(Math.random() * 1));
			}else{
				res.push(1);
			}
		}
		return res;
	}

	function fillFields(fieldWidth, lineWidth, numberOfFields) {
		// from far side
		var res = [], tmpField;
		for (var i = 0; i < numberOfFields; i++) {
			tmpField = [];
			for (var cnt = 0; cnt < fieldWidth; cnt++) {
				tmpField.push(fillLine(lineWidth))
			}
			res.push(tmpField);
		}
		return res;
	}

	function drawLine(line, lineStart) {
		var lineStartCloned = _.clone(lineStart);
		for (var cnt = 0; cnt < line.length; cnt++) {
			var item = line[cnt];
			if (!!item) {
				drawCube(lineStartCloned.x, lineStartCloned.y)
			}
			lineStartCloned.x += 4 * self.config.lineIncrement;
			lineStartCloned.y += 2 * self.config.lineIncrement;
		}
	}

	function drawField(field, startCoords) {
		startCoords = _.clone(startCoords);
		for (var cnt = 0; cnt < field.length; cnt++) {
			drawLine(field[cnt], startCoords);
			startCoords.x -= 40;
			startCoords.y += 20;
		}
	}

	function drawFields(inFields) {
		self.cubeCount = 0;
		self.fields = _.clone(inFields);
		//self.fields = inFields;
		var fieldYIncrement = 50;
		var startCoords = {x: self.config.startX, y: self.config.startY};
		for (var cnt = 0; cnt < self.fields.length; cnt++) {
			var field = self.fields[cnt];
			if (cnt > 0) {
				// check for lower levels
				for (var lineCount = 0; lineCount < field.length; lineCount++) {
					var line = field[lineCount];
					for (var cellCount = 0; cellCount < line.length; cellCount++) {
						var thisRowCell = self.fields[cnt][lineCount][cellCount];
						var prevRowCell = self.fields[cnt - 1][lineCount][cellCount];
						// lower cell is 0 so we remove upper one
						if (thisRowCell && !prevRowCell) {
							self.fields[cnt][lineCount][cellCount] = prevRowCell
						}

						// current cell is 0 but lower is not and there is something in front
						if (
							!thisRowCell &&
							prevRowCell &&
							(lineCount + 1) <= field.length - 1 &&
							(cellCount + 1) <= line.length - 1 &&

							self.fields[cnt][lineCount + 1][cellCount + 1]) {
							self.fields[cnt][lineCount][cellCount] = 1
						}
					}

				}
				//	if no row in front but one next and one at the next row in same position
				for (var lineCount = 0; lineCount < field.length; lineCount++) {
					var line = field[lineCount];
					for (var cellCount = 0; cellCount < line.length; cellCount++) {
						var thisRowCell = self.fields[cnt][lineCount][cellCount];
						var prevRowCell = self.fields[cnt - 1][lineCount][cellCount];
						if (
							!thisRowCell &&
							prevRowCell &&
							(lineCount + 1) <= field.length - 1 &&
							(cellCount + 1) <= line.length - 1 &&
							self.fields[cnt][lineCount + 1][cellCount] &&
							self.fields[cnt][lineCount][cellCount + 1]
						) {
							self.fields[cnt][lineCount][cellCount] = 1
						}
					}
				}
			}
			drawField(field, startCoords);
			startCoords.y += -fieldYIncrement;
		}
		if (self.firstPass) {
			self.firstPass = false;
			drawFields(self.fields, {x: self.config.startX, y: self.config.startY});
			console.log(JSON.stringify(self.fields), getNumberOfCubes());
		}
	}

	function drawCubes(fieldWidth, lineWidth, numberOfFields, fields) {
		self.fieldWidth = fieldWidth;
		self.lineWidth = lineWidth;
		self.numberOfFields = numberOfFields;
		self.cubeCount = 0;

		self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
		self.fields = fillFields(fieldWidth, lineWidth, numberOfFields);
		// for debug
		if (!!fields) {
			self.fields = fields
		}
		self.firstPass = true;
		drawFields(self.fields);
		//progressWidth = self.canvas.width;
		//window.requestAnimationFrame(drawProgress);
		if (!self.isDebug) {
			drawProgress();

		}
		//writeCubeNumber();
	}

	function getNumberOfCubes() {
		return self.cubeCount;
	}

	function writeCubeNumber() {
		self.ctx.beginPath();
		self.ctx.font = '30px sans-serif';
		self.ctx.fillText(getNumberOfCubes(), self.canvas.width - 50, self.canvas.height - 50);
		self.ctx.closePath();
		//console.log(getNumberOfCubes());
	}

	function drawProgress() {
		var progressWidth = self.canvas.width;
		var ctx = self.ctx;
		var progressIncrement = progressWidth / 1000;
		clearInterval(self.progressInterval);
		self.progressInterval = setInterval(function () {
			ctx.clearRect(0, 0, self.canvas.width, 30);
			ctx.beginPath();
			ctx.fillStyle = 'rgba(255,0,0, .5)';
			ctx.rect(0, 0, progressWidth, 10);
			ctx.fill();
			ctx.closePath();
			progressWidth -= progressIncrement;
			//if(progressWidth > 0){
			//	window.requestAnimationFrame(drawProgress);
			//}
			if (progressWidth <= 0) {
				clearInterval(self.progressInterval);
				writeCubeNumber();
				ctx.clearRect(0, 0, self.canvas.width, 30);

				setTimeout(function () {
					drawCubes(self.fieldWidth, self.lineWidth, self.numberOfFields);
				}, 2000);
			}
		}, 10);
	}

	function saveStats() {

	}

	function checkAnswer(cubeNumber) {
		setTimeout(function () {
			drawCubes(self.fieldWidth, self.lineWidth, self.numberOfFields);
		}, 2000);
		if (!!self.progressInterval) {
			clearInterval(self.progressInterval);
		}
		writeCubeNumber();
		return cubeNumber == getNumberOfCubes();

	}


	//drawCubes(3,3,4, [field1, field2, field3]);
	//drawCubes(3,3,4, [[[1,1,0],[0,1,0],[0,1,0]],[[0,0,0],[0,0,1],[0,0,1]],[[1,0,1],[0,0,0],[0,1,0]]]);

	return {
		drawCubes: drawCubes,
		getNumberOfCubes: getNumberOfCubes,
		checkAnswer: checkAnswer
	}
}