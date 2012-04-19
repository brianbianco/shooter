var shotsFired = 0;
var baddiesKilled = 0;
var theBrains = null;
var particles = [];
var containerBottom  = 0;

var bullet_pool_size = 10;
var baddie_pool_size = 30;

//physics timestep handling based on Glenn Fiedler's tutorials:
//	http://gafferongames.com/game-physics/fix-your-timestep/
//	http://gafferongames.com/game-physics/integration-basics/


//timing related variables
var t = 0;
var dt = 30;
var currentTime = new Date().getTime();
var accumulator = 0;

var containerLeftPad = 0;
var containerTopPad = 0;
var containerWidth = 0;
var containerHeight = 0;

var shipLeft = 0;
var shipTop = 0;
var shipWidth = 0;
var shipHeight = 0;

function particle(id,x,y,width,height, dom, type)
{
  this.id =id;
  this.isAlive = true;
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.mid = new point(x + width/2,y + height/2);
  this.dom = dom;
  this.type = type;  //enum... 'bullet' or 'baddie'
  this.vel = 1.0 + Math.random() * 4;
  
  //stores the previous state
  this.oldy = y;
  
  this.update_pos = function(x,y)
  {
	  this.x = x;
	  this.oldy = this.y;
	  this.y = y;
	  this.mid = new point(x + width/2,y + height/2);
  }
}

//This thread will do all collision detection, bullet movement, etc
//bullet velocity is 1.8 pixels per second
//content height is 540 pixels
function update()
{
	//TODO: spawn baddies at some interval here

	var newTime = new Date().getTime();
	var deltaTime = newTime - currentTime;
	currentTime = newTime;
	accumulator += deltaTime;
	var ranPhysics = (accumulator >=dt);
	while (accumulator>=dt)
	{
		runPhysics(t, dt);
		t += dt;
		accumulator -= dt;
	}

	if(ranPhysics)
	{
		//it's likely that at least one baddie or bullet has moved, so reposition them
		var alpha = accumulator / dt;
		move_elements(alpha);
	}
}

function move_elements(alpha)
{
	//render all baddies and bullets
	for(var i=0;i<particles.length;i++)
	{
		if(particles[i].isAlive)
		{
			var interpolatedY = particles[i].y * alpha + particles[i].oldy *(1.0-alpha);
			if(interpolatedY < 0 || interpolatedY  > containerBottom)
			{
				//if(i > 19) console.log('recycled particle' + i);
				particles[i].isAlive = false;
				particles[i].dom.hide();
			}
			else
			{
				particles[i].dom.css({
					'top' : interpolatedY, 
					'left' : particles[i].x
				});
			}
		}
	}
}

function runPhysics(t,dt)
{
	var root = new node(new box(containerLeft, containerTop, containerWidth, containerHeight));
	root.reset();
	
	//run physics for the baddies and bullets
	for(var i=0;i<particles.length;i++)
	{
		if(particles[i].isAlive)
		{
			particles[i].oldy = particles[i].y;
			particles[i].y += particles[i].vel;
			particles[i].mid = new point(particles[i].x + particles[i].width/2,particles[i].y + particles[i].height/2);
			//particles[i].update_pos(particles[i].x, particles[i].y + particles[i].vel);
			
			if(particles[i].type == 'bullet')
			{
				//console.log('cool, running physics for bullet '+ i);
				root.search(function object_callback(cObject)
						{
							//cObject.dom.css('background-color', '#ff0000');
							if(cObject.id != i && isHit(particles[i],cObject)) { removeParticle(cObject); removeParticle(particles[i]); baddiesKilled++; $('#score').html('Shots Fired: ' + shotsFired + ' - Baddies Killed: ' + baddiesKilled); }
						},
						node_callback,
						new box(particles[i].x, particles[i].y, particles[i].width, particles[i].height)
				);
			}
			else
			{
				root.insertObject(particles[i]);
			}
		}			
	}
}

function node_callback(){}

function isHit(shot,baddie)
{
	return segment_circle({x : shot.x ,y : shot.oldy},{x : shot.x, y : shot.y}, baddie.mid, baddie.radius);
} 	


function removeParticle(p)
{
	particles[p.id].isAlive = false;
	p.dom.hide();
}


//Oh they are so evil!!  
function spawnBaddie(bHeight,bWidth)
{
	var myBaddie = $('<div></div>');
	var ctop = Math.floor(Math.random() * (containerHeight/4));
	var cleft = Math.floor(Math.random() * (containerWidth - bWidth));

	myBaddie.addClass('evil');
	myBaddie.css({
				'top' : ctop, 
				'left' : cleft,
				'width' : bWidth+ 'px',
				'height' : bHeight + 'px',
				'position' : 'absolute',
				'background-color' : '#ffcc00',
				'border-style' : 'solid',
				'border-width' : '1px'
			});	

	var p = new particle(particles.length, cleft, ctop, bWidth, bHeight, myBaddie, 'baddie');
	p.radius = Math.max(bHeight,bWidth)/2;
	particles.push(p);
	$('#content-container').append(myBaddie);
}

function spawnBullet(bHeight,bWidth)
{	
	var projectile = $('<div></div>');
	projectile.addClass('shot');
	projectile.css({'display' : 'none', 'position':'absolute'});
	$('#content-container').append(projectile);
	var p = new particle(particles.length, -50, -50, bWidth, bHeight, projectile, 'bullet');
	p.vel = -35;
	p.isAlive = false;
	particles.push(p); 
}

function shipShoot(e)
{
	//var x = e.pageX - containerLeft;
	//var y = e.pageY - containerTop;
	
	var shipMidX = shipWidth/2;
	var shipMidY = shipHeight/2;
	var x = e.pageX - shipWidth;
	x = Math.max(x, containerLeft-shipMidX);
	x = Math.min(x, containerWidth+containerLeft-shipWidth-shipMidX);
	
	var y = e.pageY - shipHeight;
	y = Math.max(y, containerTop-shipMidY);
	y = Math.min(y, containerHeight+containerTop-shipHeight-shipMidY);
	
	
	//$('.evil').css('background-color', '#ffcc00');
	++shotsFired;
	$('#score').html('Shots Fired: ' + shotsFired + ' - Baddies Killed: ' + baddiesKilled);
	
	//find an unused projectile from the pool and use it
	for(var i=baddie_pool_size; i < particles.length;i++)
	{
		if(!particles[i].isAlive)
		{  
			particles[i].update_pos(x,y);
			particles[i].dom.css({'top' : y, 'left' : x, 'cursor' : 'crosshair' });
			particles[i].dom.show();
			particles[i].isAlive = true;
			break;
		}
	}
	e.preventDefault(); //without preventing the default mousedown behavior you'll get all sorts of awful mouse drag lag and issues	
}

function shipMove(e)
{
	var shipMidX = shipWidth/2;
	var shipMidY = shipHeight/2;
	var x = e.pageX - shipMidX;
	x = Math.max(x, containerLeft);
	x = Math.min(x, containerWidth+containerLeft-shipWidth);
	
	var y = e.pageY - shipMidY;
	y = Math.max(y, containerTop);
	y = Math.min(y, containerHeight+containerTop-shipHeight);
	
	$('#ship').css({'top' : y, 'left' : x});
	e.preventDefault();
}


function gameStart(e)
{
	$('#content-container').unbind('mousedown');
	$('#score').animate({'opacity' : '1'},300);
	
	containerBottom = $('#content-container').height();
	containerLeft = parseInt($('#content-container').css('left'));
	containerTop = parseInt($('#content-container').css('top'));
	containerWidth = $('#content-container').width();
	containerHeight = $('#content-container').height();
	
	//pre-generate the baddies
	for(var i=0; i < baddie_pool_size;i++)
		spawnBaddie(16,16);
	
	//pre-generate the bullets
	for(var i=0; i < bullet_pool_size;i++)
		spawnBullet(3,10);
	
	var ship = $('<div id="ship"></div>');
	ship.css({'background-color' : '#005799',
				'position' : 'absolute',
				'width' : '50px', 'height' : '25px',
				'padding' : '0px', 'cursor' : 'crosshair',
				'top' : e.pageY - ship.height()/2,
				'left' : e.pageX - ship.width()/2});
	$('body').append(ship);

	shipLeft = parseInt($('#ship').css('left'));
	shipTop = parseInt($('#ship').css('top'));
	shipWidth = $('#ship').width();
	shipHeight = $('#ship').height();
	
	//$('#ship,#content-container').mousedown(function(e){ shipShoot(e); });
	//$('#ship,#content-container').mousemove(function(e){ shipMove(e); });
	
	$(window).mousedown(function(e){ shipShoot(e); });
	$(window).mousemove(function(e){ shipMove(e); });
	
	$("p.start").remove();
	theBrains = setInterval('update()',25); 
}

$(document).ready(function(e)
{
	$('p.start').fadeTo('100',1); 
	$('#content-container').mousedown(function(e){ gameStart(e) }); 
});
