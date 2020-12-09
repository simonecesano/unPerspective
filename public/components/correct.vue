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

#input, #output {
    position: relative;
    display:inline-block;
    top: 0px; left: 0px;
    margin:0; padding:0;
}

#dots, #grid {
    position: absolute;
    top: 0; left: 0;
}

.dot { fill:#ef2929;stroke:#ef2929;stroke-width:0.264999;stop-color:#000000 }
</style>
<template>
  <div ref="appspace">
    <div style="display:inline-block;vertical-align:top;margin:0;padding:0;position:relative">
      <div>
	<canvas ref="input" id="input"></canvas>
	<svg ref="dots" id="dots"
      	     xmlns:dc="http://purl.org/dc/elements/1.1/"
      	     xmlns:cc="http://creativecommons.org/ns#"
      	     xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
      	     xmlns:svg="http://www.w3.org/2000/svg"
      	     xmlns="http://www.w3.org/2000/svg"
      	     version="1.1"
	     
      	     v-bind:width="svg.width + 'px'"
      	     v-bind:height="svg.height + 'px'"
      	     v-bind:viewBox="svg.viewbox.join(' ')"
	     
	     v-on:click="addDot"
	     v-on:drop.prevent="dropHandler" v-on:dragover.prevent="dragOverHandler" 
	     
	     v-on:mousemove="pointDrag"		
	     v-on:mouseup="pointDragEnd"		
      	     >
	  <g>
	    <line v-if="points.length > 1" :x1="points[0][0]" :y1="points[0][1]" :x2="points[1][0]" :y2="points[1][1]" stroke="white" />
	    <line v-if="points.length > 2" :x1="points[1][0]" :y1="points[1][1]" :x2="points[2][0]" :y2="points[2][1]" stroke="white" />
	    <line v-if="points.length > 3" :x1="points[2][0]" :y1="points[2][1]" :x2="points[3][0]" :y2="points[3][1]" stroke="white" />
	    <line v-if="points.length >= 4" :x1="points[3][0]" :y1="points[3][1]" :x2="points[0][0]" :y2="points[0][1]" stroke="white" />
	  </g>
	  <g :key="tick">
	    <circle v-for="(p, i) in points" 
		    v-on:mousedown="pointDragStart($event, i)"
		    class="dot" transform="scale(1, 1)"
		    v-bind:id="'points[' + i + ']'"
		    v-bind:cx="p[0]" v-bind:cy="p[1]" r="4" />
	  </g>
	</svg>
      </div>
      <div>
	<button class="favorite styled" @click="sendCommand()"
              type="button">correct</button>
	<button class="favorite styled" @click="clear()"
		type="button">clear points</button>
      </div>
    </div>
    <div style="display:inline-block;vertical-align:top;position:relative">
      <div>
	<canvas v-bind:style="style" ref="output" id="output"></canvas>
	<svg ref="grid" id="grid"
      	     xmlns:dc="http://purl.org/dc/elements/1.1/"
      	     xmlns:cc="http://creativecommons.org/ns#"
      	     xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
      	     xmlns:svg="http://www.w3.org/2000/svg"
      	     xmlns="http://www.w3.org/2000/svg"
      	     version="1.1"

	     v-bind:width="svg.width + 'px'"
      	     v-bind:height="svg.height + 'px'"
      	     v-bind:viewBox="svg.viewbox.join(' ')"
	     >
	  <g v-if="gridOn">
	    <line v-for="(p, i) in grid[0]" :x1="p" :y1="0" :x2="p" :y2="svg.height" style="stroke:white;stroke-width:0.5" />
	    <line v-for="(p, i) in grid[1]" :x1="0" :y1="p" :x2="svg.width" :y2="p" style="stroke:white;stroke-width:0.5" />
	  </g>
	</svg>
	<input name="scaleY" id="scaleY" type="range" v-model="scaleY"  min="-1" max="3" step="0.01" orient="vertical" />
	<input type="range" v-model="offsetY" orient="vertical" v-bind:min="-output_canvas.height / 2" v-bind:max="output_canvas.height / 2" step="1"  />
	<br />
	<input type="range" v-model="scaleX" min="-1" max="3" step="0.01" @mousedown="checkShift" @mouseup="clearShift" /><br />
	<input type="range" v-model="offsetX" v-bind:min="-output_canvas.width / 2" v-bind:max="output_canvas.width / 2" step="1"  />
      </div>
      <div>
	<button class="favorite styled" @click="toggleGrid()"
              type="button">toggle grid</button>
	<button class="favorite styled" @click="saveOutput()"
              type="button">save picture</button>
      </div>
    </div>
  </div>    
</template>
<script>
    function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
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
	    scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0,
	    scale: 1,
	    output_canvas: document.createElement('canvas'),
	    dragging: false,
	    currentDot: null,
	    svg: { width: 105, height: 148, viewbox: [0, 0, 105, 148 ] },
	    tick: 0,
	    shiftKey: false,
	    gridOn: true,
	};
    },
    computed: {
	dots: function(){
	},
	grid: function(){
	    var g = [[], []];
	    
	    if (true) {
		var width = this.svg.width;
		var height = this.svg.height;
		console.log(width, height)
		for (let p = 0; p < width; p += 25) { g[0].push(p) }
		for (let p = 0; p < width; p += 25) { g[1].push(p) }
	    }

	    console.log(g);
	    return g;
	}
    },
    mounted: function(){
	var c = this;

	c.bounding_box = c.$refs.appspace.getBoundingClientRect()
	
	var cvsi = c.$refs.input;
	var cvso = c.$refs.output;
	var ctx  = c.$refs.input;

	cvsi.addEventListener('click', this.addPoint, false);
	c.loadImage('./Wolfsburg_VW-Werk.jpg');
    },
    destroyed: function(){
    },
    beforeCreate: function(){
    },
    watch: {
	scaleX:  function(after, before){
	    console.log(after, before, after / before);
	    if (this.shiftKey) {
	    	console.log('here')
		console.log(this.scaleY);
		this.scaleY = this.scaleY * after / before;
		console.log(this.scaleY);		
	    }
	    // this.scaleX = after;
	    this.redraw()
	},
	scaleY:  function(){ this.redraw() },
	offsetX: function(){ this.redraw() },
	offsetY: function(){ this.redraw() },	
    },
    methods: {
	checkShift: function(e){
	    console.log(e.shiftKey);
	    this.shiftKey = e.shiftKey;
	},
	clearShift: function(e){
	    console.log(e.shiftKey);
		    
	    this.shiftKey = false
	},	
	pointDragStart: function(e, i){
	    this.currentDot = i;
	    this.dragging = true;
	    e.stopPropagation();
	},
	pointDrag: function(e){
	    if (this.dragging) {
		var p = getMousePos(this.$refs.dots, e);
		this.points[this.currentDot] = [ p.x, p.y ]
		this.tick = (new Date).getTime();
		e.stopPropagation();
	    }
	},
	pointDragEnd: function(e){
	    var c = this;
	    if (this.dragging) {
		var p = getMousePos(this.$refs.dots, e);
		this.points[this.currentDot] = [ p.x, p.y ]
		this.tick = (new Date).getTime();

		this.dragging = false;
		this.currentDot = null;
		e.stopPropagation();
	    }
	    return false;
	},
	addDot: function(e) {
	    if (!this.dragging) {
		var p = getMousePos(this.$refs.dots, e);
		this.points.push([p.x, p.y])
	    } else {
		this.dragging = false;
		this.currentDot = null;
	    }
	},
	toggleGrid: function(e){ this.gridOn = !this.gridOn },
	saveOutput: function(e){

	}, 
	redraw: function(){
	    var canvas = this.$refs.output;
	    var ctx = canvas.getContext('2d');

	    ctx.clearRect(0, 0, canvas.width, canvas.height);

	    ctx.scale(Math.pow(10, this.scaleX - 1) * this.scale, Math.pow(10, this.scaleY - 1) * this.scale);
	    ctx.translate(this.offsetX, this.offsetY);

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
	    
	    var img = new Image;
	    img.onload = function() {
		var width = Math.min(img.width, (c.bounding_box.width / 2) - 128); 
		var scale = width / img.width;
		
		c.output_canvas.width  = canvas.width  = output.width = c.svg.width   = width;
		c.output_canvas.height = canvas.height = output.height = c.svg.height = img.height * scale;

		c.svg.viewbox[2] = c.output_canvas.width;
		c.svg.viewbox[3] = c.output_canvas.height;		
		
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
	},
	sendCommand: function(){
	    var c = this;
	    var calc = new PointCalc();
	    calc.input = this.points;

	    console.log(this.points);
	    
	    if (this.points.length >= 4) {
		var calc = new PointCalc();
		calc.input = this.points.slice(0, 4);

		var src = this.points;
		var dst = calc.output;
		
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
    },
}
</script>
