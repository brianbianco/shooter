var minW = 25;
var minH = 25;
var ID = 1;
var storedids = Array();

function node(boundingBox)
{
	this.bounds = new box(boundingBox.x,boundingBox.y,boundingBox.width,boundingBox.height);
	this.objects = Array();
	this.child = Array();
	this.childCount = 0;
	this.clear = function()
    {
	  this.objects = Array();
      this.child = Array();
      this.childCount = 0;
    }
    
    //all objects must the following fields: x,y,width,height
    this.insertObject = function(object)
    {
    	if(!object.qtID)
    	{
    		object.qtID = ID++;
    	}
    	this.objects.push(object);
    	if(this.bounds.height <= minH || this.bounds.width <= minW)
    	{
     		return;			
    	}
    	if(!this.childCount && this.objects.length == 1)
    	{
     		return;			
    	}
    	for(i=0;i<this.objects.length;i++)
    	{
    		var currentObject = this.objects[i];
    		var quadList = selectQuads(currentObject, this.bounds);
    		for(var nextQuad in quadList )
    		{
    			if(!this.child[nextQuad])
    			{
    				var quadBounds = getQuadBounds(this.bounds, nextQuad);
    				this.child[nextQuad] = new node(quadBounds);
    				this.childCount++;
    			}
    			this.child[nextQuad].insertObject(currentObject);
    		}
    	}
    	this.objects = Array(); //clear the array
    }
    
    
    this.search = function(objectCallback, nodeCallback, bounds)
    {
    	nodeCallback(this);
    	
    	var b = bounds ? bounds : this.bounds;
    	
    	for(i=0;i<this.objects.length;i++)
    	{
    		var nextObject = this.objects[i];
    		if(!storedids[nextObject.qtID])
    		{
    			storedids[nextObject.qtID] = true;
    			objectCallback(nextObject);
    		}
    	}
    	var quadList = selectQuads(b, this.bounds);
    	for(var next in quadList )
    	{
    		if(this.child[next])
    		{
    			this.child[next].search(objectCallback, nodeCallback, bounds);
    		}
    	}
    }
	this.reset = function()
	{
		storedids = Array();
		ID = 1;
	}
}