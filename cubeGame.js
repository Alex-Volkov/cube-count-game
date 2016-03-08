/* TODO
 1. change the angle of the cubes +
 2. make records table +
 3. make params field
 */
function CubeGame(canvasElement, config) {
	var self = this;
	self.canvas = canvasElement;
	this.ctx = this.canvas.getContext('2d');
	self.cubeCount = 0;
	self.firstPass = true;
	self.fields = [];
	self.isDebug = false;
	self.attemptCount = 0;

	var defaults = {
		selectedProgressBar: 1,
		coeff: 20,
		startX: 100,
		startY: 200,
		lineIncrement: 10,
		attempts: 3
	};
	self.stats = [
		//{isSuccess: false, numberOfCubes: 3, time: 5000},
	];
	self.currentTime = 0;
	self.config = _.extend(defaults, config);

	self.drawProgress = new DrawProgress({
		canvas: canvasElement,
		ctx: this.ctx,
		progressTime: 10,
		selectedProgressBar: self.config.selectedProgressBar,
		onEndCallBack: function () {
			writeCubeNumber();
			saveStats(getNumberOfCubes(), false);
			setTimeout(function () {
				drawCubes(self.fieldWidth, self.lineWidth, self.numberOfFields);
			}, 2000);
		}
	});

	function drawCube(leftTopX, leftTopY) {
		ctx = self.ctx;
		ctx.fillStyle = 'white';
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 2;
		// first side
		ctx.fillStyle = '#777';
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
		ctx.fillStyle = '#aaa';
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
			if (!self.isDebug) {
				res.push(Math.round(Math.random() * 1));
			} else {
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
			//console.log(JSON.stringify(self.fields), getNumberOfCubes());
		}
	}

	function drawCubes(fieldWidth, lineWidth, numberOfFields, resetAttemptsCount) {
		if (!!resetAttemptsCount){
			self.attemptCount = 0;
		}
		self.fieldWidth = fieldWidth;
		self.lineWidth = lineWidth;
		self.numberOfFields = numberOfFields;
		self.cubeCount = 0;

		self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
		self.fields = fillFields(fieldWidth, lineWidth, numberOfFields);

		self.firstPass = true;
		if(self.attemptCount < self.config.attempts) {
			drawFields(self.fields);
			self.attemptCount++;
		}else{
			console.log('drawing stats');
			drawStatsChart();
			self.drawProgress.cancelProgress();
		}
		//progressWidth = self.canvas.width;
		//window.requestAnimationFrame(drawProgress);
		if (!self.isDebug && self.attemptCount <= self.config.attempts) {
			self.drawProgress.writeProgress();

		}
		//writeCubeNumber();
	}

	function getNumberOfCubes() {
		return self.cubeCount;
	}

	function writeCubeNumber(status) {
		self.ctx.beginPath();
		var statusText = '';
		if (typeof status != 'undefined') {
			if (status) {
				self.ctx.fillStyle = 'green';
				statusText = ' correct ';
			} else {
				statusText = ' incorrect ';
				self.ctx.fillStyle = 'red';
			}
		}
		self.ctx.font = '16px sans-serif';
		self.ctx.fillText(statusText + getNumberOfCubes(), self.canvas.width - 120, self.canvas.height - 50);
		self.ctx.closePath();
	}


	function saveStats(numberOfCubes, isSuccess) {
		self.stats.push({
			time: self.drawProgress.getCurrentTime(),
			numberOfCubes: numberOfCubes,
			isSuccess: isSuccess,
			matrix: JSON.stringify(self.fields)
		});
	}

	function drawStats() {
		var tmpStats = _.clone(self.stats);
		var ctx = self.ctx;
		tmpStats = tmpStats.splice(tmpStats.length - 5, 5);
		ctx.fillStyle = 'rgba(0,0,0,1)';
		ctx.font = '22px sans-serif';
		// caption
		ctx.fillText('Records', self.canvas.width - 120, 70);
		var x = self.canvas.width - 150;
		var y = 150;
		// header
		ctx.font = '14px sans-serif';
		ctx.fillText('time', x, y - 50);
		//ctx.fillText('is successfull', x + 30, y - 50);
		ctx.fillText('number of cubes', x + 40, y - 50);
		// table
		//console.log(tmpStats, tmpStats[3]);
		for (var cnt = 0; cnt < tmpStats.length; cnt++) {
			var record = tmpStats[cnt];
			console.log(record, cnt);
			ctx.fillStyle = record.isSuccess ? 'green' : 'red';
			ctx.font = '20px sans-serif';
			ctx.fillText(record.time / 1000 + 's', x, y - 20 + cnt * 25);
			ctx.fillText(record.numberOfCubes, x + 120, y - 20 + cnt * 25);

		}

	}

	function checkAnswer(cubeNumber) {
		setTimeout(function () {
			drawCubes(self.fieldWidth, self.lineWidth, self.numberOfFields);
		}, 2000);
		if (!!self.progressInterval) {
			clearInterval(self.progressInterval);
		}
		var isCorrect = cubeNumber == getNumberOfCubes();
		writeCubeNumber(isCorrect);
		saveStats(getNumberOfCubes(), isCorrect);
		return isCorrect;

	}

	function getStats() {
		drawStats();
		return self.stats;
	}

	function drawStatsChart() {
		var ctx = self.ctx;
		var step = 0;
		var startY = -50;
		var stats = _.clone(self.stats);
		ctx.beginPath();
		ctx.fillStyle = '#000';
		ctx.textAlign = 'center';
		ctx.font = '22px sans-serif';
		ctx.fillText('Records', 500, startY + 100);
		ctx.moveTo(400, startY + 100);
		ctx.lineTo(400, startY +250);
		ctx.stroke();
		ctx.lineTo(600, startY + 250);
		ctx.stroke();
		ctx.closePath();
		if (stats.length > 5){
			stats = stats.splice(stats.length - 5)
		}
		console.log(stats);
		stats.forEach(function (elem) {
			drawCandle(elem, step, 400, startY + 250);
			step += 35;
		})
	}
	// drawing bar for the stats
	function drawCandle(candle, xOffset, chartStartX, chartStartY) {
		var ctx = self.ctx;
		var candleWidth = 30;
		ctx.beginPath();
		ctx.fillStyle = candle.isSuccess ? '#214d71' : '#890000';
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 2;
		if (candle.time / 100 < 1){
			candle.time = 1000;
		}
		ctx.fillRect(chartStartX + xOffset + 5, chartStartY - candle.time / 100, candleWidth, candle.time / 100);
		ctx.strokeRect(chartStartX + xOffset + 5, chartStartY - candle.time / 100, candleWidth, candle.time / 100);
		ctx.closePath();
		setTimeout(function () {
			ctx.save();
			ctx.beginPath();
			ctx.translate(560, chartStartY - 100);
			ctx.rotate(Math.PI / 2);
			ctx.fillStyle = candle.time < 2000 ? '#000' : '#fff';
			ctx.font = '16px sans-serif ';
			ctx.textAlign = 'right';
			ctx.fillText(candle.time / 1000 + 's', 90, 140 - xOffset + 5 );
			ctx.closePath();
			ctx.restore();
		},1)
	}

	return {
		drawCubes: drawCubes,
		getNumberOfCubes: getNumberOfCubes,
		checkAnswer: checkAnswer,
		getStats: getStats,
		drawStatsChart: drawStatsChart
	}
}