<style scoped>
.styled {
    border: 0;
    line-height: 2;
    padding: 0 20px;
    font-size: 1rem;
    text-align: center;
    color: #fff;
    border-radius: 0px;
    background-color: rgba(220, 0, 0, 1);
}

.styled:hover {
    background-color: rgba(255, 0, 0, 1);
}

.styled:active {
    box-shadow: inset -2px -2px 3px rgba(255, 255, 255, .6),
                inset 2px 2px 3px rgba(0, 0, 0, .6);
}

div {
    margin: 0em;
}
#items li { list-style-type: none; }

input[type=range][orient=vertical]
{
    writing-mode: bt-lr; /* IE */
    -webkit-appearance: slider-vertical; /* WebKit */
    width: 8px;
    height: 175px;
    padding: 0 5px;
}

</style>
<template>
  <div ref="appspace">
    <div style="display:inline-block;vertical-align:top;">
      <canvas ref="input" v-on:drop.prevent="dropHandler" v-on:dragover.prevent="dragOverHandler" id="input"></canvas>
      <div>{{ scale }} || {{ scaleX }} | {{ Math.pow(10, this.scaleX) * this.scale }} ||
	{{ scaleY }} | {{ Math.pow(10, this.scaleY) * this.scale }} ||
      </div>
    </div>
    <div style="display:inline-block;vertical-align:top;">
      <canvas v-bind:style="style" ref="output" id="output"></canvas>
      <input type="range" v-model="scaleY"  min="-1" max="3" step="0.01" orient="vertical" />
      <input type="range" v-model="offsetY" orient="vertical" v-bind:min="-output_canvas.height / 2" v-bind:max="output_canvas.height / 2" step="1"  />
      <br />
      <input type="range" v-model="scaleX" min="-1" max="3" step="0.01" /><br />
      <input type="range" v-model="offsetX" v-bind:min="-output_canvas.width / 2" v-bind:max="output_canvas.width / 2" step="1"  />
    </div>
    <div>
      <button class="favorite styled" @click="sendCommand()"
              type="button">send</button>
      <button class="favorite styled" @click="setPoints()"
              type="button">points</button>
      <button class="favorite styled" @click="clear()"
              type="button">clear</button>
    </div>
  </div>    
</template>
<script>

function shuffle(input) {
    var array = Array.from(input);
    
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
	
	// Pick a remaining element...
	randomIndex = Math.floor(Math.random() * currentIndex);
	currentIndex -= 1;
	
	// And swap it with the current element.
	temporaryValue = array[currentIndex];
	array[currentIndex] = array[randomIndex];
	array[randomIndex] = temporaryValue;
    }
    return array;
}

module.exports = {
    data: function () {
	return {
	    points:  [],
	    input_points: "",
	    output_points: "",
	    seq: "0,1,2,3,4,5,6,7,8",
	    matrix: [],
	    style: { border: "thin solid white" },
	    image: undefined,
	    output_image: undefined,
	    bounding_box: {},
	    scaleX: 0, scaleY: 0, offsetX: 0, offsetY: 0,
	    scale: 1,
	    output_canvas: document.createElement('canvas'),
	};
    },
    mounted: function(){
	var c = this;

	c.bounding_box = c.$refs.appspace.getBoundingClientRect()
	
	var cvsi = c.$refs.input;
	var cvso = c.$refs.output;
	var ctx  = c.$refs.input;

	cvsi.addEventListener('click', this.addPoint, false);
	c.loadImage('/Wolfsburg_VW-Werk.jpg');
    },
    destroyed: function(){
    },
    beforeCreate: function(){
    },
    watch: {
	scaleX:  function(){ this.redraw() },
	scaleY:  function(){ this.redraw() },
	offsetX: function(){ this.redraw() },
	offsetY: function(){ this.redraw() },	
    },
    methods: {
	redraw: function(){
	    var canvas = this.$refs.output;
	    var ctx = canvas.getContext('2d');

	    ctx.clearRect(0, 0, canvas.width, canvas.height);

	    ctx.scale(Math.pow(10, this.scaleX) * this.scale, Math.pow(10, this.scaleY) * this.scale);
	    ctx.translate(this.offsetX, this.offsetY);

	    console.log(this.output_canvas);

	    ctx.drawImage(this.output_canvas, 0, 0);
	    ctx.setTransform(1, 0, 0, 1, 0, 0);
	},
	loadImage: function(src){
	    var c = this;

	    var canvas = c.$refs.input;
	    var output = c.$refs.output;
	    var ctxs   = [
		c.$refs.input.getContext('2d'),
		c.$refs.output.getContext('2d'),
		c.output_canvas.getContext('2d')
	    ];

	    c.bounding_box = c.$refs.appspace.getBoundingClientRect()
	    console.log(c.bounding_box);
	    
	    var img = new Image;
	    img.onload = function() {
		var width = Math.min(img.width, (c.bounding_box.width / 2) - 128); 
		var scale = width / img.width;
		
		c.output_canvas.width  = canvas.width  = output.width = width;
		c.output_canvas.height = canvas.height = output.height = img.height * scale;

		ctxs.forEach(ctx => {
		    ctx.scale(scale, scale);
		    ctx.clearRect(0, 0, canvas.width, canvas.height);
		    ctx.drawImage(img, 0, 0);
		    ctx.setTransform(1, 0, 0, 1, 0, 0);
		})

		c.scale = scale;

		// -------------------------------------------------------------
		// this is important! it keeps the original (scaled) image
		// otherwise the dots are included on the canvas
		// this needs to change to store the original unscaled image
		// -------------------------------------------------------------
		c.image = ctxs[0].getImageData(0, 0, canvas.width, canvas.height)
	    }
	    img.src = src;
	    
	},
	dropHandler: function(e){
	    var c = this;
	    e.preventDefault();
	    if (e.dataTransfer.items) {
	    	for (var i = 0; i < 1; i++) {
	    	    if (e.dataTransfer.items[i].kind === 'file' && e.dataTransfer.items[i].type.match(/image.*/)) {
	    		var file = e.dataTransfer.items[i].getAsFile();
			c.loadImage(URL.createObjectURL(file));
		    } else {
			
		    }
	    	}
	    }
	},
	dragOverHandler: function(e){
	    e.preventDefault();
	},
	clear: function(){
	    this.points = [];
	},
	setPoints: function(){
	    var src = [[264,292], [269,46], [524,136], [526,315]];
	    this.points = src;

	    var ctx = this.$refs.input.getContext('2d')

	    console.log(ctx);

	    this.points.forEach(p => {
		ctx.fillStyle = "#ff0000";
		ctx.beginPath();
		ctx.arc(p[0], p[1], 6, 0, Math.PI * 2);
		ctx.fill();
	    })
	},
	sendCommand: function(){
	    var c = this;
	    var calc = new PointCalc();
	    calc.input = this.points;

	    console.log(this.points);
	    
	    if (this.points.length == 4) {
		var calc = new PointCalc();
		calc.input = this.points;

		var src = this.points;
		var dst = calc.output;
		

		console.log('here');
		var canvas = fx.canvas(1500,1500);

		var texture = canvas.texture(this.image);
		
		canvas.draw(texture, this.$refs.input.width, this.$refs.input.height);
		canvas.perspective(src.flat(), dst.flat()).update();

		c.output_canvas.width = c.output_canvas.height = 1500;

		var ctx = c.output_canvas.getContext('2d');
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.drawImage(canvas, 0, 0);
		
		c.redraw()
	    }
	},
	addPoint: function(e){
	    function getMousePos(canvas, evt) {
		var rect = canvas.getBoundingClientRect();
		return {
		    x: evt.clientX - rect.left,
		    y: evt.clientY - rect.top
		};
	    }
	    
	    console.log(e);

	    var p = getMousePos(this.$refs.input, e);
	    
	    var ctx = this.$refs.input.getContext('2d')
	    console.log(ctx);

	    ctx.fillStyle = "#ff0000";
	    ctx.beginPath();
	    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
	    ctx.fill();

	    this.points.push([p.x, p.y])

	},
    },
}
</script>
