// Wall structure
class WallObj {
    constructor(x = Math.floor(Math.random() * (canvas.width - 50) + 25), y = Math.floor(Math.random() * (canvas.width - 50) + 25)) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.img = new Image();
        this.img._ready = false;
        this.url = "../assets/brickwall.png";
        this.type = 0;
    }

    setImage(img = this.url) {
        return new Promise((a, b) => {
            this.img.src = img;
            this.img.onload = () => a(), this.img._ready = true;
        });
    }

    display() {
        return new Promise((a, b) => {
            if (!this.img._ready) b("Image not loaded.");
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        });
    }
}

class NoNomArea {
    constructor(startsAt, endsAt) {
        if (startsAt === undefined || endsAt === undefined) return;
        if (startsAt.constructor.name !== "Object" || endsAt.constructor.name !== "Object") return;
        this.startsAt = {
            x: startsAt.x,
            y: startsAt.y
        };
        this.endsAt = {
            x: endsAt.x,
            y: endsAt.y
        };
    }

    display() {
        return new Promise((a, b) => {
            ctx.fillStyle = "#aaddb5";
            ctx.fillRect(this.startsAt.x, this.startsAt.y, this.endsAt.x, this.endsAt.y);
        });
    }

    static display(startsAt, endsAt) {
        return new Promise((a, b) => {
            ctx.fillStyle = "#aaddb5";
            ctx.fillRect(startsAt.x, startsAt.y, endsAt.x, endsAt.y);
        });
    }
}

// Blob structure
class BlobCode {
    static get blobowo() {
        return "../assets/blobowo.png";
    }
    static get blobevil() {
        return "../assets/blobevil.png";
    }
    static get blobeyes() {
        return "../assets/blobeyes.png";
    }
    static get blobkittenknife() {
        return "../assets/BlobKittenKnife.png";
    }
    static get blobpeek() {
        return "../assets/blobpeek.png";
    }
    static get blobnom() {
        return "../assets/blobnom.png";
    }
}

function isInObject(x, y) {
    let inObject = false;
    for(let i = 0; i < objects.walls.length; ++i) if (x < (objects.walls[i].x + 30) && x > (objects.walls[i].x - 30) && y < (objects.walls[i].y + 30) && y > (objects.walls[i].y - 30)) inObject = true;
    return inObject;
}

class BlobObj {
    constructor(br, owner, x = window.innerWidth / 2, y = window.innerHeight / 2) {
        this.guest = false;
        this.owner = owner;
        this.br = br;
        this.img = new Image();
        this._direction = 0;
        this.lastnom = 0;
        this.directionChangedAt = Date.now();
        this.directionChangeCoordinates = {
            x,
            y
        };
        this.previousX = 0;
        this.previousY = 0;
	    this.health = 100;
	    this.x = x;
	    this.y = y;
    }

    get direction() {
        return this._direction;
    }

    set direction(value) {
		const newX = this.x;
		const newY = this.y;
        this.directionChangedAt = Date.now();
        this.directionChangeCoordinates = {
            x: newX,
            y: newY
        };
        return this._direction = value;
    }

    get inProtectedArea() {
        let inArea = false;
        let pos = { x: this.x, y: this.y };
        for (let i = 0; i < objects.noNomAreas.length; ++i) {
            if (objects.noNomAreas[i].startsAt.x <= pos.x
                && objects.noNomAreas[i].startsAt.x + (Math.abs(objects.noNomAreas[i].endsAt.x - objects.noNomAreas[i].startsAt.x)) > pos.x
                && objects.noNomAreas[i].startsAt.y <= pos.y
                && objects.noNomAreas[i].startsAt.y + (Math.abs(objects.noNomAreas[i].endsAt.y - objects.noNomAreas[i].startsAt.y)) > pos.y) inArea = true;
        }
        return inArea;
    }

    setBlob(blobimage = BlobCode.blobowo) {
        if (blobimage === BlobCode.partyblob0) blobimage = BlobCode.blobowo;
        return new Promise((a, b) => {
            try {
                this.img.src = blobimage;
                this.img.onload = () => {
                    this.img._ready = true;
                    a();
                }
            } catch (e) {
                b(e);
            }
        });
    }

    display(du = false, dbr = false, w = 30, h = 30) {
        return new Promise((a, b) => {
            if (!this.img._ready) b("Image not loaded.")
            ctx.beginPath();
            const canvasX = canvas.width / 2 - w;
            const canvasY = canvas.height / 2 - h;
            const tier = getTier(this.br || 0);
            if (typeof this.owner === "undefined") return;
            if (this.owner === ownBlob.owner) {
				ctx.fillStyle = "#" + tier.colorCode;
                ctx.font = (15 * scale).toString() + "px Dosis";
                ctx.drawImage(this.img, canvasX, canvasY, w * scale, h * scale);
                ctx.font = "16px Raleway";
                ctx.fillText(this.owner, canvasX - this.owner.length, (canvasY) - 27.5);
                ctx.font = "13px Raleway";
                ctx.fillText(this.br + " BR", canvasX, (canvasY) - 10);
                ctx.fillStyle = "white";
                if (emblems[tier.tier].complete) {
                    ctx.drawImage(emblems[tier.tier], canvasX - (15 + 15 * scale), canvasY - (10 + 15 * scale), 20 * scale, 20 * scale);
                }
                ctx.strokeStyle = "lightgreen";
                ctx.moveTo(canvasX - (35 * scale), canvasY - 3);
                ctx.lineTo(canvasX - (35 / scale) + (100 * (this.health / 100)), canvasY - 3);
                ctx.closePath();
                ctx.stroke();
                if (this.role === 1) {
                    ctx.drawImage(objects.images.crown, canvasX - (30 + 30 * scale), canvasY - (10 + 15 * scale), 20 * scale, 20 * scale);
                }
            } else {
                let blobCanvasX = 0,
                    blobCanvasY = 0;
                if (ownBlob.x >= this.x) {
                    blobCanvasX = (canvas.width / 2) - (ownBlob.x - this.x);
                } else if (ownBlob.x < this.x) {
                    blobCanvasX = (canvas.width / 2) + (this.x - ownBlob.x);
                }

                if (ownBlob.y >= this.y) {
                    blobCanvasY = (canvas.height / 2) - (ownBlob.y - this.y);
                } else if (ownBlob.y < this.y) {
                    blobCanvasY = (canvas.height / 2) + (this.y - ownBlob.y);
                }

                blobCanvasY -= h;
                blobCanvasX -= w;
                
				if (emblems[tier.tier].complete) {
				    ctx.drawImage(emblems[tier.tier], blobCanvasX - (15 + 15 * scale), blobCanvasY - (10 + 15 * scale), 20 * scale, 20 * scale);
                }

				ctx.fillStyle = "#" + tier.colorCode;
				
                ctx.drawImage(this.img, blobCanvasX, blobCanvasY, w * scale, h * scale);

                if (du === true) {
                    ctx.font = (15 * scale).toString() + "px Dosis";
                    ctx.font = "16px Raleway";
                    ctx.fillText(this.owner, blobCanvasX - this.owner.length, (blobCanvasY) - 27.5);
                    ctx.font = "13px Raleway";
                    ctx.fillText(this.br + " BR", blobCanvasX, (blobCanvasY) - 10);
                    ctx.fillStyle = "white";
                }
                ctx.strokeStyle = "lightgreen";
                ctx.moveTo(blobCanvasX - (15 + 15 * scale), blobCanvasY - 3);
                ctx.lineTo(blobCanvasX - (15 + 15 * scale) + (100 * (this.health / 100)), blobCanvasY - 3);
                ctx.closePath();
                ctx.stroke();
                if (this.role === 1) {
                    ctx.drawImage(objects.images.crown, blobCanvasX - (30 + 30 * scale), blobCanvasY - (10 + 15 * scale), 20 * scale, 20 * scale);
                }
            }
        });
    }

    static display(arr, du = false, dbr = false, w = 30, h = 30) {
        if (typeof arr === "object" && arr != null) {
            if (arr.constructor.name === "Array") {
                for (const blob of arr) {
                    blob.display(du, dbr, w, h);
                }
            }
        }
    }

    static find(x, y) { // because Array.find is slow
        let obj;
        for(let i=0; i < blobs.length; ++i) {
            if (x < (blobs[i].x + 30) && x > (blobs[i].x - 30)) {
                if (y < (blobs[i].y + 30) && y > (blobs[i].y - 30) && blobs[i].owner !== ownBlob.owner) {
                    obj = blobs[i];
                    break;
                }
            }
        }
        return obj;
    }
}

class Item {
    constructor(x = Math.floor(Math.random() * mapSize.width), y = Math.floor(Math.random() * mapSize.height), itemid = Item.id.HEALTH) {
        this.x = x;
        this.y = y;
        this.id = itemid;
    }

    display() {
        let canvasPosX = 0,
            canvasPosY = 0;
        if (ownBlob.x >= this.x) {
            canvasPosX = (canvas.width / 2) - (ownBlob.x - this.x);
        } else if (ownBlob.x < this.x) {
            canvasPosX = (canvas.width / 2) + (this.x - ownBlob.x);
        }
        if (ownBlob.y >=this.y) {
            canvasPosY = (canvas.height / 2) - (ownBlob.y - this.y);
        } else if (ownBlob.y < this.y) {
            canvasPosY = (canvas.height / 2) + (this.y - ownBlob.y);
        }
        canvasPosY -= 45;
        canvasPosX -= 45;
        ctx.drawImage(objects.images.heart, canvasPosX, canvasPosY, 20, 20);
    }

    get state() {
        if (this.x < (ownBlob.x + 10) && this.x > (ownBlob.x - 10) && this.y < (ownBlob.y + 10) && this.y > (ownBlob.y - 10)) return true;
        else return false;
    }
}

Item.id = {
    HEALTH: 0
};