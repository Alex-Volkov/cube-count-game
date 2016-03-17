function DrawProgress(config) {
	var defaults = {
		progressTime: 10,
		selectedProgressBar: 2
	};
	this.config = _.extend(defaults, config);
	if(!this.config.ctx){
		this.config.ctx = this.config.canvas.getContext('2d');
	}
	this.progressWidth = this.config.canvas.width;
	this.cellWidthConst = 10;
	this.cellWidth;
	this.waitParam = 0;
	this.colors = [];
	this.colors2 = [];
	this.opacity = 1;
	this.yPos = 0;
	this.currentTime = 0;
	//this.callBack = config.onEndCallBack;
	this.progressCancelled = false;

	// getting random red fraction of color
	DrawProgress.prototype.getColorFraction = function () {
		var redFraction2 = Math.round(Math.random() * 255);
		if (redFraction2 < 130) {
			redFraction2 = 130;
		}
		return redFraction2;
	};

	// progress complete callback
	DrawProgress.prototype.onProgressComplete = function () {
		clearInterval(this.progressInterval);
		this.config.ctx.clearRect(0, this.yPos, this.config.canvas.width, 10);
		if (!this.progressCancelled) {
			if (!!this.config.onEndCallBack) {
				this.config.onEndCallBack();
			}
			this.progressCancelled = false;
		}
	};

	DrawProgress.prototype.firstProgress = function () {
		this.currentTime = 0;
		this.progressWidth = this.config.canvas.width;
		this.progressIncrement = this.progressWidth / (this.config.progressTime * 100);
		clearInterval(this.progressInterval);
		this.redFraction = 255;
		this.progressInterval = setInterval(function () {
			this.currentTime += 10;
			var ctx = this.config.ctx;
			ctx.clearRect(0, 0, this.config.canvas.width, 11);
			ctx.beginPath();
			if (this.currentTime % 6 == 0) {
				this.redFraction--;
			}
			ctx.fillStyle = 'rgba(' + this.redFraction + ',0,0, .7)';
			ctx.rect(0, 0, this.progressWidth, 10);
			ctx.fill();
			ctx.closePath();
			this.progressWidth -= this.progressIncrement;
			if (this.progressWidth <= 0) {
				this.onProgressComplete.apply(this);
			}
		}.bind(this), 10);
	};


	DrawProgress.prototype.secondProgress = function () {
		this.progressWidth = this.config.canvas.width;
		this.progressInterval = setInterval(function () {
			//console.log(progressWidth2);
			var ctx = this.config.ctx;
			if (this.opacity < 1) {
				this.opacity += 0.0005;
			}
			ctx.clearRect(0, this.yPos, this.config.canvas.width, 21);
			this.progressWidth -= .6;
			this.currentTime += 10;
			for (var cnt = 0; cnt < this.config.canvas.width; cnt += 10) {
				ctx.beginPath();
				if (this.waitParam == 300 || this.waitParam == 0) {
					this.waitParam = 0;
					this.colors[cnt] = this.getColorFraction();
					this.colors2[cnt] = this.getColorFraction();
				}

				//ctx.strokeStyle = 'white';
				//ctx.lineWidth = 1;
				if (cnt < this.progressWidth) {
					if (cnt < this.progressWidth && (cnt + this.cellWidthConst > this.progressWidth )) {
						this.cellWidth = this.cellWidthConst - (cnt - this.progressWidth);
					} else {
						this.cellWidth = this.cellWidthConst;
					}
					ctx.fillStyle = 'rgba(' + this.colors[cnt] + ',' + '0, 0,' + this.opacity + ')';
					ctx.rect(cnt, this.yPos, this.cellWidth, 20);
					ctx.fill();
					//ctx.stroke();
					ctx.closePath();
					ctx.beginPath();
					ctx.fillStyle = 'rgba(' + this.colors2[cnt] + ',' + '0, 0,' + this.opacity + ')';
					ctx.rect(cnt, this.yPos + 10, this.cellWidth, 10);
					ctx.fill();
					ctx.closePath();

				}
			}
			this.waitParam += 10;
			if (this.progressWidth <= 0) {
				this.onProgressComplete.apply(this);
			}
		}.bind(this), 10)
	};

	DrawProgress.prototype.thirdProgress = function () {
		this.opacity = .7;
		this.progressWidth = this.config.canvas.width;
		this.progressInterval = setInterval(function () {
			//console.log(progressWidth2);
			var ctx = this.config.ctx;
			if (this.opacity < 1) {
				this.opacity += 0.0005;
			}
			ctx.clearRect(0, this.yPos, this.config.canvas.width, 21);
			this.progressWidth -= .6;
			this.currentTime += 10;
			for (var cnt = 0; cnt < this.config.canvas.width; cnt += 10) {
				ctx.beginPath();
				if (this.waitParam == 300 || this.waitParam == 0) {
					this.waitParam = 0;
					this.colors[cnt] = this.getColorFraction();
					this.colors2[cnt] = this.getColorFraction();
				}

				ctx.strokeStyle = 'white';
				ctx.lineWidth = 1;
				if (cnt < this.progressWidth) {
					if (cnt < this.progressWidth && (cnt + this.cellWidthConst > this.progressWidth )) {
						this.cellWidth = this.cellWidthConst - (cnt - this.progressWidth);
					} else {
						this.cellWidth = this.cellWidthConst;
					}
					ctx.fillStyle = 'rgba(' + this.colors[cnt] + ',' + '0, 0,' + this.opacity + ')';
					ctx.rect(cnt, this.yPos, this.cellWidth, 15);
					ctx.fill();
					ctx.stroke();
					ctx.closePath();
				}
			}
			this.waitParam += 10;
			if (this.progressWidth <= 0) {
				this.onProgressComplete.apply(this);
			}
		}.bind(this), 10)
	};

	DrawProgress.prototype.cancelProgress = function () {
		this.progressCancelled = true;
		clearInterval(this.progressInterval);
		DrawProgress.prototype.onProgressComplete.apply(this);
	};
	DrawProgress.prototype.getCurrentTime = function () {
		return this.currentTime;
	};
	DrawProgress.prototype.writeProgress = function () {
		switch (this.config.selectedProgressBar) {
			case 1:
				this.firstProgress.apply(this);
				break;
			case 2:
				this.secondProgress.apply(this);
				break;
			case 3:
				this.thirdProgress.apply(this);
				break;
		}
	};
}