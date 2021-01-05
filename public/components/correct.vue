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

input[type=range] {
margin-top: 0px
}


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
.dot.selected { fill: #0000cd }

div.range { display: table-cell; vertical-align: middle; height: 50px }
div.range label { vertical-align:middle }
div.range input { vertical-align:middle }

select, select * {
    // A reset of styles including removing the default dropdown arrow
    appearance: none;
    // Additional resets for further consistency
    background-color: transparent;
    border: none;
    padding: 0 1em 0 0;
    margin: 0;
    width: 12em;
    font-family: inherit;
    font-size: inherit;
    cursor: inherit;
    line-height: inherit;
}

.swatch { width: 24px; height: 24px; margin: 6px; display: inline-block; border:thin solid #444444 }
</style>
<template>
  <div ref="appspace">
    <dexie dbname="unperspective" @hook:mounted="checkImage"></dexie>
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
	     
	     v-on:drop.prevent="dropHandler" v-on:dragover.prevent="dragOverHandler" 
	     
	     v-on:mousedown="pointDragStart"
	     v-on:mousemove="pointDrag"		
	     v-on:mouseup="pointDragEnd"		
      	     >
	  <g v-if="image">
	    <g>
	      <line v-if="points.length > 1" :x1="points[0][0]" :y1="points[0][1]" :x2="points[1][0]" :y2="points[1][1]" stroke="white" />
	      <line v-if="points.length > 2" :x1="points[1][0]" :y1="points[1][1]" :x2="points[2][0]" :y2="points[2][1]" stroke="white" />
	      <line v-if="points.length > 3" :x1="points[2][0]" :y1="points[2][1]" :x2="points[3][0]" :y2="points[3][1]" stroke="white" />
	      <line v-if="points.length >= 4" :x1="points[3][0]" :y1="points[3][1]" :x2="points[0][0]" :y2="points[0][1]" stroke="white" />
	    </g>
	    <g :key="tick">
	      <circle v-for="(p, i) in points" 
		      v-on:mousedown="dotClick($event, i)"
		      v-bind:data-dot-index="i"
		      
		      v-bind:class="i == currentDot ? [ 'dot', 'selected' ] : [ 'dot' ]"
		      transform="scale(1, 1)"
		      
		      v-bind:id="'points[' + i + ']'"
		      v-bind:ref="'points[' + i + ']'"
		      v-bind:cx="p[0]" v-bind:cy="p[1]" r="6" />
	    </g>
	  </g>
	  <g v-else>
	    <rect x="0" y="0" :width="svg.width" :height="svg.height" rx="15" style="fill:SlateGray" />
	    <text
	      dominant-baseline="middle" 
	      xml:space="preserve"
	      style="font-size:32;fill:#ffffff;text-align:center;text-anchor:middle;"
	      x="svg.width / 2"
	      y="svg.height / 2"
	      id="text12"><tspan style="font-size:64;" x="50%" y="50%">drop an image here</tspan></text>
	  </g>
	</svg>
      </div>
      <div>
	<button class="favorite styled" @click="sendCommand()"
              type="button">correct</button>
	<button class="favorite styled" @click="clear()"
		type="button">clear points</button>
	<label for="process">Process type:</label>
	<select v-model="process" style="font-family: courier" id="process">
	  <option value="parallelize">Parallelize</option>
	  <option value="straightenUp">Straighten up</option>
	  <option value="frontView">Front view</option>
	</select>
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

	     v-on:mousedown="canvasDragStart"
	     v-on:mousemove="canvasDrag"		
	     v-on:mouseup="canvasDragEnd"		
	     >
	  <g v-if="gridOn">
	    <line v-for="(p, i) in grid[0]" :x1="p" :y1="0" :x2="p" :y2="svg.height" style="stroke-width:1" :stroke="gridColor" />
	    <line v-for="(p, i) in grid[1]" :x1="0" :y1="p" :x2="svg.width" :y2="p" style="stroke-width:1" :stroke="gridColor" />
	  </g>
	  <g v-if="pointsOn">
	    <circle v-for="(p, i) in outputPoints" 
		    v-on:mousedown="dotClick($event, i)"
		    v-bind:data-dot-index="i"
		    
		    v-bind:class="i == currentDot ? [ 'dot', 'selected' ] : [ 'dot' ]"
		    transform="scale(1, 1)"
		    
		    v-bind:id="'outputPoints[' + i + ']'"
		    v-bind:ref="'outputPoints[' + i + ']'"
		    v-bind:cx="p[0]" v-bind:cy="p[1]" r="6" />
	    </g>

	  </g>
	</svg>
	<div class="range">
	  <label for="scale">Scale</label>
	  <input type="range" id="scaleR" v-model="scaleR" min="-1" max="3" step="0.01" @mousedown="checkShift" @mouseup="clearShift" />
	  <label for="xyratio">X/Y ratio</label>
	  <input type="range" v-model="xyratio" v-bind:min="-1" v-bind:max="1" step="0.01"  />
	</div>
      </div>
      <div>
	<button class="favorite styled" @click="toggleGrid()"
              type="button">toggle grid</button>
	<button class="favorite styled" @click="togglePoints()"
              type="button">toggle points</button>
	<button class="favorite styled" @click="saveOutput()"
              type="button">save picture</button>
      </div>
      <div>
	<div class="swatch" @click="setGridColor(hex)"
	     v-bind:style="'background-color:'+hex" v-for="hex in ['#ffffff', '#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33', '#000000']">&nbsp;</div>
      </div>
    </div>
    <div v-if="false">
    <span>ScaleR {{ scaleR }}</span> | <span>ScaleX {{ Math.round(scaleX * 100) / 100 }}</span>
    | <span>ScaleY {{ Math.round(scaleY * 100) / 100 }}</span> | <span>xyratio {{ xyratio }}</span>
    | <span>scale {{ Math.round(scale * 100) / 100 }}</span>
    | <span>overallScaleX {{ Math.round(overallScaleX * 100) / 100 }}</span> | <span>overallScaleY {{ Math.round(overallScaleY * 100) / 100 }}</span>
    </div>
    <div>
      <h3>Instrctions</h3>
      ﻿<ol>
	<li>drop the picture to be adjusted on the grey area at left</li>
	<li>click on the picture in clockwise order starting from bottom left to set the four points that will form a rectangle on the output</li>
	<li>the adjusted picture will appear on the right after you set the fourth point</li>
	<li>you can adjust the points precisely by clicking on them and using the arrow keys to move them (the active point is the blue one)</li>
	<li>you can also adjust scale and x/y ratio with the sliders under the output picture</li>
	<li>and center it by dragging it with your mouse</li>
      </ol>
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
	    outputPoints:  [],
	    matrix: [],
	    style: { border: "thin solid white" },
	    image: undefined,
	    output_image: undefined,
	    bounding_box: {},
	    scale: 1,

	    scaleX: 1, scaleY: 1,
	    xyratio: 0,
	    offsetX: 0,	offsetY: 0,
	    overallScaleX: undefined, overallScaleY: undefined,
	    scaleR: 1,
	    output_canvas: document.createElement('canvas'),
	    dragging: false,
	    currentDot: undefined,
	    svg: { width: 1024 * 0.75, height: 768 * 0.75, viewbox: [0, 0, 1024 * 0.75 , 768 * 0.75 ] },
	    tick: 0,

	    shiftKey: false,
	    gridOn: true,
	    gridColor: '#ffffff',
	    pointsOn: false,
	    fileName: undefined,
	    process: 'frontView'
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
		for (let p = 0; p < width; p += 25) { g[0].push(p) }
		for (let p = 0; p < width; p += 25) { g[1].push(p) }
	    }

	    return g;
	}
    },
    mounted: function(){
	var c = this;

	c.bounding_box = c.$refs.appspace.getBoundingClientRect()
	
	var cvsi = c.$refs.input;
	var cvso = c.$refs.output;
	var ctx  = c.$refs.input;

	// cvsi.addEventListener('click', this.addPoint, false);

	var canvas = c.$refs.input;
	var output = c.$refs.output;

	canvas.width  = output.width  = c.svg.width
	canvas.height = output.height = c.svg.height
	

	// c.loadImage('./Wolfsburg_VW-Werk.jpg');

	document.onkeydown = this.keyCheck;

    },
    components: {
	insideout: httpVueLoader('components/insideout.vue'),
	dexie: httpVueLoader('components/dexie.vue'),
    },
    destroyed: function(){
    },
    beforeCreate: function(){
    },
    watch: {
	currentDot: function(after, before){
	    console.log('current dot changed', after, before);
	},
	scaleR: function(after, before){ this.redraw() },
	xyratio: function(after, before){
	    if (after > 0) {
	    	this.scaleX += (after - before)
	    } else if (after == 0) {
		this.scaleX = this.scaleY = 1;
	    } else {
	    	this.scaleY -= (after - before)
	    }
	    this.redraw()
	},
    },
    methods: {
	setGridColor: function(hex) {
	    console.log(hex);
	    this.gridColor = hex;
	},
	checkImage: function(){
	    var c = this;
	    console.log('checkImage');
	    c.db.conf.get({
		id: 'image',
	    }).then((item) => {
		if (item) {
		    var img = item.value;
		    var canvas = document.createElement('canvas');
		    canvas.width  = img.width;
		    canvas.height = img.height;
		    
		    var ctx = canvas.getContext("2d");
		    ctx.putImageData(img, 0, 0)
		    
		    c.loadImage(canvas.toDataURL())
		} else {
		    console.log('no image')
		}
	    }).catch(e => console.log(e));
	},
	keyCheck: function(e){
	    var c = this;
	    if (typeof this.currentDot !== 'undefined') {
		var p = this.points[c.currentDot];
		if (e.key == 'ArrowUp') {
		    p[1]--;
		} else if (e.key == 'ArrowDown') {
		    p[1]++;
		} else if (e.key == 'ArrowLeft') {
		    p[0]--;
		} else if (e.key == 'ArrowRight') {		    
		    p[0]++;
		}
		c.points[this.currentDot] = p;
		c.tick = (new Date).getTime();
		c.sendCommand()
	    }
	},
	checkShift: function(e){
	    this.shiftKey = e.shiftKey;
	},
	clearShift: function(e){
	    this.shiftKey = false
	},
	dotClick: function(e, i){
	    var c = this;
	    // this.currentDot = i;
	},
	pointDragStart: function(e){
	    var c = this;
	    // console.log(e.type, this.notclick);

	    var d = document.elementFromPoint(e.x, e.y);
	    if (d.matches('circle.dot')) {
		this.currentDot = parseInt(d.dataset.dotIndex);
		this.dragging = true; 
	    } else {
		this.dragging = false; 
	    }
	    
	    this.notclick = false;
	    setTimeout(function(){ c.notclick = true }, 100)
	    e.stopPropagation()	    
	},
	pointDragEnd: function(e){
	    var c = this;
	    var d = document.elementFromPoint(e.x, e.y);

	    this.dragging = false;
	    
	    if (d.matches('circle.dot')) {
		this.currentDot = parseInt(d.dataset.dotIndex);
		if (this.notclick) {
		    var p = getMousePos(this.$refs.dots, e);
		    this.points[this.currentDot] = [ p.x, p.y ]
		    this.tick = (new Date).getTime();
		} else {
		    
		}
	    } else {
		if (this.notclick) {

		} else {
		    if (this.points.length < 4) {
			var p = getMousePos(this.$refs.dots, e);
			this.points.push([ p.x, p.y ]);
			this.currentDot = this.points.length - 1;
		    } else {
			c.currentDot = undefined
		    }
		}
	    }
	    c.sendCommand()
	    e.stopPropagation()	    
	},
	pointDrag: function(e){
	    if (this.dragging && this.currentDot !== undefined) {
		var p = getMousePos(this.$refs.dots, e);
		this.points[this.currentDot] = [ p.x, p.y ]
		this.tick = (new Date).getTime();
	    }
	},
	canvasDragStart: function(e){
	    var p = getMousePos(this.$refs.grid, e);
	    p = [p.x, p.y]

	    this.dragStartPoint = p;
	    this.dragging = true;

	    e.stopPropagation();
	},
	canvasDrag: function(e){
	    e.stopPropagation();
	    if (this.dragging) {
		var p = getMousePos(this.$refs.grid, e);
		p = [ p.x, p.y ]
		
		this.offsetX = this.offsetX + p[0] - this.dragStartPoint[0];
		this.offsetY = this.offsetY + p[1] - this.dragStartPoint[1];
		this.dragStartPoint = p;
		this.redraw()
	    }
	    
	},
	canvasDragEnd: function(e){
	    this.dragging = false;
	    this.dragStartPoint = [];
	    this.redraw()
	    e.stopPropagation();
	},

	addDot: function(e) {
	    if (!this.dragging || !this.click) {
		if (this.points.length < 4) {
		    var p = getMousePos(this.$refs.dots, e);
		    this.points.push([p.x, p.y])
		}
	    } else {
		this.dragging = false;
		this.currentDot = null;
	    }
	    this.sendCommand()
	},
	toggleGrid: function(e){ this.gridOn = !this.gridOn },
	togglePoints: function(e){ this.pointsOn = !this.pointsOn },
	saveOutput: function(e){
	    var c = this;
	    var canvas = this.$refs.output;
	    canvas.toBlob(function(blob) {
		let a = document.createElement("a");  
		a.href = URL.createObjectURL(blob);

		var fileName = c.fileName || 'unperspective.jpg';
		var newName = fileName.replace(/\.(jpe*g)|.(png)/, '_straightened-' + Math.round((new Date().getTime()) / 1000) + '.png');

		a.download = newName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		
	    })
	}, 
	redraw: function(){
	    var canvas = this.$refs.output;
	    var ctx = canvas.getContext('2d');

	    ctx.clearRect(0, 0, canvas.width, canvas.height);

	    this.overallScaleX = Math.pow(10, this.scaleX - 1) * this.scale * this.scaleR;
	    this.overallScaleY = Math.pow(10, this.scaleY - 1) * this.scale * this.scaleR;
	    
	    ctx.scale(Math.pow(10, this.scaleX - 1) * this.scale * this.scaleR,
		      Math.pow(10, this.scaleY - 1) * this.scale * this.scaleR);
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

		console.log(scale);
		
		c.output_canvas.width  = img.width;
		canvas.width  = output.width = c.svg.width   = width;
		c.output_canvas.height = img.height;
		canvas.height = output.height = c.svg.height = img.height * scale;

		c.svg.viewbox[2] = c.output_canvas.width;
		c.svg.viewbox[3] = c.output_canvas.height;		
		
		ctxs.forEach((ctx, i) => {
		    ctx.clearRect(0, 0, canvas.width, canvas.height);
		    if (i < 2) { ctx.scale(scale, scale) }
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

		c.db.conf.put({
		    id: 'image',
		    value: c.image
		}).then(() => {
		    console.log('loaded image');
		}).catch(e => console.log(e));

		c.image = ctxs[0].getImageData(0, 0, canvas.width, canvas.height)
	    }
	    img.src = src;
	    
	},
	dropHandler: function(e){
	    var c = this;
	    e.preventDefault();
	    c.points = [];
	    if (e.dataTransfer.items) {
	    	for (var i = 0; i < 1; i++) {
	    	    if (e.dataTransfer.items[i].kind === 'file' && e.dataTransfer.items[i].type.match(/image.*/)) {
	    		var file = e.dataTransfer.items[i].getAsFile();
			c.fileName = file.name;
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
	sendCommand: function(){
	    var c = this;
	    var calc = new PointCalc();
	    calc.input = this.points;

	    if (this.points.length >= 4) {
		var calc = new PointCalc();
		calc.input = this.points.slice(0, 4);

		var src = this.points;
		var dst = calc[c.process];
		c.outputPoints = dst;
		
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
