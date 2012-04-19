/*usage

p1 and p2 are the x,y coordinates that form the lne segment
circ_pos is the middle of the circle
circ_rad is the radius of the circle

var p1 = {x: 4, y:4 }; 
var p2 = {x: 4, y:2 }; 
var circ_pos = {x:2, y:3 };
var circ_rad = 2;

console.log('test'+segment_circle(p1,p2,circ_pos, circ_rad));
*/

function dot(v1,v2)
{
	return v1.x*v2.x + v1.y*v2.y;
}

function divide(v1, val)
{
	return {x: v1.x/val, y:v1.y/val};
}

function multScalar(v1, val)
{
	return {x: v1.x*val, y:v1.y*val};
}

function sub(v1,v2)
{
	return {x: v1.x-v2.x, y:v1.y-v2.y};
}

function add(v1,v2)
{
	return {x: v1.x+v2.x, y:v1.y+v2.y};
}

function len(v1)
{
	return Math.sqrt(v1.x*v1.x+v1.y*v1.y);
}


function closestPointOnSegment(seg_a, seg_b, circ_pos)
{
	var seg_v = sub(seg_b,seg_a);
	if(len(seg_v) <= 0)
	{
		throw('uh ohhh! Invalid segment length!');
	}

	var pt_v = sub(circ_pos,seg_a);
	var seg_v_unit = divide(seg_v, len(seg_v));
	var proj = dot(pt_v, seg_v_unit);

	if(proj <= 0)
		return seg_a;
	if(proj >= len(seg_v))
		return seg_b;

	var proj_v = multScalar(seg_v_unit, proj);
	var closest = add(proj_v, seg_a);
	return closest;
}

function segment_circle(seg_a, seg_b, circ_pos, circ_rad)
{
	var closest = closestPointOnSegment(seg_a, seg_b, circ_pos);
	var dist_v = sub(circ_pos, closest);
	if(len(dist_v) > circ_rad)
		return false;
	if(len(dist_v) <= 0)
		return true; //circles center is exactly on segment

    //The offset will tell you exactly where the line intersected the circle.  For now we just return true or false to see if its hit
    //this could be useful someday though.
    
	//var offset = divide(dist_v, multScalar(len(dist_v), sub(circ_rad,len(dist_v))));
	//return offset;
	return true;	
}