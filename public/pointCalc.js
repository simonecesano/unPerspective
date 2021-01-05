
class PointCalc {
    constructor(){
	this.input = [];
    }

    get frontView(){
	var p = this.input;
	
	console.log(JSON.stringify(p));

	var minX = Math.min(...this.input.map(p => p[0]));
	var minY = Math.min(...this.input.map(p => p[1]));
	var maxX = Math.max(...this.input.map(p => p[0]));
	var maxY = Math.max(...this.input.map(p => p[1]));

	var frontSideLength = Math.sqrt(Math.pow(p[0][1] - p[1][1], 2) + Math.pow(p[0][0] - p[1][0], 2));
	var backSideLength  = Math.sqrt(Math.pow(p[2][1] - p[3][1], 2) + Math.pow(p[2][0] - p[3][0], 2));

	
	var sideDiff = frontSideLength - backSideLength;

	console.log(frontSideLength, backSideLength, sideDiff)
	
	var p = [
	    [minX, p[0][1]],
	    [minX, p[1][1]],
	    [maxX, p[1][1] + sideDiff / 4 ],
	    [maxX, p[0][1] - sideDiff / 4 ],
	]
	console.log(JSON.stringify(p));
	return p;
    }

    get straightenUp(){
	var p = this.input;
	
	var minX = Math.min(...this.input.map(p => p[0]));
	var minY = Math.min(...this.input.map(p => p[1]));
	var maxX = Math.max(...this.input.map(p => p[0]));
	var maxY = Math.max(...this.input.map(p => p[1]));

	return [
	    [minX, p[0][1]],
	    [minX, p[1][1]],
	    [maxX, p[2][1]],
	    [maxX, p[3][1]],
	]
    }

    get parallelize(){
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

	// console.log(JSON.stringify(this.input));
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
