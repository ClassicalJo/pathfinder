# pathfinder
Algorithm designed to find the shortest path between two points

So that was my first pitch when I created this beast. Boy that was wrong.
Right! to the bullet points:

* Made in typescript (I started in vanillaJS then I realized I was wasting a valuable lesson in suffering through learning a new language while making something new)
* CSS in vanilla CSS, but nested everything SASS style because I dig that even when not working with SASS.
* The algorithm I designed myself, at first having a vague idea on what it should do, then did a very skimmed reading on the wikipedia page of pathfinding. Maybe i should've read more there and wasted less time.
* You can add and remove blocks, add areas of blocks, set the startpoint, the endpoint, and the size of the area to be analyzed. Bigger areas means more time to analyze, be wary of that.
* If you click the set start or set end, you should be able to target a square for that. 
* Clear just removes the trying/success/failure colors.
* Restart removes that and the blocks too.
* Stop doesn't pause, it stops the algorithm completely. If you press start again, it starts from the beggining
* Draw line lets you draw lines of impassable blocks. Or cleans them.
* Draw area lets you draw a rectangle of impassable blocks. Or cleans them
* Or you can, you know, click a square to make it a impassable block. Or clean it.
* Impassable block.

About the algorithm:
* Putting it simply, first checks if any of the possible directions connect to the destination square. 
* If there's not any successful connection, it queues that same check in all possible destinations, queuing first all squares that are closest to the endpoint.
* If a square is blocked, has already been travelled by that particular line, or is out of the bounds of the map, it's ignored and not put into the queue at all.
* If a line has no more available squares to go, it dies silently in it's sleep, never to be heard again.

* The only thing the slider between "precise" and "fast" do is controlling the amount of time of the timeout.
* This way, all squares that are not the first in the queue (and thus, the farthest), are set to be analyzed an inordate amount of time later
* For example, the closest square to the endpoint gets a timeout of 0 seconds, and the eighth in the queue gets a timeout of 8 seconds. This results in hilarious pathways, but could be used ex-post to refine the pathway, if I ever want to touch this again (yeah sure).

* Possible updates: add web workers to hasten the "precise" result. The precise result, theoretically (based on nothing but my mad lawyer theories), should always return the path in the less possible number of steps, but it takes a long time to analyze all other previous combinations. Just getting from a 5x5 to 6x6 with no blocks takes like 10 minutes longer.)

PD: I honestly started seriously writing this but I just couldn't handle crack jokes at it by the fact it's just a stupid algorithm that does its job poorly. But I can be serious. Promise.
