const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
let effect;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Particle {
  constructor(effect, x, y, color) {
    this.effect = effect;
    this.x = Math.random() * this.effect.width;
    this.y = Math.random() * this.effect.height;
    this.originX = Math.floor(x);
    this.originY = Math.floor(y);
    this.color = color;
    this.size = this.effect.size;
    this.velx = Math.random() * 2 - 1;
    this.vely = Math.random() * 2 - 1;
    this.ease = 0.2;
    this.dx = 0;
    this.dy = 0;
    this.distance = 0;
    this.force = 0;
    this.angle = 0;
    this.friction = 0.95;
    this.active = true;
    this.timeout = undefined;
  }

  draw(context) {
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.size, this.size);
  }

  update() {
    if (this.active) {
      this.dx = this.effect.mouse.x - this.x;
      this.dy = this.effect.mouse.y - this.y;
      this.distance = this.dx * this.dx + this.dy * this.dy;
      this.force = -this.effect.mouse.radius / this.distance;

      if (this.distance < this.effect.mouse.radius) {
        this.angle = Math.atan2(this.dy, this.dx);
        this.velx += this.force * Math.cos(this.angle);
        this.vely += this.force * Math.sin(this.angle);
      }

      this.x +=
        (this.velx *= this.friction) + (this.originX - this.x) * this.ease;
      this.y +=
        (this.vely *= this.friction) + (this.originY - this.y) * this.ease;
    }
  }

  warp() {
    this.active = true;
    clearTimeout(this.timeout);
    this.x = Math.random() * this.effect.width;
    this.y = Math.random() * this.effect.height;
    this.ease = 0.2;
    this.size = this.effect.size;
  }

  blocks() {
    this.active = true;
    clearTimeout(this.timeout);
    this.x = Math.random() > 0.5 ? 0 : this.effect.width;
    this.y = Math.random() > 0.5 ? 0 : this.effect.height;
    this.ease = 0.1;
    this.size = this.effect.size * 3;
  }

  assemble() {
    this.active = true;
    clearTimeout(this.timeout);
    this.x = Math.random() * this.effect.width;
    this.y = Math.random() * this.effect.height;
    this.ease = 0.5;
    this.size = this.effect.size;
    this.active = false;
    this.effect.counter++;
    this.timeout = setTimeout(() => {
      this.active = true;
    }, this.effect.counter);
  }

  prints() {
    this.active = true;
    clearTimeout(this.timeout);
    this.x = this.effect.width * 0.5;
    this.y = this.effect.height * 0.5;
    this.ease = 0.5;
    this.size = this.effect.size;
    this.active = false;
    this.effect.counter++;
    this.timeout = setTimeout(() => {
      this.active = true;
    }, this.effect.counter);
  }
}

class Effect {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.image = document.querySelector("img");
    this.particlesArray = [];
    this.size = 3;
    this.mouse = {
      radius: 3000,
      x: undefined,
      y: undefined,
    };
    window.addEventListener("mousemove", (event) => {
      this.mouse.x = event.x;
      this.mouse.y = event.y;
    });
    this.counter = 0;
  }

  initialize(context) {
    this.image.onload = () => {
      this.x = (this.width - this.image.width) / 2;
      this.y = (this.height - this.image.height) / 2;
      context.drawImage(this.image, this.x, this.y);
      const pixels = context.getImageData(0, 0, this.width, this.height).data;
      for (let y = 0; y < this.height; y += this.size) {
        for (let x = 0; x < this.width; x += this.size) {
          const index = (y * this.width + x) * 4;
          const red = pixels[index];
          const green = pixels[index + 1];
          const blue = pixels[index + 2];
          const alpha = pixels[index + 3];
          const color = `rgba(${red},${green},${blue},${alpha})`;

          if (alpha > 0) {
            this.particlesArray.push(new Particle(this, x, y, color));
          }
        }
      }
    };
  }

  draw(context) {
    this.particlesArray.forEach((particle) => particle.draw(context));
  }

  update() {
    this.particlesArray.forEach((particle) => particle.update());
  }

  warp() {
    this.counter = 0;

    this.particlesArray.forEach((particle) => particle.warp());
  }

  blocks() {
    this.counter = 0;
    this.particlesArray.forEach((particle) => particle.blocks());
  }

  assemble() {
    this.counter = 0;
    this.particlesArray.forEach((particle) => particle.assemble());
  }

  prints() {
    this.counter = 0;
    this.particlesArray.forEach((particle) => particle.prints());
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  effect.draw(ctx);
  effect.update();
  requestAnimationFrame(animate);
}

function encodeImageFileAsURL() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var filesSelected = document.getElementById("imageUpload").files;
  if (filesSelected.length > 0) {
    var fileToLoad = filesSelected[0];
    var fileReader = new FileReader();
    fileReader.onload = function (fileLoadedEvent) {
      var srcData = fileLoadedEvent.target.result;
      var newImage = document.querySelector("img");
      newImage.setAttribute("src", srcData);
    };
    fileReader.readAsDataURL(fileToLoad);
    effect = new Effect(canvas.width, canvas.height);
    effect.initialize(ctx);
    animate();
  }
}

const warp = document.getElementById("warp");
warp.addEventListener("click", () => effect.warp());

const blocks = document.getElementById("blocks");
blocks.addEventListener("click", () => effect.blocks());

const assemble = document.getElementById("assemble");
assemble.addEventListener("click", () => effect.assemble());

const prints = document.getElementById("prints");
prints.addEventListener("click", () => effect.prints());
