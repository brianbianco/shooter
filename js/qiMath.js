function point(x,y)
{
  this.x = x;
  this.y = y;
}

function line(start,end)
{
  this.start = start;
  this.end = end;	
}

function box(x,y,width,height)
{
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.mid = new point(x + width/2,y + height/2);
}

function getQuadBounds(b, quad)
{
	if(quad == 'nw'){ return new box(b.x,b.y,b.width/2,b.height/2);}	
	if(quad == 'ne'){ return new box(b.x + b.width/2,b.y,b.width/2,b.height/2);}
	if(quad == 'sw'){ return new box(b.x,b.y + b.height/2,b.width/2,b.height/2);}
	if(quad == 'se'){ return new box(b.x + b.width/2,b.y + b.height/2,b.width/2,b.height/2);}
}

/**
 * given a box, return the list of quads that overlap it.
 * assummes the box and bounds are axially aligned (no rotation)
 */
function selectQuads(box,quadBounds)
{
	var result = Array();

	//var origin = new point(quadBounds.mid.x, quadBounds.mid.y);
	
	//find quadrant of all 4 corners
	var q = getPointsQuad(new point(box.x, box.y), quadBounds.mid);
	result[q] = true;
	
	q = getPointsQuad(new point(box.x+box.width, box.y), quadBounds.mid);
	result[q] = true;
	
	q = getPointsQuad(new point(box.x, box.y+box.height), quadBounds.mid);
	result[q] = true;
	
	q = getPointsQuad(new point(box.x+box.width, box.y+box.height), quadBounds.mid);
	result[q] = true;
	
	return result;
}

//takes a box shaped object and tells you which quadrant its in giving the bounding box
function selectQuad(box,canvas)
{	  
	//if the object is in the west hemipshere
	if(box.x < (canvas.mid.x - box.width))
	{
		if (box.y < canvas.mid.y - box.height)
		{
			return 'nw';
		}
		else if(box.y > canvas.mid.y)
		{	
			return 'sw';
		}
		else
		{
			return 'sy'
		}
	} 
  	//else if the object is in the east hemisphere
	else if(box.x > canvas.mid.x)
	{
		if (box.y < canvas.mid.y - box.height)
		{
            return 'ne';
		}
		else if(box.y > canvas.mid.y)
		{
            return 'se';
		}
		else
		{
			return 'sy';
		}
	}
	else
	{
		return 'sx';
	}	
}

/*
if a points X value is at the origin it will be considered to be in the West hemisphere
if a points Y value is at the origin it will be considered to be in the North hemisphere
the origin will be returned as a point in the NW quadrant
it is really important to note that this is NOT based on a cartesian plane in the normal sense
the x,y of a css canvas is the top left corner and the midpoint would be that XY + half the
width and height.  therefore a coordinate in the NW quadrant would not have a Y value larger than the origin
in fact it would have a Y value LESS than the origin....i think :)  
*/
function getPointsQuad(point,origin)
{
	if(point.x <= origin.x)
	{
		if(point.y <= origin.y)
		{
		  	return 'nw';	
		}
		if(point.y > origin.y)
		{
		  	return 'sw';
		}
	}
	if(point.x > origin.x)
	{
	  	if(point.y <= origin.y)
	  	{
	  	  	return 'ne';
	  	}
	  	if(point.y > origin.y)
	  	{
	  		return 'se';
	  	}
	}
}

//When done this function will return an array of objects which is the quads that a line passes through.
function quadsLineIntersects(line,x,y,width,height)
{
	var origin = { x: x + width/2,y: y + height/2 };
	var sQuad = getPointsQuad(line.start,origin);
	var eQuad = getPointsQuad(line.end,origin);
	
	//first test to see if the line is either only in 1 quadrant
	if(sQuad == eQuad)
	{
    	return [sQuad];
	}
	
	//test for cases where lines can only be going through 2 quads
	//NE and NW
	if( (sQuad == 'ne' && eQuad == 'nw') || (sQuad == 'nw' && eQuad == 'ne') )
	{
		return [sQuad,eQuad];	
	}
	//NW and SW
	if( (sQuad == 'nw' && eQuad == 'sw') || (sQuad == 'sw' && eQuad == 'nw') )
	{
		return [sQuad,eQuad];	
	}
	//SW and SE
	if( (sQuad == 'sw' && eQuad == 'se') || (sQuad == 'se' && eQuad == 'sw') )
	{
		return [sQuad,eQuad];	
	}
	//NE and SE
	if( (sQuad == 'ne' && eQuad == 'se') || (sQuad == 'se' && eQuad == 'ne') )
	{
		return [sQuad,eQuad];	
	}	

    //due to our crazy CSS coordinates you have to take the midpoint and subtract that X,Y from the current X,Y coordinates
    //when taking the ratio.
	//if a line has equal ratios between XandY for its start and end point then it passes through the origin
    //if you are in the SW quad and a line has a start point ratio that is < its endpoint ratio is passes through the SE quad
    //likwise if you are in the SW quad and a line has a start point ratio that is > its endpoint ratio is passes through the NW quad

    //Checking to see if a line in quads SW and NE goes through 3 quads
 	if(sQuad == 'sw' && eQuad == 'ne')
	{ 
   		if(Math.abs( (line.start.x - origin.x) / (line.start.y - origin.y) ) < Math.abs( (line.end.x - origin.x) / (line.end.y - origin.y) ))
   		{
			return [sQuad,eQuad,'se'];
   		}
        if(Math.abs( (line.start.x - origin.x) / (line.start.y - origin.y) ) > Math.abs( (line.end.x - origin.x) / (line.end.y - origin.y) ))
        {
			return [sQuad,eQuad,'nw'];
        }
	}

 	if(sQuad == 'ne' && eQuad == 'sw')
 	{
   		if(Math.abs( (line.start.x - origin.x) / (line.start.y - origin.y) ) < Math.abs( (line.end.x - origin.x) / (line.end.y - origin.y) ))
   		{
			return [sQuad,eQuad,'nw'];
   		}
        if(Math.abs( (line.start.x - origin.x) / (line.start.y - origin.y) ) > Math.abs( (line.end.x - origin.x) / (line.end.y - origin.y) ))
        {
			return [sQuad,eQuad,'se'];
        } 		
 	}

    //Checking to see if a line in quads NW and SE passes through 3 quads
	if(sQuad == 'nw' && eQuad == 'se')
	{
   		if(Math.abs( (line.start.x - origin.x) / (line.start.y - origin.y) ) < Math.abs( (line.end.x - origin.x) / (line.end.y - origin.y) ))
   		{
			return [sQuad,eQuad,'ne'];
   		}
        if(Math.abs( (line.start.x - origin.x) / (line.start.y - origin.y) ) > Math.abs( (line.end.x - origin.x) / (line.end.y - origin.y) ))
        {
			return [sQuad,eQuad,'sw'];	
        }
	}

	if(sQuad == 'se' && eQuad == 'nw')
	{
   		if(Math.abs( (line.start.x - origin.x) / (line.start.y - origin.y) ) < Math.abs( (line.end.x - origin.x) / (line.end.y - origin.y) ))
   		{
			return [sQuad,eQuad,'sw'];
   		}
        if(Math.abs( (line.start.x - origin.x) / (line.start.y - origin.y) ) > Math.abs( (line.end.x - origin.x) / (line.end.y - origin.y) ))
        {
			return [sQuad,eQuad,'ne'];
        }
	}
}