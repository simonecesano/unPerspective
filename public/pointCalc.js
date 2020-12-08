class PointCalc {
    constructor(){
	this.input = [];
    }
    get output(){
	var minX = Math.min(...this.input.map(p => p[0]));
	var minY = Math.min(...this.input.map(p => p[1]));
	var maxX = Math.max(...this.input.map(p => p[0]));
	var maxY = Math.max(...this.input.map(p => p[1]));


	var center = [
	    minX + (maxX - minX) / 2,
	    minY + (maxY - minY) / 2,	    
	];

	var startAng;
	this.input.forEach(point => {
	    var ang = Math.atan2(point[1] - center[1], point[0] - center[0]);

	    if(!startAng) { startAng = ang }

	    else {
		if(ang < startAng){  // ensure that all points are clockwise of the start point
		    ang += Math.PI * 2;
		}
	    }
	    point[2] = ang; // add the angle to the point
	});

	console.log(JSON.stringify(this.input));
	this.input.forEach(p => { p.pop() });

	return [
	    [minX, maxY],
	    [minX, minY],
	    [maxX, minY],
	    [maxX, maxY],
	]
	
    }
    add(p){
	this.input.push(p);
    }
}
